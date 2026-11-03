# EverydayNews V2
> 项目重制了，旧项目的备份位于[RavelloH/news-archive](https://github.com/RavelloH/news-archive)

新版的EverydayNews，存储2022/06/04至今的所有每日60s新闻，以JSON格式存放，每日更新，自带搜索功能，可RSS订阅。  
预览：[https://ravelloh.github.io/EverydayNews](https://ravelloh.github.io/EverydayNews)  
国内加速地址：[https://news.ravelloh.top](https://news.ravelloh.top)

![image](https://github.com/user-attachments/assets/d6189b72-f5ff-4f2b-a31f-53e5277d7921)


页面保留了原有的查询参数，同时重构为 React/Vite 界面。你可以使用查询参数自定义页面：
- date: https://ravelloh.github.io/EverydayNews?date=20230101
- style: https://ravelloh.github.io/EverydayNews?style=clean
- footer: https://ravelloh.github.io/EverydayNews?footer=none
- color: https://ravelloh.github.io/EverydayNews?backgroundColor=111111&textColor=ffffff

例如:
- 简化布局: https://ravelloh.github.io/EverydayNews?style=clean
- 仅显示新闻: https://ravelloh.github.io/EverydayNews?style=clean&footer=none
- 暗色模式: https://ravelloh.github.io/EverydayNews?style=clean&backgroundColor=111111&textColor=ffffff

非常适合使用iframe挂载(亮色/暗色)
```html
<iframe src="https://ravelloh.github.io/EverydayNews?style=clean" width="600" height="800" frameborder="0"></iframe>
```

```html
<iframe src="https://ravelloh.github.io/EverydayNews?style=clean&backgroundColor=111111&textColor=ffffff" width="600" height="800" frameborder="0"></iframe>
```
你也可以在上面链接最后加入`&footer=none`来去除页脚:
```html
<iframe src="https://ravelloh.github.io/EverydayNews?style=clean&footer=none" width="600" height="800" frameborder="0"></iframe>
```

```html
<iframe src="https://ravelloh.github.io/EverydayNews?style=clean&backgroundColor=111111&textColor=ffffff&footer=none" width="600" height="800" frameborder="0"></iframe>
```

## API
与v1相同，仍提供API用于获取某日期的新闻:
- 最新:
  - `https://ravelloh.github.io/EverydayNews/latest.json`
  - `https://news.ravelloh.top/latest.json`
- 特定日期:
  - `https://ravelloh.github.io/EverydayNews/data/YYYY/MM/DD.json`
  - `https://news.ravelloh.top/data/YYYY/MM/DD.json`
  - 例: `https://news.ravelloh.top/data/2025/01/01.json`

 内容格式:
 ```json
{
  "date": "2025/01/01",
  "content": [
    "xxxxxxxxxx",
    "xxxxxxxxxx",
    "xxxxxxxxxx",
  ]
}
```

## RSS
RSS订阅地址:
- `https://ravelloh.github.io/EverydayNews/rss.xml`
- `https://news.ravelloh.top/rss.xml`

## 依赖
目前正在使用 [vikiboss/60s-static-host](https://github.com/vikiboss/60s-static-host) 的静态 JSON 作为数据源，
使用 [RavelloH/index-search](https://github.com/RavelloH/index-search)作为静态搜索工具，
使用Github Actions进行每日更新。

## 本地开发
```bash
npm install
npm run dev
```

生产构建使用 `npm run build`，会生成包含页面、新闻数据和搜索索引的 `dist` 目录。

## Cloudflare Workers 部署

本项目使用 Workers Static Assets 部署静态网站，不需要独立后端 Worker。`wrangler.jsonc` 中已配置 `everydaynews` Worker 名称与 `dist/` 静态文件目录。未启用 SPA 回退，以便不存在的新闻数据路径返回真正的 404，而非站点首页。

在 Cloudflare Workers → Settings → Build 中设置：

- **Root directory**：`/`
- **Production branch**：`main`
- **Build command**：`npm run build`
- **Deploy command**：`npm run deploy`

Cloudflare 构建会依次执行 Vite 构建、静态搜索索引生成与数据复制。务必使用完整的 `npm run build`，不能仅执行 `vite build`，否则新闻 JSON、RSS 和搜索资源将不会完整出现在 `dist/`。

本地手动部署：

```bash
npm ci
npm run build
npm run deploy
```
