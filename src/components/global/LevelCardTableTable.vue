<script setup lang="ts">
  defineProps<{
    active: boolean
  }>()
</script>

<template>
  <table v-if="active" class="max-w-[95vw] w-[70rem] text-center text-white overflow-auto mx-auto bg-gray-900 bg-opacity-80 rounded-md backdrop-blur-sm" >
    <th></th>
    <th>{{ $t('other.name') }}</th>
    <th>{{ $t('level.creator') }}</th>
    <th>ID</th>
    <th>{{ $t('reviews.rating') }}</th>
    <th></th>
    <slot />
  </table>

  <slot v-else />
</template>
