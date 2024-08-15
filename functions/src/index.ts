import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Realtime Database에 데이터를 저장하는 함수
export const saveToDatabase = functions.https.onRequest(
  async (request, response) => {
    try {
      // 저장할 데이터 예시
      const data = {
        message: "Hello from Firebase Functions!",
        timestamp: admin.database.ServerValue.TIMESTAMP,
      };

      // 데이터베이스 경로 설정 (예: "testData"라는 경로에 저장)
      const databaseRef = admin.database().ref("testData");

      // 데이터 저장
      await databaseRef.set(data);

      // 성공적으로 저장되었다는 응답 전송
      response.send("Data saved successfully to Realtime Database!");
    } catch (error) {
      console.error("Error saving data to Realtime Database:", error);
      response.status(500).send("Error saving data to Realtime Database.");
    }
  }
);
