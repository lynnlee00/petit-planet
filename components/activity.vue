<template>
  <div class="card-container" @click="$emit('click')">
    <div class="content">
      <h3 class="title">{{ activity.title }}</h3>
      <div class="image-container">
        <img :src="activity.image" :alt="activity.title || '活動圖片'" class="image" loading="lazy" />
      </div>
      <p class="description">{{ activity.description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ activity: Object });
</script>

<style scoped>
.card-container {
  position: relative;
  width: 100%;
  max-width: 300px;
  height: 420px;
  background: url('/images/ItemBG.jpg') center/cover no-repeat;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.5s ease-in-out;
}

.card-container:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  padding: 16px;
  height: 100%;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
  margin-top: 12px;
}

.image-container {
  width: 150px;
  height: 150px;
  background-color: white;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease-in-out;
}

.image-container:hover .image {
  transform: scale(1.05);
}

.description {
  font-size: 0.875rem;
  color: #9114b0;
  line-height: 1.5;
  max-width: 90%;
  padding: 0 16px;
}
</style>
