import { AppShell } from '@/components/app/app-shell';
import { AppProvider } from '@/components/app/app-provider';

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
