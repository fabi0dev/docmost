'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateWorkspace } from '@/app/actions/workspace'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Gear,
  Users,
  Trash,
  ArrowLeft,
  UserPlus,
  UserMinus,
} from '@phosphor-icons/react'
import { Role } from '@prisma/client'

interface WorkspaceSettingsPageProps {
  workspace: {
    id: string
    name: string
    slug: string
    description: string | null
    members: Array<{
      id: string
      role: Role
      user: {
        id: string
        name: string | null
        email: string
        image: string | null
      }
    }>
  }
}

export function WorkspaceSettingsPage({ workspace }: WorkspaceSettingsPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description || '')

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateWorkspace({
        workspaceId: workspace.id,
        name,
        description: description || null,
      })
      if (result.error) {
        toast({
          title: 'Erro',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Sucesso',
          description: 'Workspace atualizado com sucesso',
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar workspace:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar workspace',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (role: Role) => {
    const labels = {
      OWNER: 'Proprietário',
      ADMIN: 'Administrador',
      EDITOR: 'Editor',
      VIEWER: 'Visualizador',
    }
    return labels[role]
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-card px-8 py-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configurações do Espaço</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as configurações e membros do workspace
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8">
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Gear className="h-5 w-5" />
                Informações Gerais
              </h2>
              <div className="space-y-4 bg-card rounded-lg border p-6">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Nome do Espaço</Label>
                  <Input
                    id="workspaceName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do workspace"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspaceDescription">Descrição</Label>
                  <Input
                    id="workspaceDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição do workspace"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspaceSlug">Slug</Label>
                  <Input
                    id="workspaceSlug"
                    value={workspace.slug}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    O slug não pode ser alterado
                  </p>
                </div>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Membros */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membros ({workspace.members.length})
                </h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Adicionar Membro
                </Button>
              </div>
              <div className="space-y-2 bg-card rounded-lg border p-6">
                {workspace.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.user.name || member.user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm px-2 py-1 rounded bg-muted text-muted-foreground">
                        {getRoleLabel(member.role)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Zona de Perigo */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-destructive flex items-center gap-2">
                <Trash className="h-5 w-5" />
                Zona de Perigo
              </h2>
              <div className="space-y-4 bg-card rounded-lg border border-destructive/20 p-6">
                <div>
                  <h3 className="font-semibold mb-2">Excluir Workspace</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ao excluir o workspace, todos os documentos e dados serão permanentemente removidos.
                    Esta ação não pode ser desfeita.
                  </p>
                  <Button variant="destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir Workspace
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
