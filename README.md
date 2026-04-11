# EverydayNews V2

> 项目重制了，旧项目的备份位于 [RavelloH/news-archive](https://github.com/RavelloH/news-archive)

[![GitHub stars](https://img.shields.io/github/stars/RavelloH/EverydayNews?style=social)](https://github.com/RavelloH/EverydayNews/stargazers)
[![GitHub last commit](https://img.shields.io/github/last-commit/RavelloH/EverydayNews)](https://github.com/RavelloH/EverydayNews/commits/main)
[![License](https://img.shields.io/github/license/RavelloH/EverydayNews)](LICENSE)

> 新版的 EverydayNews，存储 2022/06/04 至今的所有每日 60s 新闻，以 JSON 格式存放，每日更新，自带搜索功能，可 RSS 订阅。

## ✨ 功能特点

| 功能 | 说明 |
|------|------|
| 📅 **历史数据** | 2022/06/04 至今完整数据 |
| 🔍 **全文搜索** | 内置静态搜索工具 |
| 📡 **RSS 订阅** | 支持 RSS 格式订阅 |
| 🌐 **多语言支持** | 中文 + 国际访问 |
| 🔄 **每日自动更新** | GitHub Actions 自动抓取 |

## 🚀 快速开始

### 在线预览

- 🌐 主站: [https://ravelloh.github.io/EverydayNews](https://ravelloh.github.io/EverydayNews)
- 🇨🇳 国内加速: [https://news.ravelloh.top](https://news.ravelloh.top)

### 自定义参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `date` | 指定日期 | `?date=20230101` |
| `style` | 布局风格 | `?style=clean` |
| `footer` | 页脚显示 | `?footer=none` |
| `backgroundColor` | 背景色 | `&backgroundColor=111111` |
| `textColor` | 文字色 | `&textColor=ffffff` |

### 使用示例

**简化布局**
```
https://ravelloh.github.io/EverydayNews?style=clean
```

**暗色模式 + 无页脚**
```
https://ravelloh.github.io/EverydayNews?style=clean&backgroundColor=111111&textColor=ffffff&footer=none
```

**嵌入 iframe（亮色）**
```html
<iframe src="https://ravelloh.github.io/EverydayNews?style=clean" 
        width="600" height="800" frameborder="0"></iframe>
```

**嵌入 iframe（暗色）**
```html
<iframe src="https://ravelloh.github.io/EverydayNews?style=clean&backgroundColor=111111&textColor=ffffff" 
        width="600" height="800" frameborder="0"></iframe>
```

## 📡 API 接口

### 获取最新新闻
```bash
curl https://ravelloh.github.io/EverydayNews/latest.json
curl https://news.ravelloh.top/latest.json
```

### 获取指定日期
```bash
curl https://news.ravelloh.top/data/2025/01/01.json
```

### 返回格式
```json
{
  "date": "2025/01/01",
  "content": [
    "新闻内容1...",
    "新闻内容2..."
  ]
}
```

## 🔗 RSS 订阅

| 订阅源 | 地址 |
|--------|------|
| GitHub Pages | `https://ravelloh.github.io/EverydayNews/rss.xml` |
| 国内镜像 | `https://news.ravelloh.top/rss.xml` |

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [vikiboss/60s](https://github.com/vikiboss/60s) | 数据来源 |
| [RavelloH/index-search](https://github.com/RavelloH/index-search) | 静态搜索 |
| GitHub Actions | 每日自动更新 |

## 📄 License

本项目基于 MIT License 开源。

---

README optimized with [Gingiris README Generator](https://gingiris.github.io/github-readme-generator/)
