import { useCallback } from "react";
import { TypePlace } from "@/types/place";
import useStore from "@/store/store";

interface UseGooglePlacesResult {
  searchAllNearbyPlaces: (
    lat: number,
    lng: number,
    radius: number,
    keyword: string
  ) => Promise<TypePlace[]>;
}

const useGooglePlaces = (): UseGooglePlacesResult => {
  const { $place } = useStore();

  const fetchPlaceDetails = useCallback((placeId: string) => {
    return new Promise<google.maps.places.PlaceResult | null>(
      (resolve, reject) => {
        const service = new google.maps.places.PlacesService(
          document.createElement("div")
        );

        service.getDetails({ placeId }, (placeDetails, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(placeDetails);
          } else {
            console.error(`Place Details API 호출 실패: ${status}`);
            resolve(null);
          }
        });
      }
    );
  }, []);

  const searchNearbyPlaces = useCallback(
    async (
      lat: number,
      lng: number,
      radius: number,
      keyword: string
    ): Promise<TypePlace[]> => {
      return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
          console.error("Google Maps API가 로드되지 않았습니다.");
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

        $place.setCurrentSearchSectionCoords({ lat: lat, lng: lng });
        $place.setCurrentSearchSectionDistance(radius);

        const allPlaces: TypePlace[] = [];

        const searchCallback = async (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus,
          pagination: google.maps.places.PlaceSearchPagination | null
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            for (const result of results) {
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
                reviews: [], // 기본적으로 빈 배열로 초기화
              };

              // 리뷰가 있는 경우에만 Place Details API 호출
              if (result.rating && result.rating > 0) {
                const details = await fetchPlaceDetails(result.place_id || "");
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
            }

            console.log(
              `Added ${allPlaces.length} places. Total: ${allPlaces.length}`
            );

            if (pagination && pagination.hasNextPage) {
              console.log("다음 페이지의 결과를 가져옵니다...");
              setTimeout(() => {
                pagination.nextPage();
              }, 2000); // Google API의 속도 제한을 고려하여 2초 대기
            } else {
              console.log(
                `검색 완료. 총 ${allPlaces.length}개의 장소를 찾았습니다.`
              );
              resolve(allPlaces);
            }
          } else {
            if (
              status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
            ) {
              console.log("결과가 없습니다.");
              resolve(allPlaces); // 결과가 없어도 빈 배열을 반환하여 넘어감
            } else {
              console.error(`장소 검색 실패: ${status}`);
              reject(new Error(`장소 검색 실패: ${status}`));
            }
          }
        };

        console.log(
          `장소 검색 시작: (lat: ${lat}, lng: ${lng}, radius: ${radius}, keyword: ${keyword})`
        );
        service.nearbySearch(request, searchCallback);
      });
    },
    [fetchPlaceDetails]
  );

  const searchAllNearbyPlaces = useCallback(
    async (
      lat: number,
      lng: number,
      radius: number,
      keyword: string
    ): Promise<TypePlace[]> => {
      console.log("모든 인근 장소 검색 시작...");

      // 전체 반경을 쪼개서 검색하는 방식
      const DIVISION_FACTOR = 8; // 주어진 반경을 더 작은 반경으로 나눔
      const RADIUS_STEP = radius / DIVISION_FACTOR;
      const searchRegions = [];

      // 검색 영역 계산
      for (let i = -DIVISION_FACTOR / 2; i <= DIVISION_FACTOR / 2; i++) {
        for (let j = -DIVISION_FACTOR / 2; j <= DIVISION_FACTOR / 2; j++) {
          if (i === 0 && j === 0) continue; // 중심 영역은 중복 제거
          searchRegions.push({
            lat: lat + (i * RADIUS_STEP) / 111320, // 위도 변환 (1도는 약 111.32km)
            lng:
              lng +
              (j * RADIUS_STEP) /
                ((40075000 * Math.cos((lat * Math.PI) / 180)) / 360), // 경도 변환 (경도는 위도에 따라 다름)
            radius: RADIUS_STEP,
          });
        }
      }

      const allResults: TypePlace[] = [];

      for (const region of searchRegions) {
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
          throw error;
        }
      }

      // 중복 제거
      const uniqueResults = allResults.filter(
        (place, index, self) =>
          index === self.findIndex((p) => p.place_id === place.place_id)
      );

      console.log(`중복 제거 후 최종 장소 수: ${uniqueResults.length}`);
      return uniqueResults;
    },
    [searchNearbyPlaces]
  );

  return { searchAllNearbyPlaces };
};

export default useGooglePlaces;
