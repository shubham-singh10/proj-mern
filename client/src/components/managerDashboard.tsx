import { useState } from 'react';
import API from '../services/api';

export default function ManagerDashboard() {
  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');

  const create = async () => {
    const token = localStorage.getItem('token');
    const res = await API.post('/projects', { title, description: desc }, { headers: { Authorization: `Bearer ${token}` } });
    alert('Created ' + res.data._id);
  };

  return (
    <div>
      <h2>Create Project</h2>
      <input placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input placeholder="desc" value={desc} onChange={e=>setDesc(e.target.value)} />
      <button onClick={create}>Create</button>
    </div>
  );
}
