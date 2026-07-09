# Polytrack.best AdSense 内容整改 PRD

版本：v1.1
状态：Ready for Scoped Implementation；Not Ready for AdSense Resubmission
最后更新：2026-07-09
适用范围：AdSense 低价值内容整改、首页首屏改版、核心攻略内容补强、重审前验收

## 1. 背景

AdSense 后台曾反馈：

- 网站：`polytrack.best`
- 状态：网站尚未准备好展示广告
- 已通过：网站所有权验证
- 未通过：低价值内容
- 原提示：2026-06-25 可以再次尝试

注意：2026-06-25 只是历史上的“可再次尝试日期”，不是现在可以直接重提的信号。今天是 2026-07-09。是否重新提交，只看本 PRD 的验收门槛是否全部通过。

本地和线上已知事实：

- `https://polytrack.best/` 可以打开。
- `https://polytrack.best/sitemap.xml` 可以打开。
- `https://polytrack.best/ads.txt` 可以打开，并包含 `pub-3219924658522446`。
- 问题重点不是技术接入失败，而是内容价值和站点信任不足。
- 当前首页第一眼仍容易像“打开 Polytrack 游戏的入口”。
- 当前站点有多篇文章，但核心正文偏短，部分站内可见文章是 `noindex,nofollow`。
- 近期 GSC 里 `sc-domain:polytrack.best` 曾被单列为严重下滑站点，所以不能把这次问题只当成 AdSense 表面文案问题。

Google 官方依据：

- AdSense 页面准备要求：https://support.google.com/adsense/answer/7299563
- AdSense 广告位置政策：https://support.google.com/adsense/answer/1346295
- AdSense 游戏页面广告规则：https://support.google.com/adsense/answer/2768340
- Google Publisher Policies：https://support.google.com/publisherpolicies/answer/10502938

## 2. 当前页面基线

这张表是 2026-07-09 本地粗查结果。词数是去掉 script/style 后的整页文本粗算，仍包含导航和页脚，所以只能当风险提示，不能当最终正文词数。

| 页面 | 当前 robots | 粗算词数 | 本轮判断 |
|---|---:|---:|---|
| `index.html` | `index,follow` | 1146 | P0，首页定位必须改 |
| `blog/index.html` | `index,follow` | 407 | P0，博客入口太薄 |
| `blog/track-builder-guide.html` | `index,follow` | 745 | P0，核心文章不足 |
| `blog/polytrack-gameplay-tips.html` | `index,follow` | 777 | P0，核心文章不足 |
| `blog/polytrack-unblocked-guide.html` | `index,follow` | 837 | P0，需改口径 |
| `blog/ghost-racing-strategies.html` | `index,follow` | 621 | P0，已索引且被首页推荐 |
| `blog/polytrack-world-records-guide.html` | `index,follow` | 824 | P0，已索引且数据维护风险高 |
| `blog/custom-polytrack-tracks.html` | `noindex,nofollow` | 501 | P0 入口处理：补强或撤下推荐 |
| `blog/mobile-controls-setup.html` | `noindex,nofollow` | 510 | P0 入口处理：补强或撤下推荐 |
| `blog/community-tracks-showcase.html` | `noindex,nofollow` | 503 | P0 入口处理：补强或撤下推荐 |
| `blog/performance-optimization-tips.html` | `noindex,nofollow` | 441 | P0 入口处理：补强或撤下推荐 |
| `about-us.html` | `index,follow` | 358 | 信任页，需要口径验收 |
| `privacy-policy.html` | `index,follow` | 609 | 信任页，需要广告和隐私验收 |
| `contact.html` | `index,follow` | 198 | 信任页，需要可用性验收 |

## 3. 核心判断

本轮不是修 `ads.txt`，也不是给首页换一个更漂亮的壳。

本轮要解决的是：

```text
让 Polytrack.best 从“游戏入口站”变成“有实测证据、有清楚导航、有稳定信任口径的 Polytrack 独立攻略中心”。
```

