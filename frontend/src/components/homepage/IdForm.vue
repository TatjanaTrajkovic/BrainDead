<script setup>
import { computed, ref, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { USERNAME_MAX_LENGTH, validateUsername } from '@/utils/validateUsername';
import { PASSWORD_MAX_LENGTH, validatePassword } from '@/utils/validatePassword';

// Formuläret på ID-kortets baksida. LoginCard vänder kortet, det här sköter bara formuläret
const props = defineProps({
  // 'signup' = NY IDENTITET (registrera), 'login' = IDENTIFIERA (logga in)
  mode: { type: String, default: 'signup' },
});

const emit = defineEmits(['done', 'cancel']);

const { signup, login } = useAuth();

const isSignup = computed(() => props.mode === 'signup');

const username = ref('');
const password = ref('');
// Felet från backend, t.ex. "Användarnamnet är upptaget" eller "Fel användarnamn eller lösenord"
const serverError = ref('');
const submitting = ref(false);

// Variabelnamnet matchar ref="usernameInput", så LoginCard kan sätta fokus när kortet vänts
const usernameInput = ref(null);

// Reglerna gäller bara nya namn. Felen visas direkt när spelaren skriver, men inte i ett tomt fält
const usernameError = computed(() =>
  isSignup.value && username.value ? validateUsername(username.value) : null,
);
const passwordError = computed(() =>
  isSignup.value && password.value ? validatePassword(password.value) : null,
);

// Felet från backend gäller det som skickades. Töms när spelaren ändrar något,
// annars står t.ex. "Användarnamnet är upptaget" kvar och döljer felen från valideringen
watch([username, password], () => {
  serverError.value = '';
});
// Kortet rymmer bara en rad, så bara ett fel visas åt gången
const message = computed(() => serverError.value || usernameError.value || passwordError.value);

// Knappen är spärrad tills båda fälten är ifyllda, och vid registrering godkända
const canSubmit = computed(() => {
  if (submitting.value || !username.value.trim() || !password.value) {
    return false;
  }
  if (!isSignup.value) {
    return true;
  }
  return !validateUsername(username.value) && !validatePassword(password.value);
});

async function submit() {
  if (!canSubmit.value) {
    return;
  }
  serverError.value = '';
  submitting.value = true;
  try {
    // Samma normalisering som backend, så att namnet sparas som spelaren ser det
    const name = username.value.normalize('NFC').trim();
    if (isSignup.value) {
      await signup(name, password.value);
    } else {
      await login(name, password.value);
    }
    emit('done');
  } catch (err) {
    // err.status saknas när servern inte svarar alls
    serverError.value = err.status ? err.message : 'Kunde inte nå servern';
  } finally {
    submitting.value = false;
  }
}

function focus() {
  usernameInput.value.focus();
}

defineExpose({ focus });
</script>

<template>
  <form class="id-form" novalidate @submit.prevent="submit" @keydown.esc="emit('cancel')">
    <h2>{{ isSignup ? 'NY IDENTITET' : 'IDENTIFIERA' }}</h2>

    <label class="field">
      <span>Namn</span>
      <!-- maxlength gör att det inte går att skriva fler tecken än kortets framsida rymmer -->
      <input
        ref="usernameInput"
        v-model="username"
        type="text"
        autocomplete="username"
        spellcheck="false"
        :maxlength="isSignup ? USERNAME_MAX_LENGTH : undefined"
        :aria-invalid="Boolean(usernameError)"
        required
      />
    </label>

    <label class="field">
      <span>Lösen</span>
      <input
        v-model="password"
        type="password"
        :autocomplete="isSignup ? 'new-password' : 'current-password'"
        :maxlength="PASSWORD_MAX_LENGTH"
        :aria-invalid="Boolean(passwordError)"
        required
      />
    </label>

    <!-- aria-live gör att skärmläsare läser upp felet när det ändras -->
    <p class="message" aria-live="polite">{{ message }}</p>

    <div class="actions">
      <button type="button" class="stamp back" @click="emit('cancel')">TILLBAKA</button>
      <button type="submit" class="stamp" :disabled="!canSubmit">
        {{ isSignup ? 'REGISTRERA' : 'IDENTIFIERA' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
/* Alla storlekar i cqw, alltså procent av kortets bredd (container-type på .id-card) */
.id-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.8cqw;
}

h2 {
  padding-bottom: 1cqw;
  border-bottom: 2px solid currentColor;
  font-size: 6.5cqw;
  font-weight: normal;
  line-height: 1;
}

/* Etiketten till vänster och en skrivlinje till höger, som på en blankett */
.field {
  display: flex;
  align-items: baseline;
  gap: 2cqw;
  font-size: 4.8cqw;
}

.field span {
  flex: 0 0 15cqw;
}

input {
  flex: 1;
  min-width: 0;
  padding: 1.5cqw 1cqw;
  font: inherit;
  font-size: 5.6cqw;
  color: #5f0069;
  background: transparent;
  border: none;
  border-bottom: 2px dotted currentColor;
  border-radius: 0;
}

input:focus-visible {
  outline: none;
  background: rgb(255 255 255 / 35%);
  border-bottom-style: solid;
}

input[aria-invalid='true'] {
  border-bottom-color: #750000;
}

.message {
  min-height: 1lh;
  font-size: 4.2cqw;
  line-height: 1.15;
  color: #750000;
}

.actions {
  margin-top: auto;
  display: flex;
  gap: 2cqw;
}

/* Samma stämpelknappar som på kortets framsida */
.stamp {
  flex: 1;
  padding: 1.5cqw;
  font-size: 5cqw;
  background: rgb(255 255 255 / 25%);
  border: 2px solid #c9a227;
  border-radius: 1cqw;
  cursor: pointer;
}

.stamp:hover:not(:disabled) {
  background: rgb(201 162 39 / 20%);
}

.stamp:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.back {
  flex: 0 0 auto;
  font-size: 4cqw;
}
</style>
