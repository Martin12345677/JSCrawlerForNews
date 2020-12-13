import Crawler from "crawler";

export function crawlPeopleBbsCover(crawler: Crawler) {
  crawler.queue({
    uri: 'http://bbs1.people.com.cn/board/1/1_1.html',
    callback: (error, res, done) => {
      console.log(res);
      done();
    }
  });
  return crawler;
}