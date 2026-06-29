import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../components/ui'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { checkInStreak, minutesToHourText, subjectMinutes, trendFor } from '../utils/stats'
import { lastNDays } from '../utils/date'

const colors = ['#3b82f6', '#16a34a', '#f59e0b', '#6366f1', '#ef4444', '#94a3b8']

export const Stats = () => {
  const { currentUser, partner } = useSession()
  const { tasks, pomodoros, checkIns } = useAppStore()
  if (!currentUser || !partner) return null
  const trend = trendFor(tasks, pomodoros, currentUser.id, partner.id)
  const subjectData = subjectMinutes(tasks, currentUser.id).filter((item) => item.minutes > 0)
  const weekDates = lastNDays(7)
  const weekTasks = tasks.filter((task) => task.userId === currentUser.id && weekDates.includes(task.date))
  const completed = weekTasks.filter((task) => task.status === '已完成')
  const weekMinutes = completed.reduce((sum, task) => sum + (task.actualMinutes || task.estimatedMinutes), 0)

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><p className="text-xs text-muted">本周学习</p><p className="mt-2 text-xl font-bold">{minutesToHourText(weekMinutes)}</p></Card>
        <Card><p className="text-xs text-muted">完成任务</p><p className="mt-2 text-xl font-bold">{completed.length}</p></Card>
        <Card><p className="text-xs text-muted">连续打卡</p><p className="mt-2 text-xl font-bold">{checkInStreak(checkIns, currentUser.id)} 天</p></Card>
      </div>
      <Card>
        <h2 className="mb-3 font-bold">最近 7 天学习时长</h2>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="我的时长" stroke="#3b82f6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="搭档时长" stroke="#16a34a" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-bold">任务完成率对比</h2>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={trend}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="我的完成率" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="搭档完成率" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-bold">科目学习时长占比</h2>
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={subjectData} dataKey="minutes" nameKey="subject" innerRadius={50} outerRadius={82} paddingAngle={2}>
                {subjectData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => minutesToHourText(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-bold">番茄钟数量趋势</h2>
        <div className="h-52">
          <ResponsiveContainer>
            <BarChart data={trend}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="番茄数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
