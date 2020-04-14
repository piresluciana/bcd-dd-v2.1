/**  TODOs
Load group data
  key-value SA vs group no
Load SAs
  Lookup group number for each SA object
  Add object to layer group based on group number
Filter layers based on cluster/group number
Add zscores data
Display zscores widget and filter based on group selection
Use zscores widget to filter map

Issue here is having the SAs load by LA and then update map->
if we add SA to group as it comes up we're rewriting gorup layers repeatedly
Solve with async await

**/

let dub_lng = -6.2603
let dub_lat = 53.42
let dublinX, dublinY
let min_zoom = 10,
  max_zoom = 16
let zoom = min_zoom
// tile layer with correct attribution
let osmUrl = 'http://{s}.tile.openstreetmapGeodemos.org/{z}/{x}/{y}.png'
let osmUrl_BW = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
let osmUrl_Hot = 'https://{s}.tile.openstreetmapGeodemos.fr/hot/{z}/{x}/{y}.png'
let stamenTonerUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
let stamenTonerUrl_Lite = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png'
let wiki = 'https://maps.wikimedia.org/osm-intl/${z}/${x}/${y}.png'
let osmAttrib = 'Map data © <a href="http://openstreetmapGeodemos.org">OpenStreetMap</a> contributors'
let osmAttrib_Hot = '&copy; <a href="http://www.openstreetmapGeodemos.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmapGeodemos.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
let stamenTonerAttrib = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmapGeodemos.org/copyright">OpenStreetMap</a>'
let mapGeodemos = new L.Map('map-geodemos')
let osm = new L.TileLayer(stamenTonerUrl_Lite, {
  minZoom: min_zoom,
  maxZoom: max_zoom,
  attribution: osmAttrib
})
mapGeodemos.setView(new L.LatLng(dub_lat, dub_lng), zoom)
mapGeodemos.addLayer(osm)

//     d3.csv('/data/tools/geodemographics/dublin_zscores.csv')])
loadData()
function loadData (file) {
  d3.csv('/data/tools/geodemographics/dublin_clusters_sa_cluster.csv')
    .then((data) => {
      let idClusterMap = {}
      data.forEach(function (d) {
        idClusterMap[d['SMALL_AREA']] = d['Cluster']
      })
      loadSmallAreas(idClusterMap)
    })
}

async function loadSmallAreas (saMap) {
  let features = []
// Incrementally load boundaries for each LA to maps
// signify when finished all
  let dataBase = '/data/tools/census2016/'
  let dcc0 = 'DCC_SA_0.geojson'
  let dcc1 = 'DCC_SA_1.geojson'
  let dcc2 = 'DCC_SA_2.geojson'
// promises
  let pDCC0 = d3.json(dataBase + dcc0)
  let pDCC1 = d3.json(dataBase + dcc1)
  let pDCC2 = d3.json(dataBase + dcc2)
// DCC
  let dccSAs = await Promise.all([pDCC0, pDCC1, pDCC2])
  // console.log(dccSAs)
  dccSAs.forEach(sas => {
    updateMap(sas)
    sas.features.forEach(sa => {
      features.push(sa)
    })
  })

// Fingal, DL/R, SDCC
  let fcc = 'FCC_SA_0.geojson'
  let dlr = 'DLR_SA_0.geojson'
  let sdcc = 'SDCC_SA_0.geojson'
  let pfcc = d3.json(dataBase + fcc)
  let pdlr = d3.json(dataBase + dlr)
  let psdcc = d3.json(dataBase + sdcc)
  let otherSAs = await Promise.all([pfcc, pdlr, psdcc])
  otherSAs.forEach(sas => {
    updateMap(sas)
    sas.features.forEach(sa => {
      features.push(sa)
    })
  })
  let layerGroups = []

  var layer2Style = {
    'color': '#ff7800',
    'weight': 5,
    'opacity': 0.65
  }

  let layer2 = L.geoJSON(null, {
    style: layer2Style
  }).addTo(mapGeodemos)

  if (saMap[features[features.length - 1].properties.SMALL_AREA] == '2') {
    layer2.addData(features[features.length - 1])
  }
  console.log()

  // features.forEach(
  //
  // )
}

