import StatsRepository from '../../data/repositories/StatsRepository';

export default class StatsService {
    constructor() {
        this.statsRepository = new StatsRepository();
    }

    async getDashboardStats() {
        try {
            const [totalUsers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
                this.statsRepository.getTotalUsers(),
                this.statsRepository.getTotalProducts(),
                this.statsRepository.getTotalOrders(),
                this.statsRepository.getTotalRevenue()
            ]);

            return {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue
            };
        } catch (error) {
            console.error('Error in StatsService:', error);
            throw error;
        }
    }
} 