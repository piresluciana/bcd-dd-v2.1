let dubLat = 53.3498;
let dubLng = -6.2603;
let southWest = L.latLng(52.9754658325, -6.8639598864),
  northEast = L.latLng(53.7009607624, -5.9835178395),
  dublinBounds = L.latLngBounds(southWest, northEast); //greater Dublin & surrounds
let min_zoom = 8,
  max_zoom = 18;
let zoom = 10;
// tile layer with correct attribution
let osmUrl = 'http://{s}.tile.openstreetprivateMap.org/{z}/{x}/{y}.png';
let osmUrl_BW = 'http://{s}.tiles.wmflabs.org/bw-privateMapnik/{z}/{x}/{y}.png';
let osmUrl_Hot = 'https://{s}.tile.openstreetprivateMap.fr/hot/{z}/{x}/{y}.png'
let stamenTonerUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png';
let stamenTonerUrl_Lite = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png';
let osmAttrib = 'Map data © <a href="http://openstreetprivateMap.org">OpenStreetMap</a> contributors';
let osmAttrib_Hot = '&copy; <a href="http://www.openstreetprivateMap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetprivateMap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
let stamenTonerAttrib = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetprivateMap.org/copyright">OpenStreetMap</a>';
let iconAX = 15; //icon Anchor X
let iconAY = 15; //icon Anchor Y
var iconConfig = {
  title: 'text',
  iconUrl: '/images/environment/landuse-15.svg',
  iconSize: [30, 30],
  iconAnchor: [iconAX, iconAY],
  popupAnchor: [0, 0]
};

proj4.defs("EPSG:2157", "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=0.99982 +x_0=600000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

var firstProjection = "EPSG:2157"; //ITM
var secondProjection = "EPSG:4326"; //WGS84

d3.csv("/data/Stories/Housing/part_2/processed/unifinished_estates_2010_bnsd_dublin_area.csv")
  .then((data) => {
    let osm = new L.TileLayer(stamenTonerUrl_Lite, {
      minZoom: min_zoom,
      maxZoom: max_zoom,
      attribution: stamenTonerAttrib
    });
    let unfinishedEstatesMap = new L.Map('unfinished-estates-map');
    unfinishedEstatesMap.setView(new L.LatLng(dubLat, dubLng), zoom);
    unfinishedEstatesMap.addLayer(osm);
    let cluster = L.markerClusterGroup();
    data.forEach((d) => {
      let result = proj4(firstProjection, secondProjection,
        [+d["x"], +d["y"]]);
      d.lat = result[1];
      d.lng = result[0];
      let marker = L.marker(new L.LatLng(d.lat, d.lng), {
        icon: getIcon(d["TOTAL"])
      });
      // marker.bindPopup(getPopupContent(d));
      marker.bindTooltip(getPopupContent(d));
      cluster.addLayer(marker);
    });

    unfinishedEstatesMap.addLayer(cluster);

    // function updateMap(data_) {
    //   cluster.clearLayers();
    //   unfinishedEstatesMap.removeLayer(cluster);
    //   data_.forEach((d, i) => {
    //     //        console.log("d: " + d.type + "\n");
    //
    //   });
    //
    //   // unfinishedEstatesMap.fitBounds(cluster.getBounds());
    // }

    function getIcon(totalHouses) {
      // console.log(totalHouses);
      iconConfig.iconSize = [totalHouses, totalHouses];
      let icon = L.icon(iconConfig);
      return icon;
    }

    function getPopupContent(estate) {
      let key = "Name of Development";
      let str = ``;
      // Catch null development names or blanks or single space
      (estate[key] && estate[key] !== '' && estate[key] !== ' ') ? str += `<b>${estate[key]}</b><br>`: str += '<b>Unnamed Development</b><br>';
      key = "Town, Village, Suburb "
      str += `<i>${estate[key]}</i><br><br>` || '';
      key = "TOTAL"
      str += `<b>Total houses</b>: ${estate[key]}<br>` || '';
      key = "Complete & occupied"
      str += `<b>${key}</b>: ${estate[key]}<br>` || '';
      key = "Complete & vacant"
      str += `<b>${key}</b>: ${estate[key]}<br>` || '';

      return str;
    }

    L.control.locate({
      strings: {
        title: "Zoom to your location"
      }
    }).addTo(unfinishedEstatesMap);

    let osmGeocoder = new L.Control.OSMGeocoder({
      placeholder: 'Enter street name, area etc.',
      bounds: dublinBounds
    });
    unfinishedEstatesMap.addControl(osmGeocoder);

  });