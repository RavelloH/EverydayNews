const moment = require("moment");
const fs = require("fs");
const path = require("path");
const RLog = require("rlog-js");
const rlog = new RLog({
  logFilePath: `./logs/${moment().utcOffset(8).format("YYYYMMDDHHmmss")}.log`,
  timezone: "Asia/Shanghai",
});

const retry = 10000;
let tryTime = 1;

// 生成RSS的函数
function generateRSS(newsData) {
  rlog.log("Start to generate RSS ...");
  
  const { date, content } = newsData;
  const pubDate = moment(date, "YYYY/MM/DD").utcOffset(8).format("ddd, DD MMM YYYY HH:mm:ss ZZ");
  const buildDate = moment().utcOffset(8).format("ddd, DD MMM YYYY HH:mm:ss ZZ");
  
  // 转义XML特殊字符
  function escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  // 将所有新闻组合成一个HTML格式的描述
  let newsContent = '';
  content.forEach((item, index) => {
    newsContent += `${index + 1}. ${escapeXml(item)}<br/><br/>`;
  });
  
  const title = `${date}`;
  const guid = `everydaynews-${date.replaceAll('/', '-')}`;
  
  const rssItems = `
    <item>
      <title>${escapeXml(title)}</title>
      <description><![CDATA[ ${newsContent} ]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${guid}</guid>
      <link>https://news.ravelloh.top?date=${date.replaceAll("/","")}</link>
    </item>`;
  
  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>EverydayNews</title>
    <link>https://news.ravelloh.top</link>
    <description>https://news.ravelloh.top</description>
    <language>zh-CN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <ttl>1440</ttl>
    <generator>EverydayNews RSS Generator</generator>${rssItems}
  </channel>
</rss>`;

  try {
    fs.writeFileSync("./rss.xml", rssContent);
    rlog.success("RSS file generated successfully.");
  } catch (error) {
    rlog.error("Failed to generate RSS file:", error.message);
  }
}

async function main() {
  rlog.log("Start to get news ...");
  try {
    let origin = await fetch("https://60s.viki.moe/v2/60s")
      .then((res) => res.json())
      .then((res) => {
        return res;
      });
    if (!origin || !origin.data || origin.code != 200) {
      rlog.error(origin);
      throw new Error("Failed to get news.");
    }

    let { date, news } = origin.data;
    date = date.replaceAll("-", "/");
    rlog.success("Get news successfully.");
    rlog.log("Start to save news ...");

    rlog.log("Date:", date);
    rlog.log("News count:", news.length);

    let newsList = [];
    news.forEach((item) => {
      rlog.info("Processing:", item.substring(0, 16) + "...");
      newsList.push(item);
    });

    const newsData = {
      date: date,
      content: newsList,
    };
    const filePath = path.resolve(__dirname, `./data/${date}.json`);

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 检查新闻是否更新
    let shouldUpdateRSS = true;
    try {
      if (fs.existsSync("./latest.json")) {
        const latestData = JSON.parse(fs.readFileSync("./latest.json", "utf8"));
        if (latestData.date === date) {
          rlog.log("News date is the same as latest.json, skipping RSS generation.");
          shouldUpdateRSS = false;
        } else {
          rlog.log(`News date changed from ${latestData.date} to ${date}, will update RSS.`);
        }
      } else {
        rlog.log("latest.json not found, will create RSS.");
      }
    } catch (error) {
      rlog.warn("Failed to read latest.json:", error.message);
      rlog.log("Will proceed with RSS generation.");
    }

    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2));
    fs.writeFileSync("./latest.json", JSON.stringify(newsData, null, 2));

    // 只在新闻更新时生成RSS文件
    if (shouldUpdateRSS) {
      generateRSS(newsData);
    } else {
      rlog.log("Skipped RSS generation as news hasn't been updated.");
    }

    rlog.success("Save news successfully.");
  } catch (error) {
    rlog.error(error.message);
    tryTime++; // 增加重试次数
    if (tryTime > retry) {
      rlog.error("Failed to get news after " + retry + " retries.");
      rlog.log("End to retry.");
      // fetch(`https://api.day.app/${process.env.BARK_TOKEN}/[news-archive]${encodeURIComponent(error.message)}`);
      process.exit(1);
    }
    rlog.log(`Retry attempt ${tryTime} of ${retry}...`);
    main();
  }
}

rlog.log("Modules loaded successfully.");
main();
