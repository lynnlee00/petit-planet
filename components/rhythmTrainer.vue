<template>
  <div class="rhythm-trainer">
    <div class="title-with-help">
      <h2>🎵 跟著音樂動一動 </h2>
      <button @click="showInfo = true" class="inline-help-button"> 玩法說明</button>
    </div>

    <p v-if="isPlaying" style="font-size: 18px; margin-bottom: 10px;">⏱️ 已經播放：{{ elapsedTime }} 秒</p>

    <!-- 倒數提示 -->
    <div v-if="countdown > 0" class="countdown-overlay">
      <span>{{ countdown }}</span>
    </div>

    <!-- 選擇區域：音樂與圖卡類型 -->
    <div class="select-row">
      <div class="select-group">
        <label>背景音樂：</label>
        <select v-model="selectedTrack" class="cute-select">
          <option v-for="track in musicTracks" :key="track.id" :value="track">
            {{ track.name }}
          </option>
        </select>
      </div>

      <div class="select-group">
        <label>圖卡類型：</label>
        <select v-model="selectedImageType" class="cute-select">
          <option value="note">音符圖卡</option>
          <option value="action">動作圖卡</option>
          <option value="dot">圓點圖卡</option>
        </select>
      </div>

      <div class="preview-group">
        <img v-if="selectedImageType === 'note'" :src="noteImages[0]" class="preview-img" alt="preview" />
        <img v-if="selectedImageType === 'dot'" :src="dotImages[0]" class="preview-img" alt="preview" />
        <img v-if="selectedImageType === 'action'" :src="actionImages[0]" class="preview-img" alt="preview" />
      </div>
    </div>

    <div class="select-group">
      <label>難易度：</label>
      <select v-model="selectedDifficulty" class="cute-select">
        <option value="easy">簡單</option>
        <option value="normal">隨機</option>
        <option value="fixed">固定</option>
      </select>
    </div>

    <div class="button-row">
      <button @click="prepareStart" :disabled="isPlaying">開始</button>
      <button @click="restGame" :disabled="!isPlaying">停止</button>
      <!-- <button @click="showCompletion = true" style="background-color:#ffd700; color:#333; margin-left: 8px;">
        測試完成畫面
      </button> -->
    </div>

    <!-- 單列顯示圖卡 -->
    <div class="row">
      <div v-for="(item, idx) in displayItems" :key="'item-' + idx" class="card"
        :class="{ active: flashingIndex === idx }">
        <img :src="item" alt="item" />
      </div>
    </div>

    <transition name="intro-fade">
      <p v-if="showIntroText" class="intro-text">
        🎶 小提醒：這首歌有前奏，請準備跟上節奏喔！
      </p>
    </transition>

    <transition name="fade-zoom">
      <div v-if="showCompletion" class="completion-container">
        <img :src="completionImage" alt="完成圖示" class="completion-img" />
      </div>
    </transition>

  </div>
  <!-- ✅ 說明按鈕浮動區 -->
  <!-- <div class="info-button-container">
    <button @click="showInfo = true" class="info-button">❓ 說明</button>
  </div> -->

  <!-- ✅ 說明彈跳視窗 -->
  <transition name="fade-zoom">
    <div v-if="showInfo" class="info-modal" @click.self="showInfo = false">
      <div class="info-content" @click.stop>
        <h3>🎵 怎麼玩這個節奏遊戲？</h3>
        <p>這是一款適合親子共玩的節奏練習小遊戲 ✨</p>
        <ul>
          <li>選好 <strong>音樂</strong>、<strong>圖卡類型</strong> 和 <strong>難易度</strong></li>
          <li>按下 <strong>「開始」</strong>，畫面會依節奏閃爍圖卡</li>
          <li>跟著圖卡拍手、做動作或數拍子，訓練節奏感 💃🕺</li>
          <li><strong>簡單模式</strong> 適合初學，<strong>固定模式</strong> 則有設計好的節奏組</li>
        </ul>
        <p style="font-size: 14px; color: #666;">👨‍👩‍👧‍👦 建議一起玩，互動更有趣！</p>
        <p style="font-size: 14px; color: #666;">💡 想看更多玩法？可到 YouTube 搜尋「節奏遊戲」喔～</p>
        <div style="text-align: center; margin-top: 20px;">
          <button @click="showInfo = false" class="close-button">關閉</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
