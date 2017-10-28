const
  express = require('express'),
  router = express.Router(),
  path = require('path'),
  http = require('http'),
  fs = require('fs');
  dataDir = path.join(process.env.PWD, 'public', 'data'),

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/:date', (req, res) => {
  /*
  TODO: Validate arguments e.g. too long period.
   */
  let
    promises = [];
    dates = req.params.date.split('~'),
    currentDateStr = dates[0],
    currentDate = new Date(currentDateStr),
    toDateStr = dates[1],
    toDate = new Date(toDateStr),
    d3data = {};

  while(currentDate <= toDate) {
    currentDateStr = currentDate.toISOString().substring(0, 10);
    let filePath = path.join(dataDir, currentDateStr + '.json');

    promises.push(new Promise((resolve, reject) => {
      let scopedDate = currentDateStr;
      fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        d3data[scopedDate] = JSON.parse(data);
        resolve();
      })
    }));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  Promise.all(promises).then(() => {
    res.send(d3data);
  });
});


/*
TODO: about page
favicon: Graph by Barracuda from the Noun Project
number icons published by Roundicons from Flaticon.com
 */

module.exports = router
