import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/app_models.dart';

/// Read-only client access for member data.
/// Profile creation, verification awards and all balance mutations belong
/// to trusted Cloud Functions; Firestore rules reject client-side writes.
class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  @Deprecated('Use a trusted completeMemberProfile Cloud Function; direct profile writes are disabled.')
  Future<void> saveNewUser(UserModel user) async {
    throw UnsupportedError(
      'إنشاء ملف العضو يتم عبر خدمة خادمية موثوقة، وليس من تطبيق العميل.',
    );
  }

  @Deprecated('Biometric verification and its reward must be confirmed by a trusted backend provider.')
  Future<void> verifyUserBiometric(String uid, int currentCoins) async {
    throw UnsupportedError(
      'لا يمكن اعتماد التوثيق البيومتري أو صرف مكافأته من تطبيق العميل.',
    );
  }

  Future<UserModel?> getUserData(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    final data = doc.data();
    if (!doc.exists || data == null) return null;
    return UserModel.fromMap(data);
  }
}