// let boundaries, boundariesFCC;
function updateMap (data__) {
  let boundaries = L.geoJSON(data__, {
    // filter: filterByGroup,
    style: style,
    onEachFeature: onEachFeature
  })

  boundaries.addTo(mapGeodemos)
}

function filterByGroup (f, l) {
  console.log('f: ' + f)
  return f.properties.EDNAME.includes('North Dock B')
}

function style (f) {
  // console.log("style feature "+f.properties.COUNTYNAME)
  return {
    fillColor: getCountyColor(f.properties.COUNTYNAME),
    weight: 1,
    opacity: 2,
    color: getCountyColor(f.properties.COUNTYNAME),
    dashArray: '1',
    fillOpacity: 0.5
  }
};

function onEachFeature (feature, layer) {
  layer.bindPopup(
                '<p><b>' + feature.properties.EDNAME + '</b></p>' +
                '<p>' + feature.properties.COUNTYNAME + '</p>' +
                '<p>SA ' + feature.properties.SMALL_AREA + '</p>'
                )
        // bind click
  layer.on({
    click: function () {
                // idDim.filter(feature.properties.EDNAME);
                // let res = idDim.top(Infinity)[0].T1_1AGE1;
                //                console.log(idDim.top(Infinity));

      d3.select('#data-title')
          .html(feature.properties.EDNAME)
      d3.select('#data-subtitle')
          .html(feature.properties.COUNTYNAME + ', Small Area ' + feature.properties.SMALL_AREA)
        // d3.select("#data-display")
        //   .html(JSON.stringify(feature.properties));

        // TODO: check for names of modified boundaries e.g. SA2017_017012002/017012003 or SA2017_017012004/01

        // d3.json('/data/tools/census2016/SAPS2016_SA2017.csv' + feature.properties.SMALL_AREA).then(function (data) {
        //   d3.select('#data-textgen')
        //     .html('<p>' + formatData(data) + '</p>')
        //   updateChart(data)
        //   d3.select('#data-chart-title')
        //     .html('Age distribution of males')
        // })
    }
  })
}

// crossfilter variables
// let idDim;

let idDim // data dimension accessible by GEOGID

