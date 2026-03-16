import { Tabs } from 'expo-router';
import { Home, BookOpen, User, PlayCircle } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#94A3B8',
            tabBarStyle: {
                borderTopWidth: 1,
                borderTopColor: '#E2E8F0',
                height: 64,
                paddingBottom: 8,
                paddingTop: 8,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
            },
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
                fontWeight: '800',
                fontSize: 20,
                color: '#1E293B',
            },
            headerShadowVisible: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="courses"
                options={{
                    title: 'Cours',
                    tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
