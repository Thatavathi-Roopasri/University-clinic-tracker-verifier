// Global variables
let currentUser = null;
let selectedRole = null;
let html5QrcodeScanner = null;

// Test credentials for each role
const VALID_CREDENTIALS = {
  faculty: {
    'faculty@klh.edu.in': 'faculty123',
    'prof.smith@klh.edu.in': 'prof123',
    'dr.johnson@klh.edu.in': 'doctor123'
  },
  clinic: {
    'clinic@klh.edu.in': 'clinic123',
    'nurse@klh.edu.in': 'nurse123',
    'staff@klh.edu.in': 'staff123'
  },
  student: {
    'student@klh.edu.in': 'student123',
    'john.doe@klh.edu.in': 'john123',
    'jane.smith@klh.edu.in': 'jane123'
  }
};

// Sample student database
const STUDENT_DATABASE = {
  'KLU001': { name: 'Rahul Kumar', year: '2nd Year BTech' },
  'KLU002': { name: 'Priya Sharma', year: '3rd Year BTech' },
  'KLU003': { name: 'Amit Singh', year: '1st Year BTech' },
  'KLU004': { name: 'Sneha Reddy', year: '4th Year BTech' },
  'KLU005': { name: 'Vikram Patel', year: '2nd Year MBA' }
};

// DOM elements
const roleSelectionPage = document.getElementById('roleSelectionPage');
const authPage = document.getElementById('authPage');
const clinicDashboard = document.getElementById('clinicDashboard');
const facultyDashboard = document.getElementById('facultyDashboard');
const studentDashboard = document.getElementById('studentDashboard');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Enhanced Clinic Tracker System Initialized');
  console.log('📧 Test Credentials by Role:');
  console.log('👨‍🏫 Faculty: faculty@klh.edu.in / faculty123');
  console.log('👩‍⚕️ Clinic: clinic@klh.edu.in / clinic123');
  console.log('👨‍🎓 Student: student@klh.edu.in / student123');
  
  setupEventListeners();
  checkAuthState();
});

// Setup all event listeners
function setupEventListeners() {
  // Role selection
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const role = e.currentTarget.dataset.role;
      selectRole(role);
    });
  });
  
  // Back to role selection
  document.getElementById('backToRoleSelection').addEventListener('click', showRoleSelection);
  
  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Password toggle
  document.getElementById('passwordToggleBtn').addEventListener('click', togglePassword);
  
  // Logout buttons
  document.getElementById('clinicLogoutBtn').addEventListener('click', logout);
  document.getElementById('facultyLogoutBtn').addEventListener('click', logout);
  document.getElementById('studentLogoutBtn').addEventListener('click', logout);
  
  // QR Scanner
  document.getElementById('startScannerBtn').addEventListener('click', startQRScanner);
  
  // Edit buttons
  document.getElementById('editNameBtn').addEventListener('click', () => toggleEditMode('studentName'));
  document.getElementById('editIdBtn').addEventListener('click', () => toggleEditMode('studentId'));
  
  // Clinic staff buttons
  document.getElementById('logVisitBtn').addEventListener('click', logVisit);
  document.getElementById('markExitBtn').addEventListener('click', markExit);
  
  // Faculty buttons
  document.getElementById('verifyVisitBtn').addEventListener('click', verifyVisit);
  document.getElementById('printFacultyLogsBtn').addEventListener('click', printStudentLogsFaculty);
  document.getElementById('exportCSVBtn').addEventListener('click', exportCSV);
  document.getElementById('printAllLogsBtn').addEventListener('click', printAllLogs);
  
  // Student buttons
  document.getElementById('showStudentLogsBtn').addEventListener('click', showStudentLogs);
  document.getElementById('printStudentLogsBtn').addEventListener('click', printStudentLogs);
}

// Role selection functionality
function selectRole(role) {
  selectedRole = role;
  console.log('🎭 Role selected:', role);
  
  roleSelectionPage.style.display = 'none';
  authPage.style.display = 'flex';
  
  // Update auth page title
  const titles = {
    faculty: 'Sign In as Faculty',
    clinic: 'Sign In as Clinic Staff',
    student: 'Sign In as Student'
  };
  
  document.getElementById('authTitle').textContent = titles[role];
}

