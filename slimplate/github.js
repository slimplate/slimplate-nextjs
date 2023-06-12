/* global localStorage */
import { minimatch } from 'minimatch'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'
import LightningFS from '@isomorphic-git/lightning-fs'
import { tt, loadProcessors } from '@slimplate/utils'
import matter from 'gray-matter'

export default class Git {
  constructor ({ collection, repo, proxy = 'https://cors.isomorphic-git.org', branch = 'main' }) {
    this.collection = collection
    this.proxy = proxy
    this.branch = branch
    this.repo = {
      full_name: repo,
      url: `https://github.com/${repo}.git`
    }

    for (const f of Object.keys(this.collection.fields)) {
      this.collection.fields[f].name = f
    }
  }

  // return true if the file/dir exists in filesystyem
  async exists (filename = '') {
    try {
      await this.pfs.lstat(`/${this.repo.full_name}/${filename}`)
      return true
    } catch (e) {
      return false
    }
  }

  // pull/clone a repo to local filesystem
  async init () {
    this.updated = false

    if (localStorage.user) {
      this.user = JSON.parse(localStorage.user)
    }
    if (!this.user) {
      return
    }
    this.fs = new LightningFS(this.user.login)
    this.pfs = this.fs.promises

    if (await this.exists('.git/config')) {
      await this.pull()
    } else {
      await this.clone()
    }
    this.updated = true
  }

  // get the URL to this repo, but with username/password (for basic auth)
  getAuthUrl () {
    const u = new URL(this.repo.url)
    u.username = this.user.login
    u.password = this.user.token
    return u.toString()
  }

  async getCommitStatusWithDiff () {
    const remote = (await this.fetch()).fetchHead
    const log = await this.log()
    const local = log[0].oid

    const diff = await this.diff(remote, local)
    diff.commitsAhead = log.findIndex(c => c.oid === remote)
    return diff
  }

  // clone a repo
  async clone (opts) {
    const o = {
      fs: this.fs,
      http,
      dir: `/${this.repo.full_name}`,
      corsProxy: this.proxy,
      url: this.getAuthUrl(),
      ref: this.branch,
      singleBranch: true,
      depth: 1,
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      // this will do a non-authed request first, then retry with creds. I prefer always with creds (basic auth in URL)
      // onAuth: async () => {
      //   return {
      //     username: this.user.login,
      //     password: this.user.token
      //   }
      // },
      ...opts
    }
    await git.clone(o)
  }

  // get a git log
  async log (opts = {}) {
    return git.log({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      ...opts
    })
  }

  // fetches updates to remote
  async fetch (opts = {}) {
    return git.fetch({
      fs: this.fs,
      http,
      dir: `/${this.repo.full_name}`,
      corsProxy: this.proxy,
      url: this.getAuthUrl(),
      ref: this.branch,
      ...opts
    })
  }

  // gets a status for project
  async status (opts = {}) {
    return git.fetch({
      fs: this.fs,
      ref: this.branch,
      http,
      dir: `/${this.repo.full_name}`,
      corsProxy: this.proxy,
      url: this.getAuthUrl(),
      ...opts
    })
  }

  // get a single file from filesystem
  async read (filename, encoding) {
    return this.pfs.readFile(`/${this.repo.full_name}/${filename}`, encoding)
  }

  // write a single file to filesystem
  async write (filename, contents) {
    return this.pfs.writeFile(`/${this.repo.full_name}/${filename}`, contents)
  }

