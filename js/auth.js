function login() {
  fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('user_id', data.user_id);
    if (data.role === 'admin')
      location.href = 'admin-dashboard.html';
    else
      location.href = 'employee-dashboard.html';
  });
}

function signup() {
  fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })
  }).then(() => alert('Registered'));
}
