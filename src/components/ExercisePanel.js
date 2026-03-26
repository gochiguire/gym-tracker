'use client'

import { useState } from 'react'
import {
  Paper, Box, Typography, RadioGroup, FormControlLabel, Radio,
  Chip, Divider, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, FormGroup, Checkbox, Stack,
  Select, MenuItem, InputLabel, FormControl,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { addExercise, updateRoutineExercises } from '../lib/firestore'

export default function ExercisePanel({
  userId, routine, exercises, selectedExercise, onSelectExercise,
  sessionStarted, activeSession, onStartSession, onCompleteSession, onAdd,
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addExistingIds, setAddExistingIds] = useState([])
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState('')
  const [newUnit, setNewUnit] = useState('kg')
  const [saving, setSaving] = useState(false)

  const routineExercises = routine
    ? (routine.exerciseIds || []).map((id) => exercises.find((e) => e.id === id)).filter(Boolean)
    : []

  const libraryExercises = exercises.filter(
    (e) => !(routine?.exerciseIds || []).includes(e.id)
  )

  function toggleAddExisting(id) {
    setAddExistingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleAddExercises() {
    if (!routine) return
    setSaving(true)
    for (const id of addExistingIds) {
      await updateRoutineExercises(routine.id, id)
    }
    if (newName.trim()) {
      const ref = await addExercise(userId, {
        name: newName.trim(),
        muscleGroup: newMuscle.trim(),
        weightUnit: newUnit,
      })
      await updateRoutineExercises(routine.id, ref.id)
    }
    setAddExistingIds([])
    setNewName('')
    setNewMuscle('')
    setNewUnit('kg')
    setDialogOpen(false)
    setSaving(false)
    onAdd()
  }

  function handleClose() {
    setDialogOpen(false)
    setAddExistingIds([])
    setNewName('')
    setNewMuscle('')
    setNewUnit('kg')
  }

  const totalSets = Object.values(activeSession).reduce((sum, s) => sum + s.length, 0)
  const canSave = addExistingIds.length > 0 || newName.trim()

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2, pt: 2, pb: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" fontWeight={600}>
            Exercises
          </Typography>
          {routine && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1, fontStyle: 'italic' }}
            >
              {routine.name}
            </Typography>
          )}
        </Box>
        {routine && (
          <IconButton
            size="small"
            onClick={() => setDialogOpen(true)}
            disabled={sessionStarted}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1 }}>
        {!routine ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Select a routine to see its exercises.
          </Typography>
        ) : routineExercises.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            No exercises in this routine. Add some with the + button.
          </Typography>
        ) : (
          <RadioGroup
            value={selectedExercise?.id || ''}
            onChange={(e) =>
              onSelectExercise(routineExercises.find((ex) => ex.id === e.target.value) || null)
            }
          >
            {routineExercises.map((ex) => {
              const setCount = (activeSession[ex.id] || []).length
              return (
                <FormControlLabel
                  key={ex.id}
                  value={ex.id}
                  control={<Radio size="small" />}
                  sx={{ mb: 0.5, alignItems: 'flex-start' }}
                  label={
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center',
                        gap: 0.75, flexWrap: 'wrap', py: 0.25,
                      }}
                    >
                      <Typography variant="body2">{ex.name}</Typography>
                      {ex.muscleGroup && (
                        <Chip label={ex.muscleGroup} size="small" variant="outlined" />
                      )}
                      <Chip label={ex.weightUnit || 'kg'} size="small" />
                      {sessionStarted && setCount > 0 && (
                        <Chip label={`${setCount} sets`} size="small" color="success" />
                      )}
                    </Box>
                  }
                />
              )
            })}
          </RadioGroup>
        )}
      </Box>

      {routine && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1.5 }}>
            {!sessionStarted ? (
              <Button
                variant="contained"
                size="small"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={onStartSession}
                disabled={routineExercises.length === 0}
              >
                Start Session
              </Button>
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  {totalSets} set{totalSets !== 1 ? 's' : ''} logged
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={onCompleteSession}
                >
                  Complete
                </Button>
              </Stack>
            )}
          </Box>
        </>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Add Exercises — {routine?.name}</DialogTitle>
        <DialogContent>
          {libraryExercises.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                From your library
              </Typography>
              <FormGroup sx={{ mb: 2 }}>
                {libraryExercises.map((ex) => (
                  <FormControlLabel
                    key={ex.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={addExistingIds.includes(ex.id)}
                        onChange={() => toggleAddExisting(ex.id)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{ex.name}</Typography>
                        {ex.muscleGroup && (
                          <Chip label={ex.muscleGroup} size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
              <Divider sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  or create new
                </Typography>
              </Divider>
            </>
          )}
          <TextField
            label="Exercise name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 1.5 }}
          />
          <TextField
            label="Muscle group"
            value={newMuscle}
            onChange={(e) => setNewMuscle(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 1.5 }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Weight unit</InputLabel>
            <Select
              value={newUnit}
              label="Weight unit"
              onChange={(e) => setNewUnit(e.target.value)}
            >
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="lbs">lbs</MenuItem>
              <MenuItem value="block">Block number</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddExercises}
            disabled={saving || !canSave}
          >
            {saving ? 'Saving…' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
