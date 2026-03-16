import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { User, LogOut, Settings, Bell, Shield, ChevronRight, Mail, CreditCard } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../lib/theme';
import { AppCard } from '../../components/Shared';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        }
        getProfile();
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert(error.message);
        else router.replace('/(auth)/login');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const menuItems = [
        { icon: <User size={20} color={COLORS.muted} />, label: 'Informations personnelles' },
        { icon: <Bell size={20} color={COLORS.muted} />, label: 'Notifications' },
        { icon: <CreditCard size={20} color={COLORS.muted} />, label: 'Paiements & Abonnements' },
        { icon: <Shield size={20} color={COLORS.muted} />, label: 'Sécurité' },
        { icon: <Settings size={20} color={COLORS.muted} />, label: 'Paramètres' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.user_metadata?.full_name?.charAt(0) || 'U'}</Text>
                    </View>
                    <View style={styles.editBadge}>
                        <Settings size={14} color={COLORS.white} />
                    </View>
                </View>
                <Text style={styles.name}>{user?.user_metadata?.full_name || 'Utilisateur'}</Text>
                <View style={styles.emailContainer}>
                    <Mail size={14} color={COLORS.muted} />
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Modifier le profil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.menu}>
                <Text style={styles.menuTitle}>COMPTE</Text>
                {menuItems.map((item, index) => (
                    <TouchableOpacity key={index} activeOpacity={0.7} style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={styles.menuIcon}>{item.icon}</View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <ChevronRight size={18} color={COLORS.border} />
                    </TouchableOpacity>
                ))}

                <Text style={[styles.menuTitle, { marginTop: 24 }]}>ACTIONS</Text>
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutItem]}
                    onPress={handleSignOut}
                    activeOpacity={0.7}
                >
                    <View style={styles.menuItemLeft}>
                        <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <LogOut size={20} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Se déconnecter</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.versionText}>EduFlow v1.0.0</Text>
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
        backgroundColor: COLORS.white,
        alignItems: 'center',
        paddingVertical: 50,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...SHADOWS.small,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 6,
        borderColor: 'rgba(99, 102, 241, 0.1)',
    },
    avatarText: {
        fontSize: 44,
        fontWeight: '900',
        color: COLORS.white,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: COLORS.foreground,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    name: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.foreground,
        marginBottom: 6,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    email: {
        fontSize: 15,
        color: COLORS.muted,
        fontWeight: '500',
    },
    editButton: {
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: COLORS.mutedLight,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.foreground,
    },
    menu: {
        padding: 24,
    },
    menuTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1.5,
        marginBottom: 16,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.card,
        padding: 18,
        borderRadius: 24,
        marginBottom: 12,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.mutedLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.foreground,
    },
    logoutItem: {
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: COLORS.border,
        fontWeight: '600',
    }
});
