<script setup>
import { RouterView, RouterLink } from 'vue-router';
</script>

<template>
  <main>
    <header>
      <RouterLink to="/" aria-label="Till startsidan">
        <img src="./assets/images/logo.webp" alt="BrainDead" class="logo" />
      </RouterLink>
    </header>
    <RouterView />
  </main>
</template>
