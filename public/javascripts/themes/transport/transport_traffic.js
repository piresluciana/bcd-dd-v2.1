(async () => {
/************************************
 * Traffic counter data
 ************************************/
  let trafficChart
  try {
    const STATIC_SENSOR_DATA = await d3.text('./data/transport/tmu-traffic-counters.dat')
    let rows = await d3.tsvParseRows(STATIC_SENSOR_DATA)
    console.log(rows.length)
    let dublinSensors = rows
    .map(r => {
      let obj = {
        'cosit': r[1],
        'description': r[0],
        'lat': r[5],
        'lng': r[6]
      }
      return obj
    }).filter(r => {
      return r.description.includes('Dublin')
    })

    console.log(dublinSensors[0])

    let data = await d3.csv('api/traffic/yesterday')
    console.log('traffic data length ' + data.length)
    data.map(d => {

    })

    // dublinSensors.forEach(s => {
    //   console.log(data[dublinSensors.cosit])
    // })
    // for (let i = 0; i < 10; i += 1) {
    //   console.log(data[i])
    // }
  } catch (e) {
    console.error('error fetching traffic data')
    console.error(e)
  }
})()
    // const dayFormat = d3.timeFormat("%a, %I:%M");
//     let keys = ['Bikes in use', 'Bikes available'] // this controls stacking order
//
//     let dataDay = data[0]
//     let dataWeek = data[1]
//     let dataMonth = data[2]
//
//     // TODO: is coercing to a date on the client  slow for large query spans (month)?
//
//     /* For stacked area chart */
//     dataDay.forEach(d => {
//       //  d["Total available (daily)"] = +d["Total available (daily)"];
//       d['date'] = new Date(d['date'])
//     })
//
//     dataWeek.forEach(d => {
//       //  d["Total available (daily)"] = +d["Total available (daily)"];
//       d['date'] = new Date(d['date'])
//     })
//
//     dataMonth.forEach(d => {
//       //  d["Total available (daily)"] = +d["Total available (daily)"];
//       d['date'] = new Date(d['date'])
//     })
//
//     /* For multiline chart */
//     // dataDay.forEach(d => {
//     //   // d["available_bikes"] = +d["available_bikes"];
//     //   d["key"] = d["key"].replace(/_/g, " ");
//     //   d["key"] = d["key"].charAt(0).toUpperCase() + d["key"].slice(1);
//     //   // console.log("\n\nd key: " + JSON.stringify(d["key"]));
//     //
//     //   // keys.push(d["key"]);
//     //   d["values"].forEach(v => {
//     //     v["date"] = new Date(v["date"]); //parse to date
//     //   });
//     // });
//     //
//     // dataWeek.forEach(d => {
//     //   // d["available_bikes"] = +d["available_bikes"];
//     //   d["key"] = d["key"].replace(/_/g, " ");
//     //   d["key"] = d["key"].charAt(0).toUpperCase() + d["key"].slice(1);
//     //   // console.log("\n\nd key: " + JSON.stringify(d["key"]));
//     //
//     //   // keys.push(d["key"]);
//     //   d["values"].forEach(v => {
//     //     v["date"] = new Date(v["date"]); //parse to date
//     //   });
//     // });
//     //
//     // dataMonth.forEach(d => {
//     //   // d["available_bikes"] = +d["available_bikes"];
//     //   d["key"] = d["key"].replace(/_/g, " ");
//     //   d["key"] = d["key"].charAt(0).toUpperCase() + d["key"].slice(1);
//     //   // console.log("\n\nd key: " + JSON.stringify(d["key"]));
//     //
//     //   // keys.push(d["key"]);
//     //   d["values"].forEach(v => {
//     //     v["date"] = new Date(v["date"]); //parse to date
//     //   });
//     // });
//
//     // console.log("Bikes Keys: " + JSON.stringify(keys));
//
//     const dublinBikesContent = {
//       e: '#chart-dublinbikes',
//       d: dataDay,
//       // k: dublinBikesData, //?
//       ks: keys, // For StackedAreaChart-formatted data need to provide keys
//       xV: 'date', // expects a date object
//       yV: 'value',
//       tX: 'Time', // string axis title
//       tY: 'No of bikes'
//     }
//
//     trafficChart = new StackedAreaChart(dublinBikesContent)
//     trafficChart.drawChart()
//     // addTooltip(title, format, dateField, prefix, postfix)
//     // format just formats comms for thousands etc
//     trafficChart.addTooltip('Dublin Bikes at ', 'thousands', 'label', '', '')
//     updateTextInfo(dataDay)
//
//     d3.select('#dublinbikes_day').on('click', function () {
//       activeBtn(this, trafficChart)
//       trafficChart.d = dataDay
//       trafficChart.drawChart()
//       // trafficChart.updateChart();
//       trafficChart.addTooltip('Dublin Bikes at ', 'thousands', 'label', '', '')
//     })
//
//     d3.select('#dublinbikes_week').on('click', function () {
//       activeBtn(this, trafficChart)
//       trafficChart.d = dataWeek
//       trafficChart.drawChart()
//       // trafficChart.updateChart();
//       trafficChart.addTooltip('Dublin Bikes at ', 'thousands', 'label', '', '')
//     })
//
//     d3.select('#dublinbikes_month').on('click', function () {
//       activeBtn(this, trafficChart)
//       trafficChart.d = dataMonth
//       trafficChart.drawChart()
//       // trafficChart.updateChart();
//       trafficChart.addTooltip('Dublin Bikes at ', 'thousands', 'label', '', '')
//     })
//   }).catch(function (error) {
//     console.log(error)
//   })
//
// // End of bikes data load
//
// function chartContent (data, key, value, date, selector) {
//   data.forEach(function (d) { // could pass types array and coerce each matching key using dataSets()
//     d.label = d[date]
//     d.date = parseYearMonth(d[date])
//     d[value] = +d[value]
//   })
//
//   // nest the processed data by regions
//   const nest = d3.nest().key(d => {
//     return d[key]
//   }).entries(data)
//
//   // get array of keys from nest
//   const keys = []
//   nest.forEach(d => {
//     keys.push(d.key)
//   })
//
//   return {
//     e: selector,
//     d: nest,
//     xV: date,
//     yV: value
//   }
// }
//
// function activeBtn (e, trafficChart) {
//   let btn = e
//   // var act = e.active ? true : false
//   // newOpacity = active ? 0 : 1;
//   $(btn).siblings().removeClass('active')
//   $(btn).addClass('active')
//   let G_chart = trafficChart
//   G_chart.updateChart()
// }
//
// function updateTextInfo (data) {
//   // console.log("Bikes data " + JSON.stringify(data) + "\n");
//   let peakUse = getMax(data, 'Bikes in use')
//   d3.select('#bikes-in-use-count').text(peakUse['Bikes in use'])
//   d3.select('#max-bikes-use-time').text(peakUse['label'].split(',')[0])
//   d3.select('#bikes-available').text(peakUse['Bikes available'])
//   // d3.select('#stands-count').html(bikeStands);
//
//   // console.log("Bike Station: \n" + JSON.stringify(data_[0].name));
//   // console.log("# of bike stations is " + data_.length + "\n");
// }
// // ars are array and property to be evaluated as a string
// function getMax (data, p) {
//   let max = data.reduce((acc, curr) => {
//     return acc[p] > curr[p] ? acc : curr
//   })
//   console.log('Bikes info ' + JSON.stringify(max))
//   return max
// };