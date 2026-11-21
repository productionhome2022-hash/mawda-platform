import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class ProductionApplicationScreen extends StatefulWidget {
  const ProductionApplicationScreen({super.key});

  @override
  State<ProductionApplicationScreen> createState() => _ProductionApplicationScreenState();
}

class _ProductionApplicationScreenState extends State<ProductionApplicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _experience = TextEditingController();
  final _tools = TextEditingController();
  final _projects = TextEditingController();
  final _companies = TextEditingController();
  final _achievements = TextEditingController();
  final _cv = TextEditingController();
  final _portfolio = TextEditingController();
  final _role = TextEditingController();
  final _interview = TextEditingController();
  final _specialties = <String, String>{
    'ad_designer': 'مصمم إعلانات',
    'graphic_designer': 'مصمم جرافيك',
    'video_editor': 'محرر فيديو ومونتير',
    'photographer': 'مصور فوتوغرافي',
    'videographer': 'مصور فيديو',
    'advertising_copywriter': 'كاتب محتوى إعلاني',
    'voice_over': 'متخصص تعليق صوتي',
    'motion_designer': 'مصمم موشن جرافيك',
    'creative_director': 'مخرج إبداعي',
    'production_coordinator': 'منسق إنتاج إعلاني',
  };
  final Set<String> _selected = {};
  String _track = 'production_member';
  bool _trialConsent = false;
  bool _rightsConfirmed = false;
  bool _busy = false;
  String? _error;
  String? _applicationId;
  String? _idempotencyKey;

  @override
  void dispose() {
    for (final c in [_name,_experience,_tools,_projects,_companies,_achievements,_cv,_portfolio,_role,_interview]) {
      c.dispose();
    }
    super.dispose();
  }

  String? _required(String? value) => value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب.' : null;

  Future<void> _submit() async {
    if (_busy || !_formKey.currentState!.validate()) return;
    if (_selected.isEmpty) {
      setState(() => _error = 'اختر تخصصاً واحداً على الأقل.');
      return;
    }
    if (!_rightsConfirmed) {
      setState(() => _error = 'يرجى تأكيد صحة البيانات وحقوق عرض الأعمال المقدمة.');
      return;
    }
    setState(() { _busy = true; _error = null; });
    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
    try {
      final portfolios = _portfolio.text.split(RegExp(r'[\n,;]+'))
          .map((v) => v.trim()).where((v) => v.isNotEmpty).toList();
      final response = await FirebaseFunctions.instance
          .httpsCallable('submitProductionApplication').call({
        'applicantName': _name.text.trim(),
        'requestedTrack': _track,
        'specialties': _selected.toList()..sort(),
        'experience': _experience.text.trim(),
        'tools': _tools.text.trim(),
        'previousProjects': _projects.text.trim(),
        'collaboratingCompanies': _companies.text.trim().isEmpty ? null : _companies.text.trim(),
        'achievements': _achievements.text.trim().isEmpty ? null : _achievements.text.trim(),
        'cvUrl': _cv.text.trim().isEmpty ? null : _cv.text.trim(),
        'portfolioUrls': portfolios,
        'roleDescription': _role.text.trim(),
        'interviewAnswers': _interview.text.trim(),
        'creativeTrialConsent': _trialConsent,
        'rightsConfirmed': _rightsConfirmed,
        'idempotencyKey': _idempotencyKey,
      });
      final data = Map<String, dynamic>.from(response.data as Map);
      if (mounted) setState(() => _applicationId = data['applicationId'] as String?);
    } on FirebaseFunctionsException catch (e) {
      if (mounted) setState(() => _error = e.message ?? 'تعذر إرسال الطلب.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر إرسال الطلب. تحقق من الاتصال وحاول مجدداً.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!kIsWeb) {
      return Scaffold(
        appBar: AppBar(title: const Text('صُنّاع مودة')),
        body: const Center(child: Padding(
          padding: EdgeInsets.all(24),
          child: Text('التسجيل المهني ومراسلاته واتفاقياته تتم حصراً عبر موقع Mawdda أو تطبيق سطح المكتب المعتمد للويب.'),
        )),
      );
    }
    if (_applicationId != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('طلب الانضمام إلى صُنّاع مودة')),
        body: Center(child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.check_circle_outline, size: 56),
            const Text('تم استلام طلبك للمراجعة. هذا لا يمنح عضوية أو صلاحية إشراف أو إنشاء غرف.'),
            const SizedBox(height: 8),
            SelectableText('رقم الطلب: $_applicationId'),
          ]),
        )),
      );
    }
    return Scaffold(
      appBar: AppBar(title: const Text('انضم إلى صُنّاع مودة')),
      body: Form(
        key: _formKey,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          const Text('صُنّاع مودة للإنتاج المرئي والإعلاني', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text('املأ ملفك المهني. الترشيح للإشراف لا يمنح صلاحيات تلقائية، ولا تُنشأ غرف قبل موافقة المالك ومنح الصلاحية صراحة.'),
          const SizedBox(height: 12),
          TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'الاسم الكامل أو المهني'), validator: _required),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _track,
            decoration: const InputDecoration(labelText: 'مسار التقديم'),
            items: const [
              DropdownMenuItem(value: 'production_member', child: Text('عضو إنتاج')),
              DropdownMenuItem(value: 'production_supervisor_candidate', child: Text('عضو إنتاج مع ترشيح نفسي للإشراف')),
            ],
            onChanged: (v) => setState(() => _track = v ?? 'production_member'),
          ),
          const SizedBox(height: 12),
          Text('التخصصات', style: Theme.of(context).textTheme.titleMedium),
          for (final e in _specialties.entries)
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: _selected.contains(e.key),
              title: Text(e.value),
              onChanged: (v) => setState(() => v == true ? _selected.add(e.key) : _selected.remove(e.key)),
            ),
          TextFormField(controller: _experience, minLines: 3, maxLines: 6, decoration: const InputDecoration(labelText: 'الخبرات العملية'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'اكتب خبرة لا تقل عن 20 حرفاً.'),
          TextFormField(controller: _tools, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'البرامج والأدوات التي تتقنها'), validator: _required),
          TextFormField(controller: _projects, minLines: 2, maxLines: 5, decoration: const InputDecoration(labelText: 'المشاريع والأعمال السابقة'), validator: _required),
          TextFormField(controller: _companies, decoration: const InputDecoration(labelText: 'الشركات التي تعاونت معها (اختياري)')),
          TextFormField(controller: _achievements, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'الإنجازات والجوائز (اختياري)')),
          TextFormField(controller: _cv, decoration: const InputDecoration(labelText: 'رابط السيرة الذاتية HTTPS (اختياري)'), keyboardType: TextInputType.url),
          TextFormField(controller: _portfolio, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'روابط ملف الأعمال — HTTPS، افصل بينها بفواصل'), validator: _required),
          TextFormField(controller: _role, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'الدور الذي ترغب بالمساهمة فيه'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'يرجى توضيح الدور بما لا يقل عن 20 حرفاً.'),
          TextFormField(controller: _interview, minLines: 4, maxLines: 8, decoration: const InputDecoration(labelText: 'أسئلة المقابلة: عرفنا بخبرتك، وكيف تدير جودة العمل والتعاون؟'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'يرجى كتابة إجابات كافية للمقابلة.'),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: _trialConsent,
            title: const Text('أوافق على احتمال دعوتي إلى تجربة إبداعية تقييمية غير تجارية، وأي عمل تجاري يتطلب اتفاقاً مستقلاً.'),
            onChanged: (v) => setState(() => _trialConsent = v == true),
          ),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: _rightsConfirmed,
            title: const Text('أؤكد صحة بياناتي وامتلاكي الحقوق أو الأذونات اللازمة لعرض الأعمال المقدمة.'),
            onChanged: (v) => setState(() => _rightsConfirmed = v == true),
          ),
          if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _busy ? null : _submit,
            icon: _busy ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send),
            label: Text(_busy ? 'جارٍ الإرسال...' : 'إرسال طلب العضوية'),
          ),
        ]),
      ),
    );
  }
}
