
import './App.css';
import MapComponent from './map';
import { useState, useEffect } from 'react';


function App() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!start || !end) return;

    const fetchLocations = async (place) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      const response = await fetch(url);
      const result = await response.json()

      return result
    }

    const startQueryResult = await fetchLocations(start)
    const endQueryResult = await fetchLocations(end)
    if (!startQueryResult.length || !endQueryResult.length) return;
    console.log(parseFloat(startQueryResult[0].lat), "stat")
    console.log(parseFloat(endQueryResult[0].lat), "end")
    const startLatLong = [parseFloat(startQueryResult[0].lat),
    parseFloat(startQueryResult[0].lon)
    ]
    const endLatLong = [parseFloat(endQueryResult[0].lat), parseFloat(endQueryResult[0].lon)]
    setStartCoords(startLatLong);
    setEndCoords(endLatLong)

    const routeData = await fetchRoute(startLatLong, endLatLong);
    setRouteCoords(routeData.coords)
    setDistance((routeData.distance * 0.000621371).toFixed(2))
    setDuration((routeData.duration / 60).toFixed(0))
  }

  const fetchRoute = async (start, end) => {
    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${start[1]},${start[0]};${end[1]},${end[0]}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data, "data")
    const route = data.routes[0]
    return {
      coords: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
      distance: route.distance,
      duration: route.duration
    }
  }
  console.log(distance, "distance", duration, "dura")


  return (
    <div className="appContainer">

      <div id="map">
        <MapComponent startCoords={startCoords} endCoords={endCoords} routeCoords={routeCoords} />
        {distance !== null && duration !== null && (
          <div className="routeInfo">
            Distance: {distance} miles
            Duration: {duration} min
          </div>
        )}
        <form className="searchForm" onSubmit={handleSubmitForm}>
          <input
            placeholder='write the start location'
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            placeholder='write the end location'

            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <button> FindRoute</button>

        </form>
      </div>

    </div>
  );
}

export default App;
