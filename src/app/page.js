'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { signInWithGoogle } from '../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard')
      } else {
        setLoading(false)
      }
    })
    return unsub
  }, [router])

  async function handleSignIn() {
    setError('')
    try {
      await signInWithGoogle()
    } catch (e) {
      setError('Sign-in failed. Please try again.')
    }
  }

  if (loading) {
    return <div className="center-screen">Loading...</div>
  }

  return (
    <div className="center-screen">
      <div className="login-box">
        <h1>Gym Tracker</h1>
        <p>Track your weightlifting progress</p>
        <button className="btn-primary" onClick={handleSignIn}>
          Sign in with Google
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
