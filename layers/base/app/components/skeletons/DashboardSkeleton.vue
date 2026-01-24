<template>
  <div class="min-h-screen bg-neutral-900 animate-pulse">
    <!-- Header Skeleton -->
    <div class="bg-neutral-950 shadow-sm border-b border-neutral-800">
      <div class="container mx-auto px-4 py-3 h-16"></div>
    </div>

    <main class="container mx-auto px-4 py-6">
      <!-- Quick Stats Skeleton -->
      <div class="flex space-x-4 mb-6 overflow-x-auto no-scrollbar pb-4">
        <div class="h-28 w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 shrink-0 bg-neutral-800 rounded-lg"></div>
        <div class="h-28 w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 shrink-0 bg-neutral-800 rounded-lg"></div>
        <div class="h-28 w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 shrink-0 bg-neutral-800 rounded-lg"></div>
        <div class="h-28 w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 shrink-0 bg-neutral-800 rounded-lg"></div>
      </div>

      <!-- Main Content Skeleton -->
      <div class="bg-neutral-950 rounded-lg h-96 border border-neutral-800"></div>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

