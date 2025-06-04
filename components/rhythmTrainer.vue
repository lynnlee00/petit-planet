<template>
  <div class="rhythm-trainer">
    <h2>🎵 跟著音樂動一動</h2>
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
        <option value="normal">正常</option>
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
const selectedImageType = ref('note');
const selectedDifficulty = ref('normal');
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
