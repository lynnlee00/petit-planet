<template>
  <div class="wrapper">

    <!-- 頂部計分欄 -->
    <div class="score-bar">
      <div class="score-cell">
        <div class="score-num">{{ score }}</div>
        <div class="score-lbl">答對題數</div>
      </div>
      <div class="score-cell">
        <div class="score-num">🔥 {{ streak }}</div>
        <div class="score-lbl">連勝</div>
      </div>
      <div class="score-cell">
        <div class="score-num">🐱 {{ cats }}</div>
        <div class="score-lbl">獲得貓咪</div>
      </div>
    </div>

    <!-- 難度選擇列 -->
    <div class="level-bar">
      <button
        v-for="n in 8"
        :key="n + 1"
        class="level-btn"
        :class="{ 'level-btn--active': activeLevel === n + 1 }"
        @click="setLevel(n + 1)"
      >
        {{ n + 1 }} 的倍數
      </button>
    </div>

    <!-- 進度條 -->
    <div class="progress-wrap">
      <div class="progress-label">第 {{ questionIndex + 1 }} 題，共 {{ TOTAL }} 題</div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressWidth }"></div>
      </div>
    </div>

    <!-- 撒花（全螢幕） -->
    <transition name="fade">
      <div v-if="showConfetti" class="confetti-wrap" aria-hidden="true">
        <div v-for="i in 28" :key="i" class="confetti-piece" :style="confettiStyle(i)"></div>
      </div>
    </transition>

    <!-- 貓咪角色（卡片外獨立列） -->
    <div class="cat-row">
      <div class="cat-mascot" :class="catMascotClass">{{ catFace }}</div>
    </div>

    <!-- 題目卡片 -->
    <div v-if="q" class="card">

      <!-- 獲得貓咪慶祝訊息 -->
      <transition name="pop">
        <div v-if="catMessage" class="cat-celebrate">
          🎉 {{ catMessage }} 🎉
        </div>
      </transition>

      <!-- 故事文字 -->
      <p class="story">
        {{ q.story }}，總共有幾個 {{ q.emoji }}？
      </p>

      <!-- 算式 -->
      <div class="formula">{{ q.a }} × {{ q.b }} = ?</div>

      <!-- 選項 2×2 -->
      <div class="options">
        <button
          v-for="opt in q.options"
          :key="opt"
          class="opt-btn"
          :class="optClass(opt)"
          :disabled="answered"
          @click="pick(opt)"
        >
          {{ opt }}
        </button>
      </div>

      <!-- 回饋區 -->
      <transition name="fade">
        <div v-if="answered" class="feedback">
          <p class="feedback-msg" :class="correct ? 'feedback-msg--ok' : 'feedback-msg--no'">
            {{ feedbackText }}
          </p>
          <p class="reveal">
            {{ q.a }} 組 × {{ q.b }} 個 = 共 <strong>{{ q.answer }}</strong> 個 {{ q.emoji }}
          </p>
          <button class="next-btn" @click="next">
            {{ isLast ? '再玩一輪 ↺' : '下一題 →' }}
          </button>
        </div>
      </transition>

      <!-- 提示區 -->
      <div v-if="!answered" class="hint-section">
        <p class="hint-label">🐱 需要幫助嗎？</p>
        <button v-if="!showHint" class="hint-btn" @click="showHint = true">
          看圖數數 🔍
        </button>
      </div>

      <!-- 視覺化分組（點提示或答完後顯示） -->
      <transition name="slide-down">
        <div v-if="showHint || answered" class="boxes">
          <div v-for="i in q.a" :key="i" class="box">
            <div class="box-label">第 {{ i }} {{ q.unit }}</div>
            <div class="items" :class="{ 'items--small': q.b > 6 }">
              <span v-for="j in q.b" :key="j" class="item">{{ q.emoji }}</span>
            </div>
          </div>
        </div>
      </transition>

    </div>

    <!-- 底部貓咪收集區 -->
    <transition-group name="cat-pop" tag="div" class="cat-shelf">
      <span v-for="i in cats" :key="i" class="cat-icon">🐱</span>
    </transition-group>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ─── 常數 ───────────────────────────────────────────
const TOTAL = 10

