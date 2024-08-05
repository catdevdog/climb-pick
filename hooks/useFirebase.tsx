import {
  ref,
  set,
  get,
  update,
  query,
  orderByChild,
  startAt,
  endAt,
} from "firebase/database";
import { database } from "@/firebase/firebasedb";
import { TypePlace } from "@/types/place";
import { calculateDistance } from "@/utils";

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

        // 중복되었다고 판단되는 장소 데이터를 제거
        const uniquePlaces = places.filter(
          (place, index, self) =>
            index ===
            self.findIndex(
              (t) => t.lat_lng === place.lat_lng || t.name.includes(place.name) || place.name.includes(t.name) || t.address.includes(place.address) || place.address.includes(t.address)  
            )
        );

        console.log('중복 제거 전:', places.length, '중복 제거 후:', uniquePlaces.length);

        return uniquePlaces;
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
    console.log(places);

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
            // photos: place.photos ?? [],
            reviews: place.reviews ?? [],
          });
        }
      }
      console.log("장소 데이터가 Firebase에 저장되었습니다.", places);
    } catch (error) {
      console.error("Firebase에 장소 데이터를 저장하는 동안 오류 발생:", error);
      throw error;
    }
  };

  async function addAllData(key: string, value: any): Promise<void> {
    const rootRef = ref(database);

    try {
      const snapshot = await get(rootRef);

      if (snapshot.exists()) {
        const updates: { [key: string]: any } = {};
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key!;
          const childData = childSnapshot.val();

          if (typeof childData === "object" && childData !== null) {
            // 객체에 새로운 키-값 쌍을 추가합니다.
            const updatedData = { ...childData, [key]: value };
            updates[childKey] = updatedData;
          } else {
            // 객체가 아닌 데이터는 건너뜁니다.
            console.warn(`객체만 추가할 수 있습니다.`);
          }
        });

        await update(rootRef, updates);
        console.log("모든 데이터에 새로운 키-값 쌍이 추가되었습니다.");
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error updating values:", error);
    }
  }

  return {
    saveUser,
    getPlaces,
    savePlaces,
  };
}

export default useFirebase;
