import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'shop_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final FirebaseAuth _auth = FirebaseAuth.instance;
  bool _isLoading = false;

  // البريد الخاص بالسوبر أدمن للتحقق الفوري
  final String superAdminEmail = "admin@mawda.com"; // يمكنك تعديل الإيميل حسب رغبتك

  void _loginUser() async {
    setState(() {
      _isLoading = true;
    });

    try {
      String email = _emailController.text.trim();
      String password = _passwordController.text.trim();

      if (email.isEmpty || password.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('الرجاء إدخال البريد الإلكتروني وكلمة المرور')),
        );
        setState(() { _isLoading = false; });
        return;
      }

      // تسجيل الدخول عبر فايربيس أثنتيكيشن
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      String uid = userCredential.user!.uid;

      // التحقق الذكي: هل هو السوبر أدمن أم عضو عادي؟
      if (email.toLowerCase() == superAdminEmail.toLowerCase()) {
        // توجيه إلى غرفة عمليات السوبر أدمن
        Navigator.pushReplacementNamed(context, '/super_admin');
      } else {
        // توجيه إلى شاشة العضو (متجر ومكافآت) مع تمرير الـ UID الخاص به
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ShopScreen(userId: uid),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في تسجيل الدخول: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تسجيل الدخول - منصة مودة'),
        backgroundColor: Colors.black,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.favorite, size: 80, color: Colors.pinkAccent),
                const SizedBox(height: 20),
                const Text(
                  'أهلاً بك في منصة مودة',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 30),
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'البريد الإلكتروني',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.email),
                  ),
                ),
                const SizedBox(height: 15),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'كلمة المرور',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.lock),
                  ),
                ),
                const SizedBox(height: 25),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.pink),
                    onPressed: _isLoading ? null : _loginUser,
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'تسجيل الدخول',
                            style: TextStyle(fontSize: 18, color: Colors.white),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
