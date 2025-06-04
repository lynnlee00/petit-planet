<template>
  <section class="container">
    <!-- 登入 -->
    <div class="login-logout-link">
      <button v-if="!isLoggedIn" @click="goLogin" class="login-button">管理員登入</button>
      <button v-else @click="logout" class="logout-button">登出</button>
    </div>
    <!-- 跑馬燈 -->
    <Marquee />

    <!-- Tag 選單 -->
    <div v-if="!isMobile" class="tag-filter">
      <button v-for="tag in uniqueTags" :key="tag" :class="['tag-btn', { active: selectedTag === tag }]"
        @click="filterByTag(tag)">
        {{ tag }}
      </button>
      <button class="tag-btn reset" @click="resetTag">全部</button>
    </div>

    <!-- 搜尋 -->
    <div class="material-search">
      <input type="text" v-model="materialKeyword" placeholder="🪄 揮揮魔杖，召喚你的材料吧！例如：筆" class="material-input" />
      <button v-if="materialKeyword" @click="materialKeyword = ''" class="clear-btn">✨ 消除咒語</button>
    </div>

    <!-- 卡片列表 -->
    <div v-if="visibleActivities.length" class="grid">
      <ActivityCard v-for="item in visibleActivities" :key="item.id" :item="item" :type="currentType"
        @click="openModal(item)" />
    </div>

    <!-- 無資料提示 -->
    <div v-else class="no-result">很抱歉，找不到符合條件的活動 😢</div>

    <!-- 載入更多 -->
    <div v-if="hasMore" class="pagination">
      <button @click="loadMore" class="page-button" :class="{ bounce: hasMore }">
        載入更多
      </button>
    </div>

    <p>&nbsp;</p> <!-- 空一格 -->
    <p>&nbsp;</p> <!-- 空一格 -->

    <!-- 編輯按鈕 -->
    <!-- <router-link to="/activityFormPage">
      <button class="edit-button">編輯活動</button>
    </router-link> -->

    <p>&nbsp;</p> <!-- 空一格 -->
    <p>&nbsp;</p> <!-- 空一格 -->

  </section>
</template>

<script setup>
// ---------------------
// 📚 Vue 官方組件
// ---------------------
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useState } from '#app';

// ---------------------
// 🔥 Firebase
// ---------------------
import { db } from '~/utils/firebase';
import { ref as dbRef, get } from 'firebase/database';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

// ---------------------
// 🎨 自己的元件
// ---------------------
import ActivityCard from '~/components/activityCard.vue';
import Marquee from '~/components/marquee.vue';

// ---------------------
// 🧩 基本變數設定
// ---------------------
const router = useRouter();
const auth = getAuth();
const isClient = typeof window !== 'undefined';

// ---------------------
// 👤 登入登出相關
// ---------------------
const isLoggedIn = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user;
  });
});

const goLogin = () => {
  router.push('/login');
};

const logout = async () => {
  await signOut(auth);
  router.push('/');
};

// ---------------------
// 🎈 活動與遊戲資料管理
// ---------------------
const currentType = useState('currentType'); // 共用的活動／遊戲切換狀態
const activities = ref([]);
const games = ref([]);
const visibleActivities = ref([]);
const loadCount = 6;

const selectedTag = ref(null);
const materialKeyword = ref("");
const isMobile = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 600;
};

const currentList = computed(() =>
  currentType.value === 'activity' ? activities.value : games.value
);

const filteredActivities = computed(() => {
  return currentList.value.filter((item) => {
    const matchTag = selectedTag.value ? item.tags?.includes(selectedTag.value) : true;
    const matchKeyword = materialKeyword.value
      ? item.materials?.toLowerCase().includes(materialKeyword.value.toLowerCase())
      : true;
    return matchTag && matchKeyword;
  });
});

const uniqueTags = computed(() => {
  const allTags = currentList.value.flatMap((act) => act.tags || []);
  return [...new Set(allTags)];
});

const resetVisibleActivities = () => {
  visibleActivities.value = filteredActivities.value.slice(0, loadCount);
};

const loadMore = () => {
  const nextLength = visibleActivities.value.length + loadCount;
  visibleActivities.value = filteredActivities.value.slice(0, nextLength);
};

const hasMore = computed(() => visibleActivities.value.length < filteredActivities.value.length);

// ---------------------
// 🎯 點擊卡片打開活動或遊戲
// ---------------------
const openModal = (item) => {
  if (currentType.value === 'activity') {
    router.push(`/activityDetail?id=${item.id}`);
  } else if (item.path) {
    router.push(item.path);
  } else {
    alert("找不到這個遊戲的路徑 🙈");
  }
};

// ---------------------
// 🎨 Tag 選單與材料搜尋
// ---------------------
const filterByTag = (tag) => {
  selectedTag.value = selectedTag.value === tag ? null : tag;
  resetVisibleActivities();
};

