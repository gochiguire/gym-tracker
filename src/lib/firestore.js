import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Exercises
export async function getExercises(userId) {
  const q = query(
    collection(db, 'exercises'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addExercise(userId, { name, muscleGroup, weightUnit = 'kg' }) {
  return addDoc(collection(db, 'exercises'), {
    userId,
    name,
    muscleGroup,
    weightUnit,
    createdAt: serverTimestamp(),
  })
}

// Routines
export async function getRoutines(userId) {
  const q = query(
    collection(db, 'routines'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addRoutine(userId, { name, exerciseIds }) {
  return addDoc(collection(db, 'routines'), {
    userId,
    name,
    exerciseIds,
    createdAt: serverTimestamp(),
  })
}

export async function updateRoutineExercises(routineId, exerciseId) {
  await updateDoc(doc(db, 'routines', routineId), {
    exerciseIds: arrayUnion(exerciseId),
  })
}

// Sessions
export async function getSessions(userId) {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addSession(userId, { routineId, routineName, sets }) {
  return addDoc(collection(db, 'sessions'), {
    userId,
    routineId,
    routineName,
    sets,
    completedAt: serverTimestamp(),
  })
}
