<template>
  <div class="p-6 md:p-8 max-w-6xl mx-auto animate-pulse">
    <div class="bg-gray-200 rounded-xl p-6 mb-8 h-40"></div>
    
    <div class="h-12 bg-gray-200 rounded-md mb-8"></div>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="w-full h-64 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
</template>