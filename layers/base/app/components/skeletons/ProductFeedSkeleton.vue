<template>
    <div class="min-h-screen bg-black lg:bg-gray-100 animate-pulse">
        <!-- 
            This single structure adapts perfectly.
            - On mobile, it's a full-screen black background.
            - On desktop, it becomes a padded grid.
        -->
        <div class="relative lg:grid lg:grid-cols-3 lg:gap-8 lg:p-8 h-screen">
            <!-- Swipeable Feed Skeleton -->
            <div class="h-dvh w-full lg:col-span-2 lg:h-full lg:rounded-2xl bg-gray-800 lg:bg-gray-300">
                <!-- Mobile-only Header Skeleton -->
                <div class="absolute top-4 left-4 right-4 z-20 h-12 bg-gray-700/50 rounded-full lg:hidden"></div>
            </div>

            <!-- Desktop Sidebar Skeleton -->
            <div class="hidden lg:block h-full">
                <div class="h-full w-full bg-gray-200 rounded-2xl"></div>
            </div>
        </div>
    </div>
</template>
