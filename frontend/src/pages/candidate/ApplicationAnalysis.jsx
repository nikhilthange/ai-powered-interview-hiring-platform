import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../../services/applicationApi'
import { PageSpinner } from '../../components/ui/Spinner'
import { ArrowLeft, Trophy, AlertTriangle, Lightbulb } from 'lucide-react'

export default function ApplicationAnalysis() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['application-analysis', id],
    queryFn: () => applicationApi.getApplicationAnalysis(id).then((r) => r.data),
  })

  if (isLoading) return <PageSpinner />

  const analysis = data?.data
  if (!analysis) return <p className="text-gray-500">Analysis not available.</p>

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/my-applications" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Application Analysis</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">ATS Score</p>
          <p className="mt-1 text-4xl font-bold text-indigo-600">{analysis.atsScore}</p>
          <p className="text-xs text-gray-400">/100</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">Match Percent</p>
          <p className="mt-1 text-4xl font-bold text-green-600">{analysis.matchPercent}%</p>
          <p className="text-xs text-gray-400">job requirement match</p>
        </div>
      </div>

      {analysis.aiAnalysis?.strengths?.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-green-800">Strengths</h2>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
            {analysis.aiAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {analysis.aiAnalysis?.weaknesses?.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-red-800">Weaknesses</h2>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {analysis.aiAnalysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {analysis.aiAnalysis?.interviewTips?.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-blue-800">Interview Tips</h2>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
            {analysis.aiAnalysis.interviewTips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
