'use client'

import { useEffect, useState, useCallback } from 'react'
import AuthGuard from '../../components/AuthGuard'
import ExerciseList from '../../components/ExerciseList'
import RoutineList from '../../components/RoutineList'
import SessionList from '../../components/SessionList'
import { getExercises, getRoutines, getSessions } from '../../lib/firestore'
import { signOut } from '../../lib/auth'

function Dashboard({ user }) {
  const [exercises, setExercises] = useState([])
  const [routines, setRoutines] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const [e, r, s] = await Promise.all([
      getExercises(user.uid),
      getRoutines(user.uid),
      getSessions(user.uid),
    ])
    setExercises(e)
    setRoutines(r)
    setSessions(s)
    setLoading(false)
  }, [user.uid])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleSignOut() {
    await signOut()
  }

  if (loading) return <div className="center-screen">Loading...</div>

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Gym Tracker</h1>
        <div className="header-right">
          <span>{user.displayName || user.email}</span>
          <button className="btn-secondary" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      <div className="panels">
        <ExerciseList
          userId={user.uid}
          exercises={exercises}
          onAdd={fetchAll}
        />
        <RoutineList
          userId={user.uid}
          routines={routines}
          exercises={exercises}
          onAdd={fetchAll}
        />
        <SessionList
          userId={user.uid}
          sessions={sessions}
          routines={routines}
          exercises={exercises}
          onAdd={fetchAll}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <AuthGuard>{(user) => <Dashboard user={user} />}</AuthGuard>
}
