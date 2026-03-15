import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CreateCourseScreen extends StatefulWidget {
  const CreateCourseScreen({Key? key}) : super(key: key);

  @override
  State<CreateCourseScreen> createState() => _CreateCourseScreenState();
}

class _CreateCourseScreenState extends State<CreateCourseScreen> {
  final supabase = Supabase.instance.client;
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _imageUrlController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  Future<void> _createCourse() async {
    if (!_formKey.currentState!.validate()) return;

    final user = supabase.auth.currentUser;
    if (user == null) return;

    setState(() => _isLoading = true);

    try {
      await supabase.from('courses').insert({
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'image_url': _imageUrlController.text.trim().isEmpty
            ? null
            : _imageUrlController.text.trim(),
        'teacher_id': user.id,
        'status': 'published', // Published by default for demo ease
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cours publié avec succès ! 🚀'),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
        context.pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur : $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Publier un Cours',
          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900, letterSpacing: -0.5),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Premium Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(Icons.auto_stories_rounded, color: Colors.white, size: 24),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Créez votre académie',
                      style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Remplissez les informations ci-dessous pour lancer votre nouveau parcours d\'apprentissage.',
                      style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13, height: 1.5),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40),

              _SectionLabel(theme: theme, label: 'TITRE DU COURS', icon: Icons.text_fields_rounded),
              const SizedBox(height: 12),
              TextFormField(
                controller: _titleController,
                decoration: _inputDecoration(theme, isDark, 'Ex: Masterclass UI/UX Design', Icons.title_rounded),
                style: const TextStyle(fontWeight: FontWeight.bold),
                validator: (v) => v == null || v.trim().isEmpty ? 'Le titre est requis' : null,
              ),

              const SizedBox(height: 28),

              _SectionLabel(theme: theme, label: 'DESCRIPTION DÉTAILLÉE', icon: Icons.short_text_rounded),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                decoration: _inputDecoration(theme, isDark, 'Décrivez les objectifs et le programme...', null),
                maxLines: 5,
                validator: (v) => v == null || v.trim().isEmpty ? 'La description est requise' : null,
              ),

              const SizedBox(height: 28),

              _SectionLabel(theme: theme, label: 'URL DE COUVERTURE', icon: Icons.image_search_rounded),
              const SizedBox(height: 12),
              TextFormField(
                controller: _imageUrlController,
                decoration: _inputDecoration(theme, isDark, 'https://images.unsplash.com/...', Icons.link_rounded),
                keyboardType: TextInputType.url,
              ),

              // Image Preview
              ValueListenableBuilder(
                valueListenable: _imageUrlController,
                builder: (_, __, ___) {
                  final url = _imageUrlController.text.trim();
                  if (url.isEmpty) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.only(top: 20),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Image.network(
                          url,
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            height: 100,
                            color: theme.colorScheme.error.withOpacity(0.05),
                            child: Center(child: Text('URL d\'image non valide', style: TextStyle(color: theme.colorScheme.error))),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _createCourse,
                  style: theme.elevatedButtonTheme.style?.copyWith(
                    minimumSize: MaterialStateProperty.all(const Size(double.infinity, 64)),
                    shape: MaterialStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 3)
                      : const Text('Publier mon Cours', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                ),
              ),

              const SizedBox(height: 60),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(ThemeData theme, bool isDark, String hint, IconData? icon) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: icon != null ? Icon(icon, size: 20) : null,
      filled: true,
      fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: theme.dividerColor)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: theme.dividerColor)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: theme.colorScheme.primary, width: 2)),
      contentPadding: const EdgeInsets.all(20),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final ThemeData theme;
  final String label;
  final IconData icon;
  const _SectionLabel({required this.theme, required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: theme.colorScheme.primary),
        const SizedBox(width: 10),
        Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
            color: theme.colorScheme.onSurface.withOpacity(0.6),
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