const STORY_TYPES = [
  // 盒
  { tpl: (a, b) => `貓媽媽買了 ${a} 盒零食，每盒有 ${b} 個`, emoji: '🍪', unit: '盒' },
  { tpl: (a, b) => `貓咪超市有 ${a} 盒餅乾，每盒有 ${b} 片`, emoji: '🍘', unit: '盒' },
  { tpl: (a, b) => `貓貓魔法師準備了 ${a} 盒魔法糖，每盒有 ${b} 顆`, emoji: '🍬', unit: '盒' },
  // 籃
  { tpl: (a, b) => `小貓分到 ${a} 個籃子，每籃有 ${b} 條小魚`, emoji: '🐟', unit: '籃' },
  { tpl: (a, b) => `貓咪農場摘了 ${a} 籃草莓，每籃有 ${b} 顆`, emoji: '🍓', unit: '籃' },
  { tpl: (a, b) => `貓咪野餐帶了 ${a} 籃水果，每籃放了 ${b} 個`, emoji: '🍎', unit: '籃' },
  // 桌
  { tpl: (a, b) => `貓咪派對有 ${a} 桌，每桌放了 ${b} 個點心`, emoji: '🍩', unit: '桌' },
  { tpl: (a, b) => `貓咪餐廳有 ${a} 桌客人，每桌點了 ${b} 杯果汁`, emoji: '🧃', unit: '桌' },
  // 排
  { tpl: (a, b) => `貓貓商店有 ${a} 排貨架，每排有 ${b} 樣商品`, emoji: '⭐', unit: '排' },
  { tpl: (a, b) => `貓咪花園種了 ${a} 排花，每排有 ${b} 朵`, emoji: '🌸', unit: '排' },
  { tpl: (a, b) => `貓咪合唱團站成 ${a} 排，每排有 ${b} 隻`, emoji: '🎵', unit: '排' },
  // 袋
  { tpl: (a, b) => `貓咪市集買了 ${a} 袋糖果，每袋有 ${b} 顆`, emoji: '🍭', unit: '袋' },
  { tpl: (a, b) => `貓咪點心店裝了 ${a} 袋餅乾，每袋有 ${b} 塊`, emoji: '🥨', unit: '袋' },
  // 瓶
  { tpl: (a, b) => `魔法貓咪有 ${a} 瓶魔藥，每瓶需要加 ${b} 顆星星`, emoji: '✨', unit: '瓶' },
  { tpl: (a, b) => `貓咪果汁店有 ${a} 瓶果汁，每瓶放了 ${b} 顆葡萄`, emoji: '🍇', unit: '瓶' },
  // 層
  { tpl: (a, b) => `貓咪生日蛋糕有 ${a} 層，每層插了 ${b} 根蠟燭`, emoji: '🕯️', unit: '層' },
  { tpl: (a, b) => `貓咪書架有 ${a} 層，每層放了 ${b} 本書`, emoji: '📚', unit: '層' },
  // 隻
  { tpl: (a, b) => `${a} 隻貓咪各拿了 ${b} 個玩具`, emoji: '🎀', unit: '隻' },
  { tpl: (a, b) => `${a} 隻小貓各收集了 ${b} 顆星星`, emoji: '⭐', unit: '隻' },
  { tpl: (a, b) => `${a} 隻貓咪去海邊，各撿了 ${b} 顆貝殼`, emoji: '🐚', unit: '隻' },
  { tpl: (a, b) => `${a} 隻貓咪各戴了 ${b} 個蝴蝶結`, emoji: '🎀', unit: '隻' },
  { tpl: (a, b) => `${a} 隻貓咪去烤肉，各帶了 ${b} 串食物`, emoji: '🍢', unit: '隻' },
]

// ─── 狀態 ───────────────────────────────────────────
const activeLevel = ref(6)
const score = ref(0)
const streak = ref(0)
const cats = ref(0)
const questionIndex = ref(0)
const q = ref(null)
const answered = ref(false)
const correct = ref(false)
const selectedOpt = ref(null)
const catMessage = ref('')
const showHint = ref(false)
const showConfetti = ref(false)

// ─── computed ───────────────────────────────────────
const isLast = computed(() => questionIndex.value >= TOTAL - 1)

const progressWidth = computed(
  () => `${(questionIndex.value / TOTAL) * 100}%`
)

const feedbackText = computed(() => {
  if (correct.value) return '答對了！真棒！🎉'
  return `答案是 ${q.value.answer}，自己數數看格子裡有幾個！`
})

const catFace = computed(() => {
  if (!answered.value) return '😺'
  return correct.value ? '😸' : '😿'
})

const catMascotClass = computed(() => {
  if (!answered.value) return 'cat-idle'
  return correct.value ? 'cat-happy' : 'cat-sad'
})

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#ff92c2']

