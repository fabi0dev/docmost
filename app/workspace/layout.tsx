import { MainLayout } from '@/components/layout/main-layout';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
