
import './App.css';
import MapComponent from './map';
import { useState, useEffect } from 'react';


function App() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!start || !end) return;

    const fetchLocations = async (place) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      const response = await fetch(url);
      const result = await response.json()
      console.log(result, "result")
      return result
    }

    const startQueryResult = await fetchLocations(start)
    const endQueryResult = await fetchLocations(end)
    if (!startQueryResult.length || !endQueryResult.length) return;
    console.log(parseFloat(startQueryResult[0].lat), "stat")

    const startLatLong = [parseFloat(startQueryResult[0].lat),
    parseFloat(startQueryResult[0].lon)
    ]
    const endLatLong = [parseFloat(endQueryResult[0].lat), parseFloat(endQueryResult[0].lat)]
    setStartCoords(startLatLong);
    setEndCoords(endLatLong)
  }



  return (
    <div className="appContainer">

      <div id="map">
        <MapComponent startCoords={startCoords} endCoords={endCoords} />
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
