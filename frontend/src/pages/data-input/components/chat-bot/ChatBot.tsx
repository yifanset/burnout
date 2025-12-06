import { useState, useRef, useEffect } from 'react';
import classes from './ChatBot.module.css';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface FormData {
    fullName: string;
    gender: string;
    city: string;
    position: string;
    experience: string;
    age: string;
    positionType: string;
    certification: string;
    training: string;
    lastVacation: string;
    kpiMonths: string;
    sickLeave: string;
    reprimands: string;
    corporateEvents: string;
}

const ChatBot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [formData, setFormData] = useState<FormData>({
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

    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Вопросы для сбора данных
    const questions = [
        { key: 'fullName', text: 'Как зовут сотрудника? (Если желаете анонимный опрос, пришлите "-")' },
        { key: 'position', text: 'Какая должность у вашего сотрудника?' },
        { key: 'city', text: 'В каком городе работает сотрудник?' },
        { key: 'experience', text: 'Сколько лет работает в компании?' },
        { key: 'age', text: 'Сколько ему лет?' },
        { key: 'gender', text: 'Пол (мужской/женский):' },
        { key: 'positionType', text: 'Роль в компании (Руководитель/Сотрудник):' },
        { key: 'certification', text: 'Проходил ли аттестацию? (да/нет):' },
        { key: 'training', text: 'Проходил ли обучение? (да/нет):' },
        { key: 'lastVacation', text: 'Когда брал отпуск в последний раз?' },
        { key: 'kpiMonths', text: 'За сколько месяцев у вас есть данные KPI? (например: "5"):' },
        { key: 'sickLeave', text: 'Брал ли больничный за последний год? (да/нет):' },
        { key: 'reprimands', text: 'Имеются ли выговоры? (да/нет):' },
        { key: 'corporateEvents', text: 'Участвует в корпоративных активностях? (да/нет):' }
    ];

    // Авто-скролл
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Прогресс бар при обработке
    useEffect(() => {
        if (isProcessing) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        // Редирект после завершения
                        setTimeout(() => {
                            navigate('/buypremium');
                        }, 500);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [isProcessing, navigate]);

    // Начальное сообщение и первый вопрос
    useEffect(() => {
        // Создаем начальные сообщения сразу
        const initialMessages: Message[] = [
            {
                id: '1',
                text: 'Привет! Я могу проанализировать сотрудника на склонность к выгоранию. Ответь, пожалуйста на несколько вопросов.',
                isUser: false,
                timestamp: new Date()
            },
            {
                id: 'q0',
                text: questions[0].text,
                isUser: false,
                timestamp: new Date()
            }
        ];

        setMessages(initialMessages);
    }, []);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading || isProcessing) return;

        // Сохраняем ответ пользователя
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        // Сохраняем ответ в formData
        const currentQuestion = questions[questionIndex];
        setFormData(prev => ({
            ...prev,
            [currentQuestion.key]: inputText
        }));

        setInputText('');
        setIsLoading(true);

        // Короткая пауза
        setTimeout(() => {
            setIsLoading(false);

            // Если еще не все вопросы заданы
            if (questionIndex < questions.length - 1) {
                const nextIndex = questionIndex + 1;
                setQuestionIndex(nextIndex);

                // Добавляем следующий вопрос
                const nextQuestionMessage: Message = {
                    id: `q${nextIndex}`,
                    text: questions[nextIndex].text,
                    isUser: false,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, nextQuestionMessage]);
            } else {
                // Все вопросы заданы - запускаем обработку
                const processingMessage: Message = {
                    id: 'processing',
                    text: '✅ Все данные собраны! Анализирую информацию с помощью ИИ...',
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, processingMessage]);

                // Логируем собранные данные
                console.log('Собранные данные:', formData);

                // Запускаем симуляцию обработки
                setIsProcessing(true);
                setProgress(0);
            }
        }, 800);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={classes.chatContainer}>
            <div className={classes.chatHeader}>
                <div className={classes.botInfo}>
                    <div className={classes.botAvatar}>AI</div>
                    <div>
                        <h3>Сияй - ИИ-Помощник по сотрудникам</h3>
                    </div>
                </div>
            </div>

            <div className={classes.messagesContainer}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${classes.message} ${
                            message.isUser ? classes.userMessage : classes.botMessage
                        }`}
                    >
                        <div className={classes.messageContent}>
                            <div className={classes.messageText}>{message.text}</div>
                            <div className={classes.timestamp}>
                                {message.timestamp.toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className={`${classes.message} ${classes.userMessage}`}>
                        <div className={classes.messageContent}>
                            <div className={classes.typingIndicator}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                {isProcessing && (
                    <div className={`${classes.message} ${classes.botMessage}`}>
                        <div className={classes.messageContent}>
                            <div className={classes.progressBarContainer}>
                                <div
                                    className={classes.progressBar}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className={classes.progressText}>
                                Анализ ИИ: {progress}%
                            </div>
                            <div className={classes.processingSteps}>
                                {progress < 20 && "🔍 Обрабатываю введенные данные..."}
                                {progress >= 20 && progress < 40 && "📊 Анализирую стаж и возраст..."}
                                {progress >= 40 && progress < 60 && "🤖 Оцениваю показатели эффективности..."}
                                {progress >= 60 && progress < 80 && "📈 Формирую профиль риска выгорания..."}
                                {progress >= 80 && "✅ Готовлю персонализированные рекомендации..."}
                            </div>
                            <div className={classes.dataPreview}>
                                Собрано полей: {Object.values(formData).filter(v => v.trim() !== '').length}/{questions.length}
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {!isProcessing && (
                <div className={classes.inputContainer}>
                    <div className={classes.inputWrapper}>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Введите ${questions[questionIndex].key === 'fullName' ? 'ФИО' : 'ответ'}...`}
                            className={classes.textInput}
                            rows={2}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isLoading}
                            className={classes.sendButton}
                        >
                            {isLoading ? '...' : '→'}
                        </button>
                    </div>
                    <div className={classes.progressIndicator}>
                        {Array.from({ length: questions.length }).map((_, i) => (
                            <div
                                key={i}
                                className={`${classes.progressDot} ${
                                    i < questionIndex ? classes.completedDot :
                                        i === questionIndex ? classes.currentDot :
                                            classes.pendingDot
                                }`}
                                title={questions[i].text}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;