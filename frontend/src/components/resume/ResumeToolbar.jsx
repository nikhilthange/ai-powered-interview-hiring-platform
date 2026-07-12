import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../ui/Button';

export default function ResumeToolbar({ title, isSaving, lastSaved, onSave, isPending }) {
  return (
    <div className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Link to="/resume-builder" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-[var(--text-primary)]">{title || 'Untitled Resume'}</h1>
            {isSaving && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Unsaved Changes</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-3 w-3" />
                Last saved {lastSaved ? lastSaved.toLocaleTimeString() : 'just now'}
              </>
            )}
          </div>
        </div>
      </div>
      <Button size="sm" onClick={onSave} disabled={isPending || (!isSaving && !!lastSaved)}>
        <Save className="h-4 w-4 mr-2" /> Save
      </Button>
    </div>
  );
}
