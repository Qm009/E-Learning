import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';

class QuizListScreen extends StatefulWidget {
  const QuizListScreen({Key? key}) : super(key: key);

  @override
  State<QuizListScreen> createState() => _QuizListScreenState();
}

class _QuizListScreenState extends State<QuizListScreen> {
  final supabase = Supabase.instance.client;
  List<dynamic> _quizzes = [];
  bool _isLoading = true;
  String? _errorMessage;
  String? _userRole;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
    _fetchQuizzes();
  }

  Future<void> _fetchUserData() async {
    final user = supabase.auth.currentUser;
    if (user != null) {
      final data = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setState(() => _userRole = data['role']);
    }
  }

  Future<void> _fetchQuizzes() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      
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
        _errorMessage = 'Impossible de charger les quiz.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _userRole == 'teacher' ? 'Gestion des Quiz' : 'Mes Quiz',
          style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
        ),
        actions: [
          if (_userRole == 'teacher')
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: IconButton(
                icon: const Icon(Icons.add_circle_outline_rounded, size: 28),
                onPressed: () {
                  // Optionnel: Navigation vers une page de création
                },
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorState(theme)
              : _quizzes.isEmpty
                  ? _buildEmptyState(theme)
                  : ListView.builder(
                      padding: const EdgeInsets.all(24),
                      itemCount: _quizzes.length,
                      itemBuilder: (context, index) {
                        final quiz = _quizzes[index];
                        final questionCount = (quiz['questions'] as List).length;
                        return _QuizCard(
                          quiz: quiz,
                          courseName: quiz['courses']?['title'] ?? 'Cours',
                          questionCount: questionCount,
                          isDark: isDark,
                          theme: theme,
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
      floatingActionButton: _userRole == 'teacher' 
        ? FloatingActionButton.extended(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Veuillez utiliser l\'interface Web pour générer des quiz avec l\'IA.')),
              );
            },
            icon: const Icon(Icons.auto_awesome_rounded),
            label: const Text('Générer (IA)', style: TextStyle(fontWeight: FontWeight.bold)),
            backgroundColor: theme.colorScheme.primary,
          )
        : null,
    );
  }

  Widget _buildErrorState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.cloud_off_rounded, color: theme.colorScheme.error.withOpacity(0.5), size: 64),
          const SizedBox(height: 16),
          Text(_errorMessage!, style: TextStyle(color: theme.colorScheme.error)),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: _fetchQuizzes, child: const Text('Réessayer'))
        ],
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: theme.colorScheme.primary.withOpacity(0.05), shape: BoxShape.circle),
              child: Icon(Icons.psychology_rounded, size: 48, color: theme.colorScheme.primary.withOpacity(0.5)),
            ),
            const SizedBox(height: 24),
            Text('Aucun quiz disponible', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Revenez plus tard pour de nouveaux défis !',
              textAlign: TextAlign.center,
              style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.5)),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuizCard extends StatelessWidget {
  final dynamic quiz;
  final String courseName;
  final int questionCount;
  final bool isDark;
  final ThemeData theme;
  final VoidCallback onTap;

  const _QuizCard({
    required this.quiz,
    required this.courseName,
    required this.questionCount,
    required this.isDark,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.dividerColor),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.quiz_rounded, color: Color(0xFF6366F1)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      courseName.toUpperCase(),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: theme.colorScheme.primary,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      quiz['title'] ?? 'Quiz sans titre',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$questionCount Questions • Passé à ${quiz['passing_score_percentage']}%',
                      style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withOpacity(0.4)),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: theme.colorScheme.onSurface.withOpacity(0.2)),
            ],
          ),
        ),
      ),
    );
  }
}

class QuizPlayerScreen extends StatefulWidget {
  final dynamic quiz;
  const QuizPlayerScreen({Key? key, required this.quiz}) : super(key: key);

  @override
  State<QuizPlayerScreen> createState() => _QuizPlayerScreenState();
}

class _QuizPlayerScreenState extends State<QuizPlayerScreen> {
  int _currentStep = 0;
  late List<String> _answers;
  Map<String, dynamic>? _result;
  late List<dynamic> questions;

  @override
  void initState() {
    super.initState();
    questions = widget.quiz['questions'] as List;
    _answers = List.filled(questions.length, '');
  }