const showIntroText = ref(false);

const musicTracks = [
  {
    id: 'track3',
    name: '布穀鳥音樂節奏',
    url: '/music/rhythm/cuckoo_loop.mp3',
    bpm: 95,
  },
  {
    id: 'track1',
    name: '輕快拍手歌',
    url: '/music/clap_song.mp3',
    bpm: 100,
  },
  {
    id: 'track2',
    name: '快節奏打擊樂',
    url: '/music/drum_loop.mp3',
    bpm: 120,
  },
];

const isPlaying = ref(false);
const selectedTrack = ref(musicTracks[0]);
const selectedImageType = ref('action');
const selectedDifficulty = ref('fixed');
const displayItems = ref([]);
const flashingIndex = ref(null);
const countdown = ref(0);

let loop = null;
let flashLoop = null;
let audio = null;
const elapsedTime = ref(0);
let timerInterval = null;

const noteImages = [
  '/images/game/rhythm/note1.png',
  '/images/game/rhythm/note2.png',
  '/images/game/rhythm/note3.png',
  '/images/game/rhythm/note4.png'
];

const actionImages = [
  '/images/game/rhythm/shoulderR.png',
  '/images/game/rhythm/clap.png',
  '/images/game/rhythm/leg.png',
  '/images/game/rhythm/shoulderL.png'
];

const dotImages = [
  '/images/game/rhythm/dot1.png',
  '/images/game/rhythm/dot1-1.png',
  '/images/game/rhythm/dot2.png',
  '/images/game/rhythm/dot2-1.png',
  '/images/game/rhythm/dot3-1.png',
  '/images/game/rhythm/dot4.png'
];

const easyDotImages = [
  '/images/game/rhythm/dot1.png',
  '/images/game/rhythm/dot1-1.png',
  '/images/game/rhythm/dot2.png',
  '/images/game/rhythm/dot2-1.png'
];

const fixedPatterns = {
  note: [
    [noteImages[0], noteImages[0], noteImages[0], noteImages[0]],
    [noteImages[0], noteImages[0], noteImages[0], noteImages[0]],
    [noteImages[0], noteImages[1], noteImages[0], noteImages[1]],
    [noteImages[0], noteImages[1], noteImages[0], noteImages[1]],
    [noteImages[1], noteImages[1], noteImages[1], noteImages[1]],
    [noteImages[1], noteImages[1], noteImages[1], noteImages[1]],
    [noteImages[1], noteImages[0], noteImages[1], noteImages[0]],
    [noteImages[1], noteImages[0], noteImages[1], noteImages[0]],
    [noteImages[1], noteImages[1], noteImages[1], noteImages[2]],
    [noteImages[1], noteImages[1], noteImages[1], noteImages[2]]
  ],
  action: [
    [actionImages[1], actionImages[1], actionImages[1], actionImages[1]],
    [actionImages[1], actionImages[1], actionImages[1], actionImages[1]],
    [actionImages[2], actionImages[2], actionImages[2], actionImages[2]],
    [actionImages[2], actionImages[2], actionImages[2], actionImages[2]],
    [actionImages[0], actionImages[0], actionImages[3], actionImages[3]],
    [actionImages[0], actionImages[0], actionImages[3], actionImages[3]],
    [actionImages[0], actionImages[1], actionImages[2], actionImages[3]],
    [actionImages[0], actionImages[1], actionImages[2], actionImages[3]],
    [actionImages[1], actionImages[0], actionImages[3], actionImages[2]],
    [actionImages[1], actionImages[0], actionImages[3], actionImages[2]],
    [actionImages[2], actionImages[2], actionImages[0], actionImages[0]],
    [actionImages[2], actionImages[2], actionImages[0], actionImages[0]],
    [actionImages[3], actionImages[3], actionImages[1], actionImages[1]],
    [actionImages[3], actionImages[3], actionImages[1], actionImages[1]]
  ],
  dot: [
    [dotImages[0], dotImages[1], dotImages[0], dotImages[1]],
    [dotImages[0], dotImages[1], dotImages[0], dotImages[1]],
    [dotImages[2], dotImages[3], dotImages[2], dotImages[3]],
    [dotImages[2], dotImages[3], dotImages[2], dotImages[3]],
    [dotImages[0], dotImages[2], dotImages[0], dotImages[2]],
    [dotImages[0], dotImages[2], dotImages[0], dotImages[2]],
    [dotImages[2], dotImages[0], dotImages[2], dotImages[0]],
    [dotImages[2], dotImages[0], dotImages[2], dotImages[0]]
  ]
};

