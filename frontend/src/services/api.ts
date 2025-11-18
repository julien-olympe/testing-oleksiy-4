import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
  Project,
  ProjectEditorData,
  Function,
  FunctionEditorData,
  Brick,
  Connection,
  Permission,
  DatabaseInstance,
  ExecutionResult,
  ApiError,
  ProjectsResponse,
} from '../types';

const API_BASE_URL = '/api/v1';

class ApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for httpOnly cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add JWT token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Skip token refresh for auth endpoints (login, register, refresh)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');
        
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear token and redirect to login
            this.clearToken();
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private clearToken(): void {
    localStorage.removeItem('accessToken');
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = response.data.token;
        this.setToken(newToken);
        return newToken;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearToken();
  }

  async getCurrentUser() {
    const response = await this.client.get<{ user: { id: string; email: string; createdAt: string } }>('/users/me');
    return response.data.user;
  }

  // Project endpoints
  async getProjects(limit = 50, offset = 0): Promise<ProjectsResponse> {
    const response = await this.client.get<ProjectsResponse>('/projects', {
      params: { limit, offset },
    });
    return response.data;
  }

  async createProject(name?: string): Promise<Project> {
    const response = await this.client.post<{ project: Project }>('/projects', name ? { name } : {});
    return response.data.project;
  }

  async updateProject(id: string, name: string): Promise<Project> {
    const response = await this.client.put<{ project: Project }>(`/projects/${id}`, { name });
    return response.data.project;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/projects/${id}`);
  }

  async getProjectEditor(id: string): Promise<ProjectEditorData> {
    const response = await this.client.get<ProjectEditorData>(`/projects/${id}/editor`);
    return response.data;
  }

  // Function endpoints
  async createFunction(projectId: string, name?: string): Promise<Function> {
    const response = await this.client.post<{ function: Function }>(`/projects/${projectId}/functions`, name ? { name } : {});
    return response.data.function;
  }

  async updateFunction(id: string, name: string): Promise<Function> {
    const response = await this.client.put<{ function: Function }>(`/functions/${id}`, { name });
    return response.data.function;
  }

  async deleteFunction(id: string): Promise<void> {
    await this.client.delete(`/functions/${id}`);
  }

  async getFunctionEditor(id: string): Promise<FunctionEditorData> {
    const response = await this.client.get<FunctionEditorData>(`/functions/${id}/editor`);
    return response.data;
  }

  async runFunction(id: string): Promise<ExecutionResult> {
    const response = await this.client.post<{ execution: ExecutionResult }>(`/functions/${id}/run`);
    return response.data.execution;
  }

  // Brick endpoints
  async createBrick(functionId: string, type: string, positionX: number, positionY: number, configuration: Record<string, unknown> = {}): Promise<Brick> {
    const response = await this.client.post<{ brick: Brick }>(`/functions/${functionId}/bricks`, {
      type,
      positionX,
      positionY,
      configuration,
    });
    return response.data.brick;
  }

  async updateBrick(id: string, updates: { positionX?: number; positionY?: number; configuration?: Record<string, unknown> }): Promise<Brick> {
    const response = await this.client.put<{ brick: Brick }>(`/bricks/${id}`, updates);
    return response.data.brick;
  }

  async deleteBrick(id: string): Promise<void> {
    await this.client.delete(`/bricks/${id}`);
  }

  // Connection endpoints
  async createConnection(fromBrickId: string, fromOutputName: string, toBrickId: string, toInputName: string): Promise<Connection> {
    const response = await this.client.post<{ connection: Connection }>(`/bricks/${fromBrickId}/connections`, {
      fromOutputName,
      toBrickId,
      toInputName,
    });
    return response.data.connection;
  }

  async deleteConnection(fromBrickId: string, toBrickId: string, fromOutputName?: string, toInputName?: string): Promise<void> {
    const params = new URLSearchParams();
    if (fromOutputName) params.append('fromOutputName', fromOutputName);
    if (toInputName) params.append('toInputName', toInputName);
    const queryString = params.toString();
    await this.client.delete(`/bricks/${fromBrickId}/connections/${toBrickId}${queryString ? `?${queryString}` : ''}`);
  }

  // Permission endpoints
  async addPermission(projectId: string, email: string): Promise<Permission> {
    const response = await this.client.post<{ permission: Permission }>(`/projects/${projectId}/permissions`, { email });
    return response.data.permission;
  }

  // Database instance endpoints
  async createDatabaseInstance(projectId: string, databaseId: string): Promise<DatabaseInstance> {
    const response = await this.client.post<{ instance: DatabaseInstance }>(
      `/projects/${projectId}/databases/${databaseId}/instances`
    );
    return response.data.instance;
  }

  async updateDatabaseInstance(projectId: string, databaseId: string, instanceId: string, propertyId: string, value: string): Promise<DatabaseInstance> {
    const response = await this.client.put<{ instance: DatabaseInstance }>(
      `/projects/${projectId}/databases/${databaseId}/instances/${instanceId}`,
      { propertyId, value }
    );
    return response.data.instance;
  }
}

export const apiService = new ApiService();
