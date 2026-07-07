const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ToolStatus = 'pending' | 'approved' | 'rejected';

export interface Role {
  id: number;
  name: string;
  label: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface ToolExample {
  id?: number;
  title: string;
  url: string;
  image_url: string;
  description: string;
}

export interface ToolAuthor {
  id: number;
  name: string;
  role?: { id: number; label: string };
}

export interface AiTool {
  id: number;
  name: string;
  slug: string;
  user?: ToolAuthor;
  description: string;
  how_to_use: string;
  url: string;
  logo_url: string;
  documentation_url: string;
  video_url: string;
  difficulty: Difficulty;
  status: ToolStatus;
  is_active: boolean;
  is_free: boolean;
  categories: Category[];
  roles: Role[];
  tags: Tag[];
  examples: ToolExample[];
}

export interface AiToolPayload {
  name: string;
  description: string;
  how_to_use: string;
  url: string;
  logo_url: string;
  documentation_url: string;
  video_url: string;
  difficulty: Difficulty;
  is_active: boolean;
  is_free: boolean;
  category_ids: number[];
  role_ids: number[];
  tag_ids: number[];
  examples: Omit<ToolExample, 'id'>[];
}

export interface ToolFilters {
  status?: string;
  category?: string;
  role?: string;
  tag?: string;
  search?: string;
  difficulty?: string;
}

// ─── Core request helper ──────────────────────────────────────────────────────

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    const firstError = data.errors ? (Object.values(data.errors)[0] as string[])[0] : null;
    throw new Error(firstError ?? data.message ?? 'API грешка');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

// ─── Domain APIs ──────────────────────────────────────────────────────────────

export const toolsApi = {
  list: (filters?: ToolFilters) => {
    const params = new URLSearchParams();
    if (filters?.status)     params.set('status', filters.status);
    if (filters?.category)   params.set('category', filters.category);
    if (filters?.role)       params.set('role', filters.role);
    if (filters?.tag)        params.set('tag', filters.tag);
    if (filters?.search)     params.set('search', filters.search);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    const query = params.toString();
    return api.get<AiTool[]>(`/tools${query ? `?${query}` : ''}`);
  },
  get: (id: number | string) => api.get<AiTool>(`/tools/${id}`),
  create: (data: AiToolPayload) => api.post<AiTool>('/tools', data),
  update: (id: number, data: AiToolPayload) => api.put<AiTool>(`/tools/${id}`, data),
  remove: (id: number) => api.delete(`/tools/${id}`),
  setStatus: (id: number, status: ToolStatus) =>
    api.patch<AiTool>(`/tools/${id}/status`, { status }),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (data: { name: string; color?: string }) => api.post<Category>('/categories', data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const rolesApi = {
  list: () => api.get<Role[]>('/roles'),
};

export const tagsApi = {
  list: () => api.get<Tag[]>('/tags'),
  create: (data: { name: string; color?: string }) => api.post<Tag>('/tags', data),
  delete: (id: number) => api.delete(`/tags/${id}`),
};

export const uploadApi = {
  // FormData — без Content-Type header, браузърът го слага сам с boundary
  upload: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      const firstError = data.errors ? (Object.values(data.errors)[0] as string[])[0] : null;
      throw new Error(firstError ?? data.message ?? 'Грешка при качване');
    }

    return data;
  },
};
