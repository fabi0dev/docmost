'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, MagnifyingGlass, User } from '@phosphor-icons/react';
import { APP_NAME } from '@/lib/config';
import { UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';
import { useUIStore } from '@/stores/ui-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onSearchClick?: () => void;
  userMenuOpen: boolean;
  onUserMenuOpenChange: (open: boolean) => void;
}

/** Abre o modal de busca (store); onSearchClick é fallback para compatibilidade. */
function useOpenSearch(onSearchClick?: () => void) {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  return () => (onSearchClick ? onSearchClick() : setSearchOpen(true));
}

const iconButtonClass =
  'h-9 w-9 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-smooth';

export function TopBar({ onSearchClick, userMenuOpen, onUserMenuOpenChange }: TopBarProps) {
  const openSearch = useOpenSearch(onSearchClick);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const logoHref = currentWorkspace ? `/workspace/${currentWorkspace.id}` : '/workspace';

  return (
    <header
      className={cn(
        'relative z-50 flex w-full min-w-full shrink-0 items-center gap-2',
        ' border-b border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 animate-fade-in-down',
        'justify-between',
      )}
    >
      <Link
        href={logoHref}
        className="flex shrink-0 items-center gap-2 group cursor-pointer transition-smooth"
      >
        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:scale-105 transition-smooth">
          <FileText size={20} className="text-primary sm:w-[22px] sm:h-[22px]" weight="bold" />
        </div>
        <span className="hidden font-bold text-base bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent sm:inline sm:text-lg">
          {APP_NAME} x
        </span>
      </Link>

      {/* Busca: só ícone no mobile, barra completa no desktop */}
      <div className="flex-1 min-w-0 max-w-xl mx-2 sm:mx-6 md:mx-8">
        <button
          type="button"
          onClick={openSearch}
          className="w-full flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-muted/40 px-2 py-2 sm:px-3 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 transition-smooth cursor-pointer"
        >
          <MagnifyingGlass size={20} className="shrink-0 sm:w-[22px] sm:h-[22px]" />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="ml-auto hidden md:inline-flex h-5 items-center gap-0.5 rounded bg-background/60 px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* User + Workspace: largura limitada no mobile */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <UserMenu
          open={userMenuOpen}
          onOpenChange={onUserMenuOpenChange}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className={cn(iconButtonClass, 'h-8 w-8 sm:h-9 sm:w-9')}
              onClick={() => onUserMenuOpenChange(!userMenuOpen)}
            >
              <User size={20} className="sm:w-[22px] sm:h-[22px]" />
            </Button>
          }
        />
        <div className="h-4 w-px bg-border sm:h-5" aria-hidden />
        <div className="min-w-0 max-w-[120px] sm:max-w-[200px]">
          <WorkspaceSwitcher />
        </div>
      </div>
    </header>
  );
}
