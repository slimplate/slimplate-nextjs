// hooks for client-side content

import { useState } from 'react'

// this is dummy now, but later on client-side it will output server-side (from files) or git on client-side
export function useSlimplateItem (content, frontmatter) {
  const [source, setSource] = useState(content)

  return [source, s => {
    setSource(serialize(s))
  }]
}

// this is dummy now, but later on client-side it will output server-side (from files) or git on client-side
export function useSlimplateList (list, collectionName) {
  const [items, setItems] = useState(list)

  return items
}