危险点：

- 只改首页和 3 篇文章，会留下“几篇强文 + 一堆薄页”的站点结构。
- GSC 能抓到页面，不等于 AdSense 认可内容价值。
- “Official”“unblocked”这类词会制造误导风险。
- 游戏入口旁边未来放广告，会有误点风险。
- 没有执行表、owner、改动范围和回滚计划，会导致执行时乱改。

## 4. 目标和非目标

### 4.1 目标

AdSense 目标：

- 公开可访问页面不再像低价值内容。
- 首页首屏能直接展示本站自己的攻略价值。
- 核心文章有实测证据、步骤、表格、判断，不只是泛泛介绍。
- 站点身份清楚：本站是 independent guide hub，不是官方发行方。
- 广告和游戏入口之间有明确安全边界。

用户目标：

- 用户不用先进入游戏，也能从首页获得实际帮助。
- 用户能快速找到新手操作、加载排错、赛道编辑、练习路线、记录维护说明。
- 用户能分清本站内容和官方游戏入口。

SEO/GSC 目标：

- 核心 URL 可以被 Google 抓取。
- canonical、robots、sitemap、实际 URL 一致。
- GSC 只作为“Google 能看到页面”的证据，不作为“内容够好”的证据。

### 4.2 非目标

本轮不做：

- 不新增语言。
- 不大改 URL 结构。
- 不新增真实广告位。
- 不做账号、评论区、排行榜、社区功能。
- 不把所有历史文章一次性深度重写。
- 不改多语言页面，除非是为了修 P0 页面入口或明确的 sitemap/noindex 配置冲突。
- 不承诺一定通过 AdSense。

## 5. 信息架构要求

### 5.1 首页首屏

首屏不能只是 H1 + 按钮 + 四个卡片。

首屏必须直接露出有用内容，例如：

```text
H1: Polytrack Independent Guide Hub

一句话：
Learn safe official access, beginner controls, loading fixes, track builder basics, and practice routes for Polytrack.

首屏可见内容块：
1. Beginner setup: 3 settings to check before your first run
2. Loading fixes: 4 quick checks before blaming the game
3. Track builder: 5-point checklist before sharing a course
4. Practice route: 20-minute beginner session plan

主要按钮：
Read the beginner guide

次要按钮：
Open the official Polytrack browser build
```

要求：

- `Open the official game` 只能是次级动作。
- 游戏入口不能占据首屏最大视觉面积。
- 首屏必须让用户不点任何链接，也能获得本站自己的内容。
- 首页必须明确：Polytrack.best 是 independent guide hub，不是官方发行方。

### 5.2 博客入口

`blog/index.html` 是 P0，不再只是文章列表。

必须包含：

- “Start here” 新手路径。
- “Fix problems” 排错路径。
- “Build tracks” 赛道编辑路径。
- “Practice and records” 练习和记录路径。
- 每个路径至少 1 句本站建议，不只是卡片堆叠。
- 对 `noindex` 页面：要么撤下可见推荐位，要么补强后改为可索引页面。

## 6. P0 页面范围

### 6.1 P0 必改页面

这些页面必须在重新提交 AdSense 前处理：

| 页面 | 改动目标 | 必交付物 |
|---|---|---|
| `index.html` | 首屏从游戏入口改成攻略中心 | 新首屏、实用内容块、次级官方入口 |
| `blog/index.html` | 从文章列表改成路径入口 | 4 个路径区、每区本站建议、薄页入口处理 |
| `blog/track-builder-guide.html` | 补赛道编辑实操 | 流程表、错误案例、测试说明、内链 |
| `blog/polytrack-gameplay-tips.html` | 补练习路径 | 新手到进阶计划、练习表、具体动作建议 |
| `blog/polytrack-unblocked-guide.html` | 改成连接/加载排错口径 | 删除绕限制暗示，改 official link check / loading troubleshooting |
| `blog/ghost-racing-strategies.html` | 补实战训练价值 | 练习计划、常见错误、记录方法 |
| `blog/polytrack-world-records-guide.html` | 补数据维护边界 | 数据来源说明、更新时间、非实时声明、核验方法 |

