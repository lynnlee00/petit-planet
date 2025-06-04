<!-- pages/activityFormPage.vue -->
<template>
  <div v-if="isAuthenticated" class="activity-form-page">
    <div class="top-bar">
      <button class="logout-button" @click="logout">登出</button>
    </div>

    <h1>活動資料編輯</h1>
    <ActivityForm />
    <ActivityManager />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'

import ActivityForm from '~/pages/activityFormAdd.vue'
import ActivityManager from '~/pages/activityManager.vue'

const isAuthenticated = ref(false)
const router = useRouter()

const auth = getAuth()

// 登出方法
const logout = async () => {
  await signOut(auth)
  router.push('/') // 登出後回到首頁
}

// 監聽登入狀態
onAuthStateChanged(auth, (user) => {
  if (user) {
    isAuthenticated.value = true
  } else {
    isAuthenticated.value = false
    router.push('/login')
  }
})
</script>

<style scoped>
.activity-form-page {
  text-align: center;
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.logout-button {
  background: linear-gradient(145deg, #ffd6eb, #ffc1e3); /* 柔粉漸層 */
  border: 2px dashed #ffa8d0; /* 可愛的虛線邊框 */
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
