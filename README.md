# EverydayNews V2
> 项目重制了，旧项目的备份位于[RavelloH/news-archive](https://github.com/RavelloH/news-archive)

新版的EverydayNews，存储2022/06/04至今的所有每日60s新闻，以JSON格式存放，每日更新，自带搜索功能，可RSS订阅。  
预览：[https://ravelloh.github.io/EverydayNews](https://ravelloh.github.io/EverydayNews)  
国内加速地址：[https://news.ravelloh.top](https://news.ravelloh.top)

![image](https://github.com/user-attachments/assets/d6189b72-f5ff-4f2b-a31f-53e5277d7921)


大幅简化了页面，你可以使用查询参数自定义页面：
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
目前正在使用 [vikiboss/60s](https://github.com/vikiboss/60s) 作为数据源，  
使用 [RavelloH/index-search](https://github.com/RavelloH/index-search)作为静态搜索工具，
使用Github Actions进行每日更新。



