<script setup lang="ts">
import { onMounted, ref } from 'vue';


defineProps<{
    tabNames: string[]
}>()
const emit = defineEmits<{
    (e: "switchedTab", index: number)
}>()

const tabSelected = ref(0)
const switchTab = (ind: number) => {
    tabSelected.value = ind
    emit('switchedTab', ind)
}

</script>

<template>
    <section class="flex overflow-scroll w-full min-h-10">
        <button @click="switchTab(index)" :class="{'!bg-opacity-10': index == tabSelected}" class="relative p-2 text-lg text-center bg-white bg-opacity-5 hover:bg-opacity-20 grow" v-for="(tab, index) in tabNames">
            <span>{{ tab }}</span>
            <Transition name="fade">
                <div v-show="tabSelected == index" class="absolute right-0 bottom-0 left-0 h-1 bg-lof-400">
                    <div class="absolute bottom-0 w-full h-10 bg-gradient-to-t to-transparent opacity-30 from-lof-400"></div>
                </div>
            </Transition>
        </button>
    </section>
</template>