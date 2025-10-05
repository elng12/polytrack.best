#!/usr/bin/env node
/*
  fix-ahrefs.mjs
  Zero-deps Node.js script to:
  1) Use local headless Chrome (DevTools Protocol) to screenshot assets/og-cover-generator.html
     as 1200x630 JPEG (quality<=80, <=100KB) and save to assets/og-cover.jpg
  2) Parse sitemap.xml, extract <loc> URLs, HEAD (follow 1 redirect), print TSV: URL<TAB>final-status<TAB>final-url
  3) In-place normalize URLs across all *.html, *.xml, *.js/*.mjs:
       - canonical href, og:image, sitemap <loc>, any <a href>
       - replace occurrences with final URL (strip index.html if target redirects to /, keep trailing slash, force https)
  4) Print green summary

  Run: node fix-ahrefs.mjs
*/

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import net from 'node:net';

// ---------- util ----------
const ROOT = process.cwd();
function log(...a){ console.log(...a); }
function warn(...a){ console.warn('\u001b[33m[warn]\u001b[0m', ...a); }
function err(...a){ console.error('\u001b[31m[error]\u001b[0m', ...a); }
const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

// Basic HTTP GET returning JSON/text
function httpGet(url){
  return new Promise((resolve, reject)=>{
    const m = url.startsWith('https:') ? https : http;
    const req = m.get(url, res=>{
      const chunks=[]; res.on('data',d=>chunks.push(d));
      res.on('end',()=>{
        const buf = Buffer.concat(chunks);
        resolve({ status: res.statusCode||0, headers: res.headers, body: buf });
      });
    });
    req.on('error',reject);
  });
}

// HEAD (follow up to 1 redirect). Returns {finalUrl, finalStatus, redirected}
async function headFollowOne(u){
  const doHead = (url)=> new Promise((resolve,reject)=>{
    const m = url.startsWith('https:') ? https : http;
    const opts = new URL(url);
    const req = m.request({ ...opts, method:'HEAD' }, res=>{
      resolve({ status: res.statusCode||0, headers: res.headers });
    });
    req.on('error',reject); req.end();
  });
  const first = await doHead(u);
  if (first.status>=300 && first.status<400 && first.headers.location){
    // follow one redirect
    const next = new URL(first.headers.location, u).toString();
    const second = await doHead(next);
    return { finalUrl: next, finalStatus: second.status, redirected: true };
  }
  return { finalUrl: u, finalStatus: first.status, redirected: false };
}

// Fallback: GET with following up to 3 redirects
async function getFollowRedirects(u, max=3){
  let current = u; let redirected=false;
  for (let i=0;i<=max;i++){
    const { status, headers } = await httpGet(current);
    if (status>=300 && status<400 && headers.location && i<max){
      redirected = true;
      const next = new URL(headers.location, current).toString();
      current = next;
      continue;
    }
    return { finalUrl: current, finalStatus: status||0, redirected };
  }
  return { finalUrl: current, finalStatus: 0, redirected };
}

// Recursively list files filtered by extensions
async function listFiles(dir, exts, ignoreDirs = new Set(['.git','node_modules'])){
  const out=[];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of entries){
    if (ent.name.startsWith('.DS_Store')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()){
      if (!ignoreDirs.has(ent.name)) out.push(...await listFiles(p, exts, ignoreDirs));
    }else{
      const ext = path.extname(ent.name).toLowerCase();
      if (exts.has(ext)) out.push(p);
    }
  }
  return out;
}

