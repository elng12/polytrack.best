# Polytrack.best 迭代记录

这个文件是 `polytrack.best` 的长期优化记录。

不要把它当成随手笔记。以后每次改页面、改 SEO、加语言、修发布、接广告、改缓存，都要在这里留下记录。这样过几天再回来，不会忘记当时为什么这样做。

## 当前状态

| 字段 | 内容 |
|---|---|
| 项目类型 | 静态 HTML 游戏站 |
| 线上域名 | `https://polytrack.best/` |
| 当前阶段 | AdSense 低价值内容整改 PRD 阶段 |
| 当前最重要目标 | 先把内容整改需求写成可执行施工单，再改页面 |
| 当前最大问题 | AdSense 反馈低价值内容；首页和核心文章还不足以证明原创攻略价值 |
| 本周建议状态 | 先硬化 PRD，不直接重提 AdSense |
| 下次复查日期 | 2026-07-10 |

## 已知事实

| 项目 | 当前情况 |
|---|---|
| 主分支 | `main` |
| 工作区 | 2026-06-12 检查时是干净的 |
| 已上线语言 | `en`、`es`、`pt-BR`、`ja`、`ko`、`de` |
| 暂不做语言 | `zh`，当前不做中文多语言 |
| 下一批语言 | 先不加，等 GSC 数据再说 |
| 多语言核心文件 | `data/i18n-pages.json` |
| 布局生成脚本 | `scripts/apply-layout.mjs` |
| i18n 检查脚本 | `scripts/check-i18n.mjs` |
| sitemap 脚本 | `scripts/gen-sitemap.mjs`、`scripts/check-sitemap-urls.mjs` |
| cache 检查脚本 | `scripts/gen-cache-manifest.mjs`、`scripts/check-cache-manifest.mjs` |
| AdSense | 首页线上已出现 `ca-pub-3219924658522446` 的 meta 和脚本 |

## 当前验证基线

2026-06-12 已确认：

- `npm run check:layout` 通过。
- `npm run check:i18n` 通过。
- `npm run check:sitemap` 通过，当前 sitemap 是 36 个 URL。
- `npm run check:cache` 通过。
- `npm run scan:garble` 没扫到乱码或冲突标记。
- GitHub Actions 最近一次 `Quality Gate` 成功。
- GitHub Actions 最近一次 `Deploy to GitHub Pages` 成功。
- 线上 `/`、`/es/`、`/pt-br/`、`/ja/`、`/ko/`、`/de/`、`/sitemap.xml` 都能打开。
- 线上 `/es`、`/es/blog`、`/ko`、`/de` 会跳到带 `/` 的正确地址。

## 最新 GSC 快照

2026-06-12 重新跑了本地 GSC 自动日报。

| 字段 | 内容 |
|---|---|
| GSC 最终数据日期 | 2026-06-10 |
| 站点状态 | 正常，没有明显 SEO 数据问题 |
| 点击 | 108 |
| 曝光 | 3,444 |
| CTR | 3.1% |
| 平均排名 | 6.7 |
| 最近 7 天日均点击 | 82 |
| 最近 7 天日均曝光 | 2,962 |
| 最近 28 天日均点击 | 98 |
| 最近 28 天日均曝光 | 3,313 |
| 报警 | 无 |

结论：GSC 总体正常，现在不应该因为一天数据波动去乱改页面。

## 近期不要做

这几件事先不要急着做：

1. 不要继续批量加新语言。
2. 不要一次性重写首页。
3. 不要因为“感觉可以优化”就改标题和大段文案。
4. 不要同时改多语言、广告、缓存、SEO 模板。
5. 不要跳过 GSC / AdSense 后台反馈直接做下一轮。

## 下一步检查清单

下一次打开这个项目，优先查这些：

1. GSC 里 `https://polytrack.best/sitemap.xml` 有没有被成功读取。
2. GSC 里 `/es/`、`/pt-br/`、`/ja/`、`/ko/`、`/de/` 有没有被发现。
3. GSC 里有没有 hreflang、canonical、重复网页、重定向错误。
4. AdSense 后台网站审核状态是否通过。
5. AdSense Policy Center 有没有问题。
6. 哪个语言目录开始有展示或点击。

## 每次优化前先填这张卡

| 字段 | 内容 |
|---|---|
| 日期 |  |
| 问题 |  |
| 证据 |  |
| 本轮边界 |  |
| 本轮不做 |  |
| 修改计划 |  |
| 验证方式 |  |
| 复查日期 |  |

## 记录模板

