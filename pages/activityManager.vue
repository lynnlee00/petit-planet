<template>
  <div class="activity-manager">
    <h2> 活動管理後台 </h2>

    <!-- 一般活動清單 -->
    <!-- 活動清單 -->
    <h3>📚 手作玩樂列表</h3>
    <div class="grid-list">
      <div v-for="activity in sortedActivities" :key="activity.id" class="grid-item">
        <h3>{{ activity.title }}</h3>

        <div class="image-wrapper">
          <img :src="activity.image" alt="活動圖片" class="activity-image" />
          <span v-if="!activity.isRelease" class="status-badge draft">📝 草稿</span>
          <span
            v-if="isUpcomingRelease(activity)"
            class="status-badge upcoming"
          >
            ⏰ {{ getUpcomingReleaseLabel(activity) }}
          </span>
        </div>
        <div class="activity-info">
          <button @click="previewItem(activity.id, 'activity')" class="preview-button">預覽</button>
          <button @click="editItem(activity.id, 'activity')">編輯</button>
          <button class="delete-button" @click="deleteItem(activity.id, 'activity')">刪除</button>
        </div>
      </div>
    </div>

    <!-- 小遊戲清單 -->
    <h3>🎮 小遊戲列表</h3>
    <div class="grid-list">
      <div v-for="game in sortedGames" :key="game.id" class="grid-item">
        <h3>{{ game.title }}</h3>

        <div class="image-wrapper">
          <img :src="game.image" alt="遊戲圖片" class="activity-image" />
          <span v-if="!game.isRelease" class="status-badge draft">📝 草稿</span>
          <span
            v-if="isUpcomingRelease(game)"
            class="status-badge upcoming"
          >
            ⏰ {{ getUpcomingReleaseLabel(game) }}
          </span>
        </div>
        <div class="activity-info">
          <button @click="previewItem(game.id, 'game')" class="preview-button">預覽</button>
          <button @click="editItem(game.id, 'game')">編輯</button>
          <button class="delete-button" @click="deleteItem(game.id, 'game')">刪除</button>
        </div>
      </div>
    </div>

    <!-- 編輯表單 -->
    <div v-if="isEditing" class="edit-form">
      <h3>編輯{{ editingType === 'game' ? '小遊戲' : '活動' }}</h3>
      <form @submit.prevent="updateItem">
        <label>標題：</label>
        <input v-model="currentItem.title" placeholder="標題" required />

        <label>描述：</label>
        <input v-model="currentItem.description" placeholder="描述" required />

        <label>材料（可換行）：</label>
        <textarea v-model="currentItem.materials" rows="4" style="width: 100%;"></textarea>

        <label>步驟（可換行）：</label>
        <textarea v-model="currentItem.steps" rows="6" style="width: 100%;"></textarea>

        <label>適合年齡：</label>
        <input v-model="currentItem.age" placeholder="適合年齡" />

        <label>分類 Tags（用逗號分隔）：</label>
        <input v-model="currentItem.tags" placeholder="Tags (用逗號分隔)" />

        <label>主圖圖片 URL：</label>
        <input v-model="currentItem.image" placeholder="圖片URL" />

        <label>成品照片連結（1）：</label>
        <input v-model="currentItem.resultImg1" placeholder="成品照片連結（1）" />

        <label>成品照片連結（2）：</label>
        <input v-model="currentItem.resultImg2" placeholder="成品照片連結（2）" />

        <div v-if="editingType === 'game'">
          <label>遊戲路徑（/game/...）：</label>
          <input v-model="currentItem.path" placeholder="遊戲路徑（/game/...）" />
        </div>

        <div class="form-group checkbox-group">
          <label for="release-checkbox">是否公開（isRelease）：</label>
          <input id="release-checkbox" type="checkbox" v-model="currentItem.isRelease" />
        </div>

        <label>上架日期（releaseDate）：</label>
        <input v-model="currentItem.releaseDate" type="date" />

        <button type="submit">更新</button>
        <button type="button" @click="cancelEdit">取消</button>
      </form>
    </div>


    <!-- 跑馬燈訊息管理 -->
    <div class="marquee-manager">
      <h3>📢 跑馬燈訊息</h3>
      <ul v-if="Object.keys(marqueeMessages).length > 0">
        <li v-for="(message, id) in marqueeMessages" :key="id" style="margin-bottom: 12px;">
          <!-- 訊息內容 -->
          <input v-model="message.message" @blur="updateMarqueeMessage(id)" style="width: 60%; padding: 8px;" />

          <!-- 分類選擇 -->
          <select v-model="message.category" @change="updateMarqueeMessage(id)" style="margin: 0 8px;">
            <option value="親子關係">親子關係</option>
            <option value="小知識">小知識</option>
            <option value="工商時間">工商時間</option>
          </select>

          <!-- 刪除按鈕 -->
          <button @click="deleteMarqueeMessage(id)" class="delete-button">刪除</button>
        </li>
      </ul>
      <p v-else>尚無跑馬燈訊息。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
//import { db } from '~/utils/firebase'
import { initFirebase } from '~/utils/firebase'

// const { db } = initFirebase()
let db = null

import { ref as dbRef, onValue, remove, update } from 'firebase/database';

const activities = ref({});
const games = ref({});
const marqueeMessages = ref({});
const isEditing = ref(false);
const currentItem = ref({});
const editingType = ref('activity');
const router = useRouter();

