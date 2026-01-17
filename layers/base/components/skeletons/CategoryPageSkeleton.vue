<template>
  <div class="animate-pulse">
    <div class="pt-16 md:pt-20">
      <!-- Skeleton for Category Header -->
      <div class="bg-gray-200 rounded-xl shadow-sm p-6 mb-8 h-28 max-w-6xl mx-auto"></div>

      <!-- Skeleton for Product Grid -->
      <div class="w-full max-w-7xl mx-auto px-1 sm:px-0">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          <div v-for="i in 10" :key="i">
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
    </div>
  </div>
</template>