"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface UserInfo {
  email: string | null
  role: string | null
  name: string | null
  lenderId: string | null
  borrowerId: string | null
  companyName: string | null
  avatar: string | null
}

interface UserContextType {
  user: UserInfo
  isLoading: boolean
  refreshUser: () => void
  updateUser: (partial: Partial<UserInfo>) => void
  clearUser: () => void
}

const defaultUser: UserInfo = {
  email: null,
  role: null,
  name: null,
  lenderId: null,
  borrowerId: null,
  companyName: null,
  avatar: null,
}

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  isLoading: true,
  refreshUser: () => {},
  updateUser: () => {},
  clearUser: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo>(defaultUser)
  const [isLoading, setIsLoading] = useState(true)

  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return
    setUser({
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('userRole'),
      name: localStorage.getItem('userName'),
      lenderId: localStorage.getItem('lenderId'),
      borrowerId: localStorage.getItem('borrowerId'),
      companyName: localStorage.getItem('companyName'),
      avatar: localStorage.getItem('avatar'),
    })
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const refreshUser = useCallback(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const updateUser = useCallback((partial: Partial<UserInfo>) => {
    setUser(prev => {
      const next = { ...prev, ...partial }
      // Sync back to localStorage
      if (typeof window !== 'undefined') {
        Object.entries(partial).forEach(([key, value]) => {
          const storageKey = key === 'email' ? 'userEmail'
            : key === 'role' ? 'userRole'
            : key === 'name' ? 'userName'
            : key
          if (value) localStorage.setItem(storageKey, value)
          else localStorage.removeItem(storageKey)
        })
      }
      return next
    })
  }, [])

  const clearUser = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
      localStorage.removeItem('lenderId')
      localStorage.removeItem('borrowerId')
      localStorage.removeItem('companyName')
      localStorage.removeItem('avatar')
    }
    setUser(defaultUser)
  }, [])

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
