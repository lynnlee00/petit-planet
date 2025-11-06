<template>
    <div class="color-game">
        <div class="title-with-info">
            <h2>🎨 顏色記憶挑戰</h2>
            <button class="info-btn" @click="showInfo = true">玩法說明</button>
        </div>
        <!-- <h2>🎨 顏色記憶挑戰</h2>
       <button @click="showInfo = true" class="inline-help-button"> 玩法說明</button>
        <button class="info-btn" @click="showInfo = true"> 玩法說明</button> -->


        <p class="sub-title">✨ 請記住顏色出現的順序！✨</p>

        <div class="controls">
            <!-- 第一行：模式 + 顏色數量 -->
            <div class="control-row">
                <label>🎮 模式選擇：
                    <select v-model="mode">
                        <option value="sequence">記住整組順序</option>
                        <option value="position">記住第幾個顏色</option>
                    </select>
                </label>
                <label>🎨 題目顏色總數量：
                    <input type="number" v-model.number="colorCount" min="1" max="15" />
                </label>
            </div>

            <!-- 第二行：顏色數量 + 顏色風格 -->
            <div class="control-row">
                <label>🎨 顏色風格：
                    <select v-model="colorStyle">
                        <option value="soft">柔和色</option>
                        <option value="vivid">鮮豔色</option>
                        <option value="candy">糖果爆炸</option>
                    </select>
                </label>
                <div class="color-preview">
                    <span v-for="color in COLOR_STYLES[colorStyle]" :key="color" class="color-dot"
                        :style="{ backgroundColor: color }"></span>
                </div>
            </div>

            <!-- 第三行：間隔時間 -->
            <div class="control-row">
                <label>⏱️ 顏色間隔（秒）：
                    <input type="number" v-model.number="interval" min="0.1" max="8" step="0.1" />
                </label>
            </div>

            <button class="start-btn" @click="startGame">🌟 開始挑戰！</button>
        </div>

        <div v-if="mode === 'position' && targetPosition !== null" class="target-info">
            🧩 一道神祕的魔法將降臨...✨
            <br />
            請默默記下這些顏色的順序，挑戰馬上開始💫
        </div>

        <div v-if="currentColor" class="color-box" :style="{ backgroundColor: currentColor }"></div>

        <div v-if="options.length" class="options-group">
            <p v-if="mode === 'sequence'">哪一個是剛剛的正確順序？👇</p>
            <p v-if="mode === 'position'">哪一個是第 {{ targetPosition + 1 }} 個顏色？👇</p>
            <div v-for="(option, index) in options" :key="index" class="option-row">
                <button class="option-btn" :class="{
                    shake: isWrong && selectedIndex === index,
                    glow: isCorrect && selectedIndex === index
                }" @click="checkAnswer(index)">
                    <div class="option-colors" v-if="mode === 'sequence'">
                        <span v-for="(color, i) in option" :key="i" class="color-dot"
                            :style="{ backgroundColor: color }"></span>
                    </div>
                    <div v-else class="color-dot" :style="{ backgroundColor: option }"></div>
                </button>
            </div>
        </div>

        <p v-if="result" class="result">{{ result }}</p>
    </div>

    <!-- 說明彈跳視窗 -->
<transition name="fade-zoom">
  <div v-if="showInfo" class="info-modal" @click.self="showInfo = false">
    <div class="info-content">
      <h3>🧠 遊戲說明</h3>
      <p>這是一款訓練記憶力的小遊戲，可以選擇記住一串顏色的「順序」或「位置」。</p>
      <ul>
        <li><strong>記住整組順序：</strong>依照剛剛看到的顏色排列順序答題。</li>
        <li><strong>記住第幾個顏色：</strong>題目會問「第幾個顏色是什麼？」</li>
        <li>可自由選擇顏色風格、顏色數量與播放間隔。</li>
        <li>挑戰成功後會有閃亮閃亮的效果唷 ✨</li>
      </ul>
      <button class="close-btn" @click="showInfo = false">關閉</button>
    </div>
  </div>
</transition>

</template>

<script setup>
import { ref } from 'vue'
const selectedIndex = ref(null)
const isCorrect = ref(false)
const isWrong = ref(false)
const colorStyle = ref('soft')

const COLOR_STYLES = {
    soft: [
        '#FFD3B6', '#A2D5F2', '#FFF5B7', '#A8C8A0',
        '#C1B2D5', '#F28B82', '#FFA69E', '#6C7A89'
    ],
    vivid: [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
        '#FF00FF', '#00FFFF', '#FFA500', '#800080'
    ],
    candy: [ // 🍭 糖果爆炸配色
        '#FF69B4', '#00CED1', '#FFD700', '#FF4500',
        '#8A2BE2',' #7FFF00', '#00BFFF', '#FFB6C1'
    ]
}

const colorCount = ref(5)
const interval = ref(1.5)
const mode = ref('sequence') // 新增模式選擇
const targetPosition = ref(null)

const currentColor = ref('')
const sequence = ref([])
const options = ref([])
const result = ref('')
const correctIndex = ref(0)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const startGame = async () => {
    result.value = ''
    currentColor.value = ''
    sequence.value = []
    options.value = []
    targetPosition.value = null

    const selectedColors = COLOR_STYLES[colorStyle.value]

    for (let i = 0; i < colorCount.value; i++) {
        const color = selectedColors[Math.floor(Math.random() * selectedColors.length)]
        sequence.value.push(color)
    }

    if (mode.value === 'position') {
        targetPosition.value = Math.floor(Math.random() * colorCount.value)
    }

    for (const color of sequence.value) {
        currentColor.value = color
        await sleep(interval.value * 1000)
        currentColor.value = ''
        await sleep(200)
    }

    generateOptions()
}

