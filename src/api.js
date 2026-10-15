const USERNAME = 'doctosmarttest'
const PASSWORD = '$2y$12$9Za7UtNOljRUWVmVrq8yv.ZpuzEhK6yzI.gdKRCxw2EtUfvxySV3S'

const normalize = (p) => ({
  rowId: p.id, // unique numeric id, used for React keys
  id: p.registration_id,
  name: p.patient_name,
  gender: p.gender,
  age: p.age, // raw API value
  dob: p.date_of_birth, // used for the calculated age
  mobile: p.mobile_no,
  address: p.address,
})

const extractList = (json) => {
  if (Array.isArray(json)) return json
  const found = [json?.data, json?.patients, json?.result, json?.data?.patients]
    .find(Array.isArray)
  return found ?? []
}



export async function fetchPatients(pageNo = 0, signal) {
  const res = await fetch(
    `/api/patients?user_id=1&clinic_id=1&page_no=${pageNo}`,
    {
      signal,
      headers: {
        Accept: 'application/json',
        Authorization: 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`),
      },
    }
  )
  if (!res.ok) {
  throw new Error(
    res.status >= 502 && res.status <= 504
      ? 'Could not reach the server. Please check your connection and try again.'
      : `Request failed (${res.status})`
  )
}

  const json = await res.json()

  // This API reports failures in the body, even with HTTP 200
  if (json?.status === false) {
    throw new Error(json.message || 'Request failed')
  }

  return extractList(json).map(normalize)
}