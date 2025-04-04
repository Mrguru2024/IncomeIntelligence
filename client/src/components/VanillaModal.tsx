import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface VanillaModalProps {
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  children: React.ReactNode;
}

const VanillaModal: React.FC<VanillaModalProps> = ({ title, onClose, onSubmit, children }) => {
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
    const modal = modalRef.current;
    if (modal) {
      modal.style.display = 'none';
      onClose();
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
    closeModal();
  };

  // Close modal when clicking outside the content
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  return (
    <div 
      ref={modalRef} 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" 
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button 
            onClick={closeModal} 
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>
        
        <div className="mb-4">
          {children}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VanillaModal;