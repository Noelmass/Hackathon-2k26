function checkin() {
  fetch('http://localhost:5000/api/attendance/checkin', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user_id: localStorage.getItem('user_id') })
  }).then(res => res.json()).then(alert);
}
