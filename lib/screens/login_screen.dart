// File: lib/screens/login_screen.dart
// Production Home 2022 - Mawda Platform Auth Screen
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'main_user_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  bool _isSignUpMode = false;

  void _submitForm() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال البريد الإلكتروني وكلمة المرور')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (_isSignUpMode) {
        // إنشاء حساب جديد للأعضاء الجدد
        await _authService.signUpWithEmail(email, password);
      } else {
        // تسجيل الدخول لحساب قائم
        await _authService.signInWithEmail(email, password);
      }

      if (mounted) {
        // التوجيه الصحيح إلى الشاشة الرئيسية للمستخدم (وليس المتجر)
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainUserScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('حدث خطأ: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isSignUpMode ? 'إنشاء حساب جديد' : 'تسجيل الدخول - منصة مودة'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'البريد الإلكتروني',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'كلمة المرور',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),
              _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _submitForm,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(50),
                      ),
                      child: Text(_isSignUpMode ? 'إنشاء الحساب الان' : 'دخول'),
                    ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  setState(() {
                    _isSignUpMode = !_isSignUpMode;
                  });
                },
                child: Text(_isSignUpMode
                    ? 'لديك حساب بالفعل؟ سجل الدخول هنا'
                    : 'ليس لديك حساب؟ اضغط هنا لإنشاء حساب جديد'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
