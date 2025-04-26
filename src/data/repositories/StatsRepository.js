import { supabase } from '../../infrastructure/config/supabase';
import IStatsRepository from '../interfaces/IStatsRepository';

export default class StatsRepository extends IStatsRepository {
    async getTotalUsers() {
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        return count || 0;
    }

    async getTotalProducts() {
        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        return count || 0;
    }

    async getTotalOrders() {
        const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
        return count || 0;
    }

    async getTotalRevenueAllOrders() {
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
        return orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    }

    async getTotalRevenuePendingOrders() {
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'Pending');
        return orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    }

    async getTotalRevenueProcessingOrders() {
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'Processing');
        return orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    }

    async getTotalRevenueCompletedOrders() {
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'Completed');
        return orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    }

    async getTotalRevenueCancelledOrders() {
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'Cancelled');
        return orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    }
} 