import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, ProductProvider } from './contexts';
import { ProtectedRoute, ScrollToTop } from './components';
import { AdminLayout } from './layouts';
import { Home, Products, ProductDetail, CategoryProducts, Gallery, About, Contact, QuoteRequest, Downloads } from './pages';
import HomeElectrical from './pages/HomeElectrical';
import { Login, Dashboard, ProductsList, ProductForm, CategoriesList, CategoryForm, Inquiries } from './admin/pages';
import './styles/index.css';

// 404 Not Found Component
const NotFound = () => (
  <div className="page-not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home-v2" element={<HomeElectrical />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/products/category/:slug" element={<CategoryProducts />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quote" element={<QuoteRequest />} />
            <Route path="/downloads" element={<Downloads />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="categories" element={<CategoriesList />} />
              <Route path="categories/new" element={<CategoryForm />} />
              <Route path="categories/edit/:id" element={<CategoryForm />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="settings" element={<div className="admin-placeholder">Settings Page - Coming Soon</div>} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
