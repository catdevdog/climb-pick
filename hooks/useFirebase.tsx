import { ref, set } from "firebase/database";
import { database } from "@/firebase/firebasedb";

export function useFirebase() {
  const dataSet = (key: string, value: string) => {
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

  return {
    dataSet
  }
}

export default useFirebase