/**
 * API Service - Base for backend integration
 *
 * This service will handle all API calls to the backend.
 * Currently uses mock data, but structured for easy backend integration.
 *
 * When connecting to a real backend:
 * 1. Update API_BASE_URL to your backend URL
 * 2. Remove mock implementations
 * 3. Uncomment the actual fetch calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

// ============================================
// PRODUCT API SERVICES
// ============================================

export const productAPI = {
  /**
   * Search products by query
   * @param {string} query - Search query
   * @param {object} filters - Optional filters (category, priceRange, etc.)
   * @returns {Promise<Array>} - Array of matching products
   */
  search: async (query, filters = {}) => {
    // TODO: Replace with actual API call
    // return apiCall(`/products/search?q=${encodeURIComponent(query)}&${new URLSearchParams(filters)}`);

    // Mock implementation - simulates backend search
    const { productsData: products } = await import('../data/products');
    const searchLower = query.toLowerCase();

    let results = products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.specs?.some(spec => spec.toLowerCase().includes(searchLower))
    );

    // Apply category filter if provided
    if (filters.category) {
      results = results.filter(p => p.categorySlug === filters.category);
    }

    // Apply price filter if provided
    if (filters.minPrice) {
      results = results.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      results = results.filter(p => p.price <= filters.maxPrice);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return results;
  },

  /**
   * Get all products with optional pagination
   * @param {object} options - { page, limit, sortBy, order }
   * @returns {Promise<object>} - { products, total, page, totalPages }
   */
  getAll: async (options = {}) => {
    // TODO: Replace with actual API call
    // return apiCall(`/products?${new URLSearchParams(options)}`);

    const { productsData: products } = await import('../data/products');
    const { page = 1, limit = 12, sortBy = 'name', order = 'asc' } = options;

    // Sort products
    const sorted = [...products].sort((a, b) => {
      if (order === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      }
      return a[sortBy] < b[sortBy] ? 1 : -1;
    });

    // Paginate
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      products: paginated,
      total: products.length,
      page,
      totalPages: Math.ceil(products.length / limit)
    };
  },

  /**
   * Get single product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<object>} - Product details
   */
  getBySlug: async (slug) => {
    // TODO: Replace with actual API call
    // return apiCall(`/products/${slug}`);

    const { productsData: products } = await import('../data/products');
    const product = products.find(p => p.slug === slug);

    await new Promise(resolve => setTimeout(resolve, 150));

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  },

  /**
   * Get products by category
   * @param {string} categorySlug - Category slug
   * @returns {Promise<Array>} - Array of products in category
   */
  getByCategory: async (categorySlug) => {
    // TODO: Replace with actual API call
    // return apiCall(`/products/category/${categorySlug}`);

    const { productsData: products } = await import('../data/products');
    const filtered = products.filter(p => p.categorySlug === categorySlug);

    await new Promise(resolve => setTimeout(resolve, 200));

    return filtered;
  },

  /**
   * Create new product (Admin only)
   * @param {FormData} formData - Product data with images
   * @returns {Promise<object>} - Created product
   */
  create: async (formData) => {
    // TODO: Replace with actual API call
    // return apiCall('/products', {
    //   method: 'POST',
    //   headers: {}, // Let browser set content-type for FormData
    //   body: formData
    // });

    // Mock implementation
    const productData = Object.fromEntries(formData.entries());
    console.log('Creating product:', productData);

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: Date.now(),
      ...productData,
      slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Update existing product (Admin only)
   * @param {string} id - Product ID
   * @param {FormData} formData - Updated product data
   * @returns {Promise<object>} - Updated product
   */
  update: async (id, formData) => {
    // TODO: Replace with actual API call
    // return apiCall(`/products/${id}`, {
    //   method: 'PUT',
    //   headers: {},
    //   body: formData
    // });

    const productData = Object.fromEntries(formData.entries());
    console.log('Updating product:', id, productData);

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id,
      ...productData,
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Delete product (Admin only)
   * @param {string} id - Product ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    // TODO: Replace with actual API call
    // return apiCall(`/products/${id}`, { method: 'DELETE' });

    console.log('Deleting product:', id);
    await new Promise(resolve => setTimeout(resolve, 300));

    return { success: true };
  },

  /**
   * Upload product images (Admin only)
   * @param {string} productId - Product ID
   * @param {FileList} files - Image files to upload
   * @returns {Promise<Array>} - Array of uploaded image URLs
   */
  uploadImages: async (productId, files) => {
    // TODO: Replace with actual API call
    // const formData = new FormData();
    // Array.from(files).forEach(file => formData.append('images', file));
    // return apiCall(`/products/${productId}/images`, {
    //   method: 'POST',
    //   headers: {},
    //   body: formData
    // });

    // Mock implementation - creates object URLs for preview
    const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));

    await new Promise(resolve => setTimeout(resolve, 500));

    return imageUrls;
  }
};

// ============================================
// CATEGORY API SERVICES
// ============================================

export const categoryAPI = {
  /**
   * Get all categories
   * @returns {Promise<Array>} - Array of categories
   */
  getAll: async () => {
    // TODO: Replace with actual API call
    // return apiCall('/categories');

    const { categoriesData } = await import('../data/products');
    await new Promise(resolve => setTimeout(resolve, 150));

    return categoriesData;
  },

  /**
   * Get single category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<object>} - Category details
   */
  getBySlug: async (slug) => {
    // TODO: Replace with actual API call
    // return apiCall(`/categories/${slug}`);

    const { categoriesData } = await import('../data/products');
    const category = categoriesData.find(c => c.slug === slug);

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  },

  /**
   * Create category (Admin only)
   * @param {object} data - Category data
   * @returns {Promise<object>} - Created category
   */
  create: async (data) => {
    // TODO: Replace with actual API call
    // return apiCall('/categories', {
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // });

    console.log('Creating category:', data);
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      id: Date.now(),
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, '-')
    };
  },

  /**
   * Update category (Admin only)
   * @param {string} id - Category ID
   * @param {object} data - Updated category data
   * @returns {Promise<object>} - Updated category
   */
  update: async (id, data) => {
    // TODO: Replace with actual API call
    // return apiCall(`/categories/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(data)
    // });

    console.log('Updating category:', id, data);
    await new Promise(resolve => setTimeout(resolve, 300));

    return { id, ...data };
  },

  /**
   * Delete category (Admin only)
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    // TODO: Replace with actual API call
    // return apiCall(`/categories/${id}`, { method: 'DELETE' });

    console.log('Deleting category:', id);
    await new Promise(resolve => setTimeout(resolve, 300));

    return { success: true };
  }
};

// ============================================
// INQUIRY API SERVICES
// ============================================

export const inquiryAPI = {
  /**
   * Submit contact/inquiry form
   * @param {object} data - Form data
   * @returns {Promise<object>} - Submission result
   */
  submit: async (data) => {
    // TODO: Replace with actual API call
    // return apiCall('/inquiries', {
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // });

    console.log('Submitting inquiry:', data);
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Thank you for your inquiry. We will get back to you soon!'
    };
  },

  /**
   * Get all inquiries (Admin only)
   * @param {object} options - { page, limit, status }
   * @returns {Promise<object>} - { inquiries, total }
   */
  getAll: async (options = {}) => {
    // TODO: Replace with actual API call
    // return apiCall(`/inquiries?${new URLSearchParams(options)}`);

    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      inquiries: [],
      total: 0
    };
  }
};

// Export all APIs
export default {
  product: productAPI,
  category: categoryAPI,
  inquiry: inquiryAPI
};
