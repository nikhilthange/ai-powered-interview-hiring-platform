import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { profileApi } from '../../services/profileApi'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { BookOpen } from 'lucide-react'

export default function RoadmapView({ existingRoadmap, skills }) {
  const [targetRole, setTargetRole] = useState('')
  const [roadmap, setRoadmap] = useState(existingRoadmap)

  const mutation = useMutation({
    mutationFn: (role) => profileApi.generateRoadmap(role),
    onSuccess: ({ data }) => setRoadmap(data.data.roadmap),
  })

  const handleGenerate = (e) => {
    e.preventDefault()
    mutation.mutate(targetRole)
  }

  if (roadmap) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Roadmap to {roadmap.role}
        </h3>
        <p className="text-sm text-gray-500">
          Estimated time: {roadmap.estimatedMonths} months
        </p>
        <div className="space-y-4">
          {roadmap.phases?.map((phase, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{phase.title}</h4>
                <span className="text-sm text-gray-500">{phase.duration}</span>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Skills to learn:</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {phase.skillsToLearn?.map((skill) => (
                    <span key={skill} className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {phase.recommendedResources?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Resources:</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {phase.recommendedResources.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Generate Career Roadmap</h3>
      <p className="text-sm text-gray-600">
        Enter your target role and we'll create a personalized learning path based on your current skills.
      </p>
      <Input
        id="targetRole"
        placeholder="e.g., Senior Full Stack Developer"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        required
      />
      <Button
        type="submit"
        loading={mutation.isPending}
        disabled={skills?.length === 0}
      >
        <BookOpen className="h-4 w-4" />
        Generate Roadmap
      </Button>
      {skills?.length === 0 && (
        <p className="text-sm text-amber-600">
          Add skills to your profile first to get a tailored roadmap.
        </p>
      )}
    </form>
  )
}
