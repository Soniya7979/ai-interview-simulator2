// Mock Authentication Manager
class AuthManager {
    static isLoggedIn() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return token && user;
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('user') || 'null');
    }

    static login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userData = users.find(u => u.email === email && u.password === btoa(password));
        if (userData) {
            const user = { email: userData.email, name: userData.email.split('@')[0] };
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', 'mock-jwt-' + Date.now());
            return true;
        }
        return false;
    }

    static signup(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) return false;
        users.push({ email, password: btoa(password) });
        localStorage.setItem('users', JSON.stringify(users));
        return this.login(email, password);
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}