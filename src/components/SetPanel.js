'use client'

import { useState } from 'react'
import {
  Paper, Box, Typography, Divider, IconButton, Button,
  TextField, Select, MenuItem, FormControl, InputLabel,
  List, ListItem, ListItemText, Chip, Stack,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'

function formatWeight(weight, unit) {
  if (unit === 'block') return `Block ${weight}`
  return `${weight} ${unit}`
}

function getLastPerformance(sessions, exerciseId) {
  for (const session of sessions) {
    const sets = (session.sets || []).filter((s) => s.exerciseId === exerciseId)
    if (sets.length > 0) {
      return {
        date: session.completedAt?.toDate?.() || null,
        sets,
      }
    }
  }
  return null
}

export default function SetPanel({
  exercise, sessions, currentSets, onAddSet, onRemoveSet, sessionStarted,
}) {
  const defaultUnit = exercise?.weightUnit || 'kg'
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState(defaultUnit)

  function handleAddSet(e) {
    e.preventDefault()
    if (!reps) return
    onAddSet({ reps: Number(reps), weight: Number(weight) || 0, unit })
    setReps('')
    setWeight('')
  }

  const lastPerf = exercise && !sessionStarted
    ? getLastPerformance(sessions, exercise.id)
    : null

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={600}>
          Sets
        </Typography>
        {exercise && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {exercise.name}
            </Typography>
            {exercise.muscleGroup && (
              <Chip label={exercise.muscleGroup} size="small" variant="outlined" />
            )}
          </Box>
        )}
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
        {!exercise ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Select an exercise to track sets.
          </Typography>
        ) : !sessionStarted ? (
          /* Last performance view */
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ display: 'block', mb: 1 }}
            >
              LAST PERFORMANCE
            </Typography>
            {lastPerf ? (
              <>
                {lastPerf.date && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {lastPerf.date.toLocaleDateString()}
                  </Typography>
                )}
                <List dense disablePadding>
                  {lastPerf.sets.map((s, i) => (
                    <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            Set {i + 1}:{' '}
                            <strong>{s.reps} reps</strong>
                            {' × '}
                            {formatWeight(s.weight, s.unit || defaultUnit)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No previous data for this exercise.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.5 }}>
              Start a session to log sets.
            </Typography>
          </Box>
        ) : (
          /* Active session view */
          <Box>
            {currentSets.length > 0 && (
              <>
                <List dense disablePadding sx={{ mb: 1.5 }}>
                  {currentSets.map((s, i) => (
                    <ListItem
                      key={i}
                      disablePadding
                      sx={{ py: 0.25 }}
                      secondaryAction={
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => onRemoveSet(i)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            Set {i + 1}:{' '}
                            <strong>{s.reps} reps</strong>
                            {' × '}
                            {formatWeight(s.weight, s.unit)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ mb: 1.5 }} />
              </>
            )}

            <Box component="form" onSubmit={handleAddSet}>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextField
                  label="Reps"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  size="small"
                  sx={{ width: 72 }}
                  required
                />
                <TextField
                  label="Weight"
                  type="number"
                  inputProps={{ min: 0, step: 0.5 }}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  size="small"
                  sx={{ width: 80 }}
                />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={unit}
                    label="Unit"
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <MenuItem value="kg">kg</MenuItem>
                    <MenuItem value="lbs">lbs</MenuItem>
                    <MenuItem value="block">Block</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  sx={{ minWidth: 36, px: 1 }}
                >
                  <AddIcon fontSize="small" />
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
