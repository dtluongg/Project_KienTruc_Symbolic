import { supabase } from '../../infrastructure/config/supabase';
import IStatsRepository from '../interfaces/IStatsRepository';

export default class StatsRepository extends IStatsRepository {
    async getTotalUsers() {
        try {
            console.log('Fetching users from Supabase...');
            const { data, error } = await supabase
                .from('profiles')
                .select('*');
            
            console.log('Raw Supabase response:', data);
            
            if (error) {
                console.error('Error fetching users:', error);
                return 0;
            }
            
            // Đếm tất cả các user, bao gồm cả manager và customer
            const userCount = data?.length || 0;
            console.log('Total users found:', userCount);
            console.log('Users:', data?.map(user => ({
                id: user.id,
                role: user.role,
                full_name: user.full_name
            })));
            
            return userCount;
        } catch (error) {
            console.error('Error in getTotalUsers:', error);
            return 0;
        }
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