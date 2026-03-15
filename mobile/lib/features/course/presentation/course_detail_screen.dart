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
      
      final results = await Future.wait([
        supabase.from('course_materials').select('*').eq('course_id', courseId),
        supabase.from('quizzes').select('*').eq('course_id', courseId),
      ]);

      setState(() {
        _materials = results[0];
        _quizzes = results[1];
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
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.3),
                child: const BackButton(color: Colors.white),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                widget.course['title'] ?? 'Détails du Cours',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                  letterSpacing: -0.5,
                  shadows: [Shadow(blurRadius: 10, color: Colors.black45, offset: Offset(0, 2))],
                ),
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (widget.course['image_url'] != null)
                    Image.network(widget.course['image_url'], fit: BoxFit.cover)
                  else
                    Container(color: theme.colorScheme.primary),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.0),
                          Colors.black.withOpacity(0.6),
                          Colors.black.withOpacity(0.9),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'À PROPOS DE CE COURS',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.course['description'] ?? 'Apprenez les bases et maîtrisez ce sujet avec nos ressources expertes.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  _buildSectionHeader(theme, 'CONTENU DU COURS', Icons.auto_stories_rounded),
                  const SizedBox(height: 16),
                  _buildMaterialsList(theme, isDark),

                  const SizedBox(height: 40),
                  _buildSectionHeader(theme, 'ÉVALUATIONS AI', Icons.psychology_rounded),
                  const SizedBox(height: 16),
                  _buildQuizzesList(theme, isDark),
                  
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(ThemeData theme, String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: theme.colorScheme.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Text(
          title, 
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
          )
        ),
      ],
    );
  }

  Widget _buildMaterialsList(ThemeData theme, bool isDark) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_materials.isEmpty) {
      return _EmptyStateCard(theme: theme, text: 'Aucun document disponible');
    }

    return Column(
      children: _materials.map((m) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.description_rounded, color: Colors.blue, size: 24),
          ),
          title: Text(
            m['file_name'] ?? 'Document sans nom', 
            style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)
          ),
          subtitle: Text(
            (m['file_type'] ?? 'PDF').toUpperCase(), 
            style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5))
          ),
          trailing: IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.download_rounded, color: theme.colorScheme.primary, size: 20),
            ),
            onPressed: () => _downloadFile(m['file_url']),
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildQuizzesList(ThemeData theme, bool isDark) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_quizzes.isEmpty) {
      return _EmptyStateCard(theme: theme, text: 'Aucun quiz disponible');
    }

    return Column(
      children: _quizzes.map((q) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.psychology_rounded, color: Color(0xFF6366F1), size: 24),
          ),
          title: Text(
            q['title'] ?? 'Évaluation', 
            style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)
          ),
          subtitle: Text(
            'Testez vos connaissances',
            style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5))
          ),
          trailing: const Icon(Icons.chevron_right_rounded),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => QuizPlayerScreen(quiz: q)),
            );
          },
        ),
      )).toList(),
    );
  }
}

class _EmptyStateCard extends StatelessWidget {
  final ThemeData theme;
  final String text;

  const _EmptyStateCard({required this.theme, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.02),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.dividerColor, style: BorderStyle.none),
      ),
      child: Column(
        children: [
          Icon(Icons.info_outline_rounded, color: theme.colorScheme.onSurface.withOpacity(0.1), size: 32),
          const SizedBox(height: 12),
          Text(
            text, 
            style: theme.textTheme.labelLarge?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.3))
          ),
        ],
      ),
    );
  }
}
