import { useCallback } from "react";

interface UseGeocodingResult {
  getAddressFromLatLng: (lat: number, lng: number) => Promise<string | null>;
}

const useGeocoding = (): UseGeocodingResult => {
  const getAddressFromLatLng = useCallback(
    (lat: number, lng: number): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
          console.error("Google Maps API가 로드되지 않았습니다.");
          reject(new Error("Google Maps API가 로드되지 않았습니다."));
          return;
        }

        const geocoder = new google.maps.Geocoder();
        const latlng = new google.maps.LatLng(lat, lng);

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results &&
            results.length > 0
          ) {
            console.log(results);
            resolve(results[0].formatted_address || null);
          } else {
            console.error(`Geocoding API 호출 실패: ${status}`);
            resolve(null);
          }
        });
      });
    },
    []
  );

  return { getAddressFromLatLng };
};

export default useGeocoding;
