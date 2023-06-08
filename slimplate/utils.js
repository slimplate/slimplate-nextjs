import { useEffect, useState } from 'react'
import s from 'slugify'
import shortuuid from 'short-uuid'
import df from 'dateformat'
import tto from 'template-templates'
import * as inflection from 'inflection'

const uuidGenerator = shortuuid()

// these are utils for the filename-string
export const uuid = () => uuidGenerator.uuid()
export const shortUuid = () => uuidGenerator.new() // mhvXdrZT4jP5T8vBxuvm75
export const slugify = value => s(value, { strict: true, lower: true }) // a_cool_title
export const dateFormat = (value, format = 'yyyy-mm-dd') => df(new Date(value || Date.now()), format)
export const titleize = value => inflection.titleize(value)

// tto has weird exports in differnt places....
export const tt = (value = '', vars) => (tto?.default || tto)(value || '', { uuid, shortUuid, slugify, dateFormat, ...vars })

// Hook that works simialr to useState, but persists in localStorage
export function useLocalStorage (k, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue)

  const storageListener = ({ key, newValue, oldValue, storageArea, url }) => {
    if (key === k) {
      setStoredValue(newValue)
    }
  }

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(k)
      setStoredValue(item ? JSON.parse(item) : initialValue)
    } catch (error) {
      console.log(error)
    }
    window.addEventListener('storage', storageListener)
    return () => window.removeEventListener('storage', storageListener)
  }, [])

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      window.localStorage.setItem(k, JSON.stringify(valueToStore))
      // manually trigger storage event
      window.dispatchEvent(new StorageEvent('storage', { key: k, oldValue: storedValue, newValue: valueToStore }))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

// process incoming fields like this
export const loadProcessors = {
  date: v => (v || new Date()).toISOString()
}
