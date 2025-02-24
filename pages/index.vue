<template>
  <div class="books-container">
    <Book
      v-for="(book, index) in books"
      :key="index"
      :title="book.title"
      :color="book.color"
      :width="book.width"
      :height="book.height"
      @click="goToPage(book.title)"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const books = [
  { title: '星座', color: '#FFD700' },
  { title: '行星', color: '#FF4500' },
  { title: '宮位', color: '#1E90FF' },
  { title: '命盤', color: '#32CD32' },
];

const goToPage = (title) => {
  if (title === '星座') {
    router.push('/constellation'); // 跳轉到 constellation 頁面
  }
};
</script>

<style scoped>
.books-container {
  display: flex;
  flex-wrap: wrap;
  margin-left: 3vw;
  margin-top: 13vh;
}
</style>
