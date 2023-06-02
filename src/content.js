import { glob } from 'glob'
import { readFileSync } from 'fs'
import frontmatter from 'frontmatter'
import { readFile } from 'fs/promises'

export default class Content {
  constructor (collectionName, basePath = '.') {
    const { collections } = JSON.parse(readFileSync(basePath + '/.slimplate.json', 'utf8'))
    this.collection = collections[collectionName]
    this.basePath = basePath
    this.collectionName = collectionName
  }

  // get all filenames that matches files pattern in def
  async list () {
    return (await glob(this.basePath + this.collection.files)).map(f => '/' + f)
  }

  // get a single article, keyed by filename
  async get (filename) {
    const { data, content } = frontmatter(await readFile(this.basePath + filename, 'utf8'))
    data.url = this.collection.url
    return { ...data, children: content }
  }
}
