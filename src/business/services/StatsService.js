import StatsRepository from '../../data/repositories/StatsRepository';

export default class StatsService {
    constructor() {
        this.statsRepository = new StatsRepository();
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
                this.statsRepository.getTotalUsers(),
                this.statsRepository.getTotalProducts(),
                this.statsRepository.getTotalOrders(),
                this.statsRepository.getTotalRevenueAllOrders(),
                this.statsRepository.getTotalRevenuePendingOrders(),
                this.statsRepository.getTotalRevenueProcessingOrders(),
                this.statsRepository.getTotalRevenueCompletedOrders(),
                this.statsRepository.getTotalRevenueCancelledOrders()
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
            console.error('Error in StatsService:', error);
            throw error;
        }
    }
} 