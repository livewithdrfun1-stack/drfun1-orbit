import React from 'react';
import { ZncWebControlPanelView } from './ZncWebControlPanelView';

interface ZncWebAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToIrc?: () => void;
  onNavigateToStats?: () => void;
  onOpenLicense?: () => void;
}

export const ZncWebAdminModal: React.FC<ZncWebAdminModalProps> = ({
  isOpen,
  onClose,
  onNavigateToIrc,
  onNavigateToStats,
  onOpenLicense
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto">
        <ZncWebControlPanelView
          isModal={true}
          onClose={onClose}
          onNavigateToIrc={() => {
            if (onNavigateToIrc) onNavigateToIrc();
            onClose();
          }}
          onNavigateToStats={() => {
            if (onNavigateToStats) onNavigateToStats();
            onClose();
          }}
          onOpenLicense={() => {
            if (onOpenLicense) onOpenLicense();
            onClose();
          }}
        />
      </div>
    </div>
  );
};
