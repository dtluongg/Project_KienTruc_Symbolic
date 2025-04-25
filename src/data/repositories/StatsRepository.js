import { supabase } from '../../infrastructure/config/supabase';
import IStatsRepository from '../interfaces/IStatsRepository';

export default class StatsRepository extends IStatsRepository {
    async getTotalUsers() {
        const { data: users } = await supabase
            .from('profiles')
            .select('*');
        return users?.length || 0;
    }

    async getTotalProducts() {
        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        return count || 0;
    }

    async getTotalOrders() {
        const { data: orders } = await supabase
            .from('orders')
            .select('*');
        return orders?.length || 0;
    }

    async getTotalRevenue() {
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount');
        return orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    }
} 