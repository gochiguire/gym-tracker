'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function AuthGuard({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace('/')
      } else {
        setUser(u)
        setLoading(false)
      }
    })
    return unsub
  }, [router])

  if (loading) return <div className="center-screen">Loading...</div>

  return children(user)
}
