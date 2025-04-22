import React from "react";

interface StackrLogoProps {
  className?: string;
  showText?: boolean;
}

const StackrLogo: React.FC<StackrLogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {showText ? (
        <>
          <h1 className="text-2xl font-bold m-0" style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Stackr
          </h1>
          <span className="text-xs font-bold ml-2 py-1 px-2 rounded" style={{
            background: 'linear-gradient(135deg, #34A853 0%, #2E8545 100%)',
            color: 'white'
          }}>
            GREEN
          </span>
        </>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L14 6H20V18H4V6H10L12 4Z" fill="currentColor" />
          <path d="M12 4L14 6H20V18H4V6H10L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 10L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 14L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

export default StackrLogo;