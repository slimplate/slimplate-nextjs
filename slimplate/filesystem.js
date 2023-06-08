// Server-side manager of content

import { glob } from 'glob'
import matter from 'gray-matter'
import { readFileSync } from 'fs'
import { tt, loadProcessors } from '@slimplate/utils'

const cache = {}

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
    const { data, content, excerpt } = matter(readFileSync(this.basePath + filename, 'utf8'), { excerpt: true })
    data.url = tt(this.collection.url, { ...data, filename, content })
    data.excerpt = excerpt
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
