import React from "react";

interface StackrLogoProps {
  className?: string;
  showText?: boolean;
}

const StackrLogo: React.FC<StackrLogoProps> = ({
  className = "",
  showText = true,
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-[#233D4D] p-1 rounded">
        <img
          src="/Untitled design (3).svg"
          alt="Stackr Logo"
          className="h-10 w-auto"
        />
      </div>
      {showText && (
        <div className="ml-3">
          <h1 className="text-2xl font-semibold text-foreground">Stackr</h1>
          <p className="text-sm text-muted-foreground">
            Track what matters. Earn with clarity.
          </p>
        </div>
      )}
    </div>
  );
};

export default StackrLogo;
