import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lng: number;
}

interface UseCurrentLocationResult {
  location: Location | null;
  error: string | null;
}

/**
 * 사용자의 현재 위치를 가져오는 커스텀 훅
 * @returns {UseCurrentLocationResult} 위치 정보와 에러 상태
 */
const useCurrentLocation = (): UseCurrentLocationResult => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      const isMobileDevice =
        /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(
          navigator.userAgent.toLowerCase()
        );

      try {
        if (isMobileDevice && "geolocation" in navigator) {
          alert("Mobile device detected");
          console.log("Mobile device detected");
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              });
            }
          );

          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        } else {
          console.log("Non-mobile device or geolocation not supported");
          const response = await fetch(
            `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch location from Google API");
          }

          const data = await response.json();
          setLocation({ lat: data.location.lat, lng: data.location.lng });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      }
    };

    getUserLocation();
  }, []);

  return { location, error };
};

export default useCurrentLocation;
