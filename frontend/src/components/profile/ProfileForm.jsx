import { useState, useEffect } from 'react'
import Input from '../ui/Input'

export default function ProfileForm({ profile, onChange, isRecruiter = false }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (profile) {
      const base = {
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        headline: profile.headline || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        title: profile.title || '',
        experienceYears: profile.experienceYears ?? '',
        username: profile.username || '',
        isPublic: profile.isPublic ?? true,
      }
      if (isRecruiter) {
        base.company = profile.company?.name ?? ''
      }
      setForm(base)
      if (onChange) onChange(base)
    }
  }, [profile, isRecruiter]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field, value) => {
    const next = { ...form, [field]: value }
    setForm(next)
    if (onChange) onChange(next)
  }

  const commonFields = [
    { id: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
    { id: 'bio', label: 'Bio', placeholder: 'Tell us about yourself...', multiline: true },
  ]

  const candidateFields = [
    { id: 'username', label: 'Public Username', placeholder: 'johndoe123' },
    { id: 'headline', label: 'Headline', placeholder: 'Senior Software Engineer at Acme' },
    { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
    { id: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
    { id: 'website', label: 'Website', type: 'url', placeholder: 'https://johndoe.com' },
    { id: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/johndoe' },
    { id: 'github', label: 'GitHub', type: 'url', placeholder: 'https://github.com/johndoe' },
    { id: 'portfolio', label: 'Portfolio', type: 'url', placeholder: 'https://johndoe.dev' },
    { id: 'experienceYears', label: 'Years of Experience', type: 'number', placeholder: '5' },
  ]

  const recruiterFields = [
    { id: 'company', label: 'Company', placeholder: 'Acme Inc.' },
    { id: 'title', label: 'Your Title', placeholder: 'HR Manager' },
    { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 01234 56789' },
    { id: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
    { id: 'website', label: 'Website', type: 'url', placeholder: 'https://acme.com' },
    { id: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/company/acme' },
  ]

  const fields = isRecruiter
    ? [
        ...commonFields.map(f => f.id === 'fullName' ? { ...f, label: 'Company Name' } : { ...f, label: 'Company Bio' }),
        ...recruiterFields,
      ]
    : [...commonFields, ...candidateFields]

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.slice(0, 2).map((field) => (
          field.multiline ? (
            <div key={field.id} className="sm:col-span-2">
              <label htmlFor={field.id} className="block text-sm font-medium text-[var(--text-primary)] mb-2">{field.label}</label>
              <textarea
                id={field.id}
                rows={3}
                placeholder={field.placeholder}
                value={form[field.id] || ''}
                onChange={(e) => updateField(field.id, e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
              />
            </div>
          ) : (
            <Input
              key={field.id}
              id={field.id}
              label={field.label}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={form[field.id] || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
            />
          )
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.slice(2).map((field) => (
          <Input
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={form[field.id] || ''}
            onChange={(e) => updateField(field.id, e.target.value)}
          />
        ))}
      </div>
      
      {!isRecruiter && (
        <div className="flex items-center gap-3 bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
          <input
            type="checkbox"
            id="isPublic"
            checked={form.isPublic || false}
            onChange={(e) => updateField('isPublic', e.target.checked)}
            className="h-5 w-5 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <label htmlFor="isPublic" className="font-medium text-[var(--text-primary)]">Public Portfolio</label>
            <p className="text-sm text-[var(--text-secondary)]">Allow anyone to view your portfolio at /u/{form.username || 'username'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
