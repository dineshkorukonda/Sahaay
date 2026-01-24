"use client";

import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { useCallback, useEffect, useState, useRef } from 'react';

const libraries: Libraries = ['places'];

interface MapComponentProps {
    center: [number, number];
    userLocation: [number, number] | null;
    facilities: any[];
    onMapClick?: (lat: number, lon: number) => void;
}

export default function MapComponent({ center, userLocation, facilities, onMapClick }: MapComponentProps) {
    const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    // Listen for Google Maps API errors in console
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const originalError = console.error;
            console.error = (...args: any[]) => {
                const message = args.join(' ');
                if (message.includes('ApiTargetBlockedMapError') || 
                    message.includes('api-target-blocked') ||
                    message.includes('RefererNotAllowed')) {
                    setApiError(message);
                }
                originalError(...args);
            };

            return () => {
                console.error = originalError;
            };
        }
    }, []);

    const apiKey = process.env.GOOGLE_API_KEY || '';
    
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: libraries
    });

    // Update map center when prop changes
    useEffect(() => {
        if (map && center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
            const newCenter = { lat: center[0], lng: center[1] };
            map.panTo(newCenter);
            console.log('Google Map center updated to:', newCenter);
        }
    }, [map, center]);

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        mapRef.current = mapInstance;
        setMap(mapInstance);
        
        // Set initial center
        if (center && center[0] && center[1]) {
            mapInstance.setCenter({ lat: center[0], lng: center[1] });
            mapInstance.setZoom(13);
        }
    }, [center]);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
        setMap(null);
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (onMapClick && e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
        }
    };

    const getMarkerIcon = (type: string) => {
        if (typeof window === 'undefined' || !window.google?.maps) {
            return undefined; // Use default marker if Google Maps not loaded
        }
        
        const colors: Record<string, string> = {
            'HOSPITAL': '#10b981', // emerald
            'CLINIC': '#3b82f6', // blue
            'PHARMACY': '#f97316', // orange
            'NGO': '#a855f7' // purple
        };
        const color = colors[type] || '#6b7280';
        
        // Custom pin shape SVG path
        const pinPath = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
        
        return {
            path: pinPath,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.2,
            anchor: new window.google.maps.Point(12, 22), // Anchor point at bottom of pin
        };
    };

    if (!apiKey) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
                    <p className="text-red-600 font-semibold mb-2 text-lg">Google Maps API Key Missing</p>
                    <p className="text-sm text-muted-foreground mb-4">Please add GOOOGLE_API_KEY to your .env file</p>
                    <div className="text-left text-xs bg-gray-50 p-3 rounded">
                        <p className="font-semibold mb-1">Add to .env:</p>
                        <code className="text-xs">GOOOGLE_API_KEY=your_api_key_here</code>
                    </div>
                </div>
            </div>
        );
    }

    // Check for API blocking errors
    const hasBlockedError = apiError || (loadError && (
        String(loadError).includes('ApiTargetBlockedMapError') ||
        String(loadError).includes('api-target-blocked') ||
        String(loadError).includes('RefererNotAllowed')
    ));

    if (loadError || apiError) {
        const errorMessage = apiError || loadError?.message || String(loadError) || 'Unknown error';
        const isBlockedError = hasBlockedError || 
                              errorMessage.includes('ApiTargetBlockedMapError') || 
                              errorMessage.includes('api-target-blocked') ||
                              errorMessage.includes('RefererNotAllowedMapError') ||
                              errorMessage.includes('RefererNotAllowed');
        
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 p-4">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-2xl">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-bold mb-2 text-xl">Google Maps API Error</p>
                    </div>
                    {isBlockedError ? (
                        <>
                            <p className="text-sm text-gray-700 mb-6 font-medium">
                                Your API key has domain restrictions blocking localhost.
                            </p>
                            <div className="text-left bg-yellow-50 p-5 rounded-lg border-2 border-yellow-300 mb-4">
                                <p className="font-bold mb-3 text-sm text-yellow-900">🔧 Quick Fix Steps:</p>
                                <ol className="list-decimal list-inside space-y-2 text-xs text-gray-800">
                                    <li className="mb-2">
                                        Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Google Cloud Console → APIs & Services → Credentials</a>
                                    </li>
                                    <li className="mb-2">Click on your API key to edit it</li>
                                    <li className="mb-2">
                                        Under <strong>"Application restrictions"</strong>:
                                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                            <li>Select <strong>"HTTP referrers (web sites)"</strong></li>
                                            <li>Click <strong>"Add an item"</strong> and add these one by one:
                                                <div className="bg-white p-2 rounded mt-2 font-mono text-xs">
                                                    <div>localhost:3000/*</div>
                                                    <div>127.0.0.1:3000/*</div>
                                                    <div>*localhost*</div>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="mb-2">
                                        Under <strong>"API restrictions"</strong>:
                                        <ul className="list-disc list-inside ml-6 mt-1">
                                            <li>Select <strong>"Restrict key"</strong></li>
                                            <li>Ensure <strong>"Maps JavaScript API"</strong> is checked/enabled</li>
                                        </ul>
                                    </li>
                                    <li className="mb-2"><strong>Click "Save"</strong> and wait 1-2 minutes</li>
                                    <li><strong>Refresh this page</strong></li>
                                </ol>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-900 font-semibold mb-1">💡 Alternative for Development:</p>
                                <p className="text-xs text-blue-800">
                                    You can temporarily set "Application restrictions" to <strong>"None"</strong> for local development, 
                                    but remember to add restrictions before deploying to production.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-left bg-gray-50 p-4 rounded">
                            <p className="text-sm text-gray-700 mb-2 font-semibold">Error Details:</p>
                            <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded">
                                {errorMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading Google Maps...</p>
                </div>
            </div>
        );
    }

    const mapCenter = center && center[0] && center[1] 
        ? { lat: center[0], lng: center[1] }
        : { lat: 28.6139, lng: 77.2090 }; // Default to Delhi

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
            }}
        >
            {/* User Location Marker */}
            {userLocation && (
                <Marker
                    position={{ lat: userLocation[0], lng: userLocation[1] }}
                    icon={typeof window !== 'undefined' && window.google?.maps ? {
                        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                        fillColor: '#ef4444',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2.5,
                        scale: 1.5,
                        anchor: new window.google.maps.Point(12, 22),
                    } : undefined}
                    title="Your Location"
                />
            )}

            {/* Facility Markers */}
            {facilities.map((facility) => {
                if (facility.latitude && facility.longitude) {
                    return (
                        <Marker
                            key={facility.id}
                            position={{ lat: facility.latitude, lng: facility.longitude }}
                            icon={getMarkerIcon(facility.type)}
                            onClick={() => setSelectedFacility(facility)}
                            title={facility.name}
                        />
                    );
                }
                return null;
            })}

            {/* Info Window */}
            {selectedFacility && (
                <InfoWindow
                    position={{
                        lat: selectedFacility.latitude,
                        lng: selectedFacility.longitude
                    }}
                    onCloseClick={() => setSelectedFacility(null)}
                >
                    <div className="p-2">
                        <h3 className="font-bold text-sm mb-1">{selectedFacility.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1">{selectedFacility.type}</p>
                        <p className="text-xs mb-2">{selectedFacility.address}</p>
                        {selectedFacility.phone && selectedFacility.phone !== 'N/A' && (
                            <p className="text-xs mb-2">Phone: {selectedFacility.phone}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Directions
                            </a>
                            {selectedFacility.phone && selectedFacility.phone !== 'N/A' && (
                                <a
                                    href={`tel:${selectedFacility.phone}`}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Call
                                </a>
                            )}
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
