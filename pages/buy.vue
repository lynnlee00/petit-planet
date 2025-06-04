<template>
    <div class="coming-soon-page">
      <div class="content-box">
        <h2>🛍 Coming Soon...</h2>
        <p>材料包即將上架，敬請期待！</p>
        <!-- <img src="/images/coming-soon.png" alt="coming soon" /> -->
      </div>
    </div>
  </template>
  
  <script setup>
  // 無需特別邏輯
  </script>
  
  <style scoped>
  .coming-soon-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    background-color: #fffaf3;
  }
  
  .content-box {
    text-align: center;
    background: #fff9e2;
    padding: 40px 24px;
    border-radius: 24px;
    box-shadow: 0 4px 10px rgba(240, 190, 100, 0.2);
    border: 2px dashed #f3d68c;
  }
  
  h2 {
    font-size: 28px;
    margin-bottom: 12px;
    color: #d6a419;
  }
  
  p {
    font-size: 18px;
    color: #a8800c;
    margin-bottom: 20px;
  }
  
  img {
    max-width: 180px;
    margin-top: 10px;
  }
  </style>
  