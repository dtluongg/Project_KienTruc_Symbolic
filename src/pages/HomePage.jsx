import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import { FiTruck, FiRefreshCw, FiHeadphones, FiCreditCard } from 'react-icons/fi';

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
    <div className="home">
      <Hero />
      <Categories />
      <FeaturedProducts />
      
      <section className="features py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="text-center">
                  <div className="feature-icon bg-primary text-white rounded-circle p-3 d-inline-flex mb-3">
                    {feature.icon}
                  </div>
                  <h5 className="mb-2">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <h3 className="mb-4">Đăng ký nhận thông tin</h3>
              <p className="text-muted mb-4">
                Đăng ký để nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và các sự kiện độc quyền.
              </p>
              <form className="d-flex gap-2">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Nhập địa chỉ email của bạn"
                />
                <button type="submit" className="btn btn-primary">
                  Đăng ký
                </button>
              </form>
              <p className="small text-muted mt-3">
                Chúng tôi tôn trọng quyền riêng tư của bạn và sẽ không bao giờ chia sẻ thông tin của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 