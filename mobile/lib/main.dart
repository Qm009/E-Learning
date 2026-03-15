import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase — using environment variables for security
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://sbjttffctciepdqotnnc.supabase.co'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianR0ZmZjdGNpZXBkcW90bm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjgyMTQsImV4cCI6MjA4ODY0NDIxNH0.vTv2O6pZ7SQX7PIrzAGmV91CYPM-pGjAali3TMtHUec'),
  );

  runApp(
    const ProviderScope(
      child: EduFlowApp(),
    ),
  );
}

class EduFlowApp extends StatelessWidget {
  const EduFlowApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'EduFlow',
      theme: _buildTheme(Brightness.light),
      darkTheme: _buildTheme(Brightness.dark),
      themeMode: ThemeMode.system,
      // ✅ Use the GoRouter defined in router.dart
      routerConfig: appRouter,
    );
  }

  ThemeData _buildTheme(Brightness brightness) {
    final isLight = brightness == Brightness.light;
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A),
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF6366F1), // Primary
        primary: const Color(0xFF6366F1),
        secondary: const Color(0xFFF59E0B), // Accent
        error: const Color(0xFFEF4444),
        brightness: brightness,
        background: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A),
        surface: isLight ? Colors.white : const Color(0xFF161E35), // Dark mode cards
      ),
      textTheme: GoogleFonts.interTextTheme(
        isLight ? ThemeData.light().textTheme : ThemeData.dark().textTheme,
      ),
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: isLight ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A),
        foregroundColor: isLight ? const Color(0xFF0F172A) : Colors.white,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: isLight ? Colors.white : const Color(0xFF161E35),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(
            color: isLight ? const Color(0xFFE2E8F0) : const Color(0xFF334155),
            width: 1,
          ),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6366F1),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), // Rounder like Web
          elevation: 0,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : const Color(0xFF334155)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: isLight ? const Color(0xFFE2E8F0) : const Color(0xFF334155)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF6366F1), width: 2),
        ),
        filled: true,
        fillColor: isLight ? Colors.white : const Color(0xFF1E293B),
      ),
    );
  }
}
