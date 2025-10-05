import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Custom hook to manage navigation state for the dashboard header
 * Handles the logic for showing/hiding the back button based on current route
 */
export function useNavigationState() {
  const pathname = usePathname();
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    const isMainDashboard = pathname === '/';
    const hasHistory = window.history.length > 1;

    setShowBackButton(!isMainDashboard && hasHistory);
  }, [pathname]);

  return { showBackButton };
}
