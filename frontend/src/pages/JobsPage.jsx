import { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

const statuses = ['Applied','Interviewing','Offer','Rejected']

const JobsPage = () => {
  const [jobs, setJobs] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ company:'', role:'', link:'', status:'Applied', notes:'' })
  const token = localStorage.getItem('jx_token')

  const fetchJobs = async () => {
    const res = await fetch('/jobs', { headers:{ Authorization:`Bearer ${token}` } })
    if(res.ok) setJobs(await res.json())
  }

  useEffect(() => { fetchJobs() }, [])

  const openNew = () => { setForm({ company:'', role:'', link:'', status:'Applied', notes:'' }); setEditing(null); setOpen(true) }

  const submit = async e => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/jobs/${editing}` : '/jobs'
    const res = await fetch(url, { method, headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(form) })
    if(res.ok){
      const job = await res.json()
      if(editing){
        setJobs(jobs.map(j => j.id===editing?job:j))
      }else{
        setJobs([job,...jobs])
      }
      setOpen(false)
    }
  }

  const editJob = job => { setForm(job); setEditing(job.id); setOpen(true) }

  const deleteJob = async id => {
    const res = await fetch(`/jobs/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } })
    if(res.ok) setJobs(jobs.filter(j => j.id!==id))
  }

  return (
    <div className='min-h-screen p-8 bg-gray-900'>
      <button onClick={openNew} className='mb-4 flex items-center gap-2 bg-blue-600 px-4 py-2 rounded'>
        <PlusIcon className='h-5 w-5'/> Add Job
      </button>
      <table className='min-w-full divide-y divide-gray-700'>
        <thead>
          <tr className='text-left'>
            <th className='p-2'>Company</th>
            <th className='p-2'>Role</th>
            <th className='p-2'>Status</th>
            <th className='p-2'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-800'>
          {jobs.map(j => (
            <tr key={j.id}>
              <td className='p-2'>{j.company}</td>
              <td className='p-2'>{j.role}</td>
              <td className='p-2'>
                <select value={j.status} onChange={async e=>{
                  const res=await fetch(`/jobs/${j.id}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({status:e.target.value})})
                  if(res.ok){
                    const row=await res.json();
                    setJobs(jobs.map(x=>x.id===j.id?row:x))
                  }
                }} className='bg-gray-700 rounded'>
                  {statuses.map(s=>(<option key={s}>{s}</option>))}
                </select>
              </td>
              <td className='p-2 flex gap-2'>
                <PencilIcon onClick={()=>editJob(j)} className='h-5 w-5 cursor-pointer'/>
                <TrashIcon onClick={()=>deleteJob(j.id)} className='h-5 w-5 cursor-pointer'/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Transition appear show={open} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={()=>setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4'
            enterTo='opacity-100 translate-y-0'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 translate-y-4'
          >
            <div className='fixed inset-0 bg-black bg-opacity-50'/>
          </Transition.Child>
          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-end justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-8'
                enterTo='opacity-100 translate-y-0'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-8'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded bg-gray-800 p-6 text-left align-middle shadow-xl'>
                  <form onSubmit={submit} className='flex flex-col gap-4'>
                    <input className='p-2 rounded bg-gray-700' placeholder='Company' value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/>
                    <input className='p-2 rounded bg-gray-700' placeholder='Role' value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/>
                    <input className='p-2 rounded bg-gray-700' placeholder='Link' value={form.link||''} onChange={e=>setForm({...form,link:e.target.value})}/>
                    <select className='p-2 rounded bg-gray-700' value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                      {statuses.map(s=>(<option key={s}>{s}</option>))}
                    </select>
                    <textarea className='p-2 rounded bg-gray-700' placeholder='Notes' value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})}/>
                    <button className='bg-blue-600 py-2 rounded'>Save</button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default JobsPage
