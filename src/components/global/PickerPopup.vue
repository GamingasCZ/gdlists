<script setup lang="ts">
import { onUpdated } from "vue";

const emit = defineEmits(["selectOption"]);

const highlightFirstElement = () => {
  document.querySelector(".pickerBubble")!.focus()
}

const search = defineModel()

onUpdated(() => {
  document.getElementById("pickerInput")?.focus()
})

</script>

<template>
      <form action="." class="flex w-full" @submit.prevent="highlightFirstElement">
        <input
          type="text"
          :placeholder="$t('other.search')+'...'"
          class="px-2 py-1 mx-2 mt-1 bg-white bg-opacity-10 rounded-md grow"
          id="pickerInput"
          v-model="search"
        />
      </form>
      <main
        class="mt-2 flex-grow-[1] overflow-y-auto overflow-x-clip p-2 bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem]"
      >
        <div class="flex flex-col gap-2">

          
          <div
            class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30"
            v-if="$slots.error"
            >
            <img src="@/images/close.svg" class="w-36" />
            <slot name="error" />
          </div>

          <slot />
        </div>
      </main>
</template>
