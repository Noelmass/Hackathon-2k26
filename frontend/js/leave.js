function apply() {
  fetch('http://localhost:5000/api/leaves', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      user_id: localStorage.getItem('user_id'),
      start_date: start.value,
      end_date: end.value,
      reason: reason.value
    })
  }).then(() => alert('Leave Applied'));
}
