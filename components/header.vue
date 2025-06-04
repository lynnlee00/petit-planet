<template>
    <header class="site-header">
      <NuxtLink to="/" class="logo-box">
        <img src="/images/logo/logo.png" alt="小手作星球 Petit" />
      </NuxtLink>
      <div class="slogan"> 星球魔法每週六上新｜手作週更 × 遊戲雙週更 </div>
    </header>
  </template>
  
  <style scoped>
  .site-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-bg-main);
    border-bottom: 1px dashed var(--color-border-dashed);
    padding: 16px 24px;
  }
  
  @media (max-width: 600px) {
  .slogan-box {
    display: none;
  }
}

  .logo-box img {
    height: 50px;
    transition: transform 0.2s ease;
  }
  
  .logo-box:hover img {
    transform: scale(1.05);
  }
  
  .slogan {
    font-family: 'Noto Serif TC', serif;
    font-size: 14px;
    color: var(--color-text-soft);
    margin-top: 4px;
    white-space: nowrap;
  }
  </style>
  