import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { createWorkspace } from '@/app/actions/workspace'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (workspace: { id: string; name: string }) => void
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    if (isSubmitting) return
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await createWorkspace({
        name: name.trim(),
        description: description.trim() || null,
      })

      if (result.data) {
        toast({
          title: 'Workspace criado',
          description: 'Seu novo espaço foi criado com sucesso.',
        })
        onCreated?.({ id: result.data.id, name: result.data.name })
        setName('')
        setDescription('')
        onOpenChange(false)
      } else {
        toast({
          title: 'Erro',
          description: result.error ?? 'Não foi possível criar o workspace',
          variant: 'destructive',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 focus:outline-none">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border bg-background/95 p-6 shadow-xl animate-scale-in space-y-5"
          >
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                Novo workspace
              </Dialog.Title>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="workspace-name">Nome</Label>
                <Input
                  id="workspace-name"
                  autoFocus
                  placeholder="Nome do workspace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workspace-description">Descrição (opcional)</Label>
                <Input
                  id="workspace-description"
                  placeholder="Opcional, para ajudar a identificar o espaço"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Criando...' : 'Criar workspace'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

