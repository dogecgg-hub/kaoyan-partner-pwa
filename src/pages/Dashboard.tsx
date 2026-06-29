import { Link } from 'react-router-dom'
import { CalendarDays, CheckCircle2, MessageCircle, Timer, TrendingUp } from 'lucide-react'
import { Card, Button, Badge } from '../components/ui'
import { TaskList } from '../components/TaskList'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { checkInStreak, completionRate, minutesToHourText, pomodoroCountFor, studyMinutesFor, tasksFor } from '../utils/stats'
import { formatChinaDate, timeAgo, todayISO } from '../utils/date'

export const Dashboard = () => {
  const { currentUser, partner } = useSession()
  const { tasks, messages, checkIns, pomodoros } = useAppStore()
  if (!currentUser || !partner) return null
  const today = todayISO()
  const myTasks = tasksFor(tasks, currentUser.id, today)
  const partnerTasks = tasksFor(tasks, partner.id, today)
  const completed = myTasks.filter((task) => task.status === '已完成').length
  const unread = messages.filter((message) => message.toUserId === currentUser.id).slice(0, 3)
  const partnerChecked = checkIns.some((item) => item.userId === partner.id && item.date === today)

  return (
    <div className="grid gap-4">
      <section className="grid gap-3">
        <p className="text-sm font-medium text-muted">{formatChinaDate(today)}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <p className="text-xs text-muted">今日任务</p>
            <p className="mt-2 text-2xl font-bold">{completed}/{myTasks.length}</p>
            <p className="mt-1 text-xs text-muted">完成率 {completionRate(myTasks)}%</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">学习时长</p>
            <p className="mt-2 text-2xl font-bold">{Math.round(studyMinutesFor(tasks, pomodoros, currentUser.id, today) / 60 * 10) / 10}h</p>
            <p className="mt-1 text-xs text-muted">目标 {minutesToHourText(currentUser.dailyGoalMinutes)}</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">连续打卡</p>
            <p className="mt-2 text-2xl font-bold">{checkInStreak(checkIns, currentUser.id)} 天</p>
            <p className="mt-1 text-xs text-muted">保持节奏</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">番茄钟</p>
            <p className="mt-2 text-2xl font-bold">{pomodoroCountFor(pomodoros, currentUser.id, today)}</p>
            <p className="mt-1 text-xs text-muted">今日完成</p>
          </Card>
        </div>
      </section>

      <Card className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">固定搭档</p>
            <h2 className="text-base font-bold">{partner.name}</h2>
          </div>
          <Badge className={partnerChecked ? 'bg-green-50 text-success' : 'bg-orange-50 text-warning'}>
            {partnerChecked ? '已打卡' : '未打卡'}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 text-center min-[420px]:grid-cols-3">
          <div className="rounded-card bg-slate-50 p-3">
            <p className="text-lg font-bold">{completionRate(partnerTasks)}%</p>
            <p className="text-xs text-muted">任务完成率</p>
          </div>
          <div className="rounded-card bg-slate-50 p-3">
            <p className="text-lg font-bold">{Math.round(studyMinutesFor(tasks, pomodoros, partner.id, today) / 60 * 10) / 10}h</p>
            <p className="text-xs text-muted">学习时长</p>
          </div>
          <div className="rounded-card bg-slate-50 p-3">
            <p className="text-lg font-bold">{pomodoroCountFor(pomodoros, partner.id, today)}</p>
            <p className="text-xs text-muted">番茄</p>
          </div>
        </div>
        <Link to="/partner"><Button variant="secondary" className="w-full">查看搭档状态</Button></Link>
      </Card>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">今日待办</h2>
          <Link className="text-sm font-semibold text-primary" to="/tasks">管理</Link>
        </div>
        <TaskList tasks={myTasks.slice(0, 4)} editable={false} />
      </section>

      <section className="grid gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link to="/today"><Button variant="secondary" className="w-full px-2"><CheckCircle2 size={17} />今日</Button></Link>
          <Link to="/calendar"><Button variant="secondary" className="w-full px-2"><CalendarDays size={17} />日程</Button></Link>
          <Link to="/check-in"><Button variant="secondary" className="w-full px-2"><MessageCircle size={17} />打卡</Button></Link>
          <Link to="/stats"><Button variant="secondary" className="w-full px-2"><TrendingUp size={17} />统计</Button></Link>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">最近提醒</h2>
          <Link className="text-sm font-semibold text-primary" to="/notifications">全部</Link>
        </div>
        <div className="grid gap-2">
          {unread.map((message) => (
            <Card key={message.id} className="flex items-start gap-3 p-3">
              <Timer size={18} className="mt-0.5 text-primary" />
              <div>
                <p className="text-sm font-medium">{message.content}</p>
                <p className="mt-1 text-xs text-muted">{timeAgo(message.createdAt)}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
