"use client";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "400px" };
const center = { lat: 10.762622, lng: 106.660172 };

export default function BusMap_GG({ buses }: { buses: any[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GG_MAPS_KEY;

  return (
    <LoadScript googleMapsApiKey={apiKey!}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            position={{ lat: bus.lat, lng: bus.lng }}
            label={bus.busNumber}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
