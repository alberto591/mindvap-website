import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit3, Check, Home } from 'lucide-react';
import { ShippingAddress } from '../../services/calculation-service';

interface UserAddress {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

interface AddressSelectorProps {
  selectedAddress: ShippingAddress | null;
  onAddressSelect: (address: ShippingAddress) => void;
  onAddNew: () => void;
  onEdit: (address: UserAddress) => void;
  userId: string;
}

export default function AddressSelector({
  selectedAddress,
  onAddressSelect,
  onAddNew,
  onEdit,
  userId
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock addresses for demo - in real implementation, fetch from Supabase
  const mockAddresses: UserAddress[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      isDefault: true,
      label: 'Home',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      firstName: 'John',
      lastName: 'Doe',
      address: '456 Oak Avenue',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'US',
      isDefault: false,
      label: 'Office',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadUserAddresses();
  }, [userId]);

  const loadUserAddresses = async () => {
    try {
      setLoading(true);
      // Simulate API call to fetch user addresses
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, fetch from Supabase:
      // const { data, error } = await supabase
      //   .from('user_addresses')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('is_default', { ascending: false });
      
      setAddresses(mockAddresses);
      setError(null);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: UserAddress) => {
    const shippingAddress: ShippingAddress = {
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country
    };
    onAddressSelect(shippingAddress);
  };

  const isSelected = (address: UserAddress): boolean => {
    if (!selectedAddress) return false;
    
    return (
      address.firstName === selectedAddress.firstName &&
      address.lastName === selectedAddress.lastName &&
      address.address === selectedAddress.address &&
      address.city === selectedAddress.city &&
      address.state === selectedAddress.state &&
      address.zipCode === selectedAddress.zipCode &&
      address.country === selectedAddress.country
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-brand" />
          <h2 className="font-serif text-2xl text-text-primary">Shipping Address</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-brand" />
          <h2 className="font-serif text-2xl text-text-primary">Shipping Address</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadUserAddresses}
            className="bg-brand text-white px-6 py-2 rounded-full hover:bg-brand-light"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-brand" />
          <h2 className="font-serif text-2xl text-text-primary">Shipping Address</h2>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 text-brand hover:text-brand-light font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-text-secondary mb-4">No saved addresses found</p>
          <button
            onClick={onAddNew}
            className="bg-brand text-white px-6 py-3 rounded-full hover:bg-brand-light font-semibold"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-text-secondary mb-4">
            Select a saved address or add a new one for this order.
          </p>
          
          {addresses.map(address => (
            <div
              key={address.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-brand-light ${
                isSelected(address) 
                  ? 'border-brand bg-brand-light bg-opacity-10' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Home className="w-3 h-3 mr-1" />
                        Default
                      </span>
                    )}
                    {address.label && (
                      <span className="text-sm font-medium text-brand">
                        {address.label}
                      </span>
                    )}
                    {isSelected(address) && (
                      <Check className="w-5 h-5 text-brand" />
                    )}
                  </div>
                  
                  <div className="text-text-primary">
                    <p className="font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(address);
                  }}
                  className="p-2 text-gray-400 hover:text-brand transition-colors"
                  title="Edit address"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}