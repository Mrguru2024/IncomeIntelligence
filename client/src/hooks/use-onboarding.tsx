import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  showOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if onboarding has been completed before
    const onboardingStatus = localStorage.getItem('onboardingComplete');
    if (onboardingStatus === 'true') {
      setIsOnboardingComplete(true);
    } else {
      // If this is the first visit, show onboarding after a slight delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setIsOnboardingComplete(true);
    setShowOnboarding(false);
    toast({
      title: 'Setup complete!',
      description: 'Your dashboard is ready to use.',
    });
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    setIsOnboardingComplete(false);
    setShowOnboarding(true);
    toast({
      title: 'Onboarding reset',
      description: 'You can now go through the setup process again.',
    });
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        showOnboarding,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};