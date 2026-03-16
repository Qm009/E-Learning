import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../lib/theme';
import { GradientButton } from '../../components/Shared';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        if (!fullName || !email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'student',
                }
            }
        });

        if (error) Alert.alert('Erreur d\'inscription', error.message);
        else {
            Alert.alert(
                'Succès',
                'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>← Retour</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Créer un compte ✍️</Text>
                        <Text style={styles.subtitle}>Rejoignez EduFlow et commencez votre aventure éducative dès aujourd'hui.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>NOM COMPLET</Text>
                            <View style={styles.inputContainer}>
                                <User size={18} color={COLORS.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholderTextColor={COLORS.border}
                                />
                            </View>
                        </View>

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
                            <Text style={styles.inputLabel}>MOT DE PASSE</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={18} color={COLORS.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Min. 8 caractères"
                                    value={password}
                                    secureTextEntry={true}
                                    onChangeText={setPassword}
                                    placeholderTextColor={COLORS.border}
                                />
                            </View>
                        </View>

                        <View style={styles.termsContainer}>
                            <CheckCircle2 size={16} color={COLORS.primary} />
                            <Text style={styles.termsText}>
                                J'accepte les <Text style={styles.termsLink}>Conditions d'Utilisation</Text> et la <Text style={styles.termsLink}>Politique de Confidentialité</Text>.
                            </Text>
                        </View>

                        <GradientButton
                            onPress={signUpWithEmail}
                            loading={loading}
                            style={styles.button}
                            icon={<ArrowRight size={20} color={COLORS.white} />}
                        >
                            S'inscrire gratuitement
                        </GradientButton>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => router.replace('/(auth)/login')}
                        >
                            <Text style={styles.linkText}>
                                Déjà un compte ? <Text style={styles.linkTextBold}>Se connecter</Text>
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
        paddingTop: 40,
        paddingBottom: 40,
    },
    backButton: {
        marginBottom: 32,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.muted,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.foreground,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.muted,
        lineHeight: 24,
        fontWeight: '500',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.muted,
        letterSpacing: 1,
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
    termsContainer: {
        flexDirection: 'row',
        gap: 10,
        paddingRight: 20,
        marginTop: 4,
    },
    termsText: {
        fontSize: 13,
        color: COLORS.muted,
        lineHeight: 18,
        fontWeight: '500',
    },
    termsLink: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    button: {
        marginTop: 12,
        height: 60,
        borderRadius: 18,
    },
    loginLink: {
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
