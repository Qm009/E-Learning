import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

class TeacherQnAScreen extends StatefulWidget {
  const TeacherQnAScreen({Key? key}) : super(key: key);

  @override
  State<TeacherQnAScreen> createState() => _TeacherQnAScreenState();
}

class _TeacherQnAScreenState extends State<TeacherQnAScreen> {
  final supabase = Supabase.instance.client;
  List<dynamic> _questions = [];
  bool _isLoading = true;
  String? _answeringId;
  final _answerController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchQuestions();
  }

  Future<void> _fetchQuestions() async {
    final user = supabase.auth.currentUser;
    if (user == null) return;

    try {
      final data = await supabase
          .from('course_questions')
          .select('*, courses!inner(title, teacher_id), profiles(full_name, avatar_url)')
          .eq('courses.teacher_id', user.id)
          .order('created_at', ascending: false);

      setState(() {
        _questions = data;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching teacher QnA: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitAnswer(String qId) async {
    if (_answerController.text.isEmpty) return;

    setState(() => _isSubmitting = true);

    try {
      await supabase.from('course_questions').update({
        'answer': _answerController.text,
        'answered_at': DateTime.now().toIso8601String(),
      }).eq('id', qId);

      _answerController.clear();
      setState(() => _answeringId = null);
      await _fetchQuestions();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Réponse envoyée !'), 
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
          'Questions Étudiants',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: -0.5,
          ),
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _questions.isEmpty
          ? _buildEmptyState(theme)
          : ListView.builder(
              padding: const EdgeInsets.all(24),
              itemCount: _questions.length,
              itemBuilder: (context, index) {
                final q = _questions[index];
                return _buildQuestionCard(theme, isDark, q);
              },
            ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.done_all_rounded, size: 64, color: Color(0xFF10B981)),
          ),
          const SizedBox(height: 24),
          Text(
            'Aucune question en attente 🎉', 
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)
          ),
          const SizedBox(height: 8),
          Text(
            'Vous êtes à jour dans vos réponses.',
            style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.5)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(ThemeData theme, bool isDark, dynamic q) {
    bool isAnswered = q['answer'] != null;
    bool isAnswering = _answeringId == q['id'];

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isAnswered ? theme.dividerColor : theme.colorScheme.primary.withOpacity(0.3),
          width: isAnswered ? 1 : 2,
        ),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Row(
               children: [
                 CircleAvatar(
                   radius: 20,
                   backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                   backgroundImage: q['profiles']?['avatar_url'] != null ? NetworkImage(q['profiles']['avatar_url']) : null,
                   child: q['profiles']?['avatar_url'] == null 
                      ? Text(q['profiles']?['full_name']?.substring(0, 1).toUpperCase() ?? '?', 
                         style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold))
                      : null,
                 ),
                 const SizedBox(width: 14),
                 Expanded(
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       Text(q['profiles']?['full_name'] ?? 'Étudiant inconnu', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                       Text(
                        q['courses']?['title']?.toUpperCase() ?? 'COURS', 
                        style: TextStyle(fontSize: 9, color: theme.colorScheme.onSurface.withOpacity(0.5), fontWeight: FontWeight.w900, letterSpacing: 1)
                       ),
                     ],
                   ),
                 ),
                 Text(
                   DateFormat('dd MMM').format(DateTime.parse(q['created_at'])),
                   style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurface.withOpacity(0.4), fontWeight: FontWeight.bold),
                 ),
               ],
             ),
             const SizedBox(height: 20),
             Text(
               '« ${q['question']} »',
               style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600, 
                color: theme.colorScheme.onSurface,
                height: 1.5,
               ),
             ),
             const SizedBox(height: 24),
             if (isAnswered)
               Container(
                 width: double.infinity,
                 padding: const EdgeInsets.all(20),
                 decoration: BoxDecoration(
                  color: theme.colorScheme.onSurface.withOpacity(0.03), 
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: theme.dividerColor),
                 ),
                 child: Text(
                  'RÉPONSE: ${q['answer']}', 
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.7), 
                    fontStyle: FontStyle.italic
                  )
                ),
               )
             else if (isAnswering)
               Column(
                 children: [
                   TextField(
                     controller: _answerController,
                     decoration: InputDecoration(
                       hintText: 'Votre réponse experte...',
                       filled: true,
                       fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                       border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: theme.dividerColor)),
                       enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: theme.dividerColor)),
                     ),
                     maxLines: 4,
                   ),
                   const SizedBox(height: 16),
                   Row(
                     children: [
                       TextButton(
                        onPressed: () => setState(() => _answeringId = null), 
                        child: Text('Annuler', style: TextStyle(color: theme.colorScheme.error))
                       ),
                       const Spacer(),
                       ElevatedButton(
                         onPressed: _isSubmitting ? null : () => _submitAnswer(q['id']),
                         style: theme.elevatedButtonTheme.style?.copyWith(
                          padding: MaterialStateProperty.all(const EdgeInsets.symmetric(horizontal: 24, vertical: 12)),
                         ),
                         child: _isSubmitting 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Envoyer'),
                       ),
                     ],
                   )
                 ],
               )
             else
               ElevatedButton(
                 onPressed: () => setState(() {
                   _answeringId = q['id'];
                   _answerController.clear();
                 }),
                 style: theme.elevatedButtonTheme.style?.copyWith(
                    minimumSize: MaterialStateProperty.all(const Size(double.infinity, 50)),
                 ),
                 child: const Text('Répondre maintenant'),
               ),
          ],
        ),
      ),
    );
  }
}
