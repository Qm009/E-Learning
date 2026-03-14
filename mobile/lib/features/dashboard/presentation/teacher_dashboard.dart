import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../shared/widgets/profile_header.dart';

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
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('EduFlow Prof', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/courses/new'), 
        backgroundColor: const Color(0xFF0F172A),
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Nouveau Cours', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(20.0),
            children: [
              const Text(
                'Espace Enseignant 🎓',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 8),
              Text(
                'Gérez vos contenus et interagissez avec vos élèves.',
                style: TextStyle(color: Colors.grey[500], fontSize: 14),
              ),
              const SizedBox(height: 24),

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
              const SizedBox(height: 32),
              
              const Text('Vos cours récents', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),

              if (_courses.isEmpty)
                const Center(child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Text("Vous n'avez pas encore créé de cours.", style: TextStyle(color: Colors.grey)),
                ))
              else
                ..._courses.map((c) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade100),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    leading: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(color: const Color(0xFF6366F1).withOpacity(0.05), borderRadius: BorderRadius.circular(14)),
                      child: const Icon(Icons.book_rounded, color: Color(0xFF6366F1)),
                    ),
                    title: Text(c['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    subtitle: Text(
                      c['status'] == 'published' ? 'En ligne' : 'Brouillon',
                      style: TextStyle(
                        color: c['status'] == 'published' ? Colors.green : Colors.orange,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                  ),
                )),
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
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 12),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
