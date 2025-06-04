<template>
  <div class="activity-manager">
    <h2> 活動管理後台 </h2>

    <!-- 一般活動清單 -->
    <!-- 活動清單 -->
    <h3>📚 手作玩樂列表</h3>
    <div class="grid-list">
      <div v-for="(activity, id) in activities" :key="id" class="grid-item">
        <h3>{{ activity.title }}</h3>

        <img :src="activity.image" alt="活動圖片" class="activity-image" />
        <div class="activity-info">
          <button @click="editItem(id, 'activity')">編輯</button>
          <button class="delete-button" @click="deleteItem(id, 'activity')">刪除</button>
        </div>
      </div>
    </div>

    <!-- 小遊戲清單 -->
    <h3>🎮 小遊戲列表</h3>
    <div class="grid-list">
      <div v-for="(game, id) in games" :key="id" class="grid-item">
        <h3>{{ game.title }}</h3>

        <img :src="game.image" alt="遊戲圖片" class="activity-image" />
        <div class="activity-info">
          <button @click="editItem(id, 'game')">編輯</button>
          <button class="delete-button" @click="deleteItem(id, 'game')">刪除</button>
        </div>
      </div>
    </div>

    <!-- 編輯表單 -->
    <div v-if="isEditing" class="edit-form">
      <h3>編輯{{ editingType === 'game' ? '小遊戲' : '活動' }}</h3>
      <form @submit.prevent="updateItem">
        <input v-model="currentItem.title" placeholder="標題" required />
        <input v-model="currentItem.description" placeholder="描述" required />
        <!-- <input v-model="currentItem.materials" placeholder="材料" /> -->
        <textarea v-model="currentItem.materials" placeholder="材料（可換行）" rows="4" style="width: 100%;"></textarea>
        <textarea v-model="currentItem.steps" placeholder="步驟（可換行）" rows="6" style="width: 100%;"></textarea>
        <input v-model="currentItem.age" placeholder="適合年齡" />
        <input v-model="currentItem.tags" placeholder="Tags (用逗號分隔)" />
        <input v-model="currentItem.image" placeholder="圖片URL" />
        <input v-model="currentItem.resultImg1" placeholder="成品照片連結（1）" />
        <input v-model="currentItem.resultImg2" placeholder="成品照片連結（2）" />
        <input v-if="editingType === 'game'" v-model="currentItem.path" placeholder="遊戲路徑（/game/...）" />
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
import { ref, onMounted } from 'vue';
//import { db } from '~/utils/firebase';
import { initFirebase } from '~/utils/firebase'

const { db } = initFirebase()
import { ref as dbRef, onValue, remove, update } from 'firebase/database';

const activities = ref({});
const games = ref({});
const marqueeMessages = ref({});
const isEditing = ref(false);
const currentItem = ref({});
const editingType = ref('activity');

onMounted(() => {
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
  const { id, ...data } = currentItem.value;
  const type = editingType.value;
  if (confirm(`確定要更新這個${type === 'game' ? '遊戲' : '勞作'}嗎？`)) {
    await update(dbRef(db, `${type === 'game' ? 'games' : 'activities'}/${id}`), data);
    alert(`${type === 'game' ? '遊戲' : '勞作'}更新成功`);
    cancelEdit();
  }
};

const deleteItem = async (id, type) => {
  if (confirm(`確定要刪除這個${type === 'game' ? '遊戲' : '勞作'}嗎？`)) {
    await remove(dbRef(db, `${type === 'game' ? 'games' : 'activities'}/${id}`));
    alert('已刪除');
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

.activity-image {
  width: 100%;
  max-width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.activity-info {
  flex: 1;
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
