<!-- pages/signup.vue -->
<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
        <p class="text-center text-gray-600 mt-2">Create an account to get started</p>
  
        <form class="mt-6 space-y-4">
          <div>
            <label class="block text-gray-700">Email</label>
            <input type="email" class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-pink-300" placeholder="Enter your email">
          </div>
          <div>
            <label class="block text-gray-700">Password</label>
            <input type="password" class="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-pink-300" placeholder="Create a password">
          </div>
          <button class="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition">
            Sign Up
          </button>
        </form>
  
        <p class="text-center text-gray-600 mt-4">
          Already have an account?
          <NuxtLink to="/login" class="text-pink-500 hover:underline">Log in</NuxtLink>
        </p>
      </div>
    </div>
  </template>
  