```md
## YYYY-MM-DD 优化记录

问题：
证据：
本轮边界：
修改：
验证：
未做：
复查日期：
下一步：
```

## 固定规则

1. 每轮只解决一个主要问题。
2. 要先看真实页面、真实日志、真实 GSC / AdSense 反馈。
3. 多语言改动必须同时检查 `hreflang`、`canonical`、sitemap、cache。
4. 目录页最终 URL 要带 `/`，例如 `/es/`、`/es/blog/`。
5. 普通 HTML 叶子页最终 URL 不带 `/`，例如 `/es/privacy-policy`。
6. 修改页面后至少跑 `npm run typecheck`。
7. 准备上线前跑 `npm run build`。
8. 线上发布后要抽查真实 URL，不只看本地。
9. 大改走分支和 PR，小修也要保持改动范围小。
10. 当前站点每周只做一个小优化点。

## 2026-06-12 迭代记录

问题：项目缺少统一迭代记录，后续多语言、AdSense、GSC 观察容易混在一起。  
证据：`AGENTS.md` 已存在，但 `docs/ITERATION.md` 缺失。  
本轮边界：只补长期维护文档，不改业务代码，不改页面，不部署。  
修改：创建并整理 `docs/ITERATION.md`，记录当前上线状态、验证基线、GSC 快照和下一步检查清单。  
验证：项目文档守卫检查已确认 `AGENTS.md` 和 `docs/ITERATION.md` 都存在；GSC 自动日报显示 `polytrack.best` 正常。  
未做：未进入 AdSense 后台，未新增语言，未修改 SEO 文案。  
复查日期：2026-06-19。  
下一步：打开 AdSense 后台，看网站审核和 Policy Center；GSC 继续观察，不急着改页面。

## 2026-07-09 迭代记录

问题：AdSense 已反馈低价值内容，原 PRD 过于像方向稿，缺少全站 URL 清单、P0 页面范围、内容验收、广告安全边界、发布 SOP 和回滚要求。  
证据：`docs/adsense-content-readiness-prd-2026-06-25.md` v1.0 只覆盖首页和 3 篇文章，未把 `/blog/`、已索引 `ghost-racing-strategies`、站内可见 `noindex` 薄页、官方口径和游戏广告风险写成硬验收。  
本轮边界：只改 PRD 和迭代记录，不改业务页面，不部署，不提交 AdSense。  
修改：把 `docs/adsense-content-readiness-prd-2026-06-25.md` 升级为 v1.1，新增当前页面基线、P0 扩围、AdSense 内容条件、SEO/GSC 抓取条件、执行任务表、允许改动范围、本地验证、发布 SOP、线上验收、回滚方案和重审最低条件。  
验证：已复查 PRD 文件内容，并保留当前页面词数/robots 基线；本轮未跑 `npm run build`，因为没有改业务页面。  
未做：未修改首页、博客文章、sitemap、cache manifest 或多语言配置。  
复查日期：2026-07-10。  
下一步：按 v1.1 PRD 先做全站公开 URL 清单，再进入首页和 P0 内容页整改。

## 2026-07-09 URL 清单记录

问题：执行 v1.1 PRD 的第一步，需要先弄清楚 AdSense 能看到或用户能点到哪些公开 URL，避免只修首页和 3 篇文章。  
证据：本地只读扫描显示 sitemap 里有 18 个 URL；`/blog/` 可索引但很薄；`custom-polytrack-tracks`、`mobile-controls-setup`、`community-tracks-showcase`、`performance-optimization-tips` 是 `noindex,nofollow`，但仍从首页或博客目录可见；多语言 noindex 页面也通过语言切换器可见。  
本轮边界：只生成 URL 清单文档，不改页面，不改 sitemap，不改 `data/i18n-pages.json`，不部署。  
修改：新增 `docs/adsense-public-url-inventory-2026-07-09.md`，记录 sitemap URL、核心公开 URL、可见 noindex 薄页、多语言 noindex 入口、配置层 `inSitemap=true + noindex=true` 歧义和下一步执行顺序。  
验证：已用本地脚本读取 `sitemap.xml`、`robots.txt`、`data/i18n-pages.json`、`index.html`、`blog/index.html`、`header.html`、`footer.html` 和英文核心 HTML；本轮未跑 `npm run build`，因为没有改业务页面。  
未做：未处理首页首屏、博客入口、P0 文章正文、官方口径或 noindex 页面入口。  
复查日期：2026-07-10。  
下一步：优先改 `blog/index.html`，撤下或补强 noindex 薄页入口，再改首页首屏。

