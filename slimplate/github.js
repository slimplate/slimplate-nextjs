/* global localStorage */
import { minimatch } from 'minimatch'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'

import LightningFS from '@isomorphic-git/lightning-fs'

/*
collection: full collection object from .slimplate.json
user: full user-object, including token:

{
  token: "ksdjflskjdfsdf",
  name: "Your Name",
  login: "konsumer",
  email: "you@example.com"
}

You can get user with ButtonLogin
*/

export default class Git {
  constructor (collection, repo, corsProxy = 'https://cors.isomorphic-git.org') {
    this.collection = collection
    this.corsProxy = corsProxy
    this.repo = {
      full_name: repo,
      url: `https://github.com/${repo}.git`
    }
  }

  // ensure user is logged in, before doing things
  async requireAuth () {
    if (localStorage.user) {
      this.user = JSON.parse(localStorage.user)
    }
    return !!this.user
  }

  getAuthUrl () {
    const u = new URL(this.repo.url)
    u.username = this.user.login
    u.password = this.user.token
    return u.toString()
  }

  // make sure the repo is checked out
  async requireClone (opts) {
    if (await this.requireAuth()) {
      this.fs = new LightningFS(this.user.login)
      this.pfs = this.fs.promises

      try {
      // TODO: checkout repo here
      // also get this.repo info from oktokit
        const o = {
          fs: this.fs,
          http,
          dir: `/${this.repo.full_name}`,
          corsProxy: this.corsProxy,
          url: this.getAuthUrl(),
          ref: 'main',
          singleBranch: true,
          depth: 1,
          author: {
            name: this.user.name,
            email: this.user.email || this.user.login
          },
          ...opts
        }

        console.log('Clone options: ', o)

        const c = await git.clone(o)
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    }
    return false
  }

  // get a list of all files in local filesystem
  async allFiles (rootDir = `/${this.repo.full_name}`, existing = []) {
    for (const file of await this.pfs.readdir(rootDir)) {
      if (file === '.git') {
        continue
      }
      const filename = `${rootDir}/${file}`
      const s = await this.pfs.lstat(filename)
      if (s.type === 'dir') {
        await this.allFiles(filename, existing)
      } else {
        existing.push(filename)
      }
    }
    return existing
  }

  // add/commit everything, then push/pull
  syncToRemote () {}

  // get all the filenames that match a glob in local filesystem
  async glob (g) {
    if (await this.requireClone()) {
      return (await this.allFiles()).filter(f => minimatch(f, `/${this.repo.full_name}${g}`)).map(f => f.replace(`/${this.repo.full_name}`, ''))
    }
  }

  // get all files from collection
  async getAll () {
    return (await this.glob(this.collection.files))
  }
}
