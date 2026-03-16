import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { COLORS, SHADOWS } from '../lib/theme';
import { GradientButton, AppCard } from '../components/Shared';
import { BookOpen, Clock, User, ArrowLeft, Star, PlayCircle } from 'lucide-react-native';

export default function CourseView() {
    const { id } = useLocalSearchParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        if (id) fetchCourseDetails();
    }, [id]);

    async function fetchCourseDetails() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        const { data } = await supabase
            .from('courses')
            .select('*, teacher:profiles!teacher_id(full_name)')
            .eq('id', id)
            .single();

        setCourse(data);

        if (user) {
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('course_id', id)
                .eq('student_id', user.id)
                .single();

            setIsEnrolled(!!enrollment);
        }
        setLoading(false);
    }

    async function handleEnroll() {
        setEnrolling(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/(auth)/login');
            return;
        }

        const { error } = await supabase
            .from('enrollments')
            .insert({
                course_id: id,
                student_id: user.id,
                status: 'in_progress',
                progress: 0
            });

        if (error) {
            alert(error.message);
        } else {
            setIsEnrolled(true);
        }
        setEnrolling(false);
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!course) return null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
                    style={styles.courseImage}
                />
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>PROGRAMME PREMIUM</Text>
                    </View>
                    <View style={styles.ratingBox}>
                        <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
                        <Text style={styles.ratingText}>4.9/5</Text>
                    </View>
                </View>

                <Text style={styles.title}>{course.title}</Text>

                <View style={styles.teacherRow}>
                    <View style={styles.teacherAvatar}>
                        <User size={18} color={COLORS.primary} />
                    </View>
                    <View>
                        <Text style={styles.teacherLabel}>ENSEIGNÉ PAR</Text>
                        <Text style={styles.teacherName}>{course.teacher?.full_name || 'Professeur'}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Clock size={18} color={COLORS.muted} />
                        <Text style={styles.statValue}>12h 45m</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statItem}>
                        <BookOpen size={18} color={COLORS.muted} />
                        <Text style={styles.statValue}>24 Leçons</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statItem}>
                        <PlayCircle size={18} color={COLORS.muted} />
                        <Text style={styles.statValue}>Vidéo HD</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>À propos de ce cours</Text>
                    <Text style={styles.description}>
                        {course.description || "Aucune description détaillée n'est disponible pour le moment. Ce cours vous permettra d'acquérir des compétences essentielles dans ce domaine."}
                    </Text>
                </View>

                <AppCard style={styles.ctaCard}>
                    <Text style={styles.priceLabel}>Accès complet</Text>
                    <Text style={styles.priceValue}>Gratuit</Text>
                    <GradientButton
                        onPress={isEnrolled ? () => { } : handleEnroll}
                        loading={enrolling}
                        variant={isEnrolled ? 'primary' : 'primary'}
                    >
                        {isEnrolled ? 'Continuer le cours' : 'S\'inscrire gratuitement'}
                    </GradientButton>
                </AppCard>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        backgroundColor: COLORS.black,
    },
    courseImage: {
        width: '100%',
        height: '100%',
        opacity: 0.85,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
        padding: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    categoryBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.foreground,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.foreground,
        lineHeight: 36,
        marginBottom: 24,
    },
    teacherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    teacherAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: COLORS.mutedLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    teacherLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.foreground,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.mutedLight,
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 32,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    statItem: {
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.foreground,
    },
    separator: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.border,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.foreground,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: COLORS.muted,
        lineHeight: 26,
        fontWeight: '500',
    },
    ctaCard: {
        backgroundColor: COLORS.foreground,
        padding: 24,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: 40,
    },
    priceLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
    },
    priceValue: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 20,
    }
});
