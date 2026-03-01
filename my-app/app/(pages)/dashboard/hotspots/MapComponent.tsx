"use client";

import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { useCallback, useEffect, useState, useRef } from 'react';

const libraries: Libraries = ['places'];

export interface HotspotFacility {
    id: string;
    name: string;
    lat: number;
    lng: number;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    cases: number;
    details: string;
}

interface HotspotMapProps {
    center: [number, number];
    hotspots: HotspotFacility[];
}

export default function HotspotMapComponent({ center, hotspots }: HotspotMapProps) {
    const [selectedHotspot, setSelectedHotspot] = useState<HotspotFacility | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: libraries
    });

    useEffect(() => {
        if (map && center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
            const newCenter = { lat: center[0], lng: center[1] };
            map.panTo(newCenter);
        }
    }, [map, center]);

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        mapRef.current = mapInstance;
        setMap(mapInstance);

        if (center && center[0] && center[1]) {
            mapInstance.setCenter({ lat: center[0], lng: center[1] });
            mapInstance.setZoom(12);
        }
    }, [center]);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
        setMap(null);
    }, []);

    const getMarkerIcon = (risk: string) => {
        if (typeof window === 'undefined' || !window.google?.maps) return undefined;

        let color = '#22c55e'; // Green (Low)
        if (risk === 'HIGH') color = '#ef4444'; // Red
        if (risk === 'MEDIUM') color = '#eab308'; // Yellow

        const pinPath = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

        return {
            path: pinPath,
            fillColor: color,
            fillOpacity: risk === 'HIGH' ? 1 : 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: risk === 'HIGH' ? 1.5 : 1.2,
            anchor: new window.google.maps.Point(12, 22),
        };
    };

    if (!apiKey) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 p-4 text-center">
                <p className="text-red-500 font-bold">Google Maps API Key Missing</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 p-4 text-center">
                <p className="text-red-500 font-bold">Google Maps Failed to Load</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            </div>
        );
    }

    const mapCenter = center && center[0] && center[1]
        ? { lat: center[0], lng: center[1] }
        : { lat: 26.1445, lng: 91.7362 }; // Default to Guwahati, Assam

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
            }}
        >
            {hotspots.map((spot) => (
                <Marker
                    key={spot.id}
                    position={{ lat: spot.lat, lng: spot.lng }}
                    icon={getMarkerIcon(spot.riskLevel)}
                    onClick={() => setSelectedHotspot(spot)}
                    title={spot.name}
                />
            ))}

            {selectedHotspot && (
                <InfoWindow
                    position={{
                        lat: selectedHotspot.lat,
                        lng: selectedHotspot.lng
                    }}
                    onCloseClick={() => setSelectedHotspot(null)}
                >
                    <div className="p-2 max-w-[200px]">
                        <h3 className="font-bold text-sm mb-1">{selectedHotspot.name}</h3>
                        <p className={`text-xs font-bold mb-1 ${selectedHotspot.riskLevel === 'HIGH' ? 'text-red-600' :
                                selectedHotspot.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                                    'text-green-600'
                            }`}>
                            {selectedHotspot.riskLevel} RISK
                        </p>
                        <p className="text-xs mb-1"><strong>{selectedHotspot.cases}</strong> Active Cases</p>
                        <p className="text-xs text-muted-foreground">{selectedHotspot.details}</p>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
