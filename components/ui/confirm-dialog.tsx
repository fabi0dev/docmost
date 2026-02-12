import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Button } from './button';
import { Input } from './input';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  requireTextMatchLabel?: string;
  requireTextMatchValue?: string;
  requireTextMatchPlaceholder?: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading,
  onConfirm,
  onOpenChange,
  requireTextMatchLabel,
  requireTextMatchValue,
  requireTextMatchPlaceholder,
}: ConfirmDialogProps) {
  const [matchInput, setMatchInput] = useState('');

  useEffect(() => {
    if (!open) {
      setMatchInput('');
    }
  }, [open]);

  const requiresMatch = Boolean(requireTextMatchValue);
  const isMatchValid = !requiresMatch || matchInput === requireTextMatchValue;
  const confirmDisabled = loading || !isMatchValid;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 focus:outline-none">
          <div className="rounded-lg border bg-background p-5 shadow-lg animate-scale-in">
            <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            ) : null}

            {requiresMatch ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  {requireTextMatchLabel ??
                    'Por segurança, digite o valor solicitado abaixo para confirmar.'}
                </p>
                <Input
                  autoFocus
                  value={matchInput}
                  onChange={(e) => setMatchInput(e.target.value)}
                  placeholder={requireTextMatchPlaceholder}
                  className="h-9"
                />
              </div>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {loading ? 'Aguarde...' : confirmLabel}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
