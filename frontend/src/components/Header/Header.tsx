import classes from "./Header.module.css"
import logo from "../../assets/logo-svg-dark.svg"
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface UserProfile {
    userId: number;
    username: string;
}

const Header = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogout, setShowLogout] = useState(false); // Состояние для показа кнопки выхода
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            // Если токен невалидный, очищаем его
            localStorage.removeItem('authToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    if (loading) {
        return (
            <header className={classes.header}>
                <div className={classes.headerContainer}>
                    <Link to="/">
                        <img src={logo} alt="" width={133} height={50}/>
                    </Link>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">
                                    О нас
                                </Link>
                            </li>
                            <li className={classes.loading}>
                                Загрузка...
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
        );
    }

    return (
        <header className={classes.header}>
            <div className={classes.headerContainer}>
                <Link to="/">
                    <img src={logo} alt="" width={133} height={50}/>
                </Link>

                <nav>
                    <ul>
                        <li>
                            <Link to="/">
                                О нас
                            </Link>
                        </li>
                        <li>
                            {user ? (
                                <div
                                    className={classes.userMenu}
                                    onMouseEnter={() => setShowLogout(true)}
                                    onMouseLeave={() => setShowLogout(false)}
                                >
                                    <span className={classes.username}>
                                        {user.username}
                                    </span>
                                    {showLogout && (
                                        <button
                                            onClick={handleLogout}
                                            className={classes.logoutButton}
                                        >
                                            Выйти
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login">
                                    Вход
                                </Link>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;