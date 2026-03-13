/**
 * API Client for backend communication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
// In production on Vercel, use the proxy route to avoid CORS
const EFFECTIVE_API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '/api-proxy'
  : API_URL;

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found in localStorage');
      }
      return token;
    }
    return null;
  }

  /**
   * Build headers for API requests
   */
  private getHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any = null;
      const contentType = response.headers.get('content-type');
      
      try {
        // Vérifier si la réponse contient du JSON
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text && text.trim()) {
            const parsed = JSON.parse(text);
            // Ne garder que si on a vraiment des données
            if (parsed && Object.keys(parsed).length > 0) {
              errorData = parsed;
            }
          }
        }
      } catch (parseError) {
        // Si le parsing échoue, errorData reste null
      }

      // Créer un message d'erreur basique si pas de données
      let errorMessage = 'An error occurred';
      if (errorData) {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
      
      // Messages d'erreur spécifiques selon le code de statut
      if (response.status === 0 || response.status === 500) {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.';
      } else if (response.status === 404) {
        errorMessage = errorData?.message || errorData?.error || 'Ressource non trouvée';
      } else if (response.status === 401) {
        errorMessage = errorData?.message || errorData?.error || 'Non autorisé. Vérifiez vos identifiants.';
      } else if (response.status === 400) {
        errorMessage = errorData?.message || errorData?.error || 'Données invalides. Vérifiez les champs remplis.';
      }

      // Créer un objet Error avec toutes les propriétés
      const apiError: ApiError = new Error(errorMessage);
      apiError.status = response.status;
      apiError.errors = errorData?.errors;
      
      // Ne JAMAIS logger les erreurs - elles sont gérées par les hooks/services
      // L'erreur sera throw pour être gérée par le code appelant
      
      throw apiError;
    }

    // Vérifier que la réponse contient du contenu avant de parser
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (!text || !text.trim()) {
        // Réponse vide mais OK, retourner un objet vide
        return {} as T;
      }
      return JSON.parse(text);
    }
    
    // Si ce n'est pas du JSON, retourner la réponse textuelle
    return response.text() as unknown as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(options?.headers),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(options?.headers),
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (err: any) {
      // Gérer les erreurs de réseau (connexion refusée, etc.)
      if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        const error = new Error(`Impossible de se connecter au serveur. URL: ${this.baseURL}`);
        (error as any).status = 0;
        throw error;
      }
      throw err;
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(options?.headers),
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_URL);

// Use the proxy URL in production to avoid CORS
const effectiveClient = new ApiClient(EFFECTIVE_API_URL);

// Export convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => effectiveClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => effectiveClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) => effectiveClient.put<T>(endpoint, data, options),
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) => effectiveClient.patch<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: RequestInit) => effectiveClient.delete<T>(endpoint, options),
};
