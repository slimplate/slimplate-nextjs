// Server-side manager of content

import { glob } from 'glob'
import frontmatter from 'frontmatter'
import { readFileSync } from 'fs'
import { tt } from '@slimplate/utils'

const cache = {}

export default class Content {
  constructor (collection, basePath = '.') {
    this.collection = collection
    this.basePath = basePath
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
    return cache[filename]
  }
}
