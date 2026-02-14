<template>
    <Teleport to="body">
        <Transition name="modal">
            <div 
                v-if="isOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                @click.self="handleClose"
            >
                <div class="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                        <button 
                            @click="handleClose"
                            class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                        >
                            <Icon name="mdi:close" size="24" class="text-gray-900 dark:text-neutral-100" />
                        </button>
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                            Edit Profile
                        </h2>
                        <button 
                            @click="saveChanges"
                            :disabled="isSaving"
                            class="px-4 py-2 bg-brand text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d81b36] transition-colors"
                        >
                            {{ isSaving ? 'Saving...' : 'Save' }}
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
                        <!-- Avatar -->
                        <div class="flex items-center gap-6">
                            <img 
                                :src="formData.avatar || `https://avatar.iran.liara.run/public/boy?username=${profile.username}`"
                                class="w-24 h-24 rounded-full object-cover"
                                alt="Profile avatar"
                            />
                            <div>
                                <button 
                                    @click="triggerAvatarUpload"
                                    class="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    Change Photo
                                </button>
                                <input 
                                    ref="avatarInput"
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="handleAvatarChange"
                                />
                            </div>
                        </div>

                        <!-- Username (Read-only) -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                                Username
                            </label>
                            <input 
                                :value="profile.username"
                                readonly
                                class="w-full px-4 py-2 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-500 dark:text-neutral-400 cursor-not-allowed"
                            />
                        </div>

                        <!-- Bio -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                v-model="formData.bio"
                                placeholder="Tell us about yourself..."
                                rows="4"
                                maxlength="150"
                                class="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                            ></textarea>
                            <p class="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                                {{ formData.bio?.length || 0 }}/150
                            </p>
                        </div>

                        <!-- Website -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                                Website
                            </label>
                            <input 
                                v-model="formData.website"
                                type="url"
                                placeholder="https://example.com"
                                class="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>

                        <!-- Location -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                                Location
                            </label>
                            <input 
                                v-model="formData.location"
                                type="text"
                                placeholder="New York, USA"
                                class="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { IProfile } from '~~/layers/profile/app/types/profile.types'
import { useProfile } from '~~/layers/profile/app/composables/useProfile'

const props = defineProps<{
    profile: IProfile | Partial<IProfile>
}>()


const emit = defineEmits(['close', 'updated'])

const { updateMyProfile } = useProfile()

const isOpen = ref(true)
const isSaving = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const formData = reactive({
    avatar: props.profile.avatar,
    bio: props.profile.bio || '',
    website: props.profile.profileUrl || '',
    location: props.profile.stateOfResidence || ''
})

const triggerAvatarUpload = () => {
    avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
        // TODO: Upload avatar to storage
        // For now, create local preview
        const reader = new FileReader()
        reader.onload = (e) => {
            formData.avatar = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const saveChanges = async () => {
    isSaving.value = true
    
    try {
        await updateMyProfile({
            bio: formData.bio,
            website: formData.website,
            location: formData.location,
            avatar: formData.avatar
        })
        
        emit('updated')
    } catch (error) {
        console.error('Failed to update profile:', error)
        alert('Failed to update profile. Please try again.')
    } finally {
        isSaving.value = false
    }
}

const handleClose = () => {
    if (isSaving.value) return
    
    // Check if there are unsaved changes
    const hasChanges = 
        formData.bio !== (props.profile.bio || '') ||
        formData.website !== (props.profile.profileUrl || '') ||
        formData.location !== (props.profile.stateOfResidence || '') ||
        formData.avatar !== props.profile.avatar
    
    if (hasChanges) {
        if (confirm('Discard changes?')) {
            emit('close')
        }
    } else {
        emit('close')
    }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
    transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
    transform: scale(0.9);
}
</style>