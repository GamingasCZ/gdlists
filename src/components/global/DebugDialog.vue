<script setup lang="ts">
import axios from 'axios';
import Dialog from './Dialog.vue';
import { ref } from 'vue';


const from = ref()
const to = ref()
const post = ref()
const type = ref()

const users = ref([])
const posts = ref([])
axios.get(import.meta.env.VITE_API + "/debug.php", {params: {users: 1}}).then(res => {
    users.value = res.data
})
axios.get(import.meta.env.VITE_API + "/debug.php", {params: {posts: 1}}).then(res => {
    posts.value = res.data
})

const postNotif = (postType: number) => {
    axios.post(import.meta.env.VITE_API + "/debug.php", [from.value, to.value, Math.floor(post.value / 10), posts.value[post.value].id, type.value]).then(res => {
        
    })
}

</script>

<template>
    <Dialog :open="true" title="Debug">
        <h2 class="text-xl">notif</h2>
        <label for="d_from">from</label>
        <select v-model="from" id="d_from">
            <option v-for="user in users" :value="user?.discord_id">{{ user?.username }} - {{ user?.discord_id }}</option>
        </select>
        <label for="d_to">to</label>
        <select v-model="to" id="d_to">
            <option v-for="user in users" :value="user?.discord_id">{{ user?.username }} - {{ user?.discord_id }}</option>
        </select>
        <label for="d_post">post</label>
        <select v-model="post" id="d_post">
            <optgroup label="list">
                <option v-for="(post, ind) in posts.slice(0,10)" :value="ind">{{ post?.name }} - {{ post?.id }}</option>
            </optgroup>
            <optgroup label="review">
                <option v-for="(post, ind) in posts.slice(10)" :value="ind+10">{{ post?.name }} - {{ post?.id }}</option>
            </optgroup>
        </select>
        <select v-model="type" id="d_type">
            <option :value="0">comment</option>
            <option :value="1">rate</option>
            <option :value="2">other</option>
        </select>
        <button class="bg-lof-400" @click="postNotif">POST</button>
    </Dialog>
</template>