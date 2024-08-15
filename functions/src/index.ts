import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// 간단한 HTTP Function: Hello World 출력
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase Functions!");
});
