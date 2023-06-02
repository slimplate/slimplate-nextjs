import frontmatter from 'frontmatter'
import { readFileSync } from 'fs'

export default class Content {
  constructor (collectionName, basePath = '.') {
    const { collections } = JSON.parse(readFileSync(basePath + '/.slimplate.json', 'utf8'))
    this.files = collections[collectionName].files
    this.basePath = basePath
  }

  // get all filenames that matches files pattern in def
  async list () {
    const { glob } = await import('glob')
    return (await glob(this.basePath + this.files)).map(f => '/' + f)
  }

  // get a single article, keyed by filename
  async get (filename) {
    const { readFile } = await import('fs/promises')
    const { data, content } = frontmatter(await readFile(this.basePath + filename, 'utf8'))
    return { ...data, children: content }
  }
}

const content = new Content('blog')

console.log(await content.list())
console.log(await content.get('/content/blog/2023-03-08-first.mdx'))
