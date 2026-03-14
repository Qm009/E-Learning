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
      // Fetch published courses for dropdown
      final coursesData = await supabase
          .from('courses')
          .select('id, title')
          .eq('status', 'published');

      // Fetch student's own questions
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
          const SnackBar(content: Text('Question posée avec succès !'), backgroundColor: Colors.green),
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
      appBar: AppBar(
        title: const Text('Questions au Professeur', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : Column(
            children: [
              _buildComposeSection(),
              const Divider(height: 1),
              Expanded(child: _buildQuestionsList()),
            ],
          ),
    );
  }

  Widget _buildComposeSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(16),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                hint: const Text('Choisir un cours'),
                value: _selectedCourseId,
                isExpanded: true,
                items: _courses.map((c) => DropdownMenuItem(
                  value: c['id'] as String,
                  child: Text(c['title'] ?? ''),
                )).toList(),
                onChanged: (val) => setState(() => _selectedCourseId = val),
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _questionController,
            decoration: InputDecoration(
              hintText: 'Quelle est votre question ?',
              filled: true,
              fillColor: Colors.grey[100],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.all(16),
            ),
            maxLines: 2,
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitQuestion,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: _isSubmitting 
              ? const SizedBox(width: 20, h: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('Envoyer ma question', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionsList() {
    if (_questions.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.forum_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('Aucune question pour le moment', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _questions.length,
      itemBuilder: (context, index) {
        final q = _questions[index];
        final bool isAnswered = q['answer'] != null;
        
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: isAnswered ? const Color(0xFF10B981).withOpacity(0.2) : Colors.grey.shade200),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      q['courses']['title'] ?? 'Cours',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6366F1)),
                    ),
                  ),
                  Text(
                    DateFormat('dd/MM/yyyy').format(DateTime.parse(q['created_at'])),
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(q['question'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              if (isAnswered) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF10B981)),
                          SizedBox(width: 6),
                          Text('RÉPONSE DU PROFESSEUR', style: TextStyle(fontSize: 10, fontWeight: FontWeight.black, color: Color(0xFF10B981))),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(q['answer'], style: const TextStyle(fontSize: 13, color: Colors.blueGrey, fontStyle: FontStyle.italic)),
                    ],
                  ),
                ),
              ] else ...[
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Icon(Icons.access_time_rounded, size: 14, color: Colors.orange),
                    SizedBox(width: 6),
                    Text('En attente de réponse...', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.orange, fontStyle: FontStyle.italic)),
                  ],
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
