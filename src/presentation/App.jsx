import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AllProductsPage from './pages/AllProductsPage';
import TestProduct from '../test/TestProduct';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { UserProvider } from './context/UserContext';

// Import custom CSS
import './styles/main.css';

function App() {
  return (
    <Router>
      <UserProvider>
        <div className="flex flex-col min-h-screen bg-[#0f111a] text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/products" element={<AllProductsPage />} />
              <Route path="/test" element={<TestProduct />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </UserProvider>
    </Router>
  );
}

export default App; 