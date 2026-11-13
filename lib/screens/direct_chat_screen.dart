import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class DirectChatScreen extends StatefulWidget {
  const DirectChatScreen({
    super.key,
    required this.peerUid,
    required this.peerName,
    required this.currentUserId,
  });

  final String peerUid;
  final String peerName;
  final String currentUserId;

  @override
  State<DirectChatScreen> createState() => _DirectChatScreenState();
}

class _DirectChatScreenState extends State<DirectChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  late Future<Map<String, dynamic>> _messagesFuture;
  bool _sending = false;

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

  Future<Map<String, dynamic>> _loadMessages() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getDirectMessages')
        .call(<String, dynamic>{'peerUid': widget.peerUid});
    final data = Map<String, dynamic>.from(response.data as Map);
    final messages = (data['messages'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((message) => Map<String, dynamic>.from(message))
        .toList(growable: false);
    final chatId = data['chatId'] as String?;
    if (chatId != null && messages.isNotEmpty) {
      // Only the active participant UI marks its own conversation read.
      // The separate owner-review callable never invokes this path.
      try {
        await FirebaseFunctions.instance
            .httpsCallable('markDirectChatRead')
            .call(<String, dynamic>{'chatId': chatId});
      } on FirebaseFunctionsException {
        // Message reading remains available if receipt persistence is temporarily unavailable.
      }
    }
    return {
      ...data,
      'messages': messages,
    };
  }

  void _refresh() {
    setState(() => _messagesFuture = _loadMessages());
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('sendDirectMessage').call({
        'recipientUid': widget.peerUid,
        'text': text,
        'clientMessageId': const Uuid().v4(),
      });
      if (!mounted) return;
      _messageController.clear();
      _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال الرسالة.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('حدث خطأ أثناء إرسال الرسالة.')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _deleteMessage(Map<String, dynamic> message) async {
    final messageId = message['messageId'] as String? ?? '';
    final chatId = _messagesFuture == null ? '' : '';
    if (messageId.isEmpty) return;
    final mine = message['senderUid'] == widget.currentUserId;
    final action = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('خيارات حذف الرسالة'),
        content: const Text('اختر طريقة الحذف.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, 'me'),
            child: const Text('الحذف لدي'),
          ),
          if (mine)
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, 'everyone'),
              child: const Text('الحذف لدى الجميع'),
            ),
        ],
      ),
    );
    if (action == null || !mounted) return;
    try {
      final data = await _messagesFuture;
      final currentChatId = data['chatId'] as String? ?? '';
      if (currentChatId.isEmpty) {
        throw StateError('المحادثة غير متاحة');
      }
      final callable = FirebaseFunctions.instance.httpsCallable(
        action == 'me' ? 'deleteDirectMessageForMe' : 'deleteDirectMessageForEveryone',
      );
      await callable.call(<String, dynamic>{
        'chatId': currentChatId,
        'messageId': messageId,
      });
      if (mounted) _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حذف الرسالة.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر حذف الرسالة. حاول تحديث المحادثة ثم أعد المحاولة.')),
      );
    }
  }

  String _timeLabel(dynamic value) {
    if (value is! num) return '';
    final date = DateTime.fromMillisecondsSinceEpoch(value.toInt()).toLocal();
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Widget _messageBubble(Map<String, dynamic> message) {
    final mine = message['senderUid'] == widget.currentUserId;
    final text = message['text'] as String? ?? '';
    return Align(
      alignment: mine ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: Card(
          color: mine
              ? Theme.of(context).colorScheme.primaryContainer
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (!mine && message['isPlatformOwnerMessage'] == true)
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        message['senderLabel'] as String? ?? 'إدارة منصة مودة',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                if (message['isOwnerReviewNotice'] == true)
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.campaign_outlined,
                            size: 14,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'إشعار مراجعة معلنة',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                SelectableText(text),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _timeLabel(message['createdAt']),
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                    if (mine) ...[
                      const SizedBox(width: 6),
                      Icon(
                        message['isReadByPeer'] == true ? Icons.done_all : Icons.check,
                        size: 14,
                        color: message['isReadByPeer'] == true
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        message['isReadByPeer'] == true ? 'مقروءة' : 'مرسلة',
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                    ],
                    const SizedBox(width: 4),
                    IconButton(
                      tooltip: 'حذف الرسالة',
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                      onPressed: () => _deleteMessage(message),
                      icon: const Icon(Icons.delete_outline, size: 18),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.peerName.isEmpty ? 'محادثة خاصة' : widget.peerName),
        actions: [
          IconButton(
            tooltip: 'تحديث الرسائل',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<Map<String, dynamic>>(
              future: _messagesFuture,
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
                          const Text(
                            'تعذر تحميل المحادثة. قد لا تسمح إعدادات العضوية أو الخصوصية بفتحها.',
                            textAlign: TextAlign.center,
                          ),
                          TextButton(
                            onPressed: _refresh,
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                final data = snapshot.data ?? const <String, dynamic>{};
                final messages = (data['messages'] as List<dynamic>? ?? const [])
                    .whereType<Map>()
                    .map((message) => Map<String, dynamic>.from(message))
                    .toList(growable: false);
                if (messages.isEmpty) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text(
                        'هذه بداية المحادثة. أرسل رسالة محترمة لبدء التواصل.',
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) => _messageBubble(messages[index]),
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
                      onSubmitted: (_) => _sendMessage(),
                      decoration: const InputDecoration(
                        hintText: 'اكتب رسالتك...',
                        border: OutlineInputBorder(),
                        counterText: '',
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    tooltip: 'إرسال',
                    onPressed: _sending ? null : _sendMessage,
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
