import HabitTracker from '@/components/HabitTracker';
import AuthGuard from '@/components/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <HabitTracker />
    </AuthGuard>
  );
}