function randomFour(arr) {
  return Array.from({ length: 4 }, () => arr[Math.floor(Math.random() * arr.length)]);
}

function generateEasyPattern(imageSet) {
  const pair = [imageSet[Math.floor(Math.random() * imageSet.length)]];
  while (pair.length < 2) {
    const next = imageSet[Math.floor(Math.random() * imageSet.length)];
    if (!pair.includes(next)) pair.push(next);
  }
  return Array.from({ length: 4 }, (_, i) => pair[i % 2]);
}

function prepareStart() {
  countdown.value = 3;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer);
      startGame();
    }
  }, 1000);
}

function restGame() {
  window.location.reload();
}

function startGame() {
  showCompletion.value = false;

  if (!selectedTrack.value) return;
  isPlaying.value = true;
  audio = new Audio(selectedTrack.value.url);
  audio.play();

  const beatDuration = 60000 / selectedTrack.value.bpm;
  let index = 0;
  let fixedIndex = 0;

  const isEasy = selectedDifficulty.value === 'easy';
  const isFixed = selectedDifficulty.value === 'fixed';

  const type = selectedImageType.value;
  const imageSet =
    type === 'note' ? noteImages :
      type === 'action' ? actionImages :
        isEasy ? easyDotImages : dotImages;

  // 初始化圖卡
  if (isFixed) {
    const pattern = fixedPatterns[type] || [];
    displayItems.value = pattern[fixedIndex] || [];
  } else {
    displayItems.value = isEasy
      ? generateEasyPattern(imageSet)
      : randomFour(imageSet);
  }

  // 圖卡節奏播放邏輯
  const loopStart = () => {
    flashLoop = setInterval(() => {
      if ((index + 1) % 4 === 0) {
        setTimeout(() => {
          if (isFixed) {
            const pattern = fixedPatterns[type] || [];
            fixedIndex = (fixedIndex + 1) % pattern.length;
            displayItems.value = pattern[fixedIndex] || [];
          } else {
            displayItems.value = isEasy
              ? generateEasyPattern(imageSet)
              : randomFour(imageSet);
          }
        }, beatDuration * 0.9);
      }

      index = (index + 1) % 4;
    }, beatDuration);
  };

  // track3（布穀鳥）延遲進節奏
  if (selectedTrack.value.id === 'track3') {
    showIntroText.value = true;
    setTimeout(() => showIntroText.value = false, 4600);
    setTimeout(loopStart, 4600);
  } else {
    loopStart();
  }

  const totalDuration = selectedTrack.value.id === 'track3' ? 46400 : 60000;
  setTimeout(() => stopGame(), totalDuration);

  elapsedTime.value = 0;
  timerInterval = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
}

function stopGame() {
  clearInterval(flashLoop);
  if (audio) audio.pause();
  isPlaying.value = false;
  flashingIndex.value = null;
  countdown.value = 0;
  clearInterval(timerInterval);

  // ✅ 如果是 track3，顯示完成圖；否則清空
  if (selectedTrack.value.id === 'track3') {
    displayItems.value = [];
    showCompletion.value = true;
  } else {
    showCompletion.value = false;
  }
}

