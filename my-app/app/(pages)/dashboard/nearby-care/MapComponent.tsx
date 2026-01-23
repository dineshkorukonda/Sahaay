"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface MapComponentProps {
    center: [number, number];
    userLocation: [number, number] | null;
    facilities: any[];
    onMapClick?: (lat: number, lon: number) => void;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lon: number) => void }) {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

// Component to update map center when prop changes
function MapCenterUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    const [lastCenter, setLastCenter] = useState<[number, number] | null>(null);
    
    useEffect(() => {
        if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
            const newCenter: [number, number] = [center[0], center[1]];
            
            // Only update if center actually changed
            if (!lastCenter || 
                Math.abs(lastCenter[0] - newCenter[0]) > 0.0001 || 
                Math.abs(lastCenter[1] - newCenter[1]) > 0.0001) {
                
                console.log('MapCenterUpdater: Center changed, updating map', {
                    from: lastCenter,
                    to: newCenter,
                    current: map.getCenter()
                });
                
                // Use flyTo for smoother animation
                map.flyTo(newCenter, 13, {
                    animate: true,
                    duration: 1.5
                });
                
                setLastCenter(newCenter);
            }
        }
    }, [center, map, lastCenter]);
    return null;
}

export default function MapComponent({ center, userLocation, facilities, onMapClick }: MapComponentProps) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterUpdater center={center} />
            {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
            {userLocation && (
                <Marker position={userLocation}>
                    <Popup>Your Location</Popup>
                </Marker>
            )}
            {facilities.map((facility) => {
                if (facility.latitude && facility.longitude) {
                    return (
                        <Marker 
                            key={facility.id} 
                            position={[facility.latitude, facility.longitude]}
                        >
                            <Popup>
                                <div>
                                    <h3 className="font-bold">{facility.name}</h3>
                                    <p className="text-sm text-muted-foreground">{facility.type}</p>
                                    <p className="text-xs">{facility.address}</p>
                                    {facility.phone && facility.phone !== 'N/A' && (
                                        <p className="text-xs">Phone: {facility.phone}</p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                }
                return null;
            })}
        </MapContainer>
    );
}
