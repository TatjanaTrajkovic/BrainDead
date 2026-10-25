<script setup>
defineProps({
  // En sida i boken: { sections: [{ title:, subtitle:, text:, warning:, image: }] }. Alla fält är valfria
  page: { type: Object, required: true },
});
</script>

<template>
  <div class="page-content">
    <section v-for="(section, i) in page.sections" :key="i" :class="{ 'has-image': section.image }">
      <h2 v-if="section.title">{{ section.title }}</h2>
      <h3 v-if="section.subtitle">{{ section.subtitle }}</h3>
      <p v-if="section.text">{{ section.text }}</p>
      <p v-if="section.warning" class="warning">{{ section.warning }}</p>
      <img v-if="section.image" :src="section.image.src" :alt="section.image.alt" />
    </section>
  </div>
</template>

<style scoped>
/* margin mellan sections, men inte före det första */
section + section {
  margin-top: 1em;
}

h2 {
  font-size: max(1.35rem, 9cqi);
  text-transform: uppercase;
  margin: 0;
}

h3 {
  font-size: max(1.2rem, 8.5cqi);
  margin: 0;
}

p {
  font-size: max(1.05rem, 8cqi);
  line-height: 1.2;
  white-space: pre-line;
  margin: 0;
}

.warning {
  color: #750000;
  margin: 0;
}

/* container för img fyller hela .page */
.page-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* section med bild fyller höjden */
section.has-image {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

img {
  display: block;
  flex: 1;
  min-height: 5em;
  width: 100%;
  object-fit: contain;
  margin: 0.5em 0;
  opacity: 0.8;
}
</style>
