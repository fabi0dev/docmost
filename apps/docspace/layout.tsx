'use client';

import React from 'react';
import { ChatDock } from '@/components/chat/chat-dock';
import { docspaceConfig } from './config';

interface DocspaceLayoutProps {
  children: React.ReactNode;
}

/**
 * Envelope do Docspace: adiciona apenas o chat.
 * O MainLayout (TopBar etc.) vem do layout pai (/workspace ou /settings).
 */
export function DocspaceLayout({ children }: DocspaceLayoutProps) {
  return (
    <>
      {children}
      <ChatDock />
    </>
  );
}

export const DOCSPACE_APP = docspaceConfig;
