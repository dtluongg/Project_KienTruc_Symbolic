import StatsRepository from '../../data/repositories/StatsRepository';

export class StatsService {
    constructor(repository = new StatsRepository()) {
        this.repository = repository;
    }

    async getDashboardStats() {
        try {
            const [
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenueAllOrders,
                totalRevenuePendingOrders,
                totalRevenueProcessingOrders,
                totalRevenueCompletedOrders,
                totalRevenueCancelledOrders
            ] = await Promise.all([
                this.repository.getTotalUsers(),
                this.repository.getTotalProducts(),
                this.repository.getTotalOrders(),
                this.repository.getTotalRevenueAllOrders(),
                this.repository.getTotalRevenuePendingOrders(),
                this.repository.getTotalRevenueProcessingOrders(),
                this.repository.getTotalRevenueCompletedOrders(),
                this.repository.getTotalRevenueCancelledOrders()
            ]);
            return {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenueAllOrders,
                totalRevenuePendingOrders,
                totalRevenueProcessingOrders,
                totalRevenueCompletedOrders,
                totalRevenueCancelledOrders
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê dashboard: ${error.message}`);
        }
    }

    async getStats() {
        try {
            const stats = await this.repository.getStats();
            return stats;
        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê: ${error.message}`);
        }
    }
}

export default StatsService; 