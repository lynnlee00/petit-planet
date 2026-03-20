<template>
  <section class="container">
    <!-- 登入 -->
    <!-- <div class="login-logout-link">
      <button v-if="!isLoggedIn" @click="goLogin" class="login-button">管理員登入</button>
      <button v-else @click="logout" class="logout-button">登出</button>
    </div> -->
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
      <input type="text" v-model="newKeyword" placeholder="🪄 可輸入多個材料，以 Enter 新增" class="material-input"
        @keyup.enter="addKeyword" />
      <button v-if="newKeyword" @click="addKeyword" class="clear-btn">＋加入</button>
    </div>

    <!-- 顯示搜尋標籤 -->
    <div v-if="searchKeywords.length" class="keyword-tags">
      <span v-for="(word, index) in searchKeywords" :key="index" class="keyword-tag">
        {{ word }}
        <button class="remove-tag" @click="removeKeyword(index)">×</button>
      </span>
      <button class="clear-all" @click="clearAllKeywords">清除全部</button>
    </div>

    <!-- 卡片列表 -->
    <div v-if="visibleActivities.length" class="grid">
      <ActivityCard v-for="item in visibleActivities" :key="item.id" :item="item" :type="currentType"
        @click="openModal(item)" />
    </div>

    <!-- 無資料提示 -->
    <div v-else class="no-result">
      噢不～沒有符合的活動 💦<br />
      <span class="hint">可能是還在準備中，敬請期待 ✨</span>
    </div>

    <!-- 載入更多 -->
    <div v-if="hasMore" class="pagination">
      <div class="load-more-banner">
        <span class="sparkle">✨</span>
        <div class="banner-text">
          <p class="banner-title">向下探索更多靈感 </p>
        </div>
        
        <button @click="loadMore" class="page-button" :class="{ bounce: hasMore }">
          <span class="arrow">⬇</span> 載入更多
        </button>
      </div>
    </div>

    <p>&nbsp;</p> <!-- 空一格 -->
    <p>&nbsp;</p> <!-- 空一格 -->

    <footer class="home-footer">
      <div class="footer-card">
        <p class="footer-title">手作收藏夾</p>
        <p class="footer-count">小手作星球已收集 {{ releasedActivityCount }} 顆靈感星星</p>
        <p class="footer-count pending-count">待釋出的 {{ pendingActivityCount }} 顆靈感</p>
      </div>
    </footer>

    <!-- 左側漂浮統計 -->
    <div class="floating-count">
      <div class="floating-title">手作收藏夾</div>
      <div class="floating-line">
        <span class="dot released"></span>
        已收集 {{ releasedActivityCount }} 顆靈感
      </div>
      <div class="floating-line">
        <span class="dot pending"></span>
        待釋出的 {{ pendingActivityCount }} 顆靈感
      </div>
    </div>

    <!-- 編輯按鈕 -->
    <!-- <router-link to="/activityFormPage">
      <button class="edit-button">編輯活動</button>
    </router-link> -->

    <p>&nbsp;</p> <!-- 空一格 -->
    <p>&nbsp;</p> <!-- 空一格 -->

  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useState } from '#app';
import { initFirebase } from '~/utils/firebase'
const { db } = initFirebase()
import { ref as dbRef, get } from 'firebase/database';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import ActivityCard from '~/components/activityCard.vue';
import Marquee from '~/components/marquee.vue';

const router = useRouter();
const auth = getAuth();
const isClient = typeof window !== 'undefined';

// ---------------------
// 👤 登入登出相關
// ---------------------
const isLoggedIn = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true;
    } else {
      isLoggedIn.value = false;
    }
  });
});

const goLogin = () => router.push('/login');
const logout = async () => {
  await signOut(auth);
  router.push('/');
};

