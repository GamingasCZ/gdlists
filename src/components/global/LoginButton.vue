// TODO
<script setup lang="ts">
const goToDiscord = () =>
  window.location.replace(
    `https://discord.com/api/oauth2/authorize?client_id=989511463360139264&redirect_uri=${encodeURIComponent(
      import.meta.env.VITE_API + "/php/accounts.php"
    )}&response_type=code&scope=identify`
  );
</script>

<template>
  <button
    class="button flex items-center gap-3 rounded-full bg-black bg-opacity-50 p-2 text-sm text-white"
    @click="goToDiscord"
  >
    <img src="../../images/discord.svg" alt="" class="w-6" />{{
      $t("homepage.logIn")
    }}
  </button>
</template>
