'use client'

import { useState } from 'react'
import { addExercise } from '../lib/firestore'

export default function ExerciseList({ userId, exercises, onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await addExercise(userId, { name: name.trim(), muscleGroup: muscleGroup.trim() })
    setName('')
    setMuscleGroup('')
    setOpen(false)
    setSaving(false)
    onAdd()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Exercises</h2>
        <button className="btn-icon" onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '+'}
        </button>
      </div>

      {open && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Muscle group (e.g. Chest)"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add Exercise'}
          </button>
        </form>
      )}

      <ul className="item-list">
        {exercises.length === 0 && <li className="empty">No exercises yet.</li>}
        {exercises.map((ex) => (
          <li key={ex.id}>
            <span className="item-name">{ex.name}</span>
            {ex.muscleGroup && <span className="item-tag">{ex.muscleGroup}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
