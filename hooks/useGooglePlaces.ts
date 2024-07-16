import { useCallback } from "react";
import { TypePlace } from "@/types/place";

interface UseGooglePlacesResult {
  searchNearbyPlaces: (
    lat: number,
    lng: number,
    radius: number,
    keyword: string
  ) => Promise<TypePlace[]>;
}

/**
 * Google Places API를 사용하여 장소를 검색하는 커스텀 훅
 * @returns {UseGooglePlacesResult} 장소 검색 함수
 */
const useGooglePlaces = (): UseGooglePlacesResult => {
  /**
   * 주변 장소를 검색하는 함수
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {number} radius - 검색 반경 (미터)
   * @param {string} keyword - 검색 키워드
   * @returns {Promise<TypePlace[]>} 검색된 장소 목록
   */
  const searchNearbyPlaces = useCallback(
    async (
      lat: number,
      lng: number,
      radius: number,
      keyword: string
    ): Promise<TypePlace[]> => {
      return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
          reject(new Error("Google Maps API가 로드되지 않았습니다."));
          return;
        }

        const service = new google.maps.places.PlacesService(
          document.createElement("div")
        );

        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(lat, lng),
          radius,
          keyword,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const typePlaces: TypePlace[] = results.map((result) => ({
              place_id: result.place_id || "",
              name: result.name || "",
              lat_lng: `${result.geometry?.location?.lat()}_${result.geometry?.location?.lng()}`,
              location: {
                lat: result.geometry?.location?.lat() ?? 0,
                lng: result.geometry?.location?.lng() ?? 0,
              },
              address: result.vicinity || "",
              types: result.types || [],
              rating: result.rating || 0,
              user_ratings_total: result.user_ratings_total || 0,
              lastUpdated: new Date().toLocaleString("ko-KR"),
              photos: result.photos || [],
              reviews: result.reviews || [],
            }));
            resolve(typePlaces);
          } else {
            reject(new Error(`장소 검색 실패: ${status}`));
          }
        });
      });
    },
    []
  );

  return { searchNearbyPlaces };
};

export default useGooglePlaces;
