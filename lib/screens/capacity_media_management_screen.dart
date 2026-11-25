import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

/// Owner-only configuration surface for the observe-only media capacity policy.
/// Usage meters and billing are intentionally not fabricated or enabled here.
class CapacityMediaManagementScreen extends StatefulWidget {
  const CapacityMediaManagementScreen({super.key});

  @override
  State<CapacityMediaManagementScreen> createState() =>
      _CapacityMediaManagementScreenState();
}

class _CapacityMediaManagementScreenState
    extends State<CapacityMediaManagementScreen> {
  final _functions = FirebaseFunctions.instance;
  final _upload = TextEditingController();
  final _download = TextEditingController();
  final _storage = TextEditingController();
  final _processing = TextEditingController();

  bool _loading = false;
  bool _saving = false;
  int _version = 0;
  Map<String, dynamic> _measurement = const {};
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _upload.dispose();
    _download.dispose();
    _storage.dispose();
    _processing.dispose();
    super.dispose();
  }

  int? _readQuota(TextEditingController controller, String label) {
    final value = controller.text.trim();
    if (value.isEmpty) return null;
    final parsed = int.tryParse(value);
    if (parsed == null || parsed <= 0) {
      throw FormatException('قيمة $label يجب أن تكون عدداً صحيحاً موجباً أو تترك فارغة.');
    }
    return parsed;
  }

  void _applyPolicy(Map<String, dynamic> policy) {
    final quotas = Map<String, dynamic>.from(
      policy['monthlyMediaQuotas'] as Map? ?? const {},
    );
    _upload.text = quotas['uploadBytesPerMember']?.toString() ?? '';
    _download.text = quotas['downloadBytesPerMember']?.toString() ?? '';
    _storage.text = quotas['storageBytesPerMember']?.toString() ?? '';
    _processing.text = quotas['processingMinutesPerMember']?.toString() ?? '';
    _version = policy['version'] is num ? (policy['version'] as num).toInt() : 0;
  }

  Future<void> _load() async {
    if (_loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await _functions
          .httpsCallable('getOwnerCapacityMediaManagement')
          .call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final policy = Map<String, dynamic>.from(data['policy'] as Map? ?? const {});
      if (!mounted) return;
      setState(() {
        _applyPolicy(policy);
        _measurement = Map<String, dynamic>.from(
          data['measurement'] as Map? ?? const {},
        );
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل سياسة السعة والوسائط.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل سياسة السعة والوسائط.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    if (_saving) return;
    Map<String, dynamic> quotas;
    try {
      quotas = {
        'uploadBytesPerMember': _readQuota(_upload, 'الرفع'),
        'downloadBytesPerMember': _readQuota(_download, 'التنزيل'),
        'storageBytesPerMember': _readQuota(_storage, 'التخزين'),
        'processingMinutesPerMember': _readQuota(_processing, 'المعالجة'),
      };
    } on FormatException catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await _functions.httpsCallable('setOwnerCapacityMediaManagement').call({
        'monthlyMediaQuotas': quotas,
        'expectedVersion': _version,
      });
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('حُفظت إعدادات السياسة وسُجل إصدارها. ما زالت في وضع المراقبة فقط.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) {
        setState(() => _error = error.message ?? 'تعذر حفظ السياسة.');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.message ?? 'تعذر حفظ السياسة. حدّث البيانات ثم أعد المحاولة.')),
        );
      }
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر حفظ السياسة؛ لم يتم تأكيد نجاح العملية.');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _quotaField(
    TextEditingController controller, {
    required String label,
    required String unit,
    required String helper,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        decoration: InputDecoration(
          labelText: label,
          suffixText: unit,
          helperText: helper,
          border: const OutlineInputBorder(),
        ),
      ),
    );
  }

  String _measurementValue(String key, {String suffix = ''}) {
    final value = _measurement[key];
    if (value is num) return '${value.toString()}$suffix';
    return 'غير متاح — لم يُوصل القياس بعد';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة السعة وحصص الوسائط'),
        actions: [
          IconButton(
            tooltip: 'تحديث القياسات والسياسة',
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('حالة القياس والتكلفة', style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: 8),
                          const Text(
                            'عداد بايتات الملفات التي اكتمل رفعها موصول جزئياً ويُسجل إجمالي المنصة حسب شهر UTC. '
                            'هذا ليس قياساً لحركة الشبكة أو التخزين المحتفظ به أو التكلفة. '
                            'بقية المقاييس والفوترة غير موصولة، ولن نعرض أرقاماً تقديرية على أنها استهلاك حقيقي.',
                          ),
                          const SizedBox(height: 12),
                          _metric('شهر القياس UTC', _measurement['monthUtc']?.toString() ?? 'غير متاح'),
                          _metric('الأعضاء المتزامنون', _measurementValue('concurrentActiveMembers')),
                          _metric('شرائح السعة لكل 1000', _measurementValue('capacityTierCount')),
                          _metric('الملفات التي اكتمل رفعها', _measurementValue('finalizedUploadCount')),
                          _metric('إجمالي بايتات الرفع النهائي', _measurementValue('monthlyUploadBytes', suffix: ' bytes')),
                          _metric('التنزيل الشهري', _measurementValue('monthlyDownloadBytes', suffix: ' bytes')),
                          _metric('التخزين المحتفظ به', _measurementValue('retainedStorageBytes', suffix: ' bytes')),
                          _metric('المعالجة', _measurementValue('processingMinutes', suffix: ' دقيقة')),
                        ],
                      ),
                    ),
                  ),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('سياسة الحصص الشهرية', style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: 6),
                          Text('إصدار السياسة: $_version • وضع التنفيذ: مراقبة فقط'),
                          const SizedBox(height: 12),
                          _quotaField(_upload, label: 'رفع لكل عضو', unit: 'bytes', helper: 'اتركه فارغاً لعدم تحديد قيمة.'),
                          _quotaField(_download, label: 'تنزيل لكل عضو', unit: 'bytes', helper: 'اتركه فارغاً لعدم تحديد قيمة.'),
                          _quotaField(_storage, label: 'تخزين لكل عضو', unit: 'bytes', helper: 'اتركه فارغاً لعدم تحديد قيمة.'),
                          _quotaField(_processing, label: 'معالجة لكل عضو', unit: 'دقيقة', helper: 'اتركه فارغاً لعدم تحديد قيمة.'),
                          const Text(
                            'حفظ هذه القيم لا يفرض حصصاً على الأعضاء حالياً. لا توجد فوترة إنتاجية متصلة بهذه اللوحة.',
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton.icon(
                              onPressed: _saving ? null : _save,
                              icon: _saving
                                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                                  : const Icon(Icons.save_outlined),
                              label: const Text('حفظ إعدادات السياسة'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Card(
                    child: ListTile(
                      leading: Icon(Icons.shield_outlined),
                      title: Text('الخدمات الأساسية مستثناة'),
                      subtitle: Text('الرسائل والمصادقة والأمان والإشعارات الأساسية لا تتوقف بسبب حصص الوسائط.'),
                    ),
                  ),
                  if (_error != null)
                    Card(
                      color: Theme.of(context).colorScheme.errorContainer,
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(_error!),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _metric(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: Text(label)),
            const SizedBox(width: 12),
            Flexible(child: Text(value, textAlign: TextAlign.end)),
          ],
        ),
      );
}
