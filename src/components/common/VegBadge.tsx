import React from 'react';

interface VegBadgeProps {
  isVeg: boolean;
  showText?: boolean;
  size?: 'sm' | 'md';
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVeg, showText = false, size = 'md' }) => {
  const boxDim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const dotDim = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className="inline-flex items-center gap-1.5 select-none" title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
      <span
        className={`inline-flex items-center justify-center border ${boxDim} rounded-xs ${
          isVeg ? 'border-emerald-700 bg-emerald-50/40' : 'border-amber-900 bg-amber-50/40'
        }`}
        aria-label={isVeg ? 'Vegetarian mark' : 'Non-Vegetarian mark'}
      >
        <span
          className={`rounded-full ${dotDim} ${
            isVeg ? 'bg-emerald-600' : 'bg-amber-900'
          }`}
        />
      </span>
      {showText && (
        <span className={`text-[11px] font-medium tracking-tight ${isVeg ? 'text-emerald-800' : 'text-amber-950'}`}>
          {isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      )}
    </span>
  );
};
