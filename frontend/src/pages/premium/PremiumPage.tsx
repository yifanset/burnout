import { useState } from 'react';
import classes from './PremiumPage.module.css';

const PremiumPage = () => {
    const [showToast, setShowToast] = useState(false);

    const handlePurchase = () => {
        // Показываем тостер с ошибкой
        setShowToast(true);

        // Автоматически скрываем тостер через 3 секунды
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    return (
        <div className={classes.container}>
            {/* Главный контент */}
            <div className={classes.heroSection}>
                <div className={classes.heroContent}>
                    <div className={classes.badge}>🚀 PREMIUM</div>
                    <h1 className={classes.title}>
                        Разблокируйте полную мощь <span className={classes.highlight}>ИИ-анализа</span>
                    </h1>
                    <p className={classes.subtitle}>
                        Чтобы получить персонализированный анализ сотрудников и рекомендации от ИИ
                    </p>

                    <div className={classes.ctaBox}>
                        <p className={classes.ctaText}>
                            🔒 В данный момент доступ к ИИ-анализу ограничен
                        </p>
                        <button
                            className={classes.purchaseButton}
                            onClick={handlePurchase}
                        >
                            💎 Приобрести Premium за 0₽/месяц
                        </button>
                    </div>
                </div>

                <div className={classes.heroImage}>
                    <div className={classes.imagePlaceholder}>
                        <div className={classes.aiIcon}>🤖</div>
                        <div className={classes.lockIcon}>🔒</div>
                    </div>
                </div>
            </div>

            {/* Преимущества Premium */}
            <div className={classes.featuresSection}>
                <h2 className={classes.sectionTitle}>Что вы получите с Premium</h2>
                <div className={classes.featuresGrid}>
                    <div className={classes.featureCard}>
                        <div className={classes.featureIcon}>🧠</div>
                        <h3>ИИ-Анализ сотрудников</h3>
                        <p>Глубокий анализ риска выгорания и производительности с помощью нейросетей</p>
                    </div>

                    <div className={classes.featureCard}>
                        <div className={classes.featureIcon}>📊</div>
                        <h3>Детальная аналитика</h3>
                        <p>Графики, прогнозы и расширенная статистика по каждому сотруднику</p>
                    </div>

                    <div className={classes.featureCard}>
                        <div className={classes.featureIcon}>💡</div>
                        <h3>Персональные рекомендации</h3>
                        <p>Индивидуальные планы развития для каждого сотрудника от ИИ</p>
                    </div>

                    <div className={classes.featureCard}>
                        <div className={classes.featureIcon}>🚀</div>
                        <h3>Приоритетная поддержка</h3>
                        <p>Ускоренная обработка запросов и консультации от экспертов</p>
                    </div>
                </div>
            </div>

            {/* Тарифы */}
            <div className={classes.pricingSection}>
                <h2 className={classes.sectionTitle}>Выберите тариф</h2>
                <div className={classes.pricingGrid}>
                    <div className={classes.pricingCard}>
                        <div className={classes.pricingHeaderFree}>
                            <h3>Бесплатный</h3>
                            <div className={classes.price}>0₽</div>
                        </div>
                        <ul className={classes.featuresList}>
                            <li className={classes.included}>✅ Базовый ввод данных</li>
                            <li className={classes.included}>✅ Локальное хранение</li>
                            <li className={classes.excluded}>❌ ИИ-анализ недоступен</li>
                            <li className={classes.excluded}>❌ Рекомендации ИИ</li>
                            <li className={classes.excluded}>❌ Детальная аналитика</li>
                        </ul>
                        <button className={classes.currentPlanButton}>
                            Текущий план
                        </button>
                    </div>

                    <div className={`${classes.pricingCard} ${classes.premiumCard}`}>
                        <div className={classes.premiumBadge}>РЕКОМЕНДУЕМ</div>
                        <div className={classes.pricingHeader}>
                            <h3>Premium</h3>
                            <div className={classes.price}>0₽</div>
                            <p className={classes.period}>в месяц</p>
                        </div>
                        <ul className={classes.featuresList}>
                            <li className={classes.included}>✅ Всё из бесплатного тарифа</li>
                            <li className={classes.included}>✅ Полный ИИ-анализ</li>
                            <li className={classes.included}>✅ Персональные рекомендации</li>
                            <li className={classes.included}>✅ Детальная аналитика</li>
                            <li className={classes.included}>✅ Приоритетная поддержка</li>
                        </ul>
                        <button
                            className={classes.premiumPlanButton}
                            onClick={handlePurchase}
                        >
                            💎 Приобрести Premium
                        </button>
                    </div>
                </div>
            </div>

            {/* Как это работает */}
            <div className={classes.howItWorks}>
                <h2 className={classes.sectionTitle}>Как работает ИИ-анализ</h2>
                <div className={classes.steps}>
                    <div className={classes.step}>
                        <div className={classes.stepNumber}>1</div>
                        <p>Вы вводите данные о сотруднике</p>
                    </div>
                    <div className={classes.stepArrow}>→</div>
                    <div className={classes.step}>
                        <div className={classes.stepNumber}>2</div>
                        <p>ИИ анализирует сотни параметров</p>
                    </div>
                    <div className={classes.stepArrow}>→</div>
                    <div className={classes.step}>
                        <div className={classes.stepNumber}>3</div>
                        <p>Получаете персонализированные рекомендации</p>
                    </div>
                </div>
            </div>

            {/* Toast уведомление */}
            {showToast && (
                <div className={classes.toast}>
                    <div className={classes.toastContent}>
                        <div className={classes.toastIcon}>💳</div>
                        <div>
                            <strong>Недостаточно средств</strong>
                            <p>Попробуйте другой способ оплаты или обратитесь в поддержку</p>
                        </div>
                        <button
                            className={classes.toastClose}
                            onClick={() => setShowToast(false)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
};

export default PremiumPage;