// File: lib/models/user_model.dart
// Production Home 2022 - Mawda Platform User Model
class UserModel {
  final String uid;
  final String email;
  final String displayName;
  final int coins; // الحقل الموحد والثابت للعملات

  UserModel({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.coins,
  });

  factory UserModel.fromMap(Map<String, dynamic> map, String documentId) {
    return UserModel(
      uid: documentId,
      email: map['email'] ?? '',
      displayName: map['displayName'] ?? 'مستخدم مودة',
      coins: map['coins'] ?? map['coinsBalance'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'displayName': displayName,
      'coins': coins,
    };
  }
}
