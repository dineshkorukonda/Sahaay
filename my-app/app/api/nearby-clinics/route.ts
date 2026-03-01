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
        // Verify User - support both cookie and Bearer token
        const authHeader = req.headers.get('authorization');
        let userId: string;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        } else {
            const token = (await cookies()).get('token')?.value;
            if (!token) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        }

        await connectDB();
        const profile = await Profile.findOne({ userId });

        // Get location from query params or use profile location
        const url = new URL(req.url);
        const searchLat = url.searchParams.get('lat');
        const searchLon = url.searchParams.get('lon');
        const searchPinCode = url.searchParams.get('pinCode');
        const searchCity = url.searchParams.get('city');
        const searchState = url.searchParams.get('state');
        const searchQuery = url.searchParams.get('q');

        const googleApiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
        if (!googleApiKey) {
            throw new Error('GOOGLE_API_KEY is not defined');
        }

        let lat: number | null = null;
        let lon: number | null = null;
        let searchLocation: { city?: string; state?: string; pinCode?: string } | null = null;

        // --- Geocoding Logic (Simplified for Google Maps) ---
        // If lat/lon provided, use them
        if (searchLat && searchLon) {
            lat = parseFloat(searchLat);
            lon = parseFloat(searchLon);
        }
        // If text query provided, geocode it
        else if (searchQuery || searchPinCode || (searchCity && searchState)) {
            const query = searchQuery ||
                (searchPinCode ? `pincode ${searchPinCode}` : `${searchCity}, ${searchState}`);

            const geoRes = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
            );
            const geoData = await geoRes.json();

            if (geoData.status === 'OK' && geoData.results?.[0]) {
                const location = geoData.results[0].geometry.location;
                lat = location.lat;
                lon = location.lng;

                // Extract address components
                const addressComponents = geoData.results[0].address_components;
                searchLocation = {
                    city: addressComponents.find((c: { types?: string[]; long_name?: string }) => c.types?.includes('locality'))?.long_name || searchCity,
                    state: addressComponents.find((c: { types?: string[]; long_name?: string }) => c.types?.includes('administrative_area_level_1'))?.long_name || searchState,
                    pinCode: addressComponents.find((c: { types?: string[]; long_name?: string }) => c.types?.includes('postal_code'))?.long_name || searchPinCode
                };
            }
        }
        // Fallback to profile location
        else if (profile?.location) {
            if (profile.location.latitude && profile.location.longitude) {
                lat = profile.location.latitude;
                lon = profile.location.longitude;
            } else if (profile.location.city || profile.location.pinCode) {
                // Geocode profile location if cords are missing
                const query = profile.location.pinCode ? `pincode ${profile.location.pinCode}` :
                    `${profile.location.city}, ${profile.location.state || ''}`;

                try {
                    const geoRes = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
                    );
                    const geoData = await geoRes.json();

                    if (geoData.status === 'OK' && geoData.results?.[0]) {
                        const location = geoData.results[0].geometry.location;
                        lat = location.lat;
                        lon = location.lng;
                        searchLocation = {
                            city: profile.location.city,
                            state: profile.location.state,
                            pinCode: profile.location.pinCode
                        };
                    }
                } catch (e) {
                    console.error('Error geocoding profile location:', e);
                }
            }
        }

        if (!lat || !lon) {
            return NextResponse.json({
                success: true,
                clinics: [],
                userLocation: null,
                searchLocation: null
            });
        }

        // --- Fetch Facilities using Google Places API ---
        const facilities: Array<{ id?: string; name: string; address?: string; distance?: string; phone?: string; hours?: string; latitude?: number; longitude?: number; type?: string }> = [];

        // Define types to search
        const searchTypes = [
            { type: 'HOSPITAL', keyword: 'hospital' },
            { type: 'CLINIC', keyword: 'clinic' },
            { type: 'PHARMACY', keyword: 'pharmacy' },
            { type: 'NGO', keyword: 'ngo healthcare' }
        ];

        const errors: string[] = [];

        // Fetch concurrently
        await Promise.all(searchTypes.map(async (searchType) => {
            try {
                // Use New Places API (v1) Text Search
                const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': googleApiKey,
                        'X-Goog-FieldMask': 'places.name,places.displayName,places.formattedAddress,places.location,places.regularOpeningHours'
                    },
                    body: JSON.stringify({
                        textQuery: `${searchType.keyword}`,
                        locationBias: {
                            circle: {
                                center: { latitude: lat, longitude: lon },
                                radius: 5000.0
                            }
                        }
                    })
                });

                const placesData = await response.json();

                if (placesData.places) {
                    const mapped = placesData.places.slice(0, 5).map((place: { name?: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude?: number; longitude?: number }; regularOpeningHours?: { openNow?: boolean } }) => ({ // Limit 5 per category
                        id: place.name, // Resource name (e.g., places/ChIJ...)
                        name: place.displayName?.text || 'Unknown Name',
                        address: place.formattedAddress || 'No address',
                        distance: calculateDistance(lat!, lon!, place.location?.latitude ?? 0, place.location?.longitude ?? 0).toFixed(1) + ' km',
                        phone: 'View on map',
                        hours: place.regularOpeningHours?.openNow ? 'Open Now' : 'Check hours',
                        latitude: place.location?.latitude,
                        longitude: place.location?.longitude,
                        type: searchType.type,
                        amenity: searchType.keyword
                    }));
                    facilities.push(...mapped);
                } else if (placesData.error) {
                    const msg = `[${searchType.type}] API Error: ${placesData.error.code} - ${placesData.error.message}`;
                    console.warn(msg);
                    errors.push(msg);
                }
            } catch (err) {
                console.error(`Error fetching ${searchType.type}:`, err);
                errors.push(`[${searchType.type}] Fetch Error: ${err instanceof Error ? err.message : String(err)}`);
            }
        }));

        // Sort by distance
        const sortedFacilities = facilities.sort((a, b) => parseFloat(a.distance || '0') - parseFloat(b.distance || '0'));

        return NextResponse.json({
            success: true,
            clinics: sortedFacilities,
            debugErrors: errors.length > 0 ? errors : undefined, // Return errors for debugging
            userLocation: { latitude: lat, longitude: lon },
            searchLocation: searchLocation || (profile?.location ? {
                city: profile.location.city,
                state: profile.location.state,
                pinCode: profile.location.pinCode
            } : null)
        });

    } catch (error: unknown) {
        console.error('Nearby Clinics Error:', error);
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
