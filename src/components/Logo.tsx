'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full shadow-lg`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-3/4 h-3/4 text-white"
          fill="currentColor"
        >
          {/* Chart bars */}
          <rect x="15" y="60" width="12" height="25" rx="2" />
          <rect x="35" y="45" width="12" height="40" rx="2" />
          <rect x="55" y="30" width="12" height="55" rx="2" />
          
          {/* Leaf/Growth element */}
          <path 
            d="M75 45 Q85 35 95 45 Q85 55 75 45 Z" 
            className="opacity-90"
          />
          <path 
            d="M75 45 Q80 50 85 55 Q75 60 70 55 Q75 50 75 45 Z" 
            className="opacity-80"
          />
        </svg>
      </div>
      
      {/* App Name */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-gray-800 ${textSizeClasses[size]} leading-none`}>
            खर्चा
          </h1>
          {size !== 'sm' && (
            <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
              Finance Tracker
            </span>
          )}
        </div>
      )}
    </div>
  );
}
