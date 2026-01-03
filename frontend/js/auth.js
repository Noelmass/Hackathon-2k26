const API_BASE = "http://localhost:5000/api";

/* ---------- LOGIN ---------- */
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);

        if (data.role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          window.location.href = "employee-dashboard.html";
        }
      } else {
        alert("Invalid login credentials");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}

/* ---------- SIGNUP ---------- */
function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role })
  })
    .then(res => res.json())
    .then(() => {
      alert("Signup successful! Please login.");
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error(err);
      alert("Signup failed");
    });
}

/* ---------- LOGOUT ---------- */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
