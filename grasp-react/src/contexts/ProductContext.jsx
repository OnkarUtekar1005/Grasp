import { createContext, useContext, useState, useEffect } from 'react';
import { productsData, categoriesData } from '../data/products';

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

  useEffect(() => {
    // Load initial data
    // TODO: Replace with API calls
    setProducts(productsData);
    setCategories(categoriesData);
    setLoading(false);
  }, []);

  // Get all products
  const getAllProducts = () => products;

  // Get product by ID
  const getProductById = (id) => {
    return products.find(product => product.id === id || product.slug === id);
  };

  // Get products by category
  const getProductsByCategory = (categoryId) => {
    return products.filter(product => product.categoryId === categoryId);
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return categories.find(category => category.id === id || category.slug === id);
  };

  // Get all categories
  const getAllCategories = () => categories;

  // Get featured products
  const getFeaturedProducts = () => {
    return products.filter(product => product.featured);
  };

  // Search products
  const searchProducts = (query) => {
    const searchTerm = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.code.toLowerCase().includes(searchTerm)
    );
  };

  // Admin functions
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...updates, updatedAt: new Date().toISOString() } : product
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, updates) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === id ? { ...category, ...updates } : category
      )
    );
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const value = {
    products,
    categories,
    loading,
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
