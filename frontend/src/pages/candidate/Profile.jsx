import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { profileApi } from '../../services/profileApi'
import { Card, CardContent } from '../../components/ui/Card'
import { SkeletonProfile } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import ProfileForm from '../../components/profile/ProfileForm'
import AvatarUpload from '../../components/profile/AvatarUpload'
import SkillBadge from '../../components/profile/SkillBadge'
import RoadmapView from '../../components/profile/RoadmapView'
import ExperienceEditor from '../../components/profile/ExperienceEditor'
import Button from '../../components/ui/Button'
import { getMediaUrl } from '../../lib/utils'
import { Upload, FileText, AlertCircle, Plus, Briefcase, Award, FileBadge } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function buildInitialForm(profile) {
  return {
    fullName: profile.fullName || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
    linkedin: profile.linkedin || '',
    github: profile.github || '',
    portfolio: profile.portfolio || '',
    title: profile.title || '',
    experienceYears: profile.experienceYears ?? '',
  }
}

export default function CandidateProfile() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [newSkill, setNewSkill] = useState('')
  const [newCertificate, setNewCertificate] = useState('')
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [currentFormValues, setCurrentFormValues] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const resumeInputRef = useRef(null)

  const { data, isLoading, isError, error } = useApi(['profile'], () =>
    profileApi.getMyProfile().then((r) => r.data)
  )

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['auth'] })
  }

  const updateMutation = useMutation({
    mutationFn: ({ data, avatarFile }) => profileApi.updateProfile(data, avatarFile),
    onSuccess: () => {
      invalidateAll()
      setSelectedAvatarFile(null)
      toast.success('Profile Updated', 'Your profile has been saved successfully.')
    },
    onError: (err) => {
      toast.error('Failed to Save', err?.response?.data?.message || 'Something went wrong.')
    },
  })

  const resumeMutation = useMutation({
    mutationFn: profileApi.uploadResume,
    onSuccess: () => {
      invalidateAll()
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
    updateMutation.mutate({ data: { skills: updatedSkills }, avatarFile: selectedAvatarFile || undefined })
    setNewSkill('')
  }

  const handleRemoveSkill = (skill) => {
    const updatedSkills = (profile?.skills || []).filter((s) => s !== skill)
    updateMutation.mutate({ data: { skills: updatedSkills }, avatarFile: selectedAvatarFile || undefined })
  }

  const handleAddCertificate = () => {
    const cert = newCertificate.trim()
    if (!cert || profile?.certificates?.includes(cert)) return
    const updatedCerts = [...(profile?.certificates || []), cert]
    updateMutation.mutate({ data: { certificates: updatedCerts }, avatarFile: selectedAvatarFile || undefined })
    setNewCertificate('')
  }

  const handleRemoveCertificate = (cert) => {
    const updatedCerts = (profile?.certificates || []).filter((c) => c !== cert)
    updateMutation.mutate({ data: { certificates: updatedCerts }, avatarFile: selectedAvatarFile || undefined })
  }

  const handleUpdateExperience = (experience) => {
    updateMutation.mutate({ data: { experience }, avatarFile: selectedAvatarFile || undefined })
  }

  const handleFormChange = (form) => {
    setCurrentFormValues(form)
  }

  const handleSave = () => {
    if (updateMutation.isPending || !currentFormValues) return
    const data = {
      ...currentFormValues,
      experienceYears: currentFormValues.experienceYears !== '' ? Number(currentFormValues.experienceYears) : 0,
    }
    if (!data.fullName) delete data.fullName
    updateMutation.mutate({ data, avatarFile: selectedAvatarFile || undefined })
  }

  const handleCancel = () => {
    setFormVersion((v) => v + 1)
    setCurrentFormValues(null)
    setSelectedAvatarFile(null)
  }

  const handleAvatarSelect = (file) => {
    setSelectedAvatarFile(file)
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    resumeMutation.mutate(file)
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SkeletonProfile />
    </div>
  )

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[var(--color-error)] mb-3" />
            <p className="text-lg font-medium text-[var(--text-primary)]">Failed to load profile</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{error?.response?.data?.message || 'Please try again.'}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = data?.data?.profile
  const resumeUrl = getMediaUrl(profile?.resumeUrl)
  const initial = profile ? buildInitialForm(profile) : {}
  const isDirty = currentFormValues && JSON.stringify(currentFormValues) !== JSON.stringify(initial)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6 pb-24 sm:pb-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">My Profile</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your personal information and career details</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <AvatarUpload currentUrl={profile?.avatarUrl} onUpload={handleAvatarSelect} loading={updateMutation.isPending} />
            <div className="mt-6">
              <ProfileForm key={formVersion} profile={profile} onChange={handleFormChange} isRecruiter={false} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Resume</h2>
                <p className="text-xs text-[var(--text-tertiary)]">Upload or replace your resume</p>
              </div>
            </div>
            {resumeUrl ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-8 w-8 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">Current Resume</p>
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors">View / Download</a>
                  </div>
                </div>
                <label className="cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-center">
                  Replace
                  <input type="file" accept=".pdf,.docx,.doc" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-color)] p-10 text-center hover:border-indigo-300 hover:bg-[var(--bg-tertiary)] transition-all">
                <Upload className="mx-auto h-8 w-8 text-[var(--text-tertiary)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-primary)]">Upload your resume <span className="text-indigo-600">here</span></p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">PDF or DOCX (max 5 MB)</p>
                <input type="file" accept=".pdf,.docx,.doc" onChange={handleResumeUpload} className="hidden" />
              </label>
            )}
            {resumeMutation.isPending && (
              <div className="flex items-center gap-2 mt-3 text-sm text-indigo-600">
                <Upload className="h-4 w-4 animate-pulse" />
                Uploading resume...
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Skills</h2>
                <p className="text-xs text-[var(--text-tertiary)]">Add skills to improve job matching</p>
              </div>
            </div>
            {profile?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} onRemove={handleRemoveSkill} />
                ))}
              </div>
            )}
            {(!profile?.skills || profile.skills.length === 0) && (
              <p className="text-sm text-[var(--text-secondary)] mb-4">No skills added yet.</p>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 min-w-0 w-full">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <Button onClick={handleAddSkill} disabled={!newSkill.trim() || updateMutation.isPending} size="sm" className="shrink-0">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
            {profile?.experienceYears > 0 && (
              <div className="flex items-center gap-2 mt-4 text-sm text-[var(--text-secondary)]">
                <Briefcase className="h-4 w-4" />
                {profile.experienceYears} years of experience
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <FileBadge className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Certificates</h2>
                <p className="text-xs text-[var(--text-tertiary)]">Add your certifications</p>
              </div>
            </div>
            {profile?.certificates?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.certificates.map((cert) => (
                  <SkillBadge key={cert} skill={cert} onRemove={handleRemoveCertificate} />
                ))}
              </div>
            )}
            {(!profile?.certificates || profile.certificates.length === 0) && (
              <p className="text-sm text-[var(--text-secondary)] mb-4">No certificates added yet.</p>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 min-w-0 w-full">
                <input
                  type="text"
                  placeholder="Add a certificate..."
                  value={newCertificate}
                  onChange={(e) => setNewCertificate(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertificate())}
                  className="flex-1 min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <Button onClick={handleAddCertificate} disabled={!newCertificate.trim() || updateMutation.isPending} size="sm" className="shrink-0">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ExperienceEditor 
          experience={profile?.experience || []} 
          onUpdate={handleUpdateExperience}
          loading={updateMutation.isPending}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6 mb-8">
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
            loading={updateMutation.isPending}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Changes
          </Button>
        </div>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-md px-4 py-3 flex gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
            loading={updateMutation.isPending}
            className="flex-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Changes
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <RoadmapView existingRoadmap={profile?.careerRoadmap} skills={profile?.skills} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