## 2026-07-09 博客入口整改记录

问题：`/blog/` 是可索引入口页，但原页面更像文章卡片堆，正文偏薄，还把用户带到多个 `noindex,nofollow` 薄页。  
证据：整改前粗算词数约 392；博客目录直接链接 `custom-polytrack-tracks`、`mobile-controls-setup`、`community-tracks-showcase`、`performance-optimization-tips`。  
本轮边界：只改 `blog/index.html` 和文档记录；不改首页、不改 P0 文章正文、不改 sitemap、不部署、不提交 AdSense。  
修改：把博客首页改成 Start / Fix / Build / Practice 攻略路径入口；保留 5 个 P0 可索引攻略入口；撤下 4 个 noindex 薄页链接；补充 independent guide hub、如何选择攻略、草稿暂不推荐等说明；同步更新页面 title、description、OG、Twitter 和 JSON-LD 描述。  
验证：先跑 `npm run typecheck` 时提示 `blog/index.html` 需要套统一布局；已执行 `npm run apply:layout:write`，随后 `npm run typecheck` 通过；`npm run scan:garble` 无匹配项；noindex 薄页链接搜索无匹配；整改后 `/blog/` 粗算词数约 749。  
未做：未处理首页仍可能推荐 noindex 薄页的问题；未补强 5 个 P0 英文核心文章；未跑 `npm run build`；未上线。  
复查日期：2026-07-10。  
下一步：改 `index.html` 首屏，把“打开游戏”改成“Polytrack 独立攻略中心”，并撤下首页里不适合主推的 noindex 薄页入口。

## 2026-07-09 首页首屏整改记录

问题：首页首屏仍然以大号游戏打开面板为主，对 AdSense 来说更像游戏壳，而不是独立攻略站；首页下方还推荐了 `mobile-controls-setup` 这个 `noindex,nofollow` 薄页。  
证据：整改前 `index.html` 首屏注释为 `Hero: Game-first layout`，首屏大区域是 `Open Official Game`；`latest-blog` 区直接链接 `/blog/mobile-controls-setup`。  
本轮边界：只改 `index.html`、URL 清单文档和迭代记录；不改 P0 文章正文、不改多语言、不部署、不提交 AdSense。  
修改：首页首屏改为 `Polytrack Independent Guide Center`；首屏提供 Start / Fix / Build / Practice 四条攻略路径；官方游戏入口保留但下移为次级模块；明确写出本站不托管、不发布官方游戏；撤下首页 `mobile-controls-setup` 推荐卡，替换成 `polytrack-gameplay-tips`；同步更新首页 title、description、OG、Twitter、WebPage JSON-LD 和面包屑口径。  
验证：先跑 `npm run typecheck` 时提示 `index.html` 需要套统一布局；已执行 `npm run apply:layout:write`，随后 `npm run typecheck` 通过；`npm run scan:garble` 无匹配项；`index.html` 和 `blog/index.html` 中 4 个 noindex 薄页链接搜索无匹配；整改后首页粗算词数约 1343。  
未做：未补强 5 个 P0 英文核心文章；未处理 `polytrack-unblocked-guide` 的剩余口径风险；未跑 `npm run build`；未上线。  
复查日期：2026-07-10。  
下一步：优先补强 `blog/polytrack-unblocked-guide.html`，把 `unblocked` 口径收成官方访问和加载排障，不写绕限制。

## 2026-07-09 connection troubleshooting 文章整改记录

问题：`blog/polytrack-unblocked-guide.html` 虽然标题已经偏排障，但正文仍有官方身份混淆、绕限制联想、P0 内容不足，以及相关阅读继续指向 `noindex,nofollow` 薄页的问题。  
证据：整改前正文把 `polytrack.best` 写成类似官方入口；提到 proxy / VPN 等高风险词；相关阅读链接到 `performance-optimization-tips` 和 `mobile-controls-setup`；粗算词数约 826，低于 PRD 目标。  
本轮边界：只改 `blog/polytrack-unblocked-guide.html`、URL 清单文档和迭代记录；不改其他 P0 文章、不改多语言、不部署、不提交 AdSense。  
修改：正文重写为安全加载排障页；明确 `Polytrack.best` 是 independent guide hub，不托管、不发布官方游戏；排障范围限定为浏览器、WebGL、缓存、设备、网络所有者允许范围内的检查；删除对 noindex 薄页的相关阅读入口；补充设备/网络所有者说明；更新 dateModified、页面更新时间和阅读时间。  
验证：`blog/polytrack-unblocked-guide.html` 严格按 article 正文粗算约 1271 词；风险词扫描显示 `unblocked` 只剩 URL / canonical / hreflang 等路径，不再作为正文卖点；noindex 薄页链接搜索无匹配；`npm run typecheck` 通过；`npm run scan:garble` 无匹配项。  
未做：未补强 `track-builder-guide`、`polytrack-gameplay-tips`、`ghost-racing-strategies`、`polytrack-world-records-guide`；未跑 `npm run build`；未上线。  
复查日期：2026-07-10。  
下一步：优先补强 `blog/track-builder-guide.html` 和 `blog/polytrack-gameplay-tips.html`，让核心攻略页达到 1200 词以上并有真实步骤。

