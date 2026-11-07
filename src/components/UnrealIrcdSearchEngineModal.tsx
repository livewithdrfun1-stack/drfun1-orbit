/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * UnrealIRCd.org Search Engine & Leaf-to-irc.drfun1.com Verification Workstation
 * Upstream Hub: irc.drfun1.com:6697 (SID 001) via Switch SUPERNAP & RisingNet 100G DWDM
 */

import React from 'react';
import { IrcChannelAndLeafSearchEngine } from './IrcChannelAndLeafSearchEngine';

interface UnrealIrcdSearchEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToIrc?: (channel?: string) => void;
  onOpenSwitchMesh?: () => void;
}

export const UnrealIrcdSearchEngineModal: React.FC<UnrealIrcdSearchEngineModalProps> = ({
  isOpen,
  onClose,
  onNavigateToIrc,
  onOpenSwitchMesh
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col">
        <IrcChannelAndLeafSearchEngine
          isModalView={true}
          onCloseModal={onClose}
          onJoinChannel={(channel) => {
            if (onNavigateToIrc) onNavigateToIrc(channel);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
