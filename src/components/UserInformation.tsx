import React, { useState, useEffect } from 'react';
import useAppStore, { AddressData } from '../store';

interface UserInformationProps {
  onAddressChange: (address: AddressData) => void;
  className?: string;
}

const UserInformation: React.FC<UserInformationProps> = ({ 
  onAddressChange, 
  className = '' 
}) => {
  const { setAddressData: setStoreAddressData, addressData: storeAddressData } = useAppStore();
  
  const [addressData, setAddressData] = useState<AddressData>(
    storeAddressData ?? {
      name: '',
      email: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Australia'
    }
  );

  // Effect to sync with store when store address data changes
  useEffect(() => {
    if (storeAddressData) {
      setAddressData(storeAddressData);
    }
  }, [storeAddressData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newAddress = { ...addressData, [name]: value };
    setAddressData(newAddress);
    
    // Only update parent and store if we have enough data for shipping calculation
    if (newAddress.city && newAddress.state && newAddress.postalCode) {
      // Update via props (for backward compatibility)
      onAddressChange(newAddress);
      // Update store
      setStoreAddressData(newAddress);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={addressData.name || ''}
          onChange={handleChange}
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={addressData.email || ''}
          onChange={handleChange}
          placeholder="john@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={addressData.street}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="123 Main St"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={addressData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brisbane"
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            id="state"
            name="state"
            value={addressData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select State</option>
            <option value="QLD">Queensland</option>
            <option value="NSW">New South Wales</option>
            <option value="VIC">Victoria</option>
            <option value="SA">South Australia</option>
            <option value="WA">Western Australia</option>
            <option value="TAS">Tasmania</option>
            <option value="NT">Northern Territory</option>
            <option value="ACT">Australian Capital Territory</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={addressData.postalCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="4000"
          />
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={addressData.country}
            onChange={handleChange}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">Currently serving Australia only</p>
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md mt-4">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-700">
            Adding your address will provide more accurate delivery time estimates. All shipping is from our Brisbane workshop.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInformation; 