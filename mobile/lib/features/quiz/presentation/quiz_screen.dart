import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class QuizListScreen extends StatefulWidget {
  const QuizListScreen({Key? key}) : super(key: key);

  @override
  State<QuizListScreen> createState() => _QuizListScreenState();
}

class _QuizListScreenState extends State<QuizListScreen> {
  final supabase = Supabase.instance.client;
  List<dynamic> _quizzes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchQuizzes();
  }

  String? _errorMessage;

  Future<void> _fetchQuizzes() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      
      // We use the same join logic as web
      final data = await supabase
          .from('quizzes')
          .select('id, title, passing_score_percentage, questions, courses!inner(title, status)')
          .eq('courses.status', 'published');
          
      setState(() {
        _quizzes = data;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching quizzes: $e');
      setState(() {
        _errorMessage = 'Impossible de charger les quiz. Vérifiez votre connexion.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        title: const Text('Mes Quiz',
            style: TextStyle(fontWeight: FontWeight.w900)),
        actions: [
          IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.red, size: 48),
                      const SizedBox(height: 16),
                      Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _fetchQuizzes, child: const Text('Réessayer'))
                    ],
                  ),
                )
              : _quizzes.isEmpty
                  ? Center(
                      child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.psychology_outlined,
                            size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text('Aucun quiz disponible',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[400],
                                fontSize: 18)),
                        const SizedBox(height: 8),
                        Text(
                          'Vos professeurs n\'ont pas encore créé de quiz.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _quizzes.length,
                  itemBuilder: (context, index) {
                    final quiz = _quizzes[index];
                    final course = quiz['courses'];
                    final questionCount =
                        (quiz['questions'] as List).length;
                    return _QuizCard(
                      quiz: quiz,
                      courseName: course?['title'] ?? 'Cours',
                      questionCount: questionCount,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => QuizPlayerScreen(quiz: quiz),
                          ),
                        );
                      },
                    );
                  },
                ),
    );
  }
}

// ─── Quiz Card Widget ────────────────────────────────────────────────────────

class _QuizCard extends StatelessWidget {
  final dynamic quiz;
  final String courseName;
  final int questionCount;
  final VoidCallback onTap;

  const _QuizCard({
    required this.quiz,
    required this.courseName,
    required this.questionCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.shade100),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6366F1).withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.psychology_rounded,
                    color: Color(0xFF6366F1), size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quiz['title'] ?? '',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 15),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      courseName,
                      style: const TextStyle(
                          color: Color(0xFF6366F1),
                          fontSize: 12,
                          fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _Pill('$questionCount questions'),
                        const SizedBox(width: 8),
                        _Pill('${quiz['passing_score_percentage']}% min'),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final String text;
  const _Pill(this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(text,
          style: TextStyle(fontSize: 10, color: Colors.grey[600], fontWeight: FontWeight.w600)),
    );
  }
}

// ─── Quiz Player Screen ───────────────────────────────────────────────────────

class QuizPlayerScreen extends StatefulWidget {
  final dynamic quiz;
  const QuizPlayerScreen({Key? key, required this.quiz}) : super(key: key);

  @override
  State<QuizPlayerScreen> createState() => _QuizPlayerScreenState();
}

class _QuizPlayerScreenState extends State<QuizPlayerScreen> {
  final supabase = Supabase.instance.client;
  int _currentStep = 0;
  late List<String> _answers;
  bool _isSubmitting = false;
  Map<String, dynamic>? _result;

  @override
  void initState() {
    super.initState();
    final questions = widget.quiz['questions'] as List;
    _answers = List.filled(questions.length, '');
  }

  List<dynamic> get questions => widget.quiz['questions'] as List;

