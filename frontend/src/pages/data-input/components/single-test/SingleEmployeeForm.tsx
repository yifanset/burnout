import {type ChangeEvent, type FormEvent } from "react";
import CustomSelect from "../../../../components/CustomSelect/CustomSelect";
import { useState, useMemo, useEffect } from "react";
import classes from "./SingleEmployeeForm.module.css";
import QuestionSection from "../../../../components/QuestionSection/QuestionSection";
import type { FormData } from "../../../../types";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface LocalStorageEmployee {
    id: string;
    data: FormData;
    timestamp: string;
    status: 'pending' | 'synced';
}

interface ExtendedFormData extends FormData {
    llmRecommendation?: string;
}

const SingleEmployeeForm = () => {
    const [formData, setFormData] = useState<ExtendedFormData>({
        fullName: "",
        gender: "",
        city: "",
        position: "",
        experience: "",
        age: "",
        positionType: "",
        certification: "",
        training: "",
        lastVacation: "",
        kpiMonths: "",
        sickLeave: "",
        reprimands: "",
        corporateEvents: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("");
    const navigate = useNavigate();

    // При загрузке компонента проверяем, нет ли неотправленных данных в localStorage
    useEffect(() => {
        const checkLocalStorageData = () => {
            const pendingData = localStorage.getItem('pendingEmployees');
            if (pendingData) {
                try {
                    const parsedData = JSON.parse(pendingData);
                    console.log(`Найдено ${parsedData.length} неотправленных сотрудников в localStorage`);

                    // Можно показать уведомление пользователю
                    if (parsedData.length > 0) {
                        console.log("Есть неотправленные данные. Попробуйте войти в систему для синхронизации.");
                    }
                } catch (error) {
                    console.error("Ошибка при чтении данных из localStorage:", error);
                }
            }
        };

        checkLocalStorageData();
    }, []);

    useEffect(() => {
        if (isLoading) {
            const duration = 10000; // 10 секунд
            const steps = 100; // 100 шагов
            const intervalTime = duration / steps; // 100ms на шаг

            let currentStep = 0;

            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    currentStep++;
                    if (currentStep >= steps) {
                        clearInterval(interval);
                        return 100;
                    }
                    return Math.min(prev + 1, 100);
                });
            }, intervalTime);

            return () => clearInterval(interval);
        } else {
            setLoadingProgress(0);
        }
    }, [isLoading]);

    const simulateLoading = async () => {
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingMessage("Начинаем обработку...");

        return new Promise<void>((resolve) => {
            const messages = [
                { time: 1000, message: "Проверка данных..." },
                { time: 3000, message: "Анализ анкеты..." },
                { time: 5000, message: "Расчет показателей..." },
                { time: 7000, message: "Формирование отчета..." },
                { time: 9000, message: "Завершаем обработку..." },
            ];

            messages.forEach(({ time, message }) => {
                setTimeout(() => {
                    setLoadingMessage(message);
                }, time);
            });

            setTimeout(() => {
                setIsLoading(false);
                resolve();
            }, 10000);
        });
    };

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
            "Следует делегировать часть обязанностей",
            "Требуется командировка для смены обстановки",
            "Показано участие в корпоративных тимбилдингах",
            "Рекомендуется внедрить систему наставничества",
            "Требуется оптимизация рабочих процессов",
            "Следует пересмотреть KPI цели",
            "Рекомендуется участие в wellness-программах",
            "Показано сокращение совещаний на 30%",
            "Требуется дополнительный день отдыха в месяц",
            "Рекомендуется переход на удаленный режим 2 дня в неделю",
            "Следует исключить работу в выходные дни"
        ];

        const randomIndex = Math.floor(Math.random() * recommendations.length);
        return recommendations[randomIndex];
    };

    const kpiMonthFields = useMemo(() => {
        const monthsCount = Math.min(parseInt(formData.kpiMonths) || 0, 4);
        const months = [];
        const currentDate = new Date();

        for (let i = 0; i < monthsCount; i++) {
            const date = new Date(currentDate);
            date.setMonth(currentDate.getMonth() - i);
            const monthName = date.toLocaleString('ru-RU', { month: 'long' });
            const year = date.getFullYear();
            const fieldName = `kpi_${date.getMonth() + 1}_${year}`;

            months.push({
                number: i + 1,
                name: `${monthName} ${year}`,
                fieldName: fieldName
            });
        }

        return months;
    }, [formData.kpiMonths]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleKpiChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            kpiMonths: value
        }));
    };

    const handleKpiInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Функция для сохранения данных в localStorage
    const saveToLocalStorage = (): boolean => {
        try {
            const pendingEmployees: LocalStorageEmployee[] = JSON.parse(
                localStorage.getItem('pendingEmployees') || '[]'
            );

            const randomRecommendation = generateRandomRecommendation();

            const newEmployee: LocalStorageEmployee = {
                id: Date.now().toString(),
                data: {
                    ...formData,
                    fullName: formData.fullName.trim() || 'Anonymous',
                    llmRecommendation: randomRecommendation // Добавлено здесь
                },
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            pendingEmployees.push(newEmployee);
            localStorage.setItem('pendingEmployees', JSON.stringify(pendingEmployees));

            console.log("Данные сохранены в localStorage:", newEmployee);
            console.log("Сгенерирована рекомендация:", randomRecommendation);
            console.log("Всего неотправленных сотрудников:", pendingEmployees.length);

            return true;
        } catch (error) {
            console.error("Ошибка при сохранении в localStorage:", error);
            return false;
        }
    };

    // Функция для отправки данных на сервер (если есть токен)
    const sendToServer = async (employeeData: any): Promise<boolean> => {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.log("Токен не найден, данные будут сохранены локально");
                return false;
            }

            const response = await axios.post(`${API_URL}/api/employees`, employeeData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Ответ сервера:", response.data);
            return true;
        } catch (error: any) {
            console.error("Ошибка при отправке на сервер:", error);
            return false;
        }
    };

    // Подготовка данных для API
    const prepareEmployeeData = (data: FormData) => {
        const randomRecommendation = generateRandomRecommendation();

        return {
            fullName: data.fullName.trim() || 'Anonymous',
            gender: data.gender === "male" ? "male" : "female",
            city: data.city,
            position: data.position,
            experience: parseInt(data.experience) || 0,
            age: parseInt(data.age) || 0,
            positionType: data.positionType === "manager" ? "Руководитель" : "Сотрудник",
            certification: data.certification === "yes",
            training: data.training === "yes",
            lastVacation: data.lastVacation ? `${data.lastVacation}T00:00:00.000Z` : null,
            kpiMonths: parseInt(data.kpiMonths) || null,
            sickLeave: data.sickLeave === "yes",
            reprimands: data.reprimands === "yes",
            corporateEvents: data.corporateEvents === "yes",
            kpiValues: kpiMonthFields
                .map(month => data[month.fieldName as keyof FormData])
                .filter(Boolean)
                .join(","),
            llmRecommendation: randomRecommendation // Добавлено здесь
        };
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await simulateLoading();

        setIsSubmitting(true);

        try {
            const employeeData = prepareEmployeeData(formData);
            console.log("Подготовленные данные:", employeeData);

            const token = localStorage.getItem('authToken');

            if (token) {
                // Есть токен - отправляем на сервер
                const success = await sendToServer(employeeData);

                if (success) {
                    console.log("Данные сотрудника успешно сохранены на сервере!");
                } else {
                    // Если отправка на сервер не удалась, сохраняем локально
                    const savedLocally = saveToLocalStorage();
                    if (savedLocally) {
                        console.log("Сервер недоступен. Данные сохранены локально. Они будут отправлены при следующем входе.");
                    }
                }
            } else {
                // Нет токена - сохраняем в localStorage
                const savedLocally = saveToLocalStorage();

                if (savedLocally) {
                    console.log("Вы не авторизованы. Данные сохранены локально. Войдите в систему для отправки на сервер.");
                } else {
                    console.log("Ошибка при сохранении данных.");
                }
            }

            setFormData({
                fullName: "",
                gender: "",
                city: "",
                position: "",
                experience: "",
                age: "",
                positionType: "",
                certification: "",
                training: "",
                lastVacation: "",
                kpiMonths: "",
                sickLeave: "",
                reprimands: "",
                corporateEvents: ""
            });

            navigate('/dashboard');

        } catch (error: any) {
            console.error("Ошибка при обработке формы:", error);
            alert("Ошибка при обработке данных");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={classes.page}>
            {/* Индикатор загрузки */}
            {isLoading && (
                <div className={classes.loadingOverlay}>
                    <div className={classes.loadingModal}>
                        <div className={classes.spinner}></div>
                        <h3>{loadingMessage}</h3>
                        <div className={classes.progressBar}>
                            <div
                                className={classes.progressFill}
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                        <p>{loadingProgress}%</p>
                    </div>
                </div>
            )}

            {!isLoading && (
                <form className={classes.form} onSubmit={handleSubmit}>
                    <h2 className={classes.title}>Быстрый тест</h2>
                    <div className={classes.grid}>
                        {/* Ряд 1 */}
                        <QuestionSection title="1. ФИО сотрудника">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="ФИО сотрудника (можно пропустить)"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={classes.input}
                            />
                        </QuestionSection>

                        <QuestionSection title="2. Пол">
                            <div className={classes.radioGroup}>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={formData.gender === "male"}
                                        onChange={handleChange}
                                    />
                                    Мужской
                                </label>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={formData.gender === "female"}
                                        onChange={handleChange}
                                    />
                                    Женский
                                </label>
                            </div>
                        </QuestionSection>

                        <QuestionSection title="3. Город">
                            <input
                                type="text"
                                name="city"
                                placeholder="Город сотрудника"
                                value={formData.city}
                                onChange={handleChange}
                                className={classes.input}
                                required
                            />
                        </QuestionSection>

                        {/* Ряд 2 */}
                        <QuestionSection title="4. Должность">
                            <input
                                type="text"
                                name="position"
                                placeholder="Должность сотрудника"
                                value={formData.position}
                                onChange={handleChange}
                                className={classes.input}
                                required
                            />
                        </QuestionSection>

                        <QuestionSection title="5. Стаж (лет)">
                            <input
                                type="number"
                                name="experience"
                                placeholder="Стаж"
                                value={formData.experience}
                                onChange={handleChange}
                                className={classes.input}
                                min="0"
                                max="50"
                                required
                            />
                        </QuestionSection>

                        <QuestionSection title="6. Возраст">
                            <input
                                type="number"
                                name="age"
                                placeholder="Возраст"
                                value={formData.age}
                                onChange={handleChange}
                                className={classes.input}
                                min="18"
                                max="70"
                                required
                            />
                        </QuestionSection>

                        {/* Ряд 3 */}
                        <QuestionSection title="7. Тип должности">
                            <div className={classes.radioGroup}>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="positionType"
                                        value="manager"
                                        checked={formData.positionType === "manager"}
                                        onChange={handleChange}
                                    />
                                    Руководитель
                                </label>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="positionType"
                                        value="employee"
                                        checked={formData.positionType === "employee"}
                                        onChange={handleChange}
                                    />
                                    Сотрудник
                                </label>
                            </div>
                        </QuestionSection>

                        <QuestionSection title="8. Прошли ли вы аттестацию?">
                            <div className={classes.radioGroup}>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="certification"
                                        value="yes"
                                        checked={formData.certification === "yes"}
                                        onChange={handleChange}
                                    />
                                    Да
                                </label>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="certification"
                                        value="no"
                                        checked={formData.certification === "no"}
                                        onChange={handleChange}
                                    />
                                    Нет
                                </label>
                            </div>
                        </QuestionSection>

                        <QuestionSection title="9. Прошли ли вы обучение?">
                            <div className={classes.radioGroup}>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="training"
                                        value="yes"
                                        checked={formData.training === "yes"}
                                        onChange={handleChange}
                                    />
                                    Да
                                </label>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="training"
                                        value="no"
                                        checked={formData.training === "no"}
                                        onChange={handleChange}
                                    />
                                    Нет
                                </label>
                            </div>
                        </QuestionSection>

                        {/* Ряд 4 */}
                        <QuestionSection title="10. Дата последнего отпуска">
                            <input
                                type="date"
                                name="lastVacation"
                                value={formData.lastVacation}
                                onChange={handleChange}
                                className={classes.input}
                            />
                        </QuestionSection>

                        <QuestionSection title="11. За сколько месяцев можете предоставить KPI?">
                            <CustomSelect
                                value={formData.kpiMonths}
                                onChange={handleKpiChange}
                                options={[
                                    { value: "", label: "Не выбрано" },
                                    { value: "1", label: "1 месяц" },
                                    { value: "2", label: "2 месяца" },
                                    { value: "3", label: "3 месяца" },
                                    { value: "4", label: "4 месяца" }
                                ]}
                            />
                        </QuestionSection>

                        {/* Динамические KPI поля */}
                        {kpiMonthFields.map((month) => (
                            <QuestionSection key={month.fieldName} title={`11.${month.number} KPI за ${month.name}`}>
                                <div className={classes.kpiInputWrapper}>
                                    <input
                                        type="number"
                                        name={month.fieldName}
                                        value={formData[month.fieldName as keyof FormData] || ""}
                                        onChange={handleKpiInputChange}
                                        className={classes.input}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>
                            </QuestionSection>
                        ))}

                        <QuestionSection title={`${12 + kpiMonthFields.length}. Брал ли больничный за последний год?`}>
                            <div className={classes.radioGroup}>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="sickLeave"
                                        value="yes"
                                        checked={formData.sickLeave === "yes"}
                                        onChange={handleChange}
                                    />
                                    Да
                                </label>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="sickLeave"
                                        value="no"
                                        checked={formData.sickLeave === "no"}
                                        onChange={handleChange}
                                    />
                                    Нет
                                </label>
                            </div>
                        </QuestionSection>

                        <QuestionSection title={`${13 + kpiMonthFields.length}. Имеет ли выговоры?`}>
                            <div className={classes.radioGroup}>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="reprimands"
                                        value="yes"
                                        checked={formData.reprimands === "yes"}
                                        onChange={handleChange}
                                    />
                                    Да
                                </label>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="reprimands"
                                        value="no"
                                        checked={formData.reprimands === "no"}
                                        onChange={handleChange}
                                    />
                                    Нет
                                </label>
                            </div>
                        </QuestionSection>

                        <QuestionSection title={`${14 + kpiMonthFields.length}. Участие в корпоративах`}>
                            <div className={classes.radioGroup}>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="corporateEvents"
                                        value="yes"
                                        checked={formData.corporateEvents === "yes"}
                                        onChange={handleChange}
                                    />
                                    Да
                                </label>
                                <label className={classes.radioLabel}>
                                    <input
                                        type="radio"
                                        name="corporateEvents"
                                        value="no"
                                        checked={formData.corporateEvents === "no"}
                                        onChange={handleChange}
                                    />
                                    Нет
                                </label>
                            </div>
                        </QuestionSection>
                    </div>

                    <button
                        type="submit"
                        className={classes.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Отправка...' : 'Отправить опросник'}
                    </button>
                </form>
            )}


        </div>
    );
};

export default SingleEmployeeForm;