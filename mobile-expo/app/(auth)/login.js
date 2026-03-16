import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../lib/theme';
import { GradientButton } from '../../components/Shared';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Erreur de connexion', error.message);
        else router.replace('/(tabs)');
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoGradient}>
                                <Sparkles size={24} color={COLORS.white} />
                            </View>
                            <Text style={styles.logoText}>EduFlow</Text>
                        </View>
                        <Text style={styles.title}>Heureux de vous revoir ! 👋</Text>
                        <Text style={styles.subtitle}>Connectez-vous pour continuer votre parcours d'apprentissage premium.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>ADRESSE EMAIL</Text>
                            <View style={styles.inputContainer}>
                                <Mail size={18} color={COLORS.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="nom@exemple.com"
                                    value={email}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    onChangeText={setEmail}
                                    placeholderTextColor={COLORS.border}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.inputLabel}>MOT DE PASSE</Text>
                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>Oublié ?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputContainer}>
                                <Lock size={18} color={COLORS.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••••••"
                                    value={password}
                                    secureTextEntry={true}
                                    onChangeText={setPassword}
                                    placeholderTextColor={COLORS.border}
                                />
                            </View>
                        </View>

                        <GradientButton
                            onPress={signInWithEmail}
                            loading={loading}
                            style={styles.button}
                            icon={<ArrowRight size={20} color={COLORS.white} />}
                        >
                            Se connecter
                        </GradientButton>

                        <TouchableOpacity
                            style={styles.registerLink}
                            onPress={() => router.push('/(auth)/register')}
                        >
                            <Text style={styles.linkText}>
                                Nouveau ici ? <Text style={styles.linkTextBold}>Créer un compte</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    logoGradient: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.foreground,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    logoText: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.foreground,
        letterSpacing: -0.5,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.foreground,
        marginBottom: 12,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.muted,
        lineHeight: 24,
        fontWeight: '500',
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
    },
    forgotText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.mutedLight,
        borderRadius: 18,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        height: 60,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.foreground,
        fontWeight: '600',
    },
    button: {
        marginTop: 8,
        height: 60,
        borderRadius: 18,
    },
    registerLink: {
        marginTop: 10,
        alignItems: 'center',
    },
    linkText: {
        color: COLORS.muted,
        fontSize: 15,
        fontWeight: '500',
    },
    linkTextBold: {
        color: COLORS.primary,
        fontWeight: '800',
    },
});
