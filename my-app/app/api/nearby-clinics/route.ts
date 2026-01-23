import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Profile } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(req: Request) {
    try {
        // Verify User
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        await connectDB();
        const profile = await Profile.findOne({ userId });

        // Get location from query params or use profile location
        const url = new URL(req.url);
        const searchLat = url.searchParams.get('lat');
        const searchLon = url.searchParams.get('lon');
        const searchPinCode = url.searchParams.get('pinCode');
        const searchCity = url.searchParams.get('city');
        const searchState = url.searchParams.get('state');
        const searchQuery = url.searchParams.get('q'); // General location query

        let lat: number | null = null;
        let lon: number | null = null;
        let searchLocation: { city?: string; state?: string; pinCode?: string } | null = null;

        // If search params provided, use them
        if (searchLat && searchLon) {
            lat = parseFloat(searchLat);
            lon = parseFloat(searchLon);
        } else if (searchPinCode) {
            // Get coordinates from PIN code
            try {
                const pinRes = await fetch(`https://api.postalpincode.in/pincode/${searchPinCode}`);
                const pinData = await pinRes.json();
                
                if (pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.[0]) {
                    const postOffice = pinData[0].PostOffice[0];
                    const city = postOffice.District || postOffice.Name || postOffice.Block;
                    const state = postOffice.State;
                    
                    searchLocation = {
                        city: city,
                        state: state,
                        pinCode: searchPinCode
                    };
                    
                    // Try multiple methods to get coordinates
                    // Method 1: Direct PIN code search in Nominatim
                    try {
                        const controller1 = new AbortController();
                        const timeoutId1 = setTimeout(() => controller1.abort(), 5000);
                        
                        const nominatimRes1 = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&postalcode=${searchPinCode}&country=India&limit=1`,
                            {
                                headers: {
                                    'User-Agent': 'Sahaay-Healthcare-App/1.0'
                                },
                                signal: controller1.signal
                            }
                        );
                        clearTimeout(timeoutId1);
                        
                        if (nominatimRes1.ok) {
                            const nominatimData1 = await nominatimRes1.json();
                            if (nominatimData1 && nominatimData1.length > 0) {
                                lat = parseFloat(nominatimData1[0].lat);
                                lon = parseFloat(nominatimData1[0].lon);
                            }
                        }
                    } catch (err1) {
                        // Fall through to next method
                    }
                    
                    // Method 2: Use city and state from postal API if PIN code search failed
                    if ((!lat || !lon) && city && state) {
                        try {
                            const controller2 = new AbortController();
                            const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
                            
                            const locationQuery = `${city}, ${state}, India`;
                            const nominatimRes2 = await fetch(
                                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1&countrycodes=in`,
                                {
                                    headers: {
                                        'User-Agent': 'Sahaay-Healthcare-App/1.0'
                                    },
                                    signal: controller2.signal
                                }
                            );
                            clearTimeout(timeoutId2);
                            
                            if (nominatimRes2.ok) {
                                const nominatimData2 = await nominatimRes2.json();
                                if (nominatimData2 && nominatimData2.length > 0) {
                                    lat = parseFloat(nominatimData2[0].lat);
                                    lon = parseFloat(nominatimData2[0].lon);
                                }
                            }
                        } catch (err2) {
                            console.error('Error fetching coordinates from city/state:', err2);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching location from PIN code:', err);
            }
        } else if (searchQuery || (searchCity && searchState)) {
            // Handle city/state or general location query (e.g., "Visakhapatnam, Andhra Pradesh")
            try {
                const locationQuery = searchQuery || `${searchCity}, ${searchState}, India`;
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const nominatimRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1&countrycodes=in`,
                    {
                        headers: {
                            'User-Agent': 'Sahaay-Healthcare-App/1.0'
                        },
                        signal: controller.signal
                    }
                );
                clearTimeout(timeoutId);
                
                if (nominatimRes.ok) {
                    const nominatimData = await nominatimRes.json();
                    if (nominatimData && nominatimData.length > 0) {
                        lat = parseFloat(nominatimData[0].lat);
                        lon = parseFloat(nominatimData[0].lon);
                        
                        // Extract location info
                        const addr = nominatimData[0];
                        searchLocation = {
                            city: addr.address?.city || addr.address?.town || addr.address?.county || searchCity,
                            state: addr.address?.state || searchState,
                            pinCode: addr.address?.postcode
                        };
                    }
                }
            } catch (err) {
                console.error('Error fetching location from city/state:', err);
            }
        }

        // Fallback to profile location if no search params
        if (!lat || !lon) {
            if (profile?.location?.latitude && profile?.location?.longitude) {
                lat = profile.location.latitude;
                lon = profile.location.longitude;
            } else if (!profile || !profile.location?.pinCode) {
                // Return empty clinics if no location
                return NextResponse.json({
                    success: true,
                    clinics: [],
                    userLocation: null,
                    searchLocation: null
                });
            }
        }

        // Try to fetch real hospitals/clinics from OpenStreetMap Overpass API (FREE)
        let clinics = [];
        
        if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
            try {
                // Use OpenStreetMap Overpass API to find nearby hospitals and clinics
                // This is completely free and doesn't require an API key
                const radius = 10000; // 10km radius in meters (increased for better results)
                console.log(`Searching for facilities near coordinates: ${lat}, ${lon} with radius ${radius}m`);
                
                // Overpass QL query to find hospitals, clinics, doctors, pharmacies, and NGOs
                const overpassQuery = `
                    [out:json][timeout:25];
                    (
                      node["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
                      way["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
                      relation["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
                      node["office"~"^(ngo|non_profit|association|charity)$"](around:${radius},${lat},${lon});
                      way["office"~"^(ngo|non_profit|association|charity)$"](around:${radius},${lat},${lon});
                      relation["office"~"^(ngo|non_profit|association|charity)$"](around:${radius},${lat},${lon});
                      node["healthcare"~"^(.*)$"](around:${radius},${lat},${lon});
                      way["healthcare"~"^(.*)$"](around:${radius},${lat},${lon});
                    );
                    out center meta;
                `;
                
                const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `data=${encodeURIComponent(overpassQuery)}`,
                });
                
                if (overpassResponse.ok) {
                    const osmData = await overpassResponse.json();
                    
                    if (osmData.elements && osmData.elements.length > 0) {
                        // Process OSM elements (limit to 10 to reduce API calls)
                        // Process in smaller batches to avoid overwhelming APIs
                        const elementsToProcess = osmData.elements.slice(0, 10);
                        const clinicsPromises = elementsToProcess.map(async (element: any) => {
                            try {
                                const elementLat = element.lat || element.center?.lat;
                                const elementLon = element.lon || element.center?.lon;
                                
                                if (!elementLat || !elementLon) return null;
                                
                                // Calculate distance (ensure coordinates are valid)
                                if (isNaN(elementLat) || isNaN(elementLon)) {
                                    return null;
                                }
                                const distance = calculateDistance(lat, lon, elementLat, elementLon);
                                
                                // Get name and address from OSM tags
                                const name = element.tags?.name || element.tags?.['name:en'] || 'Healthcare Facility';
                                const amenity = element.tags?.amenity || element.tags?.office || 'clinic';
                                // Determine type
                                let type = 'CLINIC';
                                if (amenity === 'hospital') type = 'HOSPITAL';
                                else if (amenity === 'pharmacy') type = 'PHARMACY';
                                else if (amenity === 'doctors') type = 'CLINIC';
                                else if (amenity === 'ngo' || amenity === 'non_profit' || amenity === 'association') type = 'NGO';
                                
                                // Build address from OSM tags (primary source, more reliable)
                                let address = '';
                                let phone = 'N/A';
                                
                                // Use OSM tags first (more reliable and faster)
                                if (element.tags) {
                                    const addrParts = [
                                        element.tags['addr:street'] || element.tags['addr:road'],
                                        element.tags['addr:city'] || element.tags['addr:town'] || element.tags['addr:village'],
                                        element.tags['addr:state'],
                                        element.tags['addr:postcode'] ? `PIN: ${element.tags['addr:postcode']}` : ''
                                    ].filter(Boolean);
                                    
                                    if (addrParts.length > 0) {
                                        address = addrParts.join(', ');
                                    }
                                }
                                
                                // Only try Nominatim if we don't have address from OSM tags (with timeout and error handling)
                                if (!address) {
                                    try {
                                        // Create AbortController for timeout
                                        const controller = new AbortController();
                                        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
                                        
                                        const nominatimResponse = await fetch(
                                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${elementLat}&lon=${elementLon}&addressdetails=1`,
                                            {
                                                headers: {
                                                    'User-Agent': 'Sahaay-Healthcare-App/1.0'
                                                },
                                                signal: controller.signal
                                            }
                                        );
                                        
                                        clearTimeout(timeoutId);
                                        
                                        if (nominatimResponse.ok) {
                                            const nominatimData = await nominatimResponse.json();
                                            if (nominatimData.address) {
                                                const addr = nominatimData.address;
                                                const addressParts = [
                                                    addr.road,
                                                    addr.suburb || addr.neighbourhood,
                                                    addr.city || addr.town || addr.village,
                                                    addr.state,
                                                    addr.postcode ? `PIN: ${addr.postcode}` : ''
                                                ].filter(Boolean);
                                                address = addressParts.join(', ') || nominatimData.display_name;
                                            }
                                        }
                                    } catch (nominatimErr) {
                                        // Silently fail - we'll use coordinates as fallback
                                        // Don't log to avoid spam
                                    }
                                }
                                
                                // Final fallback: use coordinates if no address found
                                if (!address) {
                                    address = `${elementLat.toFixed(4)}, ${elementLon.toFixed(4)}`;
                                }
                                
                                // Get phone from OSM tags
                                phone = element.tags?.['phone'] || element.tags?.['contact:phone'] || element.tags?.['phone:mobile'] || 'N/A';
                                
                                // Get opening hours
                                const openingHours = element.tags?.['opening_hours'] || 'Hours not available';
                                
                                return {
                                    id: element.id?.toString() || `${elementLat}-${elementLon}`,
                                    name: name,
                                    address: address,
                                    distance: `${distance.toFixed(1)} km`,
                                    phone: phone,
                                    hours: openingHours,
                                    latitude: elementLat,
                                    longitude: elementLon,
                                    type: type,
                                    amenity: amenity
                                };
                            } catch (err) {
                                console.error('Error processing OSM element:', err);
                            }
                            return null;
                        });
                        
                        // Process clinics with better error handling
                        // Use Promise.allSettled to continue even if some fail
                        const clinicsResults = await Promise.allSettled(clinicsPromises);
                        clinics = clinicsResults
                            .filter((result): result is PromiseFulfilledResult<any> => 
                                result.status === 'fulfilled' && result.value !== null
                            )
                            .map(result => result.value)
                            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                            .slice(0, 10); // Limit to top 10 closest
                    }
                }
            } catch (err) {
                console.error('Error fetching from OpenStreetMap:', err);
            }
        }

        // Return empty array if no clinics found (no dummy data)
        // Frontend will show "No facilities found" message

        // Ensure we return coordinates even if clinics are empty
        const responseLocation = lat && lon ? {
            latitude: lat,
            longitude: lon
        } : (profile?.location?.latitude && profile?.location?.longitude ? {
            latitude: profile.location.latitude,
            longitude: profile.location.longitude
        } : null);

        // Debug logging
        console.log('Nearby Clinics API Response:', {
            hasCoordinates: !!(lat && lon),
            coordinates: lat && lon ? { lat, lon } : null,
            clinicsCount: clinics.length,
            searchLocation,
            responseLocation,
            searchParams: {
                searchLat,
                searchLon,
                searchPinCode,
                searchQuery,
                searchCity,
                searchState
            }
        });

        return NextResponse.json({
            success: true,
            clinics,
            userLocation: responseLocation,
            searchLocation: searchLocation || (profile?.location ? {
                city: profile.location.city,
                state: profile.location.state,
                pinCode: profile.location.pinCode
            } : null)
        });

    } catch (error: unknown) {
        console.error('Nearby Clinics Error:', error);
        // Return empty clinics on error (no dummy data)
        return NextResponse.json({
            success: true,
            clinics: [],
            userLocation: null,
            searchLocation: null
        });
    }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
