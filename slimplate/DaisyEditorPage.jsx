
// TODO: map title to correct title field from collection

export default function DaisyEditorPage ({ item, children }) {
  return (
    <div className='drawer'>
      <input id='slimplate-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        <label htmlFor='slimplate-drawer' className='btn btn-primary drawer-button'>Edit Page</label>
        {children}
      </div>
      <div className='drawer-side'>
        <label htmlFor='slimplate-drawer' className='drawer-overlay' />
        <div className='menu p-4 w-80 h-full bg-base-200 text-base-content overflow-hidden'>
          <label htmlFor='slimplate-drawer' className='btn btn-primary mt-4'>COOL!</label>
          <h2>EDITOR HERE</h2>
        </div>
      </div>
    </div>
  )
}