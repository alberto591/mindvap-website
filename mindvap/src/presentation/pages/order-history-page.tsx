// Order History Page
// User order history with pagination and details

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AccountService } from '../../application/services/account-service';
import { Order, GetOrdersRequest } from '../../domain/entities/auth';
import AccountLayout from '../components/account/account-layout';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<GetOrdersRequest>({
    page: 1,
    limit: 10,
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await AccountService.getOrders(filters);

      if (response.success) {
        setOrders(response.orders);
        setPagination(response.pagination);
      } else {
        setMessage({ type: 'error', text: 'Failed to load orders' });
      }
    } catch (error) {
      console.error('Load orders error:', error);
      setMessage({ type: 'error', text: 'An error occurred while loading orders' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters: Partial<GetOrdersRequest>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && orders.length === 0) {
    return (
      <AccountLayout title="Order History">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Order History">
      <div className="p-6">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            <div className="flex">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {message.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              {message.text}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="createdAt">Order Date</option>
                <option value="total">Total Amount</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value as any })}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
              <select
                value={filters.limit || 10}
                onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status || filters.page !== 1
                ? 'Try adjusting your filters to see more orders.'
                : 'You haven\'t placed any orders yet.'
              }
            </p>
            {!filters.status && filters.page === 1 && (
              <div className="mt-6">
                <Link
                  to="/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Order Date:</span>
                          <br />
                          {formatDate(order.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span>
                          <br />
                          {formatCurrency(order.total)}
                        </div>
                        <div>
                          <span className="font-medium">Items:</span>
                          <br />
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="mt-4">
                        <div className="flex items-center space-x-4">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              {item.productImage && (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  loading="lazy"
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <span className="text-sm text-gray-700 truncate max-w-32">
                                {item.productName}
                              </span>
                              {order.items.length > 3 && item.id === order.items[2].id && (
                                <span className="text-sm text-gray-500">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link
                        to={`/account/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        View Details
                      </Link>

                      {order.status === 'delivered' && (
                        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                          Reorder
                        </button>
                      )}

                      {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && (
                        <a
                          href={`https://track.aftership.com/${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Track Order
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 border rounded-md text-sm font-medium ${pageNum === pagination.page
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AccountLayout>
  );
};

export default OrderHistoryPage;