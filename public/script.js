document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');
    const dashboardMessageDiv = document.getElementById('dashboard-message');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const adminButton = document.getElementById('admin-button');

    // Hàm kiểm tra trạng thái đăng nhập từ backend
    const checkAuth = async () => {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            if (data.loggedIn) {
                if (data.role === 'admin') {
                    adminButton.classList.remove('hidden');
                    adminButton.addEventListener('click', () => {
                        window.location.href = 'admin.html';
                    });
                } else {
                    adminButton.classList.add('hidden');
                }

                if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
                    window.location.href = 'dashboard.html';
                } else if (window.location.pathname.endsWith('dashboard.html')) {
                    dashboardMessageDiv.textContent = `Chào mừng, ${data.username}!`;
                }
            } else {
                if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('admin.html') ) {
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
                    credentials: 'same-origin'
                });
                const data = await response.json();
                const messageDiv = document.getElementById('login-message');
                messageDiv.textContent = data.message;
                messageDiv.classList.remove('hidden');
                messageDiv.className = `message ${data.success ? 'success' : 'error'}`;
                if (data.success) {
                    setTimeout(() => {

                        if(data.role === "admin"){
                            window.location.href = 'admin.html';
                        }else{
                            window.location.href = 'dashboard.html';
                        }
                    }, 1000);

                }
            } catch (error) {
                console.error("Login error:", error);
                const messageDiv = document.getElementById('login-message');
                messageDiv.textContent = 'Đã xảy ra lỗi khi đăng nhập, vui lòng thử lại.';
                messageDiv.classList.remove('hidden');
                messageDiv.className = 'message error';

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
                messageDiv.classList.remove('hidden');
                messageDiv.className = `message ${data.success ? 'success' : 'error'}`;

                if (data.success) {
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                }
            } catch (error) {
                console.error("Lỗi đăng ký:", error);
                const messageDiv = document.getElementById('register-message');
                messageDiv.textContent = "Đã xảy ra lỗi khi đăng ký, vui lòng thử lại";
                messageDiv.classList.remove('hidden');
                messageDiv.className = 'message error';
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


    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMessageElement = document.getElementById('errorMessage');
            errorMessageElement.classList.add("hidden"); // ẩn đi message lỗi mặc định

            if (newPassword !== confirmPassword) {
                errorMessageElement.textContent = "Mật khẩu mới và xác nhận mật khẩu không khớp.";
                errorMessageElement.classList.remove("hidden");
                errorMessageElement.className = 'error-message message error';
                return;
            }

            try {
                const response = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        currentPassword: currentPassword,
                        newPassword: newPassword,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    errorMessageElement.textContent = "Đổi mật khẩu thành công";
                    errorMessageElement.className = 'error-message message success';
                    errorMessageElement.classList.remove("hidden");
                    setTimeout(async () => {
                        //Chuyển hướng đến trang login và xoá session cũ
                        try {
                            await fetch('/api/logout', { method: 'POST' });
                            window.location.href = 'login.html';
                        } catch (error) {
                            console.error("Lỗi khi đăng xuất sau đổi mật khẩu:", error);
                            errorMessageElement.textContent = "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.";
                            errorMessageElement.classList.remove("hidden");
                            errorMessageElement.className = 'error-message message error';
                        }
                    }, 1500)


                } else {
                    errorMessageElement.textContent = data.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.";
                    errorMessageElement.classList.remove("hidden");
                    errorMessageElement.className = 'error-message message error';
                }

            } catch (error) {
                errorMessageElement.textContent = "Đã xảy ra lỗi, vui lòng thử lại.";
                errorMessageElement.classList.remove("hidden");
                errorMessageElement.className = 'error-message message error';
                console.error('Error:', error);
            }
        });
    }
});