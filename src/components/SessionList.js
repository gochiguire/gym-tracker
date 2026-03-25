'use client'

import { useState } from 'react'
import { addSession } from '../lib/firestore'

export default function SessionList({ userId, sessions, routines, exercises, onAdd }) {
  const [open, setOpen] = useState(false)
  const [routineId, setRoutineId] = useState('')
  const [sets, setSets] = useState([])
  const [saving, setSaving] = useState(false)

  function handleRoutineChange(id) {
    setRoutineId(id)
    const routine = routines.find((r) => r.id === id)
    if (!routine) { setSets([]); return }
    const routineExercises = (routine.exerciseIds || [])
      .map((eid) => exercises.find((e) => e.id === eid))
      .filter(Boolean)
    setSets(routineExercises.map((ex) => ({ exerciseId: ex.id, exerciseName: ex.name, reps: '', weightKg: '' })))
  }

  function updateSet(index, field, value) {
    setSets((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!routineId) return
    const routine = routines.find((r) => r.id === routineId)
    const filledSets = sets.map((s) => ({
      ...s,
      reps: Number(s.reps) || 0,
      weightKg: Number(s.weightKg) || 0,
    }))
    setSaving(true)
    await addSession(userId, { routineId, routineName: routine.name, sets: filledSets })
    setRoutineId('')
    setSets([])
    setOpen(false)
    setSaving(false)
    onAdd()
  }

  function formatDate(ts) {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Sessions</h2>
        <button className="btn-icon" onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '+'}
        </button>
      </div>

      {open && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <select value={routineId} onChange={(e) => handleRoutineChange(e.target.value)} required>
            <option value="">Select routine</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {sets.map((s, i) => (
            <div key={s.exerciseId} className="set-row">
              <span className="set-name">{s.exerciseName}</span>
              <input
                type="number"
                placeholder="Reps"
                min="0"
                value={s.reps}
                onChange={(e) => updateSet(i, 'reps', e.target.value)}
              />
              <input
                type="number"
                placeholder="kg"
                min="0"
                step="0.5"
                value={s.weightKg}
                onChange={(e) => updateSet(i, 'weightKg', e.target.value)}
              />
            </div>
          ))}

          <button type="submit" className="btn-primary" disabled={saving || !routineId}>
            {saving ? 'Saving...' : 'Log Session'}
          </button>
        </form>
      )}

      <ul className="item-list">
        {sessions.length === 0 && <li className="empty">No sessions yet.</li>}
        {sessions.map((s) => (
          <li key={s.id}>
            <span className="item-name">{s.routineName}</span>
            <span className="item-tag">{formatDate(s.completedAt)}</span>
            <span className="item-sub">{(s.sets || []).length} exercises</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
