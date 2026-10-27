import { onBeforeUnmount, onMounted, ref } from 'vue';

// Scrollpilar för en textruta: pilarna visas bara när det finns mer text åt det hållet.
// scroller är en ref till elementet som scrollar. Används i ScenarioBox och kan återanvändas i handboken.
export function useScrollArrows(scroller) {
  const canScrollUp = ref(false);
  const canScrollDown = ref(false);

  function updateArrows() {
    const el = scroller.value;
    if (!el) {
      return;
    }
    canScrollUp.value = el.scrollTop > 0;
    // -1 för att scrollTop kan bli ett decimaltal som aldrig riktigt når botten
    canScrollDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
  }

  // Ett klick scrollar 80 % av rutans höjd, så att en rad från förra vyn syns kvar
  function scrollStep(direction) {
    const el = scroller.value;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      top: direction * el.clientHeight * 0.8,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }

  // Används när innehållet byts men elementet är detsamma, annars ligger scrollen kvar
  function scrollToTop() {
    scroller.value.scrollTop = 0;
    updateArrows();
  }

  // Rutan och texten kan ändra storlek (fönstret, typsnitt som laddas), då kan pilarna behöva visas eller döljas
  let observer = null;

  onMounted(() => {
    observer = new ResizeObserver(updateArrows);
    observer.observe(scroller.value);
    observer.observe(scroller.value.firstElementChild);
    updateArrows();
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return { canScrollUp, canScrollDown, updateArrows, scrollStep, scrollToTop };
}
