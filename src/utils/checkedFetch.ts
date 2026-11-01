export async function checkedFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response;
}

export async function checkedJsonFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await checkedFetch(url, init);
  return response.json() as Promise<T>;
}
