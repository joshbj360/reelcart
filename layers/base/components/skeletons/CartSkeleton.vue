<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div class="h-10 w-1/3 bg-gray-300 dark:bg-neutral-700 rounded-md mb-8"></div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div class="lg:col-span-2 space-y-6">
        <!-- Cart Items Skeleton -->
        <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-neutral-800">
          <div class="h-6 w-1/4 bg-gray-300 dark:bg-neutral-700 rounded-md mb-4"></div>
          <div class="space-y-4 divide-y divide-gray-200 dark:divide-neutral-800">
            <div v-for="i in 2" :key="i" class="flex items-center gap-4 pt-4">
              <div class="w-24 h-24 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
              <div class="flex-1 space-y-2">
                <div class="h-5 w-3/4 bg-gray-300 dark:bg-neutral-700 rounded"></div>
                <div class="h-4 w-1/4 bg-gray-200 dark:bg-neutral-700 rounded"></div>
              </div>
              <div class="h-8 w-20 bg-gray-200 dark:bg-neutral-800 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Order Summary Skeleton -->
      <div class="h-64 bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-neutral-800">
      </div>
    </div>
  </div>
</template>