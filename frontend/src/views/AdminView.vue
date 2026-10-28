<script setup>
import { useAuth } from '@/composables/useAuth';

const { player } = useAuth();
</script>

<template>
  <!-- Tillfällig sida så att routen och guarden i #176 går att testa. Byggs ut i #182 -->
  <section class="content-card">
    <h1>Adminsidan</h1>
    <p>Inloggad som {{ player?.display_name }}</p>
  </section>
</template>
