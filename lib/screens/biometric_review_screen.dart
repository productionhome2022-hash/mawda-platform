import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/member_media_upload_service.dart';

class BiometricReviewScreen extends StatefulWidget {
  const BiometricReviewScreen({super.key});

  @override
  State<BiometricReviewScreen> createState() => _BiometricReviewScreenState();
}

class _BiometricReviewScreenState extends State<BiometricReviewScreen> {
  final MemberMediaUploadService _service = MemberMediaUploadService();
  List<Map<String, dynamic>> _requests = [];
  final Map<String, Map<String, dynamic>> _playback = {};
  final Set<String> _reviewed = {};
  final Set<String> _openedAudio = {};
  final Set<String> _openedVideo = {};
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _service.close();
    super.dispose();
  }

  Future<void> _load() async {
    if (_loading) return;
    setState(() { _loading = true; _error = null; });
    try {
      final rows = await _service.listOwnerBiometricVerificationRequests();
      if (mounted) setState(() { _requests = rows; _playback.clear(); _reviewed.clear(); _openedAudio.clear(); _openedVideo.clear(); });
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openEvidence(String requestId, String kind) async {
    try {
      var links = _playback[requestId];
      if (links == null) {
        links = await _service.getOwnerBiometricEvidencePlayback(requestId: requestId);
        if (!mounted) return;
        setState(() => _playback[requestId] = links!);
      }
      final raw = links[kind == 'audio' ? 'audioUrl' : 'videoUrl'];
      if (raw is! String || raw.isEmpty) throw StateError('رابط الدليل الآمن غير متاح.');
      final opened = await launchUrl(Uri.parse(raw), mode: LaunchMode.externalApplication);
      if (!opened) throw StateError('تعذر فتح الدليل في مشغل الجهاز.');
      if (mounted) setState(() { if (kind == 'audio') { _openedAudio.add(requestId); } else { _openedVideo.add(requestId); } });
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    }
  }

  String _genderLabel(Object? value) {
    switch (value) {
      case 'male': return 'ذكر';
      case 'female': return 'أنثى';
      default: return 'غير محدد';
    }
  }

  Future<void> _decide(String requestId, bool accepted) async {
    if (!_reviewed.contains(requestId) || !_openedAudio.contains(requestId) || !_openedVideo.contains(requestId)) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(accepted ? 'قبول التوثيق البيومتري؟' : 'رفض طلب التوثيق؟'),
        content: Text(accepted
            ? 'ستُفعّل حالة التوثيق ويُضاف 1,500 BetaCoins إلى محفظة العضو بمعاملة خادمية واحدة.'
            : 'لن تُمنح مكافأة. تُسجل المحاولة ويُطبق انتظار شهر تقويمي قبل المحاولة التالية.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('تأكيد القرار')),
        ],
      ),
    );
    if (confirm != true) return;
    setState(() { _loading = true; _error = null; });
    try {
      final result = await _service.decideBiometricVerificationRequest(requestId: requestId, accepted: accepted);
      if (!mounted) return;
      setState(() { _loading = false; });
      await _load();
      if (!mounted) return;
      final reward = result['rewardCoins'] ?? 0;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(accepted ? 'تم القبول وإيداع $reward BetaCoins.' : 'تم تسجيل الرفض دون مكافأة.')),
      );
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('مراجعة التوثيق البيومتري'),
        actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
      ),
      body: _loading && _requests.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Card(child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('هذه المراجعة حصرية للمالك الأعلى (Super Owner). افتح واستمع إلى الصوت وشاهد الفيديو بنفسك قبل القرار. القبول وحده يمنح 1,500 BetaCoins. يتطلب الخادم مطالبة المالك وجلسة MFA حديثة ويثبت القرار والمكافأة في سجل تدقيق ومعاملة ذرية.'),
                )),
                if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                if (_requests.isEmpty && !_loading) const Center(child: Padding(
                  padding: EdgeInsets.all(24), child: Text('لا توجد طلبات بانتظار المراجعة.'),
                )),
                for (final item in _requests) _requestCard(item),
              ],
            ),
    );
  }

  Widget _requestCard(Map<String, dynamic> item) {
    final id = item['requestId'] as String? ?? '';
    final reviewed = _reviewed.contains(id);
    return Card(
      margin: const EdgeInsets.only(top: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(item['fullName'] as String? ?? 'عضو', style: Theme.of(context).textTheme.titleMedium),
          Text('اسم المستخدم: @${item['username'] ?? '—'} • الجنس المسجل: ${_genderLabel(item['gender'])}'),
          Text('رقم المحاولة: ${item['attemptNumber'] ?? '—'}'),
          const SizedBox(height: 8),
          const Text('العبارة الصوتية المطلوبة: أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.'),
          const SizedBox(height: 8),
          Wrap(spacing: 8, children: [
            OutlinedButton.icon(onPressed: _loading ? null : () => _openEvidence(id, 'audio'),
              icon: const Icon(Icons.volume_up), label: const Text('فتح الصوت الآمن')),
            OutlinedButton.icon(onPressed: _loading ? null : () => _openEvidence(id, 'video'),
              icon: const Icon(Icons.video_camera_back), label: const Text('فتح الفيديو الآمن')),
          ]),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: reviewed,
            onChanged: _playback.containsKey(id) && _openedAudio.contains(id) && _openedVideo.contains(id) && !_loading
                ? (value) => setState(() { if (value == true) { _reviewed.add(id); } else { _reviewed.remove(id); } })
                : null,
            title: const Text('أؤكد أنني راجعت الدليلين بنفسي واتخذت القرار بعد المراجعة.'),
            controlAffinity: ListTileControlAffinity.leading,
          ),
          Wrap(spacing: 8, children: [
            FilledButton.icon(
              onPressed: _loading || !reviewed ? null : () => _decide(id, true),
              icon: const Icon(Icons.check_circle_outline), label: const Text('قبول + 1,500 BetaCoins'),
            ),
            OutlinedButton.icon(
              onPressed: _loading || !reviewed ? null : () => _decide(id, false),
              icon: const Icon(Icons.cancel_outlined), label: const Text('رفض دون مكافأة'),
            ),
          ]),
        ]),
      ),
    );
  }
}
