import type { AppData, CheckIn, Message, PomodoroSession, Review, Task, User } from '../types/domain'
import { lastNDays, todayISO } from '../utils/date'

const now = new Date()
const isoNow = now.toISOString()
const days = lastNDays(7)
const today = todayISO()

export const users: User[] = [
  {
    id: 'user-a',
    email: 'userA@example.com',
    password: 'password123',
    name: '林见山',
    avatar: '林',
    targetSchool: '北京理工大学',
    targetMajor: '能源动力',
    partnerId: 'user-b',
    dailyGoalMinutes: 480,
    examDate: '2026-12-26',
    createdAt: isoNow,
  },
  {
    id: 'user-b',
    email: 'userB@example.com',
    password: 'password123',
    name: '周知夏',
    avatar: '周',
    targetSchool: '上海交通大学',
    targetMajor: '能源动力',
    partnerId: 'user-a',
    dailyGoalMinutes: 450,
    examDate: '2026-12-26',
    createdAt: isoNow,
  },
]

const task = (
  id: string,
  userId: string,
  title: string,
  subject: Task['subject'],
  date: string,
  status: Task['status'],
  startTime: string,
  endTime: string,
  estimatedMinutes: number,
  priority: Task['priority'],
  note = '',
  proofRequired = false,
): Task => ({
  id,
  userId,
  title,
  subject,
  date,
  startTime,
  endTime,
  estimatedMinutes,
  actualMinutes: status === '已完成' ? estimatedMinutes : 0,
  priority,
  status,
  note,
  proofRequired,
  proofImageUrl: proofRequired && status === '已完成' ? demoProof(subject) : undefined,
  createdAt: isoNow,
  updatedAt: isoNow,
  completedAt: status === '已完成' ? isoNow : undefined,
})

const demoProof = (subject: string) =>
  `https://dummyimage.com/640x420/eaf2ff/2563eb&text=${encodeURIComponent(subject + ' 学习证明')}`

export const tasks: Task[] = [
  task('t-a-1', 'user-a', '高数强化课第 12 讲 + 660 题 30 道', '数学', today, '进行中', '08:00', '10:30', 150, '高', '先听课，再整理错题。'),
  task('t-a-2', 'user-a', '背诵考研词汇 100 个 + 阅读真题 1 篇', '英语', today, '已完成', '10:45', '12:15', 90, '中'),
  task('t-a-3', 'user-a', '肖秀荣精讲精练马原部分 20 页', '政治', today, '未开始', '14:00', '15:00', 60, '中'),
  task('t-a-4', 'user-a', '传热学导热章节复习 + 课后题整理', '专业课', today, '未开始', '19:30', '21:30', 120, '高', '', true),
  task('t-a-5', 'user-a', '整理今日错题和明日计划', '复盘', today, '未开始', '22:00', '22:40', 40, '低'),
  task('t-b-1', 'user-b', '数学 880 线代综合题 25 道', '数学', today, '已完成', '08:30', '10:20', 110, '高'),
  task('t-b-2', 'user-b', '英语二阅读真题 2018 Text 2 精读', '英语', today, '已完成', '10:40', '11:40', 60, '中'),
  task('t-b-3', 'user-b', '传热学对流换热公式复盘', '专业课', today, '进行中', '15:00', '17:00', 120, '高', '', true),
  task('t-b-4', 'user-b', '政治史纲框架整理', '政治', today, '未开始', '20:00', '21:00', 60, '低'),
  ...days.flatMap((date, index) => {
    if (date === today) return []
    return [
      task(`hist-a-${index}-1`, 'user-a', '数学错题二刷与公式默写', '数学', date, '已完成', '08:10', '10:10', 120, '高'),
      task(`hist-a-${index}-2`, 'user-a', '英语长难句拆解 20 句', '英语', date, index % 3 === 0 ? '已拖延' : '已完成', '14:00', '15:00', 60, '中'),
      task(`hist-b-${index}-1`, 'user-b', '专业课章节框架复述', '专业课', date, '已完成', '09:00', '11:00', 120, '高'),
      task(`hist-b-${index}-2`, 'user-b', '政治选择题 50 道', '政治', date, index % 2 === 0 ? '已完成' : '已拖延', '20:00', '21:00', 60, '中'),
    ]
  }),
]

export const checkIns: CheckIn[] = days.slice(0, 6).flatMap((date, index) => [
  {
    id: `check-a-${date}`,
    userId: 'user-a',
    date,
    totalStudyMinutes: 390 + index * 18,
    completedTaskCount: index % 3 === 0 ? 3 : 4,
    totalTaskCount: 5,
    mood: index % 4 === 0 ? '有点拖延' : '正常完成',
    summary: '完成了主线科目，错题复盘还可以更细。',
    tomorrowPlan: '上午数学，下午英语，晚上专业课。',
    proofImages: [demoProof('复盘')],
    createdAt: `${date}T22:20:00.000Z`,
  },
  {
    id: `check-b-${date}`,
    userId: 'user-b',
    date,
    totalStudyMinutes: 360 + index * 20,
    completedTaskCount: 4,
    totalTaskCount: 5,
    mood: index % 2 === 0 ? '状态很好' : '正常完成',
    summary: '专业课推进稳定，英语阅读速度变快。',
    tomorrowPlan: '继续保持上午长专注。',
    proofImages: [demoProof('专业课')],
    createdAt: `${date}T22:10:00.000Z`,
  },
])

export const messages: Message[] = [
  {
    id: 'm-1',
    fromUserId: 'user-b',
    toUserId: 'user-a',
    type: '鼓励消息',
    content: '稳住，按计划来，今天把专业课那块拿下。',
    read: false,
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: 'm-2',
    fromUserId: 'user-a',
    toUserId: 'user-b',
    type: '该开始学习了',
    content: '下午场开始啦，先开一个番茄钟。',
    read: true,
    createdAt: new Date(Date.now() - 130 * 60_000).toISOString(),
  },
]

export const reviews: Review[] = [
  {
    id: 'r-1',
    fromUserId: 'user-b',
    toUserId: 'user-a',
    date: days[5],
    score: 4,
    tags: ['任务安排合理', '继续保持'],
    comment: '节奏很好，晚上复盘再提前一点就更稳。',
    createdAt: `${days[5]}T22:40:00.000Z`,
  },
]

export const pomodoros: PomodoroSession[] = [
  {
    id: 'p-a-1',
    userId: 'user-a',
    taskId: 't-a-2',
    subject: '英语',
    startTime: `${today}T10:45:00.000Z`,
    endTime: `${today}T11:10:00.000Z`,
    durationMinutes: 25,
    completed: true,
    createdAt: `${today}T11:10:00.000Z`,
  },
  {
    id: 'p-b-1',
    userId: 'user-b',
    taskId: 't-b-1',
    subject: '数学',
    startTime: `${today}T08:30:00.000Z`,
    endTime: `${today}T08:55:00.000Z`,
    durationMinutes: 25,
    completed: true,
    createdAt: `${today}T08:55:00.000Z`,
  },
]

export const initialData: AppData = {
  users,
  tasks,
  checkIns,
  messages,
  reviews,
  pomodoros,
}
