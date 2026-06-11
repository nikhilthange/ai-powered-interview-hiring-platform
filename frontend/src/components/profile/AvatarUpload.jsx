import { useState, useRef } from 'react'
import { Upload, User } from 'lucide-react'
import Button from '../ui/Button'

export default function AvatarUpload({ currentUrl, onUpload, loading }) {
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onUpload(file)
  }

  return (
    <div className="flex items-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200">
        {preview || currentUrl ? (
          <img
            src={preview || currentUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-gray-400" />
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={loading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </Button>
      </div>
    </div>
  )
}
