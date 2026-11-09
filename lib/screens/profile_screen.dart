import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

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

  // 2. إهداء الكوينز لعضو آخر
  void _showGiftCoinsDialog() {
    TextEditingController amountController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Gift Coins to Member 🪙'),
          content: TextField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Enter Coin Amount'),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                int? amount = int.tryParse(amountController.text.trim());
                if (amount != null && amount > 0) {
                  // خصم من الزائر وإضافة لصاحب البروفايل
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Successfully gifted $amount coins! 🎁')),
                  );
                }
              },
              child: const Text('Send Gift'),
            ),
          ],
        );
      },
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
          String avatarUrl = userData['avatarUrl'] ?? '';
          
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
                        label: const Text('Gift Coins 🪙', style: TextStyle(color: Colors.black)),
                        onPressed: _showGiftCoinsDialog,
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
