import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileHeader extends StatefulWidget {
  const ProfileHeader({Key? key}) : super(key: key);

  @override
  State<ProfileHeader> createState() => _ProfileHeaderState();
}

class _ProfileHeaderState extends State<ProfileHeader> {
  final supabase = Supabase.instance.client;
  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    final user = supabase.auth.currentUser;
    if (user != null) {
      try {
        final data = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)
            .single();
        setState(() {
          _profile = data;
        });
      } catch (e) {
        // Handle error silently
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (_profile == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.only(left: 8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: theme.colorScheme.primary.withOpacity(0.2), width: 1.5),
            ),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: theme.colorScheme.primary,
              backgroundImage: _profile!['avatar_url'] != null 
                ? NetworkImage(_profile!['avatar_url']) 
                : null,
              child: _profile!['avatar_url'] == null 
                ? Text(
                    _profile!['full_name']?[0]?.toUpperCase() ?? '?', 
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                  )
                : null,
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _profile!['full_name'] ?? 'Utilisateur',
                style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              Text(
                _profile!['role'] == 'teacher' ? 'Professeur' : 'Étudiant',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
