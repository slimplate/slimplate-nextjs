import { useEffect, useState } from 'react'
import Git from '@slimplate/github'
import cx from 'classnames'
import { IconCheck, IconBoxAlignRight, IconBoxAlignLeft } from '@tabler/icons-react'

export default function StatusIndicator ({ showText = false, collection, repo, proxy, branch }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const git = new Git({ collection, repo, proxy, branch })
    setLoading(true)
    git.init().then(async () => {
      if (git.updated) {
        const s = await git.getProjectStatus()
        setLoading(false)
        setStatus(s)
      }
    })
  }, [collection, repo, proxy, branch])

  return (
    <div className={cx('flex items-center')}>
      <div>
        {loading && (
          <div className='flex items-center' title='Syncing with remote'>
            <span className='loading loading-spinner loading-xs' />
            {showText && 'Loading'}
          </div>
        )}
        {!loading && status?.commitsAhead === 0 && (
          <div className='flex items-center' title='You are up to date with remote'>
            <IconCheck className='text-success' size='16' />
            {showText && 'Up to date'}
          </div>
        )}
        {!loading && status?.commitsAhead > 0 && (
          <div className='flex items-center' title='You are ahead of remote, sync changes'>
            <IconBoxAlignRight className='text-warning' size='16' />
            {showText && 'Local Changes'}
          </div>
        )}
        {!loading && status?.commitsAhead < 0 && (
          <div className='flex items-center' title='You are behind remote, sync changes'>
            <IconBoxAlignLeft className='text-warning' size='16' />
            {showText && 'Behind Remote'}
          </div>
        )}
      </div>
    </div>
  )
}
