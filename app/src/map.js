import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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
    // console.log("Places in MapComponent:", places); //['gallery', 'artwork', 'information', 'picnic_site', 'museum']
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
            {places
                .filter(p => p.lat && p.lon)
                .map(place => (
                    <Marker
                        key={place.id}
                        position={[Number(place.lat), Number(place.lon)]}
                        icon={poiIcon}
                         zIndexOffset={1000}
                        eventHandlers={{
                            click: () => onPlaceClick(place),
                        }}
                    >
                        <Popup>
                            <strong>{place.tags?.name || "Interesting Location"}</strong>
                            <br />
                            Click to hear more info!
                        </Popup>
                    </Marker>
                ))}
        </MapContainer>
    );
}

export default MapComponent;


