import { StackedAreaChart } from '../../modules/StackedAreaChart.js'
import { MultiLineChart } from '../../modules/MultiLineChart.js'

let employmentLine
let unemploymentLine
let employmentStack
let unemploymentStack
let annual = '../data/Economy/annualemploymentchanges.csv'
let QNQ22 = '../data/Economy/QNQ22_2.csv'
let pageSize = 12

/** * This QNQ22 employment and unemployment Charts ***/
Promise.all([
  d3.csv(annual),
  d3.csv(QNQ22)

]).then(datafiles => {
  const QNQ22 = datafiles[1]
  // console.log('QNQ22')
  // console.log(QNQ22[0])

  const keys = QNQ22.columns.slice(3) // 0-2 is date, quarter, region
  const groupBy = 'region'

    // coerce values and parse dates
  coerceData(QNQ22, keys)
  parseQuarter(QNQ22, 'quarter')

  const emp = keys[2]
  const unemp = QNQ22.columns[4]
  const unempRate = QNQ22.columns[6]
  const fData = filterbyDate(QNQ22, 'date', 'Jan 01  2001')

  const unempData = stackNest(fData, 'label', 'region', unemp)
  // console.log('unemp data nested')
  // console.log(JSON.stringify(unempData[0]))

  const unempRateData = stackNest(fData, 'label', 'region', unempRate)
  const empData = stackNest(fData, 'label', 'region', emp)

  const grouping = ['Dublin', 'Rest of Ireland']

  let employmentStack
  if (document.getElementById('chart-employment')) {
    const empCStack = {
      e: '#chart-employment',
      d: empData,
      ks: grouping,
      xV: 'date',
      tX: 'Quarters',
      tY: '',
      ySF: ''
    }
    employmentStack = new StackedAreaChart(empCStack)
    employmentStack.tickNumber = 12
    //   employmentStack.pagination(empData, "#chart-employment", 24, 3, "year", "Thousands - Quarter:");
    //   employmentStack.getData(empData);
    employmentStack.drawChart()
    employmentStack.addTooltip('Quarter:', '', 'label')

    window.addEventListener('resize', () => {
      employmentStack.tickNumber = 12
      employmentStack.drawChart()
      employmentStack.addTooltip('Quarter:', '', 'label')
    })
  }

  const annual = datafiles[0]
  const keysA = annual.columns.slice(2)
  // d3Nest(QNQ22, 'date') // annual rate keys
  coerceData(annual, keysA)
  parseYearDates(annual, 'date')
  const aNest = d3Nest(annual, groupBy)

  let employmentLine
  if (document.getElementById('chart-emp-rate')) {
    // console.log('emp')

    const empContent = {
      e: '#chart-emp-rate',
      d: aNest,
      k: 'region',
      xV: 'date',
      yV: keysA[0],
      tX: 'Years',
      tY: '%',
      ySF: 'percentage'
    }
    // console.log('employ line')
    // console.log('aNest :')
    // console.log(aNest)
    // console.log('keysA[0]: ' + keysA[0])
    employmentLine = new MultiLineChart(empContent)
    function redraw () {
      employmentLine.tickNumber = 12
      employmentLine.drawChart()
      employmentLine.addTooltip('Employment Annual % Change - ', 'percentage2', 'label')
      employmentLine.hideRate(true) // hides the rate column in the tooltip when the % change chart is shown
    }
    redraw()
    window.addEventListener('resize', () => {
      redraw()
    })
  }

  let unemploymentStack
  if (document.getElementById('chart-unemployment')) {
    const unempCStack = {
      e: '#chart-unemployment',
      d: unempData,
      ks: grouping,
      xV: 'date',
      tX: 'Quarters',
      tY: '',
      ySF: 'thousands'
    }
    unemploymentStack = new StackedAreaChart(unempCStack)

    function redraw () {
      unemploymentStack.tickNumber = 12
    //   unemploymentStack.getData(unempData);
      unemploymentStack.drawChart()
      unemploymentStack.addTooltip('Unemployment in ', 'thousands', 'label')
    //   employmentLine.createScales();
    }

    window.addEventListener('resize', () => {
      redraw()
    })
  }
  let unemploymentLine
  // console.log('unemploy line')
  // console.log('aNest :')
  // console.log(aNest)
  // console.log('keysA[2]: ' + keysA[2])

  if (document.getElementById('chart-unemp-rate')) {
    const unempContent = {
      e: '#chart-unemp-rate',
      d: aNest,
      xV: 'date',
      yV: keysA[2],
      tX: 'Years',
      tY: '%',
      ySF: ''
    }

    unemploymentLine = new MultiLineChart(unempContent)
    function redraw () {
      unemploymentLine.tickNumber = 12
      unemploymentLine.drawChart()
      unemploymentLine.addTooltip('Unemployment rate (%)', '', '')
      unemploymentLine.hideRate(true)
    }
    window.addEventListener('resize', () => {
      redraw()
    })
  }

  d3.select('#chart-emp-rate').style('display', 'none')

  d3.select('#employment-count-btn').on('click', function () {
    activeBtn(this)
    d3.select('#chart-employment').style('display', 'block')
    d3.select('#chart-emp-rate').style('display', 'none')
      // need to redraw in case window size has changed
    employmentStack.tickNumber = 12
      //   employmentStack.pagination(empData, "#chart-employment", 24, 3, "year", "Thousands - Quarter:");
      //   employmentStack.getData(empData);
    employmentStack.drawChart()
    employmentStack.addTooltip('Quarter:', '', 'label')
  })

  d3.select('#employment-rate-btn').on('click', function () {
    activeBtn(this)
    d3.select('#chart-employment').style('display', 'none')
    d3.select('#chart-emp-rate').style('display', 'block')
    employmentLine.tickNumber = 12
    employmentLine.drawChart()
    employmentLine.addTooltip('Employment Annual % Change - ', 'percentage2', 'label')
    employmentLine.hideRate(true) // hides the rate column in the tooltip when the % change chart is shown
  })

  d3.select('#chart-unemp-rate').style('display', 'none')

  d3.select('#unemployment-count-btn').on('click', function () {
    activeBtn(this)
    d3.select('#chart-unemployment').style('display', 'block')
    d3.select('#chart-unemp-rate').style('display', 'none')
    unemploymentStack.tickNumber = 12
    //   unemploymentStack.getData(unempData);
    unemploymentStack.drawChart()
    unemploymentStack.addTooltip('Unemployment in ', 'thousands', 'label')
  })

  d3.select('#unemployment-rate-btn').on('click', function () {
    activeBtn(this)
    d3.select('#chart-unemployment').style('display', 'none')
    d3.select('#chart-unemp-rate').style('display', 'block')
    unemploymentLine.tickNumber = 12
    unemploymentLine.drawChart()
    unemploymentLine.addTooltip('Unemployment rate (%)', '', 'label')
    unemploymentLine.hideRate(true)
  })
})
  .catch(function (error) {
    console.log(error)
  })

