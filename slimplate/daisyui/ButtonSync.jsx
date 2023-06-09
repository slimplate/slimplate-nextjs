import Git from '@slimplate/github'
import { useLocalStorage } from '@slimplate/utils'
import StatusIndicator from './StatusIndicator'

export default function ButtonSync ({ collection, repo, proxy, branch = 'main', children = 'Sync' }) {
  const [user] = useLocalStorage('user', false)

  if (!user) {
    return null
  }

  const handleClick = () => {
    const git = new Git({ collection, repo, proxy, branch })
    git.init().then(async () => {
      if (git.updated) {
        await git.pull()
        await git.push()
      }
    })
  }

  return (
    <>
      <button onClick={handleClick} className='btn btn-primary'>
        <StatusIndicator collection={collection} repo={repo} proxy={proxy} branch={branch} />
        {children}
      </button>
    </>
  )
}
