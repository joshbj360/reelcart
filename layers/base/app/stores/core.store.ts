import { defineStore } from "pinia";
import type { IMedia } from "~/models";

export const useCoreStore = defineStore("core", {
  state: () => ({
    isLoading: false,
    isFirstMount: true,
    playVideoSound: false,
    
    cloudinaryUrls: [] as string[],
    mediaData: <IMedia[]>[],
  })
});