// ---------------------
// 🎈 活動與遊戲資料管理
// ---------------------
const currentType = useState('currentType');
const selectedTag = useState('selectedTag', () => null);
const activities = ref([]);
const games = ref([]);
const visibleActivities = ref([]);
const loadCount = ref(6);
const isMobile = ref(false);

const updateIsMobile = () => {
  const width = window.innerWidth;
  isMobile.value = width <= 600;
  if (width > 960) loadCount.value = 8;
  else if (width > 600) loadCount.value = 6;
  else loadCount.value = 4;
};

const toTimestamp = (value) => {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const sortByNewest = (list) =>
  list.slice().sort((a, b) => {
    const timeA = toTimestamp(a.releaseDate) || toTimestamp(a.createdAt);
    const timeB = toTimestamp(b.releaseDate) || toTimestamp(b.createdAt);
    return timeB - timeA;
  });

const sortedActivities = computed(() => sortByNewest(activities.value));
const sortedGames = computed(() => sortByNewest(games.value));

const currentList = computed(() =>
  currentType.value === 'activity' ? sortedActivities.value : sortedGames.value
);

const isReleasedActivity = (item, today) =>
  item.isRelease && (!item.releaseDate || item.releaseDate <= today);

// ---------------------
// 🔍 多關鍵字搜尋邏輯
// ---------------------
const searchKeywords = ref([]); // 儲存多筆關鍵字
const newKeyword = ref(""); // 輸入框文字

const addKeyword = () => {
  const trimmed = newKeyword.value.trim();
  if (trimmed && !searchKeywords.value.includes(trimmed)) {
    searchKeywords.value.push(trimmed);
  }
  newKeyword.value = "";
};

const removeKeyword = (index) => {
  searchKeywords.value.splice(index, 1);
};

const clearAllKeywords = () => {
  searchKeywords.value = [];
};

// ---------------------
// 🎯 篩選條件整合
// ---------------------
const filteredActivities = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return currentList.value.filter((item) => {
    const isReleased = isReleasedActivity(item, today);
    const matchTag = selectedTag.value ? item.tags?.includes(selectedTag.value) : true;

    // ✅ 多關鍵字 AND 搜尋
    const materialText = (item.materials || "").toLowerCase();
    const matchKeyword = searchKeywords.value.length
      ? searchKeywords.value.every(k => materialText.includes(k.toLowerCase()))
      : true;

    return isReleased && matchTag && matchKeyword;
  });
});

const uniqueTags = computed(() => {
  const allTags = currentList.value.flatMap((act) => act.tags || []);
  return [...new Set(allTags)];
});

const resetVisibleActivities = () => {
  visibleActivities.value = filteredActivities.value.slice(0, loadCount.value);
};

const loadMore = () => {
  const nextLength = visibleActivities.value.length + loadCount.value;
  visibleActivities.value = filteredActivities.value.slice(0, nextLength);
};

const hasMore = computed(() => visibleActivities.value.length < filteredActivities.value.length);

const releasedActivityCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return activities.value.filter((item) => isReleasedActivity(item, today)).length;
});

const pendingActivityCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return activities.value.filter((item) => !isReleasedActivity(item, today)).length;
});

const trackItemClick = (item) => {
  if (!isClient || typeof window.gtag !== 'function') return;
  const tagList = Array.isArray(item.tags)
    ? item.tags
    : typeof item.tags === 'string'
      ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  window.gtag('event', 'activity_click', {
    event_category: currentType.value === 'activity' ? '手作' : '遊戲',
    event_label: item.title || item.id,
    value: item.id,
    tags: tagList.join(','),
  });
};

// ---------------------
// 🎯 點擊卡片
// ---------------------
const openModal = (item) => {
  trackItemClick(item);
  if (currentType.value === 'activity') router.push(`/activityDetail?id=${item.id}`);
  else if (item.path) router.push(item.path);
  else alert("找不到這個遊戲的路徑 🙈");
};

