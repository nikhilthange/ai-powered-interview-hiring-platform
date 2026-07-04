import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { profileApi } from '../../services/profileApi'
import { Card, CardContent } from '../../components/ui/Card'
import { SkeletonProfile } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import AvatarUpload from '../../components/profile/AvatarUpload'
import ProfileForm from '../../components/profile/ProfileForm'
import Button from '../../components/ui/Button'
import { AlertCircle, Building2 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function RecruiterProfile() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, isError, error } = useApi(['profile'], () =>
    profileApi.getMyProfile().then((r) => r.data)
  )

  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile Updated', 'Your profile has been saved.')
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
  })

  if (isLoading) return (
    <div className="max-w-4xl mx-auto"><SkeletonProfile /></div>
  )

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[var(--color-error)] mb-3" />
            <p className="text-lg font-medium text-[var(--text-primary)]">Failed to load profile</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{error?.response?.data?.message}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = data?.data?.profile

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Recruiter Profile</h1>
            <p className="text-sm text-[var(--text-secondary)]">Manage your company profile and preferences</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <AvatarUpload
              currentUrl={profile?.avatarUrl}
              onUpload={(file) => avatarMutation.mutate(file)}
              loading={avatarMutation.isPending}
            />
            <div className="mt-6">
              <ProfileForm
                profile={profile}
                onSubmit={(formData) => updateMutation.mutate(formData)}
                loading={updateMutation.isPending}
                isRecruiter={true}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
