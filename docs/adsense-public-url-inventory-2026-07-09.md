# Polytrack.best AdSense 公开 URL 清单

日期：2026-07-09
状态：整改前只读盘点；后续已处理 `/blog/`、首页首屏和 5 篇 P0 英文核心文章，未部署，未提交 AdSense
用途：作为 `docs/adsense-content-readiness-prd-2026-06-25.md` v1.1 的第一步执行证据

说明：第 1-9 节保留整改前基线，方便对比。2026-07-09 已先处理 `/blog/`、首页首屏、connection troubleshooting、track builder、gameplay tips、ghost racing 和 world records，见第 10-14 节。

## 1. 结论

当前不能重新提交 AdSense。

原因不是 `ads.txt`，而是公开可见内容面还不够稳：

- sitemap 里有 18 个 URL，其中 `/blog/` 是可索引入口页，但正文很薄。
- 首页和博客目录会把用户带到多个 `noindex,nofollow` 薄页。
- 已索引的核心文章多数只有 600-830 词左右，低于 PRD 规定的 1200 词正文门槛。
- `ghost-racing-strategies` 和 `polytrack-world-records-guide` 已在 sitemap 中，但原 PRD v1.0 没把它们列入 P0。
- `data/i18n-pages.json` 里存在“页面组 inSitemap=true，但具体翻译 noindex=true”的配置歧义，虽然当前脚本会过滤，但文档和执行时容易误判。

## 2. 数据来源

本次只读检查使用：

- `sitemap.xml`
- `robots.txt`
- `data/i18n-pages.json`
- `index.html`
- `blog/index.html`
- `header.html`
- `footer.html`
- 英文核心 HTML 页面

词数是用本地脚本去掉 `script` / `style` 后粗算，仍包含导航和页脚，只用于风险排序。

## 3. sitemap URL

当前 sitemap 收录 18 个 URL：

| URL | 类型 | 初步判断 |
|---|---|---|
| `/` | 首页 | P0，首屏要从游戏入口改成攻略中心 |
| `/blog/` | 博客入口 | P0，太薄，且引出 noindex 薄页 |
| `/about-us` | 信任页 | 需要官方身份口径验收 |
| `/es/about-us` | 多语言信任页 | 非本轮 P0，保持观察 |
| `/pt-br/about-us` | 多语言信任页 | 非本轮 P0，保持观察 |
| `/ja/about-us` | 多语言信任页 | 非本轮 P0，保持观察 |
| `/ko/about-us` | 多语言信任页 | 非本轮 P0，保持观察 |
| `/de/about-us` | 多语言信任页 | 非本轮 P0，保持观察 |
| `/contact` | 信任页 | 需要可用性验收 |
| `/legal-documents` | 信任页 | 需要可读性验收 |
| `/privacy-policy` | 信任页 | 需要 Google 广告 cookie 披露验收 |
| `/terms-of-service` | 信任页 | 需要官方关系口径验收 |
| `/dmca` | 信任页 | 需要可读性验收 |
| `/blog/track-builder-guide` | 核心文章 | P0，内容不足 |
| `/blog/ghost-racing-strategies` | 核心文章 | P0，已索引且首页推荐 |
| `/blog/polytrack-gameplay-tips` | 核心文章 | P0，内容不足 |
| `/blog/polytrack-unblocked-guide` | 核心文章 | P0，需改 `unblocked` 口径 |
| `/blog/polytrack-world-records-guide` | 核心文章 | P0，数据维护边界不足 |

## 4. 核心公开 URL 风险表

