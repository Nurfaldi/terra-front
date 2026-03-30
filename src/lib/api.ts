const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

interface ApiOptions extends RequestInit {
    token?: string;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    const config: RequestInit = {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        },
    };

    // Handle multipart/form-data: remove Content-Type to let browser set boundary
    if (rest.body instanceof FormData) {
        if (config.headers && "Content-Type" in config.headers) {
            delete (config.headers as any)["Content-Type"];
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `API Error: ${response.statusText}`);
    }

    // Handle 204 No Content or empty responses
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType?.includes("application/json")) {
        return undefined as T;
    }

    return response.json();
}
