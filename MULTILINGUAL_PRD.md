# Polytrack.best Multilingual PRD

版本：v1.0
状态：Ready for Development
最后更新：2026-06-07
适用范围：Polytrack.best 静态 HTML 多语言改造 Phase 1

## 1. 背景

Polytrack.best 现在主要是英文静态站。首页、博客、法律页都直接写成 HTML 文件。

当前站点已经出现一个问题：`blog/custom-polytrack-tracks.html` 是中文页面，但它放在默认英文路径 `/blog/custom-polytrack-tracks` 下。多语言改造前，必须先把 URL 规则定清楚，不然后面会变成同一个地址一会儿中文、一会儿英文。

本 PRD 的目标是把站点改成可长期维护的多语言静态站。最新决策：不做中文多语言。第一阶段先上线西语 `/es`，底层规则必须一次性支持后续继续加葡语、日语、韩语、德语、法语等语言。

## 2. 当前事实

- 项目是静态 HTML 站，不是 Next.js、Astro 或 WordPress。
- 构建脚本在 `package.json`，当前 `build` 主要做 Tailwind CSS 构建和缓存清单生成。
- 公共头部和底部来自 `header.html`、`footer.html`，再由 `scripts/apply-layout.mjs` 批量套到页面里。
- `scripts/apply-layout.mjs` 现在只默认处理 `*.html` 和 `blog/*.html`，不处理 `es/**/*.html`、`pt-br/**/*.html` 等语言目录。
- `scripts/apply-layout.mjs` 会强制重写 canonical，并且域名写死为 `https://polytrack.best`。
- `sitemap.xml` 现在是手写单语言结构，没有 `hreflang`。
- 项目里存在 `_redirects`，线上 `/play`、`/header.html` 已按 `_redirects` 返回 301，说明它才是当前有效的跳转入口。
- 真实站响应头显示 `server: cloudflare`，所以部署/缓存/跳转验收按 Cloudflare 静态托管口径处理。
- 项目里也存在 `vercel.json`，但当前站点不部署在 Vercel，不能把它当成真实上线规则。
- `assets/cache-manifest.json` 里已有 `/blog//` 双斜杠路径，需要先修。
- `robots.txt` 允许抓取，并声明了 sitemap。

## 3. 目标

第一阶段上线目标：

- 保留英文现有 URL，不搬家，不伤已有排名。
- 新增西语路径，统一放在 `/es` 下。
- 每个西语页面都有独立 URL、title、description、canonical、hreflang、结构化数据和内链。
- 修掉现有中文内容占用英文路径的问题：公开站点不再新增中文 URL。
- 让构建脚本能稳定处理多语言页面，不靠手工反复改。
- 必须建立统一 `data/i18n-pages.json`，作为 canonical、hreflang、sitemap、语言切换、缓存清单的唯一数据源。

长期目标：

- 后续可以继续加 `/es`、`/pt-br`、`/ja`、`/ko`、`/de`、`/fr` 等语言。
- 新增语言时，只需要补页面和配置，不需要重新改一遍底层规则。

目标语言池：

| 优先级 | 语言 | 路径前缀 | `html lang` / `hreflang` | 说明 |
|---|---|---|---|---|
| 默认 | English | 无，继续用现有路径 | `en` | 现有主站，不迁移 |
| P0 | Spanish | `/es` | `es` | 第一阶段上线，游戏站常见大语种 |
| P1 | Brazilian Portuguese | `/pt-br` | `pt-BR` | 巴西游戏用户多，建议第二阶段评估 |
| P2 | Japanese | `/ja` | `ja` | 适合游戏攻略，但需要高质量本地化 |
| P2 | Korean | `/ko` | `ko` | 适合游戏攻略，但需要高质量本地化 |
| P3 | German | `/de` | `de` | 后续看 GSC/GA 再决定 |
| P3 | French | `/fr` | `fr` | 后续看 GSC/GA 再决定 |

说明：

- P0 是已经决定要做的第一批。
- P1/P2/P3 是 PRD 预留的多语言能力，不代表马上批量上线。
- 第二批语言要根据 GSC/GA 真实国家、语言、搜索词数据决定，不靠感觉猜。

## 4. 非目标

第一阶段不做这些事：

- 不把英文根路径 `/` 改成 `/en/`。
- 不用 `?lang=es` 这种参数做语言。
- 不按浏览器语言或 IP 自动强制跳转。
- 不一次性翻译全站所有文章、所有语言。
- 不把机器翻译内容不检查就上线。
- 不做用户账号、评论、社区功能。

## 5. URL 规则

英文继续使用现有路径。

新增语言统一使用语言前缀。英文不加 `/en`。

| 页面 | 英文路径 | 西语路径 | 葡语路径 | 日语路径 |
|---|---|---|---|---|
| 首页 | `/` | `/es/` | `/pt-br/` | `/ja/` |
| 博客列表 | `/blog/` | `/es/blog/` | `/pt-br/blog/` | `/ja/blog/` |
| 文章 | `/blog/track-builder-guide` | `/es/blog/track-builder-guide` | `/pt-br/blog/track-builder-guide` | `/ja/blog/track-builder-guide` |
| About | `/about-us` | `/es/about-us` | `/pt-br/about-us` | `/ja/about-us` |
| Legal | `/legal-documents` | `/es/legal-documents` | `/pt-br/legal-documents` | `/ja/legal-documents` |
| Privacy | `/privacy-policy` | `/es/privacy-policy` | `/pt-br/privacy-policy` | `/ja/privacy-policy` |
| Terms | `/terms-of-service` | `/es/terms-of-service` | `/pt-br/terms-of-service` | `/ja/terms-of-service` |
| DMCA | `/dmca` | `/es/dmca` | `/pt-br/dmca` | `/ja/dmca` |

特殊处理：

- 现在的 `/blog/custom-polytrack-tracks` 是中文内容，但它占用了默认英文 URL。
- 改造后不新增中文公开目录。
- 必须从 `/blog/custom-polytrack-tracks` 移除中文正文，并补成完整英文版。
- 现有中文正文可以保存在本地备份或草稿里，但不能发布、不能进 sitemap、不能进 hreflang。
- 如果暂时补不了英文版，这篇文章不能加入任何 hreflang 互译组。

