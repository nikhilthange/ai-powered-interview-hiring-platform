import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { Save } from 'lucide-react'

export default function ProfileForm({ profile, onSubmit, loading, isRecruiter = false }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        company: profile.company || '',
        title: profile.title || '',
        experienceYears: profile.experienceYears || '',
      })
    }
  }, [profile])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const fields = isRecruiter
    ? [
        { id: 'fullName', label: 'Company Name', placeholder: 'Acme Inc.' },
        { id: 'bio', label: 'Company Bio', placeholder: 'Tell us about your company...', multiline: true },
        { id: 'company', label: 'Company', placeholder: 'Acme Inc.' },
        { id: 'title', label: 'Your Title', placeholder: 'HR Manager' },
        { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
        { id: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
        { id: 'website', label: 'Website', type: 'url', placeholder: 'https://acme.com' },
      ]
    : [
        { id: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
        { id: 'bio', label: 'Bio', placeholder: 'Tell us about yourself...', multiline: true },
        { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
        { id: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
        { id: 'website', label: 'Website', type: 'url', placeholder: 'https://johndoe.com' },
        { id: 'experienceYears', label: 'Years of Experience', type: 'number', placeholder: '5' },
      ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
                onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
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
              onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
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
            onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
          />
        ))}
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}
