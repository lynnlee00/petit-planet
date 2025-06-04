<!-- penguinFeedback -->
<template>
    <div class="penguin-feedback" :class="animationClass">
      <img :src="penguinImage" class="penguin-image" />
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    status: {
      type: String,
      default: 'neutral'
    }
  });
  
  const penguinImage = computed(() => {
    switch (props.status) {
      case 'correct':
        return '/images/penguin-happy.png';
      case 'wrong':
        return '/images/penguin-sad.png';
      default:
        return '/images/penguin-neutral.png';
    }
  });
  
  const animationClass = computed(() => {
    return {
      'animate-correct': props.status === 'correct',
      'animate-wrong': props.status === 'wrong'
    };
  });
  </script>
  
  <style scoped>
  .penguin-feedback {
  height: 120px;
  margin-top: 12px;
  transition: transform 0.4s ease;
}

.penguin-image {
  height: 100%;
  object-fit: contain;
}

/* ✅ 正確動畫：跳一下 */
.animate-correct {
  animation: pop-scale 0.4s ease;
}

/* ❌ 錯誤動畫：左右搖晃 */
.animate-wrong {
  animation: wobble 0.4s ease;
}

@keyframes pop-scale {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes wobble {
  0% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-8px); }
  100% { transform: translateX(0); }
} 
  </style>