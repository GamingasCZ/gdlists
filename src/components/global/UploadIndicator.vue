<script setup lang="ts">
defineProps<{
    removing: boolean
    visible: boolean
}>()
</script>

<template>
    <Transition name="fade">
        <div v-show="visible"
            class="absolute bottom-0 left-0 right-0 z-10 h-24 bg-opacity-40 bg-gradient-to-t from-[#0005] to-transparent">
            <div class="absolute bottom-0 w-full text-3xl text-center">
                <h2 class="opacity-60">{{ removing ? $t('other.removing') : $t('other.uploading') }}...</h2>
                <div :class="{ 'invert': removing }"
                    class="relative mt-3 h-2 overflow-clip rounded-b-md border-none bg-lof-400">
                    <div id="barAnim" class="absolute w-32 h-full bg-white blur-sm"></div>
                </div>
            </div>
        </div>
    </Transition>
</template>
