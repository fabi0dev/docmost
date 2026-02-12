'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/hooks/use-projects';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Folder, FileText, Plus, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CreateProjectDialog } from '@/apps/docspace/components/create-project-dialog';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createProject } from '@/app/actions/projects';
import { createDocument } from '@/app/actions/documents';
import { queryKeys } from '@/lib/query-keys';

interface DocspaceHomeViewProps {
  workspaceId: string;
}

export function DocspaceHomeView({ workspaceId }: DocspaceHomeViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjects(workspaceId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);

  const { data: noProjectCount = 0 } = useQuery({
    queryKey: ['documents-no-project-count', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/tree?workspaceId=${workspaceId}`);
      if (!res.ok) return 0;
      const tree = await res.json();
      return tree.filter((n: { document: { projectId?: string | null } }) => !n.document?.projectId)
        .length;
    },
    enabled: !!workspaceId,
  });

  const handleCreateProject = async (name: string, description?: string) => {
    const result = await createProject({
      workspaceId,
      name,
      description: description || undefined,
    });
    if (result.data) {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast({ title: 'Projeto criado' });
      setIsCreateOpen(false);
      router.push(`/workspace/${workspaceId}/project/${result.data.id}`);
    } else {
      toast({
        title: 'Erro',
        description: result.error ?? 'Não foi possível criar o projeto',
        variant: 'destructive',
      });
    }
  };

  const handleNewDocument = async () => {
    setIsCreatingDoc(true);
    try {
      const result = await createDocument({
        workspaceId,
        title: 'Novo Documento',
      });
      if (result.data) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.documents.tree(workspaceId, null).queryKey,
        });
        queryClient.invalidateQueries({ queryKey: ['documents-no-project-count', workspaceId] });
        toast({ title: 'Documento criado' });
        router.push(`/workspace/${workspaceId}/${result.data.id}?focus=title`);
      } else {
        toast({
          title: 'Erro',
          description: result.error ?? 'Não foi possível criar o documento',
          variant: 'destructive',
        });
      }
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const getProjectInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return (parts[0]![0] + parts[1]![0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[200px] animate-fade-in">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <LoadingSpinner size="md" />
          <span className="text-sm animate-pulse">Carregando projetos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background overflow-hidden animate-fade-in">
      <div className="flex-1 overflow-y-auto min-h-0 flex justify-center">
        <div className="w-full max-w-4xl">
          <header className="px-6 pt-8 md:px-8 flex flex-col gap-2 animate-fade-in-up">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold text-foreground">Docspace</h1>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewDocument}
                  disabled={isCreatingDoc}
                  className="gap-2"
                >
                  {isCreatingDoc ? <LoadingSpinner size="sm" /> : <FileText size={18} />}
                  Novo documento
                </Button>
                <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2">
                  <Plus size={18} />
                  Novo projeto
                </Button>
              </div>
            </div>
          </header>

          <section className="px-6 pt-8 md:px-8 space-y-4 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-foreground">Projetos</h2>

            {projects.length === 0 && noProjectCount === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/20 py-12 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground mb-3">
                  <Folder size={28} weight="regular" />
                </div>
                <p className="text-sm font-medium text-foreground">Nenhum projeto</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie um projeto ou um documento para começar.
                </p>
                <Link
                  href={`/workspace/${workspaceId}/overview`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors"
                >
                  Documentos sem projeto
                  <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map(
                  (project: { id: string; name: string; _count: { documents: number } }) => (
                    <Link
                      key={project.id}
                      href={`/workspace/${workspaceId}/project/${project.id}`}
                      className="group flex flex-col rounded-xl border border-border/60 bg-card/80 px-4 py-4 hover:bg-primary/5 hover:border-primary/40 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          {getProjectInitials(project.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate group-hover:text-primary transition-smooth">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project._count.documents} documento
                            {project._count.documents !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ),
                )}

                <Link
                  href={`/workspace/${workspaceId}/overview`}
                  className="group flex flex-col rounded-xl border border-dashed border-border/50 bg-card/40 px-4 py-4 hover:bg-muted/40 hover:border-primary/30 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground group-hover:text-primary transition-smooth">
                      <FileText size={22} weight="regular" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate group-hover:text-primary transition-smooth">
                        Documentos sem projeto
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {noProjectCount} documento
                        {noProjectCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
