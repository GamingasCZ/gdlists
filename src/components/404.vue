<template>
    <section class="flex absolute left-1/2 flex-col gap-5 items-center mt-16 text-white -translate-x-1/2">
        <img src="@/images/listEmpty.svg" alt="404" class="w-64 opacity-40">
        <p class="text-2xl font-bold opacity-40">{{ $t('other.404') }}</p>
        <div class="flex gap-3 max-sm:flex-col">
            <RouterLink to="/random">
            <button class="p-2 w-full rounded-md bg-greenGradient button"><img src="@/images/dice.svg" class="inline mr-3 w-8"
                alt="">{{ $t('listViewer.goToRandom') }}</button>
            </RouterLink>
            <RouterLink to="/">
            <button class="p-2 w-full text-left rounded-md bg-greenGradient button"><img src="@/images/browseMobHeader.svg"
                class="inline mr-3 w-8" alt="">{{ $t('listViewer.goHome') }}</button>
            </RouterLink>
      </div>
    </section>
</template>