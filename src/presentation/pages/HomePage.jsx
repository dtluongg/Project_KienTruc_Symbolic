import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import Hero from '../components/Hero';
import { FiTruck, FiRefreshCw, FiHeadphones, FiCreditCard } from 'react-icons/fi';
import ChatBotGeminiAI from '../components/ChatBotGeminiAI/ChatBotGeminiAI';

const features = [
  {
    icon: <FiTruck size={24} />,
    title: 'Miễn phí vận chuyển',
    description: 'Miễn phí vận chuyển cho đơn hàng trên 500.000đ'
  },
  {
    icon: <FiRefreshCw size={24} />,
    title: 'Đổi trả dễ dàng',
    description: 'Đổi trả sản phẩm trong vòng 30 ngày'
  },
  {
    icon: <FiHeadphones size={24} />,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn'
  },
  {
    icon: <FiCreditCard size={24} />,
    title: 'Thanh toán an toàn',
    description: 'Nhiều phương thức thanh toán an toàn'
  }
];

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <ChatBotGeminiAI />
      
      <section className="py-16 bg-[#242731]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-indigo-500 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-content">
          <h3 className="text-3xl font-bold mb-6">Đăng ký nhận thông tin</h3>
          <p className="text-gray-400 mb-8">
            Đăng ký để nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và các sự kiện độc quyền.
          </p>
          <form className="newsletter-form">
            <input
              type="email"
              className="newsletter-input"
              placeholder="Nhập địa chỉ email của bạn"
            />
            <button type="submit" className="newsletter-button">
              Đăng ký
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4">
            Chúng tôi tôn trọng quyền riêng tư của bạn và sẽ không bao giờ chia sẻ thông tin của bạn.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 