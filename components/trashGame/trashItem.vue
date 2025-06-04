<!-- trash-item -->
<template>
    <div
      class="trash-item"
      draggable="true"
      @dragstart="onDragStart"
    >
      <img :src="item.image" :alt="item.name" class="trash-image" />
    </div>
  </template>
  
  <script setup>
  defineProps({
    item: {
      type: Object,
      required: true
    }
  });
  
  function onDragStart(event) {
    event.dataTransfer.setData('text/plain', item.id);
  }
  </script>
  
  <style scoped>
.trash-item {
  width: 90px;
  height: 90px;
  cursor: grab;
  border: 2px dashed #add8e6; /* ✨新增：邊框讓物品更像卡片 */
  border-radius: 12px;        /* ✨新增：圓角 */
  background-color: #fdfdff;  /* ✨新增：柔和背景 */
  transition: transform 0.2s ease;
}

.trash-item:active {
  transform: scale(1.05);     /* ✨拖曳時微放大 */
}

.trash-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

  </style>
  