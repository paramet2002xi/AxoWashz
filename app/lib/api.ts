// API Configuration
// Backend runs on port 4658 (from application.yml) or 8080 (from README)
// Use environment variable NEXT_PUBLIC_API_URL to override
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4658';
const FALLBACK_API_URL = 'http://localhost:8080';

// Helper function to check if backend is reachable
async function checkBackendHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for health check
    
    const response = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    // Even if login fails (401), it means backend is reachable
    return response.status === 401 || response.status === 400;
  } catch {
    return false;
  }
}

// Types matching backend DTOs
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  username: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface FanStatusItem {
  id: number;
  fan_name: string;
  fan_status: string;
  updated_date: string | null; // LocalDateTime from Java, serialized as ISO string or array
}

export interface FanEditItem {
  id: number;
  fan_name: string;
}

export interface CreateFanRequest {
  fan_name: string;
  fan_id: string;
}

export interface CreateFanResponse {
  fan_name: string;
  fan_id: string;
  created_date: string;
  created_by: string;
  updated_date: string;
  updated_by: string;
}

export interface UpdateStatusRequest {
  fan_status: string;
}

// Dashboard (from fans_log)
export interface FanLogItem {
  id: number;
  fan_name: string;
  fan_id: string;
  fan_status: string;
  coin: string | null;
  log_date: string | null;
}

export interface DashboardStats {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  byStatus: { status: string; count: number }[];
  byFan: { fan_id: string; fan_name: string; count: number }[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Get auth token from storage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Set auth token
function setAuthToken(token: string, rememberMe: boolean = true): void {
  if (typeof window === 'undefined') return;
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
}

// Clear auth token
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

// Make API request with auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        throw new Error('Unauthorized');
      }
      
      // Try to parse error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        // Backend returns error in ApiResponse format: { success: false, message: "...", data: null }
        // Or Spring Boot error format: { error: "...", message: "...", ... }
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      // Provide more context for common errors (only if message is generic)
      if (errorMessage.includes('HTTP error') || errorMessage.includes('status:')) {
        if (response.status === 400) {
          errorMessage = 'คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่ง';
        } else if (response.status === 401) {
          errorMessage = 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่';
        } else if (response.status === 403) {
          errorMessage = 'ไม่มีสิทธิ์เข้าถึง';
        } else if (response.status === 404) {
          errorMessage = 'ไม่พบข้อมูลที่ต้องการ';
        } else if (response.status >= 500) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle abort (timeout)
    if (error.name === 'AbortError') {
      throw new Error(`การเชื่อมต่อหมดเวลา กรุณาตรวจสอบว่า Backend ทำงานอยู่ที่ ${API_BASE_URL}`);
    }
    
    // Handle network errors (connection refused, failed to fetch, etc.)
    if (
      error.name === 'TypeError' || 
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('Network request failed')
    ) {
      // Try to check if backend is running on alternative port
      const port = API_BASE_URL.split(':').pop() || '4658';
      const altPort = port === '4658' ? '8080' : '4658';
      const altUrl = API_BASE_URL.replace(`:${port}`, `:${altPort}`);
      
      const errorMessage = 
        `ไม่สามารถเชื่อมต่อกับ Backend ได้\n\n` +
        `กรุณาตรวจสอบ:\n` +
        `1. Backend ทำงานอยู่ที่ ${API_BASE_URL}\n` +
        `   หรือลอง port อื่น: ${altUrl}\n` +
        `2. ใช้คำสั่งรัน Backend:\n` +
        `   cd frontend\n` +
        `   docker compose up -d --build\n` +
        `   หรือ\n` +
        `   ./gradlew bootRun\n` +
        `3. ตรวจสอบว่า port ${port} หรือ ${altPort} ไม่ถูกใช้งาน\n` +
        `4. ตรวจสอบ logs: docker compose logs backend\n` +
        `5. ตั้งค่า URL ใน .env.local:\n` +
        `   NEXT_PUBLIC_API_URL=http://localhost:4658`;
      
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// Auth API
export const authApi = {
  async login(username: string, password: string, rememberMe: boolean = true): Promise<LoginResponse> {
    try {
      const response = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // Store token
      if (response.token) {
        setAuthToken(response.token, rememberMe);
      }
      
      return response;
    } catch (error: any) {
      // Re-throw with more context
      if (error.message && error.message.includes('ไม่สามารถเชื่อมต่อ')) {
        throw error; // Keep the detailed error message
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    clearAuthToken();
  },
};

// Fans API
export const fansApi = {
  async getStatus(): Promise<FanStatusItem[]> {
    const response = await apiRequest<ApiResponse<FanStatusItem[]>>('/api/fans/status');
    return response.data;
  },
};

// Admin Fans API
export const adminFansApi = {
  async getAll(): Promise<FanStatusItem[]> {
    // Use status endpoint to get complete data including status and updated_date
    const response = await apiRequest<ApiResponse<FanStatusItem[]>>('/api/fans/status');
    return response.data;
  },

  async create(fan: CreateFanRequest): Promise<CreateFanResponse> {
    const response = await apiRequest<ApiResponse<CreateFanResponse>>('/api/admin/fans', {
      method: 'POST',
      body: JSON.stringify(fan),
    });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiRequest<ApiResponse<void>>(`/api/admin/fans/${id}`, {
      method: 'DELETE',
    });
  },

  async reportFault(id: number): Promise<FanStatusItem[]> {
    const response = await apiRequest<ApiResponse<FanStatusItem[]>>(`/api/admin/fans/${id}/fault`, {
      method: 'PUT',
    });
    return response.data;
  },

  async updateStatus(id: number, fanStatus: string): Promise<FanStatusItem[]> {
    const response = await apiRequest<ApiResponse<FanStatusItem[]>>(`/api/admin/fans/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ fan_status: fanStatus }),
    });
    return response.data;
  },
};

// Admin Dashboard API (from fans_log)
export const adminDashboardApi = {
  async getLogs(page: number = 0, size: number = 20): Promise<PageResponse<FanLogItem>> {
    const response = await apiRequest<ApiResponse<PageResponse<FanLogItem>>>(
      `/api/admin/dashboard/logs?page=${page}&size=${size}`
    );
    return response.data;
  },

  async getStats(): Promise<DashboardStats> {
    const response = await apiRequest<ApiResponse<DashboardStats>>('/api/admin/dashboard/stats');
    return response.data;
  },
};

