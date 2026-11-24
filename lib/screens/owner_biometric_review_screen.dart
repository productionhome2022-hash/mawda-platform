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

  Future<void> _load() async {
    if (_loading) return;
    setState(() { _loading = true; _error = null; });
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('listOwnerBiometricVerificationRequests').call();
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
          .httpsCallable('getOwnerBiometricEvidencePlayback')
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
    if (id == null || _decidingId != null) return;
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
        'decision': decision == 'accept' ? 'accepted' : 'rejected',
        'evidenceReviewed': true,
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

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('طلبات التوثيق البيومتري'),
        actions: [
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
