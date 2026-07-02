import { useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { getMediaUrl } from '../../lib/utils'

export default function AvatarUpload({ currentUrl, onUpload, loading }) {
  const inputRef = useRef(null)
  const avatarUrl = getMediaUrl(currentUrl)

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 ring-2 ring-indigo-200 dark:ring-indigo-700 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
          aria-label="Upload photo"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f) }}
          className="hidden"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">Profile Photo</p>
        <p className="text-xs text-[var(--text-tertiary)]">JPG, PNG or WEBP (max 2 MB)</p>
      </div>
    </div>
  )
}
