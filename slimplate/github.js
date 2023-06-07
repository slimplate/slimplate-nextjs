import minimatch from 'minimatch'
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

class Git {
  constructor (collection, corsProxy = 'https://cors.isomorphic-git.org') {
    this.collection = collection
    this.corsProxy = corsProxy
  }

  // ensure user is logged in, before doing things
  async requireAuth () {
    if (localStorage.user) {
      this.user = JSON.parse(localStorage.user)
      if (this.user) {
        this.fs = new LightningFS(this.user.login)
        this.pfs = this.fs.promises
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  // make sure the repo is checked out
  async requireClone () {
    if (await this.requireAuth()) {
      // TODO: checkout repo here
      // also get this.repo info from oktokit

      // if clone went ok
      return false
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

// cached copy of git
let git

export function useSlimplate (collection, corsProxy = 'https://cors.isomorphic-git.org') {
  return {
    collection,

    async getClientsideList () {
      git ||= new Git(collection, corsProxy)
      return git.getAll()
    },

    async getClientsideItem (filename) {
      git ||= new Git(collection, corsProxy)

      // TODO: get single item from git

      return null
    }
  }
}
