/* global localStorage */
import { minimatch } from 'minimatch'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'
import LightningFS from '@isomorphic-git/lightning-fs'

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
    u.password = this.token
    return u.toString()
  }

  // clone a repo
  async clone (opts) {
    const o = {
      fs: this.fs,
      http,
      dir: `/${this.repo.full_name}`,
      proxy: this.proxy,
      url: this.getAuthUrl(),
      ref: this.branch,
      singleBranch: true,
      depth: 1,
      author: {
        name: this.user.name,
        email: this.user.email || this.user.login
      },
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
      proxy: this.proxy,
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
      proxy: this.proxy,
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
      proxy: this.proxy,
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
    // TODO: this should be tidied up
  }

  // git push from local filesystem
  async push (opts) {
    const o = {
      fs: this.fs,
      http,
      proxy: this.proxy,
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
      proxy: this.proxy,
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
}
