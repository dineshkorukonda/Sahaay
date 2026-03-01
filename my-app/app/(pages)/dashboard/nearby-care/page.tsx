"use client";

import { Search, MapPin, Navigation, Phone, X, Loader2, Crosshair } from "lucide-react";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import type { MapFacility } from "./MapComponent";

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading map...</div>
});

export default function NearbyCarePage() {
    const [facilities, setFacilities] = useState<MapFacility[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi
    const [mapKey, setMapKey] = useState(0); // Force re-render key
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [pinCode, setPinCode] = useState('');
    const [cityState, setCityState] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ city?: string; state?: string; pinCode?: string } | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchFacilities();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
    }, []);

    // Force map update when mapCenter changes
    useEffect(() => {
        if (mapCenter && mapCenter[0] && mapCenter[1]) {
            console.log('mapCenter state changed to:', mapCenter);
        }
    }, [mapCenter]);

    const fetchFacilities = async (searchLat?: number, searchLon?: number, searchPinCode?: string) => {
        setLoading(true);
        try {
            let url = '/api/nearby-clinics';
            const params = new URLSearchParams();
            if (searchLat && searchLon) {
                params.append('lat', searchLat.toString());
                params.append('lon', searchLon.toString());
            } else if (searchPinCode) {
                params.append('pinCode', searchPinCode);
            }
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const res = await fetch(url);
            const json = await res.json();

            if (json.success) {
                console.log('API Response:', {
                    userLocation: json.userLocation,
                    clinicsCount: json.clinics?.length || 0,
                    searchLocation: json.searchLocation,
                    firstClinic: json.clinics?.[0],
                    debugErrors: json.debugErrors // Log any errors from backend
                });

                // Set facilities
                if (json.clinics) {
                    setFacilities(json.clinics);
                }

                // PRIORITY 1: Set map center to userLocation from API (this is the search location)
                if (json.userLocation && json.userLocation.latitude && json.userLocation.longitude) {
                    const userLoc: [number, number] = [
                        parseFloat(json.userLocation.latitude.toString()),
                        parseFloat(json.userLocation.longitude.toString())
                    ];
                    console.log('Setting map center to userLocation:', userLoc, 'Current mapCenter:', mapCenter);
                    // Update both states immediately and force map re-render
                    setUserLocation(userLoc);
                    setMapCenter(userLoc);
                    setMapKey(prev => prev + 1); // Force map component re-render
                }
                // PRIORITY 2: Use first facility location if no userLocation
                else if (json.clinics && json.clinics.length > 0) {
                    const firstFacility = json.clinics[0];
                    if (firstFacility.latitude && firstFacility.longitude) {
                        const facilityLoc: [number, number] = [
                            parseFloat(firstFacility.latitude.toString()),
                            parseFloat(firstFacility.longitude.toString())
                        ];
                        console.log('Setting map center to first facility:', facilityLoc);
                        setMapCenter(facilityLoc);
                        setUserLocation(facilityLoc);
                    }
                } else {
                    console.warn('No location data available - map will not update');
                }

                // Update current location display
                if (json.searchLocation) {
                    setCurrentLocation(json.searchLocation);
                    console.log('Search location updated:', json.searchLocation);
                }
            } else {
                showToast('Failed to fetch facilities', 'error');
            }
        } catch (e) {
            console.error('Error fetching facilities:', e);
            showToast('Failed to fetch facilities', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePinCodeSearch = async () => {
        if (!pinCode || pinCode.length < 6) {
            showToast('Please enter a valid 6-digit PIN code', 'error');
            return;
        }

        setLocationLoading(true);
        try {
            await fetchFacilities(undefined, undefined, pinCode);
            setShowLocationModal(false);
            setPinCode('');
            showToast('Location updated successfully', 'success');
        } catch {
            showToast('Failed to update location', 'error');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleCityStateSearch = async () => {
        if (!cityState || cityState.trim().length < 3) {
            showToast('Please enter a city name (e.g., Visakhapatnam, Andhra Pradesh)', 'error');
            return;
        }

        setLocationLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('q', cityState.trim());
            const res = await fetch(`/api/nearby-clinics?${params.toString()}`);
            const json = await res.json();
            if (json.success && json.clinics) {
                setFacilities(json.clinics);
                if (json.userLocation && json.userLocation.latitude && json.userLocation.longitude) {
                    const userLoc: [number, number] = [json.userLocation.latitude, json.userLocation.longitude];
                    setMapCenter(userLoc);
                    setUserLocation(userLoc);
                }
                if (json.searchLocation) {
                    setCurrentLocation(json.searchLocation);
                }
                setShowLocationModal(false);
                setCityState('');
                showToast('Location updated successfully', 'success');
            } else {
                showToast('Location not found. Please try a different search.', 'error');
            }
        } catch {
            showToast('Failed to update location', 'error');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            setLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchFacilities(latitude, longitude);
                    setShowLocationModal(false);
                    showToast('Using your current location', 'success');
                    setLocationLoading(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    showToast('Could not access your location', 'error');
                    setLocationLoading(false);
                }
            );
        } else {
            showToast('Geolocation is not supported by your browser', 'error');
        }
    };

    const handleUseProfileLocation = async () => {
        setLocationLoading(true);
        try {
            await fetchFacilities(); // Fetch without params to use profile location
            setShowLocationModal(false);
            showToast('Using your profile location', 'success');
        } catch {
            showToast('Failed to load profile location', 'error');
        } finally {
            setLocationLoading(false);
        }
    };

    const filteredFacilities = selectedType === 'all'
        ? facilities
        : facilities.filter(f => f.type === selectedType);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'HOSPITAL': return 'bg-emerald-100 text-emerald-700';
            case 'CLINIC': return 'bg-blue-100 text-blue-700';
            case 'PHARMACY': return 'bg-orange-100 text-orange-700';
            case 'NGO': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading && facilities.length === 0) {
        return <Loader fullScreen text="Loading nearby facilities..." />;
    }

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
            {/* Left Panel - List */}
            <div className="w-full md:w-[450px] flex-shrink-0 border-r border-border bg-white flex flex-col">
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Home / Nearby Care</div>
                            <h1 className="text-2xl font-bold">Nearby Care Centers</h1>
                        </div>
                        <button
                            onClick={() => setShowLocationModal(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Change location"
                        >
                            <MapPin className="h-5 w-5 text-primary" />
                        </button>
                    </div>

                    {currentLocation && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                <span className="text-emerald-800 font-medium">
                                    {currentLocation.city && currentLocation.state
                                        ? `${currentLocation.city}, ${currentLocation.state}`
                                        : currentLocation.pinCode
                                            ? `PIN: ${currentLocation.pinCode}`
                                            : 'Current Location'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or specialty..."
                            className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:bg-white"
                        />
                    </div>

                    <div className="flex gap-2 text-xs overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedType === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                                }`}
                        >
                            All Facilities
                        </button>
                        <button
                            onClick={() => setSelectedType('HOSPITAL')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedType === 'HOSPITAL' ? 'bg-primary text-white' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                                }`}
                        >
                            Hospitals
                        </button>
                        <button
                            onClick={() => setSelectedType('CLINIC')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedType === 'CLINIC' ? 'bg-primary text-white' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                                }`}
                        >
                            Clinics
                        </button>
                        <button
                            onClick={() => setSelectedType('PHARMACY')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedType === 'PHARMACY' ? 'bg-primary text-white' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                                }`}
                        >
                            Pharmacies
                        </button>
                        <button
                            onClick={() => setSelectedType('NGO')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${selectedType === 'NGO' ? 'bg-primary text-white' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                                }`}
                        >
                            NGOs
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {filteredFacilities.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl text-center">
                            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground font-medium mb-2">No facilities found</p>
                            <p className="text-sm text-muted-foreground">
                                {currentLocation
                                    ? `No healthcare facilities found near ${currentLocation.city || currentLocation.pinCode || 'this location'}.`
                                    : 'No healthcare facilities found in your area. Try searching a different location.'}
                            </p>
                        </div>
                    ) : (
                        filteredFacilities.map((center) => (
                            <div key={center.id} className="bg-white p-5 rounded-2xl shadow-sm border border-border/60 hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{center.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTypeColor(center.type || '')}`}>
                                                {center.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {center.distance as string} • {center.address}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (center.latitude && center.longitude) {
                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`, '_blank');
                                            }
                                        }}
                                        className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                    >
                                        <Navigation className="h-4 w-4" /> Directions
                                    </button>
                                    {center.phone && center.phone !== 'N/A' && (
                                        <button
                                            onClick={() => window.open(`tel:${center.phone}`)}
                                            className="flex-1 bg-white border border-primary text-primary py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                                        >
                                            <Phone className="h-4 w-4" /> Call
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Map */}
            <div className={`flex-1 relative bg-gray-100 ${showLocationModal ? 'pointer-events-none' : ''}`}>
                {mapCenter && mapCenter[0] && mapCenter[1] && !isNaN(mapCenter[0]) && !isNaN(mapCenter[1]) ? (
                    <MapComponent
                        key={`map-${mapKey}-${mapCenter[0].toFixed(6)}-${mapCenter[1].toFixed(6)}`}
                        center={mapCenter}
                        userLocation={userLocation}
                        facilities={filteredFacilities}
                        onMapClick={async (lat, lon) => {
                            if (!showLocationModal) {
                                setShowLocationModal(false);
                                await fetchFacilities(lat, lon);
                                showToast('Location updated from map', 'success');
                            }
                        }}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <p className="text-muted-foreground">Loading map...</p>
                    </div>
                )}

                {/* Map Click Hint */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg z-[1000]">
                    <p className="text-xs font-medium text-muted-foreground">
                        💡 Click on map to search facilities at that location
                    </p>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg z-[1000]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Map Legend</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Hospital
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Clinic
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Pharmacy
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> NGO
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Your Location
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Change Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-[10000]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Change Location</h2>
                            <button
                                onClick={() => {
                                    setShowLocationModal(false);
                                    setPinCode('');
                                    setCityState('');
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Use Profile Location */}
                            <button
                                onClick={handleUseProfileLocation}
                                disabled={locationLoading}
                                className="w-full p-4 border-2 border-primary rounded-xl hover:bg-primary/5 transition-colors text-left disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Use Profile Location</p>
                                        <p className="text-sm text-muted-foreground">Use the location saved in your profile</p>
                                    </div>
                                </div>
                            </button>

                            {/* Use Current Location */}
                            <button
                                onClick={handleUseCurrentLocation}
                                disabled={locationLoading}
                                className="w-full p-4 border-2 border-primary rounded-xl hover:bg-primary/5 transition-colors text-left disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <Crosshair className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Use Current Location</p>
                                        <p className="text-sm text-muted-foreground">Detect your current GPS location</p>
                                    </div>
                                </div>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-sm text-muted-foreground">OR</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* City/State Search */}
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-2">
                                    Search by City/State
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                                            value={cityState}
                                            onChange={(e) => setCityState(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCityStateSearch}
                                        disabled={locationLoading || !cityState || cityState.trim().length < 3}
                                        className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {locationLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                        Search
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Enter city name or &quot;City, State&quot; format
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-sm text-muted-foreground">OR</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* PIN Code Search */}
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-2">
                                    Search by PIN Code
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="e.g. 560001"
                                            value={pinCode}
                                            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePinCodeSearch}
                                        disabled={locationLoading || !pinCode || pinCode.length < 6}
                                        className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {locationLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                        Search
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Enter a 6-digit postal PIN code
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
