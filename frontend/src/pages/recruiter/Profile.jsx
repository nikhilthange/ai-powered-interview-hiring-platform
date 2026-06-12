import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../../hooks/useApi'
import { profileApi } from '../../services/profileApi'
import { SkeletonPage } from '../../components/ui/Skeleton'
import ProfileForm from '../../components/profile/ProfileForm'
import AvatarUpload from '../../components/profile/AvatarUpload'
import { Building2, Globe } from 'lucide-react'

export default function RecruiterProfile() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useApi(['profile'], () =>
    profileApi.getMyProfile().then((r) => r.data)
  )

  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const avatarMutation = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  if (isLoading) return <SkeletonPage />

  const profile = data?.data?.profile

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>

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
          isRecruiter={true}
        />
      </div>

      {profile?.company?.name && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">{profile.company.name}</h2>
          </div>
          {profile.company.website && (
            <a
              href={profile.company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
            >
              <Globe className="h-4 w-4" />
              {profile.company.website}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
