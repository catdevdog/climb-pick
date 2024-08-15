"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToDatabase = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Realtime Database에 데이터를 저장하는 함수
exports.saveToDatabase = functions.https.onRequest(async (request, response) => {
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
    }
    catch (error) {
        console.error("Error saving data to Realtime Database:", error);
        response.status(500).send("Error saving data to Realtime Database.");
    }
});
