<template>
    <!-- 
      THE FIX: This component is now fully theme-aware
      with dark: prefixes.
    -->
    <div class="animate-pulse">
        <!-- Cover Image -->
        <div class="h-48 bg-gray-200 dark:bg-neutral-800"></div>

        <div class="px-4 max-w-6xl mx-auto">
            <!-- Profile Header -->
            <div class="flex items-end gap-4 -mt-12 relative z-10">
                <div class="w-24 h-24 rounded-full bg-gray-300 dark:bg-neutral-700 border-4 border-white dark:border-neutral-900"></div>
                <div class="flex-1 pb-2 space-y-2">
                    <div class="h-7 w-48 bg-gray-300 dark:bg-neutral-700 rounded"></div>
                    <div class="h-4 w-32 bg-gray-200 dark:bg-neutral-600 rounded"></div>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="flex justify-around py-4 border-y border-gray-200 dark:border-neutral-800 my-4">
                <div class="space-y-1 text-center"><div class="h-5 w-8 bg-gray-300 dark:bg-neutral-700 rounded mx-auto"></div><div class="h-4 w-16 bg-gray-200 dark:bg-neutral-600 rounded"></div></div>
                <div class="space-y-1 text-center"><div class="h-5 w-8 bg-gray-300 dark:bg-neutral-700 rounded mx-auto"></div><div class="h-4 w-16 bg-gray-200 dark:bg-neutral-600 rounded"></div></div>
                <div class="space-y-1 text-center"><div class="h-5 w-8 bg-gray-300 dark:bg-neutral-700 rounded mx-auto"></div><div class="h-4 w-16 bg-gray-200 dark:bg-neutral-600 rounded"></div></div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 py-4">
                <div class="flex-1 h-10 bg-gray-200 dark:bg-neutral-800 rounded-lg"></div>
                <div class="flex-1 h-10 bg-gray-200 dark:bg-neutral-800 rounded-lg"></div>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-gray-200 dark:border-neutral-800">
                <div class="h-10 w-24 bg-gray-200 dark:bg-neutral-800 rounded-t-lg"></div>
            </div>
        </div>
    </div>
</template>