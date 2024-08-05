import { useState } from "react";
import useFirebase from "@/hooks/useFirebase";
import useGooglePlaces from "@/hooks/useGooglePlaces";
import useStore from "@/store/store";
import { TypePlace } from "@/types/place";

const useSearchPlaces = (searchKeyword: string) => {
  const { $place } = useStore();
  const { getPlaces, savePlaces } = useFirebase();
  const { searchAllNearbyPlaces } = useGooglePlaces();
  const [places, setPlaces] = useState<TypePlace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Firebase에서 주변 장소 검색
  const searchFirebasePlaces = async (
    lat: number,
    lng: number
  ): Promise<TypePlace[]> => {
    try {
      const firebasePlaces = await getPlaces(
        lat,
        lng,
        $place.SearchDistanceMax / 1000
      );
      return firebasePlaces;
    } catch (error) {
      console.error("Firebase에서 장소 검색 중 오류 발생:", error);
      setError("Firebase에서 장소 검색 중 오류가 발생했습니다.");
      return [];
    }
  };

  // Google Places API를 사용하여 주변 장소 검색
  const searchGooglePlaces = async (
    lat: number,
    lng: number
  ): Promise<TypePlace[]> => {
    try {
      const googlePlaces = await searchAllNearbyPlaces(
        lat,
        lng,
        $place.googleSearchDistance,
        searchKeyword
      );
      await savePlaces(googlePlaces);
      return googlePlaces;
    } catch (error) {
      console.error("Google Places API 검색 중 오류 발생:", error);
      setError("Google Places API 검색 중 오류가 발생했습니다.");
      return [];
    }
  };

  // Firebase 또는 Google Places API를 사용하여 주변 장소 검색
  const searchPlaces = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const firebasePlaces = await searchFirebasePlaces(lat, lng);

      if (firebasePlaces.length > 0) {
        setPlaces(firebasePlaces);
        $place.setSearchResults(firebasePlaces);
      } else {
        console.debug(
          "저장된 장소가 없습니다. Google Places API를 사용하여 검색합니다."
        );
        const googlePlaces = await searchGooglePlaces(lat, lng);
        setPlaces(googlePlaces);
        $place.setSearchResults(googlePlaces);
      }
    } catch (error) {
      console.error("장소 검색 중 오류 발생:", error);
      setError("장소 검색 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { places, searchPlaces, searchFirebasePlaces, searchGooglePlaces, isLoading, error };
};

export default useSearchPlaces;
