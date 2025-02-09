const moment = require("moment");
const fs = require("fs");
const path = require("path");
const RLog = require("rlog-js");
const rlog = new RLog({
  logFilePath: `./logs/${moment().utcOffset(8).format("YYYYMMDDHHmmss")}.log`,
  timezone: "Asia/Shanghai",
});

const retry = 10;
let tryTime = 1;

async function main() {
  rlog.log("Start to get news ...");
  try {
    let origin = await fetch("http://60s-api-cf.viki.moe/v2/60s")
      .then((res) => res.json())
      .then((res) => {
        return res;
      });
    if (!origin || !origin.data || origin.code != 200) {
      rlog.file.error(origin);
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

    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2));
    fs.writeFileSync("./latest.json", JSON.stringify(newsData, null, 2));

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
