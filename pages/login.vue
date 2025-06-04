<!-- login.vue -->
<template>
    <div class="login-container">
      <h1>登入後台</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">電子郵件</label>
          <input id="email" type="email" v-model="email" required />
        </div>
  
        <div class="form-group">
          <label for="password">密碼</label>
          <input id="password" type="password" v-model="password" required />
        </div>
  
        <button type="submit">登入</button>
  
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
  
  const email = ref('')
  const password = ref('')
  const errorMessage = ref('')
  
  const router = useRouter()
  
  const login = async () => {
    const auth = getAuth()
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value)
      // 登入成功，跳轉到後台頁面
      router.push('/activityFormPage')
    } catch (error) {
      console.error('登入失敗:', error)
      errorMessage.value = '登入失敗，請檢查帳號或密碼！'
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 24px;
    border: 2px solid #eee;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #58c0b0;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 10px;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #3ca89c;
  }
  
  .error {
    color: red;
    margin-top: 10px;
  }
  </style>
  