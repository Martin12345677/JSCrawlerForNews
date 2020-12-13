import Crawler from "crawler";
import { crawlPeopleBbsCover } from "./crawl-people-bbs-cover";

const crawler = new Crawler({
  maxConnections: 10,
});

crawlPeopleBbsCover(crawler);