| URL | 文件 | robots | 粗算词数 | sitemap | 入口来源 | 风险 | 动作 |
|---|---|---:|---:|---|---|---|---|
| `/` | `index.html` | `index,follow` | 1125 | 是 | header, home, blog | 首屏仍偏游戏入口 | 改首屏为攻略中心，保留官方入口为次级动作 |
| `/blog/` | `blog/index.html` | `index,follow` | 392 | 是 | header, home, blog | 可索引入口页太薄，还推荐 noindex 页 | 改为路径化博客入口 |
| `/blog/track-builder-guide` | `blog/track-builder-guide.html` | `index,follow` | 726 | 是 | home, blog | 核心文章不足 1200 正文词 | 补赛道编辑流程、错误案例、测试表 |
| `/blog/polytrack-gameplay-tips` | `blog/polytrack-gameplay-tips.html` | `index,follow` | 761 | 是 | blog | 泛技巧多，训练路径弱 | 补新手到进阶练习计划 |
| `/blog/polytrack-unblocked-guide` | `blog/polytrack-unblocked-guide.html` | `index,follow` | 826 | 是 | blog | `unblocked` 容易误解成绕限制 | 改成 loading / connection troubleshooting |
| `/blog/ghost-racing-strategies` | `blog/ghost-racing-strategies.html` | `index,follow` | 604 | 是 | home, blog | 已索引且首页推荐，但内容薄 | 升级为 P0 实战训练页 |
| `/blog/polytrack-world-records-guide` | `blog/polytrack-world-records-guide.html` | `index,follow` | 806 | 是 | blog | 记录类内容有过期风险 | 加数据来源、更新时间、非实时声明 |
| `/about-us` | `about-us.html` | `index,follow` | 345 | 是 | footer, home, blog | 信任页偏短 | 校验 independent guide hub 口径 |
| `/contact` | `contact.html` | `index,follow` | 189 | 是 | sitemap | 信任页很短 | 确认联系路径可用，不当核心内容证明 |
| `/privacy-policy` | `privacy-policy.html` | `index,follow` | 590 | 是 | footer, home, blog | 需要广告 cookie 披露验收 | 对照 Google Publisher Policies 检查 |
| `/legal-documents` | `legal-documents.html` | `index,follow` | 209 | 是 | footer, home, blog | 法律入口短 | 保持入口，不当内容价值证明 |
| `/terms-of-service` | `terms-of-service.html` | `index,follow` | 368 | 是 | footer, home, blog | 需要官方关系口径一致 | 检查不冒充官方 |
| `/dmca` | `dmca.html` | `index,follow` | 441 | 是 | footer, home, blog | 可保留 | 检查联系信息一致 |

## 5. noindex 但可见的薄页

这些页面当前不在 sitemap 中，但用户能从首页或博客目录点进去。对 AdSense 来说，用户体验仍会受影响。

| URL | 文件 | robots | 粗算词数 | 可见入口 | 风险 | 本轮处理 |
|---|---|---:|---:|---|---|---|
| `/blog/custom-polytrack-tracks` | `blog/custom-polytrack-tracks.html` | `noindex,nofollow` | 485 | blog | 博客第一张卡就是它，但页面不索引且薄 | 补强到可索引，或从博客门面撤下 |
| `/blog/mobile-controls-setup` | `blog/mobile-controls-setup.html` | `noindex,nofollow` | 491 | home, blog | 首页推荐它，但页面 noindex | 补强到可索引，或从首页推荐撤下 |
| `/blog/community-tracks-showcase` | `blog/community-tracks-showcase.html` | `noindex,nofollow` | 491 | blog | 博客目录推荐薄页 | 补强到可索引，或撤下 |
| `/blog/performance-optimization-tips` | `blog/performance-optimization-tips.html` | `noindex,nofollow` | 431 | blog | 博客目录推荐薄页 | 补强到可索引，或撤下 |

硬规则：

- `noindex` 页面不能放在首页 featured 区。
- `noindex` 页面不能作为博客目录的主要门面。
- 如果保留入口，就必须补到可索引质量。

## 6. 多语言 noindex 入口

语言切换器会露出这些 noindex 页面：

| URL | 文件 | robots | 粗算词数 | 入口来源 | 本轮策略 |
|---|---|---:|---:|---|---|
| `/es/` | `es/index.html` | `noindex,nofollow` | 344 | home language switcher | 非本轮 P0，不作为 AdSense 内容证明 |
| `/pt-br/` | `pt-br/index.html` | `noindex,nofollow` | 338 | home language switcher | 非本轮 P0，不作为 AdSense 内容证明 |
| `/ja/` | `ja/index.html` | `noindex,nofollow` | 63 | home language switcher | 风险偏高，暂不扩写，后续单独处理 |
| `/ko/` | `ko/index.html` | `noindex,nofollow` | 237 | home language switcher | 非本轮 P0，不作为 AdSense 内容证明 |
| `/de/` | `de/index.html` | `noindex,nofollow` | 326 | home language switcher | 非本轮 P0，不作为 AdSense 内容证明 |
| `/es/blog/` | `es/blog/index.html` | `noindex,nofollow` | 130 | blog language switcher | 非本轮 P0，不作为 AdSense 内容证明 |
| `/pt-br/blog/` | `pt-br/blog/index.html` | `noindex,nofollow` | 127 | blog language switcher | 非本轮 P0，不作为 AdSense 内容证明 |
| `/ja/blog/` | `ja/blog/index.html` | `noindex,nofollow` | 47 | blog language switcher | 风险偏高，后续单独处理 |
| `/ko/blog/` | `ko/blog/index.html` | `noindex,nofollow` | 104 | blog language switcher | 非本轮 P0，不作为 AdSense 内容证明 |
| `/de/blog/` | `de/blog/index.html` | `noindex,nofollow` | 119 | blog language switcher | 非本轮 P0，不作为 AdSense 内容证明 |