const resetTag = () => {
  selectedTag.value = null;
  resetVisibleActivities();
};

// ---------------------
// 🚀 首頁初始化載入
// ---------------------
onMounted(async () => {
  if (isClient) {
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
  }

  const [activitySnap, gameSnap] = await Promise.all([
    get(dbRef(db, "activities")),
    get(dbRef(db, "games"))
  ]);

  if (activitySnap.exists()) {
    activities.value = Object.entries(activitySnap.val()).map(([id, val]) => ({
      id,
      ...val
    }));
  }

  if (gameSnap.exists()) {
    games.value = Object.entries(gameSnap.val()).map(([id, val]) => ({
      id,
      ...val
    }));
  }
  resetVisibleActivities();
});

onUnmounted(() => {
  if (isClient) {
    window.removeEventListener('resize', updateIsMobile);
  }
});

// ---------------------
// 🔄 監聽篩選條件變化時，重置可見列表
// ---------------------
watchEffect(() => {
  resetVisibleActivities();
});
</script>


<style scoped>
.container {
  margin: 0 auto;
  padding: 10px 50px;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.page-button {
  background: linear-gradient(145deg, #d6f5e3, #e4f9ec);
  /* 淡綠色漸層 */
  color: #2b7a4b;
  border: 3px solid #a7e4c2;
  border-radius: 20px;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 0 #8fd7b2;
  transition: all 0.2s ease-in-out;
}

.page-button:hover {
  background: linear-gradient(145deg, #c9f0dd, #d9f6e9);
  transform: scale(1.05);
  box-shadow: 0 6px 0 #7ed3a6;
}

.page-button:disabled {
  background: #eee;
  color: #999;
  border: 3px dashed #ccc;
  box-shadow: none;
  cursor: not-allowed;
}

.tag-filter {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

@media (max-width: 600px) {
  .tag-filter {
    display: none;
    /* 隱藏 Tag 選單 */
  }
}

.tag-btn {
  background-color: #ffe8f1;
  border: 2px solid #ffb6d9;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.tag-btn:hover,
.tag-btn.active {
  background-color: #ffd1eb;
  color: #d0006f;
  transform: scale(1.05);
}

.tag-btn.reset {
  background-color: #f0f0f0;
  border-style: dashed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  text-align: center;
  /* 讓標題與圖片置中 */
  position: relative;
}

/* 讓段落文字 (材料、做法等) 恢復左對齊 */
.modal-content p {
  text-align: left;
  margin: 10px 0;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.5rem;
  font-weight: bold;
}

.modal-image-single {
  margin: 0 auto 20px;
  /* 讓圖片區塊置中 + 底部留空間 */
}

.modal-images {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.modal-images img {
  width: 100px;
  height: auto;
  border-radius: 10px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ffcce5;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}

.image-container {
  width: 150px;
  height: 150px;
  background-color: white;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease-in-out;
}

.image-container:hover .image {
  transform: scale(1.05);
}

.page-info {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #8b2e8c;
}

.material-search {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.material-input {
  width: 300px;
  padding: 10px 16px;
  border: 2px solid #ffc3e6;
  border-radius: 20px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.material-input:focus {
  border-color: #e44fad;
  box-shadow: 0 0 8px rgba(228, 79, 173, 0.3);
}

.no-result {
  margin-top: 30px;
  font-size: 18px;
  font-weight: bold;
  color: #cc1f6c;
  text-align: center;
  line-height: 1.6;
}

@keyframes bounceMore {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

/* 給會跳動的按鈕用 */
.bounce {
  animation: bounceMore 1s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  30% {
    transform: translateY(-6px) rotate(-10deg);
  }

  60% {
    transform: translateY(2px) rotate(10deg);
  }
}

.animated-heart {
  animation: bounce 2s infinite ease-in-out;
}

.login-logout-link {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.login-button {
  background: linear-gradient(145deg, #d1f0ff, #a6e3ff);
  border: 2px dashed #79c5e7;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  color: #1a7bb5;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(135, 206, 250, 0.5);
  transition: all 0.3s ease-in-out;
}

.login-button:hover {
  background: linear-gradient(145deg, #a6e3ff, #79c5e7);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(135, 206, 250, 0.6);
}

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

.clear-btn {
  margin-left: 10px;
  background: linear-gradient(to bottom, #ffe4f2, #ffd6eb);
  /* 柔粉漸層 */
  border: 2px dashed #ffa8d0;
  /* 可愛的虛線邊框 */
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  color: #d0006f;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(255, 182, 193, 0.5);
  /* 柔和小陰影 */
  line-height: 1;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background: linear-gradient(to bottom, #ffd6eb, #ffc1e3);
  /* hover時更亮 */
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(255, 182, 193, 0.6);
}

/* 編輯活動按鈕樣式 */
.edit-button {
  background-color: #ff85d7;
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-button:hover {
  background-color: #ff6ab1;
}
</style>
