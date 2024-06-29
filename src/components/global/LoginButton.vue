// TODO
<script setup lang="ts">
import router from '@/router';

const goToDiscord = () => {
  let currRoute = router.currentRoute.value.fullPath
  sessionStorage.setItem("loginRoute", currRoute)

  window.location.replace(
    `https://discord.com/api/oauth2/authorize?client_id=989511463360139264&redirect_uri=${encodeURIComponent(
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
    <img src="../../images/discord.svg" alt="" class="w-6" />{{
      $t("homepage.logIn")
    }}
  </button>
</template>
