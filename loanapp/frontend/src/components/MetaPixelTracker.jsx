import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * MetaPixelTracker component listens to React Router route changes
 * and sends PageView events to Meta Pixel on every navigation.
 */
export const MetaPixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, location.search]);

  return null;
};
