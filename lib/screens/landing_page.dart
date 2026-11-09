import 'dart:ui';
import 'package:flutter/material.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({Key? key}) : super(key: key);

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  int _selectedTab = 0; // 0: موثقون, 1: عضو جديد, 2: زائر مؤقت

  // متحكمات المدخلات للحسابات الحقيقية
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _guestNameController = TextEditingController();
  final _supportMsgController = TextEditingController();

  bool _rememberMe = true;
  String _selectedGender = 'ذكر (أعزب حصراً)';
  String _selectedGoal = 'زواج شرعي';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F051D),
      body: Stack(
        children: [
          // 1. خلفية الأيدي المتشابكة السينمائية (تظهر بوضوح عبر العناصر الشفافة)
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: NetworkImage('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1350&q=80'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          
          // 2. تدرج غامق خفيف جداً لضبط التباين والرؤية
          Container(
            color: const Color(0xFF0F051D).withOpacity(0.40),
          ),

          // 3. الحاوية الزجاجية الكريستالية عالية الشفافية
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                  child: Container(
                    maxWidth: 550,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F051D).withOpacity(0.35),
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.pink.withOpacity(0.15),
                          blurRadius: 25,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // الشعار المضيء
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.pink.withOpacity(0.15),
                            border: Border.all(color: Colors.pinkAccent.withOpacity(0.6)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.pinkAccent.withOpacity(0.4),
                                blurRadius: 20,
                              )
                            ],
                          ),
                          child: const Icon(Icons.favorite, size: 36, color: Colors.pinkAccent),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'منصة مودة / Mawadda Platform',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'المنصة الأولى عربياً للتعارف والصداقة والزواج',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Color(0xFFFFD700), fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 20),

                        // شريط التنقل بين البوابات (أزرار شفافة جداً)
                        Row(
                          children: [
                            Expanded(child: _buildGlassTabButton(0, 'الموثقون', Icons.verified_user)),
                            const SizedBox(width: 6),
                            Expanded(child: _buildGlassTabButton(1, 'عضو جديد', Icons.person_add)),
                            const SizedBox(width: 6),
                            Expanded(child: _buildGlassTabButton(2, 'زائر مؤقت', Icons.timer)),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // عرض الاستمارة التفاعلية الحقيقية
                        if (_selectedTab == 0) _buildLoginForm(),
                        if (_selectedTab == 1) _buildRegisterForm(),
                        if (_selectedTab == 2) _buildGuestForm(),

                        const SizedBox(height: 16),
                        const Divider(color: Colors.white12),
                        
                        // زر التواصل المباشر والدعم الفني
                        TextButton.icon(
                          onPressed: () => _showSupportDialog(context),
                          icon: const Icon(Icons.headset_mic, color: Colors.pinkAccent, size: 16),
                          label: const Text(
                            'التواصل المباشر مع السوبر أدمن والدعم الفني',
                            style: TextStyle(color: Colors.pinkAccent, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // زر التبويب الزجاجي الشفاف
  Widget _buildGlassTabButton(int index, String label, IconData icon) {
    bool isSelected = _selectedTab == index;
    return InkWell(
      onTap: () => setState(() => _selectedTab = index),
      borderRadius: BorderRadius.circular(14),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.pink.withOpacity(0.35) : Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? Colors.pinkAccent : Colors.white.withOpacity(0.15),
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: Colors.pink.withOpacity(0.3), blurRadius: 10)]
              : [],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: isSelected ? Colors.white : Colors.white70),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  // 1. بوابة الأعضاء الموثقين
  Widget _buildLoginForm() {
    return Column(
      children: [
        _buildGlassTextField('البريد الإلكتروني', _emailController, Icons.email),
        const SizedBox(height: 10),
        _buildGlassTextField('كلمة السر', _passwordController, Icons.lock, isPass: true),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Checkbox(
                  value: _rememberMe,
                  onChanged: (v) => setState(() => _rememberMe = v ?? true),
                  activeColor: Colors.pinkAccent,
                ),
                const Text('تذكرني للجلسة الدائمة', style: TextStyle(fontSize: 11, color: Colors.white70)),
              ],
            ),
            TextButton(
              onPressed: () {},
              child: const Text('نسيت كلمة السر؟', style: TextStyle(fontSize: 11, color: Colors.pinkAccent)),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.pink.withOpacity(0.65),
            minimumSize: const Size(double.infinity, 45),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('جاري تسجيل دخول العضو الموثق...')),
            );
          },
          child: const Text('دخول المنصة والبروفايل', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  // 2. مسار التسجيل المزدوج للأعضاء الجدد
  Widget _buildRegisterForm() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.amber.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
          child: const Text(
            '🎉 هدية انضمام: 500 كوينز مجانية (يرجى مراجعة الـ Spam وتأكيد البريد).',
            style: TextStyle(fontSize: 10.5, color: Colors.amberAccent),
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 10),
        _buildGlassTextField('الاسم الكامل', _fullNameController, Icons.person),
        const SizedBox(height: 8),
        _buildGlassTextField('البريد الإلكتروني الحقيقي', _emailController, Icons.email),
        const SizedBox(height: 8),
        
        // اختيار الجنس
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.25),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.15)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedGender,
              dropdownColor: const Color(0xFF0F051D),
              isExpanded: true,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              items: ['ذكر (أعزب حصراً)', 'أنثى (عزباء حصراً)']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedGender = v!),
            ),
          ),
        ),
        const SizedBox(height: 8),

        // اختيار الهدف
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.25),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.15)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedGoal,
              dropdownColor: const Color(0xFF0F051D),
              isExpanded: true,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              items: ['زواج شرعي', 'صداقة وتعارف', 'علاقة جادة']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedGoal = v!),
            ),
          ),
        ),
        const SizedBox(height: 10),

        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.pink.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
          child: const Text(
            '🔒 توثيق بيومتري (اختياري - صوت + سيلفي): يمنحك +1500 كوينز ودرع موثق!',
            style: TextStyle(fontSize: 10.5, color: Colors.pinkAccent),
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 10),

        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.amber.shade800.withOpacity(0.7),
            minimumSize: const Size(double.infinity, 45),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('جاري بدء إتمام التسجيل والحصول على الـ 500 كوينز...')),
            );
          },
          child: const Text('إتمام التسجيل وانطلاق الحساب', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  // 3. بوابة الزوار المؤقتين
  Widget _buildGuestForm() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.blue.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
          child: const Text(
            '⏱️ صلاحية الزائر: ساعة واحدة فقط كل 24 ساعة للغرف العامة وتصفح المتجر.',
            style: TextStyle(fontSize: 10.5, color: Colors.blueAccent),
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 10),
        _buildGlassTextField('اسم الزائر المستعار', _guestNameController, Icons.face),
        const SizedBox(height: 12),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue.withOpacity(0.65),
            minimumSize: const Size(double.infinity, 45),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('تم بدء الجلسة المؤقتة لمدة 60 دقيقة...')),
            );
          },
          child: const Text('دخول مؤقت الآن', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  // مدخلات النص الزجاجية الشفافة
  Widget _buildGlassTextField(String hint, TextEditingController controller, IconData icon, {bool isPass = false}) {
    return TextField(
      controller: controller,
      obscureText: isPass,
      style: const TextStyle(color: Colors.white, fontSize: 12.5),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, size: 16, color: Colors.white60),
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.45), fontSize: 11.5),
        filled: true,
        fillColor: Colors.black.withOpacity(0.25),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.15)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.pinkAccent),
        ),
      ),
    );
  }

  // نافذة التواصل المباشر مع السوبر أدمن والدعم
  void _showSupportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F051D),
        title: const Text('التواصل مع السوبر أدمن والدعم', style: TextStyle(color: Colors.white, fontSize: 15)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('اكتب استفسارك أو مشكلتك وسيتم الرد عليك فوراً:', style: TextStyle(color: Colors.white70, fontSize: 11)),
            const SizedBox(height: 10),
            TextField(
              controller: _supportMsgController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'تفاصيل المساعدة أو إرفاق الشكوى...',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11),
                filled: true,
                fillColor: Colors.black45,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.pinkAccent),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إرسال تذكرة الدعم بنجاح إلى السوبر أدمن!')),
              );
            },
            child: const Text('إرسال التذكرة'),
          ),
        ],
      ),
    );
  }
}
