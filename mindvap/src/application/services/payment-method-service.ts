
import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import {
    GetPaymentMethodsResponse,
    CreatePaymentMethodRequest,
    CreatePaymentMethodResponse,
    DeletePaymentMethodResponse,
    SetDefaultPaymentMethodResponse
} from '../../domain/entities/auth';

/**
 * SRP: Handles user payment methods only
 */
export class PaymentMethodService {
    static async getPaymentMethods(): Promise<GetPaymentMethodsResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated', paymentMethods: [] };
            }

            const { data, error } = await supabase
                .from('user_payment_methods')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, paymentMethods: data || [] };
        } catch (error) {
            log.error('Get payment methods error', error);
            return { success: false, message: 'Failed to retrieve payment methods', paymentMethods: [] };
        }
    }

    static async createPaymentMethod(paymentData: CreatePaymentMethodRequest): Promise<CreatePaymentMethodResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            const { data, error } = await supabase
                .from('user_payment_methods')
                .insert({
                    user_id: user.id,
                    type: paymentData.type,
                    last4: paymentData.cardNumber.slice(-4),
                    brand: 'Visa', // This would come from Stripe
                    exp_month: paymentData.expMonth,
                    exp_year: paymentData.expYear,
                    is_default: paymentData.isDefault || false,
                    stripe_payment_method_id: `pm_mock_${Date.now()}`
                })
                .select()
                .single();

            if (error) throw error;

            return { success: true, message: 'Payment method created successfully', paymentMethod: data };
        } catch (error) {
            log.error('Create payment method error', error, { paymentData });
            return { success: false, message: 'Failed to create payment method' };
        }
    }

    static async deletePaymentMethod(id: string): Promise<DeletePaymentMethodResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            const { error } = await supabase
                .from('user_payment_methods')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            return { success: true, message: 'Payment method deleted successfully' };
        } catch (error) {
            log.error('Delete payment method error', error, { id });
            return { success: false, message: 'Failed to delete payment method' };
        }
    }

    static async setDefaultPaymentMethod(id: string): Promise<SetDefaultPaymentMethodResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            await supabase
                .from('user_payment_methods')
                .update({ is_default: false })
                .eq('user_id', user.id);

            const { data, error } = await supabase
                .from('user_payment_methods')
                .update({ is_default: true })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            return { success: true, message: 'Default payment method set successfully' };
        } catch (error) {
            log.error('Set default payment method error', error, { id });
            return { success: false, message: 'Failed to set default payment method' };
        }
    }
}
