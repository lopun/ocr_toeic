const tesseract = require('node-tesseract-ocr');

const config = {
  lang: 'kor+eng',
  oem: 1,
  psm: 11,
};

const single_process = async (file, TOEIC, count_pointer) => {
  try {
    // Pure Filename
    let filename = file.split('.')[0];

    let found_toeic = await TOEIC.findOne({file});

    if (found_toeic) {
      count_pointer.value--;
      return;
    }

    console.log(`Processing file ${filename}.png`);
    let text = await tesseract.recognize(
      __dirname + `/../images/${file}`,
      config,
    );
    let text_arr = text.split('\n').filter(item => item !== '');

    for (let j = 0; j < text_arr.length; j++) {
      if (text_arr[j] == 'TOTAL') {
        let date, lc, rc, match_result;
        match_result = text_arr[j + 1].match(/[0-9]{4}\.[0-9]{2}\.[0-9]{2}/);

        if (match_result) {
          date = match_result[0];
        } else {
          j++;
          match_result = text_arr[j + 1].match(/[0-9]{4}\.[0-9]{2}\.[0-9]{2}/);
          if (match_result) {
            date = match_result[0];
          } else {
            // Match Fail, Should implement openCV Here
            console.log('Match Fail');
            let false_toeic = await TOEIC.save({
              file,
              date: '0000.00.00',
              lc: 000,
              rc: 000,
              ok: 0,
            });
            console.log(`Please manually update ${file}.`);
            count_pointer.value--;
            return;
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
          count_pointer.value--;
          return;
        }
      }
    }

    // OCR Failed
    const false_toeic = await TOEIC.save({
      file,
      date: '0000.00.00',
      lc: 000,
      rc: 000,
      ok: 0,
    });
    console.log(false_toeic);
    console.log(`Please manually update ${file}.`);
    count_pointer.value--;

  } catch (err) {
    console.log(err);
    count_pointer.value--;
  }
};

module.exports = single_process;
