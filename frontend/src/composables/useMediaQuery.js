import { ref, onMounted, onUnmounted } from 'vue';

export function useMediaQuery(query) {
  const mediaQueryList = window.matchMedia(query);
  const matches = ref(mediaQueryList.matches);

  const update = (e) => {
    matches.value = e.matches;
  };

  onMounted(() => mediaQueryList.addEventListener('change', update));
  onUnmounted(() => mediaQueryList.removeEventListener('change', update));

  return matches;
}
