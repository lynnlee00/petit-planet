<template>
  <div class="about-container">
    <div class="about-content">
      <h1 class="title">來自小手作星球魔法師的悄悄話</h1>

      <div class="about-body">
        <img class="mage-image" src="/images/about/magic-mama.png" alt="i人媽媽魔法師圖" />

        <div class="about-text">
          <p>嗨，我是 I人媽媽 <strong>Lynn</strong></p>
          <p>一位喜歡陪小孩玩、剛好也會寫一點點程式的在地媽媽</p>
          <p>雖然不是專職網頁設計師，但我腦子裡總有一顆轉不停的點子星球 ✨</p>
          <p>於是邊玩邊想，邊想邊轉，就這樣——創造出了 <strong>「小手作星球」</strong> 🌙🪐</p>
          <p>&nbsp;</p> <!-- 空一格 -->
          <p><strong>🪄 故事是這樣開始的...</strong></p>
          <p>某天滑手機看到超棒的手作活動，截圖想著：「改天要來玩看看！」</p>
          <p>然後呢？ 改天真的來了，但那張圖早就不見了（媽媽的相簿，根本時空黑洞 ）</p>
          <p>&nbsp;</p> <!-- 空一格 -->
          <p>所以，我決定蓋一個屬於我和孩子的小星球：</p>
          <p>把所有想玩、想記住、想和孩子一起完成的，通通變成可以實現的魔法小框框🪄</p>
          <p>每當我們喊出「今天要玩什麼～」的時候，馬上能派上用場✨</p>
          <p>&nbsp;</p> <!-- 空一格 -->
          <p><strong>🎁 使用說明很簡單：</strong></p>
          <p>🔧 不需要買一堆材料</p>
          <p>🖌 不需要美術天分</p>
          <p>📔 不需要照表操課</p>
          <p>只要你/妳願意陪孩子動手玩，這裡就是你們的魔法起點 💫</p>
          <p>&nbsp;</p> <!-- 空一格 -->
          <p>在育兒的宇宙裡，沒有「唯一正解」這回事</p>
          <p>這個網站，是我的魔法補給站，也是送給所有「陪玩大人」的一份溫柔驚喜</p>
          <p>小手一揮唸下咒語，魔法也許就會出現在你們家</p>
          <p><strong>💫 創造出屬於你們的親子回憶 ✨</strong></p>
          <p>&nbsp;</p> <!-- 空一格 -->
          <p>🌟 <strong> 隨手可得 ✕ 自由發揮 ✕ 一起完成 </strong> ✨</p>
          <p>歡迎登陸我們的星球，一起玩出更多生活的魔法吧🪐</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
</script>

<style scoped>
.about-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  font-size: 16px;
  line-height: 1.8;
}

.title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
}

.about-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.mage-image {
  width: 200px;
  flex-shrink: 0;
}

.about-text {
  text-align: left;
  padding: 0 8px;
  max-width: 600px;
}

.about-text p {
  margin-bottom: 12px;
}

/* 桌機版左右排版 */
@media (min-width: 768px) {
  .about-body {
    flex-direction: row;
    align-items: flex-start;
  }

  .mage-image {
    width: 240px;
    margin-right: 32px;
  }

  .about-text {
    padding: 0;
  }
}
</style>