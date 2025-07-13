import React from "react";

interface GoogleMapProps {
  address?: string | null;
  locationName?: string | null;
  width?: string;
  height?: string;
  className?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  address,
  locationName,
  width = "100%",
  height = "300px",
  className = "",
}) => {
  if (!address && !locationName) {
    return null;
  }

  // Build query with location name and address for better display
  let query = "";
  if (locationName && address) {
    query = `${locationName}, ${address}`;
  } else if (address) {
    query = address;
  } else if (locationName) {
    query = locationName;
  }

  const encodedQuery = encodeURIComponent(query);

  // Google Maps Embed API URL
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodedQuery}`;

  return (
    <div className={`google-map-container ${className}`}>
      <iframe
        width={width}
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
        title={`Map showing ${locationName || address}`}
      />
    </div>
  );
};
