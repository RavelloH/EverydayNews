const moment = require("moment");
const fs = require("fs");
const path = require("path");
const RLog = require("rlog-js");
const rlog = new RLog({
  logFilePath: `./logs/${moment().utcOffset(8).format("YYYYMMDDHHmmss")}.log`,
  timezone: "Asia/Shanghai",
});

const STATIC_DATA_URL =
  "https://raw.githubusercontent.com/vikiboss/60s-static-host/main/static/60s";
const FETCH_RETRIES = 3;
const FETCH_TIMEOUT_MS = 15000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(date) {
  return moment(date).utcOffset(8).format("YYYY-MM-DD");
}

async function fetchStaticNews(date) {
  const url = `${STATIC_DATA_URL}/${date}.json`;
  let lastError;

  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Static news request failed with HTTP ${response.status}.`);
      }

      // raw.githubusercontent.com currently serves these JSON files as text/plain.
      const raw = await response.text();
      const data = JSON.parse(raw);

      if (!data || typeof data.date !== "string" || !Array.isArray(data.news)) {
        throw new Error("Static news response has an invalid format.");
      }

      return data;
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_RETRIES) {
        const delay = attempt * 2000;
        rlog.warn(
          `Failed to fetch ${date} (attempt ${attempt}/${FETCH_RETRIES}), retrying in ${delay}ms:`,
          error.message,
        );
        await sleep(delay);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function getNews() {
  const today = formatDate();
  const yesterday = formatDate(moment().subtract(1, "day"));

  rlog.log("Start to get news from static host ...");
  const todayData = await fetchStaticNews(today);
  if (todayData) {
    return todayData;
  }

  rlog.warn(`Today's static news file (${today}) is not available, trying ${yesterday}.`);
  const yesterdayData = await fetchStaticNews(yesterday);
  if (yesterdayData) {
    return yesterdayData;
  }

  throw new Error(`No static news file is available for ${today} or ${yesterday}.`);
}

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
  try {
    const origin = await getNews();
    let { date, news } = origin;
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
    process.exitCode = 1;
  }
}

rlog.log("Modules loaded successfully.");
main();
