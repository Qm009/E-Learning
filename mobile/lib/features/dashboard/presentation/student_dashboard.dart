import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../shared/widgets/course_card.dart';
import '../../../shared/widgets/profile_header.dart';
import '../../course/presentation/course_detail_screen.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({Key? key}) : super(key: key);

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  final supabase = Supabase.instance.client;
  List<dynamic> _enrollments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchEnrollments();
  }

  Future<void> _fetchEnrollments() async {
    final user = supabase.auth.currentUser;
    if (user != null) {
      try {
        final data = await supabase
            .from('enrollments')
            .select('id, progress, status, courses(id, title, image_url)')
            .eq('student_id', user.id);
        
        setState(() {
          _enrollments = data;
          _isLoading = false;
        });
      } catch (e) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signOut() async {
    await supabase.auth.signOut();
    if (mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'EduFlow',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          const ProfileHeader(),
          IconButton(
            icon: Icon(Icons.logout_rounded, color: theme.colorScheme.onSurface.withOpacity(0.5)),
            onPressed: _signOut,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            children: [
              Text(
                'Bienvenue sur votre espace 🚀',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Reprenez là où vous vous étiez arrêté.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
              const SizedBox(height: 32),

              // Navigation Cards
              Row(
                children: [
                  Expanded(
                    child: _NavCard(
                      title: 'Mes Quiz (IA)', 
                      icon: Icons.psychology_rounded, 
                      color: const Color(0xFF6366F1),
                      onTap: () => context.push('/quizzes'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _NavCard(
                      title: 'Questions Q&A', 
                      icon: Icons.forum_rounded, 
                      color: const Color(0xFF10B981),
                      onTap: () => context.push('/qna'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Vos cours récents',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.push('/catalog'),
                    child: const Text('Voir tout'),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              if (_enrollments.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
                  decoration: BoxDecoration(
                    color: theme.cardTheme.color,
                    borderRadius: BorderRadius.circular(32),
                    border: theme.cardTheme.shape is RoundedRectangleBorder 
                        ? Border.fromBorderSide((theme.cardTheme.shape as RoundedRectangleBorder).side) 
                        : Border.all(color: theme.dividerColor),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.auto_stories_rounded, size: 48, color: theme.colorScheme.primary),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Aucun cours trouvé',
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Il est temps de commencer votre apprentissage !',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                      const SizedBox(height: 32),
                      ElevatedButton(
                        onPressed: () async {
                          final result = await context.push('/catalog');
                          if (result == true) _fetchEnrollments();
                        }, 
                        child: const Text('Explorer le catalogue'),
                      )
                    ],
                  ),
                )
              else
                ..._enrollments.map((e) {
                  final course = e['courses'];
                  return CourseCard(
                    title: course['title'],
                    imageUrl: course['image_url'],
                    progress: e['progress'],
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CourseDetailScreen(course: course),
                        ),
                      );
                    },
                  );
                }),
            ],
          ),
    );
  }
}

class _NavCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _NavCard({required this.title, required this.icon, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.08),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
