import { useEffect, useState } from 'react'
import { fetchPatients } from './api'
import './App.css'

const show = (v) =>
  v === null || v === undefined || String(v).trim() === '' ? '-' : v

// Returns '' when the DOB is missing, invalid, or the backend's 1970-01-01 placeholder
const calcAge = (dob) => {
  if (!dob) return ''
  const d = new Date(dob)
  if (isNaN(d)) return ''
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age >= 0 ? age : ''
}

export default function App() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useCalcAge, setUseCalcAge] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchPatients(0, controller.signal)
      .then(setPatients)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="container">
      <div className="header">
        <h1>Patient List</h1>
        {!loading && !error && (
          <button
            className="toggle-btn"
            onClick={() => setUseCalcAge((v) => !v)}
          >
            {useCalcAge ? 'Show API age' : 'Show calculated age'}
          </button>
        )}
      </div>

      {loading && <p className="status">Loading patients...</p>}
      {error && <p className="status error">Error: {error}</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reg. ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th className="num">
                  {useCalcAge ? 'Age (calculated)' : 'Age'}
                </th>
                <th>Mobile</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="status">No patients found</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.rowId}>
                    <td>{show(p.id)}</td>
                    <td>{show(p.name)}</td>
                    <td>{show(p.gender)}</td>
                    <td className="num">
                      {show(useCalcAge ? calcAge(p.dob) : p.age)}
                    </td>
                    <td>{show(p.mobile)}</td>
                    <td>{show(p.address)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}