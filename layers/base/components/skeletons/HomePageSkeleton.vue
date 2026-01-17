<template>
    <div class="min-h-screen bg-gray-100 animate-pulse">
        <!-- Header Skeleton -->
        <div class="h-14 bg-white shadow-sm"></div>

        <div class="flex flex-1 overflow-hidden">
          

            <!-- Main Feed Skeleton -->
            <div class="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                <div class="h-32 bg-gray-200 rounded-lg"></div>
                <div class="h-56 bg-gray-200 rounded-xl"></div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div v-for="i in 6" :key="i" class="h-72 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

        </div>
    </div>
</template>
