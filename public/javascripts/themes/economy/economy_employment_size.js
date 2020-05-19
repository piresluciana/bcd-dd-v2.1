/** * This the Gross Value Added per Capita at Basic Prices Chart ***/

import { fetchJsonFromUrlAsync } from '../../modules/bcd-async.js'
import JSONstat from 'https://unpkg.com/jsonstat-toolkit@1.0.8/import.mjs'

(async () => {
  console.log('fetch cso json')
  const STATBANK_BASE_URL =
          'https://statbank.cso.ie/StatbankServices/StatbankServices.svc/jsonservice/responseinstance/'
  const TABLE_CODE = 'BRA08'
  let STATS = ['Active Enterprises (Number)', 'Persons Engaged (Number)', 'Employees (Number)']

  let json = await fetchJsonFromUrlAsync(STATBANK_BASE_URL + TABLE_CODE)

  let sizeDataset = JSONstat(json).Dataset(0)
  // the categories will be the label on each plot trace
  let categories = sizeDataset.Dimension(0).Category().map(c => {
    return c.label
  })
  // console.log(categories)

  let EXCLUDE = categories[0]
  //
  let sizeFiltered = sizeDataset.toTable(
     { type: 'arrobj' },
     (d, i) => {
       if (d.County === 'Dublin'
     && d.Statistic === STATS[2]
     && d['Employment Size'] !== EXCLUDE) {
         d.label = d.Year
         d.date = parseYear(+d.Year)
         d.value = +d.value
         return d
       }
     }
  )
  console.log(sizeFiltered)
  //
  const sizeContent = {
    e: '#chart-employees-by-size',
    xV: 'date',
    yV: 'value',
    d: sizeFiltered,
    k: 'Employment Size',
    ks: categories, // used for the tooltip
    tX: 'Years',
    tY: 'Persons employed'

  }

  const sizeChart = new MultiLineChart(sizeContent)
  sizeChart.drawChart()
  sizeChart.addTooltip(STATS[2] + ' for Year ', '', 'label')
})()