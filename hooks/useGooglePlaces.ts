import { useCallback, useEffect, useState } from "react";
import { TypePlace } from "@/types/place";
import useStore from "@/store/store";

/**
 * useGooglePlaces 훅에서 반환되는 결과의 구조를 정의합니다.
 */
interface UseGooglePlacesResult {
  /**
   * 지정된 반경과 키워드 내에서 모든 인근 장소를 검색합니다.
   * @param lat - 중심점의 위도.
   * @param lng - 중심점의 경도.
   * @param radius - 검색 반경 (미터 단위).
   * @param keyword - 장소를 필터링할 키워드.
   * @returns TypePlace 객체 배열을 반환하는 프로미스.
   */
  searchAllNearbyPlaces: (
    lat: number,
    lng: number,
    radius: number,
    keyword: string
  ) => Promise<TypePlace[]>;
}

/**
 * Google Places API와 상호작용하는 커스텀 React 훅입니다.
 * 인근 장소 검색 및 세부 정보 가져오기 기능을 제공합니다.
 * @returns searchAllNearbyPlaces 함수를 포함하는 객체.
 */
const useGooglePlaces = (): UseGooglePlacesResult => {
  const { $place } = useStore();
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  /**
   * 클라이언트 사이드에서만 PlacesService 인스턴스를 초기화합니다.
   */
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      setPlacesService(service);
    }
  }, []);

  /**
   * 특정 장소 ID를 사용하여 해당 장소의 세부 정보를 가져옵니다.
   * @param placeId - 장소의 고유 식별자.
   * @returns PlaceResult 객체 또는 가져오기 실패 시 null을 반환하는 프로미스.
   */
  const fetchPlaceDetails = useCallback(
    (placeId: string): Promise<google.maps.places.PlaceResult | null> => {
      if (!placesService) {
        console.error("PlacesService가 초기화되지 않았습니다.");
        return Promise.resolve(null);
      }

      return new Promise((resolve) => {
        placesService.getDetails({ placeId }, (placeDetails, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(placeDetails);
          } else {
            console.error(`Place Details API 호출 실패: ${status}`);
            resolve(null);
          }
        });
      });
    },
    [placesService]
  );

  /**
   * 제공된 매개변수를 기반으로 인근 장소를 검색합니다.
   * 각 결과에 대해 세부 정보를 가져옵니다.
   * @param lat - 검색 중심의 위도.
   * @param lng - 검색 중심의 경도.
   * @param radius - 검색 반경 (미터 단위).
   * @param keyword - 장소를 필터링할 키워드.
   * @returns TypePlace 객체 배열을 반환하는 프로미스.
   */
  const searchNearbyPlaces = useCallback(
    async (
      lat: number,
      lng: number,
      radius: number,
      keyword: string
    ): Promise<TypePlace[]> => {
      if (!placesService) {
        throw new Error("Google Maps API가 로드되지 않았습니다.");
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new window.google.maps.LatLng(lat, lng),
        radius,
        keyword,
      };

      // 현재 검색 좌표와 반경을 스토어에 업데이트
      $place.setCurrentSearchSectionCoords({ lat, lng });
      $place.setCurrentSearchSectionDistance(radius);

      const allPlaces: TypePlace[] = [];

      /**
       * nearbySearch API 호출의 결과를 처리하는 콜백 함수입니다.
       * 각 결과를 처리하고, 필요한 경우 추가 세부 정보를 가져와 장소를 누적합니다.
       * 페이징 처리를 통해 추가 페이지가 있는 경우 가져옵니다.
       * @param results - API에서 반환된 PlaceResult 객체 배열.
       * @param status - API 호출 상태.
       * @param pagination - 여러 페이지의 결과를 처리하기 위한 페이징 객체.
       */
      return new Promise((resolve, reject) => {
        placesService.nearbySearch(
          request,
          async (results, status, pagination) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              console.table(results);
              const placePromises = results.map(async (result) => {
                const typePlace: TypePlace = {
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
                  reviews: [],
                };

                // 평점이 있는 경우에만 장소 세부 정보 가져오기
                if (result.rating && result.rating > 0) {
                  const details = await fetchPlaceDetails(
                    result.place_id || ""
                  );
                  if (details && details.reviews) {
                    typePlace.reviews = details.reviews.map((review) => ({
                      author_name: review.author_name,
                      rating: review.rating,
                      text: review.text,
                      time: review.relative_time_description,
                    }));
                  }
                }

                allPlaces.push(typePlace);
              });

              // 모든 장소 세부 정보 가져오기를 대기
              await Promise.all(placePromises);

              console.log(
                `추가된 장소 수: ${allPlaces.length}. 총: ${allPlaces.length}`
              );

              // 추가 결과가 있는 경우 페이징 처리
              if (pagination && pagination.hasNextPage) {
                console.log("load--", "다음 페이지의 결과를 가져옵니다...");
                setTimeout(() => {
                  pagination.nextPage();
                }, 2000); // Google API의 속도 제한을 고려하여 2초 대기
              } else {
                console.log(
                  "load--",
                  `검색 완료. 총 ${allPlaces.length}개의 장소를 찾았습니다.`
                );
                resolve(allPlaces);
              }
            } else {
              if (
                status ===
                window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
              ) {
                console.log("결과가 없습니다.");
                resolve(allPlaces); // 결과가 없어도 빈 배열을 반환하여 넘어감
              } else {
                console.error(`장소 검색 실패: ${status}`);
                reject(new Error(`장소 검색 실패: ${status}`));
              }
            }
          }
        );
      });
    },
    [fetchPlaceDetails, placesService, $place]
  );

  /**
   * 지정된 반경 내에서 모든 인근 장소를 검색하기 위해 영역을 작은 지역으로 분할하여 검색합니다.
   * 모든 지역의 결과를 집계하고 중복을 제거합니다.
   * @param lat - 중심점의 위도.
   * @param lng - 중심점의 경도.
   * @param radius - 총 검색 반경 (미터 단위).
   * @param keyword - 장소를 필터링할 키워드.
   * @returns 고유한 TypePlace 객체 배열을 반환하는 프로미스.
   */
  const searchAllNearbyPlaces = useCallback(
    async (
      lat: number,
      lng: number,
      radius: number,
      keyword: string
    ): Promise<TypePlace[]> => {
      console.log("모든 인근 장소 검색 시작...");

      const DIVISION_FACTOR = 8; // 반경을 나눌 분할 수
      const RADIUS_STEP = radius / DIVISION_FACTOR; // 각 작은 검색의 반경
      const searchRegions: { lat: number; lng: number; radius: number }[] = [];

      /**
       * 전체 반경을 작은 단계로 나누어 검색 영역을 계산합니다.
       * 지구 곡률을 고려하여 위도와 경도를 조정합니다.
       */
      for (
        let i = -Math.floor(DIVISION_FACTOR / 2);
        i <= Math.floor(DIVISION_FACTOR / 2);
        i++
      ) {
        for (
          let j = -Math.floor(DIVISION_FACTOR / 2);
          j <= Math.floor(DIVISION_FACTOR / 2);
          j++
        ) {
          if (i === 0 && j === 0) continue; // 중심 영역은 중복 제거
          searchRegions.push({
            lat: lat + (i * RADIUS_STEP) / 111320, // 미터를 위도 도 단위로 변환
            lng:
              lng +
              (j * RADIUS_STEP) /
                ((40075000 * Math.cos((lat * Math.PI) / 180)) / 360), // 미터를 경도 도 단위로 변환
            radius: RADIUS_STEP,
          });
        }
      }

      const allResults: TypePlace[] = [];

      /**
       * 계산된 모든 영역에 대해 병렬로 검색을 시작합니다.
       * 결과를 집계하고 개별 검색 오류가 전체 프로세스를 중단하지 않도록 처리합니다.
       */
      const searchPromises = searchRegions.map(async (region) => {
        try {
          const places = await searchNearbyPlaces(
            region.lat,
            region.lng,
            region.radius,
            keyword
          );
          if (places.length > 0) {
            allResults.push(...places);
            console.log(`현재 누적된 장소 수: ${allResults.length}`);
          } else {
            console.log(
              `해당 영역에 결과가 없습니다: (lat: ${region.lat}, lng: ${region.lng})`
            );
          }
        } catch (error) {
          console.error("Google Places API 검색 중 오류 발생:", error);
          // 개별 검색 실패는 전체 검색을 중단하지 않음
        }
      });

      // 모든 지역 검색이 완료될 때까지 대기
      await Promise.all(searchPromises);

      /**
       * place_id를 기준으로 중복된 장소를 제거하여 최종 결과의 고유성을 보장합니다.
       */
      const uniqueResults = Array.from(
        new Map(allResults.map((place) => [place.place_id, place])).values()
      );

      console.log(`중복 제거 후 최종 장소 수: ${uniqueResults.length}`);
      return uniqueResults;
    },
    [searchNearbyPlaces]
  );

  return { searchAllNearbyPlaces };
};

export default useGooglePlaces;
