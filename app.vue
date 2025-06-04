<template>
  <NuxtLayout>
    <!-- 你原本的背景與內容包在這裡也可以 -->
    <!-- <Bookshelf class="background" /> -->

    <div class="content">
      <NuxtPage />
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* 原本的樣式可以保留 */

#app {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: visible;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.content {
  position: relative;
  z-index: 1;
}
</style>
