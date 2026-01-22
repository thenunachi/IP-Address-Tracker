
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
  const [navigation, setNavigation] = useState(null);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [travelMode, setTravelMode] = useState('driving');
  const [currentStep, setCurrentStep] = useState(0);
  const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;
const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [wikiImage, setWikiImage] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const ORS_PROFILES = {
    driving: 'driving-car',
    bike: 'cycling-regular',
    foot: 'foot-walking'
  };
  /* ------------------ AUTOCOMPLETE ------------------ */
  const fetchLocations = async (place) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}&addressdetails=1&limit=5`;
    const response = await fetch(url);
    return response.json();
  };

  const handleInputChange = async (value, setter, suggestionSetter) => {
    setter(value);

    if (value.length > 3) {
      const results = await fetchLocations(value);
      suggestionSetter(results);
    } else {
      suggestionSetter([]);
    }
  };


  /* ------------------ ROUTING ------------------ */
  const fetchRoute = async (start, end) => {
    const url = `https://api.openrouteservice.org/v2/directions/${ORS_PROFILES[travelMode]}/geojson`;

    const body = {
      coordinates: [
        [start[1], start[0]],
        [end[1], end[0]]
      ],
      ...(avoidHighways && { options: { avoid_features: ['highways'] } })
    };

    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
      
        'Content-Type': 'application/json',
        Authorization: ORS_API_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    const route = data.features[0];

    const steps = route.properties.segments[0].steps;
    setNavigation(steps.map(s => s.instruction));

    return {
      coords: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
      distance: route.properties.summary.distance,
      duration: route.properties.summary.duration
    };
  };

 const speakStepByStep = (directions = []) => {
  const speakOne = (i) => {
    if (i >= directions.length) return;

    // highlight
    setCurrentStepIndex(i);

    // create voice
    const msg = new SpeechSynthesisUtterance(directions[i]);
    msg.rate = 0.9;

    msg.onend = () => {
      speakOne(i + 1);
    };

    window.speechSynthesis.speak(msg);
  };

  window.speechSynthesis.cancel();
  speakOne(0); // start
};
  /* ------------------ POIs ------------------ */
  const fetchNearbyPlaces = async (lat, lon) => {
    const query = `
      [out:json][timeout:25];
      (
        node(around:2000, ${lat}, ${lon})['historic'];
        node(around:2000, ${lat}, ${lon})['tourism'~'museum|attraction|viewpoint|monument'];
      );
      out body;
    `;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });

    const data = await res.json();
    console.log(data, "data")
    if (!data.elements?.length) {
      console.warn("No POIs returned from Overpass");
    }
    return data.elements.filter(p => p.lat && p.lon && p.tags?.name);
  };
  /* ------------------ WIKIPEDIA ------------------ */
  useEffect(() => {
    if (!selectedPlace?.tags?.name) return;

    const fetchWikiInfo = async () => {
      try {
        const title = encodeURIComponent(selectedPlace.tags.name);
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
        const data = await res.json();

        setPlaceInfo(data.extract || 'No information available.');
        setWikiImage(data.thumbnail?.source || null);

        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(data.extract);
        msg.rate = 0.9;
        window.speechSynthesis.speak(msg);
      } catch {
        setPlaceInfo('Failed to load Wikipedia info.');
      }
    };

    fetchWikiInfo();
  }, [selectedPlace]);
  /* ------------------ UPDATE ROUTE ------------------ */
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

        setPlaces(validPlaces);
      }

    };

    updateRoute();
  }, [startCoords, endCoords, travelMode, avoidHighways]);
  /* ------------------ FORM ------------------ */
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!start || !end) return;

    const s = await fetchLocations(start);
    const eLoc = await fetchLocations(end);

    if (!s.length || !eLoc.length) {
      alert('Location not found');
      return;
    }

    setStartCoords([+s[0].lat, +s[0].lon]);
    setEndCoords([+eLoc[0].lat, +eLoc[0].lon]);
    setPlaces([]);
    setSelectedPlace(null);
  };

  return (
    <div className="appContainer">
      <MapComponent
        startCoords={startCoords}
        endCoords={endCoords}
        routeCoords={routeCoords}
        travelMode={travelMode}
        places={places}
        onPlaceClick={setSelectedPlace}
      />
      {navigation && navigation.length > 0 && (
        <div className="navigationPanel">
          <h3>Turn-by-turn directions</h3>
          <ol>
            {navigation.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <form className="searchForm" onSubmit={handleSubmitForm} autoComplete="off">
        <input
          value={start}
          placeholder="Start location"
          onChange={(e) =>
            handleInputChange(

              e.target.value,
              setStart,
              setStartSuggestions
            )
          }
        />
        {startSuggestions.length > 0 && (
  <ul className="suggestions">
    {startSuggestions.map((s, i) => (
      <li
        key={i}
        onClick={() => {
          setStart(s.display_name);
          setStartCoords([+s.lat, +s.lon]); // set selected coords
          setStartSuggestions([]);         // clear list
        }}
      >
        {s.display_name}
      </li>
    ))}
  </ul>
)}
        <input
          value={end}
          placeholder="End location"
          onChange={(e) =>
            handleInputChange(
              e.target.value,
              setEnd,
              setEndSuggestions
            )
          }
        />
{endSuggestions.length > 0 && (
  <ul className="suggestions">
    {endSuggestions.map((eLoc, i) => (
      <li
        key={i}
        onClick={() => {
          setEnd(eLoc.display_name);
          setEndCoords([+eLoc.lat, +eLoc.lon]);
          setEndSuggestions([]);
        }}
      >
        {eLoc.display_name}
      </li>
    ))}
  </ul>
)}
        {/* {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => { setStart(s.display_name); setSuggestions([]); }}>
                {s.display_name}
              </li>
            ))}
          </ul>
        )} */}

        {/* <label>
          <input type="checkbox" checked={avoidHighways} onChange={e => setAvoidHighways(e.target.checked)} />
          Avoid Highways
        </label> */}

        <select value={travelMode} onChange={e => setTravelMode(e.target.value)}>
          <option value="driving">Driving</option>
          <option value="foot">Walking</option>
          <option value="bike">Cycling</option>
        </select>

        <button>Find Route</button>

        {distance && duration && (
          <div className="routeStats">
            {distance} miles · {duration} min
          </div>
        )}
      </form>

      {placeInfo && (
        <div className="routeInfo">
          <h3>{selectedPlace?.tags?.name}</h3>
          {wikiImage && <img src={wikiImage} alt="place" />}
          <p>{placeInfo}</p>
        </div>
      )}
    </div>
  );
}
export default App;
