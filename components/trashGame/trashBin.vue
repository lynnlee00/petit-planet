<!-- trash-bin -->
<template>
    <div
      class="trash-bin"
      @dragover.prevent
      @drop="onDrop"
    >
      <img :src="binImage" class="bin-image" />
      <p class="bin-label">{{ category }}</p>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    category: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['dropItem']);
  
  function onDrop(event) {
    const itemId = event.dataTransfer.getData('text/plain');
    emit('dropItem', {
      itemId,
      targetCategory: props.category
    });
  }
  
  const binImage = computed(() => {
    // 你可依照類別放入不同圖示
    return `/images/bins/${props.category}.png`;
  });
  </script>
  
  <style scoped>
 .trash-bin {
  width: 100px;
  height: 130px;
  background-color: #fffbe6;   /* ✨淡黃柔和底色 */
  border: 2px solid #ddd;      /* ✨淡灰邊框 */
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 8px;
  transition: background-color 0.3s ease;
}

.trash-bin:hover {
  background-color: #e6f7ff;   /* ✨滑入時變成淡藍色 */
}

.bin-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
}

.bin-label {
  font-size: 16px;
  font-weight: bold;
  color: #5a5a5a;
  margin-top: 4px;
}
  </style>
  