const confettiStyle = (i) => {
  const angle = (i / 28) * 360
  const dist = 120 + (i % 5) * 40
  const tx = Math.cos(angle * Math.PI / 180) * dist
  const ty = Math.sin(angle * Math.PI / 180) * dist
  return {
    '--tx': `${tx}px`,
    '--ty': `${ty}px`,
    '--rot': `${(i * 73) % 720}deg`,
    animationDelay: `${(i * 0.018) % 0.12}s`,
    animationDuration: `${0.55 + (i % 5) * 0.12}s`,
    width: `${14 + (i % 5) * 5}px`,
    height: `${14 + (i % 5) * 5}px`,
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    borderRadius: i % 3 === 0 ? '50%' : '3px',
  }
}

// ─── 工具函式 ────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const genOptions = (answer) => {
  const set = new Set([answer])
  let attempts = 0
  while (set.size < 4 && attempts < 60) {
    attempts++
    const delta = rand(1, 9)
    for (const c of [answer + delta, answer - delta]) {
      if (c > 0 && c <= 81 && !set.has(c)) {
        set.add(c)
        if (set.size === 4) break
      }
    }
  }
  // 萬一仍不足4個，從1往上補（極少發生）
  for (let i = 1; set.size < 4; i++) {
    if (!set.has(i)) set.add(i)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

const makeQuestion = () => {
  const a = activeLevel.value
  const b = rand(1, 9)
  const answer = a * b
  const type = STORY_TYPES[rand(0, STORY_TYPES.length - 1)]
  return {
    a,
    b,
    answer,
    story: type.tpl(a, b),
    emoji: type.emoji,
    unit: type.unit,
    options: genOptions(answer),
  }
}

// ─── 遊戲動作 ─────────────────────────────────────────
const start = () => {
  answered.value = false
  selectedOpt.value = null
  correct.value = false
  catMessage.value = ''
  showHint.value = false
  showConfetti.value = false
  q.value = makeQuestion()
}

const setLevel = (n) => {
  activeLevel.value = n
  questionIndex.value = 0
  score.value = 0
  streak.value = 0
  cats.value = 0
  catMessage.value = ''
  start()
}

const pick = (opt) => {
  if (answered.value) return
  selectedOpt.value = opt
  answered.value = true
  correct.value = opt === q.value.answer

  if (correct.value) {
    score.value++
    streak.value++
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 2500)
    if (streak.value % 3 === 0) {
      cats.value++
      catMessage.value = `連勝 ${streak.value} 題！恭喜獲得第 ${cats.value} 隻貓咪！`
    }
  } else {
    streak.value = 0
  }
}

const next = () => {
  if (isLast.value) {
    questionIndex.value = 0
  } else {
    questionIndex.value++
  }
  start()
}

const optClass = (opt) => {
  if (!answered.value) return ''
  if (opt === q.value.answer) return 'opt-btn--correct'
  if (opt === selectedOpt.value) return 'opt-btn--wrong'
  return ''
}

// ─── 初始化 ───────────────────────────────────────────
start()
</script>

<style scoped>
/* ── wrapper ── */
.wrapper {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px 14px 40px;
}

/* ── 計分欄 ── */
.score-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.score-cell {
  background: #f5f3ff;
  border: 2px solid #c4b5fd;
  border-radius: 16px;
  padding: 10px 6px;
  text-align: center;
}
.score-num {
  font-size: 20px;
  font-weight: 800;
  color: #5b21b6;
}
.score-lbl {
  font-size: 11px;
  color: #7c3aed;
  margin-top: 3px;
}

/* ── 難度列 ── */
.level-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 14px;
}
.level-btn {
  padding: 8px 10px;
  border-radius: 20px;
  border: 2px solid #c4b5fd;
  background: #fff;
  color: #5b21b6;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  min-height: 44px;
}
.level-btn:hover {
  background: #ede9fe;
}
.level-btn--active {
  background: #ddd6fe;
  border-color: #7c3aed;
  color: #3b0764;
}

/* ── 進度條 ── */
.progress-wrap {
  margin-bottom: 14px;
}
.progress-label {
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 5px;
}
.progress-track {
  height: 10px;
  background: #e9d5ff;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #7c3aed;
  border-radius: 999px;
  transition: width 0.35s ease;
}

/* ── 撒花 ── */
.confetti-wrap {
  position: fixed;
  top: 38%;
  left: 50%;
  pointer-events: none;
  z-index: 999;
}
.confetti-piece {
  position: absolute;
  top: 0;
  left: 0;
  animation: confettiBurst ease-out forwards;
}
@keyframes confettiBurst {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  60%  { opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)); opacity: 0; }
}

/* ── 題目卡片 ── */
.card {
  background: #fff;
  border: 2px solid #ddd6fe;
  border-radius: 24px;
  padding: 18px 16px;
}

