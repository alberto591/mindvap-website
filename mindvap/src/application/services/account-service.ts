// Account Service
// Comprehensive service for all account management operations

import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import {
  UserAddress,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderDetailsResponse,
  PaymentMethod,
  CreatePaymentMethodRequest,
  CreatePaymentMethodResponse,
  GetPaymentMethodsResponse,
  DeletePaymentMethodRequest,
  DeletePaymentMethodResponse,
  SetDefaultPaymentMethodRequest,
  SetDefaultPaymentMethodResponse,
  WishlistItem,
  AddWishlistItemRequest,
  AddWishlistItemResponse,
  GetWishlistResponse,
  RemoveWishlistItemRequest,
  RemoveWishlistItemResponse,
  MoveWishlistToCartRequest,
  MoveWishlistToCartResponse,
  UserActivity,
  GetUserActivityRequest,
  GetUserActivityResponse,
  DashboardStats,
  GetDashboardStatsResponse
} from '../../domain/entities/auth';
import { AddressService } from './address-service';
import { PaymentMethodService } from './payment-method-service';
import { WishlistService } from './wishlist-service';
import { OrderHistoryService } from './order-history-service';
import { UserActivityService } from './user-activity-service';
import { AccountDashboardService } from './account-dashboard-service';

export class AccountService {
  // Address Management
  static async getAddresses(): Promise<AddressResponse> {
    return AddressService.getAddresses();
  }

  static async getAllAddresses(): Promise<{ success: boolean; addresses: UserAddress[]; error?: any }> {
    return AddressService.getAllAddresses();
  }

  static async createAddress(addressData: CreateAddressRequest): Promise<AddressResponse> {
    return AddressService.createAddress(addressData);
  }

  static async updateAddress(addressData: UpdateAddressRequest): Promise<AddressResponse> {
    return AddressService.updateAddress(addressData);
  }

  static async deleteAddress(id: string): Promise<AddressResponse> {
    return AddressService.deleteAddress(id);
  }

  static async setDefaultAddress(id: string, type: 'billing' | 'shipping' | 'both'): Promise<AddressResponse> {
    return AddressService.setDefaultAddress(id, type);
  }

  // Order Management
  static async getOrders(request: GetOrdersRequest = {}): Promise<GetOrdersResponse> {
    return OrderHistoryService.getOrders(request);
  }

  static async getOrderDetails(orderId: string): Promise<GetOrderDetailsResponse> {
    return OrderHistoryService.getOrderDetails(orderId);
  }

  static async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    return OrderHistoryService.createOrder(orderData);
  }

  // User Activity
  static async getUserActivity(request: GetUserActivityRequest = {}): Promise<GetUserActivityResponse> {
    return UserActivityService.getUserActivity(request);
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<GetDashboardStatsResponse> {
    return AccountDashboardService.getDashboardStats();
  }

  // Utility method to check if user has required data for orders
  static async validateOrderPrerequisites(): Promise<{ valid: boolean; missing: string[] }> {
    return OrderHistoryService.validateOrderPrerequisites();
  }
}