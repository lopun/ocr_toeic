var tesseract = require('node-tesseract-ocr');

var config = {
    lang: 'kor+eng',
    oem: 1,
    psm: 11
}

const single_process = name => tesseract.recognize(__dirname + `/../images/${name}`, config)


module.exports = {
    single_process
}
