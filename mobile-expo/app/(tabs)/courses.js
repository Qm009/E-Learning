import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { BookOpen, Search, ArrowRight, Filter } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../lib/theme';
import { AppCard } from '../../components/Shared';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            const { data } = await supabase
                .from('courses')
                .select('*, teacher:profiles!teacher_id(full_name)')
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            setCourses(data || []);
            setFilteredCourses(data || []);
            setLoading(false);
        }
        fetchCourses();
    }, []);

    useEffect(() => {
        const filtered = courses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (course.teacher?.full_name && course.teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredCourses(filtered);
    }, [searchQuery, courses]);

    const renderCourse = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cardContainer}
            onPress={() => router.push({ pathname: '/course-view', params: { id: item.id } })}
        >
            <AppCard style={styles.courseCard}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
                        style={styles.courseImage}
                    />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>NOUVEAU</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.teacherContainer}>
                        <View style={styles.dot} />
                        <Text style={styles.teacherText}>Par {item.teacher?.full_name || 'Professeur'}</Text>
                    </View>

                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description || "Aucune description fournie pour ce cours."}
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Voir le programme</Text>
                        <View style={styles.arrowIcon}>
                            <ArrowRight size={18} color={COLORS.muted} />
                        </View>
                    </View>
                </View>
            </AppCard>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerCard}>
                <View>
                    <Text style={styles.headerTitle}>Catalogue de Cours 📚</Text>
                    <Text style={styles.headerSubtitle}>Découvrez de nouveaux cours.</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color={COLORS.muted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher par titre ou prof..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.muted}
                    />
                </View>
            </View>

            <FlatList
                data={filteredCourses}
                renderItem={renderCourse}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <BookOpen size={48} color={COLORS.border} />
                        <Text style={styles.emptyTitle}>Aucun résultat</Text>
                        <Text style={styles.emptySubtitle}>Nous n'avons pas trouvé de cours correspondant.</Text>
                    </View>
                }
            />
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
    headerCard: {
        backgroundColor: COLORS.card,
        padding: 24,
        paddingTop: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        ...SHADOWS.small,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.foreground,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.muted,
        marginTop: 4,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.mutedLight,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.foreground,
        fontWeight: '500',
    },
    list: {
        padding: 20,
        paddingTop: 30,
    },
    cardContainer: {
        marginBottom: 24,
    },
    courseCard: {
        padding: 0,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 180,
        width: '100%',
        backgroundColor: COLORS.black,
    },
    courseImage: {
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    badge: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    cardBody: {
        padding: 20,
    },
    teacherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginRight: 8,
    },
    teacherText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.foreground,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: COLORS.muted,
        lineHeight: 20,
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    arrowIcon: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: COLORS.mutedLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.foreground,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
        marginTop: 8,
    }
});