尾斜杠规则：

- 真实托管平台会把目录首页自动跳到带 `/` 的地址，所以目录首页最终 URL 必须带尾斜杠。
- 根首页最终 URL 是 `/`。
- 目录首页最终 URL 带尾斜杠，例如 `/blog/`、`/es/`、`/es/blog/`、`/pt-br/`、`/pt-br/blog/`。
- 普通 HTML 叶子页最终 URL 不带尾斜杠，例如 `/about-us`、`/es/about-us`、`/blog/track-builder-guide`。
- `/es` 必须 301/308 到 `/es/`。
- `/es/blog` 必须 301/308 到 `/es/blog/`。
- 不允许再写 `/es/` 到 `/es`、`/es/blog/` 到 `/es/blog` 这种反向跳转。
- canonical、sitemap、hreflang、og:url 必须全部使用最终 URL。
- 如果线上某个地址会 301/308 到另一个地址，PRD 和生成脚本必须使用跳转后的最终地址。

物理文件和线上 URL 映射：

| 文件 | 线上最终 URL |
|---|---|
| `index.html` | `/` |
| `blog/index.html` | `/blog/` |
| `es/index.html` | `/es/` |
| `es/blog/index.html` | `/es/blog/` |
| `es/blog/example.html` | `/es/blog/example` |
| `about-us.html` | `/about-us` |
| `es/about-us.html` | `/es/about-us` |

`/en` 规则：

- 英文不使用 `/en` 前缀。
- `/en/*` 统一 301 到无前缀英文路径。
- 示例：`/en/blog/track-builder-guide` 301 到 `/blog/track-builder-guide`。
- `/en` 301 到 `/`。

## 6. 第一阶段页面范围

第一阶段拆成 P0-A 和 P0-B。时间不够时，先保 P0-A 技术闭环，不要为了凑页面数量牺牲质量。

### P0-A：技术闭环必做

先用少量页面打通完整链路：页面、导航、canonical、hreflang、sitemap、cache manifest、Service Worker、真实托管平台规则、GSC 验证。

P0-A 使用真实线上验证，不只做本地或 Preview 验证。

- P0-A 先在现有英文 URL 基础上，只新增 P0-A 可索引西语页到 sitemap。
- P0-A 上线后提交 GSC 验证。
- P0-B 完成后再更新 sitemap。
- 不等 P0-B 才验证基础链路。

| 类型 | 英文文件 | 西语目标 | 为什么先做 |
|---|---|---|---|
| 首页 | `index.html` | `es/index.html` | 西语入口和 Play Now |
| 博客列表 | `blog/index.html` | `es/blog/index.html` | 西语文章入口 |
| About | `about-us.html` | `es/about-us.html` | 导航和信任页闭环 |
| 法律占位页 | `legal-documents.html` | `es/legal-documents.html` | footer 不断链，先 noindex |
| 隐私占位页 | `privacy-policy.html` | `es/privacy-policy.html` | footer 不断链，先 noindex |
| 条款占位页 | `terms-of-service.html` | `es/terms-of-service.html` | footer 不断链，先 noindex |
| DMCA 占位页 | `dmca.html` | `es/dmca.html` | footer 不断链，先 noindex |
| 自定义赛道文章英文修复 | `blog/custom-polytrack-tracks.html` | 仍为英文路径 | 清除错放中文内容，补完整英文版 |
| 赛道编辑器文章 | `blog/track-builder-guide.html` | `es/blog/track-builder-guide.html` | 高意图攻略页 |

### P0-B：技术闭环通过后补齐

| 类型 | 英文文件 | 西语目标 |
|---|---|---|
| Legal 完整页 | `legal-documents.html` | `es/legal-documents.html` |
| Privacy 完整页 | `privacy-policy.html` | `es/privacy-policy.html` |
| Terms 完整页 | `terms-of-service.html` | `es/terms-of-service.html` |
| DMCA 完整页 | `dmca.html` | `es/dmca.html` |
| 打不开/连接问题文章 | `blog/polytrack-unblocked-guide.html` | `es/blog/polytrack-unblocked-guide.html` |
| 玩法技巧文章 | `blog/polytrack-gameplay-tips.html` | `es/blog/polytrack-gameplay-tips.html` |
| 手机和手柄文章 | `blog/mobile-controls-setup.html` | `es/blog/mobile-controls-setup.html` |
| 性能优化文章 | `blog/performance-optimization-tips.html` | `es/blog/performance-optimization-tips.html` |
| 自定义赛道文章西语版 | `blog/custom-polytrack-tracks.html` | `es/blog/custom-polytrack-tracks.html` |

P1 后续再做：

- `blog/ghost-racing-strategies.html`
- `blog/community-tracks-showcase.html`
- `blog/polytrack-world-records-guide.html`

说明：

- `polytrack-world-records-guide` 容易过期，除非准备维护数据，否则不要第一批优先做。
- `about-us` 加入 P0，避免西语导航和 footer 出现缺口。

## 7. 后续语言 rollout 计划

多语言不是一次铺满。每一批都要先做小范围，再看数据。

| 阶段 | 语言 | 页面范围 | 进入下一阶段条件 |
|---|---|---|---|
| Phase 1 | `es` | P0-A 先上线验证，P0-B 通过后补齐 | 西语页能正常收录，GSC 没有 hreflang/canonical 大错 |
| Phase 2 | `pt-BR` | 首页、博客列表、3-5 篇高意图文章 | GSC/GA 显示巴西流量值得做 |
| Phase 3 | `ja`、`ko` | 首页、博客列表、3-5 篇攻略文章 | 有对应地区搜索流量，且能保证人工本地化 |
| Phase 4 | `de`、`fr` | 看数据决定 | 有稳定展示或点击，再开 |

每新增一种语言，必须一起补：

