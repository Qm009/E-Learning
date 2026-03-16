import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { COLORS } from '../lib/theme';

export default function RootLayout() {
    const [initializing, setInitializing] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitializing(false);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    if (initializing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen name="course-view" options={{ headerShown: false }} />
                <Stack.Screen name="quiz" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            </Stack>
        </>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
});
