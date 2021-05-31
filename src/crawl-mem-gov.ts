import Crawler from "crawler";
import mysql from './lib/mysql';
import getRange from './utils/range';
import { writeFile } from 'fs';
import { resolve } from 'path';

let urls: Array<string> = [];

export function crawlPeopleBbsCover() {
  const crawler = new Crawler({
    callback: (err, res, done) => {
      const { $ } = res;
      const hrefs = $('body > div.rel > div.outer > div.replayWrap.scrollFlag > ul > li > p > a').get().map((a) => a.attribs.href);
      urls = urls.concat(hrefs);
      done();
    }
  });
  const task = getRange(80).map((v, index) => {
    return `http://bbs1.people.com.cn/board/1/1_${index + 1}.html`;
  });
  crawler.queue(task);
  crawler.on('drain', () => {
    const path = resolve('./data/urls.txt');
    writeFile(path, urls.join('\n'), () => {
      console.log('write ok');
    });
  });
}

export function crawlPeopleBbsPage() {
  const commentId = 0;
  const newsId = 0;
  const crawler = new Crawler({
    callback: (err, res, done) => {
      const { $ } = res;
      const info = $('body > div.rel > div.outer > div.navBar > div.articleInfo.clearfix > p > span.float_l.mT10').text();
      const time = info.split(')')[2].substr(2);
      const comments = $('body > div.rel > div.outer > div.replayWrap > ul > li > ul > li > p');
      const commentNum = comments.length;
      
      const { content_path: contentPath } = $('.article').get()[0].attribs;
      const textUrl = `http://bbs1.people.com.cn/txt_new/${contentPath.substr(32)}`;

      console.log({
        info,
        time,
        textUrl,
      });
      done();
    },
  });
  crawler.queue('http://bbs1.people.com.cn/post/1/1/2/177186105.html');

};