- 页面文件。
- 语言切换映射。
- canonical。
- `hreflang`。
- sitemap alternate。
- JSON-LD 的 `inLanguage`。
- 该语言的导航、footer、cookie/法律文案。
- 本地化术语表。

不要只复制第一阶段西语流程。每个语言都要按当地用户搜索方式改标题和正文。

第二批语言不能直接把西语关键词表翻译过去。每种新语言都必须重新做当地语言关键词映射表，再写 title、H1、description 和正文。

## 8. 任务拆分清单

| 模块 | 文件 | 任务 |
|---|---|---|
| i18n 配置 | `data/i18n-pages.json` | 新增语言、页面、状态、URL、sitemap、语言切换配置 |
| Layout | `scripts/apply-layout.mjs` | 支持多语言路径、canonical、hreflang、语言感知 Header/Footer |
| Sitemap | `scripts/gen-sitemap.mjs` | 从 `data/i18n-pages.json` 生成 sitemap 和 alternate |
| i18n 检查 | `scripts/check-i18n.mjs` | 检查 HTML 多语言规则、canonical、hreflang、语言切换器 |
| Sitemap 检查 | `scripts/check-sitemap-urls.mjs` | 检查 sitemap URL、状态码、alternate、lastmod、x-default |
| Cache 检查 | `scripts/check-cache-manifest.mjs` | 检查 cache manifest URL、重复项、最终路径、HTML 缓存规则 |
| 部署平台规则 | `_redirects`，必要时补 Cloudflare 规则 | `/en/*` 301、`/es` 到 `/es/`、`/es/blog` 到 `/es/blog/`、HTML 缓存头；不能默认用 Vercel |
| Header/Footer | `header.html`、`footer.html` | 加语言切换、西语链接、法律占位链接策略 |
| 页面 | `es/**/*.html` | 新增 P0-A / P0-B 西语页面 |
| 内容 | `es/**/*.html` | 本地化标题、H1、description、正文、FAQ、内链 |
| 验证 | GSC / GA4 / 本地 build | P0-A 线上验证、URL Inspection、英文页防误伤 |

## 9. 页面 SEO 要求

每个语言页面必须满足：

- `<html lang>` 正确，比如 `en`、`es`、`pt-BR`、`ja`。
- title 是当前语言。
- meta description 是当前语言。
- canonical 指向自己的最终干净 URL。
- 不允许非英文页 canonical 到英文页。
- Open Graph 的 `og:url` 指向当前语言页。
- Twitter Card 的标题和描述是当前语言。
- JSON-LD 的 URL、`@id`、`mainEntityOfPage` 指向当前语言页。
- JSON-LD 增加或修正 `inLanguage`。
- 各语言页面正文、导航、FAQ、按钮文案都要使用当前语言。
- 各语言页面内链优先指向同语言页面。
- 英文页内链优先指向英文页。

`hreflang` 要求：

每组互译页面都要互相声明。

两语言示例：

```html
<link rel="alternate" hreflang="en" href="https://polytrack.best/blog/track-builder-guide" />
<link rel="alternate" hreflang="es" href="https://polytrack.best/es/blog/track-builder-guide" />
<link rel="alternate" hreflang="x-default" href="https://polytrack.best/blog/track-builder-guide" />
```

多语言扩展示例：

```html
<link rel="alternate" hreflang="en" href="https://polytrack.best/blog/track-builder-guide" />
<link rel="alternate" hreflang="es" href="https://polytrack.best/es/blog/track-builder-guide" />
<link rel="alternate" hreflang="pt-BR" href="https://polytrack.best/pt-br/blog/track-builder-guide" />
<link rel="alternate" hreflang="ja" href="https://polytrack.best/ja/blog/track-builder-guide" />
<link rel="alternate" hreflang="x-default" href="https://polytrack.best/blog/track-builder-guide" />
```

规则：

- 英文页要指向英文自己和已上线的其他语言版本。
- 西语页、葡语页、日语页也都要指回同一组里所有已上线版本。
- 没有某个语言版本的页面，不要硬加该语言 `hreflang`。
- `x-default` 第一阶段指向英文默认页。

## 10. Sitemap 要求

`sitemap.xml` 不能继续只维护单语言普通 URL。

第一阶段推荐新增生成脚本，而不是继续手写。

要求：

- sitemap 包含所有可索引语言 URL。
- sitemap URL 使用最终线上 URL，不带 `.html`。
- sitemap 不能包含 404、跳转 URL、双斜杠 URL。
- sitemap 增加 `xmlns:xhtml`。
- 每组互译 URL 都写 `xhtml:link rel="alternate"`。
- `lastmod` 和真实页面更新时间一致。
- `/blog/custom-polytrack-tracks` 的 sitemap `lastmod` 与页面 JSON-LD `dateModified` 不一致，需要修。

## 11. 导航和语言切换

Header 要求：

- 桌面导航加入语言切换。
- 手机菜单也加入语言切换。
- 语言名称用文字，不只用国旗。
- 第一阶段语言切换器只展示已经上线的 `English` 和 `Español`。
- `Português (BR)`、`日本語` 等未上线语言不得出现可点击入口。
- 未上线语言如果要展示，只能是 disabled 状态，并且不能出现在 sitemap 或 hreflang。
- 英文首页 header 顶部要展示语言切换入口，让用户能发现西语页。
- 西语入口第一阶段只放在语言切换器和 footer 语言切换里，不做自动弹窗或强提示。
- Footer 也要提供语言切换入口。
- 西语页可以显示 English version 链接，指向对应英文页面。
- 在 `/es/...` 页面点击 Home，应去 `/es/`。
- 在 `/es/blog/...` 页面点击 Blog，应去 `/es/blog/`。
- 在 `/es/...` 页面点击 Play Now，应去 `/es/#play`。

Footer 要求：