### 6.2 P0 入口处理页面

这些页面当前是 `noindex,nofollow`，但如果还出现在首页、博客目录、导航、推荐区，就会伤害站点体验。

| 页面 | 本轮处理方式 |
|---|---|
| `blog/custom-polytrack-tracks.html` | 补强到可索引，或从首页/博客目录推荐位撤下 |
| `blog/mobile-controls-setup.html` | 补强到可索引，或从首页/博客目录推荐位撤下 |
| `blog/community-tracks-showcase.html` | 补强到可索引，或从首页/博客目录推荐位撤下 |
| `blog/performance-optimization-tips.html` | 补强到可索引，或从首页/博客目录推荐位撤下 |

规则：

- `noindex` 页面不能当门面。
- 如果一个页面保留在 visible navigation / card / featured guide 里，就必须达到可索引质量。
- 如果暂时没时间补强，就撤下显眼入口，只保留必要的内部草稿状态。

## 7. 内容质量验收

### 7.1 每篇 P0 文章最低门槛

每篇 P0 内容页必须满足：

| 项目 | 门槛 |
|---|---|
| 正文词数 | main/article 正文不少于 1200 英文词，不含导航和页脚 |
| 表格/清单 | 至少 2 个 |
| 测试环境 | 至少 1 个测试环境表，写明日期、浏览器、设备、结果 |
| 本站判断 | 至少 2 段明确的 Polytrack.best 建议或判断 |
| 内链 | 至少 3 个相关内部链接 |
| 外链 | 官方游戏入口只指向可信官方/开发者相关地址 |
| 时间 | 页面可见更新时间 |
| 身份声明 | 说明本站是 independent guide hub，不是官方发行方 |
| 禁止项 | 禁止复制第三方描述、堆关键词、冒充官方、教用户绕过学校/公司限制 |

### 7.2 内容证据包

每个 P0 页面都要能留下证据：

- 修改前后正文词数。
- 新增章节清单。
- 新增表格/清单位置。
- 测试环境说明。
- 内链清单。
- 截图或本地预览证据。

## 8. 口径和合规要求

### 8.1 官方关系口径

允许：

- `Polytrack.best is an independent guide hub.`
- `Open the official Polytrack browser build.`
- `This guide links to the official browser build and adds independent player notes.`

禁止：

- `Polytrack.best Official`
- `Official Polytrack site`
- `Official guide`，除非明确指向官方来源且不会让人误解本站身份
- 任何暗示本站代表 Kodub 或官方发行方的写法

### 8.2 `unblocked` 口径

`blog/polytrack-unblocked-guide.html` 的方向改成：

```text
Polytrack connection troubleshooting / loading fixes / official link check
```

必须写清楚：

- 本站不教用户绕过学校、公司、地区或网络管理限制。
- 如果设备或网络由学校/公司管理，请遵守本地规则。
- 本文只提供浏览器缓存、网络连接、官方入口核验等普通排错建议。

### 8.3 游戏和广告安全边界

AdSense 通过前：

- 不新增真实广告位。
- 不在游戏入口区、Play 按钮区、游戏封面区周围设计广告位。

AdSense 通过后仍必须遵守：

- 游戏区域默认不放内容广告。
- 如未来要放，广告距离游戏边缘至少 150px。
- 禁止用广告包围 Play 按钮、游戏窗口、下载按钮、导航按钮。
- 禁止插屏广告页挡在游戏入口前。
- 禁止假下载按钮、假播放按钮。
- 禁止自动刷新广告。

### 8.4 素材和版权

提交前必须有素材清单：

