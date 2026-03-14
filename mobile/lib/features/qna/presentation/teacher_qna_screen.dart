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
          const SnackBar(content: Text('Réponse envoyée !'), backgroundColor: Colors.green),
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
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Questions des Étudiants', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _questions.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: _questions.length,
              itemBuilder: (context, index) {
                final q = _questions[index];
                return _buildQuestionCard(q);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.done_all_rounded, size: 64, color: Colors.grey[200]),
          const SizedBox(height: 16),
          const Text('Aucune question en attente 🎉', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(dynamic q) {
    bool isAnswered = q['answer'] != null;
    bool isAnswering = _answeringId == q['id'];

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isAnswered ? Colors.grey.shade100 : const Color(0xFF6366F1).withOpacity(0.2)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Row(
               children: [
                 CircleAvatar(
                   backgroundColor: const Color(0xFF6366F1).withOpacity(0.1),
                   child: Text(q['profiles']?['full_name']?.substring(0, 1).toUpperCase() ?? '?', 
                      style: const TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.bold)),
                 ),
                 const SizedBox(width: 12),
                 Expanded(
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       Text(q['profiles']?['full_name'] ?? 'Étudiant inconnu', style: const TextStyle(fontWeight: FontWeight.bold)),
                       Text(q['courses']?['title'] ?? 'Cours', style: TextStyle(fontSize: 10, color: Colors.grey[500])),
                     ],
                   ),
                 ),
                 Text(
                   DateFormat('dd/MM/yyyy').format(DateTime.parse(q['created_at'])),
                   style: const TextStyle(fontSize: 10, color: Colors.grey),
                 ),
               ],
             ),
             const SizedBox(height: 16),
             Text(
               '"${q['question']}"',
               style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
             ),
             const SizedBox(height: 16),
             if (isAnswered)
               Container(
                 width: double.infinity,
                 padding: const EdgeInsets.all(16),
                 decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(16)),
                 child: Text('Réponse: ${q['answer']}', style: const TextStyle(fontSize: 13, color: Colors.blueGrey, fontStyle: FontStyle.italic)),
               )
             else if (isAnswering)
               Column(
                 children: [
                   TextField(
                     controller: _answerController,
                     decoration: InputDecoration(
                       hintText: 'Votre réponse...',
                       filled: true,
                       fillColor: Colors.grey[100],
                       border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                     ),
                     maxLines: 3,
                   ),
                   const SizedBox(height: 12),
                   Row(
                     children: [
                       TextButton(onPressed: () => setState(() => _answeringId = null), child: const Text('Annuler')),
                       const Spacer(),
                       ElevatedButton(
                         onPressed: _isSubmitting ? null : () => _submitAnswer(q['id']),
                         style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), foregroundColor: Colors.white, elevation: 0),
                         child: const Text('Envoyer'),
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
                 style: ElevatedButton.styleFrom(
                   backgroundColor: const Color(0xFF6366F1),
                   foregroundColor: Colors.white,
                   minimumSize: const Size(double.infinity, 44),
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                   elevation: 0,
                 ),
                 child: const Text('Répondre'),
               ),
          ],
        ),
      ),
    );
  }
}
