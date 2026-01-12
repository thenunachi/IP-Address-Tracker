import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const MapComponent = ({ startCoords, endCoords, routeCoords,travelMode }) => {
    console.log(endCoords, "endCoords")
    const center = startCoords || [47.6038, -122.3301]
    return (
        <MapContainer
            center={center} // Seattle
            zoom={12}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            zoomControl={true}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                attribution='© OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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
                <Polyline positions={routeCoords}
                    pathOptions={{
                        color:
                            travelMode === 'driving'
                                ? 'blue'
                                : travelMode === 'foot'
                                    ? 'green'
                                    : 'orange'
                    }} />
            )}
        </MapContainer>
    );
}

export default MapComponent;


