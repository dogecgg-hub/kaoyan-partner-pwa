import { useMemo, useState } from 'react'
import type { Mood } from '../types/domain'
import { Button, Card, Field, inputClass, Textarea } from '../components/ui'
import { useAppStore } from '../features/useAppStore'
import { useSession } from '../hooks/useSession'
import { minutesToHourText, studyMinutesFor, tasksFor } from '../utils/stats'
import { todayISO } from '../utils/date'

const moods: Mood[] = ['状态很好', '正常完成', '有点拖延', '状态较差']

export const CheckIn = () => {
  const { currentUser } = useSession()
  const { tasks, pomodoros, checkIns, addCheckIn } = useAppStore()
  const [mood, setMood] = useState<Mood>('正常完成')
  const [summary, setSummary] = useState('')
  const [tomorrowPlan, setTomorrowPlan] = useState('')
  const [proofImages, setProofImages] = useState<string[]>([])
  const today = todayISO()
  const myTasks = currentUser ? tasksFor(tasks, currentUser.id, today) : []
  const totalStudyMinutes = currentUser ? studyMinutesFor(tasks, pomodoros, currentUser.id, today) : 0
  const completedTaskCount = myTasks.filter((task) => task.status === '已完成').length
  const history = useMemo(
    () => checkIns.filter((item) => item.userId === currentUser?.id).slice(0, 5),
    [checkIns, currentUser?.id],
  )

  if (!currentUser) return null

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div>
          <h2 className="font-bold">今日打卡</h2>
          <p className="mt-1 text-sm text-muted">今日已学习 {minutesToHourText(totalStudyMinutes)}，完成 {completedTaskCount}/{myTasks.length} 项任务。</p>
        </div>
        <Field label="学习状态">
          <select className={inputClass} value={mood} onChange={(event) => setMood(event.target.value as Mood)}>
            {moods.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="今日学习总结">
          <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="今天最大收获、卡点和复盘事项" />
        </Field>
        <Field label="明日计划">
          <Textarea value={tomorrowPlan} onChange={(event) => setTomorrowPlan(event.target.value)} placeholder="明天先做什么，哪些任务必须完成" />
        </Field>
        <Field label="学习证明图片">
          <input
            className={inputClass}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              setProofImages(files.map((file) => URL.createObjectURL(file)))
            }}
          />
        </Field>
        {proofImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {proofImages.map((image) => <img className="h-32 rounded-card object-cover" key={image} src={image} alt="学习证明预览" />)}
          </div>
        )}
        <Button
          onClick={() => {
            addCheckIn({
              date: today,
              totalStudyMinutes,
              completedTaskCount,
              totalTaskCount: myTasks.length,
              mood,
              summary: summary || '完成今日计划，继续保持节奏。',
              tomorrowPlan: tomorrowPlan || '明天继续按优先级推进。',
              proofImages,
            })
            setSummary('')
            setTomorrowPlan('')
            setProofImages([])
          }}
        >
          提交打卡
        </Button>
      </Card>
      <section className="grid gap-3">
        <h2 className="font-bold">最近打卡</h2>
        {history.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{item.date}</h3>
              <span className="text-sm text-muted">{item.mood}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
            {item.proofImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {item.proofImages.map((image) => <img className="h-28 rounded-card object-cover" key={image} src={image} alt="学习证明" />)}
              </div>
            )}
          </Card>
        ))}
      </section>
    </div>
  )
}