- Footer 法律页链接要跟当前语言走。
- 西语页 footer 指向 `/es/legal-documents`、`/es/privacy-policy`、`/es/terms-of-service`、`/es/dmca`。
- 英文页保持现有英文路径。
- Cookie Settings、Do Not Sell My Info 这类合规文案，西语页要有清楚翻译。
- 即使西语法律页是 `noindex`，footer 仍可链接它。
- `noindex` 西语法律页顶部或底部必须标注：本页为西语辅助说明，英文版本为准。
- `noindex` 西语法律占位页 title / H1 不要伪装成正式完整法律页，应明确是“西语辅助说明”或“临时说明”。
- `noindex` 西语法律页 canonical 仍指向自己，不要 canonical 到英文页。
- `noindex` 西语法律页不进入 sitemap，不加入 hreflang 互译组。
- 如果英文法律页是 index、西语法律页是 noindex，英文法律页 head 里不要声明西语 noindex 页为 hreflang alternate。
- 如果西语法律页真实存在，语言切换器可以展示西语入口，但该西语页必须标注“西语辅助说明，英文版本为准”。

语言切换规则：

- 用户在文章页切语言，应尽量跳到对应语言的同一篇文章。
- 如果同一篇文章有对应语言版本，切到对应文章。
- 如果没有对应语言版本，但该语言博客列表已上线，切到该语言博客列表。
- 如果该语言连博客列表都没上线，语言切换器不展示该语言。
- 不允许跳到 404。
- 不允许硬跳英文首页，除非是 `x-default` 或用户主动选择 English。
- 不要所有语言切换都跳首页。
- 所有语言首页的游戏区域必须有统一锚点 `id="play"`，例如 `/es/#play`、`/pt-br/#play` 都能定位到游戏区。

## 12. 内容要求

统一术语：

| 英文 | 西语建议 |
|---|---|
| Polytrack | Polytrack，不翻译 |
| Track Builder | editor de pistas |
| Ghost Racing | carrera fantasma |
| PB | mejor marca personal |
| WR | récord mundial |
| Custom Tracks | pistas personalizadas |
| Unblocked | desbloqueado / sin bloqueo，按页面语境处理 |

内容质量要求：

- 不要逐字翻译。
- 西语标题要像西语用户会搜索的说法。
- 西语 description 要自然，不要堆关键词。
- 法律页不能只靠机器翻译，必须人工看一遍。
- 游戏玩法类文章要保留实际操作步骤。
- 如果英文内容里有过期信息，翻译前先更新原文。
- `/blog/custom-polytrack-tracks` 的英文版需要按英文搜索意图重写 title、H1、description 和正文。
- `/blog/custom-polytrack-tracks` 英文版不允许只是中文文章直译。

人工内容验收清单：

每篇西语文章上线前必须人工检查：

- 标题是不是西语用户会搜的说法。
- 开头 100 字是否直接回答用户问题。
- 是否保留实际操作步骤。
- 是否有英文残留。
- 是否有机器翻译腔。
- 内链是否优先指向西语页面。
- CTA 是否自然。
- FAQ 是否是西语用户真实问题。
- 是否避免同一个西语关键词过度堆叠。
- 是否没有把英文页面里的过期信息原样翻过来。

西语关键词映射表：

| 西语 URL | 西语主关键词 | 次关键词 | Title 要求 | H1 要求 | Description 要求 |
|---|---|---|---|---|---|
| `/es/` | jugar Polytrack online | Polytrack juego、Polytrack gratis | 包含 “jugar Polytrack online” 或自然等价表达 | 说明这是西语入口 | 说明免费、浏览器、赛道编辑器 |
| `/es/blog/track-builder-guide` | editor de pistas Polytrack | pistas personalizadas、crear pistas Polytrack | 突出 “editor de pistas” | 说明从零建赛道 | 说明搭建、测试、分享 |
| `/es/blog/custom-polytrack-tracks` | pistas personalizadas Polytrack | códigos de pistas、compartir pistas | 突出“pistas personalizadas” | 说明如何创建和分享赛道 | 说明编辑器、代码导入、分享流程 |
| `/es/blog/polytrack-unblocked-guide` | Polytrack no carga | Polytrack bloqueado、Polytrack no funciona | 围绕“no carga/no funciona” | 直接回答打不开怎么办 | 给出排查步骤，不堆词 |
| `/es/blog/polytrack-gameplay-tips` | cómo jugar Polytrack | saltos、derrapes、mejorar tiempos | 围绕“cómo jugar/trucos” | 说明进阶玩法技巧 | 面向想提升成绩的玩家 |
| `/es/blog/mobile-controls-setup` | Polytrack en móvil | controles táctiles、mando | 围绕手机和手柄 | 说明手机/手柄控制设置 | 给出设置和手感建议 |
| `/es/blog/performance-optimization-tips` | Polytrack lento | bajones de FPS、WebGL、carga lenta | 围绕“lento/FPS/carga” | 说明性能优化方法 | 给出浏览器和设备优化步骤 |

西语搜索意图示例：

- como jugar Polytrack
- Polytrack no carga
- Polytrack pistas personalizadas
- Polytrack editor de pistas
- Polytrack en movil

葡语搜索意图示例：

- como jogar Polytrack
- Polytrack nao carrega
- Polytrack pistas personalizadas
- editor de pistas Polytrack
- Polytrack travando

日语搜索意图示例：

- Polytrack 遊び方
- Polytrack 読み込まない
- Polytrack コース作成
- Polytrack スマホ
- Polytrack 重い

## 13. 技术实现要求

必须新增统一语言配置：`data/i18n-pages.json`。

所有 canonical、hreflang、sitemap、语言切换、缓存清单都必须以它为唯一数据源。

配置至少包含：

- canonical host。
- x-default 语言。
- 语言列表。
- 每种语言的路径前缀。
- 每种语言的 `hreflang` 值。
- 每个页面的英文 canonical path。
- 每个页面有哪些语言版本已经上线。
- 每个页面的 `lastmod`。
- 每个页面是否可索引。
- 每个页面的物理文件路径。
- 每个页面的最终线上 URL。
- 每个页面是否进入 sitemap。
- 每个页面的结构化数据类型。
- 每个翻译版本的发布状态。
- 每个翻译版本是否 `noindex`。
- 每个翻译版本是否出现在语言切换器。

