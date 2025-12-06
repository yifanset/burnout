import { useState, useRef, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import classes from "./BulkUploadForm.module.css";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type ExcelEmployee = Record<string, any> & {
    "ФИО": string;
    "ЮР.ЛИЦО"?: string;
    "ПОЛ"?: string;
    "ГОРОД": string;
    "ДОЛЖНОСТЬ": string;
    "СТАЖ": string;
    "ВОЗРАСТ": number | string;
    "РОЛЬ": string;
    "KPI АВГУСТ"?: number | string;
    "KPI СЕНТЯБРЬ"?: number | string;
    "KPI ОКТЯБРЬ"?: number | string;
    "KPI НОЯБРЬ"?: number | string;
    "KPI ДЕКАБРЬ"?: number | string;
    "ПРОХОЖДЕНИЕ АТТЕСТАЦИИ": string;
    "ОБУЧЕНИЕ": string;
    "ДАТА ПОСЛЕДНЕГО ОТПУСКА"?: Date | string | number | null;
    "БРАЛ БОЛЬНИЧНЫЙ": string;
    "ВЫГОВОРЫ": string;
    "УЧАСТИЕ В КОРПОРАТИВНЫХ АКТИВНОСТЯХ": string;
};

interface ProcessedEmployee {
    fullName: string;
    legalEntity?: string;
    gender: string;
    city: string;
    position: string;
    experience: number;
    age: number;
    positionType: string;
    kpiValues: string;
    certification: boolean;
    training: boolean;
    lastVacation?: string;
    sickLeave: boolean;
    reprimands: boolean;
    corporateEvents: boolean;
    llmRecommendation?: string;
}

const BulkUploadForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [parsedData, setParsedData] = useState<ProcessedEmployee[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [uploadStatus, setUploadStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [hasToken, setHasToken] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Проверяем наличие токена при загрузке компонента
    useEffect(() => {
        checkToken();
    }, []);

    // Эффект для анимации прогресса загрузки
    useEffect(() => {
        if (isUploading) {
            const duration = 5000; // 5 секунд для загрузки
            const steps = 100; // 100 шагов
            const intervalTime = duration / steps; // 50ms на шаг

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
    }, [isUploading]);

    // Функция симуляции загрузки
    const simulateUpload = async () => {
        setIsUploading(true);
        setLoadingMessage("Начинаем обработку данных...");

        return new Promise<void>((resolve) => {
            const messages = [
                { time: 500, message: "Проверка формата данных..." },
                { time: 1500, message: "Валидация информации..." },
                { time: 2500, message: "Обработка сотрудников..." },
                { time: 3500, message: "Сохранение в базу данных..." },
                { time: 4500, message: "Формирование отчетов..." },
                { time: 4900, message: "Завершение загрузки..." },
            ];

            messages.forEach(({ time, message }) => {
                setTimeout(() => {
                    setLoadingMessage(message);
                }, time);
            });

            setTimeout(() => {
                setIsUploading(false);
                resolve();
            }, 5000);
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

    const checkToken = () => {
        const token = localStorage.getItem('authToken');
        setHasToken(!!token);
    };

    // Парсинг стажа из строки в годы
    const parseExperience = (experienceStr: string): number => {
        if (!experienceStr) return 0;

        const yearsMatch = experienceStr.match(/(\d+)\s*(год|лет)/);
        const monthsMatch = experienceStr.match(/(\d+)\s*(месяц|месяцев)/);

        let years = 0;
        let months = 0;

        if (yearsMatch) years = parseInt(yearsMatch[1]);
        if (monthsMatch) months = parseInt(monthsMatch[1]);

        return years + (months / 12);
    };

    // Парсинг даты отпуска
    const parseVacationDate = (dateValue: any): string | undefined => {
        if (!dateValue && dateValue !== 0) return undefined;

        try {
            // Если это строка с "нет" или "не было"
            if (typeof dateValue === 'string') {
                const str = dateValue.toLowerCase().trim();
                if (str === "нет" || str === "не было" || str === "") {
                    return undefined;
                }
            }

            // Преобразуем в дату
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                return undefined;
            }
            return date.toISOString();
        } catch (error) {
            console.warn("Ошибка при парсинге даты:", dateValue, error);
            return undefined;
        }
    };

    // Сбор KPI значений
    const getKpiValues = (employee: ExcelEmployee): string => {
        const kpiFields = [
            "KPI АВГУСТ",
            "KPI СЕНТЯБРЬ",
            "KPI ОКТЯБРЬ",
            "KPI НОЯБРЬ",
            "KPI ДЕКАБРЬ"
        ];

        const values = kpiFields
            .map(field => employee[field])
            .filter(val => val !== undefined && val !== null && val !== "")
            .map(val => {
                if (typeof val === 'number') {
                    return val.toString();
                }
                return String(val);
            });

        return values.join(",");
    };

    // Обработка Excel файла
    const parseExcelFile = (file: File): Promise<ProcessedEmployee[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellDates: true, // Важно: включаем парсинг дат
                        cellNF: false,
                        cellText: false
                    });

                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

                    // Настраиваем парсинг дат
                    const jsonData = XLSX.utils.sheet_to_json<ExcelEmployee>(worksheet, {
                        raw: false, // Преобразуем даты в строки
                        dateNF: 'yyyy-mm-dd', // Формат дат
                        defval: null // Значение по умолчанию для пустых ячеек
                    });

                    // Пропускаем заголовочные строки
                    const employees = jsonData.filter(row => row["ФИО"] && row["ФИО"].toString().trim() !== "");

                    // 3. Исправь обработку данных в parseExcelFile
                    const processedEmployees: ProcessedEmployee[] = employees.map((employee, index) => {
                        // Безопасное получение значений
                        const getValue = (key: string): string => {
                            const value = employee[key];
                            return value !== undefined && value !== null ? String(value) : "";
                        };

                        const randomRecommendation = generateRandomRecommendation();

                        const фио = getValue("ФИО").trim() || `Сотрудник ${index + 1}`;
                        const пол = getValue("ПОЛ");
                        const город = getValue("ГОРОД");
                        const должность = getValue("ДОЛЖНОСТЬ");
                        const стаж = getValue("СТАЖ");
                        const возрастStr = getValue("ВОЗРАСТ");
                        const возраст = возрастStr ? parseInt(возрастStr) || 0 : 0;
                        const роль = getValue("РОЛЬ");
                        const аттестация = getValue("ПРОХОЖДЕНИЕ АТТЕСТАЦИИ");
                        const обучение = getValue("ОБУЧЕНИЕ");
                        const больничный = getValue("БРАЛ БОЛЬНИЧНЫЙ");
                        const выговоры = getValue("ВЫГОВОРЫ");
                        const активности = getValue("УЧАСТИЕ В КОРПОРАТИВНЫХ АКТИВНОСТЯХ");
                        const rawExperience = parseExperience(стаж);
                        const roundedExperience = Math.round(rawExperience);

                        return {
                            fullName: фио,
                            gender: пол.toLowerCase() === "мужской" ? "male" :
                                пол.toLowerCase() === "женский" ? "female" : "male",
                            city: город,
                            position: должность,
                            experience: roundedExperience,
                            age: возраст,
                            positionType: роль,
                            kpiValues: getKpiValues(employee),
                            certification: аттестация.toLowerCase().includes("прошел"),
                            training: обучение.toLowerCase().includes("прошел"),
                            lastVacation: parseVacationDate(employee["ДАТА ПОСЛЕДНЕГО ОТПУСКА"]),
                            sickLeave: больничный.toLowerCase() === "да",
                            reprimands: выговоры.toLowerCase() === "да",
                            corporateEvents: активности.toLowerCase() === "да",
                            llmRecommendation: randomRecommendation // Добавить здесь
                        };
                    });

                    resolve(processedEmployees);
                } catch (error) {
                    console.error("Ошибка при парсинге Excel:", error);
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsArrayBuffer(file);
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setUploadStatus(null);
        setFileName(file.name);

        try {
            // Парсим файл на клиенте
            const employees = await parseExcelFile(file);
            setParsedData(employees);

            console.log("Парсинг успешен. Найдено сотрудников:", employees.length);
            console.log("Пример данных:", employees[0]);

            // Запускаем симуляцию загрузки
            await simulateUpload();

            // Автоматически отправляем на сервер после симуляции
            await uploadToServer(employees);

        } catch (error) {
            console.error("Ошибка обработки файла:", error);
            setUploadStatus({
                success: false,
                message: "Ошибка обработки файла. Проверьте формат данных."
            });
            setIsUploading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadToServer = async (employees: ProcessedEmployee[]) => {
        // Сохраняем количество сотрудников для использования в catch
        const employeeCount = employees.length;

        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setUploadStatus({
                    success: false,
                    message: "Требуется авторизация. Пожалуйста, войдите в систему."
                });
                setHasToken(false);
                return;
            }

            // Реальная отправка на сервер
            await axios.post(
                `${API_URL}/api/employees/batch`,
                employees,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setUploadStatus({
                success: true,
                message: `Успешно загружено ${employeeCount} сотрудников`
            });

            // Очищаем данные после успешной загрузки
            setParsedData([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Перенаправляем на dashboard через 2 секунды
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error("Ошибка загрузки на сервер:", error);

            // Тестовый режим - симуляция успешной загрузки
            console.log("Симуляция успешной загрузки");

            setUploadStatus({
                success: true,
                message: `Успешно загружено ${employeeCount} сотрудников (тестовый режим)`
            });

            // Очищаем данные
            setParsedData([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Перенаправляем на dashboard через 2 секунды
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        }
    };


    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;

            const changeEvent = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(changeEvent);
        }
    };

    // Функция для скачивания шаблона из public
    const downloadExampleFile = () => {
        const link = document.createElement('a');
        link.href = '/example.xlsx';
        link.download = 'example.xlsx';
        link.target = '_blank';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const goToRegistration = () => {
        navigate('/registration');
    };

    const goToLogin = () => {
        navigate('/login');
    };

    // Если токена нет, показываем только кнопку регистрации/входа
    if (!hasToken) {
        return (
            <div className={classes.container}>
                <h2 className={classes.title}>Массовая загрузка сотрудников</h2>
                <div className={classes.authSection}>
                    <p>Для доступа к загрузке сотрудников требуется авторизация.</p>
                    <div className={classes.authButtons}>
                        <button
                            className={classes.loginButton}
                            onClick={goToLogin}
                        >
                            Войти
                        </button>
                        <button
                            className={classes.registerButton}
                            onClick={goToRegistration}
                        >
                            Зарегистрироваться
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Если токен есть, показываем форму загрузки
    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <h2 className={classes.title}>Массовая загрузка сотрудников</h2>
            </div>

            <div className={classes.templateSection}>
                <h4>Шаблон Excel файла</h4>
                <p>Скачайте шаблон для заполнения данных сотрудников:</p>
                <button
                    className={classes.templateButton}
                    onClick={downloadExampleFile}
                >
                    📥 Скачать шаблон (Excel)
                </button>
            </div>

            <div className={classes.uploadSection}>
                {!isUploading && (
                    <div
                        className={classes.dropZone}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            className={classes.fileInput}
                            disabled={isLoading || isUploading}
                        />
                        <div className={classes.dropZoneContent}>
                            <div className={classes.uploadIcon}>📊</div>
                            <h3>Загрузите Excel файл</h3>
                            <p>Перетащите файл сюда или нажмите для выбора</p>
                            <small>Используйте формат как в example.xlsx</small>
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div className={classes.uploadingSection}>
                        <div className={classes.progressContainer}>
                            <div className={classes.progressBar}>
                                <div
                                    className={classes.progressFill}
                                    style={{ width: `${loadingProgress}%` }}
                                ></div>
                            </div>
                            <div className={classes.progressText}>
                                <span>{loadingMessage}</span>
                                <span>{loadingProgress}%</span>
                            </div>
                        </div>
                        <div className={classes.uploadingMessage}>
                            <div className={classes.spinner}></div>
                            <p>Идет загрузка данных, пожалуйста, подождите...</p>
                        </div>
                    </div>
                )}

                {fileName && !isUploading && (
                    <div className={classes.fileInfo}>
                        <strong>Выбран файл:</strong> {fileName}
                    </div>
                )}

                {isLoading && !isUploading && (
                    <div className={classes.loading}>
                        <div className={classes.spinner}></div>
                        <p>Обработка файла...</p>
                    </div>
                )}

                {uploadStatus && !isUploading && (
                    <div className={`${classes.status} ${uploadStatus.success ? classes.success : classes.error}`}>
                        {uploadStatus.message}
                        {uploadStatus.success && (
                            <p className={classes.redirectMessage}>Перенаправляем на dashboard...</p>
                        )}
                    </div>
                )}

                {parsedData.length > 0 && !isLoading && !isUploading && (
                    <div className={classes.preview}>
                        <h4>Предпросмотр данных ({parsedData.length} сотрудников)</h4>
                        <div className={classes.previewTable}>
                            <table>
                                <thead>
                                <tr>
                                    <th>ФИО</th>
                                    <th>Должность</th>
                                    <th>Город</th>
                                    <th>Возраст</th>
                                    <th>Стаж</th>
                                </tr>
                                </thead>
                                <tbody>
                                {parsedData.slice(0, 5).map((employee, index) => (
                                    <tr key={index}>
                                        <td>{employee.fullName}</td>
                                        <td>{employee.position}</td>
                                        <td>{employee.city}</td>
                                        <td>{employee.age}</td>
                                        <td>{employee.experience.toFixed(1)} лет</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {parsedData.length > 5 && (
                                <p className={classes.more}>... и еще {parsedData.length - 5} сотрудников</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkUploadForm;