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
      final data = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single();
      setState(() {
        _profile = data;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_profile == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: const Color(0xFF6366F1),
            backgroundImage: _profile!['avatar_url'] != null 
              ? NetworkImage(_profile!['avatar_url']) 
              : null,
            child: _profile!['avatar_url'] == null 
              ? Text(_profile!['full_name']?[0]?.toUpperCase() ?? '?', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
              : null,
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _profile!['full_name'] ?? 'Utilisateur',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              Text(
                _profile!['role'] == 'teacher' ? 'Professeur' : 'Étudiant',
                style: TextStyle(color: Colors.grey[500], fontSize: 11, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
