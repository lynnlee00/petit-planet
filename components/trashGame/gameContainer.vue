<!-- gameContainer -->
<template>
  <div class="game-container">
    <h2 class="title">🐧 垃圾分一分！ 拖曳遊戲</h2>
    <p class="subtitle">幫企鵝把垃圾分類吧！</p>
    <p class="progress">
      目前第 {{ showResult ? maxRounds : round + 1 }} / {{ maxRounds }} 回合
    </p>

    <div class="trash-items">
      <div v-for="item in currentItems" :key="item.id" class="trash-item" draggable="true"
        @dragstart="onDragStart(item.id)">
        {{ item.emoji }}
      </div>
    </div>

    <div class="trash-bins">
      <div v-for="category in selectedCategories" :key="category" class="trash-bin" @dragover.prevent
        @drop="onDrop(category)">
        {{ category }}
      </div>
    </div>

    <PenguinFeedback :status="feedbackStatus" />

    <div v-if="showResult" class="result-modal">
      <div class="result-box">
        <h3>🎉 恭喜完成所有題目！</h3>
        <p>你總共答對了 {{ score }} 題！</p>

        <h4>你遇到過的垃圾有：</h4>
        <ul class="history-list">
          <li v-for="item in historyItems" :key="item.id">
            {{ item.emoji }} {{ item.name }}
          </li>
        </ul>

        <h4 v-if="wrongItems.length">你曾經分類錯誤的垃圾有：</h4>
        <ul v-if="wrongItems.length" class="wrong-list">
          <li v-for="item in wrongItems" :key="item.id">
            {{ item.emoji }} {{ item.name }}
          </li>
        </ul>

        <button @click="restartGame">再玩一次</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PenguinFeedback from './penguinFeedback.vue';
const historyItems = ref([]);
const wrongItems = ref([]);

const allCategories = [
  '廚餘 🥕',
  '塑膠類 🧴',
  '紙類 📄',
  '一般垃圾 🍬',
  '鋁箔類 🪙',
  '玻璃類 🍾',
  '電池類 🔋',
  '布類 🧦'
];

const allItems = [
  // 廚餘
  { id: 'apple', name: '蘋果核', emoji: '🍎', category: '廚餘 🥕' },
  { id: 'banana', name: '香蕉皮', emoji: '🍌', category: '廚餘 🥕' },
  { id: 'fishbone', name: '魚骨頭', emoji: '🐟', category: '廚餘 🥕' },

  // 塑膠類
  { id: 'bottle', name: '寶特瓶', emoji: '🧴', category: '塑膠類 🧴' },
  { id: 'takeout-box', name: '外帶盒', emoji: '🍱', category: '塑膠類 🧴' },

  // 紙類
  { id: 'newspaper', name: '報紙', emoji: '📰', category: '紙類 📄' },
  { id: 'book', name: '舊書', emoji: '📚', category: '紙類 📄' },

  // 一般垃圾
  { id: 'wrapper', name: '糖果紙', emoji: '🍬', category: '一般垃圾 🍬' },
  { id: 'tissue', name: '衛生紙', emoji: '🧻', category: '一般垃圾 🍬' },

  // 鋁箔類
  { id: 'foil', name: '鋁箔紙', emoji: '🪙', category: '鋁箔類 🪙' },
  { id: 'can', name: '鋁罐', emoji: '🥫', category: '鋁箔類 🪙' },

  // 玻璃類
  { id: 'glass-bottle', name: '玻璃瓶', emoji: '🍾', category: '玻璃類 🍾' },
  { id: 'lightbulb', name: '燈泡', emoji: '💡', category: '玻璃類 🍾' },

  // 電池類
  { id: 'battery', name: '電池', emoji: '🔋', category: '電池類 🔋' },
  { id: 'remote', name: '舊遙控器', emoji: '📺', category: '電池類 🔋' },

  // 布類
  { id: 'sock', name: '舊襪子', emoji: '🧦', category: '布類 🧦' },
  { id: 'shirt', name: '舊衣服', emoji: '👕', category: '布類 🧦' }
];


