import React, { useState, useEffect } from "react";

interface GoogleMapProps {
  address?: string | null;
  locationName?: string | null;
  width?: string;
  height?: string | { base: string; md: string } | string;
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
  // Append city/state/zip for accurate geocoding
  let query = "";
  if (locationName && address) {
    query = `${locationName}, ${address}, Beacon, NY 12508`;
  } else if (address) {
    query = `${address}, Beacon, NY 12508`;
  } else if (locationName) {
    query = `${locationName}, Beacon, NY 12508`;
  }

  const encodedQuery = encodeURIComponent(query);

  // Google Maps Embed API URL
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodedQuery}`;

  // Set initial height with SSR-safe default
  const [resolvedHeight, setResolvedHeight] = useState(
    typeof height === "object" ? height.md : height,
  );

  // Update height based on window size on client side
  useEffect(() => {
    if (typeof height === "object") {
      const handleResize = () => {
        setResolvedHeight(window.innerWidth < 768 ? height.base : height.md);
      };

      // Set initial value
      handleResize();

      // Add resize listener
      window.addEventListener("resize", handleResize);

      // Clean up
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [height]);

  return (
    <div className={`google-map-container ${className}`}>
      <iframe
        width={width}
        height={resolvedHeight}
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
