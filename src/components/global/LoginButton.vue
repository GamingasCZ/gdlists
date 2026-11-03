<script setup lang="ts">
import router from '@/router';
import cookier from "cookier";

const state = () => {
  let chars: string[] = []
  for (let i = 0; i < 20; i++)
    chars.push(String.fromCharCode(65 + Math.floor(Math.random() * 25)))
  
  return chars.join('')
}

const goToDiscord = (isGoogle: boolean) => {
  let currRoute = router.currentRoute.value.fullPath
  let lState = state()
  cookier("state").set(lState)

  sessionStorage.setItem("loginRoute", currRoute)

  if (isGoogle)
    window.location.replace(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=951385406857-45v047a1p1vcbjl37h3t4hv324d5odop.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(import.meta.env.VITE_DC_RETURNURI+'/accounts.php')}&response_type=code&scope=openid%20profile&state=${lState}&access_type=offline`
    );
  else
    window.location.replace(
      `https://discord.com/api/oauth2/authorize?client_id=989511463360139264&state=${lState}&prompt=none&redirect_uri=${encodeURIComponent(
        import.meta.env.VITE_DC_RETURNURI + "/accounts.php"
        )}&response_type=code&scope=identify`
    );
}

</script>

<template>
  <div class="flex flex-col">
    <caption class="mb-1 leading-none opacity-40">Login via...</caption>
    <button
      class="flex gap-3 items-center p-2 text-sm text-white bg-black bg-opacity-50 rounded-t-md"
      @click="goToDiscord(false)"
    >
      <img src="../../images/socials/discord.svg" alt="" class="w-5" />{{
        'Discord'
      }}
    </button>
    <button
      class="flex gap-3 items-center p-2 text-sm text-white bg-black bg-opacity-50 rounded-b-md"
      @click="goToDiscord(true)"
    >
      <img src="../../images/socials/google.svg" alt="" class="w-5" />{{
        'Google'
      }}
    </button>
  </div>
</template>
