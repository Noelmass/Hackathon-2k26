// API Configuration
const API_URL = 'http://localhost:5000/api';

// Local Storage Keys
const STORAGE_KEYS = {
    TOKEN: 'authToken',
    USER: 'userData'
};

// Token Management
function setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

function getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

// User Data Management
function setUserData(data) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
}

function getUserData() {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
}

function removeUserData() {
    localStorage.removeItem(STORAGE_KEYS.USER);
}

// API Call Wrapper
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Add authorization token if required
    if (requiresAuth) {
        const token = getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    // Add body if provided
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();
        
        // Handle token expiration
        if (response.status === 401 && data.message && data.message.includes('expired')) {
            showNotification('Session expired. Please login again.', 'error');
            logout();
            return null;
        }
        
        return { ...data, status: response.status };
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Network error. Please check your connection.', 'error');
        return { success: false, message: 'Network error', status: 0 };
    }
}

// Authentication Check
function checkAuth() {
    const token = getToken();
    const user = getUserData();
    
    if (!token || !user) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Check if user is admin
function isAdmin() {
    const user = getUserData();
    return user && user.role === 'admin';
}

// Logout Function
function logout() {
    removeToken();
    removeUserData();
    window.location.href = 'index.html';
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Date Formatting
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Calculate days between dates
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateRequired(value) {
    return value && value.trim() !== '';
}

// Loading Indicator
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// Confirm Dialog
function confirmAction(message) {
    return confirm(message);
}

// Status Badge Helper
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-warning">Pending</span>',
        'approved': '<span class="badge badge-success">Approved</span>',
        'rejected': '<span class="badge badge-danger">Rejected</span>',
        'present': '<span class="badge badge-success">Present</span>',
        'absent': '<span class="badge badge-danger">Absent</span>',
        'half_day': '<span class="badge badge-warning">Half Day</span>',
        'leave': '<span class="badge badge-info">Leave</span>'
    };
    return badges[status] || `<span class="badge">${status}</span>`;
}

// Currency Formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

// Debounce Function (for search inputs)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiCall,
        setToken,
        getToken,
        setUserData,
        getUserData,
        checkAuth,
        isAdmin,
        logout,
        showNotification,
        formatDate,
        formatDateTime,
        formatTime,
        getCurrentDate,
        daysBetween,
        validateEmail,
        validatePassword,
        validateRequired,
        showLoading,
        hideLoading,
        confirmAction,
        getStatusBadge,
        formatCurrency,
        debounce
    };
}
