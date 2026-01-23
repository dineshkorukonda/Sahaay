"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Phone, Clock, DollarSign, Navigation } from "lucide-react";

interface Clinic {
    id: string;
    name: string;
    address: string;
    distance: string;
    phone: string;
    hours: string;
    price: string;
    rating: number;
}

export default function NearbyClinics() {
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch nearby clinics based on user's location
        const fetchClinics = async () => {
            try {
                const res = await fetch('/api/nearby-clinics');
                const data = await res.json();
                if (res.ok && data.success) {
                    setClinics(data.clinics || []);
                } else {
                    // Fallback to dummy data
                    setClinics(getDummyClinics());
                }
            } catch (err) {
                console.error('Error fetching clinics:', err);
                // Fallback to dummy data
                setClinics(getDummyClinics());
            } finally {
                setLoading(false);
            }
        };

        fetchClinics();
    }, []);

    const getDummyClinics = (): Clinic[] => {
        return [
            {
                id: '1',
                name: 'City Health Clinic',
                address: '123 Main Street, Downtown',
                distance: '0.8 km',
                phone: '+1 (555) 123-4567',
                hours: 'Mon-Fri: 9AM-6PM',
                price: '₹500 - ₹1,200',
                rating: 4.5
            },
            {
                id: '2',
                name: 'Community Medical Center',
                address: '456 Oak Avenue, Midtown',
                distance: '1.2 km',
                phone: '+1 (555) 234-5678',
                hours: 'Mon-Sat: 8AM-8PM',
                price: '₹400 - ₹1,000',
                rating: 4.3
            },
            {
                id: '3',
                name: 'Family Care Clinic',
                address: '789 Pine Road, Uptown',
                distance: '2.1 km',
                phone: '+1 (555) 345-6789',
                hours: 'Mon-Fri: 10AM-7PM',
                price: '₹600 - ₹1,500',
                rating: 4.7
            },
            {
                id: '4',
                name: 'Neighborhood Health Hub',
                address: '321 Elm Street, Suburb',
                distance: '3.5 km',
                phone: '+1 (555) 456-7890',
                hours: 'Mon-Sun: 7AM-9PM',
                price: '₹350 - ₹900',
                rating: 4.2
            },
            {
                id: '5',
                name: 'Wellness Care Clinic',
                address: '654 Maple Drive, Eastside',
                distance: '4.2 km',
                phone: '+1 (555) 567-8901',
                hours: 'Mon-Fri: 9AM-5PM',
                price: '₹450 - ₹1,100',
                rating: 4.4
            }
        ];
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Finding nearby clinics...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-medium text-foreground mb-2">Nearby Healthcare Facilities</h2>
                <p className="text-muted-foreground">
                    Since you haven't uploaded medical records yet, here are some nearby healthcare facilities you can visit.
                </p>
            </div>

            <div className="space-y-4">
                {clinics.map((clinic) => (
                    <div
                        key={clinic.id}
                        className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-foreground mb-2">{clinic.name}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{clinic.address}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Navigation className="w-4 h-4" />
                                        <span>{clinic.distance} away</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        <span>{clinic.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 mb-2">
                                    <span className="text-lg font-bold text-primary">{clinic.rating}</span>
                                    <span className="text-muted-foreground">⭐</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{clinic.hours}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="font-semibold text-foreground">{clinic.price}</span>
                                </div>
                            </div>
                            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-colors">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                    💡 Tip: Upload your medical records to get personalized care recommendations and track your health history.
                </p>
            </div>
        </div>
    );
}
