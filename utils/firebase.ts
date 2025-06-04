import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// ✅ 改成一個可重複使用的初始化函式
export const initFirebase = () => {
  const config = useRuntimeConfig().public

  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    databaseURL: config.firebaseDatabaseUrl,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  const db = getDatabase(app)

  return { app, db }
}
