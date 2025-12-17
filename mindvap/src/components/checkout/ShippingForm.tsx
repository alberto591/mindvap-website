import React, { useState } from 'react';
import { MapPin, Plus, Edit3 } from 'lucide-react';
import { ShippingAddress, CalculationService } from '../../services/calculationService';
import { CartItem } from '../../types';

interface ShippingFormProps {
  cart: CartItem[];
  initialAddress?: ShippingAddress;
  onAddressChange: (address: ShippingAddress) => void;
  onContinue: () => void;
  isLoggedIn?: boolean;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const EUROPEAN_COUNTRIES = [
  { value: 'AD', label: 'Andorra', currency: 'EUR' },
  { value: 'AT', label: 'Austria', currency: 'EUR' },
  { value: 'BE', label: 'Belgium', currency: 'EUR' },
  { value: 'BG', label: 'Bulgaria', currency: 'EUR' },
  { value: 'HR', label: 'Croatia', currency: 'EUR' },
  { value: 'CY', label: 'Cyprus', currency: 'EUR' },
  { value: 'CZ', label: 'Czech Republic', currency: 'EUR' },
  { value: 'DK', label: 'Denmark', currency: 'DKK' },
  { value: 'EE', label: 'Estonia', currency: 'EUR' },
  { value: 'FI', label: 'Finland', currency: 'EUR' },
  { value: 'FR', label: 'France', currency: 'EUR' },
  { value: 'DE', label: 'Germany', currency: 'EUR' },
  { value: 'GR', label: 'Greece', currency: 'EUR' },
  { value: 'HU', label: 'Hungary', currency: 'EUR' },
  { value: 'IE', label: 'Ireland', currency: 'EUR' },
  { value: 'IT', label: 'Italy', currency: 'EUR' },
  { value: 'LV', label: 'Latvia', currency: 'EUR' },
  { value: 'LT', label: 'Lithuania', currency: 'EUR' },
  { value: 'LU', label: 'Luxembourg', currency: 'EUR' },
  { value: 'MT', label: 'Malta', currency: 'EUR' },
  { value: 'NL', label: 'Netherlands', currency: 'EUR' },
  { value: 'PL', label: 'Poland', currency: 'EUR' },
  { value: 'PT', label: 'Portugal', currency: 'EUR' },
  { value: 'RO', label: 'Romania', currency: 'EUR' },
  { value: 'SK', label: 'Slovakia', currency: 'EUR' },
  { value: 'SI', label: 'Slovenia', currency: 'EUR' },
  { value: 'ES', label: 'Spain', currency: 'EUR' },
  { value: 'SE', label: 'Sweden', currency: 'SEK' },
  { value: 'CH', label: 'Switzerland', currency: 'CHF' },
  { value: 'GB', label: 'United Kingdom', currency: 'GBP' },
  { value: 'NO', label: 'Norway', currency: 'NOK' },
  { value: 'IS', label: 'Iceland', currency: 'ISK' }
];

const EUROPEAN_REGIONS = {
  AT: [{ value: 'Wien', label: 'Vienna' }, { value: 'Steiermark', label: 'Styria' }, { value: 'Kärnten', label: 'Carinthia' }],
  BE: [{ value: 'Brussels', label: 'Brussels-Capital Region' }, { value: 'Flanders', label: 'Flanders' }, { value: 'Wallonia', label: 'Wallonia' }],
  BG: [{ value: 'Sofia', label: 'Sofia' }, { value: 'Plovdiv', label: 'Plovdiv' }, { value: 'Varna', label: 'Varna' }],
  HR: [{ value: 'Zagreb', label: 'Zagreb' }, { value: 'Split-Dalmatia', label: 'Split-Dalmatia' }, { value: 'Istria', label: 'Istria' }],
  CY: [{ value: 'Nicosia', label: 'Nicosia' }, { value: 'Limassol', label: 'Limassol' }, { value: 'Larnaca', label: 'Larnaca' }],
  CZ: [{ value: 'Prague', label: 'Prague' }, { value: 'South Bohemian', label: 'South Bohemian' }, { value: 'Moravian-Silesian', label: 'Moravian-Silesian' }],
  DK: [{ value: 'Copenhagen', label: 'Copenhagen' }, { value: 'Aarhus', label: 'Aarhus' }, { value: 'Odense', label: 'Odense' }],
  EE: [{ value: 'Harju', label: 'Harju' }, { value: 'Tartu', label: 'Tartu' }, { value: 'Pärnu', label: 'Pärnu' }],
  FI: [{ value: 'Uusimaa', label: 'Uusimaa' }, { value: 'Pirkanmaa', label: 'Pirkanmaa' }, { value: 'North Ostrobothnia', label: 'North Ostrobothnia' }],
  FR: [{ value: 'Île-de-France', label: 'Île-de-France' }, { value: 'Provence-Alpes-Côte d\'Azur', label: 'Provence-Alpes-Côte d\'Azur' }, { value: 'Auvergne-Rhône-Alpes', label: 'Auvergne-Rhône-Alpes' }],
  DE: [{ value: 'Bavaria', label: 'Bavaria' }, { value: 'North Rhine-Westphalia', label: 'North Rhine-Westphalia' }, { value: 'Baden-Württemberg', label: 'Baden-Württemberg' }],
  GR: [{ value: 'Attica', label: 'Attica' }, { value: 'Central Macedonia', label: 'Central Macedonia' }, { value: 'Crete', label: 'Crete' }],
  HU: [{ value: 'Budapest', label: 'Budapest' }, { value: 'Szabolcs-Szatmár-Bereg', label: 'Szabolcs-Szatmár-Bereg' }, { value: 'Hajdú-Bihar', label: 'Hajdú-Bihar' }],
  IE: [{ value: 'Dublin', label: 'Dublin' }, { value: 'Cork', label: 'Cork' }, { value: 'Galway', label: 'Galway' }],
  IT: [{ value: 'Lombardy', label: 'Lombardy' }, { value: 'Lazio', label: 'Lazio' }, { value: 'Campania', label: 'Campania' }],
  LV: [{ value: 'Riga', label: 'Riga' }, { value: 'Vidzeme', label: 'Vidzeme' }, { value: 'Latgale', label: 'Latgale' }],
  LT: [{ value: 'Vilnius', label: 'Vilnius' }, { value: 'Kaunas', label: 'Kaunas' }, { value: 'Klaipėda', label: 'Klaipėda' }],
  LU: [{ value: 'Luxembourg', label: 'Luxembourg' }],
  MT: [{ value: 'Valletta', label: 'Valletta' }],
  NL: [{ value: 'North Holland', label: 'North Holland' }, { value: 'South Holland', label: 'South Holland' }, { value: 'Utrecht', label: 'Utrecht' }],
  PL: [{ value: 'Masovian', label: 'Masovian' }, { value: 'Silesian', label: 'Silesian' }, { value: 'Greater Poland', label: 'Greater Poland' }],
  PT: [{ value: 'Lisbon', label: 'Lisbon' }, { value: 'Porto', label: 'Porto' }, { value: 'Braga', label: 'Braga' }],
  RO: [{ value: 'Bucharest', label: 'Bucharest' }, { value: 'Cluj', label: 'Cluj' }, { value: 'Timiș', label: 'Timiș' }],
  SK: [{ value: 'Bratislava', label: 'Bratislava' }, { value: 'Košice', label: 'Košice' }, { value: 'Prešov', label: 'Prešov' }],
  SI: [{ value: 'Osrednjeslovenska', label: 'Osrednjeslovenska' }, { value: 'Podravska', label: 'Podravska' }, { value: 'Gorenjska', label: 'Gorenjska' }],
  ES: [{ value: 'Madrid', label: 'Madrid' }, { value: 'Catalonia', label: 'Catalonia' }, { value: 'Andalusia', label: 'Andalusia' }],
  SE: [{ value: 'Stockholm', label: 'Stockholm' }, { value: 'Västra Götaland', label: 'Västra Götaland' }, { value: 'Scania', label: 'Scania' }],
  CH: [{ value: 'Zurich', label: 'Zurich' }, { value: 'Geneva', label: 'Geneva' }, { value: 'Vaud', label: 'Vaud' }],
  GB: [{ value: 'England', label: 'England' }, { value: 'Scotland', label: 'Scotland' }, { value: 'Wales', label: 'Wales' }],
  NO: [{ value: 'Oslo', label: 'Oslo' }, { value: 'Vestland', label: 'Vestland' }, { value: 'Trøndelag', label: 'Trøndelag' }],
  IS: [{ value: 'Capital Region', label: 'Capital Region' }, { value: 'Southern Peninsula', label: 'Southern Peninsula' }, { value: 'Westfjords', label: 'Westfjords' }]
};

export default function ShippingForm({ 
  cart, 
  initialAddress, 
  onAddressChange, 
  onContinue,
  isLoggedIn = false 
}: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>(initialAddress || {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'DE' // Default to Germany for European shipping
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('DE');
  const [availableRegions, setAvailableRegions] = useState<Array<{value: string, label: string}>>([]);

  // Update regions when country changes
  React.useEffect(() => {
    const countryRegions = EUROPEAN_REGIONS[selectedCountry as keyof typeof EUROPEAN_REGIONS] || [];
    setAvailableRegions(countryRegions);
    // Reset state if it doesn't exist in new country
    if (countryRegions.length > 0 && !countryRegions.find(r => r.value === formData.state)) {
      setFormData(prev => ({ ...prev, state: '' }));
    }
  }, [selectedCountry, formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    
    // Handle country change
    if (name === 'country') {
      setSelectedCountry(value);
      updatedData.state = ''; // Reset state when country changes
    }
    
    setFormData(updatedData);
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Update parent component with new address
    onAddressChange(updatedData);
  };

  // Get available regions based on selected country
  const getAvailableRegions = () => {
    if (US_STATES.find(state => state.value === selectedCountry)) {
      return US_STATES;
    }
    return availableRegions;
  };

  // Get postal code validation pattern based on country
  const getPostalCodePattern = () => {
    const europeanCountries = ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI'];
    if (europeanCountries.includes(selectedCountry)) {
      return '[0-9]{4,6}'; // European postal codes (4-6 digits)
    }
    return '[0-9]{5}'; // US ZIP codes (5 digits)
  };

  // Get postal code placeholder based on country
  const getPostalCodePlaceholder = () => {
    const postalCodePlaceholders: Record<string, string> = {
      'DE': '12345',
      'FR': '75001',
      'ES': '28001',
      'IT': '00100',
      'NL': '1012',
      'BE': '1000',
      'AT': '1010',
      'CH': '8001',
      'SE': '11111',
      'NO': '0123',
      'DK': '1000',
      'FI': '00100',
      'GB': 'SW1A 1AA',
      'PL': '00-001',
      'PT': '1000-001'
    };
    return postalCodePlaceholders[selectedCountry] || '12345';
  };

  const validateForm = (): boolean => {
    const validation = CalculationService.validateShippingAddress(formData);
    const newErrors: Record<string, string> = {};

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        // Map error messages to form fields
        if (error.includes('First name')) newErrors.firstName = error;
        if (error.includes('Last name')) newErrors.lastName = error;
        if (error.includes('Street address')) newErrors.address = error;
        if (error.includes('City')) newErrors.city = error;
        if (error.includes('State')) newErrors.state = error;
        if (error.includes('ZIP code')) newErrors.zipCode = error;
        if (error.includes('Country')) newErrors.country = error;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call to save address (for logged-in users)
      if (isLoggedIn) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      onContinue();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = CalculationService.calculateShipping(subtotal, formData);
  const estimatedDelivery = CalculationService.estimateDeliveryDate(formData);

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-6 h-6 text-brand" />
        <h2 className="font-serif text-2xl text-text-primary">Shipping Address</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-text-primary mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your street address"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-text-primary mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your city"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-text-primary mb-2">
              {US_STATES.find(s => s.value === selectedCountry) ? 'State' : 'Region'} *
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select {US_STATES.find(s => s.value === selectedCountry) ? 'State' : 'Region'}</option>
              {getAvailableRegions().map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-text-primary mb-2">
              {selectedCountry === 'GB' ? 'Postcode' : selectedCountry === 'CH' ? 'Postleitzahl' : 'Postal Code'} *
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              pattern={getPostalCodePattern()}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.zipCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={getPostalCodePlaceholder()}
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
            )}
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-2">
              Country *
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <optgroup label="Europe">
                {EUROPEAN_COUNTRIES.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="United States">
                <option value="US">United States</option>
              </optgroup>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>
        </div>

        {/* Shipping Information Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-text-primary mb-3">Shipping Information</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <div className="flex justify-between">
              <span>Shipping Method:</span>
              <span>{shipping === 0 ? 'FREE Standard Shipping' : 'Standard Shipping'}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span>{estimatedDelivery.toLocaleDateString()}</span>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between">
                <span>Shipping Cost:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 border border-gray-300 text-text-primary hover:bg-gray-50 font-semibold rounded-full transition-all"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-brand text-white hover:bg-brand-light font-semibold py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Continue to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}