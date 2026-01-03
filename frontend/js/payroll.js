fetch(`http://localhost:5000/api/payroll/${localStorage.getItem('user_id')}`)
.then(res => res.json())
.then(data => {
  data.forEach(p => {
    document.getElementById('data').innerHTML +=
      `<p>${p.month} - ${p.salary}</p>`;
  });
});
