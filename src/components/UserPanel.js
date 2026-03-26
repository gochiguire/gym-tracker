'use client'

import { Paper, Box, Avatar, Typography, Button, Divider, Stack } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'

export default function UserPanel({ user, routines, exercises, sessions, onSignOut }) {
  const initials = user.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.email?.[0] || 'U').toUpperCase()

  const stats = [
    { value: routines.length, label: 'Routines' },
    { value: exercises.length, label: 'Exercises' },
    { value: sessions.length, label: 'Sessions' },
  ]

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5, overflow: 'hidden' }}>
      <Typography variant="overline" color="text.secondary" fontWeight={600}>
        Profile
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
        <Avatar
          src={user.photoURL || undefined}
          sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem' }}
        >
          {!user.photoURL && initials}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={600} lineHeight={1.3}>
            {user.displayName || 'Athlete'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Stack direction="row" spacing={4} sx={{ mt: 2.5 }}>
        {stats.map(({ value, label }) => (
          <Box key={label} sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button
          startIcon={<LogoutIcon />}
          onClick={onSignOut}
          variant="outlined"
          color="inherit"
          size="small"
        >
          Sign Out
        </Button>
      </Box>
    </Paper>
  )
}