const toTimestamp = (value) => {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const sortCollection = (collection) => {
  return Object.entries(collection || {}).map(([id, data]) => ({
    id,
    ...data,
  })).sort((a, b) => {
    const timeA = toTimestamp(a.releaseDate) || toTimestamp(a.createdAt);
    const timeB = toTimestamp(b.releaseDate) || toTimestamp(b.createdAt);
    return timeB - timeA;
  });
};

const sortedActivities = computed(() => sortCollection(activities.value));
const sortedGames = computed(() => sortCollection(games.value));

const isUpcomingRelease = (item = {}) => {
  const releaseTimestamp = toTimestamp(item.releaseDate);
  if (!releaseTimestamp) return false;
  return releaseTimestamp > Date.now();
};

const getUpcomingReleaseLabel = (item = {}) => {
  if (!item.releaseDate) return '未上架';
  const date = new Date(item.releaseDate);
  if (Number.isNaN(date.getTime())) return '未上架';
  return `${item.releaseDate} 未上架`;
};

onMounted(() => {
  db = initFirebase().db;

  onValue(dbRef(db, 'activities'), (snapshot) => {
    activities.value = snapshot.val() || {};
  });

  onValue(dbRef(db, 'games'), (snapshot) => {
    games.value = snapshot.val() || {};
  });

  onValue(dbRef(db, 'marqueeMessages'), (snapshot) => {
    marqueeMessages.value = snapshot.val() || {};
  });
});

const editItem = (id, type) => {
  editingType.value = type;
  const source = type === 'activity' ? activities.value : games.value;
  currentItem.value = { ...source[id], id };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  currentItem.value = {};
};

const updateItem = async () => {
  const type = editingType.value;
  const id = currentItem.value.id;

  const data = {
    title: currentItem.value.title,
    description: currentItem.value.description,
    materials: currentItem.value.materials || '',
    steps: currentItem.value.steps || '',
    age: currentItem.value.age || '',
    tags: currentItem.value.tags || '',
    image: currentItem.value.image || '',
    resultImg1: currentItem.value.resultImg1 || '',
    resultImg2: currentItem.value.resultImg2 || '',
    isRelease: !!currentItem.value.isRelease,
    releaseDate: currentItem.value.releaseDate || '',
  };

  if (type === 'game') {
    data.path = currentItem.value.path || '';
  }

  // ✅ 加入 console 看你實際送什麼
  console.log('📝 即將更新的資料：', data);

  if (confirm(`確定要更新這個${type === 'game' ? '遊戲' : '勞作'}嗎？`)) {
    try {
      await update(dbRef(db, `${type === 'game' ? 'games' : 'activities'}/${id}`), data);
      alert(`${type === 'game' ? '遊戲' : '勞作'}更新成功`);
      cancelEdit();
    } catch (err) {
      console.error('❌ 更新失敗：', err);
    }
  }
};

const deleteItem = async (id, type) => {
  if (confirm(`確定要刪除這個${type === 'game' ? '遊戲' : '勞作'}嗎？`)) {
    await remove(dbRef(db, `${type === 'game' ? 'games' : 'activities'}/${id}`));
    alert('已刪除');
  }
};

const previewItem = (id, type) => {
  const source = type === 'activity' ? activities.value : games.value;
  const item = source?.[id];
  if (!item) return;

  if (type === 'activity') {
    const url = router.resolve({ path: '/activityDetail', query: { id, preview: '1' } }).href;
    window.open(url, '_blank');
  } else if (item.path) {
    const url = item.path.startsWith('http')
      ? item.path
      : router.resolve(item.path).href;
    window.open(url, '_blank');
  } else {
    alert('這個遊戲還沒有設定路徑，請先補上 path。');
  }
};

const updateMarqueeMessage = async (id) => {
  const updatedMessage = marqueeMessages.value[id];
  await update(dbRef(db, `marqueeMessages/${id}`), {
    message: updatedMessage.message,
    category: updatedMessage.category,
  });
};

const deleteMarqueeMessage = async (id) => {
  if (confirm('確定要刪除這則跑馬燈訊息嗎？')) {
    await remove(dbRef(db, `marqueeMessages/${id}`));
    alert('訊息已刪除');
  }
};
</script>

<style scoped>
.edit-form label {
  display: block;
  text-align: left;
  font-weight: bold;
  color: #004080;
  /* 深藍色 */
  margin: 12px 0 4px;
}

.activity-manager {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 16px;
  background-color: #f9f9f9;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background-color: #fff;
}

.image-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.activity-image {
  width: 100%;
  max-width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.status-badge {
  position: absolute;
  top: -6px;
  left: 8px;
  background: linear-gradient(120deg, #ffe0e0, #ff9a9a);
  border-radius: 24px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: bold;
  color: #8b1b1b;
  border: 1px solid rgba(220, 20, 60, 0.5);
  box-shadow: 0 4px 10px rgba(243, 116, 116, 0.35);
}

.status-badge.upcoming {
  top: 32px;
  background: linear-gradient(120deg, #fff6d5, #ffe19a);
  color: #665200;
  border-color: rgba(255, 166, 0, 0.5);
  box-shadow: 0 4px 10px rgba(255, 195, 64, 0.35);
}

.activity-info {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}


.edit-form {
  margin-top: 20px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background-color: #fff;
}

.edit-form input,
.edit-form textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
}

.checkbox-group label {
  font-weight: bold;
  color: #004080;
  margin-bottom: 0;
}

button {
  background-color: #0077cc;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:disabled {
  background-color: #aaa;
}

button.preview-button {
  background: linear-gradient(145deg, #e0f7fa, #c2e9fb);
  color: #006064;
  border: 2px dashed #4dd0e1;
}

.delete-button {
  background-color: #ff5c5c;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #ff2a2a;
}

.marquee-manager {
  margin-top: 40px;
  padding: 20px;
  border-top: 2px solid #ccc;
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.grid-item {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
