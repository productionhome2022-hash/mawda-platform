import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:uuid/uuid.dart';
import '../services/coin_system_service.dart';

class ProfileScreen extends StatefulWidget {
  final String profileUserId; // صاحب البروفايل المراد زيارته
  final String currentUserId; // العضو الزائر حالياً

  const ProfileScreen({
    Key? key,
    required this.profileUserId,
    required this.currentUserId,
  }) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // 1. نظام التدمير الذاتي لصور المعرض بعد أسبوع (7 أيام)
  Future<void> purgeExpiredGalleryImages() async {
    DateTime weekAgo = DateTime.now().subtract(const Duration(days: 7));
    QuerySnapshot expiredImages = await _firestore
        .collection('users')
        .doc(widget.profileUserId)
        .collection('gallery')
        .where('timestamp', isLessThan: weekAgo)
        .get();

    for (var doc in expiredImages.docs) {
      await doc.reference.delete();
    }
  }

  final CoinSystemService _coinService = CoinSystemService();
  bool _isTransferringCoins = false;

  // 2. تحويل الكوينز عبر الخادم مع عرض العمولة والصافي قبل التأكيد.
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
              if (value != null && value > 0) {
                Navigator.pop(dialogContext, value);
              }
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
              _transferSummaryRow('المبلغ الذي سيُخصم منك', '${quote.grossAmount} كوين'),
              _transferSummaryRow(
                'عمولة المنصة (${quote.commissionPercent.toStringAsFixed(2)}%)',
                '${quote.commissionAmount} كوين',
              ),
              const Divider(),
              _transferSummaryRow('الصافي الذي سيصل للعضو', '${quote.netAmount} كوين'),
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

      final receipt = await _coinService.transferCoins(
        recipientUid: widget.profileUserId,
        amount: amount,
        requestId: const Uuid().v4(),
        expectedCommissionBps: quote.commissionBps,
      );

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
        const SnackBar(content: Text('حدث خطأ غير متوقع أثناء التحويل. لم نعرض نجاحاً غير مؤكد.')),
      );
    } finally {
      if (mounted) setState(() => _isTransferringCoins = false);
    }
  }

  Widget _transferSummaryRow(String label, String value) {
    return Padding(
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
  }

  @override
  void initState() {
    super.initState();
    purgeExpiredGalleryImages(); // فحص وحذف صور المعرض الأقدم من أسبوع عند فتح البروفايل
  }

  @override
  Widget build(BuildContext context) {
    bool isMyProfile = widget.currentUserId == widget.profileUserId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mawda Cinematic Profile 🎬'),
        backgroundColor: Colors.black87,
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: _firestore.collection('users').doc(widget.profileUserId).snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          var userData = snapshot.data!.data() as Map<String, dynamic>? ?? {};
          String name = userData['name'] ?? 'Mawda Member';
          String bio = userData['bio'] ?? 'Welcome to my cinematic profile...';
          String coverUrl = userData['coverUrl'] ?? '';
          
          List<dynamic> purchasedFeatures = userData['purchasedFeatures'] ?? [];
          List<dynamic> purchasedBadges = userData['purchasedBadges'] ?? [];

          bool hasThemeFeature = purchasedFeatures.contains('theme_feature');

          return ListView(
            children: [
              // الغلاف الشخصي والصورة الشخصية
              Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.center,
                children: [
                  Container(
                    height: 200,
                    width: double.infinity,
                    color: Colors.grey[800],
                    child: coverUrl.isNotEmpty
                        ? Image.network(coverUrl, fit: BoxFit.cover)
                        : const Center(child: Text('Cinematic Cover 🌆', style: TextStyle(color: Colors.white70))),
                  ),
                  Positioned(
                    bottom: -50,
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.white,
                      child: CircleAvatar(
                        radius: 48,
                        backgroundColor: Colors.deepPurple,
                        child: Text(name[0], style: const TextStyle(fontSize: 32, color: Colors.white)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 60),

              Center(child: Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold))),
              const SizedBox(height: 5),
              Center(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 20), child: Text(bio, style: const TextStyle(color: Colors.grey), textAlign: TextAlign.center))),
              const SizedBox(height: 20),

              // خيارات الزائر (إهداء كوينز وأوسمة إن لم يكن بروفايلك الشخصي)
              if (!isMyProfile) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[700]),
                        icon: const Icon(Icons.monetization_on, color: Colors.black),
                        label: Text(_isTransferringCoins ? 'جارٍ التحويل...' : 'Gift Coins 🪙', style: const TextStyle(color: Colors.black)),
                        onPressed: _isTransferringCoins ? null : _showGiftCoinsDialog,
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                        icon: const Icon(Icons.military_tech),
                        label: const Text('Gift Badge / Title'),
                        onPressed: () {
                          // نافذة إهداء الأوسمة والألقاب المشراة
                        },
                      ),
                    ],
                  ),
                ),
                const Divider(height: 30),
              ],

              // مشغل الموسيقى الشخصي (يظهر فقط إذا اشتراه العضو وفعله)
              if (hasThemeFeature) ...[
                ListTile(
                  leading: const Icon(Icons.music_note, color: Colors.blue),
                  title: const Text('Profile Cinematic Audio Track 🎵'),
                  subtitle: const Text('Tap to play member exclusive audio track.'),
                  trailing: IconButton(
                    icon: const Icon(Icons.play_arrow, color: Colors.green, size: 30),
                    onPressed: () {
                      // تشغيل الملف الصوتي
                    },
                  ),
                ),
                const Divider(height: 20),
              ],

              // الأوسمة والألقاب المشراة حصراً
              if (purchasedBadges.isNotEmpty) ...[
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.0),
                  child: Text('Badges & Titles 👑', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 50,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: purchasedBadges.map((badge) {
                      return Container(
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.amber[100],
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.amber),
                        ),
                        child: Center(child: Text('$badge 🌟', style: const TextStyle(fontWeight: FontWeight.bold))),
                      );
                    }).toList(),
                  ),
                ),
                const Divider(height: 30),
              ],

              // معرض الصور الشخصي (صور تدمر ذاتياً بعد أسبوع)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                child: Text('Member Gallery (Auto-Destructs after 7 Days) 📸⏳', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              const SizedBox(height: 10),
              StreamBuilder<QuerySnapshot>(
                stream: _firestore.collection('users').doc(widget.profileUserId).collection('gallery').orderBy('timestamp', descending: true).snapshots(),
                builder: (context, gallerySnapshot) {
                  if (!gallerySnapshot.hasData || gallerySnapshot.data!.docs.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('No gallery photos currently available.', style: TextStyle(color: Colors.grey), textAlign: TextAlign.center),
                    );
                  }

                  var images = gallerySnapshot.data!.docs;
                  return GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: images.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 4, mainAxisSpacing: 4),
                    itemBuilder: (context, index) {
                      var imgData = images[index].data() as Map<String, dynamic>;
                      String imgUrl = imgData['url'] ?? '';
                      return Container(
                        color: Colors.grey[300],
                        child: imgUrl.isNotEmpty ? Image.network(imgUrl, fit: BoxFit.cover) : const Icon(Icons.image),
                      );
                    },
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
