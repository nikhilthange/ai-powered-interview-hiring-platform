import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { profileApi } from '../../services/profileApi'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import ProfileForm from '../../components/profile/ProfileForm'
import AvatarUpload from '../../components/profile/AvatarUpload'
import SkillBadge from '../../components/profile/SkillBadge'
import RoadmapView from '../../components/profile/RoadmapView'
import { GraduationCap, Upload, FileText, AlertCircle, Plus } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getResumeUrl(resumeUrl) {
  if (!resumeUrl) return null
  if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) return resumeUrl
  return `${API_URL}${resumeUrl.startsWith('/') ? '' : '/'}${resumeUrl}`
}

export default function CandidateProfile() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [newSkill, setNewSkill] = useState('')
  const resumeInputRef = useRef(null)

  const { data, isLoading, isError, error } = useApi(['profile'], () =>
    profileApi.getMyProfile().then((r) => r.data)
  )

  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile Updated', 'Your profile has been saved successfully.')
    },
    onError: (err) => {
      toast.error('Failed to Save', err?.response?.data?.message || 'Something went wrong.')
    },
  })

  const avatarMutation = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Photo Updated', 'Your profile photo has been changed.')
    },
    onError: (err) => {
      toast.error('Upload Failed', err?.response?.data?.message || 'Could not upload photo.')
    },
  })

  const resumeMutation = useMutation({
    mutationFn: profileApi.uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Resume Uploaded', 'Your resume has been saved to your profile.')
    },
    onError: (err) => {
      toast.error('Upload Failed', err?.response?.data?.message || 'Could not upload resume.')
    },
  })

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (!skill || profile?.skills?.includes(skill)) return
    const updatedSkills = [...(profile?.skills || []), skill]
    updateMutation.mutate({ skills: updatedSkills })
    setNewSkill('')
  }

  const handleRemoveSkill = (skill) => {
    const updatedSkills = (profile?.skills || []).filter((s) => s !== skill)
    updateMutation.mutate({ skills: updatedSkills })
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    resumeMutation.mutate(file)
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  if (isLoading) return <SkeletonPage />
  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-red-700">{error?.response?.data?.message || 'Failed to load profile.'}</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const profile = data?.data?.profile
  const resumeUrl = getResumeUrl(profile?.resumeUrl)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <AvatarUpload
          currentUrl={profile?.avatarUrl}
          onUpload={(file) => avatarMutation.mutate(file)}
          loading={avatarMutation.isPending}
        />

        <ProfileForm
          profile={profile}
          onSubmit={(formData) => updateMutation.mutate(formData)}
          loading={updateMutation.isPending}
          isRecruiter={false}
        />
      </div>

      {/* Resume Upload */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Resume</h2>
        </div>
        {resumeUrl ? (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Current Resume</p>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-500">
                  View / Download
                </a>
              </div>
            </div>
            <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Replace
              <input type="file" accept=".pdf,.docx,.doc" onChange={handleResumeUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-indigo-400">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Upload your resume <span className="text-indigo-600">here</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">PDF or DOCX (max 5 MB)</p>
            <input type="file" accept=".pdf,.docx,.doc" onChange={handleResumeUpload} className="hidden" />
          </label>
        )}
        {resumeMutation.isPending && <p className="text-sm text-indigo-600">Uploading resume...</p>}
      </div>

      {/* Skills Management */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
        </div>

        {profile?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <SkillBadge key={skill} skill={skill} onRemove={handleRemoveSkill} />
            ))}
          </div>
        )}

        {(!profile?.skills || profile.skills.length === 0) && (
          <p className="text-sm text-gray-500">No skills added yet.</p>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddSkill}
            disabled={!newSkill.trim() || updateMutation.isPending}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {profile?.experienceYears > 0 && (
          <p className="text-sm text-gray-600">{profile.experienceYears} years of experience</p>
        )}
      </div>

      {/* Career Roadmap */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <RoadmapView
          existingRoadmap={profile?.careerRoadmap}
          skills={profile?.skills}
        />
      </div>
    </div>
  )
}