/* ── 貓咪角色列 ── */
.cat-row {
  display: flex;
  justify-content: flex-end;
  padding-right: 8px;
  margin-bottom: 4px;
}
.cat-mascot {
  font-size: 42px;
  line-height: 1;
  user-select: none;
}
.cat-idle {
  animation: catBob 2.5s ease-in-out infinite;
}
.cat-happy {
  animation: catBounce 0.55s ease infinite;
}
.cat-sad {
  animation: catShake 0.45s ease forwards;
}
@keyframes catBob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
@keyframes catBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  40%      { transform: translateY(-14px) scale(1.2); }
}
@keyframes catShake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  20%      { transform: translateX(-7px) rotate(-8deg); }
  40%      { transform: translateX(7px) rotate(8deg); }
  60%      { transform: translateX(-4px) rotate(-4deg); }
  80%      { transform: translateX(4px) rotate(4deg); }
}

/* 慶祝訊息 */
.cat-celebrate {
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 12px;
  font-size: 14px;
}

/* 故事文字 */
.story {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.7;
}

/* ── 提示區 ── */
.hint-section {
  border-top: 1px dashed #ddd6fe;
  margin-top: 16px;
  padding-top: 12px;
  text-align: center;
}
.hint-label {
  font-size: 13px;
  color: #7c3aed;
  font-weight: 600;
  margin-bottom: 8px;
}
.hint-row {
  text-align: center;
  margin: 6px 0 4px;
}
.hint-btn {
  background: #fff;
  border: 2px dashed #a78bfa;
  color: #6d28d9;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  min-height: 44px;
}
.hint-btn:hover {
  background: #f5f3ff;
  transform: scale(1.04);
}

/* ── 盒子區 ── */
.boxes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}
.box {
  background: #eeedfe;
  border: 2px solid #afa9ec;
  border-radius: 14px;
  padding: 8px;
  min-width: 60px;
  text-align: center;
}
.box-label {
  font-size: 15px;
  color: #5b21b6;
  font-weight: 700;
  margin-bottom: 6px;
  white-space: nowrap;
}
.items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3px;
}
.item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fac775;
  border: 2px solid #f59e0b;
  border-radius: 50%;
  font-size: 20px;
}
.items--small .item {
  width: 28px;
  height: 28px;
  font-size: 15px;
  border-width: 1px;
}

/* ── 算式 ── */
.formula {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  color: #4c1d95;
  margin-bottom: 14px;
  letter-spacing: 3px;
}

/* ── 選項 ── */
.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.opt-btn {
  min-height: 54px;
  font-size: 22px;
  font-weight: 800;
  border-radius: 14px;
  border: 2px solid #c4b5fd;
  background: #f5f3ff;
  color: #3b0764;
  cursor: pointer;
  transition: background 0.12s, transform 0.1s;
}
.opt-btn:hover:not(:disabled) {
  background: #ede9fe;
  transform: scale(1.04);
}
.opt-btn:disabled {
  cursor: default;
}
.opt-btn--correct {
  background: #d1fae5 !important;
  border-color: #10b981 !important;
  color: #065f46 !important;
}
.opt-btn--wrong {
  background: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #7f1d1d !important;
}

/* ── 回饋 ── */
.feedback {
  text-align: center;
  padding-top: 4px;
}
.feedback-msg {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
}
.feedback-msg--ok { color: #059669; }
.feedback-msg--no { color: #dc2626; }

.reveal {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 14px;
}
.next-btn {
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  min-height: 48px;
}
.next-btn:hover {
  background: #5b21b6;
  transform: scale(1.03);
}

/* ── 貓咪收集區 ── */
.cat-shelf {
  margin-top: 18px;
  text-align: center;
  font-size: 30px;
  letter-spacing: 3px;
  min-height: 40px;
}
.cat-icon {
  display: inline-block;
}

/* ── transitions ── */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.pop-enter-active { animation: popIn 0.25s ease; }
.pop-leave-active { animation: popIn 0.2s ease reverse; }

.slide-down-enter-active { animation: slideDown 0.3s ease; }
.slide-down-leave-active { animation: slideDown 0.2s ease reverse; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cat-pop-enter-active { animation: popIn 0.3s ease; }

@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* ── RWD ── */
@media (max-width: 420px) {
  .level-btn {
    padding: 6px 8px;
    font-size: 12px;
  }
  .formula {
    font-size: 20px;
  }
  .opt-btn {
    font-size: 18px;
    min-height: 48px;
  }
  .story {
    font-size: 15px;
  }
}
</style>