## 2026-07-09 track builder 和 gameplay tips 整改记录

问题：`track-builder-guide` 和 `polytrack-gameplay-tips` 仍低于 PRD 的 1200 词目标；前者还指向 `community-tracks-showcase` 这个 `noindex,nofollow` 薄页；后者有夸张 WR、外部 YouTube 搜索和邮件反馈等不稳口径。  
证据：整改前粗算词数：`track-builder-guide` 约 737，`polytrack-gameplay-tips` 约 797；风险扫描命中 noindex 链接、YouTube 搜索、具体 WR/玩家名和 `play@polytrack.best` 反馈口径。  
本轮边界：只改这两篇 P0 英文文章、URL 清单文档和迭代记录；不改 ghost / world records、不改多语言、不部署、不提交 AdSense。  
修改：`track-builder-guide` 增加新手首图配方、可读性规则、15 分钟测试计划、发布说明模板和更多 FAQ；撤下 `community-tracks-showcase` 链接。`polytrack-gameplay-tips` 改成新手到进阶训练页，新增 20 分钟练习计划、控制习惯、跳跃/漂移练习、ghost 分段复盘、练习日志、练习环境表和停止硬冲判断；清理夸张 WR、外部搜索和邮件反馈口径。  
验证：`track-builder-guide` 严格按 article 正文粗算约 1208 词；`polytrack-gameplay-tips` 严格按 article 正文粗算约 1214 词；风险链接和夸张口径扫描无匹配；`npm run typecheck` 通过；`npm run scan:garble` 无匹配项。  
未做：当时未补强 `ghost-racing-strategies`、`polytrack-world-records-guide`；未跑 `npm run build`；未上线。  
复查日期：2026-07-10。  
下一步：补强或降权 `ghost-racing-strategies` 和 `polytrack-world-records-guide`，然后再做一次全站链接和词数核对。

## 2026-07-09 ghost racing 和 world records 整改记录

问题：`ghost-racing-strategies` 已索引且被首页推荐，但正文太薄；`polytrack-world-records-guide` 属于记录类内容，旧写法容易把过期数据、具体玩家名和第三方提交流程写成当前事实。  
证据：整改前粗算词数：`ghost-racing-strategies` 约 604，`polytrack-world-records-guide` 约 806；风险扫描命中 `performance-optimization-tips` noindex 链接、具体玩家名、Speedrun/GG Tracker 等不稳口径。  
本轮边界：只改 ghost / world records 两篇 P0 英文文章，并顺手补齐前面 gameplay / troubleshooting 的严格 article 词数和测试环境表；不改多语言，不部署，不提交 AdSense。  
修改：`ghost-racing-strategies` 改成 ghost 分段练习、practice ladder、30 分钟练习、PB note、track builder 复用和 records 回看路径；新增 practice environment checklist。`polytrack-world-records-guide` 改成非实时记录核验方法页；新增 source quality ladder、snapshot rules、verification environment、safer snapshot format 和 record notebook；删除具体玩家名、当前记录式断言和第三方提交口径；补上 `main-content` 锚点。  
验证：5 篇 P0 article 正文词数均超过 1200：connection troubleshooting 约 1271、track builder 约 1208、gameplay tips 约 1214、ghost racing 约 1257、world records 约 1328；风险词扫描无匹配；`npm run typecheck` 通过；`npm run scan:garble` 无匹配项。  
未做：未跑 `npm run build`；未部署；未进入 AdSense 后台；未做 GSC live test / request indexing；未检查 AdSense Policy Center。  
复查日期：2026-07-10。  
下一步：做上线前 build 和真实页面抽查；通过后再考虑部署、GSC 请求抓取，最后才回 AdSense 点重审。

## 2026-07-09 build 和本地预览验收记录

