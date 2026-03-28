export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "API Error");
    }

    return data;
  } catch (error: any) {
    console.error("API ERROR:", error.message);
    throw error;
  }
}