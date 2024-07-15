import { useState } from "react";
import useFirebase from "@/hooks/useFirebase";
import useGooglePlaces from "@/hooks/useGooglePlaces";
import useStore from "@/store/store";
import { TypePlace } from "@/types/place";

const useSearchPlaces = (searchKeyword: string) => {
  const { $place } = useStore();
  const { getPlaces, savePlaces } = useFirebase();
  const { searchNearbyPlaces } = useGooglePlaces();
  const [places, setPlaces] = useState<TypePlace[]>([]);

  /**
   * Firebase에서 장소를 검색합니다.
   * @param lat 위도
   * @param lng 경도
   */
  const searchFirebasePlaces = async (
    lat: number,
    lng: number
  ): Promise<TypePlace[]> => {
    try {
      const firebasePlaces = await getPlaces(
        lat,
        lng,
        $place.searchDistance / 1000
      );
      return firebasePlaces;
    } catch (error) {
      console.error("Firebase에서 장소 검색 중 오류 발생:", error);
      return [];
    }
  };

  /**
   * Google Places API를 사용하여 장소를 검색합니다.
   * @param lat 위도
   * @param lng 경도
   */
  const searchGooglePlaces = async (
    lat: number,
    lng: number
  ): Promise<TypePlace[]> => {
    try {
      const googlePlaces = await searchNearbyPlaces(
        lat,
        lng,
        $place.googleSearchDistance,
        searchKeyword
      );
      savePlaces(googlePlaces);
      return googlePlaces;
    } catch (error) {
      console.error("Google Places API 검색 중 오류 발생:", error);
      return [];
    }
  };

  /**
   * 주어진 위치를 기준으로 장소를 검색합니다. (Firebase 또는 Google Places API)
   * @param lat 위도
   * @param lng 경도
   */
  const searchPlaces = async (lat: number, lng: number) => {
    try {
      // Firebase에서 장소 검색
      const firebasePlaces = await searchFirebasePlaces(lat, lng);

      if (firebasePlaces.length > 0) {
        setPlaces(firebasePlaces);
        $place.setSearchResults(firebasePlaces);
      } else {
        console.debug(
          "저장된 장소가 없습니다. Google Places API를 사용하여 검색합니다."
        );
        // Google Places API를 사용하여 검색
        const googlePlaces = await searchGooglePlaces(lat, lng);
        setPlaces(googlePlaces);
        $place.setSearchResults(googlePlaces);
      }
    } catch (error) {
      console.error("장소 검색 중 오류 발생:", error);
      // 에러 처리 로직 추가
    }
  };

  return { places, searchPlaces, searchFirebasePlaces, searchGooglePlaces };
};

export default useSearchPlaces;
