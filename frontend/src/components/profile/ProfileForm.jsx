import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function ProfileForm({ profile, onSubmit, loading, isRecruiter }) {
  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    bio: profile?.bio || '',
    skills: profile?.skills?.join(', ') || '',
    experienceYears: profile?.experienceYears || 0,
    companyName: profile?.company?.name || '',
    companyWebsite: profile?.company?.website || '',
  })

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      fullName: form.fullName,
      bio: form.bio,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      experienceYears: Number(form.experienceYears),
    }
    if (isRecruiter) {
      data.company = {
        name: form.companyName,
        website: form.companyWebsite,
      }
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="fullName"
        label="Full Name"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        required
      />

      <div className="space-y-1">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={form.bio}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Input
        id="skills"
        label="Skills (comma-separated)"
        name="skills"
        value={form.skills}
        onChange={handleChange}
        placeholder="React, Node.js, TypeScript"
      />

      <Input
        id="experienceYears"
        label="Years of Experience"
        name="experienceYears"
        type="number"
        min={0}
        value={form.experienceYears}
        onChange={handleChange}
      />

      {isRecruiter && (
        <>
          <Input
            id="companyName"
            label="Company Name"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />
          <Input
            id="companyWebsite"
            label="Company Website"
            name="companyWebsite"
            value={form.companyWebsite}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Save Profile
      </Button>
    </form>
  )
}
