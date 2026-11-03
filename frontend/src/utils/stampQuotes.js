// Citat baserade på hjärnkapacitet/hälsa
export function getGöteborgQuote(health) {
  const currentHealth = Number(health) || 0;
  if (currentHealth >= 90) return 'GÔTT I BÔTT!';
  if (currentHealth >= 70) return 'GÔRBRA VA!';
  if (currentHealth >= 50) return 'GÔTT MOS!';
  if (currentHealth >= 30) return 'de e la bra';
  return 'de funkar la';
}
