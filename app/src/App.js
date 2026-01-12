
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
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [travelMode, setTravelMode] = useState('driving');
  const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;

  const ORS_PROFILES = {
    driving: "driving-car",
    bike: "cycling-regular",
    foot: "foot-walking"
  };
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
    console.log(startLatLong, "StartLATLONG")
    const endLatLong = [parseFloat(endQueryResult[0].lat), parseFloat(endQueryResult[0].lon)]
    setStartCoords(startLatLong);
    setEndCoords(endLatLong)

    const routeData = await fetchRoute(startLatLong, endLatLong);
    console.log(routeData, "routedata")
    setRouteCoords(routeData.coords)
    setDistance((routeData.distance * 0.000621371).toFixed(2))
    setDuration((routeData.duration / 60).toFixed(0))
  }


  //   const fetchRoute = async (start, end) => {
  //     const body = {
  //       coordinates: [
  //         [start[1], start[0]],
  //         [end[1], end[0]]
  //       ],

  //       options: avoidHighways
  //         ? { avoid_features: ["highways"] }
  //         : {}
  //     };

  //     const res = await fetch(
  //       `https://api.openrouteservice.org/v2/directions/${ORS_PROFILES[travelMode]}?format=geojson`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: ORS_API_KEY,
  //           "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify(body)
  //       }
  //     );

  //     if (!res.ok) {
  //       const err = await res.text();
  //       throw new Error(err);
  //     }

  //     const data = await res.json();
  //    console.log("keys:", Object.keys(data));
  // console.log("data:", data);

  //     const route = data.features[0];

  //     return {
  //       coords: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
  //       distance: route.properties.summary.distance,
  //       duration: route.properties.summary.duration
  //     };
  //   };
  const fetchRoute = async (start, end) => {
    const url = new URL(
      `https://api.openrouteservice.org/v2/directions/${ORS_PROFILES[travelMode]}`
    );

    url.searchParams.set("api_key", ORS_API_KEY);
    url.searchParams.set("start", `${start[1]},${start[0]}`);
    url.searchParams.set("end", `${end[1]},${end[0]}`);
    url.searchParams.set("format", "geojson");

    if (avoidHighways) {
      url.searchParams.set(
        "options",
        JSON.stringify({ avoid_features: ["highways"] })
      );
    }

    const res = await fetch(url.toString());

    const data = await res.json();
    console.log("GeoJSON:", data);

    const route = data.features[0];

    return {
      coords: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
      distance: route.properties.summary.distance,
      duration: route.properties.summary.duration
    };
  };
  useEffect(() => {
    const updateRoute = async () => {
      if (startCoords && endCoords) {
        const routeData = await fetchRoute(startCoords, endCoords);
        setRouteCoords(routeData.coords);
        setDistance((routeData.distance * 0.000621371).toFixed(2));
        setDuration((routeData.duration / 60).toFixed(0));
      }
    };
    updateRoute();
  }, [travelMode, avoidHighways]);

  return (
    <div className="appContainer">

      <div id="map">
        <MapComponent startCoords={startCoords} endCoords={endCoords} routeCoords={routeCoords} travelMode={travelMode} />
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
          <label>
            <input
              type="checkbox"
              checked={avoidHighways}
              onChange={(e) => setAvoidHighways(e.target.checked)}
            />
            Avoid Highways
          </label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value)}
          >
            <option value="driving">🚗 Driving</option>
            <option value="foot">🚶 Walking</option>
            <option value="bike">🚴 Cycling</option>
          </select>
          <button> FindRoute</button>

        </form>
      </div>

    </div>
  );
}

export default App;
