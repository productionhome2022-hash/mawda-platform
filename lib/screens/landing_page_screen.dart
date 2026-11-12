import 'package:flutter/material.dart';

class LandingPageScreen extends StatefulWidget {
  const LandingPageScreen({Key? key}) : super(key: key);

  @override
  State<LandingPageScreen> createState() => _LandingPageScreenState();
}

class _LandingPageScreenState extends State<LandingPageScreen> {
  // حالة اللغة الحالية (ar, en, fr, es)
  String _currentLocale = 'ar';

  // الحالة الحالية للتنقل الداخلي في واجهة الهبوط
  String _currentView = 'gateway'; 

  final TextEditingController _verifiedEmailController = TextEditingController();
  final TextEditingController _verifiedPasswordController = TextEditingController();

  final TextEditingController _visitorUsernameController = TextEditingController();

  // قاموس النصوص متعدد اللغات
  final Map<String, Map<String, String>> _localizedTexts = {
    'ar': {
      'title': 'منصة مودة',
      'subtitle': 'مفترق الطرق السيادي للتعارف والزواج الآمن',
      'verifiedLogin': 'دخول الأعضاء الموثقين',
      'visitorLogin': 'دخول الزوار (وضع الاستكشاف)',
      'registerNew': 'مستخدم جديد (تسجيل حساب)',
      'support': 'الدعم الفني والإدارة',
      'back': 'العودة للرئيسية',
      'email': 'البريد الإلكتروني',
      'password': 'كلمة المرور',
      'login': 'تسجيل الدخول',
      'visitorName': 'اسم الزائر',
      'explore': 'دخول للاستكشاف',
      'next': 'التالي',
      'regDesc': 'مرحباً بك! ستحصل فور تسجيلك على مكافأة 500 كوينز.',
      'supportDesc': 'تواصل معنا لأية شكاوى أو استفسارات.',
      'legalNotice': '© 2026 Production Home 2022. جميع الحقوق القانونية والتجارية والتقنية محفوظة لفريق Production Home 2022. يُمنع نسخ أو إعادة استخدام أو استغلال أو تعديل أي جزء من المنصة أو هويتها أو محتواها دون إذن كتابي مسبق من أصحاب الحقوق.',
    },
    'en': {
      'title': 'Mawadda Platform',
      'subtitle': 'The Sovereign Crossroads for Safe Matchmaking & Marriage',
      'verifiedLogin': 'Verified Members Login',
      'visitorLogin': 'Visitor Login (Explore Mode)',
      'registerNew': 'New User (Register Account)',
      'support': 'Technical Support & Admin',
      'back': 'Back to Home',
      'email': 'Email Address',
      'password': 'Password',
      'login': 'Login',
      'visitorName': 'Visitor Name',
      'explore': 'Enter to Explore',
      'next': 'Next',
      'regDesc': 'Welcome! You will instantly receive a 500 coins bonus upon registration.',
      'supportDesc': 'Contact us for any complaints or inquiries.',
      'legalNotice': '© 2026 Production Home 2022. All legal, commercial and technical rights are reserved to the Production Home 2022 team. No part of this platform, its identity or content may be copied, reused, exploited or modified without prior written permission from the rights holders.',
    },
    'fr': {
      'title': 'Plateforme Mawadda',
      'subtitle': 'Le Carrefour Souverain pour le Mariage et la Rencontre Sécurisée',
      'verifiedLogin': 'Connexion Membres Vérifiés',
      'visitorLogin': 'Connexion Visiteur (Mode Exploration)',
      'registerNew': 'Nouveau Compte',
      'support': 'Support Technique et Admin',
      'back': 'Retour à l\'accueil',
      'email': 'Adresse E-mail',
      'password': 'Mot de passe',
      'login': 'Connexion',
      'visitorName': 'Nom du Visiteur',
      'explore': 'Entrer pour Explorer',
      'next': 'Suivant',
      'regDesc': 'Bienvenue! Vous recevrez instantanément un bonus de 500 pièces.',
      'supportDesc': 'Contactez-nous pour toute réclamation.',
      'legalNotice': '© 2026 Production Home 2022. Tous les droits juridiques, commerciaux et techniques sont réservés à l’équipe Production Home 2022. Toute copie, réutilisation, exploitation ou modification de la plateforme, de son identité ou de son contenu nécessite une autorisation écrite préalable des ayants droit.',
    },
    'es': {
      'title': 'Plataforma Mawadda',
      'subtitle': 'La Encrucijada Soberana para el Matrimonio y Emparejamiento Seguro',
      'verifiedLogin': 'Inicio de Sesión de Miembros Verificados',
      'visitorLogin': 'Inicio de Sesión de Visitantes (Modo Exploración)',
      'registerNew': 'Nuevo Usuario (Registrar Cuenta)',
      'support': 'Soporte Técnico y Admin',
      'back': 'Volver al Inicio',
      'email': 'Correo Electrónico',
      'password': 'Contraseña',
      'login': 'Iniciar Sesión',
      'visitorName': 'Nombre de Visitante',
      'explore': 'Entrar a Explorar',
      'next': 'Siguiente',
      'regDesc': '¡Bienvenido! Recibirás un bono de 500 monedas al registrarte.',
      'supportDesc': 'Contáctanos para cualquier queja o consulta.',
      'legalNotice': '© 2026 Production Home 2022. Todos los derechos legales, comerciales y técnicos están reservados al equipo de Production Home 2022. Se prohíbe copiar, reutilizar, explotar o modificar cualquier parte de la plataforma, su identidad o contenido sin autorización previa por escrito de los titulares de los derechos.',
    },
  };