| 素材 | 来源 | 是否自制/截图 | 是否可用 | 备注 |
|---|---|---|---|---|
| logo | 待填 | 待填 | 待填 | 不要冒充官方 |
| og cover | 待填 | 待填 | 待填 | 需要确认来源 |
| 文章截图 | 待填 | 待填 | 待填 | 优先用自制截图或示意图 |
| 游戏入口图片 | 待填 | 待填 | 待填 | 不压官方误导信息 |

### 8.5 Privacy 和儿童受众

Privacy 不只要求能打开，还要确认：

- 写清 Google 广告相关 cookie、web beacon、IP 地址或其他标识符的使用。
- 写清第三方可能因广告投放读取或设置 cookie。
- 写清本站的 general audience 立场。
- 如果未来确认站点或部分页面面向 13 岁以下儿童，必须按 COPPA 要求处理，不能默认开启兴趣广告。

## 9. AdSense 内容通过条件

重提 AdSense 前，必须满足这些内容条件：

| 条件 | 通过标准 |
|---|---|
| 全站 URL 清单 | 所有公开入口、sitemap URL、导航 URL、首页卡片 URL 都列出 |
| 低价值页处理 | 可见薄页已补强或撤下显眼入口 |
| 首页首屏 | 不是纯游戏入口，首屏可见真实攻略内容 |
| P0 文章 | 每篇达到第 7 节门槛 |
| 官方口径 | 全站无 `Polytrack.best Official` 等误导写法 |
| 游戏广告边界 | PRD 和页面方案不在游戏入口周围设计广告位 |
| Privacy | 已覆盖 Google 广告和 cookie 披露 |
| 素材 | 素材来源和使用边界已记录 |

## 10. SEO/GSC 可抓取确认条件

这些条件只证明 Google 能看到页面，不证明 AdSense 一定认可内容。

每个 P0 URL 都要验：

| 项目 | 通过标准 |
|---|---|
| HTTP | 返回 200 |
| URL | 使用最终 URL，不暴露 `.html` |
| robots | `index,follow` |
| canonical | 自引用 canonical，和最终 URL 一致 |
| sitemap | 可索引 P0 URL 在 sitemap 中 |
| noindex 配置 | `noindex:true` 必须 `inSitemap:false`；准备索引则两者必须一致 |
| Googlebot | Googlebot Smartphone UA 能拿到核心正文 |
| GSC | Live Test 可抓取；如有 URL Inspection，最后抓取日期晚于上线日期 |

## 11. 执行任务表

| 任务 | Owner | 文件范围 | 产物 | 完成证据 |
|---|---|---|---|---|
| URL 清单 | Codex 执行者 | 只读扫描 | 公开 URL 表 | 表中列出 robots/sitemap/入口来源 |
| 首页首屏 | Codex 执行者 | `index.html` | 攻略中心首屏 | 桌面/移动截图 |
| 博客入口 | Codex 执行者 | `blog/index.html` | 路径化博客首页 | 4 个路径区和入口策略 |
| P0 文章补强 | Codex 执行者 | P0 文章 | 达标正文 | 内容验收表 |
| noindex 入口处理 | Codex 执行者 | `blog/index.html`、必要文章 | 撤下或补强 | noindex 页面不再当门面 |
| 官方口径检查 | Codex 执行者 | 全站英文核心页 | 无误导官方关系 | grep 结果和人工检查 |
| 素材清单 | Codex 执行者 + 用户确认 | 文档 | 素材来源表 | 用户确认不侵权/不误导 |
| 验证 | Codex 执行者 | 命令和线上 URL | 验证记录 | 命令输出、URL 抽查 |
| 提交 AdSense | 用户 | AdSense 后台 | 重新提交 | 只在全部 gate 通过后执行 |

## 12. 允许改动范围

默认允许改：

- `index.html`
- `blog/index.html`
- `blog/track-builder-guide.html`
- `blog/polytrack-gameplay-tips.html`
- `blog/polytrack-unblocked-guide.html`
- `blog/ghost-racing-strategies.html`
- `blog/polytrack-world-records-guide.html`
- P0 入口处理需要涉及的 `blog/*.html`
- `data/i18n-pages.json`，仅限修正 `noindex` / `inSitemap` / 入口一致性
- `sitemap.xml`，仅限脚本生成后的必要变化
- `assets/cache-manifest.json`，仅限脚本生成后的必要变化
- `docs/ITERATION.md`
- 本 PRD

