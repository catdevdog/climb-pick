import { ref, set } from "firebase/database";
import { database } from "@/firebase/firebasedb";

export function useFirebaseSet(key: string, value: string) {
  set(ref(database, 'test/' + key), {
    data: value,
    data2: value
  })
    .then(() => {
      console.log('Data sent to Firebase', key, value);
    })
    .catch((error) => {
      console.error('Error sending data to Firebase', error);
    });
}