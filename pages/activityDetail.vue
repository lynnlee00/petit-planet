<template>
  <div class="detail-container">
    <button class="back-btn" @click="router.back()">← 回首頁</button>

    <div v-if="activity" class="activity-content">
      <div class="left-image">
        <img :src="activity.image" alt="活動圖片" />
        
        <!-- 👉 大螢幕放這裡的圖片 -->
        <div class="result-images desktop-only">
          <img v-if="activity.resultImg1" :src="activity.resultImg1" />
          <img v-if="activity.resultImg2" :src="activity.resultImg2" />
        </div>
      </div>

      <div class="right-info">
        <h2>{{ activity.title }}</h2>
        <p><strong>活動介紹：</strong>{{ activity.description }}</p>
        <p>&nbsp;</p>
        <p><strong>材料：</strong><br /><span class="materials-text">{{ activity.materials }}</span></p>
        <p>&nbsp;</p>
        <p>
          <strong>做法：</strong><br />
          <span v-html="formattedSteps"></span>
        </p>
        <p>&nbsp;</p>
      </div>
    </div>

    <!-- 👉 小螢幕時放底下 -->
    <div class="result-images mobile-only">
      <img v-if="activity?.resultImg1" :src="activity.resultImg1" />
      <img v-if="activity?.resultImg2" :src="activity.resultImg2" />
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ref as dbRef, get } from 'firebase/database';
import { initFirebase } from '~/utils/firebase'

const { db } = initFirebase()
const route = useRoute();
const router = useRouter();
const activity = ref(null);

const activityId = route.query.id;

onMounted(async () => {
  if (activityId) {
    const snapshot = await get(dbRef(db, `activities/${activityId}`));
    if (snapshot.exists()) {
      activity.value = snapshot.val();
    }
  }
});

const formattedSteps = computed(() => {
  let content = activity.value?.steps || '';

  // 換行先統一為 <br>
  content = content.replace(/(\r\n|\n|\r|\u2028|\u2029)/g, '<br />');

  // 分隔線
  // content = content.replace(/\[分隔線\]/g, '☆;.+*:ﾟ+｡.☆;.+*:ﾟ+｡.☆;.+*:ﾟ+｡.☆');
  content = content.replace(/\[分隔線\]/g, '<div style="background-color: #e3f2fd; padding: 5px; text-align: center; border-radius: 6px; margin: 6px 0; font-size: 6px; color: #1976d2;"></div>');

  // [標題]
  content = content.replace(/\[標題\](.*?)(<br \/>|$)/g, '<h2 style="font-size: 24px; font-weight: bold; margin-top: 20px;">$1</h2>');

  // [主題]
  content = content.replace(/\[主題\](.*?)(<br \/>|$)/g, '<h3 style="font-size: 20px; font-weight: bold; margin-top: 16px;">$1</h3>');

  // [步驟]
  content = content.replace(/\[步驟\](.*?)(<br \/>|$)/g, '<div style="margin: 6px 0; padding-left: 1em; text-indent: -1em;"><strong>🔹 步驟：</strong> $1</div>');

  // [提醒]
  content = content.replace(/\[提醒\](.*?)(<br \/>|$)/g, '<div style="background-color: #ffe6f0; padding: 8px 12px; border-left: 5px solid #ff92c2; border-radius: 8px; margin: 8px 0;">📌 $1</div>');

  // [延伸]
  content = content.replace(/\[延伸\](.*?)(<br \/>|$)/g, '<p style="font-size: 14px; color: #888; margin: 6px 0 12px;">💡 $1</p>');

  // [教學目標]
  content = content.replace(/\[教學目標\](.*?)(<br \/>|$)/g, '<div style="background-color: #f0f0f0; border-left: 5px solid #bbb; padding: 10px; border-radius: 6px; margin: 10px 0;">📖 <strong>教學目標：</strong> $1</div>');

  return content;
});

</script>

<style scoped>
.detail-container {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  background-color: #ffcce5;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
}

.image-container img,
.result-images img {
  max-width: 100%;
  border-radius: 10px;
  margin-bottom: 20px;
}

.result-images {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.activity-content {
  display: flex;
  gap: 20px;
  flex-wrap: wrap; /* 保證小螢幕時換行 */
}

.left-image {
  flex: 1;
  min-width: 250px;
}

.left-image img {
  width: 100%;
  max-width: 100%;
  border-radius: 10px;
}

.right-info {
  flex: 2;
  min-width: 300px;
}

/* 結果圖片區 */
.result-images {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.result-images img {
  width: 100px;
  height: auto;
  border-radius: 10px;
}

/* 👉 手機版：單欄排版、縮小圖片 */
.result-images {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.result-images img {
  width: 100%;
  border-radius: 10px;
}

.materials-text {
  white-space: pre-line;
}

/* 桌機版顯示 desktop-only */
.desktop-only {
  display: block;
}
.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
    margin-top: 40px;
  }

  .mobile-only img {
    width: 100%;
  }
}

</style>