import { createContext, useContext, useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services';

const ProductContext = createContext(null);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({ limit: 1000 }),
        categoryAPI.getAll()
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get all products
  const getAllProducts = () => products;

  // Get product by ID
  const getProductById = (id) => {
    return products.find(product => product.id === id || product.slug === id);
  };

  // Get products by category (supports both old categoryId and new categories array)
  const getProductsByCategory = (categoryId) => {
    return products.filter(product => {
      // Check new junction table format first
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.some(pc => pc.categoryId === categoryId || pc.category?.id === categoryId);
      }
      // Fall back to old direct categoryId
      return product.categoryId === categoryId;
    });
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return categories.find(category => category.id === id || category.slug === id);
  };

  // Get all categories
  const getAllCategories = () => categories;

  // Get featured products
  const getFeaturedProducts = () => {
    return products.filter(product => product.isFeatured || product.featured);
  };

  // Search products
  const searchProducts = (query) => {
    const searchTerm = query.toLowerCase();
    return products.filter(product =>
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.code?.toLowerCase().includes(searchTerm)
    );
  };

  // Refresh data from API
  const refreshData = () => fetchData();

  // Admin functions - these now call API and refresh data
  const addProduct = async (product) => {
    try {
      const result = await productAPI.create(product);
      await fetchData(); // Refresh data
      return result.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const result = await productAPI.update(id, updates);
      await fetchData(); // Refresh data
      return result.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productAPI.delete(id);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addCategory = async (category) => {
    try {
      const result = await categoryAPI.create(category);
      await fetchData(); // Refresh data
      return result.data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      const result = await categoryAPI.update(id, updates);
      await fetchData(); // Refresh data
      return result.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryAPI.delete(id);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const value = {
    products,
    categories,
    loading,
    refreshData,
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getCategoryById,
    getAllCategories,
    getFeaturedProducts,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