const showCompletion = ref(false);
const completionImage = '/images/game/rhythm/congrats.png';

const showInfo = ref(false);


</script>

<style scoped>
.intro-text {
  font-size: 18px;
  color: #ff84a8;
  margin-top: 12px;
  font-weight: bold;
  animation: floatText 1.5s ease-in-out infinite alternate;
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* 浮動動畫 */
@keyframes floatText {
  from {
    transform: translateY(0px);
  }

  to {
    transform: translateY(-4px);
  }
}

/* 過場動畫 - 淡出縮小 */
.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.intro-fade-enter-to,
.intro-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.rhythm-trainer {
  text-align: center;
  padding: 20px;
  background: #fffef6;
}

.countdown-overlay {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  color: #ff6f91;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px 40px;
  border-radius: 20px;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.select-row {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.select-group {
  font-size: 18px;
}

.cute-select {
  padding: 6px 12px;
  font-size: 16px;
  border: 2px solid #ffc0cb;
  border-radius: 12px;
  background-color: #fff;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-left: 8px;
}

.preview-group {
  display: flex;
  align-items: center;
}

.preview-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-left: 10px;
}

.button-row {
  margin: 10px 0 20px;
}

.row {
  display: flex;
  justify-content: center;
  margin: 20px auto;
  gap: 3vw;
  max-width: 90vw;
}

.card {
  width: 24vw;
  height: 24vw;
  max-width: 140px;
  max-height: 140px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card.active {
  transform: scale(1.2);
  box-shadow: 0 0 14px #ffa8c2;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  margin: 10px 8px 0;
  border-radius: 8px;
  border: none;
  background-color: #ffc0cb;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

button:disabled {
  background-color: #ddd;
  color: #999;
  cursor: not-allowed;
}

.completion-container {
  margin-top: 20px;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }

  60% {
    opacity: 1;
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.completion-img {
  max-width: 80vw;
  max-height: 50vh;
  border-radius: 16px;
  box-shadow:
    0 0 0 4px #fff,
    0 0 8px 2px #ffc0cb,
    0 0 12px 4px #ffa8c2;
  animation: pulse-glow 2s infinite ease-in-out;
  transition: transform 0.5s ease;
}

@keyframes pulse-glow {

  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 4px #fff,
      0 0 8px 2px #ffc0cb,
      0 0 12px 4px #ffa8c2;
  }

  50% {
    transform: scale(1.04);
    box-shadow:
      0 0 0 5px #fff,
      0 0 12px 3px #ff94b6,
      0 0 20px 6px #ff84a8;
  }
}

@media (max-width: 600px) {
  .row {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 50vw;
    height: 50vw;
    max-width: 120px;
    max-height: 120px;
  }
}

.fade-zoom-enter-active {
  animation: fadeZoomIn 0.6s ease-out forwards;
}

.circle-help-button {
  background-color: #fff0f5;
  color: #d63384;
  border: 2px solid #ffb6c1;
  font-weight: bold;
  font-size: 18px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  vertical-align: middle;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.circle-help-button:hover {
  transform: scale(1.1);
  background-color: #ffe4e9;
}

.info-button-container {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 999;
}

.info-button {
  background-color: #fff3cd;
  color: #856404;
  border: 2px solid #ffeeba;
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.info-button:hover {
  background-color: #ffec99;
}

.info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.info-content {
  background-color: #fffef6;
  border-radius: 20px;
  padding: 24px 28px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.2);
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
}

.info-content h3 {
  margin-top: 0;
  color: #ff84a8;
  font-weight: bold;
}

.info-content ul {
  padding-left: 20px;
  margin: 12px 0;
}

.close-button {
  background-color: #ffc0cb;
  color: white;
  font-weight: bold;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.close-button:hover {
  background-color: #ff94b6;
}

.title-with-help {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.inline-help-button {
  background-color: #fff3cd;
  color: #856404;
  border: 2px solid #ffeeba;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.inline-help-button:hover {
  background-color: #ffeeb5;
}

@keyframes fadeZoomIn {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
