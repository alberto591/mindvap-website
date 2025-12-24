// Address Management Page
// User address management with add, edit, delete, and set default functionality

import React, { useState, useEffect } from 'react';
import { AccountService } from '../services/account-service';
import { UserAddress, CreateAddressRequest, UpdateAddressRequest } from '../types/auth';
import AccountLayout from '../components/account/account-layout';

const AddressManagementPage: React.FC = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<CreateAddressRequest>({
    type: 'shipping',
    isDefault: false,
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'US',
    phone: ''
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await AccountService.getAllAddresses();
      
      if (response.success) {
        setAddresses(response.addresses);
      } else {
        setMessage({ type: 'error', text: 'Failed to load addresses' });
      }
    } catch (error) {
      console.error('Load addresses error:', error);
      setMessage({ type: 'error', text: 'An error occurred while loading addresses' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.addressLine1 || 
        !formData.city || !formData.stateProvince || !formData.postalCode) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      let result;
      
      if (editingAddress) {
        const updateData: UpdateAddressRequest = {
          ...editingAddress,
          ...formData
        };
        result = await AccountService.updateAddress(updateData);
      } else {
        result = await AccountService.createAddress(formData);
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: editingAddress ? 'Address updated successfully' : 'Address added successfully' });
        setShowForm(false);
        setEditingAddress(null);
        resetForm();
        loadAddresses();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save address' });
      }
    } catch (error) {
      console.error('Save address error:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving address' });
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      stateProvince: address.stateProvince,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const result = await AccountService.deleteAddress(id);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Address deleted successfully' });
        loadAddresses();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete address' });
      }
    } catch (error) {
      console.error('Delete address error:', error);
      setMessage({ type: 'error', text: 'An error occurred while deleting address' });
    }
  };

  const handleSetDefault = async (id: string, type: 'billing' | 'shipping' | 'both') => {
    try {
      const result = await AccountService.setDefaultAddress(id, type);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Default address updated' });
        loadAddresses();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to set default address' });
      }
    } catch (error) {
      console.error('Set default address error:', error);
      setMessage({ type: 'error', text: 'An error occurred while setting default address' });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'shipping',
      isDefault: false,
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'US',
      phone: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    resetForm();
  };

  if (loading) {
    return (
      <AccountLayout title="Address Management">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Address Management">
      <div className="p-6">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
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

        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Addresses</h2>
            <p className="text-gray-600 mt-1">Manage your shipping and billing addresses</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add New Address
          </button>
        </div>

        {/* Address Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State/Province *</label>
                      <input
                        type="text"
                        name="stateProvince"
                        value={formData.stateProvince}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="ES">Spain</option>
                        <option value="IT">Italy</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Set as default {formData.type} address
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      {editingAddress ? 'Update Address' : 'Add Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first address.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Add your first address
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {address.firstName} {address.lastName}
                      </h3>
                      {address.isDefault && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.stateProvince} {address.postalCode}</p>
                      <p>{address.country}</p>
                      {address.phone && <p>{address.phone}</p>}
                    </div>
                    
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <div className="flex space-x-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id, address.type)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default AddressManagementPage;