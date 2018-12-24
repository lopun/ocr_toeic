const { ConnectionOptions , EntitySchema} = require("typeorm");

const defaultConnectOptions= {
  type: "mysql",
  database: "ocr",
  synchronize: true,
  // 모든 로깅을 보게된다.
  logging: true,
  entities: [
    new EntitySchema(require('./entities/Toeic'))
  ],
  host: process.env.DB_ENDPOINT || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || ""
};

module.exports = defaultConnectOptions;
