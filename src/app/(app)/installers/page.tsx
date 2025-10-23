"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Haversine formula to calculate distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

type Installer = {
  id: string;
  companyName: string;
  serviceLocations: string;
  pricingDetails: string;
  photoURL: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
};


export default function InstallersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { data: installers, loading } = useCollection<Installer>(firestore, 'users', ['where', 'role', '==', 'installer']);
  const [sortedInstallers, setSortedInstallers] = useState<Installer[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your location. Showing default order.",
          });
        }
      );
    }
  }, [toast]);

  useEffect(() => {
    if (installers && installers.length > 0) {
      let installersToSort = installers.filter(installer => installer.companyName); // Only show installers with a company name

      // Calculate distance if user location is available
      if (userLocation) {
        installersToSort = installersToSort.map(installer => ({
          ...installer,
          distance: installer.latitude && installer.longitude
            ? getDistance(userLocation.lat, userLocation.lng, installer.latitude, installer.longitude)
            : Infinity,
        }));
         installersToSort.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      setSortedInstallers(installersToSort);
    }
  }, [installers, userLocation]);

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
          Find Verified Installers
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our network of trusted solar professionals and view their products and services.
        </p>
      </div>

       {loading ? (
         <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
            {sortedInstallers.map((installer) => (
                <Card key={installer.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={installer.photoURL} alt={installer.companyName} />
                        <AvatarFallback>{installer.companyName?.charAt(0) || 'I'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-headline text-xl font-semibold">{installer.companyName}</h3>
                        <p className="text-sm text-muted-foreground">{installer.serviceLocations}</p>
                        <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 mt-2">
                            <Badge variant="secondary">{installer.pricingDetails}</Badge>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                       <Button asChild>
                           <Link href={`/installers/${installer.id}`}>
                                View Profile <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                       </Button>
                    </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}

    