  void _finishQuiz() async {
    int correctCount = 0;
    for (int i = 0; i < questions.length; i++) {
      if (_answers[i] == questions[i]['correctAnswer']) {
        correctCount++;
      }
    }

    final score = (correctCount / questions.length * 100).round();
    final passed = score >= (widget.quiz['passing_score_percentage'] ?? 60);

    setState(() {
      _result = {
        'score': score,
        'correct': correctCount,
        'total': questions.length,
        'passed': passed,
      };
    });

    if (passed) {
      try {
        final supabase = Supabase.instance.client;
        final user = supabase.auth.currentUser;
        if (user != null) {
          await supabase.from('certificates').insert({
            'user_id': user.id,
            'quiz_id': widget.quiz['id'],
            'course_id': widget.quiz['course_id'],
            'score': score,
          });
        }
      } catch (e) {
        debugPrint('Erreur certificat : $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_result != null) {
      return _QuizResultScreen(
        result: _result!,
        onRetry: () {
          setState(() {
            _result = null;
            _currentStep = 0;
            _answers = List.filled(questions.length, '');
          });
        },
      );
    }

    final q = questions[_currentStep];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Force dark for focus
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: const BackButton(color: Colors.white),
        title: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: (_currentStep + 1) / questions.length,
            backgroundColor: Colors.white.withOpacity(0.1),
            valueColor: const AlwaysStoppedAnimation(Color(0xFF6366F1)),
            minHeight: 8,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'QUESTION ${_currentStep + 1} SUR ${questions.length}',
                style: const TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1.5),
              ),
              const SizedBox(height: 16),
              Text(
                q['question'],
                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, height: 1.4),
              ),
              const SizedBox(height: 48),
              Expanded(
                child: ListView.builder(
                  itemCount: (q['options'] as List).length,
                  itemBuilder: (context, i) {
                    final option = q['options'][i];
                    final isSelected = _answers[_currentStep] == option;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _answers[_currentStep] = option;
                          });
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF6366F1) : Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF6366F1) : Colors.white.withOpacity(0.1),
                              width: 2,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white.withOpacity(0.2), width: 2),
                                  color: isSelected ? Colors.white : Colors.transparent,
                                ),
                                child: isSelected 
                                  ? const Icon(Icons.check, size: 16, color: Color(0xFF6366F1))
                                  : Center(child: Text(String.fromCharCode(65 + i), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  option,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _answers[_currentStep].isEmpty 
                    ? null 
                    : () {
                        if (_currentStep < questions.length - 1) {
                          setState(() => _currentStep++);
                        } else {
                          _finishQuiz();
                        }
                      },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    disabledBackgroundColor: Colors.white.withOpacity(0.1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 0,
                  ),
                  child: Text(
                    _currentStep < questions.length - 1 ? 'Suivant' : 'Terminer',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuizResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;
  final VoidCallback onRetry;

  const _QuizResultScreen({required this.result, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final passed = result['passed'] as bool;
    final score = result['score'] as int;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: passed ? const Color(0xFF10B981).withOpacity(0.1) : Colors.red.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  passed ? Icons.emoji_events_rounded : Icons.sentiment_dissatisfied_rounded,
                  size: 64,
                  color: passed ? const Color(0xFF10B981) : Colors.red,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                passed ? 'INCROYABLE ! 🎉' : 'ENCORE UN EFFORT !',
                style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -1),
              ),
              const SizedBox(height: 8),
              Text(
                passed ? 'Vous avez brillamment réussi ce quiz.' : 'Vous n\'avez pas atteint le score minimum.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 16),
              ),
              const SizedBox(height: 64),
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 200,
                    height: 200,
                    child: CircularProgressIndicator(
                      value: score / 100,
                      strokeWidth: 20,
                      backgroundColor: Colors.white.withOpacity(0.05),
                      valueColor: AlwaysStoppedAnimation(passed ? const Color(0xFF10B981) : const Color(0xFF6366F1)),
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '$score%',
                        style: const TextStyle(color: Colors.white, fontSize: 56, fontWeight: FontWeight.w900),
                      ),
                      Text(
                        'SCORE FINAL',
                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 64),
              Text(
                '${result['correct']} bonnes réponses sur ${result['total']}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.05),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 0,
                  ),
                  child: const Text('Quitter', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
              if (!passed) ...[
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: onRetry,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 0,
                    ),
                    child: const Text('Réessayer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
