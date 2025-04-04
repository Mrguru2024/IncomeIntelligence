import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2Icon, XIcon } from "lucide-react";

interface VanillaModalProps {
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  children: React.ReactNode;
  isSubmitting?: boolean;
}

const VanillaModal: React.FC<VanillaModalProps> = ({ 
  title, 
  onClose, 
  onSubmit, 
  children, 
  isSubmitting = false 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // When the modal mounts, show it
    const modal = modalRef.current;
    if (modal) {
      // Add Modal styles and show it
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    // Cleanup when unmounting
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const closeModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    
    const modal = modalRef.current;
    if (modal) {
      modal.style.display = 'none';
      onClose();
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    if (onSubmit) {
      onSubmit();
    }
  };

  // Close modal when clicking outside the content
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current && !isSubmitting) {
      closeModal();
    }
  };

  return (
    <div 
      ref={modalRef} 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] px-4" 
      onClick={handleOverlayClick}
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        className="bg-card-background rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative z-[210]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button 
            onClick={closeModal} 
            className="text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted-background transition-colors"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          {children}
        </div>
        
        <div className="flex justify-end items-center space-x-3 px-6 py-4 border-t border-border bg-muted-background">
          <Button 
            variant="outline" 
            onClick={closeModal}
            disabled={isSubmitting}
            className="text-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VanillaModal;