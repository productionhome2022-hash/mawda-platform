import 'dart:math';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';

class OwnerAdvertisingRewardsScreen extends StatefulWidget {
  const OwnerAdvertisingRewardsScreen({super.key});

  @override
  State<OwnerAdvertisingRewardsScreen> createState() => _OwnerAdvertisingRewardsScreenState();
}

class _OwnerAdvertisingRewardsScreenState extends State<OwnerAdvertisingRewardsScreen> {
  final _functions = FirebaseFunctions.instance;
  final _title = TextEditingController();
  final _sponsor = TextEditingController();
  final _body = TextEditingController();
  final _duration = TextEditingController(text: '30');
  final _reward = TextEditingController(text: '10');
  final _budget = TextEditingController(text: '1000');
  final _maxClaims = TextEditingController(text: '1');
  final _maxDailyClaims = TextEditingController();
  final _priorityOrder = TextEditingController(text: '0');
  String _adType = 'standard';
  String _geographicTarget = 'all_arab_countries';
  String _featuredPlacement = 'rotation';
  String? _editingCampaignId;
  int? _editingVersion;
  List<Map<String, dynamic>> _campaigns = [];
  List<Map<String, dynamic>> _approvedCreatives = [];
  String? _selectedMediaId;
  bool _uploadingCreative = false;
  bool _loading = true, _saving = false;
  bool _hourlyEnabled = false, _dailyEnabled = false, _weeklyEnabled = false;
  final _hourlyCoins = TextEditingController(text: '0');
  final _dailyCoins = TextEditingController(text: '0');
  final _weeklyCoins = TextEditingController(text: '0');
  int _policyVersion = 0;
  DateTime _startsAt = DateTime.now();
  DateTime _endsAt = DateTime.now().add(const Duration(days: 7));
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _title.dispose(); _sponsor.dispose(); _body.dispose();
    _duration.dispose(); _reward.dispose(); _budget.dispose(); _maxClaims.dispose();
    _maxDailyClaims.dispose();
    _priorityOrder.dispose();
    _hourlyCoins.dispose(); _dailyCoins.dispose(); _weeklyCoins.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        _functions.httpsCallable('getOwnerAttendanceRewardPolicy').call(),
        _functions.httpsCallable('getOwnerTimedAdCampaigns').call(),
        _functions.httpsCallable('listOwnerMediaAssets').call({'status': 'security_approved', 'uploaderType': 'all', 'limit': 50}),
      ]);
      final policyData = Map<String, dynamic>.from(results[0].data as Map);
      final policy = Map<String, dynamic>.from(policyData['policy'] as Map);
      final campaignsData = Map<String, dynamic>.from(results[1].data as Map);
      final mediaData = Map<String, dynamic>.from(results[2].data as Map);
      final campaigns = (campaignsData['campaigns'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
      final approvedCreatives = (mediaData['assets'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((item) => Map<String, dynamic>.from(item))
          .where((item) => item['mediaPurpose'] == 'advertisement' &&
              (item['mediaCategory'] == 'image' || item['mediaCategory'] == 'video'))
          .toList(growable: false);
      if (!mounted) return;
      setState(() {
        _policyVersion = (policyData['version'] as num?)?.toInt() ?? 0;
        _hourlyEnabled = (policy['hourly'] as Map?)?['enabled'] == true;
        _dailyEnabled = (policy['daily'] as Map?)?['enabled'] == true;
        _weeklyEnabled = (policy['weekly'] as Map?)?['enabled'] == true;
        _hourlyCoins.text = ((policy['hourly'] as Map?)?['amountCoins'] ?? 0).toString();
        _dailyCoins.text = ((policy['daily'] as Map?)?['amountCoins'] ?? 0).toString();
        _weeklyCoins.text = ((policy['weekly'] as Map?)?['amountCoins'] ?? 0).toString();
        _campaigns = campaigns;
        _approvedCreatives = approvedCreatives;
        if (_selectedMediaId != null && !approvedCreatives.any((item) => item['mediaId'] == _selectedMediaId)) {
          _selectedMediaId = null;
        }
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل إعدادات الإعلانات والمكافآت.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل إعدادات الإعلانات والمكافآت.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  int? _amount(TextEditingController controller) {
    final value = int.tryParse(controller.text.trim());
    return value != null && value >= 0 && value <= 100000 ? value : null;
  }

  Future<void> _saveAttendancePolicy() async {
    final hourly = _amount(_hourlyCoins), daily = _amount(_dailyCoins), weekly = _amount(_weeklyCoins);
    if (hourly == null || daily == null || weekly == null ||
        (_hourlyEnabled && hourly == 0) || (_dailyEnabled && daily == 0) ||
        (_weeklyEnabled && weekly == 0)) {
      setState(() => _error = 'أدخل مبالغ صحيحة، ويجب أن تكون المكافأة أكبر من صفر عند التفعيل.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('setAttendanceRewardPolicy').call({
        'policy': {
          'hourly': {'enabled': _hourlyEnabled, 'amountCoins': hourly},
          'daily': {'enabled': _dailyEnabled, 'amountCoins': daily},
          'weekly': {'enabled': _weeklyEnabled, 'amountCoins': weekly},
        },
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      setState(() => _policyVersion = (data['version'] as num?)?.toInt() ?? _policyVersion);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ سياسة الحضور، الإصدار $_policyVersion.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر حفظ سياسة الحضور.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _uploadCreative() async {
    if (_uploadingCreative || _saving) return;
    setState(() { _uploadingCreative = true; _error = null; });
    try {
      final picked = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4'],
        withData: true,
      );
      if (picked == null || picked.files.isEmpty) return;
      final file = picked.files.single;
      final bytes = file.bytes;
      if (bytes == null || bytes.isEmpty) throw StateError('تعذر قراءة محتوى الملف المحدد.');
      final extension = (file.extension ?? '').toLowerCase();
      final contentType = switch (extension) {
        'jpg' || 'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        'mp4' => 'video/mp4',
        _ => '',
      };
      if (contentType.isEmpty) throw StateError('صيغة الملف غير مدعومة.');
      final maximumBytes = contentType.startsWith('video/')
          ? 100 * 1024 * 1024
          : 5 * 1024 * 1024;
      if (bytes.length > maximumBytes) {
        throw StateError('حجم الملف يتجاوز الحد المسموح لهذا النوع.');
      }
      final intentResponse = await _functions.httpsCallable('createMediaUploadIntent').call({
        'originalName': file.name,
        'contentType': contentType,
        'sizeBytes': bytes.length,
        'purpose': 'advertisement',
      });
      final intent = Map<String, dynamic>.from(intentResponse.data as Map);
      final headers = Map<String, dynamic>.from(intent['requiredHeaders'] as Map)
          .map((key, value) => MapEntry(key, value.toString()));
      final upload = await http.put(Uri.parse(intent['uploadUrl'] as String),
        headers: headers, body: bytes);
      if (upload.statusCode < 200 || upload.statusCode >= 300) {
        throw StateError('تعذر رفع الملف إلى منطقة الفحص الآمن (HTTP ${upload.statusCode}).');
      }
      await _functions.httpsCallable('finalizeMediaUpload').call({'mediaId': intent['mediaId']});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('تم رفع المادة إلى الحجر الأمني. ستظهر للاختيار بعد اجتياز الفحص والمعالجة.'),
      ));
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر رفع مادة الإعلان.');
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('Bad state: ', ''));
    } finally {
      if (mounted) setState(() => _uploadingCreative = false);
    }
  }

  Future<void> _createCampaign() async {
    final duration = int.tryParse(_duration.text.trim());
    final reward = int.tryParse(_reward.text.trim());
    final budget = int.tryParse(_budget.text.trim());
    final maxClaims = int.tryParse(_maxClaims.text.trim());
    final maxDailyClaims = int.tryParse(_maxDailyClaims.text.trim());
    final priorityOrder = int.tryParse(_priorityOrder.text.trim());
    if (_title.text.trim().length < 3 || _sponsor.text.trim().length < 2 ||
        _body.text.trim().length < 10 || duration == null || reward == null ||
        budget == null || duration < 15 || duration > 900 || reward < 0 ||
        budget < reward || budget > 100000000 || maxClaims == null || maxClaims < 1 || maxClaims > 100 ||
        (_adType == 'featured' && (maxDailyClaims == null || maxDailyClaims < 1 || maxDailyClaims > 10)) ||
        (_adType == 'standard' && _geographicTarget.isEmpty) ||
        priorityOrder == null || priorityOrder < 0 ||
        !_endsAt.isAfter(_startsAt)) {
      setState(() => _error = 'راجع عنوان الحملة والمعلن والنص والمدة والمكافأة والميزانية والتواريخ.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final response = await _functions.httpsCallable('setTimedAdCampaign').call({
        'title': _title.text.trim(),
        'sponsorLabel': _sponsor.text.trim(),
        'body': _body.text.trim(),
        'placement': _adType == 'featured' ? 'home' : 'reward_center',
        'adType': _adType,
        'geographicTargets': _adType == 'featured' ? <String>[] : <String>[_geographicTarget],
        'featuredPlacement': _featuredPlacement,
        'priorityOrder': _adType == 'featured' ? priorityOrder : 0,
        if (_adType == 'featured') 'maxDailyClaimsPerMember': maxDailyClaims,
        if (_editingCampaignId != null) 'campaignId': _editingCampaignId,
        if (_editingCampaignId != null) 'expectedVersion': _editingVersion,
        'durationSeconds': duration,
        'rewardCoins': reward,
        'startsAtMs': _startsAt.millisecondsSinceEpoch,
        'endsAtMs': _endsAt.millisecondsSinceEpoch,
        'maxClaimsPerMember': maxClaims,
        'rewardBudgetCoins': budget,
        if (_selectedMediaId != null) 'mediaId': _selectedMediaId,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (!mounted) return;
      _title.clear(); _sponsor.clear(); _body.clear();
      _selectedMediaId = null;
      _editingCampaignId = null;
      _editingVersion = null;
      _maxClaims.text = '1';
      _maxDailyClaims.clear();
      _adType = 'standard';
      _geographicTarget = 'all_arab_countries';
      _featuredPlacement = 'rotation';
      _priorityOrder.text = '0';
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تم حفظ الحملة ${data['campaignId']} بالحالة ${data['status'] ?? 'مسودة'}.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر إنشاء الحملة.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _editCampaign(Map<String, dynamic> campaign) {
    if (!['draft', 'paused'].contains(campaign['status'])) return;
    setState(() {
      _editingCampaignId = campaign['campaignId'] as String?;
      _editingVersion = (campaign['version'] as num?)?.toInt();
      _title.text = campaign['title'] as String? ?? '';
      _sponsor.text = campaign['sponsorLabel'] as String? ?? '';
      _body.text = campaign['body'] as String? ?? '';
      _duration.text = (campaign['durationSeconds'] ?? 30).toString();
      _reward.text = (campaign['rewardCoins'] ?? 0).toString();
      _budget.text = (campaign['rewardBudgetCoins'] ?? 0).toString();
      _maxClaims.text = (campaign['maxClaimsPerMember'] ?? 1).toString();
      _adType = campaign['adType'] == 'featured' ? 'featured' : 'standard';
      _priorityOrder.text = (campaign['priorityOrder'] ?? 0).toString();
      final targets = campaign['geographicTargets'];
      _geographicTarget = targets is List && targets.isNotEmpty ? targets.first.toString() : 'all_arab_countries';
      _featuredPlacement = campaign['featuredPlacement'] == 'priority' ? 'priority' : 'rotation';
      _maxDailyClaims.text = (campaign['maxDailyClaimsPerMember'] ?? '').toString();
      _selectedMediaId = campaign['mediaId'] as String?;
      final starts = campaign['startsAtMs'];
      final ends = campaign['endsAtMs'];
      if (starts is num) _startsAt = DateTime.fromMillisecondsSinceEpoch(starts.toInt());
      if (ends is num) _endsAt = DateTime.fromMillisecondsSinceEpoch(ends.toInt());
      _error = null;
    });
  }

  Future<void> _changeStatus(String campaignId, String status) async {
    setState(() { _saving = true; _error = null; });
    try {
      await _functions.httpsCallable('setTimedAdCampaignStatus').call({
        'campaignId': campaignId, 'status': status,
      });
      if (!mounted) return;
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحديث حالة الحملة.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _showCampaignReport(String campaignId) async {
    try {
      final response = await _functions.httpsCallable('getOwnerTimedAdCampaignReport').call({
        'campaignId': campaignId,
      });
      final report = Map<String, dynamic>.from(response.data as Map);
      final counts = Map<String, dynamic>.from(report['sessionCounts'] as Map? ?? const {});
      final financial = report['financialSnapshot'] as Map?;
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('تقرير الحملة وأرشيفها'),
          content: SizedBox(
            width: 520,
            child: ListView(
              shrinkWrap: true,
              children: [
                Text('الحملة: ${(report['campaign'] as Map?)?['title'] ?? campaignId}'),
                Text('الإصدارات المؤرشفة: ${report['versionCount'] ?? 0}'),
                Text('جلسات مكتملة: ${counts['completed'] ?? 0}'),
                Text('جلسات ملغاة: ${counts['cancelled'] ?? 0}'),
                Text('جلسات منتهية: ${counts['expired'] ?? 0}'),
                Text('جلسات نشطة: ${counts['active'] ?? 0}'),
                Text('مجموع مكافآت الكوينز: ${report['totalRewardCoins'] ?? 0}'),
                Text('حالة الدفع: ${financial?['paymentStatus'] ?? 'غير مسجل'}'),
                Text('حالة المراجعة المالية: ${financial?['reviewStatus'] ?? 'غير مسجل'}'),
                const SizedBox(height: 8),
                Text('أحداث مالية محفوظة: ${(report['financialEvents'] as List? ?? const []).length}'),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إغلاق')),
          ],
        ),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل تقرير الحملة.');
    }
  }

  Future<void> _recordFinancialAction(String campaignId, String action) async {
    final amount = TextEditingController();
    final currency = TextEditingController();
    final external = TextEditingController();
    final evidence = TextEditingController();
    final note = TextEditingController(text: 'مراجعة مالية للحملة من المالك');
    final isReview = action == 'review_completed';
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(switch (action) {
          'payment_received' => 'تسجيل قبض المعلن',
          'refund_recorded' => 'تسجيل استرداد',
          'settlement_reconciled' => 'تسوية المبلغ',
          _ => 'مراجعة السجل المالي',
        }),
        content: SizedBox(
          width: 480,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!isReview) ...[
                  TextField(controller: amount, keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'المبلغ بأصغر وحدة للعملة')),
                  TextField(controller: currency, textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(labelText: 'رمز العملة ISO-4217 (ثلاثة أحرف)')),
                ],
                TextField(controller: external,
                  decoration: const InputDecoration(labelText: 'المرجع الخارجي / رقم المستند')),
                if (action == 'payment_received' || action == 'refund_recorded')
                  TextField(controller: evidence,
                    decoration: const InputDecoration(labelText: 'مرجع الدليل المالي')),
                TextField(controller: note, minLines: 2, maxLines: 4,
                  decoration: const InputDecoration(labelText: 'ملاحظة التدقيق')),
                if (isReview)
                  const Text('سيتم تسجيل قرار مراجعة معتمد، ولا يُنشئ ذلك قبضاً أو تسوية مالية.'),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('تسجيل الحدث')),
        ],
      ),
    );
    if (confirmed != true) {
      amount.dispose(); currency.dispose(); external.dispose(); evidence.dispose(); note.dispose();
      return;
    }
    final amountMinor = isReview ? null : int.tryParse(amount.text.trim());
    final currencyCode = isReview ? null : currency.text.trim().toUpperCase();
    if ((!isReview && (amountMinor == null || amountMinor < 1 ||
          currencyCode == null || currencyCode.length != 3 || !RegExp(r'^[A-Z]{3}').hasMatch(currencyCode))) ||
        external.text.trim().length < 3 || note.text.trim().length < 5 ||
        ((action == 'payment_received' || action == 'refund_recorded') && evidence.text.trim().length < 3)) {
      setState(() => _error = 'بيانات الحدث المالي غير مكتملة أو غير صالحة.');
      amount.dispose(); currency.dispose(); external.dispose(); evidence.dispose(); note.dispose();
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final suffix = DateTime.now().microsecondsSinceEpoch.toString() + '_' +
          Random.secure().nextInt(1 << 32).toString();
      await _functions.httpsCallable('recordFeaturedAdFinancialEvent').call({
        'campaignId': campaignId,
        'action': action,
        'idempotencyKey': 'owner_finance_' + suffix,
        'amountMinor': amountMinor,
        'currency': currencyCode,
        'externalReference': external.text.trim(),
        'evidenceReference': evidence.text.trim().isEmpty ? null : evidence.text.trim(),
        'note': note.text.trim(),
        'reviewOutcome': isReview ? 'approved' : null,
      });
      await _load();
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تسجيل الحدث المالي.');
    } finally {
      amount.dispose(); currency.dispose(); external.dispose(); evidence.dispose(); note.dispose();
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<DateTime?> _pickDate(DateTime initial) async {
    final date = await showDatePicker(
      context: context, initialDate: initial,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null) return null;
    return DateTime(date.year, date.month, date.day, 12);
  }
  Widget _coinField(String label, TextEditingController controller) => SizedBox(
    width: 110,
    child: TextField(
      controller: controller,
      enabled: !_saving,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(labelText: label, suffixText: 'كوين'),
    ),
  );

  String _statusLabel(Object? status) {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'published': return 'منشورة';
      case 'paused': return 'متوقفة مؤقتاً';
      case 'archived': return 'مؤرشفة';
      default: return 'حالة غير معروفة';
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('إعلانات مودة ومكافآت الأعضاء'),
      actions: [IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh))],
    ),
    body: _loading ? const Center(child: CircularProgressIndicator()) : ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_error != null) Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ),
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('مكافآت الحضور • إصدار السياسة $_policyVersion',
              style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const Text('المبالغ تُحفظ على الخادم، وتُمنح مرة واحدة لكل عضو ولكل فترة UTC. القيم الافتراضية متوقفة وصفرية.'),
            SwitchListTile(
              contentPadding: EdgeInsets.zero, title: const Text('تفعيل مكافأة الحضور الساعي'),
              value: _hourlyEnabled, onChanged: _saving ? null : (v) => setState(() => _hourlyEnabled = v)),
            _coinField('مبلغ الساعة', _hourlyCoins),
            SwitchListTile(
              contentPadding: EdgeInsets.zero, title: const Text('تفعيل مكافأة الحضور اليومي'),
              value: _dailyEnabled, onChanged: _saving ? null : (v) => setState(() => _dailyEnabled = v)),
            _coinField('مبلغ اليوم', _dailyCoins),
            SwitchListTile(
              contentPadding: EdgeInsets.zero, title: const Text('تفعيل مكافأة الحضور الأسبوعي'),
              value: _weeklyEnabled, onChanged: _saving ? null : (v) => setState(() => _weeklyEnabled = v)),
            _coinField('مبلغ الأسبوع', _weeklyCoins),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _saving ? null : _saveAttendancePolicy,
              icon: const Icon(Icons.save_outlined), label: const Text('حفظ سياسة المكافآت')),
          ],
        ))),
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_editingCampaignId == null ? 'إنشاء إعلان من المالك' : 'تعديل الحملة ${_editingCampaignId}',
              style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const Text('يمكن للمالك رفع الصور وGIF والفيديو إلى مسار الحجر والفحص الأمني، ولا تُقبل المادة للحملة قبل اعتماد النسخة الآمنة. حملات الفيديو تبقى مسودات حتى يكتمل مشغل الفيديو واختبارات الأجهزة. الإعلانات المميزة تستخدم موضع الرئيسية دون استهداف جغرافي وتتطلب تسوية مالية من السجل المركزي.'),
            const SizedBox(height: 12),
            TextField(controller: _title, enabled: !_saving, decoration: const InputDecoration(labelText: 'عنوان الحملة')),
            TextField(controller: _sponsor, enabled: !_saving, decoration: const InputDecoration(labelText: 'اسم المعلن / الراعي')),
            TextField(controller: _body, enabled: !_saving, minLines: 3, maxLines: 5,
              decoration: const InputDecoration(labelText: 'نص الإعلان')),
            OutlinedButton.icon(
              onPressed: _saving || _uploadingCreative ? null : _uploadCreative,
              icon: _uploadingCreative
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.perm_media_outlined),
              label: const Text('رفع صورة أو GIF أو فيديو وفحصه أمنياً'),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: _selectedMediaId,
              decoration: const InputDecoration(labelText: 'المادة المعتمدة للحملة (اختياري)', border: OutlineInputBorder()),
              items: [
                const DropdownMenuItem<String>(value: null, child: Text('إعلان نصي فقط')),
                ..._approvedCreatives.map((item) => DropdownMenuItem<String>(
                  value: item['mediaId'] as String,
                  child: Text('${item['originalName'] ?? item['mediaId']} • ${item['mediaCategory']}'),
                )),
              ],
              onChanged: _saving ? null : (value) => setState(() => _selectedMediaId = value),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: _adType,
              decoration: const InputDecoration(labelText: 'نوع الإعلان', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'standard', child: Text('إعلان تجاري عادي')),
                DropdownMenuItem(value: 'featured', child: Text('إعلان تجاري مميز')),
              ],
              onChanged: _saving ? null : (value) => setState(() {
                _adType = value ?? 'standard';
              }),
            ),
            if (_adType == 'standard')
              DropdownButtonFormField<String>(
                initialValue: _geographicTarget,
                decoration: const InputDecoration(labelText: 'استهداف جغرافي', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'all_arab_countries', child: Text('جميع البلدان العربية')),
                  DropdownMenuItem(value: 'syria', child: Text('سوريا')),
                  DropdownMenuItem(value: 'lebanon_palestine', child: Text('لبنان وفلسطين')),
                  DropdownMenuItem(value: 'iraq_jordan', child: Text('العراق والأردن')),
                  DropdownMenuItem(value: 'gcc', child: Text('دول مجلس التعاون الخليجي')),
                  DropdownMenuItem(value: 'egypt', child: Text('مصر')),
                  DropdownMenuItem(value: 'tunisia_libya_sudan', child: Text('تونس وليبيا والسودان')),
                  DropdownMenuItem(value: 'algeria_morocco', child: Text('الجزائر والمغرب')),
                  DropdownMenuItem(value: 'europe_turkey', child: Text('أوروبا وتركيا')),
                  DropdownMenuItem(value: 'asia_middle_east', child: Text('آسيا والشرق الأوسط')),
                ],
                onChanged: _saving ? null : (value) => setState(() => _geographicTarget = value ?? _geographicTarget),
              ),
            if (_adType == 'featured') ...[
              DropdownButtonFormField<String>(
                initialValue: _featuredPlacement,
                decoration: const InputDecoration(labelText: 'ترتيب العرض المميز', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'rotation', child: Text('تدوير متنوع')),
                  DropdownMenuItem(value: 'priority', child: Text('أولوية المالك')),
                ],
                onChanged: _saving ? null : (value) => setState(() => _featuredPlacement = value ?? 'rotation'),
              ),
              if (_featuredPlacement == 'priority')
                TextField(
                  controller: _priorityOrder,
                  enabled: !_saving,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'ترتيب الأولوية (الأقل أولاً)'),
                ),
              TextField(
                controller: _maxDailyClaims,
                enabled: !_saving,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'الحد اليومي لكل عضو/إعلان (1–10)'),
              ),
              const Text('الإعلانات المميزة لا تستخدم استهدافاً جغرافياً. الحد الأعلى 10، والمالك يحدد الحد الفعلي.'),
            ],
            const SizedBox(height: 8),
            Wrap(spacing: 12, runSpacing: 8, children: [
              SizedBox(width: 120, child: TextField(controller: _maxClaims, enabled: !_saving,
                keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'مرات/عضو'))),

              SizedBox(width: 110, child: TextField(controller: _duration, enabled: !_saving,
                keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'المدة (ثانية)'))),
              _coinField('المكافأة', _reward),
              _coinField('الميزانية', _budget),
            ]),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('بداية الحملة'),
              subtitle: Text(_startsAt.toLocal().toString()),
              trailing: const Icon(Icons.calendar_month),
              onTap: _saving ? null : () async {
                final value = await _pickDate(_startsAt);
                if (value != null) setState(() => _startsAt = value);
              },
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('نهاية الحملة'),
              subtitle: Text(_endsAt.toLocal().toString()),
              trailing: const Icon(Icons.event_available),
              onTap: _saving ? null : () async {
                final value = await _pickDate(_endsAt);
                if (value != null) setState(() => _endsAt = value);
              },
            ),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: _saving ? null : _createCampaign,
              icon: const Icon(Icons.add_circle_outline), label: const Text('حفظ الحملة كمسودة')),
          ],
        ))),
        Text('الحملات المسجلة', style: Theme.of(context).textTheme.titleLarge),
        if (_campaigns.isEmpty) const Card(child: Padding(
          padding: EdgeInsets.all(16), child: Text('لا توجد حملات بعد.'))),
        ..._campaigns.map((campaign) {
          final id = campaign['campaignId'] as String? ?? '';
          final status = campaign['status'];
          return Card(child: ListTile(
            title: Text(campaign['title'] as String? ?? id),
            subtitle: Text('${campaign['adType'] == 'featured' ? 'مميز' : 'عادي'} • ${_statusLabel(status)} • ${campaign['rewardCoins'] ?? 0} كوين • مستخدم ${campaign['spentRewardCoins'] ?? 0} • محجوز ${campaign['reservedRewardCoins'] ?? 0} • الميزانية ${campaign['rewardBudgetCoins'] ?? 0} • الدفع: ${(campaign['financialSnapshot'] as Map?)?['paymentStatus'] ?? 'غير مسجل'} • المراجعة: ${(campaign['financialSnapshot'] as Map?)?['reviewStatus'] ?? 'غير مسجل'}'),
            isThreeLine: true,
            trailing: PopupMenuButton<String>(
              enabled: !_saving && status != 'archived',
              onSelected: (value) {
                if (value == 'edit') {
                  _editCampaign(campaign);
                } else if (value == 'report') {
                  _showCampaignReport(id);
                } else if (['payment_received', 'settlement_reconciled', 'review_completed', 'refund_recorded'].contains(value)) {
                  _recordFinancialAction(id, value);
                } else {
                  _changeStatus(id, value);
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'report', child: Text('التقرير والأرشيف')),
                if (campaign['adType'] == 'featured') ...[
                  const PopupMenuItem(value: 'payment_received', child: Text('تسجيل قبض المعلن')),
                  const PopupMenuItem(value: 'settlement_reconciled', child: Text('تسوية مالية')),
                  const PopupMenuItem(value: 'review_completed', child: Text('اعتماد المراجعة المالية')),
                  const PopupMenuItem(value: 'refund_recorded', child: Text('تسجيل استرداد')),
                ],
                if (status == 'draft' || status == 'paused')
                  const PopupMenuItem(value: 'edit', child: Text('تعديل')),
                if (status != 'published') const PopupMenuItem(value: 'published', child: Text('نشر')),
                if (status == 'published') const PopupMenuItem(value: 'paused', child: Text('إيقاف مؤقت')),
                if (status != 'archived') const PopupMenuItem(value: 'archived', child: Text('أرشفة')),
              ],
            ),
          ));
        }),
      ],
    ),
  );
}
