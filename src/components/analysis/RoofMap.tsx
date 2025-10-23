"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Map, Pin, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Camera, Trash2, Pencil, LocateFixed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type RoofMapProps = {
  onScreenshot: (dataUrl: string, polygon: google.maps.LatLngLiteral[]) => void;
};

export default function RoofMap({ onScreenshot }: RoofMapProps) {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [pinPosition, setPinPosition] = useState({ lat: 34.052235, lng: -118.243683 });
  const [drawingManager, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const drawingLib = useMapsLibrary('drawing');
  const map = useMap();

  useEffect(() => {
    if (!map || !drawingLib) {
      return;
    }

    const newDrawingManager = new drawingLib.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: 'hsl(var(--primary) / 0.2)',
        strokeColor: 'hsl(var(--primary))',
        strokeWeight: 2,
        editable: true,
      },
    });

    newDrawingManager.setMap(map);
    setDrawingManager(newDrawingManager);

    const overlayCompleteListener = (event: google.maps.drawing.OverlayCompleteEvent) => {
        if (polygon) {
            polygon.setMap(null);
        }
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            const newPolygon = event.overlay as google.maps.Polygon;
            setPolygon(newPolygon);
            newDrawingManager.setDrawingMode(null);
        }
    };

    google.maps.event.addListener(newDrawingManager, 'overlaycomplete', overlayCompleteListener);

    return () => {
      google.maps.event.clearListeners(newDrawingManager, 'overlaycomplete');
      newDrawingManager.setMap(null);
    };
  }, [map, drawingLib, polygon]);


  const startDrawing = () => {
    if (drawingManager) {
      if(polygon) {
        polygon.setMap(null);
        setPolygon(null);
      }
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const clearDrawing = () => {
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }
  };

  const handleScreenshot = async () => {
    if (mapRef.current && polygon) {
      const path = polygon.getPath().getArray();
      const polygonCoords = path.map(p => ({ lat: p.lat(), lng: p.lng() }));
      
      // Temporarily hide polygon for cleaner screenshot
      polygon.setVisible(false);

      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      onScreenshot(dataUrl, polygonCoords);
      
      // Show polygon again
      polygon.setVisible(true);
    }
  };
  
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setPinPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  };

  const goToMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPinPosition(newPos);
          map?.setCenter(newPos);
          map?.setZoom(19);
        },
        () => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Unable to retrieve your location. Please ensure location services are enabled.",
          });
        }
      );
    } else {
       toast({
        variant: "destructive",
        title: "Location Error",
        description: "Geolocation is not supported by your browser.",
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full">
        <Map
          defaultCenter={pinPosition}
          defaultZoom={19}
          mapId="hybrid_map"
          mapTypeId="hybrid"
          onClick={handleMapClick}
          disableDefaultUI={true}
          gestureHandling={'greedy'}
        >
          <AdvancedMarker position={pinPosition}>
            <Pin background={'hsl(var(--primary))'} glyphColor={'white'} borderColor={'white'} />
          </AdvancedMarker>
        </Map>
      </div>
      <div className="absolute top-4 left-4 z-10">
        <Card>
            <CardContent className="p-2 flex gap-2">
                <Button onClick={startDrawing} variant="outline" size="icon" aria-label="Draw roof area">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button onClick={clearDrawing} variant="destructive" size="icon" aria-label="Clear roof area" disabled={!polygon}>
                    <Trash2 className="h-4 w-4" />
                </Button>
                <Button onClick={goToMyLocation} variant="outline" size="icon" aria-label="Go to my location">
                    <LocateFixed className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <Button onClick={handleScreenshot} size="lg" disabled={!polygon}>
          <Camera className="mr-2" />
          Capture Roof
        </Button>
      </div>
    </div>
  );
}