本轮先不改多语言正文。执行页面整改时，不要把这些页面当作“已经有足够内容”的证据。

## 7. 配置层冲突

`data/i18n-pages.json` 存在多处页面组级别 `inSitemap=true`，但翻译级别 `noindex=true`。

当前脚本会过滤掉这些 noindex 翻译，不一定导致线上 sitemap 错误，但会导致执行者误判。

明确规则：

- 准备进入 sitemap 的 URL：翻译级别必须 `noindex=false`，页面必须有 `index,follow`。
- 保持 `noindex` 的 URL：不应被当作 sitemap/AdSense 内容证明。
- 后续如果要修配置，先单独列出所有 `page.inSitemap=true + translation.noindex=true` 的组合，不要顺手改多语言正文。

重点冲突组：

- 多语言首页和博客页：`/es/`、`/pt-br/`、`/ja/`、`/ko/`、`/de/`、以及对应 `/blog/`
- 多语言法律页：privacy / terms / dmca / legal
- 多语言 `track-builder-guide`
- 英文 noindex 文章：custom tracks、community showcase、mobile controls、performance tips

## 8. 下一步执行顺序

按风险顺序：

1. 改 `blog/index.html`：先撤掉或标记 noindex 薄页入口，改成 Start / Fix / Build / Practice 路径。
2. 改 `index.html`：首屏露出真实攻略答案，不再让游戏入口当主角。
3. 补强 `blog/polytrack-unblocked-guide.html`：删除绕限制暗示和任何 `Official` 误导。
4. 补强 `blog/track-builder-guide.html` 和 `blog/polytrack-gameplay-tips.html`。
5. 补强或降权 `ghost-racing-strategies`、`polytrack-world-records-guide`。
6. 处理 4 个 noindex 可见薄页：补强到可索引，或从门面撤下。
7. 再跑 sitemap/canonical/Googlebot/GSC 验收。

## 9. 目前重审状态

```text
AdSense 重新提交：不建议
原因：公开 URL 清单显示仍有可见薄内容、P0 内容不足、博客入口薄、noindex 页面被推荐。
```

只有完成 PRD v1.1 第 9-17 节 gate 后，才进入 AdSense 重审。

## 10. 2026-07-09 `/blog/` 初步整改状态

已处理：

- `blog/index.html` 从普通文章卡片列表改为 Start / Fix / Build / Practice 路径入口。
- 博客门面不再直接链接 4 个 `noindex,nofollow` 薄页：custom tracks、mobile/controller setup、community tracks、performance optimization。
- 页面明确写出 `Polytrack.best` 是 independent guide hub，不是官方发布方。
- 页面加入“如何选择攻略”和“草稿暂不推荐”的说明，让目录页更像真实导航，而不是薄列表。

验证：

- `rg -n "/blog/custom-polytrack-tracks|/blog/mobile-controls-setup|/blog/community-tracks-showcase|/blog/performance-optimization-tips" blog/index.html` 无匹配。
- `blog/index.html` 粗算词数从约 392 增加到约 749。
- `npm run typecheck` 通过。
- `npm run scan:garble` 无匹配项。

仍未完成：

- 2 个其他 P0 英文核心文章仍未补到 PRD 目标。
- 仍不建议提交 AdSense 重审。

## 11. 2026-07-09 首页首屏初步整改状态

已处理：

- `index.html` 首屏从游戏大按钮入口改为 `Polytrack Independent Guide Center`。
- 首屏加入 4 条攻略路径：Start、Fix、Build、Practice。
- 官方游戏入口保留，但下移为次级模块，并明确说明本站不托管、不发布官方游戏。
- 首页 `latest-blog` 区撤下 `mobile-controls-setup` 这个 `noindex,nofollow` 薄页入口，替换为 `polytrack-gameplay-tips`。
- 页面 title、description、OG、Twitter、WebPage JSON-LD 和面包屑描述同步改为 guide center 口径。

