import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

import 'direct_chat_screen.dart';
import 'discovery_screen.dart';

class ConversationsScreen extends StatefulWidget {
  const ConversationsScreen({super.key, required this.currentUserId});

  final String currentUserId;

  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  late Future<List<Map<String, dynamic>>> _conversations;

  @override
  void initState() {
    super.initState();
    _conversations = _loadConversations();
  }

  Future<List<Map<String, dynamic>>> _loadConversations() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getMyDirectChats')
        .call();
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['chats'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }

  Future<void> _refresh() async {
    setState(() => _conversations = _loadConversations());
    await _conversations;
  }

  String _formatTimestamp(dynamic value) {
    if (value is! num) return '';
    final date = DateTime.fromMillisecondsSinceEpoch(value.toInt());
    if (DateUtils.isSameDay(date, DateTime.now())) {
      return TimeOfDay.fromDateTime(date).format(context);
    }
    return '${date.day}/${date.month}';
  }

  Future<void> _openConversation(Map<String, dynamic> item) async {
    final peerUid = item['peerUid'] as String? ?? '';
    final peerName = item['peerName'] as String? ?? 'عضو مودة';
    final chatId = item['chatId'] as String? ?? '';
    if (peerUid.isEmpty || chatId.isEmpty) return;
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DirectChatScreen(
          peerUid: peerUid,
          peerName: peerName,
          chatId: chatId,
          currentUserId: widget.currentUserId,
        ),
      ),
    );
    if (mounted) await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الرسائل والمحادثات'),
        actions: [
          IconButton(
            tooltip: 'تحديث المحادثات',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _conversations,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.cloud_off_outlined, size: 44),
                    const SizedBox(height: 12),
                    const Text(
                      'تعذر تحميل المحادثات. تحقق من الاتصال ثم حاول مجدداً.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: _refresh,
                      icon: const Icon(Icons.refresh),
                      label: const Text('إعادة المحاولة'),
                    ),
                  ],
                ),
              ),
            );
          }

          final items = snapshot.data ?? const [];
          if (items.isEmpty) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(28),
                children: [
                  const SizedBox(height: 64),
                  const Icon(Icons.forum_outlined, size: 64),
                  const SizedBox(height: 16),
                  const Text(
                    'لا توجد محادثات بعد',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'اكتشف أعضاء مودة وابدأ محادثة جديدة. ستظهر محادثاتك هنا تلقائياً.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: FilledButton.icon(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => DiscoveryScreen(
                            currentUserId: widget.currentUserId,
                          ),
                        ),
                      ),
                      icon: const Icon(Icons.people_outline),
                      label: const Text('اكتشاف الأعضاء'),
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1, indent: 76),
              itemBuilder: (context, index) {
                final item = items[index];
                final name = item['peerName'] as String? ?? 'عضو مودة';
                final preview = item['lastMessagePreview'] as String? ?? '';
                final hasUnread = item['hasUnread'] == true;
                final time = _formatTimestamp(item['lastMessageAt']);
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  leading: CircleAvatar(
                    child: Text(name.isNotEmpty ? name.substring(0, 1) : 'م'),
                  ),
                  title: Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontWeight: hasUnread ? FontWeight.bold : FontWeight.w500),
                  ),
                  subtitle: Text(
                    preview.isEmpty ? 'محادثة مودة' : preview,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontWeight: hasUnread ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (time.isNotEmpty)
                        Text(time, style: Theme.of(context).textTheme.labelSmall),
                      if (hasUnread) ...[
                        const SizedBox(height: 5),
                        const Badge(label: Text('جديد')),
                      ],
                    ],
                  ),
                  onTap: () => _openConversation(item),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
