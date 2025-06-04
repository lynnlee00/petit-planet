<template>
    <div class="layout">
        <header class="site-header">
            <div class="logo-box">
                <NuxtLink to="/" class="logo-wrapper">
                    <img src="/images/logo/logo.png" alt="小手作星球 Petit" />
                </NuxtLink>
            </div>

            <!-- 卡片類型切換 -->
            <div class="card-switch">
                <button :class="{ active: currentType === 'activity' }" @click="switchType('activity')">手作玩樂</button>
                <button :class="{ active: currentType === 'game' }" @click="switchType('game')">遊戲挑戰</button>
                <button :class="{ active: currentType === 'buy' }" @click="switchType('buy')">購入材料包</button>
                <button class="about-btn" @click="router.push('/about')">認識魔法師</button>
            </div>

            <div class="slogan-box">
                <div class="slogan-balloon">
                    🐰 魔法星球 每週六｜手作週更 × 遊戲雙週更
                </div>
            </div>
        </header>

        <main>
            <NuxtPage />
        </main>
    </div>
</template>

<script setup>
import { useState } from '#app'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentType = useState('currentType', () => 'activity')

const switchType = (type) => {
    if (type === 'buy') {
        router.push('/buy')
        return
    }

    currentType.value = type
    if (router.currentRoute.value.path !== '/') {
        router.push('/')
    }
}
</script>


<style scoped>
.logo-box {
    display: flex;
    align-items: center;
}

@media (max-width: 600px) {
  ::v-deep(.slogan-box) {
    display: none !important;
  }
}

.site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 24px 5px 24px;
    background-color: #fffaf6;
    border-bottom: 1px dashed #f3c5ce;
    background-image: radial-gradient(circle at 20% 30%, #ffe8f1 1px, transparent 1px),
        radial-gradient(circle at 80% 60%, #ffe8f1 1px, transparent 1px);
    background-size: 20px 20px;
}

.logo-wrapper img {
    max-height: 110px;
    height: auto;
    width: auto;
    vertical-align: middle;
}

.logo-wrapper:hover img {
    transform: scale(1.05);
}

.slogan-box {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    position: relative;
}

.slogan-balloon {
    background-color: #fff0f6;
    border-radius: 20px;
    padding: 10px 16px;
    color: #c48fb3;
    font-size: 16px;
    font-family: 'Comic Neue', 'ZCOOL KuaiLe', 'Noto Sans TC', sans-serif;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    border: 1px solid #f3c5ce;
}

.slogan-character {
    height: 60px;
    object-fit: contain;
}

/**淡黃系 */
.card-switch {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 10px 14px;
    background-color: #fffdf3;
    border: 3px dashed #f5e1a4;
    border-radius: 30px;
    box-shadow: 0 4px 10px rgba(250, 230, 170, 0.25);
}

.card-switch button {
    background: linear-gradient(to top, #fff7d4, #ffffff);
    border: 2px solid #f3db88;
    border-radius: 999px;
    padding: 10px 22px;
    font-weight: bold;
    color: #b6881b;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 0 #f3db88;
    /* font-family: 'Noto Serif TC', serif; */
    /* font-family: 'ZCOOL KuaiLe', 'Noto Sans TC', '微軟正黑體', sans-serif; */
    /* font-family: 'ZCOOL XiaoWei', 'Noto Sans TC', sans-serif; */
    font-family: 'Comic Neue', 'ZCOOL KuaiLe', 'Noto Sans TC', sans-serif;

}

.card-switch button:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 0 #e6c74f;
}

.card-switch button:active {
    transform: scale(0.95);
    box-shadow: 0 2px 0 #dab43d;
}

.card-switch .active {
    background: linear-gradient(to top, #ffe98e, #fff6cc);
    color: #8a5a00;
    border-color: #e0b833;
    box-shadow: 0 5px 0 #c89b1f;
}


.about-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #d9b4ff, #f7d0ff);
    border: none;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.about-btn:hover {
    background: linear-gradient(135deg, #c29eff, #f3aaff);
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}


/**藍色系  */
/* .card-switch {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 14px;
  background-color: #f0f9ff;
  border: 3px dashed #c3e4f9;
  border-radius: 30px;
  box-shadow: 0 4px 10px rgba(170, 210, 250, 0.25);
}

.card-switch button {
  background: linear-gradient(to top, #e0f3ff, #ffffff);
  border: 2px solid #b1d9f5;
  border-radius: 999px;
  padding: 10px 22px;
  font-weight: bold;
  color: #3a87c2;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 0 #b8e1fc;
  font-family: 'Noto Serif TC', serif;
}

.card-switch button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 0 #87cbf0;
}

.card-switch button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 0 #63b4e9;
}

.card-switch .active {
  background: linear-gradient(to top, #a8dbff, #d1edff);
  color: white;
  border-color: #5db6f2;
  box-shadow: 0 5px 0 #3d91c4;
} */


/**粉紅色系  */
/* .card-switch {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 14px;
  background-color: #fff8fc;
  border: 3px dashed #f9cfe5;
  border-radius: 30px;
  box-shadow: 0 4px 10px rgba(255, 180, 210, 0.2);
}

.card-switch button {
  background: linear-gradient(to top, #ffe2f0, #ffffff);
  border: 2px solid #f6b6cc;
  border-radius: 999px;
  padding: 10px 22px;
  font-weight: bold;
  color: #e06d9c;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 0 #f7b1cd;
}

.card-switch button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 0 #f289b7;
}

.card-switch button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 0 #e573a3;
}

.card-switch .active {
  background: linear-gradient(to top, #ffb3d6, #ffd0e7);
  color: white;
  border-color: #ec6fa5;
  box-shadow: 0 5px 0 #c1548c;
} */

@media (max-width: 600px) {
    .card-switch {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
    }

    .card-switch button {
        padding: 6px 18px;
        font-size: 14px;
    }
}
</style>