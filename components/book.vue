<template>
    <div class="cube">
      <div class="side front" :style="{ backgroundColor: color}"><span class="title">{{ title }}</span></div>
      <div class="side back" :style="{ backgroundColor: color}">6</div>
      <div class="side right" :style="{ backgroundColor: color}">4</div>
      <div class="side left" :style="{ backgroundColor: color}">3</div>
      <div class="side top" :style="{ backgroundColor: color}">5</div>
      <div class="side bottom" :style="{ backgroundColor: color}">2</div>
    </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
    default: 'Untitled Book',
  },
  color: {
    type: String,
    required: true,
    default: '#FFD700', // 默认金色
  }
});
</script>

<style scoped>
.title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  text-align: center;
  height: 100%;
  font-size: 48px;
}

.cube {
  font-size: 20px;
  margin: 20px 3vw;
  transform-style: preserve-3d;
  transform: rotateX(0deg) rotateY(-15deg);
  perspective: 800px;
}

.side {
  position: absolute;
  width: 5vw;
  height: 14vw;
  border: 2px solid rgb(236, 240, 163);
  text-align: center;
  line-height: 32px;
  border-radius: 5px;
}

.front {transform: translateZ(7vw);}
.top {transform: rotateX(90deg) translateZ(7vw);}
.right { height: 14vw; width:14vw; transform: rotateY(90deg) translateZ(-2vw);}
.left { height: 14vw; width:14vw; transform: rotateY(-90deg) translateZ(7vw);}
.bottom {transform: rotateX(-90deg) translateZ(7vw);}
.back {transform: rotateY(-180deg) translateZ(7vw);}
</style>
