<template>
  <div class="books-container">
    <Book
      v-for="(book, index) in books"
      :key="index"
      :title="book.title"
      :color="book.color"
      :width="book.width"
      :height="book.height"
    />
  </div>
</template>

<script setup>
const books = [
  { title: '星座', color: '#FFD700' },
  { title: '行星', color: '#FF4500' },
  { title: '宮位', color: '#1E90FF' },
  { title: '命盤', color: '#32CD32' },
];
</script>



<style scoped>
.books-container {
  display: flex;
  flex-wrap: wrap;
  margin-left: 3vw;
  margin-top: 13vh;
}
</style>