验证：

- `rg -n "/blog/custom-polytrack-tracks|/blog/mobile-controls-setup|/blog/community-tracks-showcase|/blog/performance-optimization-tips" index.html blog/index.html` 无匹配。
- `index.html` 粗算词数约 1343。
- `npm run typecheck` 通过。
- `npm run scan:garble` 无匹配项。

仍未完成：

- 4 个其他 P0 英文核心文章仍未补到 PRD 目标。
- 仍不建议提交 AdSense 重审。

## 12. 2026-07-09 connection troubleshooting 文章整改状态

已处理：

- `blog/polytrack-unblocked-guide.html` 正文重写为官方访问和加载排障口径。
- 标题、description、OG、Twitter、Article JSON-LD、页面更新时间同步为 connection troubleshooting。
- 正文明确 `Polytrack.best` 是 independent guide hub，不是官方发布方，也不托管官方游戏。
- 删除正文里容易误解为绕限制的建议；只保留浏览器、WebGL、缓存、设备、网络所有者允许范围内的检查。
- 相关阅读撤下 `performance-optimization-tips` 和 `mobile-controls-setup` 两个 `noindex,nofollow` 薄页链接，改为 4 个 P0 可索引页面。

验证：

- `blog/polytrack-unblocked-guide.html` 严格按 article 正文粗算约 1271 词。
- 风险词扫描显示 `unblocked` 只剩在 URL / canonical / hreflang 等路径里，正文不再用它做卖点。
- `rg -n -i "mobile-controls|performance-optimization|community-tracks|custom-polytrack" blog/polytrack-unblocked-guide.html` 无匹配。
- `npm run typecheck` 通过。
- `npm run scan:garble` 无匹配项。

仍未完成：

- `blog/ghost-racing-strategies.html`、`blog/polytrack-world-records-guide.html` 仍需继续补强。
- 仍不建议提交 AdSense 重审。

## 13. 2026-07-09 track builder 和 gameplay tips 整改状态

已处理：

- `blog/track-builder-guide.html` 从约 737 词补到严格 article 正文约 1208 词。
- `blog/polytrack-gameplay-tips.html` 从约 797 词补到严格 article 正文约 1214 词。
- `track-builder-guide` 增加新手首图配方、可读性规则、15 分钟测试计划、发布说明模板。
- `gameplay-tips` 改成新手到进阶训练页，加入 20 分钟练习计划、跳跃/漂移练习、ghost 分段复盘、练习日志和停止硬冲的判断。
- 撤掉 `track-builder-guide` 里指向 `community-tracks-showcase` 这个 `noindex,nofollow` 薄页的链接。
- 清理 `gameplay-tips` 里夸张 WR、外部 YouTube 搜索、邮件反馈等不稳口径。

验证：

- `blog/track-builder-guide.html` 严格按 article 正文粗算约 1208 词。
- `blog/polytrack-gameplay-tips.html` 严格按 article 正文粗算约 1214 词。
- `rg -n -i "community-tracks|mobile-controls|performance-optimization|custom-polytrack|youtube|Serphal|Monstrosity|bypass|play@polytrack.best" blog/track-builder-guide.html blog/polytrack-gameplay-tips.html` 无匹配。
- `npm run typecheck` 通过。
- `npm run scan:garble` 无匹配项。

当时仍未完成：

- `blog/ghost-racing-strategies.html`、`blog/polytrack-world-records-guide.html` 当时仍需补强或降权；后续已处理，见第 14 节。
- 当时仍不建议提交 AdSense 重审。

## 14. 2026-07-09 ghost racing 和 world records 整改状态

已处理：

