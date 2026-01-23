"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export default function LocationSetup() {
    const [pinCode, setPinCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [locationData, setLocationData] = useState<{
        city?: string;
        state?: string;
        pinCode?: string;
    } | null>(null);

    const handleGetLocation = async () => {
        setIsLoading(true);
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        // Use a reverse geocoding API to get PIN code
                        // For demo, we'll use a free API or mock data
                        try {
                            const res = await fetch(
                                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                            );
                            const data = await res.json();
                            
                            // Try to get PIN code from another API or use postal code
                            const pinRes = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                            );
                            const pinData = await pinRes.json();
                            
                            const extractedPin = pinData.address?.postcode || "";
                            setPinCode(extractedPin);
                            setLocationData({
                                city: data.city || data.locality || "",
                                state: data.principalSubdivision || "",
                                pinCode: extractedPin
                            });
                            
                            // Save to backend
                            await fetch('/api/onboarding/profile', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    location: {
                                        pinCode: extractedPin,
                                        city: data.city || data.locality,
                                        state: data.principalSubdivision,
                                        latitude,
                                        longitude
                                    },
                                    pinCode: extractedPin
                                })
                            });
                        } catch (err) {
                            console.error('Location fetch error:', err);
                            alert('Could not fetch location details. Please enter PIN code manually.');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        alert('Could not access your location. Please enter PIN code manually.');
                        setIsLoading(false);
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser. Please enter PIN code manually.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };

    const handlePinCodeSubmit = async () => {
        if (!pinCode || pinCode.length < 6) {
            alert('Please enter a valid 6-digit PIN code');
            return;
        }

        setIsLoading(true);
        try {
            // Fetch location details from PIN code
            const res = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
            const data = await res.json();
            
            if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.[0]) {
                const postOffice = data[0].PostOffice[0];
                const locationInfo = {
                    city: postOffice.District || postOffice.Name,
                    state: postOffice.State,
                    pinCode: pinCode
                };
                
                // Update state with location data
                setLocationData(locationInfo);
                // Keep pinCode in input field
                setPinCode(pinCode);

                // Save to backend
                const saveRes = await fetch('/api/onboarding/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        location: {
                            pinCode: pinCode,
                            city: postOffice.District || postOffice.Name,
                            state: postOffice.State
                        },
                        pinCode: pinCode
                    })
                });
                
                if (saveRes.ok) {
                    console.log('Location saved successfully');
                } else {
                    console.error('Failed to save location');
                }
            } else {
                alert('Invalid PIN code. Please try again.');
            }
        } catch (err) {
            console.error('PIN code lookup error:', err);
            // Still save the PIN code even if API fails
            const saveRes = await fetch('/api/onboarding/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pinCode: pinCode,
                    location: { pinCode: pinCode }
                })
            });
            
            if (saveRes.ok) {
                console.log('Location saved successfully (fallback)');
                setLocationData({ pinCode: pinCode });
            } else {
                console.error('Failed to save location (fallback)');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-medium text-foreground mb-2">Set Your Location</h2>
                <p className="text-muted-foreground">
                    Help us find nearby healthcare facilities and services in your area.
                </p>
            </div>

            <div className="space-y-6">
                {/* Auto-detect Location */}
                <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Navigation className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">Auto-detect Location</h4>
                            <p className="text-sm text-muted-foreground">
                                Allow us to access your location to automatically set your PIN code and area.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleGetLocation}
                        disabled={isLoading}
                        className="w-full py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Detecting Location...
                            </>
                        ) : (
                            <>
                                <Navigation className="w-4 h-4" />
                                Get My Location
                            </>
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">OR</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Manual PIN Code Entry */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Enter PIN Code <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="e.g. 560001"
                                value={pinCode}
                                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handlePinCodeSubmit}
                            disabled={isLoading || !pinCode || pinCode.length < 6}
                            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit"}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Enter your 6-digit postal PIN code
                    </p>
                </div>

                {/* Location Display */}
                {locationData && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-foreground">Location Set</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            {locationData.city && <p>City: {locationData.city}</p>}
                            {locationData.state && <p>State: {locationData.state}</p>}
                            {locationData.pinCode && <p>PIN Code: {locationData.pinCode}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
