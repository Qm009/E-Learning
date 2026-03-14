import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../features/auth/presentation/login_screen.dart';
import '../features/auth/presentation/register_screen.dart';
import '../features/dashboard/presentation/student_dashboard.dart';
import '../features/dashboard/presentation/teacher_dashboard.dart';
import '../features/quiz/presentation/quiz_screen.dart';
import '../features/course/presentation/course_catalog_screen.dart';
import '../features/qna/presentation/qna_screen.dart';
import '../features/qna/presentation/teacher_qna_screen.dart';

final supabase = Supabase.instance.client;

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) async {
    final session = supabase.auth.currentSession;
    final isLoggingIn = state.matchedLocation == '/login' || state.matchedLocation == '/register';

    if (session == null) {
      return isLoggingIn ? null : '/login';
    }

    // Si on est connecté et sur la page de login, on redirige vers le dashboard approprié
    if (isLoggingIn && session.user != null) {
      // Dans une vraie app, on mettrait en cache le rôle avec Riverpod
      final response = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
      
      final role = response['role'] as String?;
      if (role == 'teacher') return '/teacher';
      return '/student';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/student',
      builder: (context, state) => const StudentDashboard(),
    ),
    GoRoute(
      path: '/teacher',
      builder: (context, state) => const TeacherDashboard(),
    ),
    GoRoute(
      path: '/quizzes',
      builder: (context, state) => const QuizListScreen(),
    ),
    GoRoute(
      path: '/catalog',
      builder: (context, state) => const CourseCatalogScreen(),
    ),
    GoRoute(
      path: '/qna',
      builder: (context, state) => const QnAScreen(),
    ),
    GoRoute(
      path: '/teacher/qna',
      builder: (context, state) => const TeacherQnAScreen(),
    ),
  ],
);
