const dotenv = require('dotenv');
// dotenv config!
dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env' : '.env.production',
});

const {createConnection, EntitySchema} = require('typeorm');

const defaultConnectOptions = require('./src/ormConfig');

// db 연결

const csvFilePath = './data.csv';
const csv = require('csvtojson');
const json2csv = require('json2csv').Parser;
const single_process = require('./lib/ocr.js').single_process;
const fs = require('fs');

const imageFolder = './images/';
const textFolder = './ocr_text/';

let textFiles = fs.readdirSync(textFolder);
let count = 0;


let files = fs.readdir(imageFolder, async (err, files) => {
  // DB Connection
  const connection = await createConnection(defaultConnectOptions);
  console.log('DB Connected');

  const TOEIC = connection.getRepository('Toeic');

  let files_length = files.length;

  for (let i = 0; i < files_length; i++) {
    try {
      let file = files[i];
      let filename = file.split('.')[0];
      if (i >= 2 && i < files_length) {
        let found_toeic = await TOEIC.findOne({file});

        if (found_toeic && found_toeic.ok === 0) {
          console.log(`Please manually update ${file}.`);
          continue;
        }

        if (found_toeic && found_toeic.ok === 1) {
          console.log(`${file} was successfully updated!`);
          continue;
        }

        console.log(`Processing file ${filename}.png`);
        let text = await single_process(file);
        fs.writeFileSync(textFolder + filename + '.txt', text);

        let text_arr = text.split('\n').filter(item => item !== '');

        let already_saved = 0;

        for (let j = 0; j < text_arr.length; j++) {
          if (text_arr[j] == 'TOTAL') {
            let date, lc, rc, match_result;
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
            lc = text_arr[j + 2];
            rc = text_arr[j + 3];
            if ((rc.match(/[0-9]{0,3}/), lc.match(/[0-9]{0,3}/))) {
              const created_toeic = await TOEIC.save({
                file,
                date,
                lc: parseInt(lc),
                rc: parseInt(rc),
                ok: 1,
              });
              console.log(created_toeic);
              console.log(`${file} TOEIC Successfully Saved!`);
            }
          } else {
            const false_toeic = await TOEIC.save({
              file,
              date: '0000.00.00',
              lc: 000,
              rc: 000,
              ok: 0,
            });
            console.log(false_toeic);
            console.log(`Please manually update ${file}.`);
          }
          break;
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  try {
    let total_toeic_list = await TOEIC.find();
    let saved_toeic_list = await TOEIC.find({ok: 1});
    let total_toeic_list_length = total_toeic_list.length;
    let saved_toeic_list_length = saved_toeic_list.length;

    // Correcteness Test
    console.log(
      `Correcteness is ${parseInt(
        (saved_toeic_list_length / total_toeic_list_length) * 100,
      )}%`,
    );
  } catch (err) {
    console.log(err);
  }
});

// csv()
// .fromFile(csvFilePath)
// .then(jsonObj => {
// const fields = Object.keys(jsonObj[1]);
// const opts = {fields};
// try {
// const parser = new json2csv(opts);
// const csv = parser.parse(jsonObj);
// fs.writeFileSync(__dirname + '/output.csv', csv);
// console.log('successfully wrote csv data!');
// } catch (err) {
// console.log(err);
// }
// });
