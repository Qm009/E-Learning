import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { COLORS, SHADOWS } from '../lib/theme';
import { GradientButton, AppCard } from '../components/Shared';
import { Trophy, ChevronRight, ChevronLeft, X, Loader2 } from 'lucide-react-native';

export default function QuizScreen() {
    const { id } = useLocalSearchParams();
    const [quiz, setQuiz] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) fetchQuiz();
    }, [id]);

    async function fetchQuiz() {
        setLoading(true);
        const { data, error } = await supabase
            .from('quizzes')
            .select('*, courses(title)')
            .eq('id', id)
            .single();

        if (error) {
            Alert.alert('Erreur', 'Impossible de charger le quiz.');
            router.back();
        } else {
            setQuiz(data);
        }
        setLoading(false);
    }

    const handleOptionSelect = (option) => {
        setAnswers({ ...answers, [currentStep]: option });
    };

    const finishQuiz = async () => {
        setSubmitting(true);
        try {
            // Calculate score locally for immediate feedback if API is not available
            // but in a real app we'd call the API like in the web version.
            // Since I don't have the API URL here (it's internal to the Next.js app),
            // I'll simulate the submission and provide the score if I can calculate it.

            let correctCount = 0;
            quiz.questions.forEach((q, index) => {
                if (answers[index] === q.correct_option) {
                    correctCount++;
                }
            });

            const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
            const passed = scorePercentage >= 60;

            // Save score to Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('scores').insert({
                    quiz_id: id,
                    student_id: user.id,
                    score_percentage: scorePercentage,
                    passed: passed
                });
            }

            setResult({ score: scorePercentage, passed });
            setIsFinished(true);
        } catch (err) {
            Alert.alert('Erreur', 'Impossible de soumettre vos réponses.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (isFinished && result) {
        return (
            <View style={styles.container}>
                <View style={styles.resultContent}>
                    <View style={[styles.trophyContainer, { backgroundColor: result.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                        <Trophy size={64} color={result.passed ? COLORS.success : '#EF4444'} />
                    </View>
                    <Text style={styles.resultTitle}>{result.passed ? 'Félicitations ! 🎊' : 'Presque ! 💪'}</Text>
                    <Text style={styles.resultSubtitle}>
                        {result.passed ? 'Vous avez brillamment réussi ce quiz.' : 'Réessayez pour améliorer votre score.'}
                    </Text>
                    <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{result.score}%</Text>
                    </View>
                    <GradientButton
                        onPress={() => router.back()}
                        style={styles.finishBtn}
                    >
                        Retour aux cours
                    </GradientButton>
                </View>
            </View>
        );
    }

    const currentQuestion = quiz.questions[currentStep];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <X size={24} color={COLORS.foreground} />
                </TouchableOpacity>
                <View style={styles.progressHeader}>
                    <Text style={styles.quizTitle} numberOfLines={1}>{quiz.title}</Text>
                    <View style={styles.stepInfo}>
                        <Text style={styles.currentStepText}>{currentStep + 1}</Text>
                        <Text style={styles.totalStepsText}> / {quiz.questions.length}</Text>
                    </View>
                </View>
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${((currentStep + 1) / quiz.questions.length) * 100}%` }
                        ]}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.quizBody} showsVerticalScrollIndicator={false}>
                <AppCard style={styles.questionCard}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                </AppCard>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.optionBtn,
                                answers[currentStep] === option && styles.selectedOptionBtn
                            ]}
                            onPress={() => handleOptionSelect(option)}
                        >
                            <View style={[
                                styles.optionCircle,
                                answers[currentStep] === option && styles.selectedOptionCircle
                            ]}>
                                <Text style={[
                                    styles.optionLetter,
                                    answers[currentStep] === option && styles.selectedOptionLetter
                                ]}>
                                    {String.fromCharCode(65 + i)}
                                </Text>
                            </View>
                            <Text style={[
                                styles.optionText,
                                answers[currentStep] === option && styles.selectedOptionText
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.navBtn, currentStep === 0 && { opacity: 0 }]}
                    onPress={() => setCurrentStep(currentStep - 1)}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft size={20} color={COLORS.muted} />
                    <Text style={styles.navBtnText}>Précédent</Text>
                </TouchableOpacity>

                {currentStep === quiz.questions.length - 1 ? (
                    <GradientButton
                        loading={submitting}
                        onPress={finishQuiz}
                        disabled={!answers[currentStep]}
                    >
                        Terminer
                    </GradientButton>
                ) : (
                    <TouchableOpacity
                        style={[styles.nextBtn, !answers[currentStep] && { opacity: 0.5 }]}
                        onPress={() => setCurrentStep(currentStep + 1)}
                        disabled={!answers[currentStep]}
                    >
                        <Text style={styles.nextBtnText}>Suivant</Text>
                        <ChevronRight size={20} color={COLORS.white} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        ...SHADOWS.small,
    },
    closeBtn: {
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    quizTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.foreground,
        flex: 1,
        marginRight: 10,
    },
    stepInfo: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currentStepText: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.primary,
    },
    totalStepsText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.muted,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: COLORS.mutedLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    quizBody: {
        padding: 24,
    },
    questionCard: {
        marginBottom: 32,
        padding: 28,
        borderLeftWidth: 6,
        borderLeftColor: COLORS.primary,
    },
    questionText: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.foreground,
        lineHeight: 30,
    },
    optionsContainer: {
        gap: 16,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    selectedOptionBtn: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    optionCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.mutedLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    selectedOptionCircle: {
        backgroundColor: COLORS.primary,
    },
    optionLetter: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.muted,
    },
    selectedOptionLetter: {
        color: COLORS.white,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.foreground,
        flex: 1,
    },
    selectedOptionText: {
        color: COLORS.primary,
    },
    footer: {
        backgroundColor: COLORS.white,
        padding: 24,
        paddingBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...SHADOWS.card,
    },
    navBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    navBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.muted,
    },
    nextBtn: {
        backgroundColor: COLORS.foreground,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nextBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    resultContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    trophyContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.foreground,
        marginBottom: 12,
        textAlign: 'center',
    },
    resultSubtitle: {
        fontSize: 16,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    scoreBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 24,
        marginBottom: 48,
        ...SHADOWS.small,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '900',
        color: COLORS.white,
    },
    finishBtn: {
        width: '100%',
        height: 60,
    }
});
