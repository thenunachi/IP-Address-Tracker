import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapComponent = () => {
    return (
        <MapContainer
            center={[12.9716, 77.5946]}   // Example: Bangalore
            zoom={13}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[12.9716, 77.5946]}>
                <Popup>Hello from here!</Popup>
            </Marker>
        </MapContainer>
    );
}

export default MapComponent;


