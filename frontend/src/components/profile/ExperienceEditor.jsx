import { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Briefcase, Plus, Trash2 } from 'lucide-react'

export default function ExperienceEditor({ experience = [], onUpdate, loading }) {
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ company: '', position: '', description: '', current: false })

  const handleAdd = () => {
    if (!form.company || !form.position) return
    const newExp = [...experience, form]
    onUpdate(newExp)
    setForm({ company: '', position: '', description: '', current: false })
    setIsAdding(false)
  }

  const handleRemove = (index) => {
    const next = experience.filter((_, i) => i !== index)
    onUpdate(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Experience</h2>
            <p className="text-xs text-[var(--text-tertiary)]">Add your work history</p>
          </div>
        </div>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {experience.map((exp, i) => (
        <Card key={i} className="mb-3">
          <CardContent className="p-4 flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">{exp.position}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{exp.company}</p>
              {exp.description && <p className="text-sm text-[var(--text-tertiary)] mt-2">{exp.description}</p>}
            </div>
            <button onClick={() => handleRemove(i)} disabled={loading} className="text-red-500 hover:text-red-700 p-2">
              <Trash2 className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      ))}

      {isAdding && (
        <Card className="border-indigo-100 dark:border-indigo-900">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Corp"
              />
              <Input
                label="Position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm"
                rows={3}
                placeholder="Describe your role..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} disabled={!form.company || !form.position || loading}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isAdding && experience.length === 0 && (
         <p className="text-sm text-[var(--text-secondary)]">No experience added yet.</p>
      )}
    </div>
  )
}
