(function() {
  'use strict';
  var
    fromDate = document.querySelector('#fromDate'),
    toDate = document.querySelector('#toDate'),
    search = document.querySelector('#search');

  var today = new Date();
  fromDate.valueAsDate = new Date(today.setDate(today.getDate() - 8));
  toDate.valueAsDate = new Date(today.setDate(today.getDate() + 7));

  /*
  Event listeners for UI elements
   */
  // fromDate.addEventListener('change', () => {
  //   console.log(fromDate.value);
  // });

  search.addEventListener('click', () => {
    var dateFormatted = fromDate.value + '~' + toDate.value;
    function fetch(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/' + url);
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
      });
    }
    fetch(dateFormatted)
      .then(visualize, console.log);
  });

  var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width_total = 960 - margin.left - margin.right,
    height_total = 500 - margin.top - margin.bottom,
    height_bar = 30,
    tenColor = d3.scaleOrdinal(d3.schemeCategory10),
    fixedDomain = ['','','','','','','','','',''];

  var allG = d3.select('#graph').append('svg')
      .attr('width', width_total + margin.left + margin.right)
      .attr('height', height_total + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(5, 30)');

  var i = 1;
  for (i; i <= 10; i++) {
    allG
      // .append('g')
      // .attr('transform', 'translate(2, ' + (i * height_bar) + ')')
      .append('img')
      // .attr('src', 'img/1.png')
      .attr('src', 'img/' + i + '.png')
      .attr('x', '10')
      .attr('y', i * height_bar)
      .attr('width', '20')
      .attr('height', '20');
  }

  //-----------------------Visualize---------------------------
  function visualize(incomingData) {
    var parsedData = JSON.parse(incomingData);
    var dates = d3.keys(parsedData);
    dates.sort();

    var count = 0;
    var interval = 1500;
    var motionDuration = interval * .9;

    dates.forEach(function(eachDate) {
      var boxofficeData = parsedData[eachDate];
      var maxAudi = d3.max(boxofficeData, function(d) {return +d.audiCnt;});
      var xScale = d3.scaleLinear().domain([0, 500000]).range([0, width_total]);
      // var xScale = d3.scaleLinear().domain([0, maxAudi]).range([0, width_total]);

      d3.timeout(function() {
        var g = allG.selectAll('g')
          .data(boxofficeData, function(d) {return d.movieNm;})

        d3.select('text.presentedDate').remove();

        allG
          .append('text')
          .attr('class', 'presentedDate')
          .attr('transform', 'translate(' + width_total/3 + ', ' + height_total/3 + ')')
          .style('fill', 'grey')
          .style('font-size', '1.5em')
          .text(eachDate);

        // Remove not joined movies
        g
          .exit()
          .each(function(d,i) {
            var j = fixedDomain.indexOf(d.movieNm);
            if (j !== -1)
              fixedDomain[j] = '';
          })
          .transition()
          .duration(motionDuration)
          .attr('transform', function(d) {return location_bar_right(d.rank);})
          .remove();

        // Update joined movies
        g
          .transition()
          .duration(motionDuration)
          .attr('transform', function(d) {return location_bar_left(d.rank);})
          .select('rect')
          .attr('width', function(d) {return xScale(d.audiCnt);});

        g
          .select('text.audiCount')
          .text(function(d) {return dailyAudiCount(d.audiCnt);});

        // Enter new movies

        var enteredG = g.enter()
          .append('g')
          .attr('transform', function(d) {return location_bar_right(d.rank);})
          .each(function(d,i) {
            var j = fixedDomain.indexOf('');
            if (j !== -1)
              fixedDomain[j] = d.movieNm;
          });

        tenColor.domain(fixedDomain);

        enteredG
          .transition()
          .duration(motionDuration)
          .attr('transform', function(d) {return location_bar_left(d.rank);});

        enteredG.append('text')
          .attr('class', 'movieName')
          .attr('y', height_bar / 1.5)
          .attr('x', 5)
          .text(function(d) {return d.movieNm;});

        enteredG.append('text')
          .attr('class', 'audiCount')
          .attr('y', height_bar / 1.5)
          .attr('x', 200)
          .text(function(d) {return dailyAudiCount(d.audiCnt);});

        enteredG.insert('rect', 'text')
          .attr('height', height_bar)
          .attr('width', function(d) {return xScale(d.audiCnt);})
          .style('fill', function(d) {return tenColor(d.movieNm);});
      }, count * interval);
      count += 1;
    });
  }

  function location_bar_left(rank) {
    return 'translate(30, ' + ((rank - 1) * height_bar) + ')';
  }

  function location_bar_right(rank) {
    return 'translate(' + width_total/2 + ',' + ((rank - 1) * height_bar) + ')';
  }

  function dailyAudiCount(count) {
    return d3.format(',')(count);
  }
})();
