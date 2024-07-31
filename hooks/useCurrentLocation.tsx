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
      const TIMEOUT = 5 * 1000;

      const getPositionPromise = () =>
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: TIMEOUT,
            maximumAge: 0,
          });
        });

      const getGoogleLocation = async () => {
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
        return { lat: data.location.lat, lng: data.location.lng };
      };

      try {
        if ("geolocation" in navigator) {
          console.log("Geolocation is supported, trying to get position");
          try {
            const position = await Promise.race([
              getPositionPromise(),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Geolocation timeout")), TIMEOUT)
              )
            ]);
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          } catch (geoError) {
            console.log("Geolocation failed or timed out, falling back to Google API", geoError);
            const googleLocation = await getGoogleLocation();
            setLocation(googleLocation);
          }
        } else {
          console.log("Geolocation is not supported, using Google API");
          const googleLocation = await getGoogleLocation();
          setLocation(googleLocation);
        }
      } catch (err) {
        console.error("Error getting location:", err);
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