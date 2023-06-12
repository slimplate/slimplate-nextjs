import cx from 'classnames'
import { IconCheck, IconBoxAlignRight, IconBoxAlignLeft } from '@tabler/icons-react'

export function StatusIndicator ({ status, showText = false }) {
  return (
    <div className={cx('flex items-center')}>
      <div>
        {status.commitsAhead === undefined && (
          <div className='flex items-center' title='Syncing with remote'>
            <span className='loading loading-spinner loading-xs' />
            {showText && 'Loading'}
          </div>
        )}
        {status?.commitsAhead === 0 && (
          <div className='flex items-center' title='You are up to date with remote'>
            <IconCheck className='text-success' size='16' />
            {showText && 'Up to date'}
          </div>
        )}
        {status?.commitsAhead > 0 && (
          <div className='flex items-center' title='You are ahead of remote, sync changes'>
            <IconBoxAlignRight className='text-warning' size='16' />
            {showText && 'Local Changes'}
          </div>
        )}
        {status?.commitsAhead < 0 && (
          <div className='flex items-center' title='You are behind remote, sync changes'>
            <IconBoxAlignLeft className='text-warning' size='16' />
            {showText && 'Behind Remote'}
          </div>
        )}
      </div>
    </div>
  )
}
