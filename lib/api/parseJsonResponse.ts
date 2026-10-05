/** Parse JSON from a fetch Response; avoids "Unexpected end of JSON input" on empty bodies. */
export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Server returned an invalid response. Try restarting the dev server.");
  }
}
