import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SHADOWS } from '../lib/theme';

export const GradientButton = ({ onPress, children, style, textStyle, loading, icon, variant = 'primary' }) => {
    const colors = variant === 'accent' ? GRADIENTS.accent : GRADIENTS.primary;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.buttonContainer, style]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <View style={styles.content}>
                        {icon && <View style={styles.icon}>{icon}</View>}
                        <Text style={[styles.text, textStyle]}>{children}</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

export const AppCard = ({ children, style, hoverable = true }) => {
    return (
        <View style={[styles.card, SHADOWS.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    gradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    icon: {
        marginRight: 4,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    }
});
