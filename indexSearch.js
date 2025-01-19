const indexSearch = require("index-search");
const fs = require("fs");
const path = require("path");

const travel = (dir, callback) => {
  fs.readdirSync(dir).forEach((file) => {
    const pathname = path.join(dir, file);
    if (fs.statSync(pathname).isDirectory()) {
      travel(pathname, callback);
    } else {
      callback(pathname);
    }
  });
};
travel("./data", (pathname) => {
  let data = fs.readFileSync(pathname, "utf8");
  let json = JSON.parse(data);
  indexSearch.data.push({
    src: pathname.replace(/\\/g, "/").replaceAll("data/", "").replaceAll(".json", ""),
    content: json.content.join("\n"),
  });
});
indexSearch.index();
