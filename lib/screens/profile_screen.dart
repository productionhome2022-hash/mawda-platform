import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../services/coin_system_service.dart';

class ProfileScreen extends StatefulWidget {
  final String profileUserId;
  final String currentUserId;

  const ProfileScreen({
    Key? key,
    required this.profileUserId,
    required this.currentUserId,
  }) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final CoinSystemService _coinService = CoinSystemService();
  bool _isTransferringCoins = false;
  String? _pendingTransferKey;
  String? _pendingTransferRequestId;
  late Future<Map<String, dynamic>> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = _loadProfile();
  }

  Future<void> _changeProfileVisibility(String visibility) async {
    try {
      final callable = FirebaseFunctions.instance.httpsCallable('setMemberProfileVisibility');
      await callable.call(<String, dynamic>{'visibility': visibility});
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(visibility == 'public'
            ? 'أصبح ملفك متاحاً للأعضاء وفق المعلومات العامة المعتمدة.'
            : 'تم جعل ملفك خاصاً.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تحديث إعداد الخصوصية.')),
      );
    }
  }


  Future<void> _manageSocialLinks(Map<String, dynamic> profile) async {
    final existing = Map<String, dynamic>.from(
      profile['socialLinks'] as Map? ?? const <String, dynamic>{},
    );
    final controllers = <String, TextEditingController>{
      'instagram': TextEditingController(text: existing['instagram'] as String? ?? ''),
      'x': TextEditingController(text: existing['x'] as String? ?? ''),
      'facebook': TextEditingController(text: existing['facebook'] as String? ?? ''),
      'whatsapp': TextEditingController(text: existing['whatsapp'] as String? ?? ''),
    };
    final values = await showDialog<Map<String, String>>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('روابط التواصل في ملفي'),
        content: SizedBox(
          width: 460,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'تُقبل الروابط الرسمية الآمنة فقط. يتطلب نشر الروابط توثيقاً بيومترياً نشطاً، ويمكنك حذفها في أي وقت.',
                ),
                const SizedBox(height: 12),
                for (final entry in controllers.entries)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: TextField(
                      controller: entry.value,
                      maxLength: 500,
                      keyboardType: TextInputType.url,
                      decoration: InputDecoration(
                        labelText: entry.key == 'x'
                            ? 'X / Twitter'
                            : entry.key[0].toUpperCase() + entry.key.substring(1),
                        hintText: 'https://...',
                        border: const OutlineInputBorder(),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(
              dialogContext,
              {
                for (final entry in controllers.entries)
                  if (entry.value.text.trim().isNotEmpty)
                    entry.key: entry.value.text.trim(),
              },
            ),
            child: const Text('حفظ الروابط'),
          ),
        ],
      ),
    );
    for (final controller in controllers.values) {
      controller.dispose();
    }
    if (values == null || !mounted) return;

    try {
      final callable = FirebaseFunctions.instance.httpsCallable('setMemberProfileSocialLinks');
      await callable.call(<String, dynamic>{'links': values});
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تحديث روابط التواصل بأمان.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تحديث روابط التواصل.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('حدث خطأ غير متوقع أثناء حفظ الروابط.')),
      );
    }
  }

  Future<void> _editProfile(Map<String, dynamic> profile) async {
    final fullName = TextEditingController(text: profile['displayName'] as String? ?? '');
    final profession = TextEditingController(text: profile['profession'] as String? ?? '');
    final country = TextEditingController(text: profile['country'] as String? ?? '');
    final region = TextEditingController(text: profile['region'] as String? ?? '');
    final bio = TextEditingController(text: profile['bio'] as String? ?? '');
    final interests = TextEditingController(
      text: (profile['interests'] as List<dynamic>? ?? const []).join(', '),
    );
    final goals = TextEditingController(
      text: (profile['goals'] as List<dynamic>? ?? const []).join(', '),
    );
    const genders = ['male', 'female'];
    const maritalStatuses = ['single', 'married', 'divorced', 'widowed'];
    var selectedGender = genders.contains(profile['gender'])
        ? profile['gender'] as String
        : 'male';
    var selectedMaritalStatus = maritalStatuses.contains(profile['maritalStatus'])
        ? profile['maritalStatus'] as String
        : 'single';
    final formKey = GlobalKey<FormState>();
    final values = await showDialog<Map<String, String>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('تعديل الملف الشخصي'),
          content: SizedBox(
            width: 440,
            child: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _editField(fullName, 'الاسم الكامل', maxLength: 80),
                    _editField(profession, 'المهنة', maxLength: 80),
                    _editField(country, 'الدولة', maxLength: 80),
                    _editField(region, 'المنطقة / المدينة', maxLength: 80),
                    DropdownButtonFormField<String>(
                      initialValue: selectedGender,
                      decoration: const InputDecoration(
                        labelText: 'الجنس',
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'male', child: Text('ذكر')),
                        DropdownMenuItem(value: 'female', child: Text('أنثى')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setDialogState(() => selectedGender = value);
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: selectedMaritalStatus,
                      decoration: const InputDecoration(
                        labelText: 'الحالة الاجتماعية',
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'single', child: Text('أعزب / عزباء')),
                        DropdownMenuItem(value: 'married', child: Text('متزوج / متزوجة')),
                        DropdownMenuItem(value: 'divorced', child: Text('مطلق / مطلقة')),
                        DropdownMenuItem(value: 'widowed', child: Text('أرمل / أرملة')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setDialogState(() => selectedMaritalStatus = value);
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    _editField(bio, 'نبذة عنك', maxLength: 500, maxLines: 4),
                    _editField(interests, 'الاهتمامات (اختياري، افصل بينها بفاصلة)', maxLength: 800, required: false),
                    _editField(goals, 'الأهداف (اختياري): friendship, social_connection, romantic_dating, marriage', maxLength: 400, required: false),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('إلغاء'),
            ),
            FilledButton(
              onPressed: () {
                if (formKey.currentState!.validate()) {
                  Navigator.pop(dialogContext, {
                    'fullName': fullName.text.trim(),
                    'profession': profession.text.trim(),
                    'country': country.text.trim(),
                    'region': region.text.trim(),
                    'gender': selectedGender,
                    'maritalStatus': selectedMaritalStatus,
                    'bio': bio.text.trim(),
                    'interests': interests.text,
                    'goals': goals.text,
                  });
                }
              },
              child: const Text('حفظ التعديلات'),
            ),
          ],
        ),
      ),
    );
    fullName.dispose();
    profession.dispose();
    country.dispose();
    region.dispose();
    bio.dispose();
    interests.dispose();
    goals.dispose();
    if (values == null || !mounted) return;

    List<String> splitList(String value) => value
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList(growable: false);
    final updatedProfile = <String, dynamic>{
      'fullName': values['fullName'],
      'profession': values['profession'],
      'country': values['country'],
      'region': values['region'],
      'gender': values['gender'],
      'maritalStatus': values['maritalStatus'],
      'bio': values['bio'],
      'interests': splitList(values['interests']!),
      'goals': splitList(values['goals']!),
    };

    try {
      await FirebaseFunctions.instance.httpsCallable('updateMemberProfile').call({
        'profile': updatedProfile,
      });
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ تعديلات الملف الشخصي بنجاح.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حفظ تعديلات الملف الشخصي.')),
      );
    }
  }

  Widget _editField(
    TextEditingController controller,
    String label, {
    int maxLength = 120,
    int maxLines = 1,
    bool required = true,
  }) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: TextFormField(
      controller: controller,
      maxLength: maxLength,
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      validator: (value) {
        final text = value?.trim() ?? '';
        if (text.isEmpty && !required) return null;
        if (label == 'نبذة عنك') return text.length <= 500 ? null : 'الحد الأقصى 500 حرف.';
        if (text.isEmpty) return 'هذا الحقل مطلوب.';
        return null;
      },
    ),
  );

  Future<Map<String, dynamic>> _loadProfile() async {
    final callable = FirebaseFunctions.instance.httpsCallable('getMemberProfile');
    final response = await callable.call(<String, dynamic>{
      'userId': widget.profileUserId,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<void> _showGiftCoinsDialog() async {
    final amountController = TextEditingController();
    final amount = await showDialog<int>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تحويل كوينز إلى العضو 🪙'),
        content: TextField(
          controller: amountController,
          autofocus: true,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'المبلغ الإجمالي للتحويل',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              final value = int.tryParse(amountController.text.trim());
              if (value != null && value > 0) Navigator.pop(dialogContext, value);
            },
            child: const Text('متابعة'),
          ),
        ],
      ),
    );
    amountController.dispose();
    if (amount == null || !mounted || _isTransferringCoins) return;
    await _quoteAndConfirmCoinTransfer(amount);
  }

  Future<void> _quoteAndConfirmCoinTransfer(int amount) async {
    setState(() => _isTransferringCoins = true);
    try {
      final quote = await _coinService.getTransferQuote(amount);
      if (!mounted) return;
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('مراجعة التحويل والعمولة'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _summaryRow('المبلغ الذي سيُخصم منك', '${quote.grossAmount} كوين'),
              _summaryRow(
                'عمولة المنصة (${quote.commissionPercent.toStringAsFixed(2)}%)',
                '${quote.commissionAmount} كوين',
              ),
              const Divider(),
              _summaryRow('الصافي الذي سيصل للعضو', '${quote.netAmount} كوين'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('تأكيد التحويل'),
            ),
          ],
        ),
      );
      if (confirmed != true || !mounted) return;

      final transferKey = '${widget.profileUserId}:$amount';
      if (_pendingTransferKey != transferKey || _pendingTransferRequestId == null) {
        _pendingTransferKey = transferKey;
        _pendingTransferRequestId = const Uuid().v4();
      }
      final receipt = await _coinService.transferCoins(
        recipientUid: widget.profileUserId,
        amount: amount,
        requestId: _pendingTransferRequestId!,
        expectedCommissionBps: quote.commissionBps,
      );
      _pendingTransferKey = null;
      _pendingTransferRequestId = null;
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'تم التحويل: وصل ${receipt.netAmount} كوين، وعمولة المنصة ${receipt.commissionAmount} كوين. رقم العملية: ${receipt.transferId}',
          ),
        ),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إتمام التحويل. حاول مرة أخرى.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('حدث خطأ أثناء التحويل. لم نعرض نجاحاً غير مؤكد.')),
      );
    } finally {
      if (mounted) setState(() => _isTransferringCoins = false);
    }
  }

  Widget _summaryRow(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: Text(label)),
            const SizedBox(width: 12),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      );

  @override
  Widget build(BuildContext context) {
    final isMyProfile = widget.currentUserId == widget.profileUserId;
    return Scaffold(
      appBar: AppBar(
        title: const Text('الملف الشخصي | مودة'),
        backgroundColor: Colors.black87,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.lock_outline, size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'تعذر عرض الملف. قد يكون خاصاً أو غير متاح حالياً.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => setState(() {}),
                      child: const Text('إعادة المحاولة'),
                    ),
                  ],
                ),
              ),
            );
          }

          final data = snapshot.data!;
          final name = (data['displayName'] as String?) ?? 'Mawda Member';
          final username = (data['username'] as String?) ?? '';
          final bio = (data['bio'] as String?) ?? '';
          final profession = (data['profession'] as String?) ?? '';
          final country = (data['country'] as String?) ?? '';
          final region = (data['region'] as String?) ?? '';
          final interests = (data['interests'] as List<dynamic>? ?? const []);
          final profileVisibility = (data['profileVisibility'] as String?) ?? 'private';
          final socialLinks = Map<String, dynamic>.from(
            data['socialLinks'] as Map? ?? const <String, dynamic>{},
          );
          final canManageSocialLinks = data['canManageSocialLinks'] == true;

          return ListView(
            padding: const EdgeInsets.only(bottom: 32),
            children: [
              Container(
                height: 150,
                color: Colors.blueGrey.shade900,
                child: const Center(
                  child: Icon(Icons.favorite, color: Colors.white, size: 52),
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -42),
                child: CircleAvatar(
                  radius: 48,
                  backgroundColor: Colors.deepPurple,
                  child: Text(
                    name.isNotEmpty ? name.substring(0, 1) : 'M',
                    style: const TextStyle(fontSize: 32, color: Colors.white),
                  ),
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -30),
                child: Column(
                  children: [
                    Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    if (username.isNotEmpty) Text('@$username'),
                    if (bio.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                        child: Text(bio, textAlign: TextAlign.center),
                      ),
                    if (profession.isNotEmpty || region.isNotEmpty || country.isNotEmpty)
                      Text([profession, region, country].where((value) => value.isNotEmpty).join(' • ')),
                    if (interests.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          alignment: WrapAlignment.center,
                          children: interests.map((item) => Chip(label: Text('$item'))).toList(),
                        ),
                      ),
                  ],
                ),
              ),
              if (isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('تعديل بيانات الملف الشخصي'),
                    onPressed: () => _editProfile(data),
                  ),
                ),
              if (socialLinks.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'روابط التواصل',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 8),
                          for (final entry in socialLinks.entries)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: SelectableText('${entry.key}: ${entry.value}'),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              if (isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.link),
                    label: const Text('إدارة روابط التواصل'),
                    onPressed: () => _manageSocialLinks(data),
                  ),
                ),
              if (isMyProfile && !canManageSocialLinks)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    'إضافة روابط جديدة تتطلب توثيقاً بيومترياً نشطاً. يمكنك حذف الروابط الحالية في أي وقت.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              if (isMyProfile)
                SwitchListTile(
                  title: const Text('إتاحة ملفي للأعضاء'),
                  subtitle: Text(profileVisibility == 'public'
                      ? 'ملفك ظاهر للأعضاء الآخرين بالمعلومات العامة فقط.'
                      : 'ملفك خاص ولا يظهر للأعضاء الآخرين.'),
                  value: profileVisibility == 'public',
                  onChanged: (visible) => _changeProfileVisibility(visible ? 'public' : 'private'),
                  secondary: const Icon(Icons.privacy_tip_outlined),
                ),
              if (!isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.monetization_on),
                    label: Text(_isTransferringCoins ? 'جارٍ التحويل...' : 'إهداء كوينز'),
                    onPressed: _isTransferringCoins ? null : _showGiftCoinsDialog,
                  ),
                ),
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'تُعرض هنا المعلومات التي سمح العضو بمشاركتها فقط. معرض الصور والمزايا المدفوعة سيُعاد تفعليهما بعد اكتمال خدمات الوسائط والتحقق من صلاحياتها.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