// // #chart-employees-by-size
// // load csv data and turn value into a number
// d3.csv('../data/Economy/BRA08.csv').then(data => {
//   let columnNames = data.columns.slice(3),
//     xValue = data.columns[0]
//
//   data.forEach(d => {
//     for (var i = 0, n = columnNames.length; i < n; ++i) {
//       d[columnNames[i]] = +d[columnNames[i]]
//       d.label = d.date
//       d.date = parseYear(d.date)
//     }
//     return d
//   })
//
//   const employeesBySizeData = data,
//     employeesBySize = {
//       e: '#chart-employees-by-size',
//       xV: 'date',
//       yV: 'value',
//       d: employeesBySizeData,
//       k: 'type',
//       tX: 'Years',
//       tY: 'Persons Engaged',
//       ySF: 'millions'
//     }
//
//   const employeesBySizeChart = new MultiLineChart(employeesBySize)
//   employeesBySizeChart.drawChart()
//   employeesBySizeChart.addTooltip('Persons Engaged by Size of Company - Year:', 'thousands', 'label')
// })
// // catch any error and log to console
//  .catch(function (error) {
//    console.log(error)
//  })
//
// // #chart-overseas-vistors
//      // load csv data and turn value into a number
// d3.csv('../data/Economy/overseasvisitors.csv').then(data => {
//   let columnNames = data.columns.slice(1),
//     xValue = data.columns[0]
//
//   data.forEach(d => {
//     for (var i = 0, n = columnNames.length; i < n; ++i) {
//       d[columnNames[i]] = +d[columnNames[i]]
//     }
//     return d
//   })
//
//   let overseasVisitorsData = data
//
//   const tooltipContent = {
//       title: 'Oversea Vistors (Millions) - Year',
//       datelabel: xValue,
//       format: 'thousands'
//     },
//
//     overseasVisitorContent = {
//       e: '#chart-overseas-vistors',
//       d: overseasVisitorsData,
//       ks: columnNames,
//       xV: xValue,
//       tX: 'Years',
//       tY: 'Visitors (Millions)'
//              // ySF: "percentage"
//     },
//
//     overseasvisitorsChart = new GroupedBarChart(overseasVisitorContent)
//   overseasvisitorsChart.addTooltip(tooltipContent)
// })
//      // catch any error and log to console
//      .catch(function (error) {
//        console.log(error)
//      })

function coerceData (d, k) {
  d.forEach(d => {
    for (var i = 0, n = k.length; i < n; i++) {
      d[k[i]] = d[k[i]] !== 'null' ? +d[k[i]] : 'unavailable'
    }
    return d
  })
}

function join (lookupTable, mainTable, lookupKey, mainKey, select) {
  var l = lookupTable.length,
    m = mainTable.length,
    lookupIndex = [],
    output = []

  for (var i = 0; i < l; i++) { // loop through the lookup array
    var row = lookupTable[i]
    lookupIndex[row[lookupKey]] = row // create a index for lookup table
  }

  for (var j = 0; j < m; j++) { // loop through m items
    var y = mainTable[j]
    var x = lookupIndex[y[mainKey]] // get corresponding row from lookupTable
    output.push(select(y, x)) // select only the columns you need
  }

  return output
}

function d3Nest (d, n) {
  let nest = d3.nest()
    .key(name => {
      return name[n]
    })
    .entries(d)
  return nest
}

function filterByDateRange (data, dateField, dateOne, dateTwo) {
  return data.filter(d => {
    return d[dateField] >= new Date(dateOne) && d[dateField] <= new Date(dateTwo)
  })
}

function filterbyDate (data, dateField, date) {
  return data.filter(d => {
    return d[dateField] >= new Date(date)
  })
}

function stackNest (data, date, name, value) {
  let nested_data = d3Nest(data, date),
    mqpdata = nested_data.map(function (d) {
      let obj = {
        label: d.key
      }
      d.values.forEach(function (v) {
        obj.date = v.date
        obj.year = v.year
        obj[v[name]] = v[value]
      })
      return obj
    })
  return mqpdata
}

function activeBtn (e) {
  let btn = e
  $(btn).siblings().removeClass('active')
  $(btn).addClass('active')
}
// d3.selectAll(".chart-holder_PH").attr("class", "chart-holder");
