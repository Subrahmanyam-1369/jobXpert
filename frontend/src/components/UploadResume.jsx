import { useDropzone } from 'react-dropzone'

const UploadResume = ({ onUploaded }) => {
  const token = localStorage.getItem('jx_token')
  const onDrop = async files => {
    const file = files[0]
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    const res = await fetch('/resumes/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data
    })
    if (res.ok) {
      const row = await res.json()
      onUploaded(row)
    }
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  return (
    <div {...getRootProps()} className={`border-2 border-dashed p-8 rounded text-center cursor-pointer ${isDragActive ? 'bg-gray-700' : 'bg-gray-800'}`}>\n      <input {...getInputProps()} />
      <p>Drop resume here</p>
    </div>
  )
}

export default UploadResume