// ---------------------
// 🎨 Tag 選單
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
// 🚀 初始化
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
    activities.value = Object.entries(activitySnap.val()).map(([id, val]) => ({ id, ...val }));
  }
  if (gameSnap.exists()) {
    games.value = Object.entries(gameSnap.val()).map(([id, val]) => ({ id, ...val }));
  }

  resetVisibleActivities();
});

onUnmounted(() => {
  if (isClient) window.removeEventListener('resize', updateIsMobile);
});

watchEffect(() => resetVisibleActivities());
</script>



<style scoped>
.container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 10px 16px;
  box-sizing: border-box;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
  justify-items: center;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.load-more-banner {
  width: 100%;
  max-width: 520px;
  background: linear-gradient(120deg, #ffe6f4 0%, #fff8e1 100%);
  border: 3px solid #ffb6d9;
  border-radius: 22px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 6px 0 #ff9ec9;
  animation: bannerFloat 3s ease-in-out infinite;
}

.sparkle {
  font-size: 28px;
}

.banner-text {
  flex: 1;
}

.banner-title {
  margin: 0;
  font-weight: 700;
  color: #d0006f;
}

.banner-sub {
  margin: 0;
  color: #8a4a8f;
  font-size: 14px;
}

.page-button {
  background: #fff;
  color: #d0006f;
  border: 3px dashed #d0006f;
  border-radius: 999px;
  padding: 10px 22px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 0 #ff9ec9;
  transition: transform 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-button:hover {
  transform: scale(1.08);
}

.page-button:disabled {
  background: #eee;
  color: #999;
  border: 3px dashed #ccc;
  box-shadow: none;
  cursor: not-allowed;
}

@keyframes bannerFloat {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(6px);
  }

  100% {
    transform: translateY(0);
  }
}

.home-footer {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.footer-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: #f4fbff;
  border: 1px solid #c9e8ff;
  border-radius: 18px;
  padding: 16px 28px;
  box-shadow: 0 4px 12px rgba(118, 185, 231, 0.25);
}

.footer-icon {
  font-size: 30px;
  margin-bottom: 4px;
}

.footer-title {
  margin: 0;
  font-weight: bold;
  color: #2177b7;
  letter-spacing: 2px;
}

.footer-count {
  margin: 0;
  color: #5f7598;
  font-size: 14px;
}

.footer-count + .footer-count {
  margin-top: 6px;
}

.pending-count {
  color: #d0006f;
  font-weight: 700;
}

.floating-count {
  position: fixed;
  left: 16px;
  bottom: 120px;
  background: #fffdf3;
  border: 2px dashed #f5e1a4;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  z-index: 50;
  width: 200px;
  font-weight: 700;
  color: #b6881b;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floating-title {
  font-size: 14px;
  letter-spacing: 1px;
  text-align: left;
}

.floating-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5f7598;
  font-weight: 600;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.released {
  background: #66cdaa;
}

.dot.pending {
  background: #f7a0c0;
}

@media (max-width: 600px) {
  .floating-count {
    left: 12px;
    bottom: 90px;
    width: 170px;
    padding: 10px 12px;
  }
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

.ActivityCard {
  width: 100%;
  box-sizing: border-box;
  /* ✅ 確保 padding 不影響 width */
  overflow: hidden;
  /* ✅ 防止內容溢出 */
}

.ActivityCard img {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
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
  max-width: 100%;
  height: auto;
  display: block;
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

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.keyword-tag {
  background-color: #ffe8f1;
  border: 2px solid #ffb6d9;
  border-radius: 20px;
  padding: 6px 12px;
  font-weight: bold;
  color: #d0006f;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: popIn 0.2s ease-in-out;
}

.remove-tag {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #d0006f;
  font-weight: bold;
}

.clear-all {
  background-color: #f0f0f0;
  border: 2px dashed #ccc;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  color: #666;
  transition: 0.2s;
}

.clear-all:hover {
  background-color: #ffe4f2;
  border-color: #ffa8d0;
  color: #d0006f;
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
