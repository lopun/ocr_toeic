const csvFilePath='./data.csv';
const csv = require('csvtojson');
const json2csv = require('json2csv').Parser;
const ocr_func = require('./lib/ocr.js').ocr_func;
const fs = require('fs');

const imageFolder = './images/';

fs.readdir(imageFolder, (err, files) => {
    files.forEach(file => {
        console.log(file)
    })
})

csv().fromFile(csvFilePath)
    .then(jsonObj => {
        const fields = Object.keys(jsonObj[1])
        const opts = {fields};
        console.log(opts);
        try {
            const parser = new json2csv(opts);
            const csv = parser.parse(jsonObj);
            fs.writeFile(__dirname+'/output.csv', csv, function(err) {
                if (err) {
                    return console.log(err)
                }

                console.log("successfully wrote csv data!")
            })
        } catch (err) {
            console.log(err);
        }
    })
