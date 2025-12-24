
import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import { UserAddress, CreateAddressRequest, UpdateAddressRequest, AddressResponse } from '../../domain/entities/auth';

/**
 * SRP: Handles user address management only
 */
export class AddressService {
    static async getAddresses(): Promise<AddressResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, message: 'Addresses retrieved successfully', address: data?.[0] };
        } catch (error) {
            log.error('Get addresses error', error);
            return { success: false, message: 'Failed to retrieve addresses', error: { code: 'GET_ADDRESSES_ERROR', message: 'Failed to retrieve addresses' } };
        }
    }

    static async getAllAddresses(): Promise<{ success: boolean; addresses: UserAddress[]; error?: any }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, addresses: [], error: 'User not authenticated' };
            }

            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, addresses: data || [] };
        } catch (error) {
            log.error('Get all addresses error', error);
            return { success: false, addresses: [], error };
        }
    }

    static async createAddress(addressData: CreateAddressRequest): Promise<AddressResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
            }

            if (addressData.isDefault) {
                await supabase
                    .from('user_addresses')
                    .update({ is_default: false })
                    .eq('user_id', user.id)
                    .eq('type', addressData.type);
            }

            const { data, error } = await supabase
                .from('user_addresses')
                .insert({
                    user_id: user.id,
                    type: addressData.type,
                    is_default: addressData.isDefault || false,
                    first_name: addressData.firstName,
                    last_name: addressData.lastName,
                    company: addressData.company,
                    address_line_1: addressData.addressLine1,
                    address_line_2: addressData.addressLine2,
                    city: addressData.city,
                    state_province: addressData.stateProvince,
                    postal_code: addressData.postalCode,
                    country: addressData.country,
                    phone: addressData.phone
                })
                .select()
                .single();

            if (error) throw error;

            return { success: true, message: 'Address created successfully', address: data };
        } catch (error) {
            log.error('Create address error', error, { addressData });
            return { success: false, message: 'Failed to create address', error: { code: 'CREATE_ADDRESS_ERROR', message: 'Failed to create address' } };
        }
    }

    static async updateAddress(addressData: UpdateAddressRequest): Promise<AddressResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
            }

            if (addressData.isDefault) {
                await supabase
                    .from('user_addresses')
                    .update({ is_default: false })
                    .eq('user_id', user.id)
                    .eq('type', addressData.type)
                    .neq('id', addressData.id);
            }

            const updateData: any = {};
            if (addressData.firstName) updateData.first_name = addressData.firstName;
            if (addressData.lastName) updateData.last_name = addressData.lastName;
            if (addressData.company) updateData.company = addressData.company;
            if (addressData.addressLine1) updateData.address_line_1 = addressData.addressLine1;
            if (addressData.addressLine2) updateData.address_line_2 = addressData.addressLine2;
            if (addressData.city) updateData.city = addressData.city;
            if (addressData.stateProvince) updateData.state_province = addressData.stateProvince;
            if (addressData.postalCode) updateData.postal_code = addressData.postalCode;
            if (addressData.country) updateData.country = addressData.country;
            if (addressData.phone !== undefined) updateData.phone = addressData.phone;
            if (addressData.isDefault !== undefined) updateData.is_default = addressData.isDefault;
            if (addressData.type) updateData.type = addressData.type;

            const { data, error } = await supabase
                .from('user_addresses')
                .update(updateData)
                .eq('id', addressData.id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            return { success: true, message: 'Address updated successfully', address: data };
        } catch (error) {
            log.error('Update address error', error, { addressData });
            return { success: false, message: 'Failed to update address', error: { code: 'UPDATE_ADDRESS_ERROR', message: 'Failed to update address' } };
        }
    }

    static async deleteAddress(id: string): Promise<AddressResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
            }

            const { error } = await supabase
                .from('user_addresses')
                .update({ is_deleted: true, deleted_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            return { success: true, message: 'Address deleted successfully' };
        } catch (error) {
            log.error('Delete address error', error, { id });
            return { success: false, message: 'Failed to delete address', error: { code: 'DELETE_ADDRESS_ERROR', message: 'Failed to delete address' } };
        }
    }

    static async setDefaultAddress(id: string, type: 'billing' | 'shipping' | 'both' = 'shipping'): Promise<AddressResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
            }

            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .eq('type', type);

            const { data, error } = await supabase
                .from('user_addresses')
                .update({ is_default: true })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            return { success: true, message: 'Default address set successfully', address: data };
        } catch (error) {
            log.error('Set default address error', error, { id, type });
            return { success: false, message: 'Failed to set default address', error: { code: 'SET_DEFAULT_ADDRESS_ERROR', message: 'Failed to set default address' } };
        }
    }
}
