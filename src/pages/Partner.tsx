import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Card, Field, inputClass, Textarea, Badge } from '../components/ui'
import { TaskList } from '../components/TaskList'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { completionRate, minutesToHourText, pomodoroCountFor, studyMinutesFor, tasksFor, trendFor } from '../utils/stats'
import { todayISO } from '../utils/date'

const quickMessages = ['提醒一下', '去学习', '今天还没打卡', '别摆烂', '稳住，按计划来', '继续坚持', '你已经很接近目标了']
const tags = ['很自律', '进步明显', '有点拖延', '任务安排合理', '学习时长不足', '需要早点开始', '继续保持']

export const Partner = () => {
  const { currentUser, partner } = useSession()
  const { tasks, pomodoros, checkIns, reviews, sendMessage, addReview } = useAppStore()
  const [score, setScore] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>(['继续保持'])
  const [comment, setComment] = useState('')
  if (!currentUser || !partner) return null
  const today = todayISO()
  const partnerTasks = tasksFor(tasks, partner.id, today)
  const partnerCheckIns = checkIns.filter((item) => item.userId === partner.id).slice(0, 3)
  const partnerReviews = reviews.filter((item) => item.toUserId === partner.id).slice(0, 3)
  const trend = trendFor(tasks, pomodoros, currentUser.id, partner.id)

  return (
    <div className="grid gap-4">
      <Card className="grid gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-card bg-primary-soft text-lg font-bold text-primary">{partner.avatar}</div>
            <div>
              <h2 className="text-lg font-bold">{partner.name}</h2>
              <p className="text-sm text-muted">{partner.targetSchool} · {partner.targetMajor}</p>
            </div>
          </div>
          <Badge>{checkIns.some((item) => item.userId === partner.id && item.date === today) ? '今日已打卡' : '今日未打卡'}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 text-center min-[420px]:grid-cols-3">
          <div className="rounded-card bg-slate-50 p-3"><p className="text-xl font-bold">{completionRate(partnerTasks)}%</p><p className="text-xs text-muted">完成率</p></div>
          <div className="rounded-card bg-slate-50 p-3"><p className="text-xl font-bold">{Math.round(studyMinutesFor(tasks, pomodoros, partner.id, today) / 60 * 10) / 10}h</p><p className="text-xs text-muted">学习</p></div>
          <div className="rounded-card bg-slate-50 p-3"><p className="text-xl font-bold">{pomodoroCountFor(pomodoros, partner.id, today)}</p><p className="text-xs text-muted">番茄</p></div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">最近 7 天学习趋势</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(value) => minutesToHourText(Number(value))} />
              <Line type="monotone" dataKey="搭档时长" stroke="#3b82f6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="我的时长" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="grid gap-3">
        <h3 className="font-bold">给搭档发提醒</h3>
        <div className="flex flex-wrap gap-2">
          {quickMessages.map((message) => (
            <Button key={message} variant="secondary" className="min-h-9 px-3 text-xs" onClick={() => sendMessage(message, message.includes('打卡') ? '该打卡了' : '鼓励消息')}>
              {message}
            </Button>
          ))}
        </div>
      </Card>

      <section className="grid gap-3">
        <h3 className="font-bold">搭档今日任务</h3>
        <TaskList tasks={partnerTasks} editable={false} />
      </section>

      <Card className="grid gap-3">
        <h3 className="font-bold">评价今日表现</h3>
        <Field label="评分">
          <input className={inputClass} type="range" min="1" max="5" value={score} onChange={(event) => setScore(Number(event.target.value))} />
        </Field>
        <p className="text-sm font-semibold text-primary">{score} 分</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`min-h-9 rounded-card border px-3 text-xs font-semibold ${selectedTags.includes(tag) ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white text-muted'}`}
              onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])}
            >
              {tag}
            </button>
          ))}
        </div>
        <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="给今天的学习状态留一句具体反馈" />
        <Button onClick={() => { addReview({ score, tags: selectedTags, comment: comment || '今天节奏不错，继续保持。' }); setComment('') }}>提交评价</Button>
      </Card>

      <section className="grid gap-3">
        <h3 className="font-bold">最近打卡与证明</h3>
        {partnerCheckIns.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.date}</p>
              <Badge>{item.mood}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {item.proofImages.map((image) => <img key={image} className="h-28 rounded-card object-cover" src={image} alt="搭档学习证明" />)}
            </div>
          </Card>
        ))}
      </section>

      {partnerReviews.length > 0 && (
        <section className="grid gap-3">
          <h3 className="font-bold">已给出的评价</h3>
          {partnerReviews.map((review) => (
            <Card key={review.id}>
              <p className="font-semibold">{review.score} 分 · {review.tags.join('、')}</p>
              <p className="mt-2 text-sm text-muted">{review.comment}</p>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
