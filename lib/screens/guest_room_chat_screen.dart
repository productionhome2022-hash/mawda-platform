import 'package:cloud_functions/cloud_functions.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/member_media_upload_service.dart';

class GuestRoomChatScreen extends StatefulWidget {
  const GuestRoomChatScreen({super.key, required this.roomId, required this.roomName});
  final String roomId;
  final String roomName;
  @override
  State<GuestRoomChatScreen> createState() => _GuestRoomChatScreenState();
}

class _GuestRoomChatScreenState extends State<GuestRoomChatScreen> {
  final _functions = FirebaseFunctions.instance;
  final _media = MemberMediaUploadService();
  final _message = TextEditingController();
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true, _busy = false;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }
  @override
  void dispose() { _message.dispose(); _media.close(); super.dispose(); }

  Future<void> _load() async {
    if (mounted) setState(() { _loading = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('getRoomMessages').call({'roomId': widget.roomId});
      final data = Map<String, dynamic>.from(response.data as Map);
      final messages = (data['messages'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      if (mounted) setState(() { _messages = messages; _loading = false; });
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() { _error = e.message ?? 'تعذر تحميل الرسائل.'; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _error = 'تعذر تحميل الرسائل. ربما انتهت جلسة الزائر.'; _loading = false; });
    }
  }

  Future<void> _sendText() async {
    final content = _message.text.trim();
    if (content.isEmpty || _busy) return;
    setState(() => _busy = true);
    try {
      await _functions.httpsCallable('sendRoomMessage').call({
        'roomId': widget.roomId, 'content': content,
        'clientMessageId': 'guest_${DateTime.now().microsecondsSinceEpoch}',
      });
      _message.clear(); await _load();
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر إرسال الرسالة النصية.');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  Future<void> _sendAudio() async {
    if (_busy) return;
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom, allowedExtensions: const ['mp3', 'm4a', 'ogg', 'wav'],
      allowMultiple: false, withData: true,
    );
    if (picked == null || picked.files.isEmpty || !mounted) return;
    final selected = picked.files.single;
    final XFile? file = selected.path != null && selected.path!.isNotEmpty
        ? XFile(selected.path!, name: selected.name)
        : selected.bytes != null ? XFile.fromData(selected.bytes!, name: selected.name) : null;
    if (file == null) { setState(() => _error = 'تعذر قراءة الملف الصوتي.'); return; }
    setState(() { _busy = true; _error = null; });
    try {
      final mediaId = await _media.uploadChatAttachment(file: file, scope: 'room');
      await _media.sendChatMediaAttachment(
        scope: 'room', roomId: widget.roomId, mediaId: mediaId,
        clientMessageId: 'guest_audio_${DateTime.now().microsecondsSinceEpoch}',
      );
      await _load();
    } catch (e) {
      if (mounted) setState(() => _error = 'تعذر إرسال الرسالة الصوتية: $e');
    } finally { if (mounted) setState(() => _busy = false); }
  }

  Future<void> _openAudio(Map<String, dynamic> item) async {
    try {
      final url = await _media.getChatMediaAttachmentUrl(
        scope: 'room', roomId: widget.roomId,
        mediaId: item['mediaId'] as String, messageId: item['messageId'] as String,
      );
      final opened = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      if (!opened && mounted) setState(() => _error = 'تعذر فتح الملف الصوتي.');
    } catch (e) {
      if (mounted) setState(() => _error = 'الملف الصوتي غير متاح: $e');
    }
  }

  Widget _tile(Map<String, dynamic> item) {
    final sender = item['senderDisplayName'] as String? ?? 'عضو';
    if (item['type'] == 'attachment' && item['mediaCategory'] == 'audio' && item['mediaId'] is String) {
      return Card(child: ListTile(
        leading: const Icon(Icons.audiotrack), title: Text('رسالة صوتية • $sender'),
        subtitle: const Text('اضغط لفتح الصوت'), trailing: const Icon(Icons.play_arrow),
        onTap: () => _openAudio(item),
      ));
    }
    return Card(child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(sender, style: Theme.of(context).textTheme.labelSmall),
        const SizedBox(height: 4), SelectableText(item['content'] as String? ?? ''),
      ]),
    ));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.roomName),
      actions: [IconButton(onPressed: _busy ? null : _load, icon: const Icon(Icons.refresh))]),
    body: Column(children: [
      const Padding(padding: EdgeInsets.all(10),
        child: Text('الغرفة العامة: النص والرسائل الصوتية فقط للزائر.')),
      if (_error != null) Padding(padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
      Expanded(child: _loading ? const Center(child: CircularProgressIndicator())
        : _messages.isEmpty ? const Center(child: Text('لا توجد رسائل بعد. ابدأ الحديث.'))
        : ListView.builder(padding: const EdgeInsets.all(12), itemCount: _messages.length,
            itemBuilder: (_, i) => _tile(_messages[i]))),
      SafeArea(child: Padding(
        padding: const EdgeInsets.fromLTRB(10, 6, 10, 10),
        child: Row(children: [
          IconButton(tooltip: 'إرسال رسالة صوتية', onPressed: _busy ? null : _sendAudio,
            icon: const Icon(Icons.mic_none)),
          Expanded(child: TextField(controller: _message, minLines: 1, maxLines: 4,
            textInputAction: TextInputAction.send, onSubmitted: (_) => _sendText(),
            decoration: const InputDecoration(hintText: 'اكتب رسالة', border: OutlineInputBorder()))),
          const SizedBox(width: 6),
          IconButton(onPressed: _busy ? null : _sendText,
            icon: _busy ? const SizedBox(width: 20, height: 20,
              child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send)),
        ]),
      )),
    ]),
  );
}
