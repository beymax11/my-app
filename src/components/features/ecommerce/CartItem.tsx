"use client";

import React from 'react';
import { Icon } from '@iconify/react';
import { formatCurrency } from '../../../utils/helpers/format';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  material?: string;
  isSale?: boolean;
  isNew?: boolean;
}

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      onRemoveItem(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  // Use a placeholder image if no image is provided
  const itemImage = item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';

  return (
    <div className="flex items-start p-4 border-b border-gray-100 bg-white relative" style={{ scrollSnapAlign: 'start' }}>
      <div className="w-24 h-24 flex-shrink-0 mr-4 bg-white flex items-center justify-center rounded-lg border border-gray-100">
        <img src={itemImage} alt={item.name} className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div>
          <p className="font-bold text-base lg:text-lg text-black hover:text-orange-500 transition-colors cursor-pointer">{item.name}</p>
          <p className="text-gray-700 mt-1 text-sm lg:text-base">{formatCurrency(item.price)}{item.quantity === 10 ? '/10 pieces' : ''}</p>
          {item.size && (
            <p className="text-sm text-gray-500">Size: {item.size}</p>
          )}
          {item.color && (
            <p className="text-sm text-gray-500">Color: {item.color}</p>
          )}
          {item.material && (
            <p className="text-sm text-gray-500">Material: {item.material}</p>
          )}
          {item.isSale && (
            <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-1 mt-2 mr-2">SALE</span>
          )}
          {item.isNew && (
            <span className="inline-block bg-green-600 text-white text-xs font-bold px-2 py-1 mt-2">NEW</span>
          )}
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center mt-4 space-y-4 lg:space-y-0">
          <div className="flex items-center border border-gray-300 overflow-hidden">
            <button onClick={() => handleQuantityChange(Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
              <Icon icon="mdi:minus" width="20" height="20" />
            </button>
            <span className="w-8 text-center text-black font-medium">{item.quantity}</span>
            <button onClick={() => handleQuantityChange(Math.min(10, item.quantity + 1))} className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
              <Icon icon="mdi:plus" width="20" height="20" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between ml-2 min-h-[96px]" style={{ minHeight: '96px' }}>
        <div>
          <p className="font-semibold text-base lg:text-lg text-black">{formatCurrency(item.price * item.quantity)}</p>
          {item.originalPrice && (
            <p className="text-sm text-gray-500 line-through">
              {item.originalPrice !== undefined ? formatCurrency(item.originalPrice * item.quantity) : ''}
            </p>
          )}
        </div>
        <div className="flex-grow"></div>
        <div className="absolute bottom-2 right-2 flex flex-row space-x-2 items-end z-10">
          <button onClick={() => onRemoveItem(item.id)} className="text-black hover:text-red-500 transition-colors flex items-center p-2" aria-label="Remove">
            <Icon icon="mdi:delete-outline" width="22" height="22" className="lg:w-6 lg:h-6 w-[22px] h-[22px]" />
          </button>
          <button className="text-black hover:text-red-500 transition-colors flex items-center p-2" aria-label="Save for later">
            <Icon icon="mdi:heart-outline" width="22" height="22" className="lg:w-6 lg:h-6 w-[22px] h-[22px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
