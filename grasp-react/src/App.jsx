import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, ProductProvider } from './contexts';
import { ProtectedRoute, SmoothScroll } from './components';
import { AdminLayout } from './layouts';
import { Home, Products, ProductDetail, Gallery, About, Contact, QuoteRequest, Downloads } from './pages';
import HomeElectrical from './pages/HomeElectrical';
import { Login, Dashboard, ProductsList, ProductForm, CategoriesList, CategoryForm, Inquiries, GalleryList, GalleryForm, DownloadsList, DownloadForm } from './admin/pages';
import './styles/index.css';
import './styles/mobile.css';

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
          <SmoothScroll>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home-v2" element={<HomeElectrical />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
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
              <Route path="gallery" element={<GalleryList />} />
              <Route path="gallery/new" element={<GalleryForm />} />
              <Route path="gallery/edit/:id" element={<GalleryForm />} />
              <Route path="downloads" element={<DownloadsList />} />
              <Route path="downloads/new" element={<DownloadForm />} />
              <Route path="downloads/edit/:id" element={<DownloadForm />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="settings" element={<div className="admin-placeholder">Settings Page - Coming Soon</div>} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </SmoothScroll>
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