  // delete a file or dir, recursively, from filesystem
  async rm (filepath, opts) {
    await git.remove({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      filepath: filepath.replace(/^\//, ''),
      ...opts
    })
    await this.pfs.unlink(`/${this.repo.full_name}/${filepath}`, { recursive: true, force: true, ...opts })
  }

  // check the status of the entire project
  async checkStatus () {
    return Promise.all((await this.getAll()).map(async f => {
      const filepath = f.filename.replace(/^\//, '').replace(this.repo.full_name, '').replace(/^\//, '')
      const status = await git.status({
        fs: this.fs,
        dir: `/${this.repo.full_name}`,
        filepath
      })

      return { filepath, status }
    }))
  }

  // get a remote list of git refs
  async listServerRefs (opts) {
    return git.listServerRefs({
      http,
      corsProxy: this.proxy,
      url: this.getAuthUrl(),
      ...opts
    })
  }

  // git add a file
  async add (filepath, opts) {
    return git.add({
      fs: this.fs,
      filepath: filepath.replace(/^\//, ''),
      dir: `/${this.repo.full_name}`,
      ...opts
    })
  }

  // git commit local filesystem, message is a string-template
  async commit (message = '${user.login} commit from web', opts) {
    return git.commit({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      message: tt(message, this),
      ...opts
    })
  }

  // get diff between two commits

  async diff (commitHash1, commitHash2) {
  // get the list of files for commit 1
    let commit1Files = await git.listFiles({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      ref: commitHash1
    })

    // get the list of files for commit 2
    let commit2Files = await git.listFiles({
      fs: this.fs,
      dir: `/${this.repo.full_name}`,
      ref: commitHash2
    })

    commit1Files = commit1Files.filter(file => minimatch(file, this.collection.files.substring(1)))
    commit2Files = commit2Files.filter(file => minimatch(file, this.collection.files.substring(1)))

    const removedFiles = commit1Files.filter(f => !commit2Files.includes(f))
    const addedFiles = commit2Files.filter(f => !commit1Files.includes(f))

    const modifiedFiles = []

    if (commitHash1 !== commitHash2) {
      for (const file of commit1Files.filter(f => commit2Files.includes(f))) {
        const [blob1, blob2] = await Promise.all([
          git.readBlob({
            fs: this.fs,
            dir: `/${this.repo.full_name}`,
            filepath: file,
            oid: commitHash1
          }),
          git.readBlob({
            fs: this.fs,
            dir: `/${this.repo.full_name}`,
            filepath: file,
            oid: commitHash2
          })
        ])

        if (blob1.oid !== blob2.oid) {
          modifiedFiles.push(file)
        }
      }
    }

    const inSync = removedFiles.length === 0 && addedFiles.length === 0 && modifiedFiles.length === 0

    return {
      removedFiles,
      addedFiles,
      modifiedFiles,
      inSync
    }
  }

  // git push from local filesystem
  async push (opts) {
    const o = {
      fs: this.fs,
      http,
      corsProxy: this.proxy,
      dir: `/${this.repo.full_name}`,
      ref: this.branch,
      url: this.getAuthUrl(),
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      ...opts
    }
    return git.push(o)
  }

  // git pull to local filesystem
  async pull (opts) {
    const o = {
      fs: this.fs,
      http,
      corsProxy: this.proxy,
      dir: `/${this.repo.full_name}`,
      ref: this.branch,
      singleBranch: true,
      url: this.getAuthUrl(),
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
      ...opts
    }
    return git.pull(o)
  }

  // get a list of all files in local filesystem
  async getAll (rootDir, existing = []) {
    rootDir = rootDir || `/${this.repo.full_name}`
    for (const file of await this.pfs.readdir(rootDir)) {
      if (file === '.git') {
        continue
      }
      const filename = `${rootDir}/${file}`
      const s = await this.pfs.lstat(filename)
      if (s.type === 'dir') {
        await this.getAll(filename, existing)
      } else {
        existing.push({ filename })
      }
    }
    return existing
  }

  // get all the filenames that match a glob in local filesystem
  async glob (g) {
    return (await this.getAll()).filter(f => minimatch(f.filename, `/${this.repo.full_name}${g}`)).map(f => f.filename.replace(`/${this.repo.full_name}`, ''))
  }

  // recursively makes a directory
  async mkdirp (dirname) {
    let prefix = `/${this.repo.full_name}`
    for (const directory of dirname.split('/')) {
      try {
        await this.pfs.mkdir(prefix + directory)
      } catch (error) {}
      prefix += directory + '/'
    }
  }

  async getAllItems () {
    const out = []
    for (const filename of await this.glob(this.collection.files)) {
      const { data, content, excerpt } = matter(await this.read(filename, 'utf8'), { excerpt: true })
      data.url = tt(this.collection.url, { ...data, filename, content })
      data.filename = filename
      data.excerpt = excerpt
      const record = { ...data, children: content }

      // post-process data
      for (const f of Object.keys(record)) {
        const field = this.collection.fields[f]
        if (field && loadProcessors[field.type]) {
          record[f] = loadProcessors[field.type](record[f])
        }
      }
      out.push(record)
    }
    return out
  }
}
