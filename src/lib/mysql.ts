import { createConnection, Connection, format } from 'mysql';
import config from '../config';

class Mysql {
  private sql: Connection;
  constructor() {
    this.sql = createConnection({
      host: 'localhost',
      user: 'root',
      password: config.rootPsd,
      database: 'news',
    });
  }
  public add(table: string, content : {
    [key: string]: any,
  }) {
    const keys = Object.keys(content);
    const values = keys.map(key => content[key]);
    const tpt = keys.map(() => '?').join(',');
    const sql = format(`insert into ${table} (${keys.join(',')}) values (${tpt})`, values);
    // this.sql.query(sql, (err, result) => {
    //   console.log(result || err);
    // });
  }

  public close() {
    this.sql.end();
  }

  public reconnect() {
    this.sql.connect(err => console.log(err));
  }
}

const mysql = new Mysql();

export default mysql;
