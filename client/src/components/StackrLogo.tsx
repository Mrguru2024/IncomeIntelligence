import React from "react";

interface StackrLogoProps {
  className?: string;
  showText?: boolean;
}

const StackrLogo: React.FC<StackrLogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/stackr-logo-vector.svg" 
        alt="Stackr Logo" 
        className="h-12 w-auto" 
      />
      {showText && (
        <div className="ml-3">
          <h1 className="text-2xl font-semibold text-foreground">Stackr</h1>
          <p className="text-sm text-muted-foreground">40/30/30 Income Manager</p>
        </div>
      )}
    </div>
  );
};

export default StackrLogo;