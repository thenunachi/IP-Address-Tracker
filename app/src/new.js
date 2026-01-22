
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
  const [navigation, setNavigation] = useState(null)
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [travelMode, setTravelMode] = useState('driving');
  const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);
  const ORS_PROFILES = {
    driving: "driving-car",
    bike: "cycling-regular",
    foot: "foot-walking"
  };
  const [suggestions, setSuggestions] = useState([]);
const handleInputChange = async (value, setter) => {
  setter(value);
  if (value.length > 3) {
    const results = await fetchLocations(value);
    setSuggestions(results);
  } else {
    setSuggestions([]);
  }
};
  const fetchLocations = async (place) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}&addressdetails=1&limit=5`;
      const response = await fetch(url);
      const result = await response.json()
      return result
    }

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!start || !end) return;
    
    const startQueryResult = await fetchLocations(start)
    const endQueryResult = await fetchLocations(end)
    if (!startQueryResult.length || !endQueryResult.length) {alert("Could not find one of the locations. Try being more specific (e.g., add city or street).");
    return;}
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
    setDistance(null);
    setDuration(null);
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
    const url = `https://api.openrouteservice.org/v2/directions/${ORS_PROFILES[travelMode]}/geojson`;
    const body = {
      coordinates: [
        [start[1], start[0]],
        [end[1], end[0]]
      ],
      // Only add options if needed
      ...(avoidHighways && { options: { avoid_features: ["highways"] } })
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": ORS_API_KEY, // 
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("ORS Error:", errorData);
      throw new Error(`Route fetch failed: ${res.status}`);
    }

    const data = await res.json();
    const route = data.features[0];
    const steps = route.properties.segments[0].steps;
    const directions = steps.map((step) => ({
      text: step.instruction,
      distance: step.distance,
      duration: step.duration,
      type: step.type
    }));

    setNavigation(directions);
    // speakStepByStep(directions);

    return {
      coords: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
      distance: route.properties.summary.distance,
      duration: route.properties.summary.duration
    };
  };

  // const speakStepByStep = directions => {

  //   let i = 0;

  //   const next = () => {

  //     if (i >= directions.length) return;

  //     const msg = new SpeechSynthesisUtterance(directions[i].text);

  //     msg.onend = () => {

  //       i++;

  //       next()

  //     }

  //     speechSynthesis.speak(msg);

  //   }

  //   next()



  // };

  const fetchNearbyPlaces = async (lat, lon) => {
    console.log(lat, lon, "latlon")
    const query = `
       [out:json][timeout:25];
       (
       node(around:2000, ${lat}, ${lon})["historic"];
       node(around:2000, ${lat}, ${lon})["tourism"~"museum|attraction|viewpoint|monument"];
       );
       out body;
       `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });

    const data = await res.json();
    console.log("Found POIs:", data.elements);
    return data.elements;
  };
  useEffect(() => {
    if (!selectedPlace?.tags?.name) return;

    const fetchWikiInfo = async () => {
      try {
        const title = encodeURIComponent(selectedPlace.tags.name);

        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
        );

        const data = await res.json();
        if (data.extract) {
          setPlaceInfo(data.extract);
        } else {
          setPlaceInfo("No Wikipedia information available.");
        }
      } catch (err) {
        console.error(err);
        setPlaceInfo("Failed to load place information.");
      }
    };

    fetchWikiInfo();
  }, [selectedPlace]);
  useEffect(() => {
    if (!placeInfo) return;

    // Stop any current speaking (like navigation) before starting the history lesson
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(placeInfo);
    msg.rate = 0.9;
    speechSynthesis.speak(msg);
  }, [placeInfo]);
  useEffect(() => {
    const updateRoute = async () => {
      if (startCoords && endCoords) {
        const routeData = await fetchRoute(startCoords, endCoords);
        setRouteCoords(routeData.coords);
        setDistance((routeData.distance * 0.000621371).toFixed(2));
        setDuration((routeData.duration / 60).toFixed(0));
        console.log(startCoords, endCoords, "startEndCoords")
        const nearby = await fetchNearbyPlaces(
          startCoords[0],
          startCoords[1]
        );
        console.log(nearby, "nearby")
        const validPlaces = nearby.filter(p => p.lat && p.lon);
        // const valid = new Set(validPlaces.map((area) => area.tags?.tourism))
        setPlaces(validPlaces);
      }

    };
    updateRoute();
  }, [travelMode, avoidHighways, startCoords, endCoords]);

  return (
    <div className="appContainer">

      <div id="map">
        <MapComponent startCoords={startCoords}
          endCoords={endCoords}
          routeCoords={routeCoords}
          travelMode={travelMode}
          places={places}
          onPlaceClick={setSelectedPlace}
        />

        {/* {
          navigation != null && (
            <div className="routeInfo">
              navigation : {navigation.map(step => (step.text))}
            </div>
          )
        } */}
        {places.length > 0 && (
          <div className="placesList">
            <h4>Nearby Points of Interest:</h4>
            <select onChange={(e) => setSelectedPlace(places[e.target.value])}>
              <option value="">Select a place to learn more...</option>
              {places && places
                .filter((place) => place.tags && place.tags.name)
                .map((place, index) => (
                  <option key={place.id} value={index}>
                    {place.tags.name}
                  </option>
                ))}
            </select>
          </div>
        )}
        {placeInfo && selectedPlace && (
          <div className="routeInfo">
            <h3>{selectedPlace.tags.name}</h3>

            {selectedPlace.thumbnail?.source && (
              <img
                src={selectedPlace.thumbnail.source}
                alt={selectedPlace.tags.name}
                style={{ width: "100%", borderRadius: "8px" }}
              />
            )}

            <p>{placeInfo}</p>
          </div>
        )}
        <form className="searchForm" onSubmit={handleSubmitForm}>
          <input
            placeholder='write the start location'
            value={start}
            onChange={(e) => handleInputChange(e.target.value, setStart)}
          />
          <input
            placeholder='write the end location'

            value={end}
            onChange={(e) => handleInputChange(e.target.value, setEnd)}
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
          {distance !== null && duration !== null && (
            <div className="routeStats">
              <div className="statItem">
                <span className="label">Distance</span>
                <span className="value">{distance} miles</span>
              </div>
              <div className="statDivider"></div>
              <div className="statItem">
                <span className="label">Duration</span>
                <span className="value">{duration} min</span>
              </div>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}

export default App;


import { MapContainer, TileLayer, Marker, Popup, Polyline,useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
function RecenterMap({ coords }) {
    const map = useMap();
    if (coords) map.flyTo(coords, 14);
    return null;
}
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14); // 14 is a good zoom level for POIs
    }
  }, [center, map]);
  return null;
}
const MapComponent = ({ startCoords, endCoords, routeCoords, travelMode, places, onPlaceClick }) => {
    console.log("Places in MapComponent:", places); //['gallery', 'artwork', 'information', 'picnic_site', 'museum']
    const center = startCoords || [47.6038, -122.3301]
    const poiIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [25, 25],
});
    return (
        <MapContainer
           center={startCoords || [47.6038, -122.3301]} // Seattle
            zoom={12}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            zoomControl={true}
            style={{ height: '100vh', width: '100%' }}
        >
            <ChangeView center={startCoords} /> 
           
            <TileLayer
                attribution='© OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap coords={startCoords} />
            {startCoords && (
                <Marker position={startCoords}>
                    <Popup>
                        Start
                    </Popup>
                </Marker>
            )}
            {endCoords && (
                <Marker position={endCoords}>
                    <Popup>
                        End
                    </Popup>
                </Marker>
            )}
            {routeCoords && (
                <Polyline
                    positions={routeCoords}
                    pathOptions={{
                        color: travelMode === 'driving' ? 'blue' : travelMode === 'foot' ? 'green' : 'orange'
                    }}
                />
            )}

            {/* Map through places separately */}
            {places && places.map((place) => (
                <Marker
                    key={place.id}
                    position={[place.lat, place.lon]}
                    icon={poiIcon}
                    eventHandlers={{
                        click: () => onPlaceClick(place),
                    }}
                >
                    <Popup>
                        <strong>{place.tags.name || "Interesting Location"}</strong>
                        <br />
                        Click to hear more info!
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default MapComponent;


