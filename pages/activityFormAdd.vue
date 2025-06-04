<template>
  <form class="activity-form" @submit.prevent="handleSubmit">
    <h2>新增項目</h2>

    <!-- 選擇新增類型 -->
    <div class="switch-form">
      <label>
        選擇新增類型：
        <select v-model="formType">
          <option value="activity">📚 手作玩樂</option>
          <option value="game">🎮 小遊戲</option>
          <option value="marquee">📢 跑馬燈訊息</option>
        </select>
      </label>
    </div>

    <!-- 活動或小遊戲表單 -->
    <div v-if="formType === 'activity' || formType === 'game'">
      <label>
        {{ formType === 'game' ? '小遊戲名稱' : '勞作名稱' }}
        <input v-model="form.title" required />
      </label>

      <label>
        {{ formType === 'game' ? '小遊戲描述' : '勞作說明' }}
        <textarea v-model="form.description" required rows="2" />
      </label>

      <label>
        {{ formType === 'game' ? '遊戲性質' : '材料' }}
        <textarea v-model="form.materials" rows="4" />
      </label>

      <label v-if="formType !== 'game'">
        活動步驟（每行一個步驟）
        <textarea v-model="form.steps" rows="4" />
      </label>

      <!-- <label>
        活動步驟（每行一個步驟）
        <textarea v-model="form.steps" rows="4" />
      </label> -->

      <label v-if="formType !== 'game'">
        年齡建議
        <input v-model="form.age" placeholder="5歲以上" />
      </label>

      <label>
        圖片連結
        <input v-model="form.image" placeholder="5歲以上" />
      </label>

      <label v-if="formType !== 'game'">
        成品照片連結（1）
        <input v-model="form.resultImg1" />
      </label>

      <label v-if="formType !== 'game'">
        成品照片連結（2）
        <input v-model="form.resultImg2" />
      </label>

      <label>
        標籤（逗號分隔）
        <input v-model="form.tags" placeholder="感官遊戲, 創意勞作..." />
      </label>

      <label v-if="formType === 'game'">
        小遊戲路徑（例如 /game/drag-trash）
        <input v-model="form.path" />
      </label>
    </div>

    <!-- 跑馬燈訊息表單 -->
    <div v-else-if="formType === 'marquee'">
      <label>
        跑馬燈訊息
        <input v-model="form.marqueeMessage" required />
      </label>

      <label>
        分類（📌私人待做、🌟親子關係、🚀小知識、✨工商時間等）
        <input v-model="form.category" required />
      </label>
    </div>

    <!-- 提交按鈕 -->
    <button type="submit" :disabled="loading">
      {{ loading ? '儲存中...' : '新增項目' }}
    </button>

    <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { getDatabase, ref as dbRef, push } from 'firebase/database';
//import { app } from '~/utils/firebase';
import { initFirebase } from '~/utils/firebase'

const { db } = initFirebase()

// const db = getDatabase(app);

const formType = ref('marquee'); // 預設為跑馬燈
const loading = ref(false);
const successMessage = ref('');

const form = ref({
  title: '',
  description: '',
  image: 'https://raw.githubusercontent.com/lynnlee00/my-images/refs/heads/main/commingSoon.png',
  resultImg1: '',
  resultImg2: '',
  materials: '',
  steps: '',
  age: '',
  tags: '',
  path: '',
  marqueeMessage: '',
  category: '',
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (formType.value === 'activity' || formType.value === 'game') {
      const newData = {
        title: form.value.title,
        description: form.value.description,
        image: form.value.image || '',
        resultImg1: form.value.resultImg1 || '',
        resultImg2: form.value.resultImg2 || '',
        materials: form.value.materials,
        steps: form.value.steps,
        age: form.value.age,
        tags: form.value.tags.split(',').map(t => t.trim()),
        createdAt: Date.now(),
      };

      if (formType.value === 'game') {
        newData.path = form.value.path || '';
        await push(dbRef(db, 'games'), newData);
        successMessage.value = '✅ 已成功新增小遊戲！';
      } else {
        await push(dbRef(db, 'activities'), newData);
        successMessage.value = '✅ 已成功手作玩樂項目！';
      }

    } else if (formType.value === 'marquee') {
      const newMarquee = {
        message: form.value.marqueeMessage,
        category: form.value.category,
      };
      await push(dbRef(db, 'marqueeMessages'), newMarquee);
      successMessage.value = '✅ 已成功新增跑馬燈訊息！';
    }

    // 清空欄位
    form.value = {
      title: '',
      description: '',
      image: '',
      resultImg1: '',
      resultImg2: '',
      materials: '',
      steps: '',
      age: '',
      tags: '',
      path: '',
      marqueeMessage: '',
      category: '',
    };
  } catch (e) {
    console.error('寫入失敗：', e);
    successMessage.value = '❌ 發生錯誤，請稍後再試';
  } finally {
    loading.value = false;
    setTimeout(() => (successMessage.value = ''), 3000);
  }
};
</script>

<style scoped>
.activity-form {
  max-width: 850px;
  margin: 2rem auto;
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #f9f9f9;
}

label {
  display: block;
  margin-bottom: 12px;
}

input,
textarea,
select {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

button {
  background-color: #0077cc;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
}

button:disabled {
  background-color: #aaa;
}

.success-msg {
  color: green;
  margin-top: 12px;
}

.switch-form {
  margin-bottom: 20px;
}
</style>