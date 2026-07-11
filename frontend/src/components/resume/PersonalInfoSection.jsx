import React from 'react';
import Input from '../ui/Input';

export default function PersonalInfoSection({ data = {}, onChange }) {
  return (
    <div className="bg-[var(--bg-primary)] p-5 rounded-xl border border-[var(--border-color)] shadow-sm space-y-4">
      <h3 className="font-semibold text-[var(--text-primary)]">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" value={data.fullName || ''} onChange={e => onChange('fullName', e.target.value)} />
        <Input label="Email" value={data.email || ''} onChange={e => onChange('email', e.target.value)} />
        <Input label="Phone" value={data.phone || ''} onChange={e => onChange('phone', e.target.value)} />
        <Input label="Location" value={data.location || ''} onChange={e => onChange('location', e.target.value)} />
        <Input label="LinkedIn URL" value={data.linkedin || ''} onChange={e => onChange('linkedin', e.target.value)} />
        <Input label="GitHub URL" value={data.github || ''} onChange={e => onChange('github', e.target.value)} />
        <Input label="Portfolio Website" value={data.website || ''} onChange={e => onChange('website', e.target.value)} />
      </div>
    </div>
  );
}
