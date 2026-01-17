 <template>
    <!-- Left Sidebar Skeleton -->
            <div class="hidden md:block w-72 bg-white p-4 h-[calc(100vh-56px)] border-r space-y-4">
                <div class="h-6 w-1/3 bg-gray-300 rounded"></div>
                <div v-for="i in 4" :key="i" class="flex items-center space-x-3 p-2">
                    <div class="w-8 h-8 rounded-full bg-gray-300"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-4 w-3/4 bg-gray-200 rounded"></div>
                        <div class="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
 </template>
 