import { useEffect, useState } from 'react'
import type { Priority, Subject, Task, TaskStatus } from '../types/domain'
import { todayISO } from '../utils/date'
import { Button, Field, inputClass, Textarea } from './ui'

const subjects: Subject[] = ['数学', '英语', '政治', '专业课', '复盘', '其他']
const statuses: TaskStatus[] = ['未开始', '进行中', '已完成', '已拖延']
const priorities: Priority[] = ['高', '中', '低']

type TaskDraft = {
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
}

const emptyDraft = (): TaskDraft => ({
  title: '',
  subject: '数学',
  date: todayISO(),
  startTime: '08:00',
  endTime: '09:30',
  estimatedMinutes: 90,
  actualMinutes: 0,
  priority: '中',
  status: '未开始',
  note: '',
  proofRequired: false,
})

export const TaskForm = ({
  task,
  defaultDate,
  onSubmit,
  onCancel,
}: {
  task?: Task
  defaultDate?: string
  onSubmit: (draft: TaskDraft) => void
  onCancel?: () => void
}) => {
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft)

  useEffect(() => {
    setDraft(task ? { ...task } : { ...emptyDraft(), date: defaultDate ?? todayISO() })
  }, [task, defaultDate])

  const patch = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!draft.title.trim()) return
        onSubmit({ ...draft, title: draft.title.trim() })
        if (!task) setDraft(emptyDraft())
      }}
    >
      <Field label="任务标题">
        <input className={inputClass} value={draft.title} onChange={(event) => patch('title', event.target.value)} placeholder="例如：高数强化课第 12 讲" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="科目">
          <select className={inputClass} value={draft.subject} onChange={(event) => patch('subject', event.target.value as Subject)}>
            {subjects.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="日期">
          <input className={inputClass} type="date" value={draft.date} onChange={(event) => patch('date', event.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="开始">
          <input className={inputClass} type="time" value={draft.startTime} onChange={(event) => patch('startTime', event.target.value)} />
        </Field>
        <Field label="结束">
          <input className={inputClass} type="time" value={draft.endTime} onChange={(event) => patch('endTime', event.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="预计分钟">
          <input className={inputClass} type="number" min="5" value={draft.estimatedMinutes} onChange={(event) => patch('estimatedMinutes', Number(event.target.value))} />
        </Field>
        <Field label="状态">
          <select className={inputClass} value={draft.status} onChange={(event) => patch('status', event.target.value as TaskStatus)}>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="优先级">
          <select className={inputClass} value={draft.priority} onChange={(event) => patch('priority', event.target.value as Priority)}>
            {priorities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
      </div>
      <Field label="备注">
        <Textarea value={draft.note} onChange={(event) => patch('note', event.target.value)} placeholder="复习重点、资料页码或注意事项" />
      </Field>
      <label className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-white px-3 text-sm font-medium">
        <input type="checkbox" checked={draft.proofRequired} onChange={(event) => patch('proofRequired', event.target.checked)} />
        需要上传学习证明
      </label>
      <div className="flex gap-2">
        <Button className="flex-1" type="submit">{task ? '保存任务' : '新增任务'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>}
      </div>
    </form>
  )
}
