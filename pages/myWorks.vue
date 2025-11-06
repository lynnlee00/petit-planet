<template>
  <section class="works-container">
    <h2 class="page-title">📚 我的作品清單</h2>

    <!-- 尚未登入 -->
    <div v-if="!user" class="login-box">
      <p>請先登入管理員帳號以查看作品 💬</p>
      <button @click="goLogin" class="login-btn">登入</button>
    </div>

    <div v-else>
      <!-- 篩選按鈕 -->
      <div class="filter-btn-group">
        <button
          class="filter-btn"
          :class="{ active: currentFilter === 'all' }"
          @click="currentFilter = 'all'"
        >
          🌟 全部
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === 'activity' }"
          @click="currentFilter = 'activity'"
        >
          ✂️ 手作
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === 'game' }"
          @click="currentFilter = 'game'"
        >
          🎮 遊戲
        </button>
      </div>

      <!-- 清單內容 -->
      <div v-if="filteredWorks.length" class="works-list">
        <div
          v-for="(item, index) in filteredWorks"
          :key="item.id"
          class="work-card"
          :class="item.type"
          @click="goToWork(item)"
        >
          <div class="work-index">{{ index + 1 }}.</div>

          <img class="work-thumb" :src="getThumbnail(item)" alt="封面圖" />

          <div class="work-inline">
            <h3 class="work-title">{{ item.title || "未命名作品" }}</h3>
            <div class="work-meta">
              <span v-if="item.releaseDate">📅 {{ item.releaseDate }}</span>
              <span v-else>（草稿）</span>
              <span
                :class="['status', item.isRelease ? 'released' : 'draft']"
              >
                {{ item.isRelease ? '✅ 已上架' : '📝 草稿' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        🌷 目前沒有任何作品，快去
        <NuxtLink to="/quickAdd" class="link">新增靈感</NuxtLink>
        吧！
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { initFirebase } from "~/utils/firebase";
import { ref as dbRef, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const { db } = initFirebase();
const auth = getAuth();
const router = useRouter();

const user = ref(null);
const works = ref([]);
const currentFilter = ref("all");

onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    if (u) {
      user.value = u;
      await loadWorks();
    } else {
      user.value = null;
    }
  });
});

const goLogin = () => router.push("/login");

const loadWorks = async () => {
  const [activitySnap, gameSnap] = await Promise.all([
    get(dbRef(db, "activities")),
    get(dbRef(db, "games")),
  ]);

  const actList = activitySnap.exists()
    ? Object.entries(activitySnap.val()).map(([id, val]) => ({
        id,
        ...val,
        type: "activity",
      }))
    : [];

  const gameList = gameSnap.exists()
    ? Object.entries(gameSnap.val()).map(([id, val]) => ({
        id,
        ...val,
        type: "game",
      }))
    : [];

  works.value = [...actList, ...gameList];
};

// 篩選後的清單
const filteredWorks = computed(() => {
  if (currentFilter.value === "all") return sortedWorks.value;
  return sortedWorks.value.filter((w) => w.type === currentFilter.value);
});

// 排序邏輯
const sortedWorks = computed(() => {
  return works.value.slice().sort((a, b) => {
    if (a.isRelease !== b.isRelease) return b.isRelease - a.isRelease;
    const da = new Date(a.releaseDate || a.createdAt || 0);
    const db = new Date(b.releaseDate || b.createdAt || 0);
    return db - da;
  });
});

// 封面圖處理
const getThumbnail = (item) => {
  return (
    item.image ||
    "https://raw.githubusercontent.com/lynnlee00/my-images/refs/heads/main/commingSoon.png"
  );
};

// 點擊導向
const goToWork = (item) => {
  if (item.type === "activity") {
    router.push(`/activityDetail?id=${item.id}`);
  } else if (item.type === "game") {
    if (item.path) router.push(item.path);
    else alert("這個遊戲還沒有設定路徑 🙈");
  }
};
</script>

<style scoped>
.works-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  color: #d0006f;
  font-weight: bold;
  font-size: 24px;
  margin-bottom: 20px;
}

/* 篩選按鈕群組 */
.filter-btn-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-btn {
  background: linear-gradient(145deg, #fff0f7, #ffe3f0);
  border: 2px dashed #ffa8d0;
  color: #d0006f;
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #ffd6eb;
  transform: scale(1.05);
}

.filter-btn.active {
  background: linear-gradient(145deg, #ffd1eb, #ffc3e6);
  color: #8b2e8c;
  border: 2px solid #d0006f;
}

/* 卡片清單 */
.works-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.work-card {
  display: flex;
  align-items: center;
  background: #fff8fb;
  border: 2px solid #ffc3e6;
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.work-card.activity {
  background: #fff9fb;
  border-color: #ffc3e6;
}

.work-card.game {
  background: #f4f9ff;
  border-color: #b0d9ff;
}

.work-card:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}

.work-index {
  font-weight: bold;
  font-size: 16px;
  color: #a64d79;
  margin-right: 10px;
  width: 25px;
  text-align: right;
}

.work-thumb {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  object-fit: cover;
  margin-right: 16px;
  border: 1px solid #e4c7d1;
}

.work-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.work-title {
  font-size: 18px;
  font-weight: bold;
  color: #732c7b;
  margin-right: 16px;
}

.work-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #444;
}

.status {
  font-weight: bold;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 13px;
}

.status.released {
  background: #e6fff2;
  color: #2b7a4b;
  border: 1px solid #a7e4c2;
}

.status.draft {
  background: #ffe8f1;
  color: #d0006f;
  border: 1px solid #ffb6d9;
}

.empty-state {
  text-align: center;
  margin-top: 30px;
  font-size: 16px;
  color: #8b2e8c;
}

.link {
  color: #d0006f;
  font-weight: bold;
  text-decoration: underline;
}

.login-box {
  background: #fff0f7;
  padding: 20px;
  border-radius: 12px;
  border: 2px dashed #ffb6d9;
  text-align: center;
}

.login-btn {
  margin-top: 10px;
  background: linear-gradient(145deg, #d1f0ff, #a6e3ff);
  border: 2px dashed #79c5e7;
  color: #1a7bb5;
  border-radius: 20px;
  padding: 8px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.login-btn:hover {
  transform: scale(1.05);
  background: linear-gradient(145deg, #a6e3ff, #79c5e7);
}
</style>
