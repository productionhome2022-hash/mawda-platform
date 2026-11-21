import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

import 'profile_screen.dart';

class DiscoveryScreen extends StatefulWidget {
  const DiscoveryScreen({super.key, required this.currentUserId});

  final String currentUserId;

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  late Future<List<Map<String, dynamic>>> _members;

  @override
  void initState() {
    super.initState();
    _members = _load();
  }

  Future<List<Map<String, dynamic>>> _load() async {
    final response = await FirebaseFunctions.instance.httpsCallable('discoverMembers').call();
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['members'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }

  Future<void> _refresh() async {
    setState(() => _members = _load());
    await _members;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('اكتشف أعضاء مودة'),
        actions: [
          IconButton(
            tooltip: 'تحديث',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _members,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('تعذر تحميل قائمة الاكتشاف.'),
                  TextButton(onPressed: _refresh, child: const Text('إعادة المحاولة')),
                ],
              ),
            );
          }
          final members = snapshot.data ?? const [];
          if (members.isEmpty) {
            return const Center(child: Text('لا توجد ملفات عامة متاحة ضمن فئتك العمرية حالياً.'));
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: members.length,
              separatorBuilder: (_, __) => const SizedBox(height: 6),
              itemBuilder: (context, index) {
                final member = members[index];
                final uid = member['uid'] as String? ?? member['userId'] as String? ?? '';
                final name = member['displayName'] as String? ?? 'عضو مودة';
                final username = member['username'] as String? ?? '';
                final avatarUrl = member['avatarUrl'] as String?;
                final boosted = member['isBoosted'] == true;
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundImage: avatarUrl == null ? null : NetworkImage(avatarUrl),
                      child: avatarUrl == null ? const Icon(Icons.person_outline) : null,
                    ),
                    title: Row(
                      children: [
                        Expanded(child: Text(name, maxLines: 1, overflow: TextOverflow.ellipsis)),
                        if (boosted)
                          const Padding(
                            padding: EdgeInsetsDirectional.only(start: 6),
                            child: Icon(Icons.trending_up, size: 18, color: Colors.deepPurple),
                          ),
                      ],
                    ),
                    subtitle: username.isEmpty ? null : Text('@$username'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: uid.isEmpty
                        ? null
                        : () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => ProfileScreen(
                                  profileUserId: uid,
                                  currentUserId: widget.currentUserId,
                                ),
                              ),
                            ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
