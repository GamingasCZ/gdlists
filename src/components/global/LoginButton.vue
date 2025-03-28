<script setup lang="ts">
import router from '@/router';
import cookier from "cookier";

const state = () => {
  let chars: string[] = []
  for (let i = 0; i < 20; i++)
    chars.push(String.fromCharCode(65 + Math.floor(Math.random() * 25)))
  
  return chars.join('')
}

const goToDiscord = () => {
  let currRoute = router.currentRoute.value.fullPath
  let lState = state()
  cookier("state").set(lState)

  sessionStorage.setItem("loginRoute", currRoute)

  window.location.replace(
    `https://discord.com/api/oauth2/authorize?client_id=989511463360139264&state=${lState}&prompt=none&redirect_uri=${encodeURIComponent(
      import.meta.env.VITE_DC_RETURNURI + "/accounts.php"
      )}&response_type=code&scope=identify`
  );
}

</script>

<template>
  <button
    class="flex gap-3 items-center p-2 text-sm text-white bg-black bg-opacity-50 rounded-md button"
    @click="goToDiscord"
  >
    <img src="../../images/socials/discord.svg" alt="" class="w-6" />{{
      $t("homepage.logIn")
    }}
  </button>
</template>
