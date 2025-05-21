export class BannerService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllBanners() {
    try {
      const banners = await this.repository.getAll();
      return banners;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách banner: ${error.message}`);
    }
  }

  async getBannerById(id) {
    try {
      const banner = await this.repository.getById(id);
      if (!banner) {
        throw new Error('Không tìm thấy banner');
      }
      return banner;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin banner: ${error.message}`);
    }
  }

  async createBanner(bannerData) {
    try {
      const newBanner = await this.repository.create(bannerData);
      return newBanner;
    } catch (error) {
      throw new Error(`Lỗi khi tạo banner: ${error.message}`);
    }
  }

  async updateBanner(id, bannerData) {
    try {
      const updatedBanner = await this.repository.update(id, bannerData);
      return updatedBanner;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật banner: ${error.message}`);
    }
  }

  async deleteBanner(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa banner: ${error.message}`);
    }
  }
} 