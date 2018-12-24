const dotenv = require('dotenv')
// dotenv config!
dotenv.config({
  path: process.env.NODE_ENV === "development" ? ".env" : ".env.production"
});

const { createConnection } = require('typeorm');

const defaultConnectOptions = require("./src/ormConfig");

const csvFilePath = './data.csv';
const csv = require('csvtojson');
const json2csv = require('json2csv').Parser;
const single_process = require('./lib/ocr.js').single_process;
const fs = require('fs');

const imageFolder = './images/';
const textFolder = './ocr_text/';

let textFiles = fs.readdirSync(textFolder);
let count = 0;

fs.readdir(imageFolder, async (err, files) => {
  let files_length = files.length;

  for (let i = 0; i < files_length; i++) {
    try {
      let file = files[i];
      let filename = file.split('.')[0];
      if (i >= 2 && i < files_length) {
        if (!(`${filename}.txt` in textFiles)) {
          console.log(`Processing file ${filename}.png`);
          let text = await single_process(file);
          fs.writeFileSync(textFolder + filename + '.txt', text);

          let text_arr = text.split('\n').filter(item => item !== '');

          for (let j = 0; j < text_arr.length; j++) {
            if (text_arr[j] == 'TOTAL') {
              let date, LC, RC, match_result;
              match_result = text_arr[j + 1].match(
                /[0-9]{4}\.[0-9]{2}\.[0-9]{2}/,
              );

              if (match_result) {
                date = match_result[0];
              } else {
                j++;
                match_result = text_arr[j + 1].match(
                  /[0-9]{4}\.[0-9]{2}\.[0-9]{2}/,
                );
                if (match_result) {
                  date = match_result[0];
                } else {
                  console.log('Match Fail');
                  continue;
                }
              }
            } else {
              console.log('Match Fail(Needs opencv!)');
              continue;
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
});

csv()
  .fromFile(csvFilePath)
  .then(jsonObj => {
    const fields = Object.keys(jsonObj[1]);
    const opts = {fields};
    console.log(opts);
    try {
      const parser = new json2csv(opts);
      const csv = parser.parse(jsonObj);
      fs.writeFileSync(__dirname + '/output.csv', csv);
      console.log('successfully wrote csv data!');
    } catch (err) {
      console.log(err);
    }
  });

// db 연결
createConnection(defaultConnectOptions)
  .then(() => {
    app.start(appOptions, handleAppStart);
  })
  .catch(err => console.log(err));
