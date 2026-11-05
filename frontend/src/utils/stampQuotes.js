// Citat baserade på hjärnkapacitet/hälsa
export function stampQuotes(health) {
  const currentHealth = Number(health) || 0;
  if (currentHealth >= 95) return 'GÔTT I BÔTT!';
  if (currentHealth >= 85) return 'GÔTT MOS!';
  if (currentHealth >= 70) return 'GÔRBRA!';
  if (currentHealth >= 50) return 'DE VA\nLA BRA!';
  if (currentHealth >= 30) return 'FUNKAR\nLA?';
  return 'LEVER\nELLER?';
}
