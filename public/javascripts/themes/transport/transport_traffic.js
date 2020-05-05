import { getDateFromToday } from '../../modules/bcd-date.js'
import { getTrafficQueryForDate } from '../../modules/bcd-helpers-traffic.js'
import { groupByNumber } from '../../modules/bcd-helpers-traffic.js'
// import { trafficJoin } from '../../modules/bcd-helpers-traffic.js'

(async () => {
/************************************
 * Traffic counter data
 ************************************/

  let osmTrafficCounters = new L.TileLayer(stamenTonerUrl_Lite, {
    minZoom: min_zoom,
    maxZoom: max_zoom,
    attribution: stamenTonerAttrib
  })
  let trafficCountersMap = new L.Map('map-traffic-counters')
  trafficCountersMap.setView(new L.LatLng(dubLat, dubLng), zoom)
  trafficCountersMap.addLayer(osmTrafficCounters)
  let markerRefTrafficCounters // TODO: fix horrible hack!!!
  trafficCountersMap.on('popupopen', function (e) {
    markerRefDisabledPark = e.popup._source

   // console.log("ref: "+JSON.stringify(e));
  })

  let trafficCountersMapIcon = L.icon({
    iconUrl: '/images/transport/car-15.svg',
    iconSize: [20, 20] // orig size
    // iconAnchor: [iconAX, iconAY] //,
   // popupAnchor: [-3, -76]
  })

  const trafficCountersMarker = L.Marker.extend({
    options: {
      id: 0,
      total: 0,
      readings: 'No readings'
    }
  })

  const trafficCountersPopupOptons = {
    // 'maxWidth': '500',
    className: 'trafficCounterPopup'
  }

  let trafficCountersCluster = L.markerClusterGroup()

  try {
    // need to be able to look up the static data using cosit as key
    // want an array of objects for dublin sensors
    const counterSiteData = await d3.text('./data/transport/tmu-traffic-counters.dat')
    let rows = await d3.tsvParseRows(counterSiteData)
    // console.log(rows.length)
    let dublinSensors = rows
    .filter(row => {
      return row[0].includes('Dublin')
    })
    .map(row => {
      let obj = {
        id: +row[1],
        'description': row[0],
        'lat': +row[5],
        'lng': +row[6]
      }
      return obj
    })

    console.log(dublinSensors)
    let yesterdayQuery = getTrafficQueryForDate(getDateFromToday(-1))
    // console.log('yesterdayQuery: ' + yesterdayQuery)

    let minus8DaysQuery = getTrafficQueryForDate(getDateFromToday(-8))
    // console.log('minus7Days: ' + minus7DaysQuery)

    let minus29DaysQuery = getTrafficQueryForDate(getDateFromToday(-29))
    // console.log('minus29DaysQuery: ' + minus29DaysQuery)

    let minus85DaysQuery = getTrafficQueryForDate(getDateFromToday(-85))
    // console.log('minus85DaysQuery: ' + minus85DaysQuery)

    let dataCSVQuery1 = await d3.csv('api/traffic?q=' + yesterdayQuery) // returns array of objects
    console.log('dataCSVQuery[0]: ')
    console.log(dataCSVQuery1[0])

    let dataCSVQuery8 = await d3.csv('api/traffic?q=' + minus8DaysQuery)
    // console.log('dataCSVQuery: ' + dataCSVQuery7.length)

    let dataCSVQuery29 = await d3.csv('api/traffic?q=' + minus29DaysQuery)
    // console.log('dataCSVQuery: ' + dataCSVQuery28.length)

    let dataCSVQuery85 = await d3.csv('api/traffic?q=' + minus85DaysQuery)
    // console.log('dataCSVQuery :' + dataCSVQuery84.length)

    // need the vehicle count, indexed by cosit number
    let readingsGrouped = groupByNumber(dataCSVQuery1, 'cosit')
    // let readingsGrouped8 = groupByNumber(dataCSVQuery8, 'cosit')
    // let readingsGrouped29 = groupByNumber(dataCSVQuery29, 'cosit')
    // let readingsGrouped85 = groupByNumber(dataCSVQuery85, 'cosit')

    console.log('readingsGrouped: ')
    console.log(readingsGrouped)

    // for each dublin sensor object in the array, join the count
    // mutates original array

    // groupByNumber(dublinSensors, readingsGrouped)

    // trafficJoin(dublinSensors, readingsGrouped7)
    // trafficJoin(dublinSensors, readingsGrouped28)
    // trafficJoin(dublinSensors, readingsGrouped84)

    console.log('dublinSensors final -')
    console.log(dublinSensors[0])

    // create markers for each sensor, join readinfg to static site data and add to map
    dublinSensors.forEach(d => {
      d.values = unpackSensorData(readingsGrouped, d)
      let marker = new trafficCountersMarker(
        new L.LatLng(d.lat, d.lng), {
          id: d.id,
          icon: trafficCountersMapIcon,
          opacity: 0.9,
          title: d.description.split(',')[0], // shown in rollover tooltip
          alt: 'traffic counter icon'
        })
      trafficCountersMap.addLayer(marker)
      marker.bindPopup(getPopup(d))
      // marker.on('click', loggy(d))
    })
    // trafficCountersMap.addLayer(trafficCountersCluster)
  } catch (e) {
    console.error('error fetching traffic data')
    console.error(e)
  }
})()

function getPopup (d_) {
  if (!d_.id) {
    const str = '<div class="popup-error">' +
      '<div class="row ">' +
      "We can't get this traffic counter data right now, please try again later" +
      '</div>' +
      '</div>'
    return str
  }
  let str = '<div class="traffic-counter-popup-container">'
  str += '<div class="row ">'
  str += '<span id="traffic-counter-id-' + d_.id + '" class="col-9">' // id for name div
  if (d_.description) {
    str += '<strong>' + d_.description.split(',')[1] + '\t #' + d_.id + '</strong>'
  }
  str += '</span>' // close bike name div
  str += '</div>' // close row
  str += '<div class="row">'
  if (d_.description) {
    str += '<span class="col-9">' + d_.description.split(',')[0] + '</span>'
  }
  str += '</div>' // close row
  str += '<div class="row ">'
  str += '<span class="col-12" id="traffic-counter-' + d_.id + '-total" >' + JSON.stringify(d_.values) + '</span>'
  str += '</div>' // close row

  // initialise div to hold chart with id linked to station id
  // if (d_.st_ID) {
  //   str += '<div class="row ">'
  //   str += '<span id="bike-spark-' + d_.st_ID + '"></span>'
  //   str += '</div>'
  // }
  str += '</div>' // closes container
  return str
}

function unpackSensorData (rs_, d_) {
  try {
    let dateKeys = Object.keys(rs_[d_.id].dates)
    let values = dateKeys.map(
      date => {
        return { date: date, total: rs_[d_.id].dates[date].total}
      })
    return values
  } catch (e) {
    console.error('traffic sensor #' + d_.id + ' ' + e)
    return {date: `none`, total: 0}
    // No data for counter # + ${d_.id}`
  }
}
