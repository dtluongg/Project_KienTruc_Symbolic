import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AllProductsPage from './pages/AllProductsPage';
import TestProduct from './test/TestProduct';
import Auth from './pages/Auth';

// Import custom CSS
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#0f111a] text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/products" element={<AllProductsPage />} />
            <Route path="/test" element={<TestProduct />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 