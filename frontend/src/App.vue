<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <!-- Sidor med meta.fullPage (adminsidan) har egen layout, utan spelets logga och ram -->
  <RouterView v-if="route.meta.fullPage" />
  <main v-else>
    <header>
      <RouterLink to="/" aria-label="Till startsidan">
        <img src="./assets/images/logo.webp" alt="BrainDead" class="logo" />
      </RouterLink>
    </header>
    <RouterView />
  </main>
</template>