后续 sitemap、hreflang、语言切换、缓存清单都从这个配置读，避免手工漏。

最小结构示例：

```json
{
  "canonicalHost": "https://polytrack.best",
  "xDefault": "en",
  "languages": {
    "en": {
      "prefix": "",
      "hreflang": "en",
      "htmlLang": "en",
      "label": "English",
      "enabled": true
    },
    "es": {
      "prefix": "/es",
      "hreflang": "es",
      "htmlLang": "es",
      "label": "Español",
      "enabled": true
    },
    "pt-BR": {
      "prefix": "/pt-br",
      "hreflang": "pt-BR",
      "htmlLang": "pt-BR",
      "label": "Português (BR)",
      "enabled": false
    }
  },
  "pages": [
    {
      "id": "track-builder-guide",
      "type": "blog",
      "schemaType": "BlogPosting",
      "indexable": true,
      "inSitemap": true,
      "lastmod": "2026-06-07",
      "translations": {
        "en": {
          "file": "blog/track-builder-guide.html",
          "url": "/blog/track-builder-guide",
          "title": "Polytrack Track Builder Guide",
          "status": "published",
          "noindex": false,
          "includeInLanguageSwitcher": true
        },
        "es": {
          "file": "es/blog/track-builder-guide.html",
          "url": "/es/blog/track-builder-guide",
          "title": "Guía del editor de pistas de Polytrack",
          "status": "published",
          "noindex": false,
          "includeInLanguageSwitcher": true
        }
      }
    }
  ]
}
```

实现规则：

- `languages.*.enabled=false` 的语言不能出现在可点击语言切换器、sitemap、hreflang。
- `pages[].translations` 里没有某语言，就表示该页面没有该语言版本。
- page 级 `indexable=false` 时，所有语言版本都不可索引。
- page 级 `inSitemap=false` 时，所有语言版本都不进入 sitemap。
- translation 级 `noindex=true` 只影响当前语言版本。
- translation 级 `status` 支持 `draft`、`published`、`disabled`。
- translation 级 `status!="published"` 时，该语言不进 sitemap、不进 hreflang、不进语言切换器。
- translation 级规则优先于 page 级默认值。
- sitemap 只使用 `enabled=true`、`status=published`、`noindex=false`、`inSitemap=true` 且存在 translation 的语言。
- hreflang 只使用 `enabled=true`、`status=published`、`noindex=false` 且存在 translation 的语言。
- 语言切换器只使用 `enabled=true`、`status=published`、`includeInLanguageSwitcher=true` 且存在 translation 的语言。
- 页面最终 URL 必须取 `translations.*.url`，不要在多个脚本里各自拼 URL。
- `x-default` 必须从配置读取，不允许脚本自己猜。
- canonical host 必须从配置读取，不允许继续写死在多个脚本里。

必须改造：

### 13.1 `scripts/apply-layout.mjs`

要求：

- 支持 `es/**/*.html`、`pt-br/**/*.html`、`ja/**/*.html` 等语言目录。
- 支持根据文件路径判断语言。
- 支持语言感知 canonical。
- 支持插入 `hreflang`。
- 不要覆盖已有正确的多语言 head 信息。
- 保持 dry-run 和 `--write` 行为。
- 必须使用 `data/i18n-pages.json` 计算 canonical 和 hreflang。
- 只能替换受控区域，例如 `<!-- HEADER_START -->` 到 `<!-- HEADER_END -->`。
- 只能替换 head 中由脚本管理的标签。
- 不得重写正文内容。
- dry-run 必须输出变更摘要。
- `--write` 前必须先 review dry-run 输出；写入后必须看 `git diff`。

### 13.2 `scripts/gen-cache-manifest.mjs`

要求：

- 扫描多语言 HTML。
- 修掉 `/blog//` 这种双斜杠。
- 生成的 `assets/cache-manifest.json` 不能有重复路径。
- 西语、葡语、日语等已上线页面都要进入缓存清单。

`check:cache` 检查项：

- cache manifest 不能有重复 URL。
- cache manifest 不能有 `.html`。
- cache manifest 不能有双斜杠。
- cache manifest 不能包含未发布语言页面。
- HTML 页面不能进入长期 precache；如果以后缓存清单记录页面 URL，目录首页必须使用 `/es/`、`/es/blog/` 这类最终 URL。
- HTML 页面不能进入长期 precache 列表。
- cache version 必须在 manifest 内容变化后更新。

### 13.3 新增 sitemap 生成能力

建议新增：

- `scripts/gen-sitemap.mjs`
- 或把 sitemap 生成加入现有构建链。

要求：

- 从统一页面配置生成 sitemap。
- 自动生成 `hreflang`。
- 自动处理 `lastmod`。
- 避免手写漏项。
- sitemap 生成后必须再检查 URL 是否和页面 canonical 完全一致。

`check:sitemap` 检查项：

- sitemap URL 必须全部是最终 URL。
- sitemap URL 不能是 301。
- sitemap URL 不能是 404。
- sitemap URL 不能是 `noindex` 页面。
- sitemap URL 不能包含未发布语言。
- sitemap URL 不能包含 `noindex` 法律占位页。
- sitemap URL 不能出现 `.html`。
- sitemap URL 不能出现双斜杠。
- sitemap 不能收录 `/es`、`/es/blog` 这类会跳转的非最终 URL。
- 每个 sitemap URL 的 `xhtml:link` alternate 必须和页面 HTML hreflang 一致。
- `lastmod` 必须和 `data/i18n-pages.json` 一致。
- `x-default` 必须指向配置里的默认语言页面。

### 13.4 新增 i18n 检查能力

必须新增 `scripts/check-i18n.mjs`，并作为 build 阻断项。

边界：

- `check:i18n` 不做复杂语义判断。
- 它只做低成本、可自动化检查。
- 西语页可以检查 title/H1/description 是否明显不是英文模板，例如是否含有常见西语词或本地化关键词。
- 可以检查是否残留常见英文模板词。
- 可以检查是否存在大量英文路径链接。
- 内容质量仍必须人工检查，不能只靠脚本判断。

