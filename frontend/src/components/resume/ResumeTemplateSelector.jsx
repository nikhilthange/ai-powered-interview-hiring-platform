import Input from '../ui/Input';

export default function ResumeTemplateSelector({ title, template, onChange }) {
  return (
    <div className="bg-[var(--bg-primary)] p-5 rounded-xl border border-[var(--border-color)] shadow-sm space-y-4">
      <h3 className="font-semibold text-[var(--text-primary)]">Document Settings</h3>
      <Input 
        label="Resume Title (Internal)" 
        value={title || ''} 
        onChange={(e) => onChange('title', e.target.value)} 
        placeholder="Software Engineer Resume"
      />
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Template</label>
        <select 
          value={template || 'classic'} 
          onChange={(e) => onChange('template', e.target.value)}
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm"
        >
          <option value="classic">Classic (ATS Friendly)</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
          <option value="professional">Professional</option>
        </select>
      </div>
    </div>
  );
}
