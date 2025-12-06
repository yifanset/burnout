import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import classes from './LoginPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

interface RegisterData {
    username: string;
    password: string;
}

interface RegisterResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
    };
}

const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
        confirmPassword?: string;
    }>({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
        } else if (username.length < 3) {
            newErrors.username = 'Имя пользователя должно быть не менее 3 символов';
        }

        if (!password) {
            newErrors.password = 'Пароль обязателен';
        } else if (password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Подтверждение пароля обязательно';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
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
            const registerData: RegisterData = { username, password };

            const response = await axios.post<RegisterResponse>(
                `${API_URL}/api/auth/register`,
                registerData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 201) {
                alert('Регистрация прошла успешно! Теперь вы можете войти.');
                navigate('/login');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    setErrors({ username: 'Пользователь с таким именем уже существует' });
                } else {
                    const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
                    alert(errorMessage);
                }
            } else {
                console.error('Ошибка при регистрации:', error);
                alert('Произошла ошибка при регистрации');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.loginCard}>
                <div className={classes.header}>
                    <h1>Регистрация</h1>
                    <p>Создайте новый аккаунт</p>
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
                            placeholder="Придумайте username"
                            disabled={isLoading}
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
                            placeholder="Придумайте пароль (мин. 6 символов)"
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <span className={classes.errorText}>{errors.password}</span>
                        )}
                    </div>

                    <div className={classes.inputGroup}>
                        <label htmlFor="confirmPassword" className={classes.label}>
                            Подтвердите пароль
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) {
                                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                }
                            }}
                            className={`${classes.input} ${errors.confirmPassword ? classes.inputError : ''}`}
                            placeholder="Повторите пароль"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <span className={classes.errorText}>{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={classes.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className={classes.footer}>
                    <p>Уже есть аккаунт? <Link to="/login" className={classes.link}>Войти</Link></p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;