检查项：

- 所有 `/es` 页面 `<html lang="es">`。
- 所有 `/pt-br` 页面 `<html lang="pt-BR">`，仅在葡语上线后启用。
- 西语页 canonical 不能指向英文页。
- title、description、H1 必须是当前语言，不允许整页仍是英文模板。
- Header/Footer 链接必须优先指向同语言路径。
- 每组 HTML 页面里的 hreflang 必须互相返回，并且要和 `data/i18n-pages.json` 对齐。
- canonical、hreflang、og:url 不能出现 `.html`。
- canonical、hreflang、og:url 不能出现双斜杠。
- URL 尾斜杠必须符合最终 URL 规则。
- 未上线语言不能出现在 hreflang。
- 未上线语言不能出现在可点击语言切换器。
- `dateModified` 和配置里的 `lastmod` 必须一致。

不属于 `check:i18n` 的检查：

- sitemap 文件内容不在 `check:i18n` 里检查，因为 sitemap 此时还没生成。
- cache manifest 不在 `check:i18n` 里检查，因为 cache manifest 此时还没生成。
- sitemap 检查归 `check:sitemap`。
- cache manifest 检查归 `check:cache`。
- `check:sitemap` 负责检查 sitemap 里的 `xhtml:link` alternate，并且要和 `data/i18n-pages.json` 对齐。

### 13.5 `header.html` 和 `footer.html`

要求：

- 支持语言感知链接。
- 或改为脚本注入时按语言替换链接。
- 不要让西语页公共导航跳回英文路径。
- 语言切换器只展示已上线语言。

### 13.6 `_redirects` 和 Cloudflare 路由规则

要求：

- 当前线上已有 `_redirects` 生效证据，第一阶段先把多语言 301 写入 `_redirects`。
- 如果 Cloudflare 控制台另有重定向规则，也要和 `_redirects` 保持一致。
- 不要默认把 Vercel 当成部署平台。
- 补多语言路径缓存规则，例如 `/es/(.*)`、`/pt-br/(.*)`。
- 确保 `/es/...` HTML 页面和英文页面一样走 `must-revalidate`。
- 保持最终 URL 只有一个版本。
- 增加 `/en/:path*` 到无前缀英文路径的 301。

`_redirects` 规则：

```txt
/en              /           301
/en/*            /:splat     301
/blog            /blog/      301
/es              /es/        301
/es/blog         /es/blog/   301
```

注意：

- 要确认 `_redirects` 的匹配顺序，老规则不能覆盖多语言规则。
- `/en/blog/x` 必须最终到 `/blog/x`，不能变成 `/blog/x.html` 或错误目录页。
- redirect 规则不能影响 `/es`、`/pt-br` 等真实语言目录。

### 13.7 `package.json`

建议新增命令：

```json
{
  "scripts": {
    "build": "npm run build-css-prod && node scripts/apply-layout.mjs --write && npm run check:i18n && node scripts/gen-sitemap.mjs && npm run check:sitemap && node scripts/gen-cache-manifest.mjs && npm run check:cache",
    "check:i18n": "node scripts/check-i18n.mjs",
    "check:sitemap": "node scripts/check-sitemap-urls.mjs",
    "check:cache": "node scripts/check-cache-manifest.mjs"
  }
}
```

构建顺序必须是：

1. 生成 CSS。
2. 套 Header/Footer，并写 canonical、hreflang。
3. 跑 `check:i18n`。
4. 生成 sitemap。
5. 检查 sitemap URL。
6. 生成 cache manifest。
7. 检查 cache manifest。

不要先生成 sitemap 再跑 `apply-layout`，否则 sitemap 可能基于旧页面信息生成。

检查职责：

- `check:i18n` 只检查页面 HTML、canonical、hreflang、语言、内链、语言切换器。
- `check:sitemap` 只在 `gen-sitemap` 后检查 sitemap。
- `check:cache` 只在 `gen-cache-manifest` 后检查缓存清单。

### 13.8 Service Worker 和缓存

HTML 页面不要长期强缓存。

要求：

- 多语言 HTML 使用 network-first 或 `must-revalidate`。
- 第一阶段多语言上线时，不建议把 HTML 页面加入 precache。
- HTML 可以记录在 cache manifest 里，但 Service Worker 不应长期预缓存 HTML。
- JS、CSS、图片可以长期缓存，但必须有清晰版本或内容 hash。
- `assets/cache-manifest.json` 变化后，Service Worker cache version 必须变化。
- 多语言上线后，不能让用户长期看到旧 canonical、旧 hreflang、旧导航。

### 13.9 JSON-LD 规则

要求：

- 首页使用 `WebSite` / `WebPage` / `VideoGame`，并设置正确 `inLanguage`。
- 博客文章优先使用 `BlogPosting` 或 `Article`，同一类文章保持一致。
- 普通页面使用 `WebPage`。
- 如有面包屑，使用 `BreadcrumbList`。
- `datePublished`、`dateModified` 必须和 sitemap `lastmod`、`data/i18n-pages.json` 对齐。
- `@id`、`url`、`mainEntityOfPage` 必须使用当前语言最终 URL。
- `publisher`、`author` 保持统一，不要每个语言乱改。

### 13.10 法律页 index 规则

西语法律页如果是完整人工校对版本：

- 可以 index。
- 可以进入 sitemap。
- 可以加入 hreflang 互译组。

西语法律页如果只是临时英文版或未经校对的机器翻译版：

- 必须 `noindex`。
- 不进入 sitemap。
- 不加入 hreflang 互译组。

## 14. 验收标准

本地验收：

- `npm ci` 成功。
- `npm run check:layout` 成功。
- `npm run build` 成功。
- 新增 `npm run check:i18n` 后也要成功。
- `git status` 只包含本次多语言相关文件。

页面验收：

