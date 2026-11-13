import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'package:url_launcher/url_launcher.dart';

class OwnerChatParticipationScreen extends StatefulWidget {
  const OwnerChatParticipationScreen({
    super.key,
    required this.chatId,
  });

  final String chatId;

  @override
  State<OwnerChatParticipationScreen> createState() =>
      _OwnerChatParticipationScreenState();
}

class _OwnerChatParticipationScreenState
    extends State<OwnerChatParticipationScreen> {
  final TextEditingController _messageController = TextEditingController();
  late Future<List<Map<String, dynamic>>> _messagesFuture;
  String _mode = 'platform_admin';
  bool _sending = false;

  static const _labels = <String, String>{
    'platform_admin': 'إدارة منصة مودة',
    'super_admin': 'السوبر أدمن',
    'anonymous': 'مجهول',
  };

  @override
  void initState() {
    super.initState();
    _messagesFuture = _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<List<Map<String, dynamic>>> _loadMessages() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getOwnerDirectChatMessages')
        .call({'chatId': widget.chatId, 'limit': 50});
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['messages'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((message) => Map<String, dynamic>.from(message))
        .toList(growable: false);
  }

  void _refresh() => setState(() => _messagesFuture = _loadMessages());

  Future<void> _send() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || text.length > 4000 || _sending) return;
    setState(() => _sending = true);
    try {
      await FirebaseFunctions.instance
          .httpsCallable('sendOwnerDirectChatMessage')
          .call({
        'chatId': widget.chatId,
        'text': text,
        'clientMessageId': const Uuid().v4(),
        'mode': _mode,
      });
      if (!mounted) return;
      _messageController.clear();
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم إرسال الرسالة باسم ${_labels[_mode]}.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال الرسالة الإدارية.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إرسال الرسالة؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _composeLiveStream() async {
    final url = TextEditingController();
    final title = TextEditingController();
    final description = TextEditingController();
    final accepted = await showDialog<bool>(context: context, builder: (dialogContext) => AlertDialog(
      title: const Text('إرسال رابط بث مباشر'),
      content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Text('يُقبل رابط HTTPS فقط. لا يتجاوز هذا الإجراء قيود تسجيل الدخول أو DRM أو الحجب الجغرافي أو منع التضمين.'),
        TextField(controller: url, keyboardType: TextInputType.url,
          decoration: const InputDecoration(labelText: 'رابط البث HTTPS')),
        TextField(controller: title, decoration: const InputDecoration(labelText: 'عنوان اختياري')),
        TextField(controller: description, maxLines: 3,
          decoration: const InputDecoration(labelText: 'وصف اختياري')),
      ])),
      actions: [
        TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
        FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('إرسال البث')),
      ],
    ));
    if (accepted != true || !mounted) {
      url.dispose(); title.dispose(); description.dispose(); return;
    }
    final rawUrl = url.text.trim();
    if (!rawUrl.startsWith('https://') || rawUrl.length > 2048 ||
        title.text.trim().length > 120 || description.text.trim().length > 500) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تحقق من رابط HTTPS وحدود العنوان والوصف.')),
      );
      url.dispose(); title.dispose(); description.dispose(); return;
    }
    setState(() => _sending = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('sendOwnerLiveStream').call({
        'requestId': const Uuid().v4().replaceAll('-', '_'),
        'scope': 'direct', 'targetId': widget.chatId, 'url': rawUrl,
        'title': title.text.trim(), 'description': description.text.trim(),
      });
      _refresh();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إرسال رابط البث إلى المحادثة.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال رابط البث.')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
      url.dispose(); title.dispose(); description.dispose();
    }
  }

  Future<void> _openLiveStream(String rawUrl) async {
    final uri = Uri.tryParse(rawUrl);
    if (uri == null || uri.scheme != 'https') return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final ownerUid = FirebaseAuth.instance.currentUser?.uid ?? '';
    return Scaffold(
      appBar: AppBar(
        title: const Text('مشاركة المالك في المحادثة'),
        actions: [
          IconButton(
            tooltip: 'إرسال رابط بث مباشر',
            onPressed: _sending ? null : _composeLiveStream,
            icon: const Icon(Icons.live_tv_outlined),
          ),
          IconButton(
            tooltip: 'تحديث المحادثة',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Card(
            margin: const EdgeInsets.fromLTRB(12, 12, 12, 6),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'تظهر الرسالة داخل المحادثة بصفتها رسالة إدارية. يظل معرّف المالك الحقيقي محفوظاً في النظام وسجل التدقيق، حتى عند اختيار «مجهول».',
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: _mode,
                    decoration: const InputDecoration(
                      labelText: 'صفة ظهور المالك',
                      border: OutlineInputBorder(),
                    ),
                    items: _labels.entries.map((entry) => DropdownMenuItem(
                      value: entry.key,
                      child: Text(entry.value),
                    )).toList(),
                    onChanged: _sending
                        ? null
                        : (value) {
                            if (value != null) setState(() => _mode = value);
                          },
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _messagesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('تعذر تحميل المحادثة للمراجعة والمشاركة.'),
                        TextButton(onPressed: _refresh, child: const Text('إعادة المحاولة')),
                      ],
                    ),
                  );
                }
                final messages = snapshot.data ?? const [];
                if (messages.isEmpty) {
                  return const Center(child: Text('لا توجد رسائل بعد في هذه المحادثة.'));
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    final mine = message['senderUid'] == ownerUid;
                    final label = mine
                        ? 'أنت — ${_labels[message['ownerParticipationMode']] ?? message['senderLabel'] ?? 'إدارة منصة مودة'}'
                        : (message['senderLabel'] as String? ?? 'عضو المحادثة');
                    final deleted = message['isDeleted'] == true;
                    return Align(
                      alignment: mine
                          ? AlignmentDirectional.centerEnd
                          : AlignmentDirectional.centerStart,
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 520),
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(label, style: Theme.of(context).textTheme.labelLarge),
                                const SizedBox(height: 6),
                                Text(deleted
                                    ? 'تم حذف هذه الرسالة'
                                    : (message['text'] as String? ?? '')),
                                if (!deleted && message['type'] == 'live_stream' &&
                                    message['liveStream'] is Map)
                                  Builder(builder: (context) {
                                    final stream = Map<String, dynamic>.from(message['liveStream'] as Map);
                                    final streamUrl = stream['url'] as String? ?? '';
                                    return Card(child: ListTile(
                                      leading: const Icon(Icons.live_tv_outlined),
                                      title: Text(stream['title'] as String? ?? 'بث مباشر'),
                                      subtitle: Text(stream['hostname'] as String? ?? ''),
                                      trailing: IconButton(
                                        onPressed: streamUrl.isEmpty ? null : () => _openLiveStream(streamUrl),
                                        icon: const Icon(Icons.open_in_new),
                                      ),
                                    ));
                                  }),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      minLines: 1,
                      maxLines: 5,
                      maxLength: 4000,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: const InputDecoration(
                        hintText: 'اكتب رسالة إدارية...',
                        border: OutlineInputBorder(),
                        counterText: '',
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    tooltip: 'إرسال الرسالة الإدارية',
                    onPressed: _sending ? null : _send,
                    icon: _sending
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
