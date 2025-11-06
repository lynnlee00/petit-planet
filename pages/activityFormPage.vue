<!-- pages/activityFormPage.vue -->
<template>
  <div v-if="isAuthenticated" class="activity-form-page">
    <div class="top-bar">
      <!-- 導向快速新增 -->
      <button class="nav-button" @click="goQuickAdd">➕ 快速新增</button>

      <!-- 導向草稿清單 -->
      <button class="nav-button" @click="goDrafts">📝 草稿清單</button>

      <!-- 登出 -->
      <button class="logout-button" @click="logout">登出</button>
    </div>

    <h1>活動資料編輯</h1>
    <ActivityForm />
    <ActivityManager />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initFirebase } from "~/utils/firebase";

initFirebase();

import ActivityForm from "~/pages/activityFormAdd.vue";
import ActivityManager from "~/pages/activityManager.vue";

const isAuthenticated = ref(false);
const router = useRouter();
const auth = getAuth();

// 登出方法
const logout = async () => {
  await signOut(auth);
  router.push("/"); // 登出後回到首頁
};

// 監聽登入狀態
onAuthStateChanged(auth, (user) => {
  if (user) {
    isAuthenticated.value = true;
  } else {
    isAuthenticated.value = false;
    router.push("/login");
  }
});

// 導向快速新增
const goQuickAdd = () => router.push("/quickAdd");

// 導向草稿清單
const goDrafts = () => router.push("/drafts");
</script>

<style scoped>
.activity-form-page {
  text-align: center;
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

/* 導航按鈕共用樣式 */
.nav-button {
  background: linear-gradient(145deg, #d1f0ff, #a6e3ff);
  border: 2px dashed #79c5e7;
  color: #1a7bb5;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 8px rgba(173, 216, 230, 0.5);
}

.nav-button:hover {
  background: linear-gradient(145deg, #a6e3ff, #79c5e7);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(173, 216, 230, 0.6);
}

/* 登出按鈕（維持原粉色系） */
.logout-button {
  background: linear-gradient(145deg, #ffd6eb, #ffc1e3);
  border: 2px dashed #ffa8d0;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  color: #d0006f;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(255, 182, 193, 0.5);
  transition: all 0.3s ease-in-out;
}

.logout-button:hover {
  background: linear-gradient(145deg, #ffc1e3, #ffb6d9);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(255, 182, 193, 0.6);
}
</style>
