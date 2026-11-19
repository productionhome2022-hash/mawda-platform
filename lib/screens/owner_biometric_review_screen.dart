import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class OwnerBiometricReviewScreen extends StatefulWidget {
  const OwnerBiometricReviewScreen({super.key});

  @override
  State<OwnerBiometricReviewScreen> createState() => _OwnerBiometricReviewScreenState();
}

class _OwnerBiometricReviewScreenState extends State<OwnerBiometricReviewScreen> {
  List<Map<String, dynamic>> _requests = [];
  bool _loading = false;
  String? _error;
  String? _openingId;
  String? _decidingId;
  bool _savingSettings = false;

  Future<void> _load() async {
    if (_loading) return;
    setState(() { _loading = true; _error = null; });
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('getOwnerBiometricVerificationRequests').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      final requests = (data['requests'] as List<dynamic>? ?? const [])
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
      if (mounted) setState(() => _requests = requests);
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل الطلبات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل طلبات التوثيق البيومتري.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openEvidence(Map<String, dynamic> item, String kind) async {
    final id = item['requestId'] as String?;
    if (id == null || _openingId != null) return;
    setState(() => _openingId = id);
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('getOwnerBiometricVerificationMediaAccess')
          .call({'requestId': id});
      final data = Map<String, dynamic>.from(result.data as Map);
      final url = data[kind == 'audio' ? 'audioUrl' : 'videoUrl'] as String?;
      if (url == null || !await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication)) {
        throw Exception('MEDIA_OPEN_FAILED');
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر فتح الدليل. أعد تحميل الطلب وحاول مرة أخرى.')),
      );
    } finally {
      if (mounted) setState(() => _openingId = null);
    }
  }

  Future<void> _decide(Map<String, dynamic> item, String decision) async {
    final id = item['requestId'] as String?;
    final version = item['requestVersion'];
    if (id == null || version is! num || _decidingId != null) return;
    final reason = TextEditingController();
    final accepted = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(decision == 'accept' ? 'قبول التوثيق البيومتري' : 'رفض طلب التوثيق'),
        content: TextField(
          controller: reason,
          maxLines: 3,
          maxLength: 500,
          decoration: const InputDecoration(labelText: 'ملاحظة المراجعة (اختيارية)', border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('تأكيد القرار')),
        ],
      ),
    );
    final note = reason.text.trim();
    reason.dispose();
    if (accepted != true || !mounted) return;
    setState(() => _decidingId = id);
    try {
      await FirebaseFunctions.instance.httpsCallable('decideBiometricVerificationRequest').call({
        'requestId': id,
        'expectedVersion': version,
        'decision': decision,
        if (note.isNotEmpty) 'reason': note,
      });
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تسجيل القرار.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر تسجيل قرار المراجعة.')),
      );
    } finally {
      if (mounted) setState(() => _decidingId = null);
    }
  }

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _configureSettings() async {
    if (_savingSettings) return;
    Map<String, dynamic> settings = {};
    int version = 0;
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('getOwnerBiometricVerificationSettings').call();
      final data = Map<String, dynamic>.from(result.data as Map);
      if (data['configured'] == true && data['settings'] is Map) {
        settings = Map<String, dynamic>.from(data['settings'] as Map);
        version = (settings['version'] as num?)?.toInt() ?? 0;
      }
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تحميل إعدادات التوثيق.')),
      );
      return;
    }

    final audio = TextEditingController(text: settings['maxAudioBytes']?.toString() ?? '');
    final video = TextEditingController(text: settings['maxVideoBytes']?.toString() ?? '');
    final window = TextEditingController(text: settings['uploadWindowMinutes']?.toString() ?? '');
    final ttl = TextEditingController(text: settings['mediaAccessTtlSeconds']?.toString() ?? '');
    final existingPhrases = (settings['phrases'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    final phrase = TextEditingController(
      text: existingPhrases.map((item) => item['text']?.toString() ?? '').where((text) => text.isNotEmpty).join('\n'),
    );
    bool enabled = settings['enabled'] == true;
    final save = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('إعدادات التوثيق البيومتري'),
          content: SizedBox(
            width: 480,
            child: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: enabled,
                  onChanged: (value) => setDialogState(() => enabled = value),
                  title: const Text('السماح بتقديم طلبات جديدة'),
                ),
                TextField(controller: audio, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'الحد الأقصى للصوت بالبايت', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                TextField(controller: video, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'الحد الأقصى للفيديو بالبايت', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                TextField(controller: window, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'مهلة الرفع بالدقائق (5–60)', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                TextField(controller: ttl, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'صلاحية مشاهدة الأدلة بالثواني (60–600)', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                TextField(controller: phrase, minLines: 2, maxLines: 5,
                  decoration: const InputDecoration(labelText: 'عبارات التحقق (كل عبارة في سطر مستقل)', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                const Text('لا توجد قيم افتراضية مفروضة هنا. أدخل الحدود والعبارات التي تعتمدها قبل تفعيل استقبال الطلبات.',
                  style: TextStyle(fontSize: 12)),
              ]),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('حفظ الإعدادات')),
          ],
        ),
      ),
    );
    final audioValue = int.tryParse(audio.text.trim());
    final videoValue = int.tryParse(video.text.trim());
    final windowValue = int.tryParse(window.text.trim());
    final ttlValue = int.tryParse(ttl.text.trim());
    final phrases = phrase.text.split('\n').map((text) => text.trim()).where((text) => text.isNotEmpty).toList();
    audio.dispose(); video.dispose(); window.dispose(); ttl.dispose(); phrase.dispose();
    if (save != true || !mounted) return;
    if (audioValue == null || videoValue == null || windowValue == null || ttlValue == null ||
        phrases.isEmpty || phrases.any((text) => text.length < 8 || text.length > 180)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أدخل حدوداً رقمية صحيحة وعبارة واحدة على الأقل بطول 8–180 حرفاً.')),
      );
      return;
    }
    setState(() => _savingSettings = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('setOwnerBiometricVerificationSettings').call({
        'expectedVersion': version,
        'enabled': enabled,
        'maxAudioBytes': audioValue,
        'maxVideoBytes': videoValue,
        'uploadWindowMinutes': windowValue,
        'mediaAccessTtlSeconds': ttlValue,
        'phrases': [
          for (var i = 0; i < phrases.length; i++) {'id': 'owner_phrase_${i + 1}', 'text': phrases[i]},
        ],
      });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ إعدادات التوثيق البيومتري.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حفظ الإعدادات.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر حفظ إعدادات التوثيق.')),
      );
    } finally {
      if (mounted) setState(() => _savingSettings = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('طلبات التوثيق البيومتري'),
        actions: [
          IconButton(onPressed: _savingSettings ? null : _configureSettings, icon: const Icon(Icons.tune), tooltip: 'إعدادات التوثيق'),
          IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh), tooltip: 'تحديث'),
        ],
      ),
      body: _loading && _requests.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _requests.isEmpty
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
              : _requests.isEmpty
                  ? const Center(child: Text('لا توجد طلبات توثيق قيد المراجعة حالياً.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _requests.length,
                      itemBuilder: (context, index) {
                        final item = _requests[index];
                        final id = item['requestId'] as String? ?? '';
                        final busy = _openingId == id || _decidingId == id;
                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(item['fullName']?.toString() ?? 'اسم غير متاح', style: Theme.of(context).textTheme.titleMedium),
                              Text('@${item['username'] ?? ''} • ${item['gender'] ?? ''}'),
                              Text('UID: ${item['uid'] ?? ''}'),
                              Text('المحاولة: ${item['attemptNumber'] ?? '-'}'),
                              const SizedBox(height: 10),
                              Wrap(spacing: 8, runSpacing: 8, children: [
                                OutlinedButton.icon(onPressed: busy ? null : () => _openEvidence(item, 'audio'), icon: const Icon(Icons.volume_up_outlined), label: const Text('استماع للصوت')),
                                OutlinedButton.icon(onPressed: busy ? null : () => _openEvidence(item, 'video'), icon: const Icon(Icons.play_circle_outline), label: const Text('مشاهدة الفيديو')),
                              ]),
                              const SizedBox(height: 8),
                              Wrap(spacing: 8, children: [
                                FilledButton.icon(onPressed: busy ? null : () => _decide(item, 'accept'), icon: const Icon(Icons.check), label: const Text('قبول')),
                                OutlinedButton.icon(onPressed: busy ? null : () => _decide(item, 'reject'), icon: const Icon(Icons.close), label: const Text('رفض')),
                              ]),
                            ]),
                          ),
                        );
                      },
                    ),
    );
  }
}
