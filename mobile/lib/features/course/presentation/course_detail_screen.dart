import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../quiz/presentation/quiz_screen.dart';

class CourseDetailScreen extends StatefulWidget {
  final dynamic course;
  const CourseDetailScreen({Key? key, required this.course}) : super(key: key);

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  final supabase = Supabase.instance.client;
  List<dynamic> _materials = [];
  List<dynamic> _quizzes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCourseData();
  }

  Future<void> _fetchCourseData() async {
    try {
      final courseId = widget.course['id'];
      
      // Fetch materials
      final mats = await supabase
          .from('course_materials')
          .select('*')
          .eq('course_id', courseId);

      // Fetch quizzes
      final quizzes = await supabase
          .from('quizzes')
          .select('*')
          .eq('course_id', courseId);

      setState(() {
        _materials = mats;
        _quizzes = quizzes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _downloadFile(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(widget.course['title'] ?? 'Cours', 
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (widget.course['image_url'] != null)
                    Image.network(widget.course['image_url'], fit: BoxFit.cover)
                  else
                    Container(color: Colors.indigo),
                  Container(decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                    ),
                  )),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   const Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                   const SizedBox(height: 12),
                   Text(widget.course['description'] ?? 'Aucune description disponible.',
                      style: TextStyle(color: Colors.grey[600], height: 1.5)),
                   
                   const SizedBox(height: 32),
                   _buildSectionHeader('Supports de cours', Icons.book_rounded, _materials.length),
                   const SizedBox(height: 12),
                   _buildMaterialsList(),

                   const SizedBox(height: 32),
                   _buildSectionHeader('Quiz & Évaluations', Icons.psychology_rounded, _quizzes.length),
                   const SizedBox(height: 12),
                   _buildQuizzesList(),
                   
                   const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, int count) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF6366F1), size: 24),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text('$count', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildMaterialsList() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_materials.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(child: Text('Aucun document disponible', style: TextStyle(color: Colors.grey))),
      );
    }

    return Column(
      children: _materials.map((m) => ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: const Icon(Icons.file_present_rounded, color: Colors.indigo),
        title: Text(m['file_name'] ?? 'Document', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text((m['file_type'] ?? 'PDF').toUpperCase(), style: const TextStyle(fontSize: 11)),
        trailing: IconButton(
          icon: const Icon(Icons.download_rounded),
          onPressed: () => _downloadFile(m['file_url']),
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        tileColor: Colors.white,
      )).toList(),
    );
  }

  Widget _buildQuizzesList() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_quizzes.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(child: Text('Aucun quiz disponible', style: TextStyle(color: Colors.grey))),
      );
    }

    return Column(
      children: _quizzes.map((q) => ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: const Icon(Icons.quiz_rounded, color: Colors.orange),
        title: Text(q['title'] ?? 'Quiz', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => QuizPlayerScreen(quiz: q)),
          );
        },
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        tileColor: Colors.white,
      )).toList(),
    );
  }
}
