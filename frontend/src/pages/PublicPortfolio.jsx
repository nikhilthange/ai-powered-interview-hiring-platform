import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profileApi } from '../services/profileApi'
import { getMediaUrl } from '../lib/utils'
import { Card, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { SkeletonProfile } from '../components/ui/Skeleton'
import {
  MapPin, Link as LinkIcon, Briefcase, 
  GraduationCap, FolderGit2, Award, FileText, CheckCircle2, AlertCircle
} from 'lucide-react'

export default function PublicPortfolio() {
  const { username } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => profileApi.getPublicProfile(username).then((res) => res.data.data.profile),
    retry: 1
  })

  // SEO Optimization
  useEffect(() => {
    if (data) {
      document.title = `${data.fullName}'s Portfolio | HireMate`
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', data.headline || data.bio || `Check out ${data.fullName}'s professional portfolio.`)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = data.headline || data.bio || `Check out ${data.fullName}'s professional portfolio.`
        document.head.appendChild(meta)
      }
    }
    return () => {
      document.title = 'HireMate'
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) metaDescription.setAttribute('content', 'AI-powered interview and hiring platform.')
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonProfile />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
        <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)] max-w-md w-full text-center">
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Profile Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            This profile doesn't exist or has been set to private.
          </p>
          <Link to="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const profile = data
  const avatarUrl = getMediaUrl(profile.avatarUrl)
  const resumeUrl = getMediaUrl(profile.resumeUrl)

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"></div>
          <CardContent className="px-6 sm:px-10 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 sm:-mt-20 mb-6">
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-[var(--bg-primary)] bg-[var(--bg-secondary)] overflow-hidden shrink-0 shadow-lg relative z-10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold">
                    {profile.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{profile.fullName}</h1>
                {profile.headline && <p className="text-lg text-[var(--text-secondary)] mt-1">{profile.headline}</p>}
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[var(--text-tertiary)]">
                  {profile.location && (
                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.location}</div>
                  )}
                  {profile.experienceYears > 0 && (
                    <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {profile.experienceYears} Years Exp.</div>
                  )}
                  {profile.resumeScore > 0 && (
                     <div className="flex items-center gap-1.5 text-green-600 font-medium">
                       <CheckCircle2 className="h-4 w-4" /> Resume Score: {profile.resumeScore}%
                     </div>
                  )}
                </div>
              </div>
              {resumeUrl && (
                <div className="pb-2">
                  <a href={resumeUrl} download target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                      <FileText className="h-4 w-4 mr-2" /> Download Resume
                    </Button>
                  </a>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mt-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">About</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 mt-6">
              {profile.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]">
                  <LinkIcon className="h-4 w-4" /> Portfolio
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]">
                  <LinkIcon className="h-4 w-4" /> GitHub
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors border border-[#0077b5]/20">
                  <LinkIcon className="h-4 w-4" /> LinkedIn
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Experience */}
            {profile.experience?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Experience</h2>
                </div>
                <div className="space-y-4">
                  {profile.experience.map((exp, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-[var(--bg-primary)]">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-[var(--text-primary)] text-lg">{exp.position}</h3>
                        <p className="font-medium text-indigo-600">{exp.company}</p>
                        <p className="text-sm text-[var(--text-tertiary)] mt-1 mb-3">
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short'}) : ''} - 
                          {exp.current ? ' Present' : (exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short'})}` : '')}
                        </p>
                        {exp.description && <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{exp.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FolderGit2 className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Projects</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.projects.map((proj, idx) => (
                    <Card key={idx} className="border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-purple-300 transition-colors">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-2">{proj.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-3">{proj.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {proj.technologies?.map(tech => (
                            <span key={tech} className="px-2 py-1 rounded-md bg-[var(--bg-secondary)] text-[var(--text-tertiary)] text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                        {proj.url && (
                           <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                             View Project <LinkIcon className="h-3 w-3" />
                           </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Skills</h2>
                </div>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Certificates */}
            {profile.certificates?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Certificates</h2>
                </div>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 flex flex-col gap-3">
                    {profile.certificates.map((cert) => (
                      <div key={cert} className="flex items-start gap-3">
                        <div className="mt-0.5"><Award className="h-4 w-4 text-amber-500" /></div>
                        <span className="text-[var(--text-primary)] font-medium text-sm">{cert}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Education</h2>
                </div>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className={idx > 0 ? "pt-4 border-t border-[var(--border-color)]" : ""}>
                        <h3 className="font-semibold text-[var(--text-primary)]">{edu.institution}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{edu.degree} in {edu.field}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