// ---------- find Chrome ----------
function existsSync(p){ try{ fs.accessSync(p, fs.constants.X_OK); return true; }catch{ return false; } }
function trySpawnable(cmd){ try{ const r=spawnSync(cmd, ['--version'], {stdio:'ignore'}); return r.status===0; }catch{ return false; } }
async function findChrome(){
  const candidates = [];
  const platform = process.platform;
  if (platform==='darwin'){
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    candidates.push('/Applications/Chromium.app/Contents/MacOS/Chromium');
  }else if (platform==='win32'){
    const pf = process.env['PROGRAMFILES'] || 'C:/Program Files';
    const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)';
    candidates.push(path.join(pf, 'Google/Chrome/Application/chrome.exe'));
    candidates.push(path.join(pf86, 'Google/Chrome/Application/chrome.exe'));
    candidates.push(path.join(pf, 'Chromium/Application/chrome.exe'));
  }else{
    candidates.push('/usr/bin/google-chrome');
    candidates.push('/usr/bin/google-chrome-stable');
    candidates.push('/usr/bin/chromium');
    candidates.push('/usr/bin/chromium-browser');
  }
  // Also try PATH commands
  const pathCmds = ['google-chrome','google-chrome-stable','chromium','chromium-browser','chrome'];
  for (const c of pathCmds){ if (trySpawnable(c)) return c; }
  for (const c of candidates){ if (existsSync(c)) return c; }
  throw new Error('Chrome/Chromium not found. Please install Google Chrome and ensure it is on PATH.');
}

