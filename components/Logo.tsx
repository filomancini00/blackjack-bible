import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
    const sizeMap = {
        sm: { width: 40, height: 40, fontSize: '16px' },
        md: { width: 56, height: 56, fontSize: '24px' },
        lg: { width: 72, height: 72, fontSize: '32px' },
    };

    const dimensions = sizeMap[size];

    return (
        <div
            className={`relative group ${className}`}
            style={{ width: dimensions.width, height: dimensions.height }}
        >
            {/* Animated glow background */}
            <div className="absolute inset-0 bg-gold-gradient rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-glow-pulse" />

            {/* Main card container */}
            <div className="relative w-full h-full bg-gradient-to-br from-gold via-yellow-400 to-gold-dark rounded-xl shadow-gold-glow group-hover:shadow-neon-cyan transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                {/* Neon border effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-neon-cyan/0 group-hover:border-neon-cyan/60 transition-all duration-300" />

                {/* Card content */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* BJ Text */}
                    <div
                        className="font-serif font-black text-casino-dark group-hover:text-neon-cyan transition-colors duration-300"
                        style={{
                            fontSize: dimensions.fontSize,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            letterSpacing: '-0.05em'
                        }}
                    >
                        BJ
                    </div>

                    {/* Small spade accent */}
                    <svg
                        className="absolute bottom-1 right-1 opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                        width={dimensions.width * 0.3}
                        height={dimensions.height * 0.3}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 2C12 2 8 6 8 10C8 12.2091 9.79086 14 12 14C14.2091 14 16 12.2091 16 10C16 6 12 2 12 2Z"
                            fill="currentColor"
                            className="text-casino-dark"
                        />
                        <path
                            d="M12 14C10.8954 14 10 14.8954 10 16V20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20V16C14 14.8954 13.1046 14 12 14Z"
                            fill="currentColor"
                            className="text-casino-dark"
                        />
                    </svg>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/40 rounded-full" />
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white/40 rounded-full" />
                <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-white/40 rounded-full" />
                <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-white/40 rounded-full" />
            </div>
        </div>
    );
};

export default Logo;
