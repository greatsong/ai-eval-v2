import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useClasses } from '../hooks/useClasses'

const ClassContext = createContext(null)

export function ClassProvider({ children }) {
  const { user } = useAuth()
  const { classes, loading, fetchClasses, createClass, updateClass, deleteClass } = useClasses(user?.id)
  const [currentClass, setCurrentClass] = useState(null)
  const [currentStudent, setCurrentStudent] = useState(null)

  useEffect(() => {
    if (user?.id) fetchClasses()
  }, [user?.id, fetchClasses])

  return (
    <ClassContext.Provider value={{
      classes, loading,
      currentClass, setCurrentClass,
      currentStudent, setCurrentStudent,
      fetchClasses, createClass, updateClass, deleteClass
    }}>
      {children}
    </ClassContext.Provider>
  )
}

export function useClassContext() {
  const context = useContext(ClassContext)
  if (!context) throw new Error('useClassContext must be used within ClassProvider')
  return context
}
