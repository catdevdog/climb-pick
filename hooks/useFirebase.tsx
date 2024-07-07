import { ref, set, get, query, orderByChild, startAt, endAt } from "firebase/database";
import { database } from "@/firebase/firebasedb";
import { TypePlace } from "@/types/place";
import { time } from "console";

export function useFirebase() {
  // 사용자 위치 데이터를 Firebase에 저장
  const dataSet = async (uid: string, lat: number, lng: number) => {
    const locationRef = ref(database, 'connect-id/' + `${uid}`);

    try {
      const snapshot = await get(locationRef);
      let visitCount = snapshot.exists() ? snapshot.val().visit_count : 0;

      await set(locationRef, {
        timestamp_kr: new Date().toLocaleString("ko-KR"),
        timestamp: new Date().getTime(),
        visit_count: visitCount + 1,
        coord: `${lat},${lng}`
      });

      console.log('Firebase에 연결 데이터 전송됨:', uid, lat, lng, '새 방문 횟수:', visitCount + 1);
    } catch (error) {
      console.error('Firebase에 연결 데이터를 전송하는 동안 오류 발생:', error);
    }
  };

  // 주어진 위치와 반경을 기준으로 장소 데이터를 Firebase에서 가져옴
  const getPlaces = async (lat: number, lng: number, radius: number): Promise<TypePlace[]> => {
    const placesRef = ref(database, 'places');

    try {
      const latRange = radius / 111.32; // 위도 범위 계산 (1도 = 약 111.32km)
      const lngRange = radius / (111.32 * Math.cos(lat * Math.PI / 180)); // 경도 범위 계산

      const nearbyPlacesQuery = query(
        placesRef,
        orderByChild('location/lat'),
        startAt(lat - latRange),
        endAt(lat + latRange)
      );

      const snapshot = await get(nearbyPlacesQuery);

      if (snapshot.exists()) {
        const places: TypePlace[] = [];
        snapshot.forEach((childSnapshot) => {
          const place: TypePlace = childSnapshot.val();
          // Haversine 공식을 사용하여 실제 거리 계산
          if (calculateDistance(lat, lng, place.location.lat, place.location.lng) <= radius) {
            places.push(place);
          }
        });
        return places;
      }
      return [];
    } catch (error) {
      console.error('Firebase에서 장소 데이터를 가져오는 동안 오류 발생:', error);
      return [];
    }
  };

  // Google Places API로부터 가져온 장소 데이터를 Firebase에 저장
  const savePlaces = async (places: google.maps.places.PlaceResult[]) => {
    const placesRef = ref(database, 'places');

    try {
      for (const place of places) {
        if (place.place_id) {
          const placeRef = ref(database, `places/${place.place_id}`);
          await set(placeRef, {
            name: place.name,
            location: {
              lat: place.geometry?.location?.lat() ?? 0,
              lng: place.geometry?.location?.lng() ?? 0,
            },
            address: place.vicinity ?? '',
            types: place.types ?? [],
            rating: place.rating ?? 0,
            user_ratings_total: place.user_ratings_total ?? 0,
            lastUpdated: new Date().toLocaleString("ko-KR")
          });
        }
      }
      console.log('장소 데이터가 Firebase에 저장되었습니다.');
    } catch (error) {
      console.error('Firebase에 장소 데이터를 저장하는 동안 오류 발생:', error);
    }
  };

  // Haversine 공식을 사용하여 두 지점 간의 거리 계산 (km 단위)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    dataSet,
    getPlaces,
    savePlaces
  };
}

export default useFirebase;
