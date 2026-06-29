import { useEffect, useMemo, useState } from 'react'
import type { Subject } from '../types/domain'
import { Button, Card, Field, inputClass } from '../components/ui'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { minutesToHourText, pomodoroCountFor, tasksFor } from '../utils/stats'
import { todayISO } from '../utils/date'

const modes = [
  { label: '专注', minutes: 25 },
  { label: '短休息', minutes: 5 },
  { label: '长休息', minutes: 15 },
]

export const Pomodoro = () => {
  const { currentUser } = useSession()
  const { tasks, pomodoros, addPomodoro } = useAppStore()
  const [mode, setMode] = useState(modes[0])
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [taskId, setTaskId] = useState('')
  const [subject, setSubject] = useState<Subject>('数学')
  const todayTasks = currentUser ? tasksFor(tasks, currentUser.id, todayISO()) : []

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value > 1) return value - 1
        window.clearInterval(timer)
        setRunning(false)
        if (currentUser && mode.label === '专注') addPomodoro({ taskId: taskId || undefined, subject, durationMinutes: mode.minutes })
        return mode.minutes * 60
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [addPomodoro, currentUser, mode, subject, taskId, running])

  const display = useMemo(() => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [seconds])

  const todaySessions = currentUser ? pomodoros.filter((item) => item.userId === currentUser.id && item.createdAt.slice(0, 10) === todayISO()) : []

  return (
    <div className="grid gap-4">
      <Card className="grid gap-5 text-center">
        <div className="grid grid-cols-3 gap-2">
          {modes.map((item) => (
            <button
              key={item.label}
              className={`min-h-11 rounded-card border text-sm font-semibold ${mode.label === item.label ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white text-muted'}`}
              onClick={() => { setMode(item); setSeconds(item.minutes * 60); setRunning(false) }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="py-6">
          <p className="text-sm text-muted">当前 {mode.label}</p>
          <p className="mt-3 text-6xl font-bold tabular-nums tracking-normal text-ink">{display}</p>
        </div>
        <div className="grid gap-3 text-left">
          <Field label="关联任务">
            <select className={inputClass} value={taskId} onChange={(event) => setTaskId(event.target.value)}>
              <option value="">不关联任务</option>
              {todayTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
          </Field>
          <Field label="科目">
            <select className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value as Subject)}>
              <option>数学</option><option>英语</option><option>政治</option><option>专业课</option><option>复盘</option><option>其他</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => setRunning(true)} disabled={running}>开始</Button>
          <Button variant="secondary" onClick={() => setRunning(false)}>暂停</Button>
          <Button variant="secondary" onClick={() => { setRunning(false); setSeconds(mode.minutes * 60) }}>重置</Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            if (mode.label === '专注') addPomodoro({ taskId: taskId || undefined, subject, durationMinutes: mode.minutes })
          }}
        >
          演示：立即完成一个番茄
        </Button>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-muted">今日番茄</p>
          <p className="mt-2 text-2xl font-bold">{currentUser ? pomodoroCountFor(pomodoros, currentUser.id, todayISO()) : 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">专注总时长</p>
          <p className="mt-2 text-2xl font-bold">{minutesToHourText(todaySessions.reduce((sum, item) => sum + item.durationMinutes, 0))}</p>
        </Card>
      </div>
    </div>
  )
}
