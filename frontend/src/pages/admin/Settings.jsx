import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { Settings as SettingsIcon, Save } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function AdminSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [form, setForm] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await adminApi.getSettings()
      if (Object.keys(form).length === 0) setForm({
        appName: res.data.settings.appName || '',
        logo: res.data.settings.logo || '',
        maintenanceMode: res.data.settings.maintenanceMode || false,
        jwtExpiry: res.data.settings.jwtExpiry || '7d',
        uploadLimit: res.data.settings.uploadLimit || 5,
        aiProvider: res.data.settings.aiProvider || 'mock',
        smtpHost: res.data.settings.smtp?.host || '',
        smtpPort: res.data.settings.smtp?.port || 587,
        smtpUser: res.data.settings.smtp?.user || '',
        smtpPass: res.data.settings.smtp?.pass || '',
        smtpFrom: res.data.settings.smtp?.from || '',
      })
      return res.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => adminApi.updateSettings(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-settings'] }); toast({ type: 'success', title: 'Saved', message: 'Settings updated successfully.' }) },
    onError: () => toast({ type: 'error', title: 'Error', message: 'Could not save settings.' }),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      smtp: { host: form.smtpHost, port: form.smtpPort, user: form.smtpUser, pass: form.smtpPass, from: form.smtpFrom },
    }
    delete payload.smtpHost; delete payload.smtpPort; delete payload.smtpUser; delete payload.smtpPass; delete payload.smtpFrom
    updateMutation.mutate(payload)
  }

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  if (isLoading) return <SkeletonPage />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">System Settings</h1>
            </div>
            <p className="text-sm text-white/60">Configure global application settings</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-[var(--text-primary)]">General</h2>
              <Input label="Application Name" value={form.appName} onChange={(e) => update('appName', e.target.value)} placeholder="HireMate" />
              <Input label="Logo URL" value={form.logo} onChange={(e) => update('logo', e.target.value)} placeholder="https://example.com/logo.png" />
              <div className="flex items-center gap-3">
                <input type="checkbox" id="maintenanceMode" checked={form.maintenanceMode} onChange={(e) => update('maintenanceMode', e.target.checked)} className="rounded border-[var(--border-color)]" />
                <label htmlFor="maintenanceMode" className="text-sm text-[var(--text-primary)]">Maintenance Mode</label>
              </div>
              <Select label="JWT Expiry" value={form.jwtExpiry} onChange={(e) => update('jwtExpiry', e.target.value)} options={[
                { value: '1d', label: '1 Day' }, { value: '7d', label: '7 Days' }, { value: '30d', label: '30 Days' }, { value: '90d', label: '90 Days' },
              ]} />
              <Input label="Upload Limit (MB)" type="number" value={form.uploadLimit} onChange={(e) => update('uploadLimit', parseInt(e.target.value) || 5)} />
              <Select label="AI Provider" value={form.aiProvider} onChange={(e) => update('aiProvider', e.target.value)} options={[
                { value: 'mock', label: 'Mock AI' }, { value: 'nvidia', label: 'NVIDIA NIM' },
              ]} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-[var(--text-primary)]">SMTP Configuration</h2>
              <Input label="SMTP Host" value={form.smtpHost} onChange={(e) => update('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
              <Input label="SMTP Port" type="number" value={form.smtpPort} onChange={(e) => update('smtpPort', parseInt(e.target.value) || 587)} />
              <Input label="SMTP Username" value={form.smtpUser} onChange={(e) => update('smtpUser', e.target.value)} placeholder="user@gmail.com" />
              <Input label="SMTP Password" type="password" value={form.smtpPass} onChange={(e) => update('smtpPass', e.target.value)} placeholder="••••••••" />
              <Input label="From Address" value={form.smtpFrom} onChange={(e) => update('smtpFrom', e.target.value)} placeholder="noreply@hiremate.com" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 flex justify-end">
          <Button type="submit" loading={updateMutation.isPending} icon={Save}>
            Save Settings
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
