import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show defaultTargetPlatform, TargetPlatform;
import 'package:uuid/uuid.dart';
import 'package:image_picker/image_picker.dart';
import '../services/coin_system_service.dart';
import '../services/member_media_upload_service.dart';
import '../services/auth_service.dart';
import '../services/local_biometric_service.dart';
import 'direct_chat_screen.dart';
import 'stories_screen.dart';
import 'profile_gallery_screen.dart';
import 'safety_center_screen.dart';
import '../widgets/premium_profile_effects.dart';

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
  final ImagePicker _imagePicker = ImagePicker();
  final MemberMediaUploadService _memberMedia = MemberMediaUploadService();
  bool _changingProfileMedia = false;
  bool _checkingLocalBiometrics = false;
  bool _targetBlockedByMe = false;
  bool _loadingTargetBlock = false;
  bool _checkingEmailRenewal = false;
  bool _isTransferringCoins = false;
  String? _pendingTransferKey;
  String? _pendingTransferRequestId;
  late Future<Map<String, dynamic>> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = _loadProfile();
    if (widget.profileUserId != widget.currentUserId) {
      _loadTargetBlockState();
    }
  }

  Future<void> _loadTargetBlockState() async {
    if (_loadingTargetBlock) return;
    setState(() => _loadingTargetBlock = true);
    try {
      final response = await FirebaseFunctions.instance
          .httpsCallable('getMyBlockedUsers')
          .call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final blocked = (data['blockedUids'] as List<dynamic>? ?? const [])
          .whereType<String>()
          .toSet();
      if (mounted) setState(() => _targetBlockedByMe = blocked.contains(widget.profileUserId));
    } catch (_) {
      // The server still enforces block state for every message operation.
    } finally {
      if (mounted) setState(() => _loadingTargetBlock = false);
    }
  }

  Future<void> _toggleTargetBlock() async {
    if (_loadingTargetBlock) return;
    final nextBlocked = !_targetBlockedByMe;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(nextBlocked ? 'حظر هذا العضو؟' : 'إلغاء حظر هذا العضو؟'),
        content: Text(nextBlocked
            ? 'لن تتمكن أنت وهذا العضو من تبادل الرسائل الخاصة. لا يتلقى العضو إشعاراً بالحظر.'
            : 'سيُسمح بتبادل الرسائل مجدداً إذا لم يوجد حظر متبادل أو قيد آخر.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text(nextBlocked ? 'تأكيد الحظر' : 'إلغاء الحظر'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _loadingTargetBlock = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('setMemberBlock').call({
        'targetUid': widget.profileUserId,
        'blocked': nextBlocked,
      });
      if (!mounted) return;
      setState(() => _targetBlockedByMe = nextBlocked);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(nextBlocked ? 'تم حظر العضو.' : 'تم إلغاء الحظر.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تحديث قائمة الحظر.')),
      );
    } finally {
      if (mounted) setState(() => _loadingTargetBlock = false);
    }
  }

  Future<void> _openSafetyCenter({String? targetUid}) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => SafetyCenterScreen(initialTargetUid: targetUid),
      ),
    );
  }

  Future<void> _checkLocalBiometrics() async {
    if (_checkingLocalBiometrics) return;
    final consent = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('موافقة مستقلة على المصادقة البيومترية'),
        content: const Text(
          'تستخدم مودة نافذة المصادقة المحلية في Android أو Apple. يتولى نظام التشغيل التحقق على الجهاز؛ '
          'لا نلتقط البصمة أو الوجه ولا نرسل بيانات بيومترية إلى الخادم. عند نجاح النافذة، يطلب التطبيق من الخادم '
          'اعتماد دورة مدتها 30 يوماً ومنح 1500 كوينز مرة واحدة في الدورة. هذه مكافأة على نجاح المصادقة المحلية '
          'وليست إثباتاً للهوية المدنية.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('ليس الآن'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('أوافق وأتابع'),
          ),
        ],
      ),
    );
    if (consent != true || !mounted) return;
    setState(() => _checkingLocalBiometrics = true);
    final result = await LocalBiometricService().authenticate();
    if (!mounted) return;
    setState(() => _checkingLocalBiometrics = false);

    String message;
    if (result.status == LocalBiometricStatus.authenticated) {
      try {
        final platform = switch (defaultTargetPlatform) {
          TargetPlatform.android => 'android',
          TargetPlatform.iOS => 'ios',
          _ => 'unsupported',
        };
        if (platform == 'unsupported') {
          message = 'نجحت المصادقة المحلية، لكن مكافأة هذه الدورة متاحة عبر تطبيق Android أو iOS فقط.';
        } else {
          final response = await FirebaseFunctions.instance
              .httpsCallable('completeBiometricVerificationCycle')
              .call(<String, dynamic>{
            'localAuthenticationSucceeded': true,
            'platform': platform,
            'attemptId': const Uuid().v4(),
          });
          final data = Map<String, dynamic>.from(response.data as Map);
          if (data['rewardGranted'] == true) {
            message = 'تم اعتماد المصادقة المحلية بنجاح، وأضيفت 1500 كوينز إلى محفظتك. تتجدد أهليتك بعد 30 يوماً.';
            if (mounted) setState(() => _profileFuture = _loadProfile());
          } else {
            message = 'تم التحقق محلياً. سبق منح مكافأة هذه الدورة؛ يمكنك الحصول على المكافأة التالية بعد اكتمال 30 يوماً.';
          }
        }
      } on FirebaseFunctionsException catch (error) {
        message = error.message ?? 'نجحت المصادقة المحلية، لكن تعذر اعتماد المكافأة من الخادم حالياً.';
      } catch (_) {
        message = 'نجحت المصادقة المحلية، لكن تعذر إكمال طلب المكافأة من الخادم.';
      }
    } else {
      message = switch (result.status) {
        LocalBiometricStatus.unavailable =>
          'هذا الجهاز أو النظام لا يتيح المصادقة البيومترية حالياً.',
        LocalBiometricStatus.notEnrolled =>
          'لم تُسجل بصمة أو وسيلة بيومترية على هذا الجهاز.',
        LocalBiometricStatus.cancelled =>
          'ألغيت المصادقة؛ لم يتم اعتماد أي تحقق أو منح مكافأة.',
        LocalBiometricStatus.failed =>
          'تعذر إكمال المصادقة البيومترية. حاول لاحقاً أو تحقق من إعدادات الجهاز.',
        LocalBiometricStatus.authenticated => 'اكتملت المصادقة المحلية.',
      };
    }
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 6)),
    );
  }

  Future<void> _renewEmailVerification() async {
    if (_checkingEmailRenewal) return;
    setState(() => _checkingEmailRenewal = true);
    try {
      await FirebaseFunctions.instance
          .httpsCallable('startEmailVerificationRenewal')
          .call();
      var user = FirebaseAuth.instance.currentUser;
      if (user == null) throw StateError('AUTH_USER_UNAVAILABLE');
      await user.reload();
      user = FirebaseAuth.instance.currentUser;
      if (user == null) throw StateError('AUTH_USER_UNAVAILABLE');

      if (user.emailVerified) {
        final response = await FirebaseFunctions.instance
            .httpsCallable('completeEmailVerificationRenewal')
            .call();
        if (!mounted) return;
        final data = Map<String, dynamic>.from(response.data as Map);
        final balance = (data['newBalance'] as num?)?.toInt();
        setState(() => _profileFuture = _loadProfile());
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'تم تجديد التحقق من البريد وإضافة 500 كوين إلى محفظتك${balance == null ? '' : '؛ رصيدك الجديد $balance'}.',
            ),
            duration: const Duration(seconds: 6),
          ),
        );
      } else {
        await user.sendEmailVerification();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('أرسلنا رابط تحقق جديد إلى بريدك. افتحه ثم ارجع إلى هنا واضغط الزر نفسه لاعتماد مكافأة 500 كوين.'),
            duration: Duration(seconds: 8),
          ),
        );
      }
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر بدء أو إكمال دورة التحقق من البريد.')),
      );
    } on FirebaseAuthException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إرسال رسالة التحقق. حاول لاحقاً.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر إكمال دورة البريد؛ لم تُمنح المكافأة.')),
      );
    } finally {
      if (mounted) setState(() => _checkingEmailRenewal = false);
    }
  }


  Future<void> _editVisitorGreeting(String currentGreeting) async {
    final controller = TextEditingController(text: currentGreeting);
    final greeting = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('رسالة ترحيب الزوار'),
        content: TextField(
          controller: controller,
          minLines: 2,
          maxLines: 4,
          maxLength: 160,
          decoration: const InputDecoration(
            labelText: 'رسالة قصيرة تظهر لزوار ملفك',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () {
              final value = controller.text.trim();
              if (value.length >= 3) Navigator.pop(dialogContext, value);
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (greeting == null || !mounted) return;
    try {
      await FirebaseFunctions.instance.httpsCallable('setMemberProfileVisitorGreeting').call({
        'greeting': greeting,
      });
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تحديث رسالة ترحيب الزوار.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حفظ رسالة الترحيب.')),
      );
    }
  }

  Future<void> _choosePinnedSection(String currentSection) async {
    final section = await showDialog<String>(
      context: context,
      builder: (dialogContext) => SimpleDialog(
        title: const Text('اختر القسم المثبت'),
        children: [
          SimpleDialogOption(
            onPressed: () => Navigator.pop(dialogContext, 'bio'),
            child: const Text('نبذة عني'),
          ),
          SimpleDialogOption(
            onPressed: () => Navigator.pop(dialogContext, 'interests'),
            child: const Text('اهتماماتي'),
          ),
          SimpleDialogOption(
            onPressed: () => Navigator.pop(dialogContext, 'gallery'),
            child: const Text('معرض الصور'),
          ),
        ],
      ),
    );
    if (section == null || section == currentSection || !mounted) return;
    try {
      await FirebaseFunctions.instance.httpsCallable('setMemberPinnedProfileSection').call({
        'section': section,
      });
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تحديث القسم المثبت في ملفك.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تثبيت القسم.')),
      );
    }
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


  Future<void> _setSocialLinkHidden(String provider, bool hidden) async {
    try {
      await FirebaseFunctions.instance.httpsCallable(
        'setMemberProfileSocialLinkVisibility',
      ).call(<String, dynamic>{'provider': provider, 'hidden': hidden});
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(hidden ? 'تم إخفاء الرابط من ملفك.' : 'تم إظهار الرابط في ملفك.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تحديث خصوصية الرابط.')),
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

  Future<void> _changeProfileMedia(String slot) async {
    if (_changingProfileMedia || widget.currentUserId != widget.profileUserId) return;
    final file = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 88,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (file == null || !mounted) return;
    setState(() => _changingProfileMedia = true);
    try {
      final mediaId = await _memberMedia.uploadImage(
        file: file,
        purpose: 'avatar_cover',
      );
      await _memberMedia.selectProfileImage(mediaId: mediaId, slot: slot);
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(slot == 'avatar'
            ? 'تم اعتماد الصورة الشخصية الجديدة بعد اجتياز الفحص.'
            : 'تم اعتماد صورة الغلاف الجديدة بعد اجتياز الفحص.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('لم يتم تغيير الصورة: $error')),
      );
    } finally {
      if (mounted) setState(() => _changingProfileMedia = false);
    }
  }

  Future<void> _useDefaultProfileMedia(String slot) async {
    if (_changingProfileMedia) return;
    setState(() => _changingProfileMedia = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('resetMemberProfileMedia')
          .call({'slot': slot});
      if (!mounted) return;
      setState(() => _profileFuture = _loadProfile());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تمت إعادة الصورة إلى تصميم مودة الافتراضي.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إعادة الصورة الافتراضية.')),
      );
    } finally {
      if (mounted) setState(() => _changingProfileMedia = false);
    }
  }

  Future<Map<String, dynamic>> _loadProfile() async {
    final callable = FirebaseFunctions.instance.httpsCallable('getMemberProfile');
    final response = await callable.call(<String, dynamic>{
      'userId': widget.profileUserId,
    });
    final profile = Map<String, dynamic>.from(response.data as Map);
    for (final slot in const ['avatar', 'cover']) {
      try {
        profile['${slot}Url'] = await _memberMedia.getSafeProfileImageUrl(
          userId: widget.profileUserId,
          slot: slot,
        );
      } catch (_) {
        profile['${slot}Url'] = null;
      }
    }
    return profile;
  }

  @override
  void dispose() {
    _memberMedia.close();
    super.dispose();
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

  Future<void> _signOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل تريد إنهاء جلسة الدخول والخروج من مودة؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('إلغاء'),
          ),
          FilledButton.icon(
            onPressed: () => Navigator.pop(dialogContext, true),
            icon: const Icon(Icons.logout),
            label: const Text('تسجيل الخروج'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await AuthService().signOut();
      // AuthGate listens to FirebaseAuth.authStateChanges and returns to LoginScreen.
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر تسجيل الخروج. تحقق من الاتصال ثم حاول مجدداً.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMyProfile = widget.currentUserId == widget.profileUserId;
    return Scaffold(
      appBar: AppBar(
        title: const Text('الملف الشخصي | مودة'),
        backgroundColor: Colors.black87,
        actions: [
          if (isMyProfile)
            IconButton(
              tooltip: 'تسجيل الخروج',
              onPressed: _signOut,
              icon: const Icon(Icons.logout),
            ),
        ],
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
          final vipActive = data['vipActive'] == true;
          final activeTitle = (data['activeTitle'] as String?)?.trim() ?? '';
          final activeFeatures = (data['activeFeatures'] as List<dynamic>? ?? const [])
              .whereType<Map>()
              .map((item) => Map<String, dynamic>.from(item))
              .toList(growable: false);
          final activeItemIds = activeFeatures
              .map((feature) => feature['itemId'] as String? ?? '')
              .toSet();
          final hasAvatarFrame = activeItemIds.contains('avatar_frame_30d');
          final hasColoredUsername = activeItemIds.contains('username_color_30d');
          final hasAnimatedUsername = activeItemIds.contains('username_animated_30d');
          final hasProfileTheme = activeItemIds.contains('profile_theme_30d');
          final hasProfileLayout = activeItemIds.contains('profile_layout_30d');
          final hasProfilePin = activeItemIds.contains('profile_pin_30d');
          final hasVisitorGreeting = activeItemIds.contains('visitor_greeting_30d');
          final hasProfileAnalytics = activeItemIds.contains('profile_analytics_30d');
          final pinnedSection = hasProfilePin ? (data['pinnedProfileSection'] as String? ?? 'interests') : '';
          final visitorGreeting = (data['visitorGreeting'] as String?) ?? '';
          final analytics = Map<String, dynamic>.from(
            data['profileAnalytics'] as Map? ?? const <String, dynamic>{},
          );
          final discoveryBoostActive = data['discoveryBoostActive'] == true;
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
          final hiddenSocialLinks = (data['hiddenSocialLinks'] as List<dynamic>? ?? const [])
              .whereType<String>()
              .toSet();

          return Container(
            color: hasProfileTheme ? const Color(0xFFF3EAF8) : null,
            child: ListView(
            padding: const EdgeInsets.only(bottom: 32),
            children: [
              Stack(
                children: [
                  Container(
                    height: 170,
                    width: double.infinity,
                    color: Colors.blueGrey.shade900,
                    child: data['coverUrl'] is String
                        ? Image.network(
                            data['coverUrl'] as String,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Center(
                              child: Icon(Icons.favorite, color: Colors.white, size: 52),
                            ),
                          )
                        : const Center(
                            child: Icon(Icons.favorite, color: Colors.white, size: 52),
                          ),
                  ),
                  if (isMyProfile)
                    PositionedDirectional(
                      end: 12,
                      bottom: 12,
                      child: FilledButton.tonalIcon(
                        onPressed: _changingProfileMedia ? null : () => _changeProfileMedia('cover'),
                        icon: const Icon(Icons.photo_camera_outlined),
                        label: const Text('تغيير الغلاف'),
                      ),
                    ),
                ],
              ),
              Transform.translate(
                offset: const Offset(0, -42),
                child: hasAvatarFrame
                    ? AnimatedPremiumAvatarFrame(child: CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.deepPurple,
                  backgroundImage: data['avatarUrl'] is String
                      ? NetworkImage(data['avatarUrl'] as String)
                      : null,
                  child: data['avatarUrl'] is String
                      ? null
                      : const Icon(
                          Icons.favorite_rounded,
                          size: 42,
                          color: Colors.white,
                        ),
                ))
                    : CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.deepPurple,
                  backgroundImage: data['avatarUrl'] is String
                      ? NetworkImage(data['avatarUrl'] as String)
                      : null,
                  child: data['avatarUrl'] is String
                      ? null
                      : const Icon(
                          Icons.favorite_rounded,
                          size: 42,
                          color: Colors.white,
                        ),
                ),
              ),
              if (isMyProfile)
                Transform.translate(
                  offset: const Offset(0, -34),
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    children: [
                      OutlinedButton.icon(
                        onPressed: _changingProfileMedia ? null : () => _changeProfileMedia('avatar'),
                        icon: const Icon(Icons.account_circle_outlined),
                        label: const Text('تغيير الصورة الشخصية'),
                      ),
                      TextButton.icon(
                        onPressed: _changingProfileMedia ? null : () => _useDefaultProfileMedia('avatar'),
                        icon: const Icon(Icons.restore),
                        label: const Text('الافتراضية'),
                      ),
                      TextButton.icon(
                        onPressed: _changingProfileMedia ? null : () => _useDefaultProfileMedia('cover'),
                        icon: const Icon(Icons.restore),
                        label: const Text('غلاف افتراضي'),
                      ),
                    ],
                  ),
                ),
              Transform.translate(
                offset: const Offset(0, -30),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 12),
                  padding: hasProfileLayout ? const EdgeInsets.all(14) : EdgeInsets.zero,
                  decoration: hasProfileLayout
                      ? BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: const Color(0xFFD7B8E8)),
                          boxShadow: const [
                            BoxShadow(color: Color(0x18000000), blurRadius: 14, offset: Offset(0, 4)),
                          ],
                        )
                      : null,
                  child: Column(
                  children: [
                    AnimatedPremiumUsername(
                      text: name,
                      colored: hasColoredUsername,
                      animated: hasAnimatedUsername,
                    ),
                    if (discoveryBoostActive)
                      const Padding(
                        padding: EdgeInsets.only(top: 4),
                        child: Chip(
                          avatar: Icon(Icons.trending_up, size: 16),
                          label: Text('ظهور معزز'),
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                    if (vipActive)
                      const Padding(
                        padding: EdgeInsets.only(top: 6),
                        child: Chip(
                          avatar: Icon(Icons.workspace_premium, size: 18),
                          label: Text('VIP'),
                        ),
                      ),
                    if (activeTitle.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          activeTitle,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    if (activeFeatures.any((feature) =>
                        feature['category'] != 'vip' && feature['category'] != 'title'))
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 6,
                          runSpacing: 4,
                          children: activeFeatures
                              .where((feature) =>
                                  feature['category'] != 'vip' &&
                                  feature['category'] != 'title')
                              .map((feature) {
                            final category = feature['category'] as String? ?? '';
                            final label = switch (category) {
                              'badge' => 'وسام',
                              'frame' => 'إطار مميز',
                              'username_style' => 'نمط اسم',
                              'analytics' => 'تحليلات',
                              'profile_layout' => 'ملف احترافي',
                              'boost' => 'ظهور معزز',
                              'theme' => 'ثيم مميز',
                              'greeting' => 'ترحيب الزوار',
                              'privacy' => 'ميزة خصوصية',
                              _ => feature['itemName'] as String? ?? 'ميزة مميزة',
                            };
                            return Chip(
                              avatar: const Icon(Icons.stars_outlined, size: 16),
                              label: Text(label),
                              visualDensity: VisualDensity.compact,
                            );
                          }).toList(growable: false),
                        ),
                      ),
                    if (username.isNotEmpty) Text('@$username'),
                    if (pinnedSection == 'bio' && bio.isNotEmpty)
                      Card(
                        margin: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            children: [
                              const Text('نبذة مثبتة', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 6),
                              Text(bio, textAlign: TextAlign.center),
                            ],
                          ),
                        ),
                      ),
                    if (pinnedSection != 'bio' && bio.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                        child: Text(bio, textAlign: TextAlign.center),
                      ),
                    if (profession.isNotEmpty || region.isNotEmpty || country.isNotEmpty)
                      Text([profession, region, country].where((value) => value.isNotEmpty).join(' • ')),
                    if (pinnedSection == 'interests' && interests.isNotEmpty)
                      Card(
                        margin: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            children: [
                              const Text('اهتمامات مثبتة', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                alignment: WrapAlignment.center,
                                children: interests.map((item) => Chip(label: Text('$item'))).toList(),
                              ),
                            ],
                          ),
                        ),
                      ),
                    if (pinnedSection != 'interests' && interests.isNotEmpty)
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
              ),
              if (pinnedSection == 'gallery')
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Card(
                    child: ListTile(
                      leading: const Icon(Icons.push_pin_outlined),
                      title: const Text('معرض الصور المثبت'),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ProfileGalleryScreen(
                            profileUserId: widget.profileUserId,
                            currentUserId: widget.currentUserId,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              if (!isMyProfile && visitorGreeting.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          const Icon(Icons.waving_hand_outlined),
                          const SizedBox(width: 10),
                          Expanded(child: Text(visitorGreeting)),
                        ],
                      ),
                    ),
                  ),
                ),
              if (isMyProfile && hasVisitorGreeting)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.waving_hand_outlined),
                    label: const Text('تعديل رسالة ترحيب الزوار'),
                    onPressed: () => _editVisitorGreeting(visitorGreeting),
                  ),
                ),
              if (isMyProfile && hasProfilePin)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.push_pin_outlined),
                    label: const Text('اختيار القسم المثبت'),
                    onPressed: () => _choosePinnedSection(pinnedSection),
                  ),
                ),
              if (isMyProfile && hasProfileAnalytics)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Card(
                    child: ListTile(
                      leading: const Icon(Icons.analytics_outlined),
                      title: const Text('زيارات ملفك خلال آخر 7 أيام'),
                      trailing: Text(
                        '${(analytics['last7DaysViews'] as num?)?.toInt() ?? 0}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                    ),
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
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('معرض الصور'),
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ProfileGalleryScreen(
                        profileUserId: widget.profileUserId,
                        currentUserId: widget.currentUserId,
                      ),
                    ),
                  ),
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
                              child: Row(
                                children: [
                                  Expanded(
                                    child: SelectableText(
                                      '${entry.key}: ${entry.value}'
                                      '${isMyProfile && hiddenSocialLinks.contains(entry.key) ? ' (مخفي عن الأعضاء)' : ''}',
                                    ),
                                  ),
                                  if (isMyProfile)
                                    IconButton(
                                      tooltip: hiddenSocialLinks.contains(entry.key)
                                          ? 'إظهار الرابط للأعضاء'
                                          : 'إخفاء الرابط عن الأعضاء',
                                      onPressed: () => _setSocialLinkHidden(
                                        entry.key,
                                        !hiddenSocialLinks.contains(entry.key),
                                      ),
                                      icon: Icon(hiddenSocialLinks.contains(entry.key)
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined),
                                    ),
                                ],
                              ),
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
                    icon: const Icon(Icons.shield_outlined),
                    label: const Text('مركز السلامة والبلاغات'),
                    onPressed: () => _openSafetyCenter(),
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
              if (isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                  child: OutlinedButton.icon(
                    onPressed: _checkingEmailRenewal ? null : _renewEmailVerification,
                    icon: _checkingEmailRenewal
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.mark_email_read_outlined),
                    label: const Text('تجديد التحقق من البريد (500 كوين كل 90 يوماً)'),
                  ),
                ),
              if (isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: OutlinedButton.icon(
                    onPressed: _checkingLocalBiometrics ? null : _checkLocalBiometrics,
                    icon: _checkingLocalBiometrics
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.fingerprint),
                    label: const Text('اختبار المصادقة البيومترية على هذا الجهاز'),
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
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('مشاهدة قصص مودة'),
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => StoriesScreen(currentUserId: widget.currentUserId),
                    ),
                  ),
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
              if (!isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.flag_outlined),
                    label: const Text('الإبلاغ عن هذا العضو'),
                    onPressed: () => _openSafetyCenter(targetUid: widget.profileUserId),
                  ),
                ),
              if (!isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                  child: OutlinedButton.icon(
                    onPressed: _loadingTargetBlock ? null : _toggleTargetBlock,
                    icon: _loadingTargetBlock
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : Icon(_targetBlockedByMe ? Icons.check_circle_outline : Icons.block_outlined),
                    label: Text(_targetBlockedByMe ? 'إلغاء حظر العضو' : 'حظر العضو'),
                  ),
                ),
              if (!isMyProfile && !_targetBlockedByMe)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.chat_bubble_outline),
                    label: const Text('مراسلة العضو'),
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => DirectChatScreen(
                          peerUid: widget.profileUserId,
                          peerName: name,
                          currentUserId: widget.currentUserId,
                        ),
                      ),
                    ),
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
          ),
          );
        },
      ),
    );
  }
}
