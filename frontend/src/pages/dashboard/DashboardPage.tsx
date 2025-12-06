import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from './DashboardPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Employee {
    id: number;
    fullName: string;
    gender: string;
    city: string;
    position: string;
    experience: number;
    age: number;
    positionType: string;
    certification: boolean;
    training: boolean;
    lastVacation?: string;
    kpiMonths?: number;
    sickLeave: boolean;
    reprimands: boolean;
    corporateEvents: boolean;
    kpiValues: string;
    llmRecommendation?: string;
    createdAt: string;
    updatedAt: string;
}

interface LocalStorageEmployee {
    id: string;
    data: any;
    timestamp: string;
    status: 'pending' | 'synced';
}

interface EmployeeCard extends Employee {
    burnoutRisk: number;
    engagementLevel: number;
    performanceScore: number;
}

const DashboardPage = () => {
    const [employees, setEmployees] = useState<EmployeeCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasToken, setHasToken] = useState(false);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [avgBurnoutRisk, setAvgBurnoutRisk] = useState(0);
    const [, setShowLocalStorageWarning] = useState(false);
    const [, setLocalStorageCount] = useState(0);
    const navigate = useNavigate();

    // Функция генерации случайной рекомендации
    const generateRandomRecommendation = (): string => {
        const recommendations = [
            "Требуется отпуск в течение 1 месяца",
            "Требуется отпуск в течение 2 месяцев",
            "Требуется отпуск в течение 3 месяцев",
            "Сотрудник в порядке, продолжать текущий режим работы",
            "Требуется снизить часовую нагрузку на 20%",
            "Требуется снизить рабочую нагрузку на 15%",
            "Рекомендуется отправить на обучение по управлению стрессом",
            "Показана консультация психолога компании",
            "Рекомендуется гибкий график работы",
            "Следует делегировать часть обязанностей"
        ];

        const randomIndex = Math.floor(Math.random() * recommendations.length);
        return recommendations[randomIndex];
    };

    // Функция генерации случайных метрик
    const generateRandomMetrics = () => {
        return {
            burnoutRisk: Math.floor(Math.random() * 100), // 0-100%
            engagementLevel: Math.floor(Math.random() * 100), // 0-100%
            performanceScore: Math.floor(Math.random() * 100) // 0-100%
        };
    };

    // Функция для получения состояния здоровья
    const getHealthStatus = (burnoutRisk: number) => {
        if (burnoutRisk < 30) return { status: 'Низкий риск', color: '#4CAF50', emoji: '😊' };
        if (burnoutRisk < 60) return { status: 'Средний риск', color: '#FF9800', emoji: '😐' };
        return { status: 'Высокий риск', color: '#F44336', emoji: '😰' };
    };

    // Проверка токена и загрузка данных
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setHasToken(!!token);

        // Проверяем данные в localStorage
        const checkLocalStorage = () => {
            try {
                const pendingData = localStorage.getItem('pendingEmployees');
                if (pendingData) {
                    const parsedData = JSON.parse(pendingData);
                    setLocalStorageCount(parsedData.length);
                    setShowLocalStorageWarning(parsedData.length > 0);
                }
            } catch (error) {
                console.error('Ошибка при чтении localStorage:', error);
            }
        };

        checkLocalStorage();
        loadEmployees(token);
    }, []);

    const loadEmployees = async (token: string | null) => {
        setIsLoading(true);
        try {
            let loadedEmployees: Employee[] = [];

            if (token) {
                // Загружаем с сервера
                const response = await axios.get(`${API_URL}/api/employees`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                loadedEmployees = response.data;
            } else {
                // Загружаем из localStorage
                const pendingData = localStorage.getItem('pendingEmployees');
                if (pendingData) {
                    const parsedData: LocalStorageEmployee[] = JSON.parse(pendingData);
                    loadedEmployees = parsedData.map(item => ({
                        id: parseInt(item.id),
                        fullName: item.data.fullName || 'Анонимный сотрудник',
                        gender: item.data.gender || 'male',
                        city: item.data.city || 'Не указан',
                        position: item.data.position || 'Не указана',
                        experience: parseInt(item.data.experience) || 0,
                        age: parseInt(item.data.age) || 0,
                        positionType: item.data.positionType || 'Сотрудник',
                        certification: item.data.certification === "yes" || false,
                        training: item.data.training === "yes" || false,
                        lastVacation: item.data.lastVacation,
                        kpiMonths: parseInt(item.data.kpiMonths) || undefined,
                        sickLeave: item.data.sickLeave === "yes" || false,
                        reprimands: item.data.reprimands === "yes" || false,
                        corporateEvents: item.data.corporateEvents === "yes" || false,
                        kpiValues: item.data.kpiValues || "",
                        llmRecommendation: item.data.llmRecommendation || generateRandomRecommendation(),
                        createdAt: item.timestamp,
                        updatedAt: item.timestamp
                    }));
                }
            }

            // Добавляем случайные метрики и преобразуем в EmployeeCard
            const employeeCards: EmployeeCard[] = loadedEmployees.map(emp => {
                const metrics = generateRandomMetrics();
                return {
                    ...emp,
                    burnoutRisk: metrics.burnoutRisk,
                    engagementLevel: metrics.engagementLevel,
                    performanceScore: metrics.performanceScore
                };
            });

            setEmployees(employeeCards);
            setTotalEmployees(employeeCards.length);

            // Рассчитываем средний риск выгорания
            if (employeeCards.length > 0) {
                const avgRisk = employeeCards.reduce((sum, emp) => sum + emp.burnoutRisk, 0) / employeeCards.length;
                setAvgBurnoutRisk(Math.round(avgRisk));
            }

        } catch (error) {
            console.error('Ошибка загрузки сотрудников:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEmployee = () => {
        navigate('/data-input/single');
    };

    const handleAddMultiple = () => {
        navigate('/data-input/bulk');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className={classes.loadingContainer}>
                <div className={classes.spinner}></div>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    return (
        <div className={classes.dashboard}>
            <div className={classes.header}>
                <div className={classes.headerLeft}>
                    <h1 className={classes.title}>📊 Дашборд сотрудников</h1>
                </div>
                <div className={classes.headerRight}>
                    {hasToken ? (
                        <button className={classes.logoutButton} onClick={handleLogout}>
                            Выйти
                        </button>
                    ) : (
                        <button
                            className={classes.loginButton}
                            onClick={() => navigate('/login')}
                        >
                            Войти для синхронизации
                        </button>
                    )}
                </div>
            </div>

            {/* Ключевые метрики */}
            <div className={classes.metricsGrid}>
                <div className={classes.metricCard}>
                    <div className={classes.metricHeader}>
                        <span className={classes.metricIcon}>👥</span>
                        <h3>Всего сотрудников</h3>
                    </div>
                    <div className={classes.metricValue}>{totalEmployees}</div>
                    <div className={classes.metricChange}>
                        {totalEmployees > 0 ? 'Активные сотрудники' : 'Нет данных'}
                    </div>
                </div>

                <div className={classes.metricCard}>
                    <div className={classes.metricHeader}>
                        <span className={classes.metricIcon}>🔥</span>
                        <h3>Средний риск выгорания</h3>
                    </div>
                    <div className={classes.metricValue}>
                        {avgBurnoutRisk}%
                    </div>
                    <div className={classes.metricProgress}>
                        <div
                            className={classes.progressBar}
                            style={{ width: `${avgBurnoutRisk}%`, backgroundColor: getHealthStatus(avgBurnoutRisk).color }}
                        ></div>
                    </div>
                    <div className={classes.metricLabel}>
                        {getHealthStatus(avgBurnoutRisk).emoji} {getHealthStatus(avgBurnoutRisk).status}
                    </div>
                </div>

                <div className={classes.metricCard}>
                    <div className={classes.metricHeader}>
                        <span className={classes.metricIcon}>📈</span>
                        <h3>Средняя вовлеченность</h3>
                    </div>
                    <div className={classes.metricValue}>
                        {employees.length > 0
                            ? Math.round(employees.reduce((sum, emp) => sum + emp.engagementLevel, 0) / employees.length)
                            : 0}%
                    </div>
                    <div className={classes.metricLabel}>
                        Уровень вовлеченности команды
                    </div>
                </div>

                <div className={classes.metricCard}>
                    <div className={classes.metricHeader}>
                        <span className={classes.metricIcon}>🎯</span>
                        <h3>Прошедшие обучение</h3>
                    </div>
                    <div className={classes.metricValue}>
                        {employees.filter(emp => emp.training).length}/{totalEmployees || 0}
                    </div>
                    <div className={classes.metricLabel}>
                        {totalEmployees > 0
                            ? Math.round((employees.filter(emp => emp.training).length / totalEmployees) * 100)
                            : 0}% команды
                    </div>
                </div>
            </div>

            {/* Кнопки действий */}
            <div className={classes.actionButtons}>
                <button className={classes.primaryButton} onClick={handleAddEmployee}>
                    ➕ Добавить сотрудника
                </button>
                <button className={classes.secondaryButton} onClick={handleAddMultiple}>
                    📁 Массовая загрузка
                </button>
                {!hasToken && (
                    <button
                        className={classes.warningButton}
                        onClick={() => navigate('/registration')}
                    >
                        🔐 Зарегистрироваться для синхронизации
                    </button>
                )}
            </div>

            {/* Список сотрудников */}
            {employees.length > 0 ? (
                <div className={classes.employeesSection}>
                    <h2 className={classes.sectionTitle}>Сотрудники ({totalEmployees})</h2>
                    <div className={classes.employeesGrid}>
                        {employees.map((employee) => {
                            const healthStatus = getHealthStatus(employee.burnoutRisk);
                            return (
                                <div key={employee.id} className={classes.employeeCard}>
                                    <div className={classes.employeeHeader}>
                                        <div className={classes.employeeAvatar}>
                                            {employee.gender === 'male' ? '👨' : '👩'}
                                        </div>
                                        <div className={classes.employeeInfo}>
                                            <h3 className={classes.employeeName}>{employee.fullName}</h3>
                                            <p className={classes.employeePosition}>{employee.position}</p>
                                            <div className={classes.employeeMeta}>
                                                <span className={classes.metaItem}>🏙️ {employee.city}</span>
                                                <span className={classes.metaItem}>🎂 {employee.age} лет</span>
                                                <span className={classes.metaItem}>📅 {employee.experience} лет опыта</span>
                                            </div>
                                        </div>
                                        <div
                                            className={classes.healthBadge}
                                            style={{ backgroundColor: healthStatus.color }}
                                        >
                                            {healthStatus.emoji} {employee.burnoutRisk}%
                                        </div>
                                    </div>

                                    <div className={classes.employeeMetrics}>
                                        <div className={classes.metricItem}>
                                            <div className={classes.metricLabelSmall}>Риск выгорания</div>
                                            <div className={classes.metricProgressSmall}>
                                                <div
                                                    className={classes.progressFill}
                                                    style={{
                                                        width: `${employee.burnoutRisk}%`,
                                                        backgroundColor: healthStatus.color
                                                    }}
                                                ></div>
                                            </div>
                                            <div className={classes.metricValueSmall}>{employee.burnoutRisk}%</div>
                                        </div>
                                        <div className={classes.metricItem}>
                                            <div className={classes.metricLabelSmall}>Вовлеченность</div>
                                            <div className={classes.metricProgressSmall}>
                                                <div
                                                    className={classes.progressFill}
                                                    style={{ width: `${employee.engagementLevel}%` }}
                                                ></div>
                                            </div>
                                            <div className={classes.metricValueSmall}>{employee.engagementLevel}%</div>
                                        </div>
                                        <div className={classes.metricItem}>
                                            <div className={classes.metricLabelSmall}>Производительность</div>
                                            <div className={classes.metricProgressSmall}>
                                                <div
                                                    className={classes.progressFill}
                                                    style={{ width: `${employee.performanceScore}%` }}
                                                ></div>
                                            </div>
                                            <div className={classes.metricValueSmall}>{employee.performanceScore}%</div>
                                        </div>
                                    </div>

                                    {employee.llmRecommendation && (
                                        <div className={classes.recommendationBox}>
                                            <div className={classes.recommendationHeader}>
                                                <span className={classes.recommendationIcon}>💡</span>
                                                <strong className={classes.recommendations}>Рекомендация ИИ:</strong>
                                            </div>
                                            <p className={classes.recommendationText}>{employee.llmRecommendation}</p>
                                        </div>
                                    )}

                                    <div className={classes.employeeFooter}>
                                        <div className={classes.tags}>
                                            {employee.positionType === 'Руководитель' && (
                                                <span className={classes.tagLeader}>👑 Руководитель</span>
                                            )}
                                            {employee.certification && (
                                                <span className={classes.tagCertified}>✅ Аттестован</span>
                                            )}
                                            {employee.training && (
                                                <span className={classes.tagTrained}>🎓 Обучен</span>
                                            )}
                                            {employee.corporateEvents && (
                                                <span className={classes.tagActive}>🎉 Активен</span>
                                            )}
                                        </div>
                                        <div className={classes.employeeStats}>
                                            <span className={classes.statItem}>
                                                {employee.sickLeave ? '🤒 Болел' : '👍 Здоров'}
                                            </span>
                                            <span className={classes.statItem}>
                                                {employee.reprimands ? '⚠️ Выговоры' : '✅ Без взысканий'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className={classes.emptyState}>
                    <div className={classes.emptyStateIcon}>📋</div>
                    <h3>Нет данных о сотрудниках</h3>
                    <p>Добавьте первого сотрудника, чтобы начать анализ</p>
                    <button className={classes.primaryButton} onClick={handleAddEmployee}>
                        Добавить первого сотрудника
                    </button>
                </div>
            )}

            {employees.length > 0 && (
                <div className={classes.summary}>
                    <h3>📊 Статистика по команде</h3>
                    <div className={classes.summaryGrid}>
                        <div className={classes.summaryItem}>
                            <strong>Руководители:</strong> {employees.filter(emp => emp.positionType === 'Руководитель').length}
                        </div>
                        <div className={classes.summaryItem}>
                            <strong>Сотрудники с выговорами:</strong> {employees.filter(emp => emp.reprimands).length}
                        </div>
                        <div className={classes.summaryItem}>
                            <strong>Брали больничный:</strong> {employees.filter(emp => emp.sickLeave).length}
                        </div>
                        <div className={classes.summaryItem}>
                            <strong>Участвуют в активностях:</strong> {employees.filter(emp => emp.corporateEvents).length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;