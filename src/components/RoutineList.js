'use client'

import { useState } from 'react'
import { addRoutine } from '../lib/firestore'

export default function RoutineList({ userId, routines, exercises, onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)

  function toggleExercise(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await addRoutine(userId, { name: name.trim(), exerciseIds: selectedIds })
    setName('')
    setSelectedIds([])
    setOpen(false)
    setSaving(false)
    onAdd()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Routines</h2>
        <button className="btn-icon" onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '+'}
        </button>
      </div>

      {open && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Routine name (e.g. Push Day)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {exercises.length > 0 && (
            <fieldset className="checkbox-group">
              <legend>Exercises</legend>
              {exercises.map((ex) => (
                <label key={ex.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ex.id)}
                    onChange={() => toggleExercise(ex.id)}
                  />
                  {ex.name}
                </label>
              ))}
            </fieldset>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add Routine'}
          </button>
        </form>
      )}

      <ul className="item-list">
        {routines.length === 0 && <li className="empty">No routines yet.</li>}
        {routines.map((r) => (
          <li key={r.id}>
            <span className="item-name">{r.name}</span>
            <span className="item-tag">{(r.exerciseIds || []).length} exercises</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
