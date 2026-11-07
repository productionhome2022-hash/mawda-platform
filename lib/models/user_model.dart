class UserModel {
  final String uid;
  final String email;
  final String fullName;
  final String gender;
  final String bio;
  final String profileImageUrl;
  final bool isVerified;

  UserModel({
    required this.uid,
    required this.email,
    required this.fullName,
    required this.gender,
    this.bio = '',
    this.profileImageUrl = '',
    this.isVerified = false,
  });

  // تحويل البيانات القادمة من قاعدة البيانات (Firestore) إلى كائن (Object)
  factory UserModel.fromMap(Map<String, dynamic> map, String documentId) {
    return UserModel(
      uid: documentId,
      email: map['email'] ?? '',
      fullName: map['fullName'] ?? '',
      gender: map['gender'] ?? 'غير محدد',
      bio: map['bio'] ?? '',
      profileImageUrl: map['profileImageUrl'] ?? '',
      isVerified: map['isVerified'] ?? false,
    );
  }

  // تحويل بيانات المستخدم إلى خريطة (Map) لحفظها في قاعدة البيانات
  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'fullName': fullName,
      'gender': gender,
      'bio': bio,
      'profileImageUrl': profileImageUrl,
      'isVerified': isVerified,
    };
  }
}
