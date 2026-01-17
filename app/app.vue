<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NuxtNotifications position="bottom right" :speed="500" />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = colorMode.preference || 'dark'

// ✅ That's it! All auth/store logic moved to plugins
</script>

<style>
/* Notification theme styles */
:root {
  --vn-bg-color: #262626;
  --vn-border-color: #404040;
  --vn-text-color: #f5f5f5;
  --vn-success-color: #22c55e;
  --vn-error-color: #ef4444;
  --vn-warn-color: #f97316;
  --vn-info-color: #3b82f6;
}
html:not(.dark) {
  --vn-bg-color: #ffffff;
  --vn-border-color: #e5e7eb;
  --vn-text-color: #171717;
}
</style>