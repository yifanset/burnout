import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from './LoginPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginData {
    username: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
    };
}

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
        general?: string;
    }>({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
        }

        if (!password) {
            newErrors.password = 'Пароль обязателен';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const loginData: LoginData = { username, password };

            const response = await axios.post<LoginResponse>(
                `${API_URL}/api/auth/login`,
                loginData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                const { access_token, user } = response.data;

                // Сохраняем токен и данные пользователя
                localStorage.setItem('authToken', access_token);
                localStorage.setItem('user', JSON.stringify(user));

                // Можно также настроить axios для автоматической отправки токена
                axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                // Перенаправляем на домашнюю страницу
                navigate('/home');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    setErrors({
                        general: 'Неверное имя пользователя или пароль'
                    });
                } else {
                    const errorMessage = error.response?.data?.message || 'Ошибка входа';
                    setErrors({ general: errorMessage });
                }
            } else {
                console.error('Ошибка при входе:', error);
                setErrors({ general: 'Произошла ошибка при входе' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.loginCard}>
                <div className={classes.header}>
                    <h1>Вход в систему</h1>
                    <p>Введите ваши учетные данные</p>
                </div>

                <form onSubmit={handleSubmit} className={classes.form}>
                    <div className={classes.inputGroup}>
                        <label htmlFor="username" className={classes.label}>
                            Имя пользователя
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (errors.username) {
                                    setErrors(prev => ({ ...prev, username: undefined }));
                                }
                            }}
                            className={`${classes.input} ${errors.username ? classes.inputError : ''}`}
                            placeholder="Введите username"
                            disabled={isLoading}
                            autoComplete="username"
                        />
                        {errors.username && (
                            <span className={classes.errorText}>{errors.username}</span>
                        )}
                    </div>

                    <div className={classes.inputGroup}>
                        <label htmlFor="password" className={classes.label}>
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: undefined }));
                                }
                            }}
                            className={`${classes.input} ${errors.password ? classes.inputError : ''}`}
                            placeholder="Введите пароль"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        {errors.password && (
                            <span className={classes.errorText}>{errors.password}</span>
                        )}
                    </div>

                    {errors.general && (
                        <div className={classes.errorMessage}>
                            <span className={classes.errorText}>{errors.general}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={classes.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div className={classes.footer}>
                    <p>Нет аккаунта? <Link to="/signup" className={classes.link}>Зарегистрироваться</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;