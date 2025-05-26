export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T = any>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }
    return res.json();
}