import { useState, useEffect } from "react";

const useCurrentLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number }>();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice =
      /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(
        userAgent
      );
    // isMobileDevice && navigator.geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => { },
        {
          enableHighAccuracy: true,
          timeout: 5000, // 타임아웃 시간 설정
          maximumAge: 0, // 캐시된 위치 사용 안 함
        }
      );
    } else {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
      const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          setLocation({ lat: data.location.lat, lng: data.location.lng });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, []);

  return location;
};

export default useCurrentLocation;
