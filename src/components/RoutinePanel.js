'use client'

import { useState } from 'react'
import {
  Paper, Box, Typography, RadioGroup, FormControlLabel, Radio,
  Chip, Divider, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, FormGroup, Checkbox,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { addRoutine } from '../lib/firestore'

export default function RoutinePanel({
  userId, routines, exercises, selectedRoutine, onSelectRoutine, onAdd,
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [selectedExIds, setSelectedExIds] = useState([])
  const [saving, setSaving] = useState(false)

  function toggleExercise(id) {
    setSelectedExIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true)
    await addRoutine(userId, { name: name.trim(), exerciseIds: selectedExIds })
    setName('')
    setSelectedExIds([])
    setDialogOpen(false)
    setSaving(false)
    onAdd()
  }

  function handleClose() {
    setDialogOpen(false)
    setName('')
    setSelectedExIds([])
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2, pt: 2, pb: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Typography variant="overline" color="text.secondary" fontWeight={600}>
          Routines
        </Typography>
        <IconButton size="small" onClick={() => setDialogOpen(true)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1 }}>
        {routines.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            No routines yet. Create one to get started.
          </Typography>
        ) : (
          <RadioGroup
            value={selectedRoutine?.id || ''}
            onChange={(e) =>
              onSelectRoutine(routines.find((r) => r.id === e.target.value) || null)
            }
          >
            {routines.map((routine) => (
              <FormControlLabel
                key={routine.id}
                value={routine.id}
                control={<Radio size="small" />}
                sx={{ mb: 0.5 }}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
                    <Typography variant="body2">{routine.name}</Typography>
                    <Chip
                      label={`${(routine.exerciseIds || []).length} ex`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>New Routine</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Routine name"
            placeholder="e.g. Push Day"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            fullWidth
            size="small"
            sx={{ mt: 1, mb: 2 }}
          />
          {exercises.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary">
                Add exercises (optional)
              </Typography>
              <FormGroup sx={{ mt: 0.5 }}>
                {exercises.map((ex) => (
                  <FormControlLabel
                    key={ex.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedExIds.includes(ex.id)}
                        onChange={() => toggleExercise(ex.id)}
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
