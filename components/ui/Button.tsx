
import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon';
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false, 
  disabled,
  ...props 
}: ButtonProps) => {
  // Added: hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out
  const baseStyle = "px-6 py-3 font-medium text-sm transition-all duration-200 ease-in-out flex items-center justify-center gap-2 active:scale-95 hover:scale-105 disabled:hover:scale-100 disabled:active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#66E91E] text-black hover:bg-[#5cd41b] border-none shadow-lg hover:shadow-xl rounded-full font-bold",
    secondary: "bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl rounded-full",
    outline: "border border-gray-200 text-gray-600 bg-white hover:border-black hover:text-black rounded-full",
    ghost: "text-gray-500 hover:text-black bg-transparent hover:bg-gray-50 rounded-full",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 rounded-full",
    icon: "p-2 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm rounded text-gray-700"
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};
