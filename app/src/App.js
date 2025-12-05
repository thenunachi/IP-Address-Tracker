import logo from './logo.svg';
import './App.css';
import MapComponent from './map';
function App() {

  return (
    <div className="App">
      <header className="App-header">
        <div id="map">
          <MapComponent />
          </div>
      </header>
    </div>
  );
}

export default App;
