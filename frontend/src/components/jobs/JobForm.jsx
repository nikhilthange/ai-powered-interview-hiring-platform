import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../../lib/constants'

export default function JobForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements?.join('\n') || '',
    location: initialData?.location || '',
    jobType: initialData?.jobType || 'Full-time',
    experienceLevel: initialData?.experienceLevel || 'Mid',
    salaryMin: initialData?.salaryRange?.min || '',
    salaryMax: initialData?.salaryRange?.max || '',
    status: initialData?.status || 'Active',
  })

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title: form.title,
      description: form.description,
      requirements: form.requirements.split('\n').filter(Boolean),
      location: form.location,
      jobType: form.jobType,
      experienceLevel: form.experienceLevel,
      salaryRange: {
        min: Number(form.salaryMin) || 0,
        max: Number(form.salaryMax) || 0,
      },
      ...(initialData ? { status: form.status } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          id="title"
          label="Job Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <Input
          id="location"
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          required
        />
      </div>

      <Textarea
        id="description"
        label="Description"
        name="description"
        rows={6}
        value={form.description}
        onChange={handleChange}
        required
      />

      <Textarea
        id="requirements"
        label="Requirements (one per line)"
        name="requirements"
        rows={4}
        value={form.requirements}
        onChange={handleChange}
        placeholder="Node.js&#10;React&#10;5+ years experience"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Select
          id="jobType"
          label="Job Type"
          name="jobType"
          value={form.jobType}
          onChange={handleChange}
        >
          {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
        </Select>
        <Select
          id="experienceLevel"
          label="Experience Level"
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
        >
          {EXPERIENCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
        </Select>
        {initialData && (
          <Select
            id="status"
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Closed</option>
          </Select>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          id="salaryMin"
          label="Salary Min (₹)"
          name="salaryMin"
          type="number"
          min={0}
          value={form.salaryMin}
          onChange={handleChange}
        />
        <Input
          id="salaryMax"
          label="Salary Max (₹)"
          name="salaryMax"
          type="number"
          min={0}
          value={form.salaryMax}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {initialData ? 'Update Job' : 'Create Job'}
      </Button>
    </form>
  )
}
