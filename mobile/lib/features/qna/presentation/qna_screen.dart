import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

class QnAScreen extends StatefulWidget {
  const QnAScreen({Key? key}) : super(key: key);

  @override
  State<QnAScreen> createState() => _QnAScreenState();
}

class _QnAScreenState extends State<QnAScreen> {
  final supabase = Supabase.instance.client;
  List<dynamic> _questions = [];
  List<dynamic> _courses = [];
  String? _selectedCourseId;
  final _questionController = TextEditingController();
  bool _isLoading = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final user = supabase.auth.currentUser;
    if (user == null) return;

    try {
      final coursesData = await supabase
          .from('courses')
          .select('id, title')
          .eq('status', 'published');

      final questionsData = await supabase
          .from('course_questions')
          .select('*, courses(title)')
          .eq('student_id', user.id)
          .order('created_at', ascending: false);

      setState(() {
        _courses = coursesData;
        _questions = questionsData;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching QnA: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitQuestion() async {
    if (_selectedCourseId == null || _questionController.text.isEmpty) return;
    
    final user = supabase.auth.currentUser;
    if (user == null) return;

    setState(() => _isSubmitting = true);

    try {
      await supabase.from('course_questions').insert({
        'course_id': _selectedCourseId,
        'student_id': user.id,
        'question': _questionController.text,
      });

      _questionController.clear();
      setState(() => _selectedCourseId = null);
      await _fetchData();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Question posée avec succès !'), 
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Questions au Prof',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: -0.5,
          ),
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : Column(
            children: [
              _buildComposeSection(theme, isDark),
              const Divider(height: 1),
              Expanded(child: _buildQuestionsList(theme, isDark)),
            ],
          ),
    );
  }

  Widget _buildComposeSection(ThemeData theme, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: theme.dividerColor),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                hint: const Text('Choisir un cours'),
                value: _selectedCourseId,
                isExpanded: true,
                dropdownColor: theme.cardTheme.color,
                items: _courses.map((c) => DropdownMenuItem(
                  value: c['id'] as String,
                  child: Text(c['title'] ?? ''),
                )).toList(),
                onChanged: (val) => setState(() => _selectedCourseId = val),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _questionController,
            decoration: InputDecoration(
              hintText: 'Quelle est votre question ?',
              filled: true,
              fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: theme.dividerColor),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: theme.dividerColor),
              ),
              contentPadding: const EdgeInsets.all(20),
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitQuestion,
            style: theme.elevatedButtonTheme.style?.copyWith(
              minimumSize: MaterialStateProperty.all(const Size(double.infinity, 56)),
            ),
            child: _isSubmitting 
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('Envoyer ma question', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionsList(ThemeData theme, bool isDark) {
    if (_questions.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: theme.colorScheme.primary.withOpacity(0.05), shape: BoxShape.circle),
              child: Icon(Icons.forum_outlined, size: 48, color: theme.colorScheme.primary.withOpacity(0.5)),
            ),
            const SizedBox(height: 24),
            Text('Aucune question pour le moment', style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.4))),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _questions.length,
      itemBuilder: (context, index) {
        final q = _questions[index];
        final bool isAnswered = q['answer'] != null;
        
        return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: theme.cardTheme.color,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: isAnswered ? const Color(0xFF10B981).withOpacity(0.3) : theme.dividerColor,
              width: isAnswered ? 1.5 : 1,
            ),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            q['courses']['title']?.toUpperCase() ?? 'COURS',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: theme.colorScheme.primary, letterSpacing: 1),
                          ),
                        ),
                        Text(
                          DateFormat('dd MMM yyyy').format(DateTime.parse(q['created_at'])),
                          style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurface.withOpacity(0.4), fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      q['question'], 
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, height: 1.4)
                    ),
                  ],
                ),
              ),
              if (isAnswered)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.05),
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
                    border: Border(top: BorderSide(color: const Color(0xFF10B981).withOpacity(0.1))),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.verified_user_rounded, size: 16, color: Color(0xFF10B981)),
                          const SizedBox(width: 8),
                          Text(
                            'RÉPONSE DU PROFESSEUR', 
                            style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w900, color: const Color(0xFF10B981), letterSpacing: 1)
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        q['answer'], 
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: isDark ? Colors.blueGrey[100] : Colors.blueGrey[800],
                          fontStyle: FontStyle.italic,
                          height: 1.5,
                        )
                      ),
                    ],
                  ),
                )
              else 
                Padding(
                  padding: const EdgeInsets.only(left: 20, bottom: 20),
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.orange)),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'En attente de réponse...', 
                        style: theme.textTheme.labelSmall?.copyWith(color: Colors.orange, fontWeight: FontWeight.bold, fontStyle: FontStyle.italic)
                      ),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
