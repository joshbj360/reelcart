<template>
  <div class="w-full max-w-7xl mx-auto px-1 sm:px-0 animate-pulse">
    <!-- Skeleton for the grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
      <div v-for="i in 10" :key="i">
        <!-- Skeleton for a single product card -->
        <div class="bg-gray-200 rounded-lg">
          <div class="w-full aspect-square bg-gray-300 rounded-t-lg"></div>
          <div class="p-3 space-y-2">
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            <div class="h-5 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>