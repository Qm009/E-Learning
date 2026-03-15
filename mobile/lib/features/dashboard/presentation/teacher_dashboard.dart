import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../shared/widgets/profile_header.dart';

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({Key? key}) : super(key: key);

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
  final supabase = Supabase.instance.client;
  List<dynamic> _courses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMyCourses();
  }

  Future<void> _fetchMyCourses() async {
    final user = supabase.auth.currentUser;
    if (user != null) {
      try {
        final data = await supabase
            .from('courses')
            .select('id, title, status')
            .eq('teacher_id', user.id);
        
        setState(() {
          _courses = data;
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
          'EduFlow Prof',
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await context.push('/courses/new');
          if (result == true) {
            setState(() => _isLoading = true);
            _fetchMyCourses();
          }
        }, 
        backgroundColor: theme.colorScheme.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Nouveau Cours', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            children: [
              Text(
                'Espace Enseignant 🎓',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Gérez vos contenus et interagissez avec vos élèves.',
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
                      title: 'Gestion Quiz', 
                      icon: Icons.assignment_rounded, 
                      color: const Color(0xFF6366F1),
                      onTap: () => context.push('/teacher/quizzes'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _NavCard(
                      title: 'Réponses Q&A', 
                      icon: Icons.question_answer_rounded, 
                      color: const Color(0xFFF59E0B),
                      onTap: () => context.push('/teacher/qna'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              
              Text(
                'Vos cours récents',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              if (_courses.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
                  decoration: BoxDecoration(
                    color: theme.cardTheme.color,
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.book_outlined, size: 48, color: theme.colorScheme.primary),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Aucun cours créé',
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Commencez par créer votre premier cours dès maintenant.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.5)),
                      ),
                    ],
                  ),
                )
              else
                ..._courses.map((c) => Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: theme.cardTheme.color,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    leading: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.1), 
                        borderRadius: BorderRadius.circular(16)
                      ),
                      child: Icon(Icons.auto_stories_rounded, color: theme.colorScheme.primary),
                    ),
                    title: Text(
                      c['title'], 
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: c['status'] == 'published' ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            c['status'] == 'published' ? 'En ligne' : 'Brouillon',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurface.withOpacity(0.6),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                  ),
                )),
              const SizedBox(height: 80), // Space for FAB
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