- `/` 仍然是英文首页。
- `/es/` 是西语首页。
- 后续如果上线 `/pt-br`、`/ja`，它们也必须是对应语言首页。
- `/blog/` 是英文博客列表。
- `/es/blog/` 是西语博客列表。
- 每个 P0 西语页面都能打开。
- 页面没有明显乱码。
- Header/Footer 链接语言正确。
- Play Now 在西语页跳到 `/es/#play`。
- 第一阶段语言切换器只显示 English 和 Español。
- 未上线语言没有可点击入口。
- 所有语言首页都有 `id="play"`，`/es/#play` 能定位到游戏区。
- 访问 `/es` 必须 301/308 到 `/es/`。
- 访问 `/es/blog` 必须 301/308 到 `/es/blog/`。
- canonical、sitemap、hreflang、og:url、内链只使用最终 URL。
- sitemap 只能收录最终版本，不收录会跳转的版本。

SEO 验收：

- 每页 canonical 指向自己。
- 每页 `hreflang` 完整互指。
- 每页 `x-default` 存在。
- sitemap 包含英文和所有已上线语言 URL。
- sitemap 没有 `.html`、双斜杠、404、跳转 URL。
- sitemap、canonical、hreflang、og:url 使用完全一致的最终 URL。
- robots 没挡住 `/es/`。
- JSON-LD 的 URL 和语言正确。
- 西语页 title、description、H1 都是西语。
- `/en/*` 会 301 到无前缀英文路径。
- 法律页 index/noindex 符合人工校对状态。

英文页面防误伤验收：

- 英文页面 canonical 与改造前保持一致。
- 英文页面 title / description 不因多语言改造被批量覆盖。
- 英文页面正文不被非英文内容污染。
- 英文 sitemap URL 数量和核心路径不减少。
- `/blog/custom-polytrack-tracks` 补英文版后，页面内容必须是英文。
- 英文首页 `/` 不跳转到 `/en` 或 `/es`。
- 英文博客 `/blog/` 不跳转到 `/en/blog`。
- 英文页面 OG URL、JSON-LD URL 不被错误加上语言前缀。

`custom-polytrack-tracks` 英文修复验收：

- 旧中文正文必须从 `/blog/custom-polytrack-tracks` 移除。
- `/blog/custom-polytrack-tracks` 上线后必须是完整英文内容，不允许中英混合。
- 不创建中文公开版本。
- 如后续创建 `/es/blog/custom-polytrack-tracks`，必须是西语本地化内容，不是中文内容搬家。
- 如果 GSC 已经收录旧中文英文路径，上线后观察搜索结果标题是否更新。

缓存和部署验收：

- `assets/cache-manifest.json` 没有 `/blog//` 或 `/es//`。
- Service Worker 更新后能打开西语页。
- HTML 页面不长期强缓存。
- 第一阶段 HTML 不加入长期 precache。
- 更新 canonical、hreflang、导航后，刷新页面不会继续看到旧 head 信息。
- 真实线上 URL 规则和本地一致。
- 清缓存后访问英文和西语页都正常。

上线后验收：

- 上线后 48 小时：GSC 能读取新 sitemap，没有 sitemap 解析错误。
- 上线后 7 天：GSC 没有大面积 canonical 错误、重复网页错误。
- 上线后 14 天：核心西语页面开始被发现或收录。
- 上线后 30 天：评估 `/es` 展示量、点击量、索引情况。
- 如果 30 天内西语页几乎无展示，暂停扩第二语言，先优化西语内容质量。
- GA4 能看到 `/es/` 和 `/es/blog/` 流量。
- `game_load` 事件在西语首页仍然能触发。
- Core Web Vitals 没明显变差。
- P0-A 上线后就提交“英文 URL + P0-A 可索引西语页”的 sitemap 并做 GSC 验证。
- P0-B 完成后更新 sitemap，并再次提交或请求 GSC 重新读取。

GSC URL Inspection 抽查：

上线后抽查这些 URL：

- `/es/`
- `/es/blog/`
- `/es/blog/track-builder-guide`
- `/blog/custom-polytrack-tracks`

每个 URL 检查：

- Google 选择的 canonical 是否和页面 self canonical 一致。
- 页面是否可抓取。
- 是否被 robots 阻挡。
- 是否检测到 hreflang 问题。
- 页面渲染是否正常。

P0-A 进入 P0-B 的硬门槛：

- `npm run build` 通过。
- `/es/`、`/es/blog/`、`/es/blog/track-builder-guide` 都能 200 打开。
- 西语法律占位页能打开，且为 `noindex`。
- sitemap 被 GSC 成功读取。
- GSC URL Inspection 没有发现 canonical 严重错误。
- 英文核心页面没有被误改。
- Service Worker 没有缓存旧 HTML。
- 语言切换器没有 404。
- `/es`、`/es/blog` 已 301/308 到带尾斜杠最终 URL。

## 15. 实施顺序

### 第 1 步：先修底层规则

- 确定 URL 规则。
- 新增 `data/i18n-pages.json`。
- 修 `gen-cache-manifest` 双斜杠。
- 改 `apply-layout` 支持语言目录。
- 新增 sitemap 生成脚本。
- 新增 i18n 检查脚本。
- 补 `/en/*` 到无前缀英文路径的 301。

### 第 2 步：完成 P0-A 页面

- 新增 `es/index.html`。
- 新增 `es/blog/index.html`。
- 新增 `es/about-us.html`。
- 新增 `es/legal-documents.html`、`es/privacy-policy.html`、`es/terms-of-service.html`、`es/dmca.html` 占位页。
- 西语法律占位页必须 `noindex`，不进 sitemap，不进 hreflang，但 footer 可链接。
- 从 `blog/custom-polytrack-tracks.html` 移除中文内容，公开站点不新增中文版本。
- 为 `/blog/custom-polytrack-tracks` 补英文版。
- 第一阶段不做 `/blog/custom-polytrack-tracks` 到其他语言页的 301。
- 新增 `es/blog/track-builder-guide.html`。
- 补 canonical、hreflang、sitemap、内链。
- Header/Footer 支持西语导航。

### 第 3 步：P0-A 本地验收和线上小范围验证

