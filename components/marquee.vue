<!-- marquee.vue -->
<template>
  <div 
    class="marquee-container" 
    :style="{ 
      border: borderStyle(currentMessage.category), 
      backgroundColor: currentBgColor 
    }"
  >
    <div class="marquee-text fade-in" ref="marqueeTextRef">
      {{ currentMessage.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
//import { db } from "~/utils/firebase";
import { get, ref as dbRef } from "firebase/database";
import { initFirebase } from '~/utils/firebase'

const { db } = initFirebase()
const marqueeMessages = ref([]);
const currentMessage = ref({ message: "載入中...", category: "" });
const currentBgColor = ref("#F5F5F5");
const marqueeTextRef = ref(null);

const backgroundColors = ['#F5F5F5', '#E0F7FA', '#FFEBEE', '#FFF3E0', '#E8F5E9'];
function pickRandomColor() {
  const index = Math.floor(Math.random() * backgroundColors.length);
  return backgroundColors[index];
}

function borderStyle(category) {
  switch (category) {
    case '親子關係':
      return '3px solid #B2DFDB';
    case '小知識':
      return '3px solid #B3E5FC';
    case '工商時間':
      return '3px solid #FFCCBC';
    default:
      return '3px solid #B0BEC5';
  }
}

function updateMessage() {
  const el = marqueeTextRef.value;
  if (!el || marqueeMessages.value.length === 0) return;

  el.classList.remove('fade-in');
  el.classList.add('fade-out');

  setTimeout(() => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * marqueeMessages.value.length);
    } while (
      marqueeMessages.value[nextIndex] === currentMessage.value &&
      marqueeMessages.value.length > 1
    );

    currentMessage.value = marqueeMessages.value[nextIndex];
    currentBgColor.value = pickRandomColor();

    el.classList.remove('fade-out');
    el.classList.add('fade-in');
  }, 500);
}

onMounted(async () => {
  const snapshot = await get(dbRef(db, "marqueeMessages"));
  const data = snapshot.val();

  if (data) {
    marqueeMessages.value = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    // 初始化第一筆訊息
    const randomIndex = Math.floor(Math.random() * marqueeMessages.value.length);
    currentMessage.value = marqueeMessages.value[randomIndex];
    currentBgColor.value = pickRandomColor();

    // 啟動定時更新
    setInterval(updateMessage, 10000);
  } else {
    currentMessage.value = {
      message: "目前沒有可顯示的訊息",
      category: ""
    };
  }
});
</script>


<style scoped>
.marquee-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 900px;
  height: 50px;
  padding: 10px 0;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.marquee-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #000000;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  opacity: 1;
  transition: opacity 0.5s ease-in-out;
}

@media (max-width: 600px) {
  .marquee-container {
    height: 40px;
  }

  .marquee-text {
    font-size: 1rem;
  }
}

@media (max-width: 1024px) {
  .marquee-container {
    height: 45px;
  }

  .marquee-text {
    font-size: 1.2rem;
  }
}

@media (min-width: 1025px) {
  .marquee-container {
    height: 20px;
  }

  .marquee-text {
    font-size: 1.5rem;
  }
}

@media (max-width: 420px) {
  .marquee-container {
    padding: 6px 12px;
    height: auto;
    border-radius: 16px;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: none;
    font-size: 14px;
    line-height: 1.4;
    margin: 8px auto;
    box-sizing: border-box;
  }

  .marquee-text {
    font-size: 14px;
    font-weight: normal;
    text-align: left;
    white-space: normal;
    word-break: break-word;
  }
}

.fade-in {
  opacity: 1;
  transition: opacity 0.5s ease-in;
}
.fade-out {
  opacity: 0;
  transition: opacity 0.5s ease-out;
}
</style>