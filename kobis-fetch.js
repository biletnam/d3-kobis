const
  path = require('path'),
  http = require('http'),
  fs = require('fs'),
  dataDir = path.join(process.env.PWD, 'public', 'data'),
  api_key = fs.readFileSync('api_key.text').toString().trim();
  url_tmp = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${api_key}&targetDt=`;

let promises = [];
let currentDate = null;
let toDate = null;

if (process.argv[2] === undefined) {
  let today = new Date();
  toDate = new Date(today.setDate(today.getDate() - 1));
  currentDate = new Date(toDate);
} else if (process.argv[3] === undefined) {
  toDate = new Date(process.argv[2]);
  currentDate = new Date(process.argv[2]);
} else {
  toDate = new Date(process.argv[3]);
  currentDate = new Date(process.argv[2]);
}

while(currentDate <= toDate) {
  currentDateStr = currentDate.toISOString().substring(0, 10);
  let filePath = path.join(dataDir, currentDateStr + '.json');
  let url = url_tmp + currentDateStr.replace(/-/g, '');
  console.log(url);

  promises.push(new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const
            parsedData = JSON.parse(rawData),
            selectedData = parsedData['boxOfficeResult']['dailyBoxOfficeList'],
            filteredData = selectedData.map((e) => {
            return {
              'rank': e.rank,
              'rankOldAndNew': e.rankOldAndNew,
              'movieNm': e.movieNm,
              'audiCnt': e.audiCnt,
              'audiAcc': e.audiAcc
            };
          });

          fs.writeFile(filePath, JSON.stringify(filteredData), (err) => {
            if (err) throw err;
            console.log('The file has been saved.');
            resolve(filteredData);
          });
        } catch (e) {
          console.error(e.message);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  }));
  currentDate.setDate(currentDate.getDate() + 1);
}

Promise.all(promises).then(values => {
  console.log(values);
});

