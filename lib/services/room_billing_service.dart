import 'package:cloud_firestore/cloud_firestore.dart';

class RoomBillingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // 1. تحديد تكلفة الاستئجار والمدة الزمنية من قبل السوبر أدمن
  Future<void> setRoomRentalPolicy({
    required int rentalCost,
    required int durationDays,
  }) async {
    await _firestore.collection('system_policies').doc('room_rental_policy').set({
      'rentalCost': rentalCost,
      'durationDays': durationDays,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // 2. فحص حالة الغرف المستأجرة وإنذار أو تجميد الغرفة عند انتهاء المدة
  Future<void> checkAndProcessExpiredRooms() async {
    DateTime now = DateTime.now();

    // جلب الغرف النشطة التي انتهت مدتها
    QuerySnapshot expiredRooms = await _firestore
        .collection('rooms')
        .where('isPrivateRented', isEqualTo: true)
        .where('expiresAt', isLessThan: now)
        .get();

    for (var doc in expiredRooms.docs) {
      var data = doc.data() as Map<String, dynamic>;
      String roomId = doc.id;
      String ownerId = data['ownerId'];
      String status = data['status'] ?? 'active'; // active, warning, frozen, cancelled

      if (status == 'active') {
        // المرحلة الأولى: إرسال تنبيه قبل 24 ساعة أو بدء فترة التجميد الأولى
        await _firestore.collection('rooms').doc(roomId).update({
          'status': 'frozen',
          'frozenAt': FieldValue.serverTimestamp(),
          'freezeExpiresAt': now.add(const Duration(hours: 24)).toIso8601String(),
        });

        // إرسال إشعار للمالك بالتجميد وضرورة الشحن
        await _firestore.collection('notifications').add({
          'userId': ownerId,
          'title': 'إنذار تجميد الغرفة المستأجرة ⚠️',
          'body': 'انتهت مدة استئجار غرفتك ولم يتم شحن رصيد كافٍ للتمديد. تم تجميد الغرفة لمدة 24 ساعة، يرجى الشحن لتفادي الإلغاء.',
          'timestamp': FieldValue.serverTimestamp(),
        });
      } else if (status == 'frozen') {
        // انتهت مهلة التجميد (24 ساعة إضافية) ولم يتم الشحن -> إلغاء الغرفة نهائياً
        await _firestore.collection('rooms').doc(roomId).update({
          'status': 'cancelled',
          'isPrivateRented': false,
          'cancelledAt': FieldValue.serverTimestamp(),
        });

        await _firestore.collection('notifications').add({
          'userId': ownerId,
          'title': 'إلغاء الغرفة المستأجرة ❌',
          'body': 'تم إلغاء وسحب غرفتك المستأجرة لعدم توفر رصيد كافٍ لتجديد الاستئجار بعد انتهاء فترة التجميد.',
          'timestamp': FieldValue.serverTimestamp(),
        });
      }
    }
  }

  // 3. محاولة التجديد التلقائي واقتطاع الأجرة عند توفر الرصيد
  Future<bool> attemptAutoRenewal(String roomId, String ownerId, int cost) async {
    DocumentSnapshot userDoc = await _firestore.collection('users').doc(ownerId).get();
    if (!userDoc.exists) return false;

    int userCoins = userDoc.get('coins') ?? 0;

    if (userCoins >= cost) {
      // خصم الكوينز وتجديد الغرفة
      await _firestore.collection('users').doc(ownerId).update({
        'coins': FieldValue.increment(-cost),
      });

      DateTime newExpiry = DateTime.now().add(const Duration(days: 30)); // مثلاً تجديد لـ 30 يوم
      await _firestore.collection('rooms').doc(roomId).update({
        'expiresAt': newExpiry.toIso8601String(),
        'status': 'active',
      });
      return true;
    }
    return false;
  }
}
