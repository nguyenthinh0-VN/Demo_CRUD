document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');
    const dashboardMessageDiv = document.getElementById('dashboard-message');

    // Hàm kiểm tra trạng thái đăng nhập từ backend
    const checkAuth = async () => {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            if (data.loggedIn) {
                if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
                    window.location.href = 'dashboard.html';
                } else if (window.location.pathname.endsWith('dashboard.html')) {
                    dashboardMessageDiv.textContent = `Chào mừng, ${data.username}!`;
                }
            } else {
                if (window.location.pathname.endsWith('dashboard.html')) {
                    window.location.href = 'login.html';
                }
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra xác thực:", error);
        }
    };

    checkAuth();

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    body: new URLSearchParams(formData),
                    credentials: 'same-origin' // Ensure cookies are sent with the request
                });
                const data = await response.json();
                const messageDiv = document.getElementById('login-message');
                messageDiv.textContent = data.message;
                messageDiv.className = `message ${data.success ? 'success' : 'error'}`;
                if (data.success) {
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            } catch (error) {
                console.error("Login error:", error);
            }
        });
    }


    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    body: new URLSearchParams(formData)
                });
                const data = await response.json();
                const messageDiv = document.getElementById('register-message');
                messageDiv.textContent = data.message;
                messageDiv.className = `message ${data.success ? 'success' : 'error'}`;
                if (data.success) {
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                }
            } catch (error) {
                console.error("Lỗi đăng ký:", error);
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST'
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error("Lỗi đăng xuất:", error);
            }
        });
    }
});