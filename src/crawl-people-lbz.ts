import Crawler from "crawler";
import mysql from './lib/mysql';
import getRange from './utils/range';
import { writeFile } from 'fs';
import { resolve } from 'path';
import { readFileSync } from 'fs';

let urls: Array<string> = [];

export function crawlPeopleLbzCover() {
  const crawler = new Crawler({
    callback: (err, res, done) => {
      const { $ } = res;
      const covers = $('#box > div.main > div > h3').get().forEach((v, index) => {
        urls.push(`${res.options.uri}-${index+1}`);
        console.log(`push>>>>>>>${res.options.uri}-${index+1}`);
      }) ;

      done();
    }
  });
  const task = [];
  let date = new Date('1963-03-07T03:24:00');
  while (date.getFullYear() < 2004) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    task.push(`http://www.laoziliao.net/rmrb/${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`);
    date = new Date(date.getTime() + 60*60*24*1000);
  }
  crawler.queue(task);
  crawler.on('drain', () => {
    const path = resolve('./data/urls.txt');
    writeFile(path, urls.join('\n'), () => {
      console.log('write ok');
    });
  });
}

export function crawlPeopleLbzPage() {
  let newsId = 302029;
  const crawler = new Crawler({
    callback: (err, res, done) => {
      const { $, options } = res;
      const { uri } = options;
      const titles = $('.main h2').get().map(title => title.children[0]?.data);
      const articles = $('.main .article').get().map(artitle => artitle.children.reduce((p: string, c: any) => p + (c.data || '')).slice(15));
      titles.forEach((title, index) => {
        const artitle = articles[index];
        mysql.add('news', {
          id: newsId,
          commentNum: 0,
          thumbNum: 0,
          title,
          content: artitle,
          time: uri.split('/')[2].slice(0, 10),
          author: '人民日报',
          url: uri,
        });
        newsId += 1;
      });
      console.log(`omg id: ${newsId} >>>>>>> ${uri} done`);
      done();
    },
  });

  const uris = readFileSync('./data/urls.txt').toString('utf-8').split('\n').slice(32760);

  crawler.queue(uris);

};
