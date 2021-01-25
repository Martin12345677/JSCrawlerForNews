import Crawler from "crawler";
import mysql from './lib/mysql';
import getRange from './utils/range';
import { writeFile } from 'fs';
import { resolve } from 'path';
import { readFileSync } from 'fs';

let num = 0;

export function crawlPeopleNewsCover(since_id: any) {
  const crawler = new Crawler({
    callback: (err, res, done) => {
      const { body } = res;
      const { data }: any = JSON.parse(`${body}`);
      let { since_id: nextId } = data.cardlistInfo || '';
      if (!nextId) {
        console.log(data)
        nextId = data.cards[9].mblog.id;
      }
      const { cards: news } = data;
      let time = '';
      news.forEach((n: any) => {
        if (n.card_type === 9) {
          num += 1;
          const {
            bid: id,
            raw_text,
            comments_count: commentNum,
            attitudes_count: thumbNum,
            created_at,
          } = n.mblog;
          time = created_at;
          let title = '';
          let content = raw_text;
          const text = /【(.*)】(.*)/.exec(raw_text);
          if (text && text[1] && text[2]) {
            [, title, content] = text;
          }
          mysql.add('newsWB', {
            id,
            commentNum,
            thumbNum,
            title,
            content,
            time: `${created_at} when ${new Date().toUTCString()}`,
            author: '人民日报',
            url: n.scheme,
          });
        };
      })
      console.log(`finish, ready to ${nextId} time: ${time} total: ${num}`);
      setTimeout(() => {
        crawler.queue(`https://m.weibo.cn/api/container/getIndex?uid=2803301701&t=0&luicode=10000011&lfid=100103type%3D1%26q%3D%E4%BA%BA%E6%B0%91%E6%97%A5%E6%8A%A5&type=uid&value=2803301701&containerid=1076032803301701&since_id=${nextId}`);
      }, 500);
      done();
    }
  });
  const task = `https://m.weibo.cn/api/container/getIndex?uid=2803301701&t=0&luicode=10000011&lfid=100103type%3D1%26q%3D%E4%BA%BA%E6%B0%91%E6%97%A5%E6%8A%A5&type=uid&value=2803301701&containerid=1076032803301701&since_id=${since_id}`;
  crawler.queue(task);
}

async function getComment(cralwer: Crawler, id: string, mid: string, maxId='') {
  await cralwer.queue({
    uri: `https://m.weibo.cn/comments/hotflow?id=${mid}&mid=${mid}&max_id_type=0${maxId ? `&max_id=${maxId}` : ''}`,
    callback(err, res, done) {
      const {body} = res;
      try {
        const {data: comments, max_id} = JSON.parse(`${body}`).data;

        console.log(max_id)
        if (comments && comments.length > 0) {
          comments.forEach((comment: any) => {
            const {
              id: commentId,
              text,
              like_count: thumbNum,
              created_at: time,
              user, 
            } = comment;
            mysql.add('comment', {
              id: commentId,
              content: text.replace(/<[^<>]+>/g,""),
              thumbNum,
              time,
              author: user.id,
            });
            mysql.add('commentsOfNews', {
              commentId,
              newsId: id,
            });
            if (comments.length === 20) {
              getComment(cralwer, id, mid, max_id);
            }
          });
        }
      } catch(e) {
        console.log(e.message);
      }
      done();
    }
  })
}

export async function crawlPeopleNewsPage() {
  const news: any = await mysql.getAll('newsWB');

  const crawler = new Crawler({
    maxConnections: 1,
  });
  let index = 0;
  setInterval(() => {
    const n = news[index];
    crawler.queue({
      uri: `https://m.weibo.cn/statuses/show?id=${n.id}`,
      callback: async (err, res, done) => {
        const {body} = res;
        try{
          const { id } = JSON.parse(`${body}`).data;
          console.log(id);
          await getComment(crawler, n.id, id);
        } catch(e) {
          console.log(e.message);
        }
        console.log(index++);
        done();
      },
    });
  }, 1000);




  // crawler.queue(news.map((n: any) => n.url));

};
