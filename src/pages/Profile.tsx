import { LogOut, Trash2 } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { daysBetween } from '../utils/date'
import { minutesToHourText } from '../utils/stats'

export const Profile = () => {
  const { currentUser, partner } = useSession()
  const logout = useAppStore((state) => state.logout)
  const resetAll = useAppStore((state) => state.resetAll)
  const dataMode = useAppStore((state) => state.dataMode)
  const syncStatus = useAppStore((state) => state.syncStatus)
  if (!currentUser || !partner) return null
  const remaining = Math.max(0, -daysBetween(currentUser.examDate))

  return (
    <div className="grid gap-4">
      <Card className="flex items-center gap-3">
        <div className="grid size-14 place-items-center rounded-card bg-primary-soft text-xl font-bold text-primary">{currentUser.avatar}</div>
        <div>
          <h2 className="text-lg font-bold">{currentUser.name}</h2>
          <p className="text-sm text-muted">{currentUser.email}</p>
        </div>
      </Card>
      <Card className="grid gap-3">
        <h3 className="font-bold">备考信息</h3>
        <Info label="目标院校" value={currentUser.targetSchool} />
        <Info label="目标专业" value={currentUser.targetMajor} />
        <Info label="每日目标" value={minutesToHourText(currentUser.dailyGoalMinutes)} />
        <Info label="考研倒计时" value={`${remaining} 天`} />
        <Info label="固定搭档" value={`${partner.name} · ${partner.targetSchool}`} />
        <Info label="数据模式" value={dataMode === 'supabase' ? `Supabase ${syncStatus}` : '本地离线'} />
      </Card>
      <Card className="grid gap-3">
        <h3 className="font-bold">添加到 iPhone 主屏幕</h3>
        <p className="text-sm leading-6 text-muted">在 Safari 打开 Vercel 公网地址，点击分享按钮，选择“添加到主屏幕”。首次在线打开后，应用会缓存外壳；如遇打不开，先关闭 VPN/切换 Wi-Fi 或蜂窝网络，再重新打开。</p>
      </Card>
      <Card className="grid gap-2">
        <Button variant="secondary" onClick={logout}><LogOut size={17} />退出登录</Button>
        <Button variant="danger" onClick={resetAll}><Trash2 size={17} />清理本地数据</Button>
      </Card>
    </div>
  )
}

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-line py-2 last:border-b-0">
    <span className="text-sm text-muted">{label}</span>
    <span className="text-sm font-semibold">{value}</span>
  </div>
)
