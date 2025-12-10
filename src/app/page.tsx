import { AppProvider } from '@/components/app/app-provider';
import { AppShell } from '@/components/app/app-shell';

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