const generateOptions = () => {
    if (mode.value === 'sequence') {
        const correct = [...sequence.value]
        let wrong1 = shuffle([...sequence.value])
        let wrong2 = shuffle([...sequence.value])

        const lastColor = correct[correct.length - 1]
        const fixLastColor = (arr) => { arr[arr.length - 1] = lastColor; return arr }

        while (JSON.stringify(wrong1) === JSON.stringify(correct)) wrong1 = shuffle([...sequence.value])
        fixLastColor(wrong1)

        while (JSON.stringify(wrong2) === JSON.stringify(correct) || JSON.stringify(wrong2) === JSON.stringify(wrong1)) {
            wrong2 = shuffle([...sequence.value])
        }
        fixLastColor(wrong2)

        // 確保三組都不重複
        let allOptions = [correct, wrong1, wrong2]
        while (
            new Set(allOptions.map(opt => JSON.stringify(opt))).size < 3
        ) {
            wrong1 = shuffle([...sequence.value])
            wrong2 = shuffle([...sequence.value])
            fixLastColor(wrong1)
            fixLastColor(wrong2)
            allOptions = [correct, wrong1, wrong2]
        }
        allOptions = allOptions.sort(() => Math.random() - 0.5)
        options.value = allOptions
        correctIndex.value = allOptions.findIndex(o => JSON.stringify(o) === JSON.stringify(correct))
    } else {
        const correctColor = sequence.value[targetPosition.value]
        const selectedColors = COLOR_STYLES[colorStyle.value]

        const wrongColors = selectedColors.filter(c => c !== correctColor)
        const randomOptions = [correctColor]
        while (randomOptions.length < 3) {
            const pick = wrongColors[Math.floor(Math.random() * wrongColors.length)]
            if (!randomOptions.includes(pick)) randomOptions.push(pick)
        }
        options.value = randomOptions.sort(() => Math.random() - 0.5)
        correctIndex.value = options.value.findIndex(c => c === correctColor)
    }
}

const shuffle = (arr) => {
    const newArr = [...arr]
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
}

const checkAnswer = (selected) => {
    selectedIndex.value = selected
    if (selected === correctIndex.value) {
        result.value = '✅ 答對了！你的魔法記憶力太強啦！'
        isCorrect.value = true
        isWrong.value = false
    } else {
        result.value = '❌ 答錯囉～再挑戰一次吧！'
        isCorrect.value = false
        isWrong.value = true
    }
    setTimeout(() => {
        isCorrect.value = false
        isWrong.value = false
    }, 1000)
}

const showInfo = ref(false)
</script>

<style scoped>
.color-game {
    text-align: center;
    padding: 20px;
    font-family: 'Comic Sans MS', 'Noto Sans TC', cursive;
    background: linear-gradient(135deg, #dff6ff, #e0f7fa, #f1faff);
    border-radius: 16px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
    min-height: 100vh;
}

.sub-title {
    margin-bottom: 20px;
    font-size: 1.1rem;
    color: #666;
}

.controls {
    margin-bottom: 25px;
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
    font-size: 1rem;
}

.control-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}

/* 可選：讓 label 預設不太擠在一起 */
.control-row label {
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 5px;
}

.controls input,
.controls select {
    padding: 5px 10px;
    border-radius: 8px;
    border: 2px solid #ddd;
    font-size: 1rem;
    margin-left: 5px;
}

.color-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.start-btn {
    background-color: #F6C1C1;
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.15);
}

.start-btn:hover {
    transform: scale(1.05);
    background-color: #f4a9a9;
}

.color-box {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    border-radius: 16px;
    border: 3px dashed #aaa;
}

.options-group {
    margin-top: 20px;
}

.option-row {
    margin: 10px 0;
}

.option-btn {
    background: #f8f8f8;
    border: 2px solid #ddd;
    border-radius: 12px;
    padding: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.option-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.option-colors {
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 4px;
}

.color-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #666;
    display: inline-block;
}

.target-info {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #444;
    font-weight: bold;
}

.result {
    margin-top: 20px;
    font-size: 1.2rem;
    font-weight: bold;
    color: #4e4e4e;
}

.info-btn {
    background-color: #fff2ac;
    border: none;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: background-color 0.2s;
}

.info-btn:hover {
    background-color: #ffe066;
}

.info-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.info-content {
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 400px;
    text-align: left;
    font-size: 1rem;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
}

.info-content ul {
    padding-left: 20px;
    margin-top: 10px;
}

.close-btn {
  display: block;
  margin: 20px auto 0;
  padding: 6px 16px;
  border: none;
  background: #f8bebe;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f28989;
  color: white;
}

.title-with-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

@keyframes shake {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-6px);
    }

    50% {
        transform: translateX(6px);
    }

    75% {
        transform: translateX(-6px);
    }

    100% {
        transform: translateX(0);
    }
}

@media (max-width: 600px) {
    .control-row {
        flex-direction: column;
        align-items: stretch;
    }
}

.shake {
    animation: shake 0.4s ease-in-out;
}

@keyframes glow {
    0% {
        box-shadow: 0 0 0px #fff;
    }

    50% {
        box-shadow: 0 0 20px #ffeeaa, 0 0 10px #ffd700;
    }

    100% {
        box-shadow: 0 0 0px #fff;
    }
}

.glow {
    animation: glow 1s ease-in-out;
}
</style>