function showRoleSelection() {
  roleSelectionPage.style.display = 'flex';
  authPage.style.display = 'none';
  hideAllDashboards();
  selectedRole = null;
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginBtn = document.getElementById('loginBtn');
  
  console.log('🔐 Login attempt:', email, 'Role:', selectedRole);
  
  // Hide previous errors
  hideError();
  
  // Validate email domain
  if (!email.endsWith('@klh.edu.in')) {
    showError('Please use a valid @klh.edu.in email address');
    return;
  }
  
  // Show loading state
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
  
  // Simulate network delay
  setTimeout(() => {
    // Check credentials for selected role
    const roleCredentials = VALID_CREDENTIALS[selectedRole];
    if (roleCredentials && roleCredentials[email] === password) {
      console.log('✅ Login successful');
      authenticateUser(email, selectedRole);
    } else {
      console.log('❌ Invalid credentials');
      showError('Invalid email or password for this role. Please check your credentials.');
      shakeForm();
    }
    
    // Reset button
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }, 1000);
}

// Authenticate user and redirect to appropriate dashboard
function authenticateUser(email, role) {
  currentUser = {
    email: email,
    role: role,
    name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    loginTime: new Date().toISOString()
  };
  
  // Store user session
  localStorage.setItem("clinicUser", JSON.stringify(currentUser));
  
  console.log('👤 User authenticated:', currentUser.name, 'Role:', role);
  showDashboard(role);
  showToast(`Welcome ${currentUser.name}! Logged in as ${role}`);
  loadRecentVisits();
}

// Show appropriate dashboard based on role
function showDashboard(role) {
  hideAllDashboards();
  authPage.style.display = 'none';
  
  switch(role) {
    case 'clinic':
      clinicDashboard.style.display = 'block';
      updateUserInfo('clinic');
      break;
    case 'faculty':
      facultyDashboard.style.display = 'block';
      updateUserInfo('faculty');
      break;
    case 'student':
      studentDashboard.style.display = 'block';
      updateUserInfo('student');
      break;
  }
}

function hideAllDashboards() {
  clinicDashboard.style.display = 'none';
  facultyDashboard.style.display = 'none';
  studentDashboard.style.display = 'none';
}

function updateUserInfo(role) {
  if (currentUser) {
    const prefix = role;
    document.getElementById(`${prefix}UserName`).textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById(`${prefix}UserEmail`).textContent = currentUser.email;
    document.getElementById(`${prefix}UserAvatar`).textContent = currentUser.name.charAt(0).toUpperCase();
  }
}

// QR Scanner functionality
function startQRScanner() {
  const scannerBtn = document.getElementById('startScannerBtn');
  const qrReader = document.getElementById('qr-reader');
  const resultsDiv = document.getElementById('qr-reader-results');
  
  if (html5QrcodeScanner) {
    stopQRScanner();
    return;
  }
  
  qrReader.style.display = 'block';
  scannerBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Scanner';
  scannerBtn.style.background = 'linear-gradient(135deg, #ff4757, #ff3742)';
  
  html5QrcodeScanner = new Html5Qrcode("qr-reader");
  
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  };
  
  html5QrcodeScanner.start(
    { facingMode: "environment" }, // Use back camera
    config,
    (decodedText, decodedResult) => {
      console.log('🔍 QR Code scanned:', decodedText);
      handleQRScanResult(decodedText);
      stopQRScanner();
    },
    (errorMessage) => {
      // Handle scan errors silently
    }
  ).catch((err) => {
    console.error('❌ QR Scanner error:', err);
    resultsDiv.innerHTML = '<p style="color: #ff4757;">Camera access denied or not available</p>';
    stopQRScanner();
  });
}

function stopQRScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner.clear();
      html5QrcodeScanner = null;
    }).catch((err) => {
      console.error('Error stopping scanner:', err);
    });
  }
  
  const scannerBtn = document.getElementById('startScannerBtn');
  const qrReader = document.getElementById('qr-reader');
  
  qrReader.style.display = 'none';
  scannerBtn.innerHTML = '<i class="fas fa-camera"></i> Scan Student QR Code';
  scannerBtn.style.background = 'linear-gradient(135deg, #9ECAD6, #748DAE)';
}

