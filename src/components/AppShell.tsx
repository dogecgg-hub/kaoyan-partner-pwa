import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, CalendarDays, CheckSquare, Home, Timer, UserRound, UsersRound } from 'lucide-react'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/tasks', label: '任务', icon: CheckSquare },
  { to: '/pomodoro', label: '番茄钟', icon: Timer },
  { to: '/partner', label: '搭档', icon: UsersRound },
  { to: '/profile', label: '我的', icon: UserRound },
]

const titles: Record<string, string> = {
  '/': '今日总览',
  '/today': '今日任务',
  '/tasks': '任务管理',
  '/calendar': '周日程',
  '/pomodoro': '番茄钟',
  '/check-in': '每日打卡',
  '/partner': '搭档监督',
  '/stats': '学习统计',
  '/notifications': '消息提醒',
  '/profile': '我的',
}

export const AppShell = () => {
  const { currentUser } = useSession()
  const location = useLocation()
  const unread = useAppStore(
    (state) => state.messages.filter((message) => message.toUserId === state.currentUserId && !message.read).length,
  )

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="safe-top sticky top-0 z-20 border-b border-line/80 bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-muted">{currentUser?.targetSchool}</p>
            <h1 className="text-lg font-bold tracking-normal">{titles[location.pathname] ?? '考研搭子'}</h1>
          </div>
          <NavLink
            to="/notifications"
            className="relative grid size-11 place-items-center rounded-card border border-line bg-white text-muted"
            aria-label="消息提醒"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-2 top-2 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </NavLink>
        </div>
      </header>

      <main className="safe-pb mx-auto max-w-5xl px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[var(--safe-bottom)] shadow-[0_-8px_24px_rgb(22_32_51/0.06)] backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-5 px-2 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-card text-xs font-medium ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-muted'
                }`
              }
            >
              <Icon size={20} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="fixed bottom-24 right-4 z-20 hidden flex-col gap-2 md:flex">
        <NavLink to="/calendar" className="grid size-11 place-items-center rounded-card border border-line bg-white text-muted shadow-card">
          <CalendarDays size={20} />
        </NavLink>
      </div>
    </div>
  )
}
