'use client'

import { useEffect, useState, useCallback } from 'react'
import { Box, CircularProgress } from '@mui/material'
import AuthGuard from '../../components/AuthGuard'
import UserPanel from '../../components/UserPanel'
import RoutinePanel from '../../components/RoutinePanel'
import ExercisePanel from '../../components/ExercisePanel'
import SetPanel from '../../components/SetPanel'
import { getExercises, getRoutines, getSessions, addSession } from '../../lib/firestore'
import { signOut } from '../../lib/auth'

function Dashboard({ user }) {
  const [exercises, setExercises] = useState([])
  const [routines, setRoutines] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRoutine, setSelectedRoutine] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [activeSession, setActiveSession] = useState({})
  const [sessionStarted, setSessionStarted] = useState(false)

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

  useEffect(() => { fetchAll() }, [fetchAll])

  function handleSelectRoutine(routine) {
    setSelectedRoutine(routine)
    setSelectedExercise(null)
    setActiveSession({})
    setSessionStarted(false)
  }

  function addSetToExercise(exerciseId, set) {
    setActiveSession((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), set],
    }))
  }

  function removeSetFromExercise(exerciseId, index) {
    setActiveSession((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).filter((_, i) => i !== index),
    }))
  }

  async function handleCompleteSession() {
    if (!selectedRoutine) return
    const sets = []
    for (const [exerciseId, exerciseSets] of Object.entries(activeSession)) {
      const exercise = exercises.find((e) => e.id === exerciseId)
      exerciseSets.forEach((s) =>
        sets.push({
          exerciseId,
          exerciseName: exercise?.name || '',
          reps: s.reps,
          weight: s.weight,
          unit: s.unit,
        })
      )
    }
    await addSession(user.uid, {
      routineId: selectedRoutine.id,
      routineName: selectedRoutine.name,
      sets,
    })
    setActiveSession({})
    setSessionStarted(false)
    fetchAll()
  }

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gridTemplateRows: { xs: 'auto', md: '1fr 1fr' },
        gap: 1.5,
        p: 1.5,
        height: { md: '100vh' },
        minHeight: { xs: '100vh', md: 'unset' },
        bgcolor: '#f0f2f5',
        boxSizing: 'border-box',
      }}
    >
      <UserPanel
        user={user}
        routines={routines}
        exercises={exercises}
        sessions={sessions}
        onSignOut={signOut}
      />
      <RoutinePanel
        userId={user.uid}
        routines={routines}
        exercises={exercises}
        selectedRoutine={selectedRoutine}
        onSelectRoutine={handleSelectRoutine}
        onAdd={fetchAll}
      />
      <ExercisePanel
        userId={user.uid}
        routine={selectedRoutine}
        exercises={exercises}
        selectedExercise={selectedExercise}
        onSelectExercise={setSelectedExercise}
        sessionStarted={sessionStarted}
        activeSession={activeSession}
        onStartSession={() => setSessionStarted(true)}
        onCompleteSession={handleCompleteSession}
        onAdd={fetchAll}
      />
      <SetPanel
        key={selectedExercise?.id || 'none'}
        exercise={selectedExercise}
        sessions={sessions}
        currentSets={selectedExercise ? (activeSession[selectedExercise.id] || []) : []}
        onAddSet={(set) => selectedExercise && addSetToExercise(selectedExercise.id, set)}
        onRemoveSet={(i) => selectedExercise && removeSetFromExercise(selectedExercise.id, i)}
        sessionStarted={sessionStarted}
      />
    </Box>
  )
}

export default function DashboardPage() {
  return <AuthGuard>{(user) => <Dashboard user={user} />}</AuthGuard>
}
