import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { BookOpen, Trophy, Clock, CheckCircle, ChevronRight, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, SHADOWS } from '../../lib/theme';
import { AppCard, GradientButton } from '../../components/Shared';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch enrollments
                const { data: enrollData } = await supabase
                    .from('enrollments')
                    .select('*, courses(title, image_url)')
                    .eq('student_id', user.id);

                setEnrollments(enrollData || []);

                // Fetch scores/stats
                const { data: scores } = await supabase
                    .from('scores')
                    .select('score_percentage')
                    .eq('student_id', user.id);

                const avgScore = scores && scores.length > 0
                    ? Math.round(scores.reduce((acc, s) => acc + s.score_percentage, 0) / scores.length)
                    : 0;

                setStats([
                    { title: "Cours en cours", value: (enrollData || []).filter(e => e.status === 'in_progress').length, icon: Clock, color: COLORS.accent, bg: 'rgba(245, 158, 11, 0.1)' },
                    { title: "Cours terminés", value: (enrollData || []).filter(e => e.status === 'completed').length, icon: CheckCircle, color: COLORS.success, bg: 'rgba(16, 185, 129, 0.1)' },
                    { title: "Score moyen", value: `${avgScore}%`, icon: Trophy, color: COLORS.primary, bg: 'rgba(99, 102, 241, 0.1)' },
                ]);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Bienvenue sur votre espace 🚀</Text>
                <Text style={styles.subtitle}>Reprenez là où vous vous étiez arrêté.</Text>
            </View>

            <View style={styles.statsScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
                    {stats.map((stat, i) => (
                        <View key={i} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>{stat.title}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Vos cours récents</Text>
                    <TouchableOpacity onPress={() => router.push('/courses')}>
                        <Text style={styles.seeAll}>Voir le catalogue</Text>
                    </TouchableOpacity>
                </View>

                {enrollments.length > 0 ? (
                    enrollments.slice(0, 3).map((item) => (
                        <AppCard key={item.id} style={styles.courseCard}>
                            <View style={styles.courseContent}>
                                <Image
                                    source={{ uri: item.courses?.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
                                    style={styles.courseImage}
                                />
                                <View style={styles.courseInfo}>
                                    <View style={styles.statusBadge}>
                                        <Text style={[styles.statusText, { color: item.status === 'completed' ? COLORS.success : COLORS.primary }]}>
                                            {item.status === 'completed' ? 'TERMINÉ' : 'EN COURS'}
                                        </Text>
                                    </View>
                                    <Text style={styles.courseTitle} numberOfLines={2}>{item.courses?.title}</Text>

                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressHeader}>
                                            <Text style={styles.progressLabel}>Progression</Text>
                                            <Text style={styles.progressValue}>{item.progress}%</Text>
                                        </View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.status === 'completed' ? COLORS.success : COLORS.primary }]} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={() => router.push({ pathname: '/course-view', params: { id: item.course_id } })}
                            >
                                <Text style={styles.continueButtonText}>Continuer</Text>
                                <ChevronRight size={16} color={COLORS.white} />
                            </TouchableOpacity>
                        </AppCard>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <BookOpen size={48} color={COLORS.border} />
                        <Text style={styles.emptyTitle}>Aucun cours en cours</Text>
                        <Text style={styles.emptySubtitle}>Explorez le catalogue pour trouver votre prochaine leçon passionnante.</Text>
                        <GradientButton
                            style={{ marginTop: 20 }}
                            onPress={() => router.push('/courses')}
                        >
                            Explorer le catalogue
                        </GradientButton>
                    </View>
                )}
            </View>
        </ScrollView>
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
        padding: 24,
        paddingTop: 30,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.foreground,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.muted,
        marginTop: 4,
    },
    statsScrollContainer: {
        marginVertical: 10,
    },
    statsContainer: {
        paddingHorizontal: 24,
        gap: 16,
    },
    statCard: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: 180,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.foreground,
    },
    section: {
        padding: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.foreground,
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    },
    courseCard: {
        padding: 12,
        marginBottom: 20,
    },
    courseContent: {
        flexDirection: 'row',
        gap: 16,
    },
    courseImage: {
        width: 100,
        height: 120,
        borderRadius: 16,
        backgroundColor: COLORS.mutedLight,
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    statusBadge: {
        marginBottom: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.foreground,
        lineHeight: 22,
        marginBottom: 12,
    },
    progressContainer: {
        marginTop: 'auto',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '600',
    },
    progressValue: {
        fontSize: 12,
        color: COLORS.foreground,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: COLORS.mutedLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    continueButton: {
        backgroundColor: COLORS.foreground,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginTop: 16,
        gap: 8,
    },
    continueButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: COLORS.white,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.foreground,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginTop: 8,
        lineHeight: 20,
    }
});
