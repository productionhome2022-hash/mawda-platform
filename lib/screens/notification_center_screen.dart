import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class NotificationCenterScreen extends StatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  State<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends State<NotificationCenterScreen> {
  late Future<List<Map<String, dynamic>>> _future;
  final Set<String> _marking = {};

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<Map<String, dynamic>>> _load() async {
    final result = await FirebaseFunctions.instance.httpsCallable('getMyNotifications').call();
    final data = Map<String, dynamic>.from(result.data as Map);
    return (data['notifications'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _markRead(String id) async {
    if (_marking.contains(id)) return;
    setState(() => _marking.add(id));
    try {
      await FirebaseFunctions.instance.httpsCallable('markNotificationRead').call({
        'notificationId': id,
      });
      _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تحديث حالة الإشعار.')),
      );
    } finally {
      if (mounted) setState(() => _marking.remove(id));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('الإشعارات'),
          actions: [IconButton(onPressed: _refresh, icon: const Icon(Icons.refresh))],
        ),
        body: FutureBuilder<List<Map<String, dynamic>>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(child: TextButton(onPressed: _refresh, child: const Text('تعذر تحميل الإشعارات؛ أعد المحاولة')));
            }
            final items = snapshot.data ?? const [];
            if (items.isEmpty) return const Center(child: Text('لا توجد إشعارات حالياً.'));
            return RefreshIndicator(
              onRefresh: () async => _refresh(),
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  final id = item['notificationId'] as String? ?? '';
                  final read = item['isRead'] == true;
                  return Card(
                    child: ListTile(
                      leading: Icon(read ? Icons.notifications_none : Icons.notifications_active_outlined),
                      title: Text(item['title'] as String? ?? 'إشعار من مودة'),
                      subtitle: Text(item['body'] as String? ?? ''),
                      trailing: read
                          ? const Icon(Icons.done, size: 18)
                          : IconButton(
                              tooltip: 'تحديد كمقروء',
                              onPressed: _marking.contains(id) ? null : () => _markRead(id),
                              icon: const Icon(Icons.mark_email_read_outlined),
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