  Future<void> _submitQuiz() async {
    setState(() => _isSubmitting = true);
    try {
      final session = supabase.auth.currentSession;
      if (session == null) throw Exception('Session expirée');

      const supabaseUrl = 'https://sbjttffctciepdqotnnc.supabase.co';
      final response = await supabase.functions.invoke(
        'calculate-score',
        body: {
          'quiz_id': widget.quiz['id'],
          'answers': _answers,
        },
      );

      final data = response.data as Map<String, dynamic>;
      setState(() {
        _result = data;
        _isSubmitting = false;
      });
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur : ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_result != null) return _buildResultScreen();

    final question = questions[_currentStep];
    final options = question['options'] as List;
    final progress = (_currentStep + 1) / questions.length;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        title: Text(widget.quiz['title'] ?? '',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[200],
            valueColor:
                const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
            minHeight: 4,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Step indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Question ${_currentStep + 1} / ${questions.length}',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.grey[500]),
                      ),
                      Text(
                        '${_answers.where((a) => a.isNotEmpty).length} répondues',
                        style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF6366F1),
                            fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Question text
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey.shade100),
                    ),
                    child: Text(
                      question['question'] ?? '',
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold, height: 1.5),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Options
                  ...List.generate(options.length, (i) {
                    final option = options[i].toString();
                    final isSelected = _answers[_currentStep] == option;
                    return GestureDetector(
                      onTap: () => setState(() => _answers[_currentStep] = option),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF6366F1).withOpacity(0.08)
                              : Theme.of(context).colorScheme.surface,
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF6366F1)
                                : Colors.grey.shade200,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                option,
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: isSelected
                                      ? const Color(0xFF6366F1)
                                      : null,
                                ),
                              ),
                            ),
                            Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSelected
                                    ? const Color(0xFF6366F1)
                                    : Colors.transparent,
                                border: Border.all(
                                  color: isSelected
                                      ? const Color(0xFF6366F1)
                                      : Colors.grey.shade300,
                                  width: 2,
                                ),
                              ),
                              child: isSelected
                                  ? const Icon(Icons.check,
                                      color: Colors.white, size: 14)
                                  : null,
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),

          // Bottom navigation
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              border: Border(top: BorderSide(color: Colors.grey.shade100)),
            ),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _currentStep--),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Précédente',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _answers[_currentStep].isEmpty || _isSubmitting
                        ? null
                        : () {
                            if (_currentStep < questions.length - 1) {
                              setState(() => _currentStep++);
                            } else {
                              _submitQuiz();
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : Text(
                            _currentStep < questions.length - 1
                                ? 'Suivante'
                                : 'Terminer le Quiz',
                            style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultScreen() {
    final passed = _result!['passed'] as bool? ?? false;
    final score = _result!['score'] as int? ?? 0;
    final correct = _result!['correct'] as int? ?? 0;
    final total = _result!['total'] as int? ?? questions.length;
    final message = _result!['message'] as String? ?? '';

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 32),
              // Trophy / X icon
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: passed
                      ? Colors.green.withOpacity(0.1)
                      : Colors.red.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  passed ? Icons.emoji_events_rounded : Icons.cancel_rounded,
                  size: 56,
                  color: passed ? Colors.green : Colors.red,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                passed ? 'Félicitations ! 🎉' : 'Continuez vos efforts !',
                style: const TextStyle(
                    fontSize: 26, fontWeight: FontWeight.w900),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600], fontSize: 14),
              ),
              const SizedBox(height: 32),

              // Score big display
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: passed
                      ? Colors.green.withOpacity(0.06)
                      : Colors.red.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: passed
                        ? Colors.green.withOpacity(0.2)
                        : Colors.red.withOpacity(0.2),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      '$score%',
                      style: TextStyle(
                        fontSize: 64,
                        fontWeight: FontWeight.w900,
                        color: passed ? Colors.green : Colors.red,
                      ),
                    ),
                    Text(
                      '$correct bonnes réponses sur $total',
                      style: TextStyle(
                          color: Colors.grey[600], fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Certificate notice
              if (passed)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border:
                        Border.all(color: Colors.green.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_rounded,
                          color: Colors.green, size: 28),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Certificat émis !',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green)),
                            Text(
                              'Consultez vos certificats dans le menu.',
                              style: TextStyle(
                                  fontSize: 12, color: Colors.green),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 32),

              // Actions
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Retour aux quiz',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              if (!passed) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {
                      setState(() {
                        _result = null;
                        _currentStep = 0;
                        _answers = List.filled(questions.length, '');
                      });
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Réessayer',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
