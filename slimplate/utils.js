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
export const dateFormat = (format = 'yyyy-mm-dd', value) => df(new Date(value || Date.now()), format)
export const titleize = value => inflection.titleize(value)

export const tt = (value = '', vars) => tto.default(value || '', { uuid, shortUuid, slugify, dateFormat, ...vars })

// Hook that works simialr to useState, but persists in localStorage
export function useLocalStorage (key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      setStoredValue(item ? JSON.parse(item) : initialValue)
    } catch (error) {
      console.log(error)
    }
  }, [])

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue]
}