let bgm;

onMounted(() => {
  bgm = new Audio('/music/trashPenguin/cute-happy-kids-354678.mp3')
  bgm.loop = true
  bgm.volume = 0.4

  // 某些瀏覽器需要點擊事件後才允許播放
  bgm.play().catch(() => {
    console.log('🔇 音樂播放被阻止，需用戶互動觸發');
  });
})

onUnmounted(() => {
  if (bgm) {
    bgm.pause();
    bgm.currentTime = 0;
  }
})

const isMuted = ref(false);

function toggleMute() {
  isMuted.value = !isMuted.value;
  if (bgm) bgm.muted = isMuted.value;
}
const currentItems = ref([]);
const selectedCategories = ref([]);
const feedbackStatus = ref('neutral');
const score = ref(0);
const round = ref(0);
const maxRounds = 5;
const showResult = ref(false);

function getRandomElements(arr, count) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function loadNewRound() {
  selectedCategories.value = getRandomElements(allCategories, 3);
  const newItems = getRandomElements(
    allItems.filter(item => selectedCategories.value.includes(item.category)),
    3
  );

  currentItems.value = newItems;

  // ✅ 累加到歷史紀錄
  historyItems.value.push(...newItems);
}


function playSound(path) {
  const audio = new Audio(path);
  audio.play();
}

onMounted(() => {
  loadNewRound();
});

function onDragStart(id) {
  event.dataTransfer.setData('text/plain', id);
}

function onDrop(targetCategory) {
  const itemId = event.dataTransfer.getData('text/plain');
  const index = currentItems.value.findIndex(i => i.id === itemId);
  const item = currentItems.value[index];

  if (item && item.category === targetCategory) {
    feedbackStatus.value = 'correct';
    playSound('/sounds/correct.mp3');
    currentItems.value.splice(index, 1);
    score.value++;
  } else {
    feedbackStatus.value = 'wrong';
    playSound('/sounds/wrong.mp3');

    // ✅ 紀錄錯誤項目（避免重複）
    if (item && !wrongItems.value.find(w => w.id === item.id)) {
      wrongItems.value.push(item);
    }
  }

  setTimeout(() => {
    feedbackStatus.value = 'neutral';
    if (showResult.value) return; // ✅ 防止重複觸發結束

    if (currentItems.value.length === 0) {
      round.value++;
      if (round.value < maxRounds) {
        loadNewRound();
      } else {
        showResult.value = true;
      }
    }
  }, 1000);
}

function restartGame() {
  score.value = 0;
  round.value = 0;
  showResult.value = false;
  historyItems.value = [];
  wrongItems.value = []; // ✅ 清空錯誤紀錄
  loadNewRound();
}
</script>

<style scoped>
.game-container {
  text-align: center;
  padding: 20px;
}

.title {
  font-size: 24px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.progress {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}

.trash-items,
.trash-bins {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
}

.trash-item {
  font-size: 50px;
  margin-bottom: 4px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: #fffef5;
}

.wrong-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  text-align: left;
  color: #d62828;
  font-size: 16px;
  line-height: 1.6;
}

.trash-bin {
  font-size: 20px;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #aaa;
  border-radius: 12px;
  background-color: #f0f0f0;
}

.result-modal {
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.result-box {
  background: #fff;
  padding: 24px 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  /* ✅ 新增以下設定 */
  max-height: 80vh;         /* 限制最大高度為視窗 80% */
  overflow-y: auto;         /* 若內容超過則可滾動 */
}

.result-box h3 {
  margin-bottom: 10px;
}

.result-box button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
}

.result-box button:hover {
  background-color: #43a047;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  text-align: left;
  font-size: 16px;
  line-height: 1.6;
}
</style>