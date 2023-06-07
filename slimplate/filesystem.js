// Server-side manager of content

import { glob } from 'glob'
import frontmatter from 'frontmatter'
import { readFileSync } from 'fs'
import { tt } from '@slimplate/utils'

const cache = {}

// this could be imported from somewhere else
export const loadProcessors = {
  date: v => (v || new Date()).toISOString()
}

export default class Content {
  constructor (collection, collectionName, basePath = '.') {
    this.collection = collection
    this.basePath = basePath

    this.collection.name = collectionName

    for (const f of Object.keys(this.collection.fields)) {
      this.collection.fields[f].name = f
    }
  }

  // get all filenames that matches files pattern in def
  async list (grabItems = false) {
    const list = (await glob(this.basePath + this.collection.files)).map(f => '/' + f)
    if (grabItems) {
      return Promise.all(list.map(f => this.get(f)))
    } else {
      return list
    }
  }

  // get a single article, keyed by filename
  async get (filename) {
    if (cache[filename]) {
      return cache[filename]
    }
    const { data, content } = frontmatter(readFileSync(this.basePath + filename, 'utf8'))
    data.url = tt(this.collection.url, { ...data, filename, content })
    data.filename = filename
    cache[filename] = { ...data, children: content }

    // post-process data
    for (const f of Object.keys(cache[filename])) {
      const field = this.collection.fields[f]
      if (field && loadProcessors[field.type]) {
        cache[filename][f] = loadProcessors[field.type](cache[filename][f])
      }
    }

    return cache[filename]
  }
}
