import type { CheckIn, PomodoroSession, Subject, Task } from '../types/domain'
import { lastNDays, todayISO } from './date'

export const minutesToHourText = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} 分钟`
  return m ? `${h} 小时 ${m} 分钟` : `${h} 小时`
}

export const completionRate = (tasks: Task[]) => {
  if (!tasks.length) return 0
  return Math.round((tasks.filter((task) => task.status === '已完成').length / tasks.length) * 100)
}

export const tasksFor = (tasks: Task[], userId: string, date?: string) =>
  tasks.filter((task) => task.userId === userId && (!date || task.date === date))

export const studyMinutesFor = (
  tasks: Task[],
  pomodoros: PomodoroSession[],
  userId: string,
  date?: string,
) => {
  const taskMinutes = tasksFor(tasks, userId, date).reduce(
    (sum, task) => sum + (task.status === '已完成' ? task.actualMinutes || task.estimatedMinutes : 0),
    0,
  )
  const pomoMinutes = pomodoros
    .filter(
      (session) =>
        session.userId === userId &&
        session.completed &&
        (!date || session.createdAt.slice(0, 10) === date),
    )
    .reduce((sum, session) => sum + session.durationMinutes, 0)
  return Math.max(taskMinutes, pomoMinutes)
}

export const pomodoroCountFor = (pomodoros: PomodoroSession[], userId: string, date = todayISO()) =>
  pomodoros.filter(
    (session) => session.userId === userId && session.completed && session.createdAt.slice(0, 10) === date,
  ).length

export const checkInStreak = (checkIns: CheckIn[], userId: string, anchorISO = todayISO()) => {
  const dates = new Set(checkIns.filter((item) => item.userId === userId).map((item) => item.date))
  let streak = 0
  const cursor = new Date(`${anchorISO}T08:00:00`)
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export const subjectMinutes = (tasks: Task[], userId: string) => {
  const subjects: Subject[] = ['数学', '英语', '政治', '专业课', '复盘', '其他']
  return subjects.map((subject) => ({
    subject,
    minutes: tasks
      .filter((task) => task.userId === userId && task.subject === subject && task.status === '已完成')
      .reduce((sum, task) => sum + (task.actualMinutes || task.estimatedMinutes), 0),
  }))
}

export const trendFor = (
  tasks: Task[],
  pomodoros: PomodoroSession[],
  userId: string,
  partnerId: string,
) =>
  lastNDays(7).map((date) => {
    const mine = tasksFor(tasks, userId, date)
    const partner = tasksFor(tasks, partnerId, date)
    return {
      date: date.slice(5),
      我的时长: studyMinutesFor(tasks, pomodoros, userId, date),
      搭档时长: studyMinutesFor(tasks, pomodoros, partnerId, date),
      我的完成率: completionRate(mine),
      搭档完成率: completionRate(partner),
      番茄数: pomodoroCountFor(pomodoros, userId, date),
    }
  })
