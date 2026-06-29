export type Subject = '数学' | '英语' | '政治' | '专业课' | '复盘' | '其他'
export type TaskStatus = '未开始' | '进行中' | '已完成' | '已拖延'
export type Priority = '高' | '中' | '低'
export type Mood = '状态很好' | '正常完成' | '有点拖延' | '状态较差'
export type MessageType =
  | '任务未完成提醒'
  | '该打卡了'
  | '该开始学习了'
  | '番茄钟提醒'
  | '鼓励消息'
  | '自定义消息'

export interface User {
  id: string
  email: string
  password: string
  name: string
  avatar: string
  targetSchool: string
  targetMajor: string
  partnerId: string
  dailyGoalMinutes: number
  examDate: string
  createdAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  subject: Subject
  date: string
  startTime: string
  endTime: string
  estimatedMinutes: number
  actualMinutes: number
  priority: Priority
  status: TaskStatus
  note: string
  proofRequired: boolean
  proofImageUrl?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface CheckIn {
  id: string
  userId: string
  date: string
  totalStudyMinutes: number
  completedTaskCount: number
  totalTaskCount: number
  mood: Mood
  summary: string
  tomorrowPlan: string
  proofImages: string[]
  createdAt: string
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  type: MessageType
  content: string
  relatedTaskId?: string
  read: boolean
  createdAt: string
}

export interface Review {
  id: string
  fromUserId: string
  toUserId: string
  date: string
  score: number
  tags: string[]
  comment: string
  createdAt: string
}

export interface PomodoroSession {
  id: string
  userId: string
  taskId?: string
  subject: Subject
  startTime: string
  endTime: string
  durationMinutes: number
  completed: boolean
  createdAt: string
}

export interface AppData {
  currentUserId?: string
  users: User[]
  tasks: Task[]
  checkIns: CheckIn[]
  messages: Message[]
  reviews: Review[]
  pomodoros: PomodoroSession[]
}
