<template>
  <div id="app">
    <Bookshelf class="background" />
    <div class="content">
      <NuxtPage />
    </div>
  </div>
</template>

<style scoped>
#app {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 背景書架樣式 */
.background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1; /* 放在最底層 */
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 分頁內容 */
.content {
  position: relative;
  z-index: 1; /* 確保內容顯示在書架之上 */
}
</style>