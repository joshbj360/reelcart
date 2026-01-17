<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col" @click.stop>
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold">Media Library</h2>
        <button @click="emit('close')" class="p-2 rounded-full hover:bg-gray-100">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>

      <div class="flex border-b">
        <button @click="activeTab = 'library'" :class="tabClass('library')">Select from Library</button>
        <button @click="activeTab = 'upload'" :class="tabClass('upload')">Upload New</button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="activeTab === 'library'" class="p-4">
          <div v-if="loading" class="text-center py-10">Loading media...</div>
          <div v-else-if="!mediaItems.length" class="text-center py-10 text-gray-500">Your library is empty.</div>
          <div v-else class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            <div 
              v-for="media in mediaItems" 
              :key="media.url"
              @click="toggleSelection(media)"
              class="relative aspect-square rounded-md overflow-hidden cursor-pointer border-2"
              :class="isSelected(media) ? 'border-pink-500' : 'border-transparent'"
            >
              <img :src="media.url" class="w-full h-full object-cover" />
              <div v-if="isSelected(media)" class="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <Icon name="mdi:check" size="16" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'upload'" class="p-8 flex flex-col items-center justify-center h-full bg-gray-50">
          <p class="text-gray-600 mb-4">Upload new images or videos for your products.</p>
          <UploadWidget v-if="userStore.sellerProfile" :seller-id="userStore.sellerProfile?.profileId" @upload-complete="handleUpload" />
        </div>
      </div>

      <div class="p-4 border-t bg-gray-50 flex justify-end">
        <button 
          @click="selectMedia" 
          :disabled="selectedMedia.length === 0"
          class="px-6 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-[#df4949] disabled:opacity-50"
        >
          Select {{ selectedMedia.length }} Item(s)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores';
import type { IMedia } from '~/models';
import UploadWidget from '@/components/upload/UploadWidget.vue';
import { notify } from "@kyvg/vue3-notification";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'select']);
const userStore = useUserStore();

const activeTab = ref('library');
const mediaItems = ref<IMedia[]>([]);
const selectedMedia = ref<IMedia[]>([]);
const loading = ref(true);

const fetchLibrary = async () => {
    loading.value = true;
    try {
        // This is where you would call your API to get the seller's media
        // const data = await $fetch(`/api/prisma/media/list-by-seller`);
        // mediaItems.value = data; 
        
        // For demo purposes, we'll use a placeholder
        mediaItems.value = [];
    } catch (error) {
        notify({ type: 'error', text: 'Could not load media library.' });
    } finally {
        loading.value = false;
    }
};

const handleUpload = (uploadedMedia: IMedia[]) => {
    // This is where you would call your API to save the media reference to your DB
    // await $fetch('/api/prisma/media/save', { method: 'POST', body: uploadedMedia[0] });
    
    // Add to the local list and switch tabs
    mediaItems.value.unshift(...uploadedMedia);
    notify({ type: 'success', text: 'Upload successful!' });
    activeTab.value = 'library';
};

const toggleSelection = (media: IMedia) => {
    const index = selectedMedia.value.findIndex(m => m.url === media.url);
    if (index > -1) {
        selectedMedia.value.splice(index, 1);
    } else {
        selectedMedia.value.push(media);
    }
};

const isSelected = (media: IMedia) => selectedMedia.value.some(m => m.url === media.url);

const selectMedia = () => {
    emit('select', [...selectedMedia.value]);
    selectedMedia.value = [];
    emit('close');
};

const tabClass = (tabName: string) => {
    return activeTab.value === tabName
        ? 'px-4 py-3 text-sm font-semibold text-brand-dark border-b-2 border-[#C42B78]'
        : 'px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800';
};

onMounted(fetchLibrary);
</script>