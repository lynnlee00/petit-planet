<template>
    <div class="card" :style="cardStyle" @click="$emit('click')">
      <h3 class="title">{{ item.title }}</h3>
  
      <div class="image-box">
        <img v-if="item.image" :src="item.image" alt="圖片" class="cover" />
        <div v-else class="fallback-text">NO IMAGE</div>
      </div>
  
      <div class="info">
        <p>{{ type === 'activity' ? item.description : '▶ 點我玩遊戲' }}</p>
      </div>
    </div>
  </template>

<script setup>
import { computed } from 'vue';

const { item, type } = defineProps({
  item: Object,
  type: {
    type: String,
    default: 'activity'
  }
});

defineEmits(['click']);

const cardStyle = computed(() => {
  return type === 'game'
    ? {
        backgroundImage: "url('/images/ItemBG2.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        backgroundImage: "url('/images/ItemBG.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
});
</script>

<style scoped>
.card {
  width: 100%;
  max-width: 260px;
  height: 400px;
  margin: 0 auto;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.card:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.image-box {
  /* width: 180px; */
  height: 180px;
  border-radius: 12px;
  /* background-color: #f3f3f3; */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-box img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.cover {
  width: auto;
  height: 100%;
  object-fit: contain;
  margin: 0 auto;
  display: block;
}

.image-box:hover .cover {
  transform: scale(1.05);
}

.fallback-text {
  color: #bbb;
  font-size: 14px;
}

.info {
  margin-top: 12px;
}

.info p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  padding: 0 6px;
}

</style>