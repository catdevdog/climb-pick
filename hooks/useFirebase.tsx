import { ref, set, get, child } from "firebase/database";
import { database } from "@/firebase/firebasedb";

export function useFirebase() {
  const dataSet = async (uid: string, lat: number, lng: number) => {
    // const safeLatitude = lat.toString().replace('.', '_');
    // const safeLongitude = lng.toString().replace('.', '_');
    // const coordinatesKey = `${safeLatitude}_${safeLongitude}`;
    const locationRef = ref(database, 'connect-id/' + `${uid}`);

    try {
      // 이전 카운트를 가져옴
      const snapshot = await get(child(locationRef, 'visit_count'));
      let visitCount = 0;

      if (snapshot.exists()) {
        visitCount = snapshot.val();
      }

      // 새로운 데이터를 저장하고 방문 카운트를 증가시킴
      await set(locationRef, {
        timestamp: new Date().toLocaleString("ko-KR"),
        visit_count: visitCount + 1,
        coord: `${lat} ${lng}`
      });

      console.log('Data sent to Firebase', uid, lat, lng, 'New visit count:', visitCount + 1);
    } catch (error) {
      console.error('Error sending data to Firebase', error);
    }
  };

  return {
    dataSet
  };
}

export default useFirebase;
