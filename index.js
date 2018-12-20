const csvFilePath='./data.csv';
const csv = require('csvtojson');
const json2csv = require('json2csv').Parser;
const single_process = require('./lib/ocr.js').single_process;
const fs = require('fs');

const imageFolder = './images/';

fs.readdir(imageFolder, (err, files) => {
    files.forEach((file, index) => {
        if (index >= 2 && index <= 10) {
            let result = single_process(files[2])
            result
                .then(text => {
                    console.log(text)
                    return text
                })
                .catch(err => console.log(err))
            console.log(result)
        }
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
