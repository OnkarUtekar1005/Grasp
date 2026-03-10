/**
 * API Service - Backend Integration
 *
 * This service handles all API calls to the Grasp Electric backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

/**
 * Helper function for API calls
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error?.message || 'Something went wrong');
      error.code = data.error?.code;
      error.details = data.error?.details;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    // Network error
    const networkError = new Error('Network error. Please check your connection.');
    networkError.code = 'NETWORK_ERROR';
    throw networkError;
  }
};

// ============================================
// AUTH API SERVICES
// ============================================

export const authAPI = {
  /**
   * Admin login
   */
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Admin logout
   */
  logout: async () => {
    return apiCall('/auth/logout', { method: 'POST' });
  },

  /**
   * Get current admin profile
   */
  me: async () => {
    return apiCall('/auth/me');
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    return apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ============================================
// PRODUCT API SERVICES
// ============================================

export const productAPI = {
  /**
   * Get all products with filters and pagination
   */
  getAll: async (options = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/products${query}`);
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit = 6) => {
    return apiCall(`/products/featured?limit=${limit}`);
  },

  /**
   * Search products
   */
  search: async (query, options = {}) => {
    const params = new URLSearchParams({ q: query, ...options });
    return apiCall(`/products/search?${params.toString()}`);
  },

  /**
   * Get single product by slug
   */
  getBySlug: async (slug) => {
    return apiCall(`/products/${slug}`);
  },

  /**
   * Get products by category
   */
  getByCategory: async (categorySlug, options = {}) => {
    const params = new URLSearchParams(options);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/products/category/${categorySlug}${query}`);
  },

  /**
   * Create new product (Admin only)
   */
  create: async (data) => {
    // Handle FormData (with images) or plain object
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall('/products', {
      method: 'POST',
      body,
    });
  },

  /**
   * Update existing product (Admin only)
   */
  update: async (id, data) => {
    // Handle FormData (with images) or plain object
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall(`/products/${id}`, {
      method: 'PUT',
      body,
    });
  },

  /**
   * Delete product (Admin only)
   */
  delete: async (id) => {
    return apiCall(`/products/${id}`, { method: 'DELETE' });
  },

  // Variants
  addVariant: async (productId, data) => {
    return apiCall(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateVariant: async (productId, variantId, data) => {
    return apiCall(`/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteVariant: async (productId, variantId) => {
    return apiCall(`/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
  },

  // Images
  uploadImages: async (productId, files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    return apiCall(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    });
  },

  updateImage: async (productId, imageId, data) => {
    return apiCall(`/products/${productId}/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteImage: async (productId, imageId) => {
    return apiCall(`/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
  },

  // Documents
  uploadDocument: async (productId, file, name, documentType) => {
    const formData = new FormData();
    formData.append('document', file);
    if (name) formData.append('name', name);
    if (documentType) formData.append('documentType', documentType);
    return apiCall(`/products/${productId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteDocument: async (productId, docId) => {
    return apiCall(`/products/${productId}/documents/${docId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CATEGORY API SERVICES
// ============================================

export const categoryAPI = {
  /**
   * Get all categories
   */
  getAll: async () => {
    return apiCall('/categories');
  },

  /**
   * Get single category by slug
   */
  getBySlug: async (slug) => {
    return apiCall(`/categories/${slug}`);
  },

  /**
   * Create category (Admin only)
   */
  create: async (data) => {
    // Handle FormData (with image) or plain object
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall('/categories', {
      method: 'POST',
      body,
    });
  },

  /**
   * Update category (Admin only)
   */
  update: async (id, data) => {
    // Handle FormData (with image) or plain object
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall(`/categories/${id}`, {
      method: 'PUT',
      body,
    });
  },

  /**
   * Delete category (Admin only)
   */
  delete: async (id) => {
    return apiCall(`/categories/${id}`, { method: 'DELETE' });
  },

  /**
   * Upload category image (Admin only)
   */
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCall(`/categories/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  },
};

// ============================================
// INQUIRY API SERVICES
// ============================================

export const inquiryAPI = {
  /**
   * Submit contact/inquiry form (Public)
   */
  submit: async (data) => {
    return apiCall('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all inquiries (Admin only)
   */
  getAll: async (options = {}) => {
    const params = new URLSearchParams(options);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/inquiries${query}`);
  },

  /**
   * Get inquiry by ID (Admin only)
   */
  getById: async (id) => {
    return apiCall(`/inquiries/${id}`);
  },

  /**
   * Update inquiry (Admin only)
   */
  update: async (id, data) => {
    return apiCall(`/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete inquiry (Admin only)
   */
  delete: async (id) => {
    return apiCall(`/inquiries/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// QUOTE API SERVICES
// ============================================

export const quoteAPI = {
  /**
   * Submit quote request (Public)
   */
  submit: async (data) => {
    return apiCall('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all quote requests (Admin only)
   */
  getAll: async (options = {}) => {
    const params = new URLSearchParams(options);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/quotes${query}`);
  },

  /**
   * Get quote by ID (Admin only)
   */
  getById: async (id) => {
    return apiCall(`/quotes/${id}`);
  },

  /**
   * Update quote request (Admin only)
   */
  update: async (id, data) => {
    return apiCall(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete quote request (Admin only)
   */
  delete: async (id) => {
    return apiCall(`/quotes/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// ADMIN API SERVICES
// ============================================

export const adminAPI = {
  /**
   * Get all admins
   */
  getAll: async () => {
    return apiCall('/admins');
  },

  /**
   * Create new admin
   */
  create: async (data) => {
    return apiCall('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update admin
   */
  update: async (id, data) => {
    return apiCall(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete admin
   */
  delete: async (id) => {
    return apiCall(`/admins/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// DASHBOARD API SERVICES
// ============================================

export const dashboardAPI = {
  /**
   * Get dashboard statistics (Admin only)
   */
  getStats: async () => {
    return apiCall('/dashboard/stats');
  },
};

// ============================================
// GALLERY API SERVICES
// ============================================

export const galleryAPI = {
  /**
   * Get all gallery images (public)
   */
  getAll: async (options = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/gallery${query}`);
  },

  /**
   * Get featured gallery images
   */
  getFeatured: async (limit = 6) => {
    return apiCall(`/gallery/featured?limit=${limit}`);
  },

  /**
   * Get gallery image by ID
   */
  getById: async (id) => {
    return apiCall(`/gallery/${id}`);
  },

  /**
   * Get all gallery images for admin (includes inactive)
   */
  adminGetAll: async (options = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/gallery/admin/list${query}`);
  },

  /**
   * Create gallery image (Admin only)
   */
  create: async (data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall('/gallery', {
      method: 'POST',
      body,
    });
  },

  /**
   * Update gallery image (Admin only)
   */
  update: async (id, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall(`/gallery/${id}`, {
      method: 'PUT',
      body,
    });
  },

  /**
   * Delete gallery image (Admin only)
   */
  delete: async (id) => {
    return apiCall(`/gallery/${id}`, { method: 'DELETE' });
  },

  /**
   * Update sort order (Admin only)
   */
  updateOrder: async (items) => {
    return apiCall('/gallery/order/bulk', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  /**
   * Link products to gallery image (Admin only)
   */
  linkProducts: async (id, productIds) => {
    return apiCall(`/gallery/${id}/products`, {
      method: 'PUT',
      body: JSON.stringify({ productIds }),
    });
  },
};

// ============================================
// DOWNLOAD API SERVICES
// ============================================

export const downloadAPI = {
  /**
   * Get all downloads grouped by category (public)
   */
  getAll: async () => {
    return apiCall('/downloads');
  },

  /**
   * Get all downloads for admin (includes inactive)
   */
  adminGetAll: async () => {
    return apiCall('/downloads/admin/list');
  },

  /**
   * Get single download by ID (admin)
   */
  getById: async (id) => {
    return apiCall(`/downloads/admin/${id}`);
  },

  /**
   * Get all download categories for admin
   */
  adminGetCategories: async () => {
    return apiCall('/downloads/admin/categories');
  },

  /**
   * Create download category (Admin only)
   */
  createCategory: async (data) => {
    return apiCall('/downloads/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update download category (Admin only)
   */
  updateCategory: async (id, data) => {
    return apiCall(`/downloads/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete download category (Admin only)
   */
  deleteCategory: async (id) => {
    return apiCall(`/downloads/admin/categories/${id}`, { method: 'DELETE' });
  },

  /**
   * Create download (Admin only)
   */
  create: async (data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall('/downloads', {
      method: 'POST',
      body,
    });
  },

  /**
   * Update download (Admin only)
   */
  update: async (id, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiCall(`/downloads/${id}`, {
      method: 'PUT',
      body,
    });
  },

  /**
   * Delete download (Admin only)
   */
  delete: async (id) => {
    return apiCall(`/downloads/${id}`, { method: 'DELETE' });
  },
};

// Export all APIs
export default {
  auth: authAPI,
  product: productAPI,
  category: categoryAPI,
  inquiry: inquiryAPI,
  quote: quoteAPI,
  admin: adminAPI,
  dashboard: dashboardAPI,
  gallery: galleryAPI,
  download: downloadAPI,
};
