<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <!-- Left Column: Checkout Steps -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-neutral-800">
          <div class="h-6 w-1/2 bg-gray-300 dark:bg-neutral-700 rounded-md"></div>
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
            <div class="h-4 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div class="h-4 w-1/2 bg-gray-200 dark:bg-neutral-700 rounded mt-2"></div>
          </div>
        </div>
        <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-neutral-800">
          <div class="h-6 w-1/3 bg-gray-300 dark:bg-neutral-700 rounded-md"></div>
        </div>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="sticky top-24">
        <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-neutral-800">
          <div class="h-6 w-1/2 bg-gray-300 dark:bg-neutral-700 rounded-md mb-4"></div>
          <div class="h-24 bg-gray-100 dark:bg-neutral-800 rounded-md mb-4"></div>
          <div class="h-12 w-full bg-gray-300 dark:bg-neutral-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
</template>