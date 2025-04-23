import { useEffect, useState, useCallback, useRef } from 'react';
import { BannerService } from '../../business/services/bannerService';
import { BannerRepository } from '../../data/repositories/bannerRepository';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const bannerRepository = new BannerRepository();
        const bannerService = new BannerService(bannerRepository);
        const bannerData = await bannerService.getAllBanners();
        
        if (bannerData && bannerData.length > 0) {
          console.log("Đã tải được", bannerData.length, "banner");
          setBanners(bannerData);
        } else {
          console.warn("Không có dữ liệu banner trả về");
        }
        
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy banner:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto play
  useEffect(() => {
    if (banners.length > 0 && isAutoPlaying) {
      timerRef.current = setInterval(goToNext, 5000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [banners.length, isAutoPlaying, goToNext]);

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Đã xảy ra lỗi: {error}</p>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="text-center p-4">
        <p>Không có banner nào để hiển thị</p>
      </div>
    );
  }

  // Tính toán tỷ lệ khung hình: chiều cao / chiều rộng
  const aspectRatio = 685 / 1875; // Khoảng 0.365
  const bannerHeight = Math.min(window.innerWidth * aspectRatio, 685);

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gray-100"
      style={{ 
        height: `${bannerHeight}px`,
        maxHeight: '685px'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="absolute top-0 left-0 w-full h-full flex transition-transform duration-500 ease-out"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${banners.length * 100}%`
        }}
      >
        {banners.map((banner) => (
          <div
            key={banner.banner_id}
            className="relative w-full h-full flex-shrink-0 flex items-center justify-center"
          >
            <img
              src={banner.image_url}
              alt={banner.title || "Banner"}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              draggable="false"
              onError={(e) => {
                console.error(`Lỗi khi tải hình: ${banner.image_url}`);
                e.target.src = "https://placehold.co/1875x685/EAEAEA/CCCCCC?text=Banner+Image+Error";
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/75 z-10"
            aria-label="Previous banner"
          >
            <FiChevronLeft className="w-6 h-6 text-black" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/75 z-10"
            aria-label="Next banner"
          >
            <FiChevronRight className="w-6 h-6 text-black" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/75 ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Banner; 