function handleQRScanResult(qrData) {
  const resultsDiv = document.getElementById('qr-reader-results');
  
  // Try to extract student ID from QR data
  let studentId = qrData;
  
  // If QR contains JSON or structured data, parse it
  try {
    const parsed = JSON.parse(qrData);
    studentId = parsed.studentId || parsed.id || parsed.rollNumber || qrData;
  } catch (e) {
    // If not JSON, try to extract student ID from text
    const match = qrData.match(/(?:ID|Roll|Student).*?([A-Z]{3}\d{3,})/i);
    if (match) {
      studentId = match[1];
    }
  }
  
  resultsDiv.innerHTML = `<p style="color: #28a745;">✅ Scanned: ${studentId}</p>`;
  
  // Look up student in database
  if (STUDENT_DATABASE[studentId]) {
    const student = STUDENT_DATABASE[studentId];
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentId').value = studentId;
    
    showToast(`Student found: ${student.name} (${studentId})`);
  } else {
    document.getElementById('studentName').value = '';
    document.getElementById('studentId').value = studentId;
    
    // Make fields editable
    toggleEditMode('studentName');
    showToast('Student ID scanned. Please enter student name.', 'error');
  }
}

// Toggle edit mode for readonly fields
function toggleEditMode(fieldId) {
  const field = document.getElementById(fieldId);
  if (field.readOnly) {
    field.readOnly = false;
    field.style.background = 'white';
    field.focus();
    showToast('Field unlocked for editing');
  } else {
    field.readOnly = true;
    field.style.background = '#f8f9fa';
  }
}

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('loginPassword');
  const passwordIcon = document.getElementById('passwordToggleIcon');
  const toggleBtn = document.getElementById('passwordToggleBtn');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    passwordIcon.classList.remove('fa-eye');
    passwordIcon.classList.add('fa-eye-slash');
    toggleBtn.setAttribute('title', 'Hide password');
  } else {
    passwordInput.type = 'password';
    passwordIcon.classList.remove('fa-eye-slash');
    passwordIcon.classList.add('fa-eye');
    toggleBtn.setAttribute('title', 'Show password');
  }
}

// Logout user
function logout() {
  localStorage.removeItem("clinicUser");
  currentUser = null;
  selectedRole = null;
  
  // Stop QR scanner if running
  if (html5QrcodeScanner) {
    stopQRScanner();
  }
  
  // Reset to role selection
  showRoleSelection();
  
  // Clear form
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  hideError();
  
  showToast("Logged out successfully");
  console.log('👋 User logged out');
}

// Check if user is already authenticated
function checkAuthState() {
  const stored = localStorage.getItem("clinicUser");
  if (stored) {
    currentUser = JSON.parse(stored);
    selectedRole = currentUser.role;
    showDashboard(currentUser.role);
    console.log('🔄 Session restored for:', currentUser.name, 'Role:', currentUser.role);
  }
}

// Log clinic visit
function logVisit() {
  const name = document.getElementById("studentName").value.trim();
  const id = document.getElementById("studentId").value.trim();
  const symptoms = document.getElementById("symptoms").value.trim();
  
  if (!name || !id) {
    showToast("Please enter both student name and ID!", 'error');
    return;
  }

  const entryTime = new Date().toISOString();
  const log = { 
    name, 
    id, 
    symptoms, 
    entryTime, 
    exitTime: "",
    loggedBy: currentUser?.email || "Unknown"
  };
  
  let logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  logs.push(log);
  localStorage.setItem("clinicLogs", JSON.stringify(logs));

  // Generate QR Code
  if (typeof QRCode !== 'undefined') {
    QRCode.toDataURL(`Student: ${name} (${id})\nEntry: ${new Date(entryTime).toLocaleString()}\nSymptoms: ${symptoms}`, (err, url) => {
      if (!err) {
        document.getElementById('qrcode').innerHTML = `
          <h4 style="color: #748DAE; margin-bottom: 10px;">QR Code Generated</h4>
          <img src="${url}" width="200" alt="QR Code">
          <p style="font-size: 12px; color: #666; margin-top: 10px;">Scan to verify visit</p>
        `;
      }
    });
  }

  // Clear form
  document.getElementById("studentName").value = "";
  document.getElementById("studentId").value = "";
  document.getElementById("symptoms").value = "";
  document.getElementById("studentName").readOnly = true;
  document.getElementById("studentId").readOnly = true;
  document.getElementById("studentName").style.background = '#f8f9fa';
  document.getElementById("studentId").style.background = '#f8f9fa';

  showToast("Visit logged successfully!");
  console.log('📝 Visit logged for:', name, id);
  loadRecentVisits();
}