- `blog/ghost-racing-strategies.html` 从约 604 词补到严格 article 正文约 1257 词。
- `ghost-racing-strategies` 改成分段练习、ghost 对比、PB 记录和回退练习方法页。
- 页面新增 ghost review targets、practice environment checklist、30-minute routine、PB note format 等表格/清单。
- 页面明确 `Polytrack.best` 是 independent guide hub，不托管 ghost，不验证 leaderboard。
- 撤掉原来指向 `performance-optimization-tips` 这个 `noindex,nofollow` 薄页的相关阅读链接。
- `blog/polytrack-world-records-guide.html` 从约 806 词补到严格 article 正文约 1328 词。
- `world-records-guide` 从旧的记录堆叠页改成非实时记录核验方法页。
- 页面新增 source quality ladder、snapshot rules、verification environment、safer snapshot format、record notebook fields。
- 删除旧页面里的具体玩家名、第三方提交流程和“当前记录”式硬断言，改为“先看来源和日期，再引用”的口径。
- `polytrack-world-records-guide` 补上 `main id="main-content"`，修复跳转锚点。

验证：

- 5 篇 P0 article 正文词数：connection troubleshooting 约 1271、track builder 约 1208、gameplay tips 约 1214、ghost racing 约 1257、world records 约 1328。
- `rg -n -i "performance-optimization|mobile-controls|custom-polytrack|community-tracks-showcase|GG Tracker|Speedrun|Serphal|Monstrosity|GoZ3r|bypass|proxy|vpn|play@polytrack.best|youtube" ...` 无匹配。
- `npm run typecheck` 通过。
- `npm run scan:garble` 无匹配项。

仍未完成：

- 本轮未部署，未进入 AdSense 后台，未提交重审。
- 仍需做上线前 `npm run build`、线上 URL 抽查、GSC live test / request indexing 和 AdSense Policy Center 检查。
- 多语言 noindex 页面和信任页仍不作为本轮核心内容证明。

## 15. 2026-07-09 build 和本地预览验收

已处理：

- 执行 `npm run build`。
- build 重新生成压缩 `assets/styles.css`、`sitemap.xml` 和 `assets/cache-manifest.json`。
- 本地启动 `npm run serve -- --port 8000`。
- 抽查首页、博客入口、5 篇 P0 英文核心文章、`/sitemap.xml`、`/ads.txt`、`/assets/styles.css`。
- 使用 Chrome DevTools 抽查首页桌面/手机首屏，以及 ghost racing / world records 两篇文章渲染。

验证：

- `npm run build` 通过。
- 本地核心 URL 均返回 200。
- sitemap 18 个 URL 本地全部返回 200。
- 5 篇 P0 article 正文仍均超过 1200 词。
- 核心页未发现指向 4 个 `noindex,nofollow` 薄页的显眼链接。
- `npm run scan:garble` 无匹配项。
- 主文档 `document.compatMode` 为 `CSS1Compat`。

注意：

- 本地预览中 Google 广告请求有一次 403，来源是 `127.0.0.1` 本地广告请求，不是本站静态资源失败。
- 这一步仍未提交 AdSense 重审。

下一步：

- 推送上线后抽查真实 `https://polytrack.best/` 页面。
- 线上通过后，再做 GSC live test / request indexing。
- GSC 和 Policy Center 都没问题后，才考虑 AdSense 重审。

## 16. 2026-07-09 线上部署和 GSC 公开抓取检查

已处理：

- commit `b790b26` 推送到 `origin/main`。
- GitHub Actions `Quality Gate` run `28992884782` 成功。
- GitHub Actions `Deploy to GitHub Pages` run `28992884767` 成功。
- 抽查线上 `https://polytrack.best/`、`/blog/`、5 篇 P0 英文核心文章、`/sitemap.xml`、`/ads.txt`、`/assets/styles.css`。
- 使用 `gsc-site-submit-check` 检查公开抓取条件。

验证：

- 线上核心 URL 均返回 200。
- 线上 sitemap 18 个 URL 全部返回 200。
- 线上核心页未发现指向 4 个 `noindex,nofollow` 薄页的显眼链接。
- sitemap 返回 200。
- Googlebot 访问 sitemap 返回 200。
- robots.txt 返回 200，且包含 Sitemap 行。
- sitemap XML 可解析为 `urlset`，包含 18 个 loc。

未完成：

- Chrome 打开 GSC URL Inspection 时跳到 Google 登录页，所以本轮没有在 GSC 后台点击 live test / request indexing。
- 未检查 AdSense Policy Center。
- 未提交 AdSense 重审。

当前建议：

- 现在可以进入 GSC 做人工 URL Inspection / request indexing。
- 还不要直接点 AdSense 重审；至少先确认 GSC 能抓首页和 5 篇 P0 文章，并确认 Policy Center 没有问题。
