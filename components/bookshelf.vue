<template>
  <div class="bookshelf-out">
    <div class="bookshelf-in">
      <div class="stereoscopic-1"></div>
      <div class="stereoscopic-2"></div>
      <div class="stereoscopic-3"></div>
      <div class="stereoscopic-4"></div>
      <div class="bookshelf-in2"></div>
    </div>
    <div class="bookshelf-in">
      <div class="stereoscopic-1"></div>
      <div class="stereoscopic-2"></div>
      <div class="stereoscopic-3"></div>
      <div class="stereoscopic-4"></div>
      <div class="bookshelf-in2"></div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.bookshelf-out {
  padding-top: 3vh;
  box-sizing: border-box;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrusB_vm43DxplQc9IgLsP-MuOkvS3coYdKw&s);
  background-size: 540px 270px;
  box-shadow: inset 0px 10px 30px rgba(0, 0, 0, 0.5); /* 增加內陰影 */
  perspective: 1500px; /* 加強透視效果 */
}

.bookshelf-in {
  height: 42.5vh;
  width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  overflow: hidden;
  position: relative;
  background-image: radial-gradient( rgba(70, 39, 6, 0.6) 30%,rgba(233, 230, 229, 1) 80%);
  background-size: contain;
  border: 10px solid rgba(233, 230, 229, 0.8);
  border-radius: 10px;
  box-shadow: inset 0px 4px 20px rgba(0, 0, 0, 0.4); /* 增加內陰影 */
}


.bookshelf-in2 {
  height: 32vh;
  width: 80vw;
  background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxI_Z8yhy0jlNUumjZ1Q8F71Lb_1VOXcZ3tA&s);
  background-size: contain;
  filter: brightness(0.7);
}

.stereoscopic-1 {
  top: 0;
  transform-origin: left;
  transform: rotate(23deg) perspective(500px) rotateX(20deg); /* 增加深度 */
  left: 0;
}

.stereoscopic-2 {
  top: 0;
  transform-origin: right;
  transform: rotate(337deg) perspective(500px) rotateX(20deg); /* 增加深度 */
  right: 0;
}

.stereoscopic-3 {
  bottom: 0;
  transform-origin: left;
  transform: rotate(337deg) perspective(500px) rotateX(20deg); /* 增加深度 */
  left: 0;
}

.stereoscopic-4 {
  bottom: 0;
  transform-origin: right;
  transform: rotate(23deg) perspective(500px) rotateX(20deg); /* 增加深度 */
  right: 0;
}

.stereoscopic-1, .stereoscopic-2, .stereoscopic-3, .stereoscopic-4 {
  position: absolute;
  width: 8.3vw;
  border-top: 3px solid rgba(210, 180, 140, 0.7);
  filter: brightness(0.9);
}

</style>