  String _t(String key) {
    return _localizedTexts[_currentLocale]?[key] ?? key;
  }

  @override
  Widget build(context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF311033)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // شريط اختيار اللغات العلوي
              _buildLanguageSelectorBar(),
              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: _buildCurrentView(),
                  ),
                ),
              ),
              _buildLegalFooter(),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _verifiedEmailController.dispose();
    _verifiedPasswordController.dispose();
    _visitorUsernameController.dispose();
    super.dispose();
  }

  Widget _buildLegalFooter() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 900),
          child: Text(
            _t('legalNotice'),
            textAlign: TextAlign.center,
            textDirection: _currentLocale == 'ar' ? TextDirection.rtl : TextDirection.ltr,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.58),
              fontSize: 10,
              height: 1.5,
              letterSpacing: _currentLocale == 'ar' ? 0 : 0.15,
            ),
          ),
        ),
      ),
    );
  }

  // شريط تبديل اللغات الأربع
  Widget _buildLanguageSelectorBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          _langButton('العربية', 'ar'),
          const SizedBox(width: 6),
          _langButton('English', 'en'),
          const SizedBox(width: 6),
          _langButton('Français', 'fr'),
          const SizedBox(width: 6),
          _langButton('Español', 'es'),
        ],
      ),
    );
  }

  Widget _langButton(String label, String code) {
    bool isSelected = _currentLocale == code;
    return GestureDetector(
      onTap: () => setState(() => _currentLocale = code),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.pinkAccent : Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? Colors.pinkAccent : Colors.white24),
        ),
        child: Text(
          label,
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildCurrentView() {
    switch (_currentView) {
      case 'verified_login':
        return _buildVerifiedLoginView();
      case 'visitor_login':
        return _buildVisitorLoginView();
      case 'register_step1':
        return _buildRegisterStep1View();
      case 'support':
        return _buildSupportView();
      default:
        return _buildGatewayView();
    }
  }

  // 1. بوابة الهبوط الرئيسية
  Widget _buildGatewayView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.favorite, size: 80, color: Colors.pinkAccent),
        const SizedBox(height: 16),
        Text(
          _t('title'),
          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.5),
        ),
        const SizedBox(height: 8),
        Text(
          _t('subtitle'),
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14, color: Colors.white70),
        ),
        const SizedBox(height: 40),
        _buildActionButton(_t('verifiedLogin'), Colors.pinkAccent, () {
          setState(() => _currentView = 'verified_login');
        }),
        const SizedBox(height: 16),
        _buildActionButton(_t('visitorLogin'), Colors.purpleAccent, () {
          setState(() => _currentView = 'visitor_login');
        }),
        const SizedBox(height: 16),
        _buildActionButton(_t('registerNew'), Colors.deepOrangeAccent, () {
          setState(() => _currentView = 'register_step1');
        }),
        const SizedBox(height: 16),
        _buildActionButton(_t('support'), Colors.blueGrey, () {
          setState(() => _currentView = 'support');
        }),
      ],
    );
  }

  Widget _buildActionButton(String title, Color color, VoidCallback onPressed) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        onPressed: onPressed,
        child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
      ),
    );
  }

  Widget _buildBackButton() {
    return Align(
      alignment: Alignment.centerLeft,
      child: TextButton.icon(
        onPressed: () => setState(() => _currentView = 'gateway'),
        icon: const Icon(Icons.arrow_back, color: Colors.white70),
        label: Text(_t('back'), style: const TextStyle(color: Colors.white70)),
      ),
    );
  }

  // 2. واجهة دخول الموثقين
  Widget _buildVerifiedLoginView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildBackButton(),
        const SizedBox(height: 10),
        Text(_t('verifiedLogin'), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 20),
        TextField(
          controller: _verifiedEmailController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(labelText: _t('email'), labelStyle: const TextStyle(color: Colors.white70)),
        ),
        const SizedBox(height: 15),
        TextField(
          controller: _verifiedPasswordController,
          obscureText: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(labelText: _t('password'), labelStyle: const TextStyle(color: Colors.white70)),
        ),
        const SizedBox(height: 30),
        _buildActionButton(_t('login'), Colors.pinkAccent, () {}),
      ],
    );
  }

  // 3. واجهة دخول الزوار
  Widget _buildVisitorLoginView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildBackButton(),
        const SizedBox(height: 10),
        Text(_t('visitorLogin'), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 20),
        TextField(
          controller: _visitorUsernameController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(labelText: _t('visitorName'), labelStyle: const TextStyle(color: Colors.white70)),
        ),
        const SizedBox(height: 30),
        _buildActionButton(_t('explore'), Colors.purpleAccent, () {}),
      ],
    );
  }

  // 4. مستخدم جديد - الخطوة الأولى
  Widget _buildRegisterStep1View() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildBackButton(),
        const SizedBox(height: 10),
        Text(_t('registerNew'), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 20),
        Text(_t('regDesc'), style: const TextStyle(color: Colors.white70)),
        const SizedBox(height: 30),
        _buildActionButton(_t('next'), Colors.deepOrangeAccent, () {
          setState(() => _currentView = 'register_step2');
        }),
      ],
    );
  }

  // 5. الدعم الفني
  Widget _buildSupportView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildBackButton(),
        const SizedBox(height: 10),
        Text(_t('support'), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 20),
        Text(_t('supportDesc'), style: const TextStyle(color: Colors.white70)),
      ],
    );
  }
}
