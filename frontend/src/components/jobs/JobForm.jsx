import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote']
const LEVELS = ['Junior', 'Mid', 'Senior']

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

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          value={form.description}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
          Requirements (one per line)
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={4}
          value={form.requirements}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Node.js&#10;React&#10;5+ years experience"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Job Type</label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Experience Level</label>
          <select
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        {initialData && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Active</option>
              <option>Closed</option>
            </select>
          </div>
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
