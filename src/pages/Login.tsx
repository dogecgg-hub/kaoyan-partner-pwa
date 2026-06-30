import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LockKeyhole, Mail, Sprout } from 'lucide-react'
import { useAppStore } from '../features/useAppStore'
import { Button, Card, Field, inputClass } from '../components/ui'

export const Login = () => {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const login = useAppStore((state) => state.login)
  const dataMode = useAppStore((state) => state.dataMode)
  const syncStatus = useAppStore((state) => state.syncStatus)
  const syncError = useAppStore((state) => state.syncError)
  const [email, setEmail] = useState('userA@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  if (currentUserId) return <Navigate to="/" replace />

  return (
    <main className="min-h-screen bg-page px-4 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center gap-6">
        <div className="grid gap-3 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-card bg-primary-soft text-primary">
            <Sprout size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">考研搭子监督</h1>
            <p className="mt-2 text-sm leading-6 text-muted">两个人固定互相监督，每天计划、打卡、复盘。</p>
          </div>
        </div>

        <Card className="grid gap-4">
          <Field label="邮箱">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input className={`${inputClass} pl-10`} value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </Field>
          <Field label="密码">
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input className={`${inputClass} pl-10`} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
          </Field>
          {error && <p className="rounded-card bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button
            onClick={() => {
              setError('')
              if (!login(email, password)) setError('演示账号或密码不正确')
            }}
          >
            登录
          </Button>
          <div className="grid gap-2 rounded-card bg-slate-50 p-3 text-xs leading-5 text-muted">
            <p>演示账号：userA@example.com / password123</p>
            <p>演示账号：userB@example.com / password123</p>
            <p>{dataMode === 'supabase' ? `Supabase 同步：${syncStatus}` : '当前为本地离线模式，可独立运行。'}</p>
            {syncError && <p className="text-danger">{syncError}</p>}
          </div>
          <Button variant="ghost" type="button">忘记密码</Button>
        </Card>
      </div>
    </main>
  )
}