// function loadClusters (file) {
//   //    data_.forEach(function (d) {
//   //        d.id = +d.GEOGID.split('_')[1]; //extract the numerical part
//   //        //corresponding to the boundary geojson
//   //    });
//   // console.log('Variables length = ' + data_.length)
//   // let censusDataXF = crossfilter(data_)
//   // idDim = censusDataXF.dimension(function (d) {
//   //   return +d.GEOGID.split('_')[1]
//   // })
// }

  // function formatData (data_) {
  //   // let res = JSON.stringify(data_, null, '\n');
  //
  //   let keys = d3.keys(data_[0])
  //   // Mens ages from index 4 to 37 inclusive
  //   // 18+ from index 22
  //   let over18Males = 0
  //   for (let i = 22; i < 38; i += 1) {
  //     over18Males += data_[0][keys[i]]
  //     // console.log(keys[i]+" : "+data_[0][keys[i]]);
  //   }
  //   let over18Females = 0
  //   // Female ages from index 39 to 72 inclusive
  //   // 18+ from index 57
  //   for (let i = 57; i < 73; i += 1) {
  //     over18Females += data_[0][keys[i]]
  //     // console.log(keys[i]+" : "+data_[0][keys[i]]);
  //   }
  //   let totalMale = data_[0]['T1_1AGETM']
  //   let totalFemale = data_[0]['T1_1AGETF']
  //   let textOutput1 = 'The population of this small area is <b>' +
  //     totalMale + ' males</b> and <b>' +
  //     totalFemale + ' females</b>, giving <b>' +
  //     (totalMale + totalFemale) + '</b> persons in total. '
  //   let textOutput2 = 'Of those, <b>' +
  //     over18Males + ' men</b> and <b>' +
  //     over18Females + ' women</b> are over 18 years of age. <br>'
  //   return textOutput1 + textOutput2
  // }
  //
  // let chartMargins = [10, 0, 30, 20]
  // // (map size - margins)/2 map size is specified in the css for leaflet charts
  // let chartHeight = 250 // (200 - chartMargins[0] - chartMargins[2]) / 2;
  // let chartWidth = 500
  // var chart = dc.barChart('#data-chart')
  //
  // function updateChart (data_) {
  //   let keys = d3.keys(data_[0])
  //   let objects = []
  //   console.debug('keys: ' + keys)
  //   keys.forEach(function (e, i) {
  //     if (i >= 4) {
  //       if (i <= 37) {
  //         console.debug('key: ' + e + ' val: ' + data_[0][keys[i]])
  //         let obj = {
  //           ageBand: e,
  //           cnt: data_[0][keys[i]]
  //         }
  //         objects.push(obj)
  //       }
  //     }
  //   })
  //
  //   console.log('object zero: ' + JSON.stringify(objects[0]))
  //   let ndx = crossfilter(objects)
  //   console.log('xf: ' + ndx.size())
  //   let ageDimension = ndx.dimension(function (d) {
  //       // console.log("key: " + d.ageBand);
  //       return d.ageBand
  //     }),
  //     ageGroup = ageDimension.group()
  //     .reduceSum(function (d) {
  //       return d.cnt
  //     })
  //   chart
  //     .width(chartWidth)
  //     .height(chartHeight)
  //     .x(d3.scaleBand())
  //     .xUnits(dc.units.ordinal)
  //     .brushOn(false)
  //     .xAxisLabel('Age Group')
  //     .yAxisLabel('# Persons')
  //     .dimension(ageDimension)
  //     .barPadding(0.1)
  //     .outerPadding(0.05)
  //     .group(ageGroup)
  //     .xAxis().tickValues([keys[4], keys[37]])
  //   chart.render()
  // }
  //
//   boundaries.addTo(mapGeodemos)
// };

// ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c']
function getCountyColor (d) {
  return d === 'Dublin City' ? '#08519c' :
    d === 'Fingal' ? '#bdd7e7' :
    d === 'South Dublin' ? '#6baed6' :
    //            d ==='Dun Council' ? '#BD0026' :
    '#3182bd'
}

function getDataColor (d) {
  return d > 1000 ? '#800026' :
    d > 500 ? '#BD0026' :
    d > 200 ? '#E31A1C' :
    d > 100 ? '#FC4E2A' :
    d > 50 ? '#FD8D3C' :
    d > 20 ? '#FEB24C' :
    d > 10 ? '#FED976' :
    '#FFEDA0'
};

d3.selectAll('button[type=checkbox]').on('click', function () {
  console.log('checkbox')
  let cb = d3.select(this)
  console.log(cb.property('value'))
  if (cb.classed('active')) {
    cb.classed('active', false)
    // authorityNamesChecked = authorityNamesChecked.filter(function (val) {
    //   return val !== cb.property('value')
    // })
    // console.log("ACTIVE");
  } else {
    cb.classed('active', true)
    // if (authorityNames.includes(cb.property('value'))) {
    //   authorityNamesChecked.push(cb.property('value'))
    // } // console.log("INACTIVE");
  }
  // // console.log("active; " + cb.classed('active'));
  // //  console.log("LAs checked array:" + authorityNamesChecked);
  // authorityDim.filterFunction(function (d) {
  //   return authorityNamesChecked.includes(d)
  // })
  // updateMapData()
  // updateCharts()
})
// $(document).ready(function () {
//    console.log("ready");
//
// });
