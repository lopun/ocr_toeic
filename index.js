const dotenv = require('dotenv');
// dotenv config!
dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env' : '.env.production',
});

const {createConnection, EntitySchema} = require('typeorm');

const defaultConnectOptions = require('./src/ormConfig');

const csvFilePath = './data.csv';
const csv = require('csvtojson');
// const json2csv = require('json2csv').Parser;
const fs = require('fs');

const imageFolder = './images/';
const textFolder = './ocr_text/';

const single_process = require('./lib/single_process.js');

let textFiles = fs.readdirSync(textFolder);

const count_pointer = {
  value: 0,
};

let file_index = 0;
let process_limit = 20;

// Run single_process upto 10
const process_flagging = async (files, files_length, TOEIC) => {
  if (count_pointer.value >= process_limit) {
    setTimeout(
      () => process_flagging(files, files_length, TOEIC),
      100,
    ); /* this checks the flag every 100 milliseconds*/
  } else {
    if (file_index >= 2 && file_index < files_length) {
      count_pointer.value++;
      single_process(files[file_index], TOEIC, count_pointer);
    }

    file_index++;
    if (count_pointer.value <= process_limit) {
      process_flagging(files, files_length, TOEIC);
    }

    return;
  }
};

const correctness_flagging = async (files, files_length, TOEIC) => {
  if (file_index < files_length - 2) {
    setTimeout(() => correctness_flagging(files, files_length, TOEIC), 100);
  } else {
    try {
      let total_toeic_list = await TOEIC.find();
      let saved_toeic_list = await TOEIC.find({ok: 1});
      let total_toeic_list_length = total_toeic_list.length;
      let saved_toeic_list_length = saved_toeic_list.length;

      // Correctness Test
      console.log(
        `Correctness is ${parseInt(
          (saved_toeic_list_length / total_toeic_list_length) * 100,
        )}%`
      );
      console.log("The program exits in 5 seconds")
      setTimeout(function() {
        return process.exit(22);
      }, 5000);
    } catch (err) {
      console.log(err);
    }
  }
};

createConnection(defaultConnectOptions).then(connection => {
  console.log('DB Connected');
  const TOEIC = connection.getRepository('Toeic');
  fs.readdir(imageFolder, async (err, files) => {
    let files_length = files.length;
    process_flagging(files, files_length, TOEIC);
    correctness_flagging(files, files_length, TOEIC);
  });
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