// ---------- minimal WebSocket client for CDP ----------
class WSClient {
  constructor(url){
    this.url = new URL(url);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.msgQueue = [];
    this.waiters = [];
  }
  connect(){
    return new Promise((resolve, reject)=>{
      const port = Number(this.url.port) || (this.url.protocol==='wss:'?443:80);
      const host = this.url.hostname;
      const pathp = this.url.pathname + (this.url.search||'');
      const key = crypto.randomBytes(16).toString('base64');
      const sock = net.createConnection({ host, port }, ()=>{
        const lines = [
          `GET ${pathp} HTTP/1.1`,
          `Host: ${host}:${port}`,
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Key: ${key}`,
          'Sec-WebSocket-Version: 13',
          'Origin: null',
          '\r\n'
        ].join('\r\n');
        sock.write(lines);
      });
      sock.once('error', reject);
      let headersParsed=false; let headerBuf=Buffer.alloc(0);
      sock.on('data', chunk=>{
        if (!headersParsed){
          headerBuf = Buffer.concat([headerBuf, chunk]);
          const idx = headerBuf.indexOf('\r\n\r\n');
          if (idx>=0){
            const headerStr = headerBuf.slice(0, idx).toString('utf8');
            const statusLine = headerStr.split('\r\n')[0]||'';
            if (!statusLine.includes('101')){ reject(new Error('WS handshake failed: '+statusLine)); sock.end(); return; }
            headersParsed = true;
            const rest = headerBuf.slice(idx+4);
            if (rest.length) this._onFrameData(rest);
            // ready
            this.socket = sock;
            sock.on('data', d=>this._onFrameData(d));
            sock.on('close', ()=> this._emit(null));
            resolve();
          }
        }else{
          this._onFrameData(chunk);
        }
      });
    });
  }
  _onFrameData(chunk){
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true){
      if (this.buffer.length<2) return;
      const b0 = this.buffer[0];
      const b1 = this.buffer[1];
      const fin = (b0 & 0x80)!==0; // not used
      const opcode = (b0 & 0x0f);
      let masked = (b1 & 0x80)!==0;
      let len = (b1 & 0x7f);
      let offset = 2;
      if (len===126){ if (this.buffer.length<4) return; len = this.buffer.readUInt16BE(2); offset=4; }
      else if (len===127){ if (this.buffer.length<10) return; const hi = this.buffer.readUInt32BE(2); const lo = this.buffer.readUInt32BE(6); if (hi!==0) throw new Error('Frame too large'); len = lo; offset=10; }
      let maskKey=null;
      if (masked){ if (this.buffer.length<offset+4) return; maskKey = this.buffer.slice(offset, offset+4); offset+=4; }
      if (this.buffer.length<offset+len) return; // wait more
      let payload = this.buffer.slice(offset, offset+len);
      this.buffer = this.buffer.slice(offset+len);
      if (masked && maskKey){ // server should not mask, but handle anyway
        for (let i=0;i<payload.length;i++){ payload[i]^=maskKey[i&3]; }
      }
      if (opcode===0x1){ // text
        const text = payload.toString('utf8');
        this._emit(text);
      } else if (opcode===0x8){ // close
        this.socket.end();
        this._emit(null);
      } else if (opcode===0x9){ // ping -> pong
        this._sendFrame(Buffer.alloc(0), 0xA);
      } else {
        // ignore other opcodes
      }
    }
  }
  _emit(msg){
    if (this.waiters.length){ this.waiters.shift()(msg); }
    else this.msgQueue.push(msg);
  }
  recv(){
    return new Promise(resolve=>{
      if (this.msgQueue.length) resolve(this.msgQueue.shift());
      else this.waiters.push(resolve);
    });
  }
  _sendFrame(payload, opcode=0x1){ // text by default
    const maskKey = crypto.randomBytes(4);
    const len = payload.length;
    let header;
    if (len<126){ header = Buffer.alloc(2); header[1]=len; }
    else if (len<65536){ header = Buffer.alloc(4); header[1]=126; header.writeUInt16BE(len,2); }
    else { header = Buffer.alloc(10); header[1]=127; header.writeUInt32BE(0,2); header.writeUInt32BE(len,6); }
    header[0] = 0x80 | opcode; // FIN+opcode
    header[1] |= 0x80; // mask bit
    const masked = Buffer.alloc(len);
    for (let i=0;i<len;i++){ masked[i] = payload[i] ^ maskKey[i&3]; }
    this.socket.write(Buffer.concat([header, maskKey, masked]));
  }
  send(text){ this._sendFrame(Buffer.from(text,'utf8'), 0x1); }
  close(){ try{ this._sendFrame(Buffer.alloc(0), 0x8); this.socket.end(); }catch{ /* noop */ }
  }
}

// ---------- CDP helpers ----------
class CDP {
  constructor(ws){ this.ws=ws; this._id=0; this._pending = new Map(); this._events=[]; this._listen(); }
  _listen(){
    (async()=>{
      while (true){
        const msg = await this.ws.recv();
        if (msg==null) break;
        try{
          const obj = JSON.parse(msg);
          if (obj.id){ const p = this._pending.get(obj.id); if (p){ this._pending.delete(obj.id); p.resolve(obj.result); } }
          else if (obj.method){ this._events.push(obj); /* buffer events */ }
        }catch{ /* ignore */ }
      }
    })();
  }
  send(method, params={}){
    return new Promise((resolve,reject)=>{
      const id = ++this._id;
      this._pending.set(id, {resolve, reject});
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async waitEvent(method, timeoutMs=10000){
    const start = Date.now();
    while (Date.now()-start < timeoutMs){
      for (let i=0;i<this._events.length;i++){
        if (this._events[i].method===method){ return this._events.splice(i,1)[0]; }
      }
      await sleep(50);
    }
    throw new Error('Timeout waiting for event '+method);
  }
}

// ---------- Step 1: Capture og-cover.jpg ----------
async function withChrome(cb){
  const chromePath = await findChrome();
  const port = await new Promise((resolve)=>{ const s=net.createServer(); s.listen(0, ()=>{ const p=s.address().port; s.close(()=>resolve(p)); }); });
  const tmpUserDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fix-ahrefs-chrome-'));
  const args = [
    '--headless=new',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpUserDir}`,
    '--disable-gpu',
    '--hide-scrollbars',
    '--enable-automation',
    '--no-first-run',
    '--no-default-browser-check',
    '--allow-file-access-from-files',
    '--window-size=1400,900',
    'about:blank'
  ];
  const proc = spawn(chromePath, args, { stdio: 'ignore' });
  let finished=false;
  try{
    // wait for devtools
    for (let i=0;i<50;i++){
      try{
        const {status} = await httpGet(`http://127.0.0.1:${port}/json/version`);
        if (status===200) break;
      }catch{}
      await sleep(100);
    }
    const result = await cb({ port });
    finished=true;
    return result;
  } finally {
    try{ proc.kill('SIGKILL'); }catch{}
    try{ await fsp.rm(tmpUserDir, { recursive:true, force:true }); }catch{}
    if (!finished){ warn('Chrome session ended unexpectedly'); }
  }
}

async function captureOgCover(){
  const generatorPath = path.resolve(ROOT, 'assets/og-cover-generator.html');
  const outPath = path.resolve(ROOT, 'assets/og-cover.jpg');
  if (!fs.existsSync(generatorPath)) throw new Error('Missing assets/og-cover-generator.html');
  const fileUrl = pathToFileURL(generatorPath).toString();

  await withChrome(async ({port})=>{
    // open a new page for our URL via /json/new? URL
    const open = await httpGet(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(fileUrl)}`);
    if (open.status!==200) throw new Error('Failed to open page in Chrome');
    const info = JSON.parse(open.body.toString('utf8'));
    const wsUrl = info.webSocketDebuggerUrl;
    const ws = new WSClient(wsUrl); await ws.connect();
    const cdp = new CDP(ws);
    // Enable domains and set viewport
    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width:1400, height:900, deviceScaleFactor:1, mobile:false });
    // Wait for load event
    try{ await cdp.waitEvent('Page.loadEventFired', 15000); }catch{ /* some versions need navigate */ }
    // Navigate explicitly (ensure)
    await cdp.send('Page.navigate', { url: fileUrl });
    await cdp.waitEvent('Page.loadEventFired', 20000);
    // Give Tailwind CDN a short time to render
    await sleep(500);
    // Ensure the element exists and get its box model
    const { root: { nodeId: docId } } = await cdp.send('DOM.getDocument', { depth: -1 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: docId, selector: '#og-cover' });
    if (!nodeId) throw new Error('#og-cover not found in og-cover-generator.html');
    await cdp.send('DOM.scrollIntoViewIfNeeded', { nodeId });
    const box = await cdp.send('DOM.getBoxModel', { nodeId });
    const width = Math.round(box.model.width);
    const height = Math.round(box.model.height);
    const content = box.model.content; // [x1,y1, x2,y2, x3,y3, x4,y4]
    const x = Math.min(content[0], content[2], content[4], content[6]);
    const y = Math.min(content[1], content[3], content[5], content[7]);
    // adjust viewport tightly if needed
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: Math.max(1200,width), height: Math.max(630,height), deviceScaleFactor:1, mobile:false });

    // Try quality loop until <= 100KB
    let quality = 80;
    let dataB64 = '';
    for (let attempt=0; attempt<5; attempt++){
      const res = await cdp.send('Page.captureScreenshot', { format:'jpeg', quality, clip: { x, y, width, height, scale:1 } });
      dataB64 = res.data;
      const buf = Buffer.from(dataB64,'base64');
      await fsp.writeFile(outPath, buf);
      const stat = await fsp.stat(outPath);
      if (stat.size <= 100*1024) break; // ok
      quality = Math.max(30, quality - 15);
    }
    ws.close();
  });
}

// ---------- Step 2: sitemap HEAD and TSV ----------
async function parseSitemapLocs(){
  const smPath = path.resolve(ROOT, 'sitemap.xml');
  const xml = await fsp.readFile(smPath, 'utf8');
  const locs = Array.from(xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)).map(m=>m[1].trim());
  const uniq = Array.from(new Set(locs));
  return uniq;
}

async function headAllOnce(urls){
  const results = [];
  for (const u of urls){
    try{
      // First try HEAD
      let r = await headFollowOne(u);
      // If HEAD failed or returned 0, try GET fallback
      if (!r.finalStatus || r.finalStatus===0){
        r = await getFollowRedirects(u, 3);
      }
      results.push({ url:u, finalUrl:r.finalUrl, finalStatus:r.finalStatus, redirected:r.redirected });
    }catch(e){
      // Fallback path: GET even if HEAD threw
      try{
        const g = await getFollowRedirects(u, 3);
        results.push({ url:u, finalUrl:g.finalUrl, finalStatus:g.finalStatus, redirected:g.redirected, note:'fallback:get' });
      }catch(e2){
        results.push({ url:u, finalUrl:u, finalStatus:0, redirected:false, error: e2.message||e.message });
      }
    }
  }
  return results;
}

function printTSV(results){
  for (const r of results){
    console.log(`${r.url}\t${r.finalStatus}\t${r.finalUrl}`);
  }
}

// ---------- Step 3: Normalize URLs in files ----------
function forceHttps(u){ try{ const x = new URL(u); x.protocol='https:'; return x.toString(); }catch{ return u; } }

async function normalizeFiles(results){
  // Build mappings from original absolute -> final absolute (force https), and from pathname -> final absolute
  const absMap = new Map();
  const pathMap = new Map();
  for (const r of results){
    let final = r.finalUrl || r.url;
    final = forceHttps(final);
    // ensure trailing slash consistency and strip index.html if present in final
    try{
      const uo = new URL(r.url);
      const uf = new URL(final);
      // normalize index.html => /
      if (uf.pathname.endsWith('/index.html')){
        uf.pathname = uf.pathname.replace(/\/index\.html$/, '/');
      }
      // If uf is rootless path, keep trailing slash as-is
      final = uf.toString();
      // store maps
      absMap.set(uo.toString(), final);
      // path key (original path and derived path without index.html)
      const p1 = uo.pathname; pathMap.set(p1, final);
      if (p1.endsWith('/index.html')){ pathMap.set(p1.replace(/\/index\.html$/, '/'), final); }
    }catch{
      // skip malformed
    }
  }

  // Collect target files
  const files = await listFiles(ROOT, new Set(['.html','.xml','.js','.mjs']));
  let changedCount = 0;
  for (const file of files){
    let text = await fsp.readFile(file,'utf8');
    const before = text;
    // Absolute URL replacements
    for (const [orig, fin] of absMap.entries()){
      if (orig!==fin){ text = text.split(orig).join(fin); }
      // Also replace http->https for the same URL if present
      try{
        const o = new URL(orig);
        const httpVar = new URL(orig); httpVar.protocol='http:';
        if (httpVar.toString()!==fin){ text = text.split(httpVar.toString()).join(fin); }
      }catch{}
    }
    // href="/path" replacements to absolute final URL
    text = text.replace(/href="([^"]+)"/g, (m, hrefVal)=>{
      try{
        if (!hrefVal.startsWith('/')) return m; // only root-relative
        const fin = pathMap.get(hrefVal);
        if (fin){ return `href="${fin}"`; }
      }catch{}
      return m;
    });
    if (text!==before){
      await fsp.writeFile(file, text);
      changedCount++;
    }
  }
  return changedCount;
}

// ---------- main ----------
async function main(){
  // 1) Capture og-cover.jpg
  await captureOgCover().catch(e=>{ err('Capture failed:', e.message); process.exitCode=1; });
  // 2) Parse sitemap and HEAD
  const urls = await parseSitemapLocs();
  const results = await headAllOnce(urls);
  printTSV(results);
  const normalizedCount = results.filter(r=>r.redirected).length;
  // 3) Update files in-place
  const changedFiles = await normalizeFiles(results);
  // 4) Summary (green)
  const green = (s)=>`\u001b[32m${s}\u001b[0m`;
  console.log(green(`✅ og-cover fixed + ${normalizedCount} 3XX URLs normalized + ready for AdSense`));
}

main().catch(e=>{ err(e.stack||e.message); process.exit(1); });

