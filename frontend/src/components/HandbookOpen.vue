<script setup>
defineProps({
  // Sidorna i boken, t.ex. handbookPages från data/handbook.js. Varje sida är { title, text }
  pages: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close']);
</script>
