import {
  ref,
  set,
  get,
  query,
  orderByChild,
  startAt,
  endAt,
} from "firebase/database";
import { database } from "@/firebase/firebasedb";
import { TypePlace } from "@/types/place";

interface UseFirebaseResult {
  saveUser: (uid: string, lat: number, lng: number) => Promise<void>;
  getPlaces: (lat: number, lng: number, radius: number) => Promise<TypePlace[]>;
  savePlaces: (places: TypePlace[]) => Promise<void>;
}

/**
 * Firebase 데이터베이스 작업을 위한 커스텀 훅
 * @returns {UseFirebaseResult} Firebase 관련 함수들
 */
export function useFirebase(): UseFirebaseResult {
  /**
   * 사용자 위치 데이터를 Firebase에 저장
   * @param {string} uid - 사용자 ID
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   */
  const saveUser = async (
    uid: string,
    lat: number,
    lng: number
  ): Promise<void> => {
    const locationRef = ref(database, "connect-id/" + `${uid}`);

    try {
      const snapshot = await get(locationRef);
      const visitCount = snapshot.exists() ? snapshot.val().visit_count : 0;

      await set(locationRef, {
        timestamp_kr: new Date().toLocaleString("ko-KR"),
        timestamp: new Date().getTime(),
        visit_count: visitCount + 1,
        coord: `${lat},${lng}`,
      });
    } catch (error) {
      console.error("Firebase에 연결 데이터를 전송하는 동안 오류 발생:", error);
      throw error;
    }
  };

  /**
   * 주어진 위치와 반경을 기준으로 장소 데이터를 Firebase에서 가져옴
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {number} radius - 검색 반경 (km)
   * @returns {Promise<TypePlace[]>} 검색된 장소 목록
   */
  const getPlaces = async (
    lat: number,
    lng: number,
    radius: number
  ): Promise<TypePlace[]> => {
    const placesRef = ref(database, "places");

    try {
      const snapshot = await get(placesRef);
      if (snapshot.exists()) {
        const places: TypePlace[] = [];
        snapshot.forEach((childSnapshot) => {
          const place: TypePlace = childSnapshot.val();
          const [placeLat, placeLng] = place.lat_lng.split("_").map(Number);
          if (calculateDistance(lat, lng, placeLat, placeLng) <= radius) {
            places.push(place);
          }
        });
        console.log(`Firebase에서 ${places.length}건의 데이터를 가져왔습니다.`);
        return places;
      }
      return [];
    } catch (error) {
      console.error(
        "Firebase에서 장소 데이터를 가져오는 동안 오류 발생:",
        error
      );
      throw error;
    }
  };

  /**
   * Google Places API로부터 가져온 장소 데이터를 Firebase에 저장
   * @param {TypePlace[]} places - 저장할 장소 데이터
   */
  const savePlaces = async (places: TypePlace[]): Promise<void> => {
    const placesRef = ref(database, "places");

    try {
      for (const place of places) {
        if (place.place_id) {
          const placeRef = ref(database, `places/${place.place_id}`);
          await set(placeRef, {
            place_id: place.place_id,
            lat_lng: `${place.location.lat}_${place.location.lng}`,
            name: place.name,
            location: {
              lat: place.location.lat,
              lng: place.location.lng,
            },
            address: place.address ?? "",
            types: place.types ?? [],
            rating: place.rating ?? 0,
            user_ratings_total: place.user_ratings_total ?? 0,
            lastUpdated: new Date().toLocaleString("ko-KR"),
          });
        }
      }
      console.log("장소 데이터가 Firebase에 저장되었습니다.", places);
    } catch (error) {
      console.error("Firebase에 장소 데이터를 저장하는 동안 오류 발생:", error);
      throw error;
    }
  };

  /**
   * Haversine 공식을 사용하여 두 지점 간의 거리 계산 (km 단위)
   * @param {number} lat1 - 첫 번째 위치의 위도
   * @param {number} lon1 - 첫 번째 위치의 경도
   * @param {number} lat2 - 두 번째 위치의 위도
   * @param {number} lon2 - 두 번째 위치의 경도
   * @returns {number} 두 지점 간의 거리 (km)
   */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // 지구의 반지름 (미터 단위)
    const phi1 = lat1 * (Math.PI / 180);
    const phi2 = lat2 * (Math.PI / 180);
    const deltaPhi = (lat2 - lat1) * (Math.PI / 180);
    const deltaLambda = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c) / 1000; // km 단위 거리
  };

  return {
    saveUser,
    getPlaces,
    savePlaces,
  };
}

export default useFirebase;
