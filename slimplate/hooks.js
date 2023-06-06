async function setupGit (collection) {
  // TODO: if no user in localstorage, just quit
  // TODO: create shared git if user is logged in, use collection to set things up
}

export function useSlimplate (collection) {
  return {
    async getClientsideList () {
      const git = await setupGit(collection)
      if (!git) {
        return []
      }

      // TODO: get list of all content from git
    },

    async getClientsideItem (filename) {
      const git = await setupGit(collection)
      if (!git) {
        return null
      }

      // TODO: get single item from git
    }
  }
}
