import { Link } from 'react-router';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/shared/Button';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Link to="/">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}