- 跑本地检查。
- 本地预览。
- 抽查 `/es/`、`/es/blog/`、`/es/blog/track-builder-guide`、`/blog/custom-polytrack-tracks`。
- 确认 canonical、hreflang、sitemap、cache manifest、语言切换都正确。
- 上线 P0-A。
- 提交“英文 URL + P0-A 可索引西语页”的 sitemap 到 GSC。
- 用 GSC URL Inspection 抽查 P0-A URL。
- P0-A 不通过，不进入 P0-B。

### 第 4 步：P0-B 补齐内容页

- `polytrack-unblocked-guide`
- `polytrack-gameplay-tips`
- `mobile-controls-setup`
- `performance-optimization-tips`

### 第 5 步：P0-B 补齐法律页

- `legal-documents`
- `privacy-policy`
- `terms-of-service`
- `dmca`

### 第 6 步：P0-B 统一验证并上线

- 跑本地检查。
- 本地预览。
- 线上抽查。
- 更新 sitemap。
- 提交更新后的 sitemap 到 GSC。

### 第 7 步：扩展第二批语言

- 根据 GSC/GA 选 `pt-BR`、`ja`、`ko` 或其他语言。
- 先做首页、博客列表、3-5 篇高意图文章。
- 用同一套配置和脚本生成 canonical、hreflang、sitemap。
- 验收通过后再继续扩文章。

## 16. 风险

| 风险 | 后果 | 处理方式 |
|---|---|---|
| 同一个 URL 混用中英文 | Google 判断混乱，用户也迷糊 | `/blog/custom-polytrack-tracks` 改回英文，不发布中文目录 |
| canonical 被脚本覆盖 | 语言页可能被合并到英文页 | 先改 `apply-layout` |
| sitemap 手工维护 | 很容易漏页面或漏 hreflang | 新增生成脚本 |
| Header/Footer 不懂语言 | 西语页点击后跳回英文 | 做语言感知链接 |
| Service Worker 缓存旧页 | 用户看到旧内容 | 构建时更新缓存清单版本 |
| 法律页翻译错误 | 合规风险 | 法律页单独人工复查 |
| 一次性翻太多 | 质量低，排查困难 | 第一阶段只做 `es` P0 |
| 多语言配置分散 | 新增语言时大量漏项 | 建立统一 i18n 页面配置 |
| 不同语言质量不稳 | 搜索表现差，用户不信任 | 每种语言都做本地化检查 |
| 语言切换器展示未上线语言 | 用户点到 404 | 只展示已上线语言 |
| build 顺序错 | sitemap 或缓存基于旧页面 | build 必须先 apply-layout，再检查，再生成 sitemap |
| `/en` 产生重复英文页 | 重复内容和 canonical 混乱 | `/en/*` 统一 301 到无前缀英文 |
| 多语言脚本误伤英文页 | 老排名受影响 | 英文页防误伤验收必须通过 |

## 17. 回滚方案

多语言改造会动 build、sitemap、canonical、cache、真实托管平台路由。上线前必须准备回滚。

必须保留：

- 改造前 `sitemap.xml` 备份。
- 改造前 `assets/cache-manifest.json` 备份。
- 改造前 `_redirects` 备份。
- 如果 Cloudflare 控制台有手写规则，也要保留规则截图。
- 改造前 `header.html`、`footer.html` 备份。

回滚规则：

- 如果 `/es` 上线后出现大面积 404，先下线西语入口，不改英文 URL。
- 如果 Service Worker 缓存错乱，先更新 cache version 并移除错误预缓存路径。
- 如果 `apply-layout` 生成错误 canonical，立即回滚脚本、sitemap 和受影响 HTML。
- 如果 sitemap 生成错误，立即恢复旧 sitemap，并暂停提交新 sitemap。
- 英文页面不可因西语回滚发生 URL、canonical、title、description 改动。
- 回滚优先保护英文老页面。
- 回滚后重新跑 `npm run build` 和关键 URL 抽查。
- 如果西语目录出现严重问题，可以短期在 `_redirects` 或 Cloudflare 规则里把 `/es/:path*` 302 到 `/` 或维护页。
- `/es` 临时 302 只用于事故处理，不可长期保留，尤其是在已提交 GSC 后。
- 临时开关不得影响英文路径。

上线前 Diff 审查清单：

- 英文页面 title 是否被改。
- 英文页面 canonical 是否被改。
- 英文页面 JSON-LD URL 是否被改。
- sitemap 是否意外删除英文 URL。
- cache manifest 是否出现重复路径。
- header/footer 是否把英文页面链接改成西语。
- `/blog/custom-polytrack-tracks` 是否真的变成英文内容。
- `/es/`、`/es/blog/` 是否只出现在应出现的西语链接和 sitemap 中。

## 18. 决策记录

- 英文现有路径不迁移。
- 不做中文多语言。
- 第一阶段上线西语 `/es`，架构要支持多语言扩展。
- 后续语言使用 `/pt-br`、`/ja`、`/ko`、`/de`、`/fr` 等前缀。
- 必须建立 `data/i18n-pages.json`，不再作为待确认项。
- canonical、sitemap、hreflang、og:url 必须使用完全一致的最终 URL。
- 第一阶段语言切换器只展示 English 和 Español。
- `/blog/custom-polytrack-tracks` 必须补英文版，中文内容从公开站点移除，不新增中文目录。
- `about-us` 加入 P0。
- `/en/*` 统一 301 到无前缀英文路径。
- HTML 页面不长期强缓存。
- `check:i18n` 作为 build 阻断项，检查不通过不能部署。
- 不做自动强制跳转。
- 使用页面级 `hreflang`，sitemap 也生成 alternate。
- `x-default` 第一阶段指向英文默认页。
- 先改脚本和规则，再批量铺页面。

## 19. 待确认问题

- 西语法律页是否能达到人工校对质量。如果不能，先 `noindex`，不进 sitemap。这个问题不影响 P0-A，但影响 P0-B 法律页是否 index。
- 第二批语言是 `pt-BR`，还是先做 `ja` / `ko`，需要等 GSC/GA 看现有国家和语言流量后再决定。
