<script setup lang="ts">
import Option from '../ui/Option.vue';



</script>

<template>
    <section class="flex flex-col p-4">
        <div class="p-4 text-center rounded-xl border-4 border-white border-opacity-20 border-dashed">
            <img src="" alt="">
            <p class="text-2xl">Přetáhni nebo vyber novou fotku</p>
            <div class="grid grid-cols-2 gap-4">
                <button class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md">
                    <img src="@/images/image.svg" class="w-6" alt="">
                    Vybrat z galerie
                </button>
                <button class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md">
                    <img src="@/images/discord.svg" class="w-6" alt="">
                    Použít z Discordu
                </button>
            </div>
        </div>
        <Option :name="$t('settingsMenu.cutout')" control="dropdown" :control-options="[]" />
    </section>
</template>