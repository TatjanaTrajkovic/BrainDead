const BASE_URL = import.meta.env.VITE_API_URL;

export async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // skickar med token till backend
    ...options,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = new Error(data?.error || 'Något gick fel mot servern');
    err.status = response.status;
    throw err;
  }
  return data;
}
