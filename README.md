# EverydayNews V2
> 项目重制了，旧项目的备份位于[RavelloH/news-archive](https://github.com/RavelloH/news-archive)

新版的EverydayNews，存储2022/06/04至今的所有每日60s新闻，以JSON格式存放，每日更新，自带搜索功能。[https://ravelloh.github.io/EverydayNews](https://ravelloh.github.io/EverydayNews)

![image](https://github.com/user-attachments/assets/3132960a-354e-4fec-b29b-8f96338490d3)

大幅简化了页面，你可以使用查询参数自定义页面：
- date: https://ravelloh.github.io/EverydayNews?date=20230101
- style: https://ravelloh.github.io/EverydayNews?style=clean
- footer: https://ravelloh.github.io/EverydayNews?footrt=none
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



