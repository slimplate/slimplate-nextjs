import { useLocalStorage } from 'react-use'

export default function ButtonLogin () {
  const [user, setUser, removeUser] = useLocalStorage('user', false)

  const onSubmit = e => {
    e.preventDefault()
    // user.token = whatever
    // setUser(user)
  }

  if (user) {
    return <div>LOGOUT</div>
  }

  const showModal = e => {
    window.modal_slimplate_login.showModal()
  }

  return (
    <>
      <button className='btn' onClick={() => showModal()}>Login</button>
      <dialog id='modal_slimplate_login' className='modal'>
        <form method='dialog' className='modal-box' onSubmit={onSubmit}>
          <h3 className='font-bold text-lg'>Login</h3>
          <p className='py-4'>Put login here.</p>
          <div className='modal-action'>
            {/* if there is a button in form, it will close the modal */}
            <button className='btn'>Close</button>
          </div>
        </form>
      </dialog>
    </>
  )
}
