import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class RoomEventsScreen extends StatefulWidget {
  const RoomEventsScreen({
    super.key,
    required this.roomId,
    required this.currentUserId,
    required this.canManageEvents,
  });

  final String roomId;
  final String currentUserId;
  final bool canManageEvents;

  @override
  State<RoomEventsScreen> createState() => _RoomEventsScreenState();
}

class _RoomEventsScreenState extends State<RoomEventsScreen> {
  late Future<List<Map<String, dynamic>>> _eventsFuture;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _eventsFuture = _loadEvents();
  }

  Future<List<Map<String, dynamic>>> _loadEvents() async {
    final response = await FirebaseFunctions.instance.httpsCallable('listRoomEvents').call({
      'roomId': widget.roomId,
    });
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['events'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }

  Future<void> _refresh() async {
    setState(() => _eventsFuture = _loadEvents());
    await _eventsFuture;
  }

  String _eventTypeLabel(String value) => switch (value) {
    'audio_stream' => 'بث صوتي خارجي',
    'video_stream' => 'بث فيديو خارجي',
    'watch_party' => 'مشاهدة جماعية',
    _ => 'إعلان أو لقاء',
  };

  String _statusLabel(String value) => switch (value) {
    'live' => 'مباشر الآن',
    'completed' => 'انتهى',
    'cancelled' => 'ملغى',
    _ => 'مجدول',
  };

  Future<void> _createEvent() async {
    final title = TextEditingController();
    final description = TextEditingController();
    final streamUrl = TextEditingController();
    final duration = TextEditingController(text: '60');
    var eventType = 'announcement';
    var startsAt = DateTime.now().add(const Duration(hours: 1));

    final accepted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إنشاء حدث للغرفة'),
          content: SizedBox(
            width: 420,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: title,
                    maxLength: 80,
                    decoration: const InputDecoration(labelText: 'عنوان الحدث'),
                  ),
                  TextField(
                    controller: description,
                    maxLength: 500,
                    minLines: 2,
                    maxLines: 4,
                    decoration: const InputDecoration(labelText: 'الوصف (اختياري)'),
                  ),
                  DropdownButtonFormField<String>(
                    value: eventType,
                    decoration: const InputDecoration(labelText: 'نوع الحدث'),
                    items: const [
                      DropdownMenuItem(value: 'announcement', child: Text('إعلان أو لقاء')),
                      DropdownMenuItem(value: 'audio_stream', child: Text('بث صوتي خارجي')),
                      DropdownMenuItem(value: 'video_stream', child: Text('بث فيديو خارجي')),
                      DropdownMenuItem(value: 'watch_party', child: Text('مشاهدة جماعية')),
                    ],
                    onChanged: (value) => setDialogState(() => eventType = value ?? 'announcement'),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    icon: const Icon(Icons.calendar_month_outlined),
                    label: Text('الموعد: ${startsAt.toLocal()}'.split('.').first),
                    onPressed: () async {
                      final date = await showDatePicker(
                        context: dialogContext,
                        initialDate: startsAt,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (date == null || !context.mounted) return;
                      final time = await showTimePicker(
                        context: dialogContext,
                        initialTime: TimeOfDay.fromDateTime(startsAt),
                      );
                      if (time == null) return;
                      setDialogState(() {
                        startsAt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                      });
                    },
                  ),
                  TextField(
                    controller: duration,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'المدة بالدقائق (10–240)'),
                  ),
                  if (eventType != 'announcement')
                    TextField(
                      controller: streamUrl,
                      keyboardType: TextInputType.url,
                      decoration: const InputDecoration(
                        labelText: 'رابط البث HTTPS (من مزود معتمد)',
                      ),
                    ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('إلغاء'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('إنشاء'),
            ),
          ],
        ),
      ),
    );

    if (accepted != true || !mounted) {
      title.dispose();
      description.dispose();
      streamUrl.dispose();
      duration.dispose();
      return;
    }
    final minutes = int.tryParse(duration.text.trim());
    try {
      if (title.text.trim().length < 3 || minutes == null) {
        throw const FormatException('أدخل عنواناً صحيحاً ومدة صالحة.');
      }
      setState(() => _busy = true);
      await FirebaseFunctions.instance.httpsCallable('createRoomEvent').call({
        'roomId': widget.roomId,
        'title': title.text.trim(),
        'description': description.text.trim(),
        'eventType': eventType,
        'startsAtMs': startsAt.millisecondsSinceEpoch,
        'durationMinutes': minutes,
        'streamUrl': streamUrl.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إنشاء الحدث وجدولته.')),
      );
      _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إنشاء الحدث.')),
      );
    } on FormatException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } finally {
      title.dispose();
      description.dispose();
      streamUrl.dispose();
      duration.dispose();
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _rsvp(String eventId) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('rsvpRoomEvent').call({'eventId': eventId});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تسجيل حضورك في الحدث.')),
      );
      _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تسجيل الحضور.')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _setStatus(String eventId, String status) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('setRoomEventStatus').call({
        'eventId': eventId,
        'status': status,
      });
      if (!mounted) return;
      _refresh();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تحديث حالة الحدث.')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _openStream(String rawUrl) async {
    final uri = Uri.tryParse(rawUrl);
    if (uri == null || uri.scheme != 'https') return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Widget _eventCard(Map<String, dynamic> event) {
    final eventId = event['eventId'] as String? ?? '';
    final status = event['status'] as String? ?? 'scheduled';
    final type = event['eventType'] as String? ?? 'announcement';
    final startsAtMs = (event['startsAtMs'] as num?)?.toInt() ?? 0;
    final stream = event['streamUrl'] as String?;
    final isAttending = event['isAttending'] == true;
    final canManage = widget.canManageEvents && event['canManage'] == true;
    final startsAt = startsAtMs > 0
        ? DateTime.fromMillisecondsSinceEpoch(startsAtMs).toLocal().toString().split('.').first
        : 'موعد غير محدد';

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(event['title'] as String? ?? 'حدث مودة', style: Theme.of(context).textTheme.titleMedium)),
                Chip(label: Text(_statusLabel(status))),
              ],
            ),
            Text(_eventTypeLabel(type), style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: 6),
            Text(startsAt),
            if ((event['description'] as String? ?? '').isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(event['description'] as String),
              ),
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('الحضور المسجل: ${event['attendeeCount'] ?? 0}'),
            ),
            if (stream != null && stream.isNotEmpty)
              TextButton.icon(
                onPressed: () => _openStream(stream),
                icon: const Icon(Icons.open_in_new),
                label: const Text('فتح رابط البث الخارجي'),
              ),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                if (!isAttending && (status == 'scheduled' || status == 'live'))
                  FilledButton.tonal(
                    onPressed: _busy || eventId.isEmpty ? null : () => _rsvp(eventId),
                    child: const Text('تسجيل الحضور'),
                  ),
                if (canManage && status == 'scheduled')
                  OutlinedButton(
                    onPressed: _busy ? null : () => _setStatus(eventId, 'live'),
                    child: const Text('بدء الحدث'),
                  ),
                if (canManage && status == 'scheduled')
                  TextButton(
                    onPressed: _busy ? null : () => _setStatus(eventId, 'cancelled'),
                    child: const Text('إلغاء الحدث'),
                  ),
                if (canManage && status == 'live')
                  OutlinedButton(
                    onPressed: _busy ? null : () => _setStatus(eventId, 'completed'),
                    child: const Text('إنهاء الحدث'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('أحداث الغرفة'),
        actions: [
          IconButton(onPressed: _refresh, icon: const Icon(Icons.refresh)),
          if (widget.canManageEvents)
            IconButton(
              tooltip: 'إنشاء حدث',
              onPressed: _busy ? null : _createEvent,
              icon: const Icon(Icons.add_circle_outline),
            ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _eventsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('تعذر تحميل أحداث الغرفة.'),
                  TextButton(onPressed: _refresh, child: const Text('إعادة المحاولة')),
                ],
              ),
            );
          }
          final events = snapshot.data ?? const [];
          if (events.isEmpty) {
            return const Center(child: Text('لا توجد أحداث مجدولة لهذه الغرفة.'));
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.all(12),
              children: events.map(_eventCard).toList(),
            ),
          );
        },
      ),
    );
  }
}
