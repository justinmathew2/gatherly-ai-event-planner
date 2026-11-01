/**
 * @file useAriaAnnouncer.tsx
 * @description Screen reader accessibility announcer providing polite WCAG-compliant
 * live auditory feedback for dynamic state changes.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AriaAnnouncerContextType {
  announce: (message: string) => void;
}

const AriaAnnouncerContext = createContext<AriaAnnouncerContextType>({
  announce: () => {},
});

export const AriaAnnouncerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    // Microtask timeout ensures screen reader re-triggers read
    setTimeout(() => {
      setAnnouncement(message);
    }, 50);
  }, []);

  return (
    <AriaAnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Invisible live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {announcement}
      </div>
    </AriaAnnouncerContext.Provider>
  );
};

export const useAriaAnnouncer = (): AriaAnnouncerContextType => {
  return useContext(AriaAnnouncerContext);
};