默认不允许改：

- 多语言目录页面，除非修复明确的入口一致性问题。
- 域名、部署平台、广告账号。
- 支付、用户系统、评论系统。
- 大范围视觉重构。

如果 `npm run build` 带出额外 HTML 改动，必须在交付时单独说明原因。不能静默提交一堆模板扩散改动。

## 13. 本地验证

改完页面后执行：

```bash
npm run typecheck
npm run build
npm run scan:garble
npm run serve
```

本地抽查：

- `/`
- `/blog/`
- `/blog/track-builder-guide`
- `/blog/polytrack-gameplay-tips`
- `/blog/polytrack-unblocked-guide`
- `/blog/ghost-racing-strategies`
- `/blog/polytrack-world-records-guide`
- `/sitemap.xml`
- `/ads.txt`

抽查要看：

- 桌面首屏。
- 移动首屏。
- 导航是否能用。
- noindex 薄页是否还被推荐。
- 是否出现乱码、冲突标记、错链。

## 14. 发布 SOP

发布顺序：

1. 开分支。
2. 完成页面和文档改动。
3. 本地通过第 13 节验证。
4. 开 PR。
5. 等 GitHub Actions Quality Gate 通过。
6. 合并到 `main`。
7. 等 GitHub Pages 部署完成。
8. 记录 workflow run / deployment URL。
9. 抽查线上 P0 URL、`sitemap.xml`、`ads.txt`。
10. GSC 对 P0 URL 做 live test / request indexing。
11. 更新 `docs/ITERATION.md`。
12. 全部 gate 通过后，再由用户进入 AdSense 后台重新提交。

## 15. 线上验收

线上 URL：

```text
https://polytrack.best/
https://polytrack.best/blog/
https://polytrack.best/blog/track-builder-guide
https://polytrack.best/blog/polytrack-gameplay-tips
https://polytrack.best/blog/polytrack-unblocked-guide
https://polytrack.best/blog/ghost-racing-strategies
https://polytrack.best/blog/polytrack-world-records-guide
https://polytrack.best/sitemap.xml
https://polytrack.best/ads.txt
```

必须全部满足：

- 返回 200。
- 可读。
- canonical 正确。
- robots 正确。
- 移动端不遮挡内容。
- 首屏不是纯游戏入口。
- P0 正文达到内容门槛。
- Googlebot Smartphone 能看到核心正文。

## 16. 回滚方案

如果上线后出现：

- 首页打不开。
- sitemap 生成错误。
- 核心 URL 404。
- canonical 大面积错误。
- 多语言目录被误改。
- 页面乱码。
- GitHub Pages 部署失败。

处理方式：

1. 立即停止 AdSense 重新提交。
2. 回退到上一次正常部署或 revert 对应 commit。
3. 记录影响 URL。
4. 在 `docs/ITERATION.md` 记录回滚时间、原因、影响、后续修复。
5. 修复后重新走第 13-15 节。

## 17. 重新提交 AdSense 的最低条件

只有同时满足以下条件，才允许重新提交：

- 第 9 节 AdSense 内容条件全部通过。
- 第 10 节 SEO/GSC 可抓取条件全部通过。
- 第 13 节本地验证通过。
- 第 15 节线上验收通过。
- `docs/ITERATION.md` 已记录本轮改动和证据。
- 用户确认素材和官方口径没有误导风险。

不再使用“等 3-7 天”作为单独提交理由。等待只是辅助，真正门槛是抓取证据和内容验收证据。

## 18. 一句话总结

```text
这份 PRD 的下一步不是直接去 AdSense 点重审，而是先把全站可见内容、官方口径、游戏广告边界、抓取一致性和执行证据都补齐。
```
