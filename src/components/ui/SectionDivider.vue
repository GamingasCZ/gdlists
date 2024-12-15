<script setup lang="ts">
defineProps<{ 
	text: string;
}>()
</script>

<template>
	<div class="flex gap-3 items-center my-3 opacity-90">
	    <hr class="w-6 h-0.5 bg-white rounded-full border-none opacity-30" />
	    <h2 class="min-w-max text-xl">{{ text }}</h2>
	    <hr class="w-full h-0.5 bg-white rounded-full border-none opacity-30" />
	  </div>
</template>