问题：P0 内容整改完成后，需要确认正式 build、sitemap、cache、核心 URL、本地渲染和风险链接都没有坏，再考虑上线。  
证据：前一轮只跑了 `npm run typecheck` 和内容扫描，还没有跑正式 `npm run build`，也没有用本地 HTTP 服务抽查页面。  
本轮边界：只做上线前 build、本地预览和记录；不进入 AdSense 后台，不提交重审。  
修改：执行 `npm run build`，生成压缩后的 `assets/styles.css`，刷新 `sitemap.xml` 和 `assets/cache-manifest.json`；本地启动 `npm run serve -- --port 8000` 预览。  
验证：`npm run build` 通过；本地 `/`、`/blog/`、5 篇 P0 文章、`/sitemap.xml`、`/ads.txt`、`/assets/styles.css` 均返回 200；sitemap 18 个 URL 本地全部返回 200；核心页未发现指向 4 个 `noindex,nofollow` 薄页的显眼链接；Chrome DevTools 抽查首页桌面/手机首屏、ghost racing 和 world records 文章可渲染；主文档 `document.compatMode` 为 `CSS1Compat`。  
注意：本地预览中 Google 广告请求出现一次 403，这是 `127.0.0.1` 本地广告请求限制，不是本站静态资源 404。  
未做：尚未线上部署；尚未做线上 URL 抽查；尚未做 GSC live test / request indexing；尚未提交 AdSense 重审。  
复查日期：2026-07-10。  
下一步：提交并推送到 `main` 触发 GitHub Pages 部署，等部署完成后抽查线上 URL。

## 2026-07-09 线上部署和 GSC 公开抓取检查记录

问题：本地验收通过后，需要确认 GitHub Pages 部署成功，真实线上页面已更新，并证明 Googlebot 能读取 sitemap 和 sitemap 中的 URL。
证据：`main` 推送 commit `b790b26` 后触发 GitHub Actions：Quality Gate run `28992884782`，Deploy to GitHub Pages run `28992884767`。
本轮边界：执行提交、推送、GitHub Pages 部署、线上 URL 抽查和公开抓取检查；不登录用户 Google 账号，不提交 AdSense 重审。
修改：提交 `Improve AdSense content readiness` 并推送到 `origin/main`；线上站点已由 GitHub Pages 部署。
验证：Quality Gate 成功；Deploy to GitHub Pages 成功；线上 `/`、`/blog/`、5 篇 P0 文章、`/sitemap.xml`、`/ads.txt`、`/assets/styles.css` 均返回 200；线上 sitemap 18 个 URL 全部返回 200；线上核心页未发现指向 4 个 `noindex,nofollow` 薄页的显眼链接；`gsc-site-submit-check` 显示 sitemap 200、Googlebot 访问 sitemap 200、robots 200、robots 包含 Sitemap 行、sitemap XML 解析成功且 18 个 loc 全部 200。
未做：Chrome 打开 GSC URL Inspection 时跳到 Google 登录页，因此未做 GSC 后台 live test / request indexing；未检查 AdSense Policy Center；未提交 AdSense 重审。
复查日期：2026-07-10。
下一步：用已登录 Google 的浏览器进入 GSC，对首页和 5 篇 P0 文章做 URL Inspection / request indexing；确认 Policy Center 没问题后，再考虑 AdSense 重审。

## 2026-07-11 ObbyList dofollow 链接记录

问题：需要从 Polytrack.best 给 `https://obbylist.com/` 增加一个自然、可抓取的普通链接。
证据：首页原来没有指向 ObbyList 的链接。
本轮边界：只改英文首页和迭代记录，提交到 `main` 并部署；不改其他语言。
修改：在首页博客推荐区和 FAQ 之间新增 `More game guides` 小节，用 `ObbyList` 品牌名链接到 `https://obbylist.com/`；链接没有 `nofollow`、`sponsored` 或 `ugc` 属性。
验证：链接检查脚本确认目标地址存在且没有阻止跟随的 `rel` 值；`npm run typecheck` 通过；`npm run build` 通过；本地浏览器确认版式正常，点击后到达 ObbyList 首页。提交 `6ce25ae` 已推送到 `main`；Quality Gate run `29143845711` 和 Deploy to GitHub Pages run `29143845715` 均成功；线上首页返回 200，源代码已出现 `https://obbylist.com/` 链接。
未做：未提交 GSC URL Inspection，也未提交 AdSense 重审。
复查日期：2026-07-12。
下一步：观察搜索引擎重新抓取，不再为这条链接继续改页面结构。
