import { defineStore } from "pinia";
import  {type MediaModel } from "~~/prisma/generated/models";

export const useCoreStore = defineStore("core", {
  state: () => ({
    isLoading: false,
    isFirstMount: true,
    playVideoSound: false,
    
    cloudinaryUrls: [] as string[],
    mediaData: <MediaModel[]>[],
  })
});