// Mark exit
function markExit() {
  const id = document.getElementById("studentId").value.trim();
  if (!id) {
    showToast("Please enter or scan student ID to mark exit!", 'error');
    return;
  }
  
  let logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  const log = logs.reverse().find(l => l.id === id && !l.exitTime);
  
  if (log) {
    log.exitTime = new Date().toISOString();
    localStorage.setItem("clinicLogs", JSON.stringify(logs.reverse()));
    showToast("Exit marked successfully!");
    
    // Clear form
    document.getElementById("studentName").value = "";
    document.getElementById("studentId").value = "";
    
    console.log('🚪 Exit marked for ID:', id);
    loadRecentVisits();
  } else {
    showToast("No active visit found for this student ID.", 'error');
  }
}

// Load recent visits for clinic dashboard
function loadRecentVisits() {
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  const recentLogs = logs.slice(-5).reverse(); // Last 5 visits
  
  const recentVisitsDiv = document.getElementById("recentVisits");
  if (!recentVisitsDiv) return;
  
  if (recentLogs.length === 0) {
    recentVisitsDiv.innerHTML = '<p style="text-align: center; color: #666;">No recent visits</p>';
    return;
  }
  
  recentVisitsDiv.innerHTML = recentLogs.map(log => {
    const duration = calculateDuration(log.entryTime, log.exitTime);
    const status = log.exitTime ? 'Completed' : 'Active';
    const statusColor = log.exitTime ? '#28a745' : '#ffc107';
    
    return `
      <div class="log-entry" style="margin-bottom: 10px;">
        <div class="log-header">
          <div class="log-name">${log.name}</div>
          <div class="log-id">ID: ${log.id}</div>
        </div>
        <div class="log-details">
          <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
          <div><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></div>
          <div><strong>Duration:</strong> ${duration}</div>
          <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Show student logs
function showStudentLogs() {
  const id = document.getElementById("studentIdInput").value.trim();
  if (!id) {
    showToast("Please enter your student ID!", 'error');
    return;
  }
  
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]").filter(l => l.id === id);
  const counts = checkFrequentVisitors(logs);
  
  if (logs.length === 0) {
    document.getElementById("studentLogs").innerHTML = `
      <div class="log-entry">
        <p style="text-align: center; color: #666;">No visit records found for ID: ${id}</p>
      </div>
    `;
    return;
  }
  
  document.getElementById("studentLogs").innerHTML = logs.map(log => {
    let duration = calculateDuration(log.entryTime, log.exitTime);
    let frequentBadge = counts[log.id] > 3 ? `<span class="frequent-visitor">Frequent Visitor</span>` : "";
    
    return `
      <div class="log-entry">
        <div class="log-header">
          <div class="log-name">${log.name}</div>
          <div class="log-id">ID: ${log.id}</div>
        </div>
        ${frequentBadge}
        <div class="log-details">
          <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
          <div><strong>Exit:</strong> ${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</div>
          <div><strong>Duration:</strong> ${duration}</div>
          <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
        </div>
      </div>
    `;
  }).join('');
  
  console.log('🔍 Student logs shown for ID:', id);
}

// Verify visit (Faculty)
function verifyVisit() {
  const id = document.getElementById("facultyIdInput").value.trim();
  if (!id) {
    showToast("Please enter a student ID to search!", 'error');
    return;
  }
  
  const allLogs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  const filtered = allLogs.filter(l => l.id === id);
  const counts = checkFrequentVisitors(filtered);

  if (filtered.length === 0) {
    document.getElementById("facultyLogs").innerHTML = `
      <div class="log-entry">
        <p style="text-align: center; color: #666;">No visit records found for student ID: ${id}</p>
      </div>
    `;
    return;
  }

  document.getElementById("facultyLogs").innerHTML = filtered.map(log => {
    let duration = calculateDuration(log.entryTime, log.exitTime);
    let frequentBadge = counts[log.id] > 3 ? `<span class="frequent-visitor">Frequent Visitor</span>` : "";
    
    return `
      <div class="log-entry">
        <div class="log-header">
          <div class="log-name">${log.name}</div>
          <div class="log-id">ID: ${log.id}</div>
        </div>
        ${frequentBadge}
        <div class="log-details">
          <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
          <div><strong>Exit:</strong> ${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</div>
          <div><strong>Duration:</strong> ${duration}</div>
          <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
          <div><strong>Logged by:</strong> ${log.loggedBy || "Unknown"}</div>
        </div>
      </div>
    `;
  }).join('');

  // Generate chart if Chart.js is available
  if (typeof Chart !== 'undefined') {
    const dateCounts = {};
    allLogs.forEach(log => {
      let date = new Date(log.entryTime).toLocaleDateString();
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const ctx = document.getElementById("visitChart");
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(dateCounts).slice(-7),
        datasets: [{
          label: 'Daily Clinic Visits',
          data: Object.values(dateCounts).slice(-7),
          backgroundColor: 'rgba(158, 202, 214, 0.8)',
          borderColor: 'rgba(116, 141, 174, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Clinic Visit Trends' }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
  
  console.log('✅ Visit verified for ID:', id);
}

// Utility functions
function calculateDuration(entry, exit) {
  if (!exit) return "Still inside";
  let start = new Date(entry), end = new Date(exit);
  let diff = (end - start) / 60000; // minutes
  let hours = Math.floor(diff / 60);
  let minutes = Math.floor(diff % 60);
  return hours + "h " + minutes + "m";
}

function checkFrequentVisitors(logs) {
  const counts = {};
  logs.forEach(l => { counts[l.id] = (counts[l.id] || 0) + 1 });
  return counts;
}

function showError(message) {
  const loginError = document.getElementById('loginError');
  const loginErrorText = document.getElementById('loginErrorText');
  loginErrorText.textContent = message;
  loginError.style.display = 'block';
}

function hideError() {
  document.getElementById('loginError').style.display = 'none';
}

function shakeForm() {
  const loginForm = document.getElementById('loginForm');
  loginForm.classList.add('shake');
  setTimeout(() => {
    loginForm.classList.remove('shake');
  }, 500);
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove('error');
  
  if (type === 'error') {
    toast.classList.add('error');
  }
  
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

// Print functions
function printStudentLogs() {
  const id = document.getElementById("studentIdInput").value.trim();
  if (!id) {
    showToast("Please enter a student ID first!", 'error');
    return;
  }
  
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]").filter(l => l.id === id);
  if (logs.length === 0) {
    showToast("No records found for this student!", 'error');
    return;
  }
  
  printHelper(logs, `Student Records - ID: ${id}`);
}

function printStudentLogsFaculty() {
  const id = document.getElementById("facultyIdInput").value.trim();
  if (!id) {
    showToast("Please search for a student first!", 'error');
    return;
  }
  
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]").filter(l => l.id === id);
  if (logs.length === 0) {
    showToast("No records found for this student!", 'error');
    return;
  }
  
  printHelper(logs, `Student Verification Report - ID: ${id}`);
}

function printAllLogs() {
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  if (logs.length === 0) {
    showToast("No records available to print!", 'error');
    return;
  }
  
  printHelper(logs, "Complete Clinic Records");
}

function printHelper(logs, title) {
  let w = window.open("");
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #748DAE; padding-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #748DAE; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Kalinga Institute of Industrial Technology - Clinic System</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Duration</th>
              <th>Symptoms</th>
              <th>Logged By</th>
            </tr>
          </thead>
          <tbody>
  `);
  
  logs.forEach(log => {
    let duration = calculateDuration(log.entryTime, log.exitTime);
    w.document.write(`
      <tr>
        <td>${log.name}</td>
        <td>${log.id}</td>
        <td>${new Date(log.entryTime).toLocaleString()}</td>
        <td>${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</td>
        <td>${duration}</td>
        <td>${log.symptoms || "Not specified"}</td>
        <td>${log.loggedBy || "Unknown"}</td>
      </tr>
    `);
  });
  
  w.document.write('</tbody></table></body></html>');
  w.print();
  w.close();
}

// Export CSV
function exportCSV() {
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  if (logs.length === 0) {
    showToast("No data available to export!", 'error');
    return;
  }
  
  let csv = "Name,Student ID,Entry Time,Exit Time,Duration,Symptoms,Logged By\n";
  logs.forEach(log => {
    let duration = calculateDuration(log.entryTime, log.exitTime);
    csv += `"${log.name}","${log.id}","${log.entryTime}","${log.exitTime || "Still inside"}","${duration}","${log.symptoms || "Not specified"}","${log.loggedBy || "Unknown"}"\n`;
  });
  
  let blob = new Blob([csv], { type: 'text/csv' });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `clinic_logs_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showToast("CSV file downloaded successfully!");
  console.log('📥 CSV exported with', logs.length, 'records');
}
