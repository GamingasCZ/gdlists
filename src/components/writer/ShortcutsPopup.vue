<script setup lang="ts">
import { keyShortcuts } from '@/writers/shortcuts';
import { Key } from '@/writers/Writer';


const parseKey = (key: [Key, string]) => {
    let keys: (string | -1)[] = []
    if (key[0] & Key.Ctrl)
        keys.push("Ctrl", -1)
    if (key[0] & Key.Alt)
        keys.push("Alt", -1)
    if (key[0] & Key.Shift)
        keys.push("Shift", -1)
    return [...keys, key[1]]
}

const overrides = {
    'Digit1': '1',
    'Digit2': '2',
    'Digit3': '3',
    'ArrowUp': '▲',
    'ArrowDown': '▼'
}

const doOverride = (key: string) => {
    if (overrides[key])
        return overrides[key]
    return key
}

</script>

<template>
    <section class="grid bg-[url(@/images/fade.webp)] bg-repeat-x grid-cols-3 gap-3 max-h-[35rem] overflow-auto p-3">
        <div class="flex flex-col gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md" v-for="shortcut in keyShortcuts">
            <img :src="shortcut[3]" class="w-8" alt="">
            <span>{{ shortcut[2] }}</span>
            <div class="flex justify-center">
                
                <template v-for="(key, i) in parseKey(shortcut[0])">
                    <div>
                        <span v-if="key == -1">+</span>
                        <kbd v-else class="!min-w-max p-1">
                            {{ doOverride(key) }}
                        </kbd>
                    </div>
                </template>
            </div>
        </div>
    </section>
</template>
