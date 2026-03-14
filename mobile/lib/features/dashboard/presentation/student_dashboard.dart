import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../shared/widgets/course_card.dart';
import '../../shared/widgets/profile_header.dart'; // Import the new header
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
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('EduFlow', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          const ProfileHeader(),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.grey),
            onPressed: _signOut,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(20.0),
            children: [
              const Text(
                'Bienvenue sur votre espace 🚀',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 8),
              Text(
                'Reprenez là où vous vous étiez arrêté.',
                style: TextStyle(color: Colors.grey[500], fontSize: 14),
              ),
              const SizedBox(height: 24),

              // Navigation Cards
              Row(
                children: [
                  Expanded(
                    child: _NavCard(
                      title: 'Mes Quiz (IA)', 
                      icon: Icons.psychology_rounded, 
                      color: const Color(0xFF6366F1),
                      onTap: () => context.push('/quizzes'), // Placeholder route
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _NavCard(
                      title: 'Questions Q&A', 
                      icon: Icons.forum_rounded, 
                      color: const Color(0xFF10B981),
                      onTap: () => context.push('/qna'), // Placeholder route
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              const Text('Vos cours récents', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),

              if (_enrollments.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 60),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.grey.shade200, style: BorderStyle.solid),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.auto_stories_rounded, size: 64, color: Colors.grey[200]),
                      const SizedBox(height: 16),
                      Text('Aucun cours trouvé', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey[400])),
                      const SizedBox(height: 8),
                      TextButton(
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
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: CourseCard(
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
                    ),
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
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: color.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10)),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 12),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
