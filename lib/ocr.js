// var tesseract = require('node-tesseract');

// var options = {
//     l: 'kor+eng',
//     psm: 11
// }

const ocr_func = array => array.map(item => {
    if ('이슈넘버' in item) {
        console.log("YEAH!")
    } else {
        console.log("no...")
    }
})

module.exports = {
    ocr_func: ocr_func
}
