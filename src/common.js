import { glob } from 'glob'
import { readFileSync } from 'fs'
import frontmatter from 'frontmatter'
import { readFile } from 'fs/promises'
import { tt } from '@slimplate/utils'

const cache = {}

// TODO: add git stuff to constructor/list/get for client-side. Don't use effect/state

export class Content {
  constructor (collectionName, basePath = '.') {
    const { collections } = JSON.parse(readFileSync(basePath + '/.slimplate.json', 'utf8'))
    this.collection = collections[collectionName]
    this.basePath = basePath
    this.collectionName = collectionName
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
    const { data, content } = frontmatter(await readFile(this.basePath + filename, 'utf8'))
    data.url = tt(this.collection.url, { ...data, filename, content })
    data.filename = filename
    data.collection = this.collection
    data.collectionName = this.collectionName
    cache[filename] = { ...data, children: content }
    return cache[filename]
  }
}
