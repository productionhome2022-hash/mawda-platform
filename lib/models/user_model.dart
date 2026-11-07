class UserModel {
  final String uid;
  final String email;
  final String fullName;
  final String gender;
  final String bio;
  final String profileImageUrl;
  
  // حالات التوثيق والكوينز
  final bool isEmailVerified;
  final bool isBiometricVerified;
  final int coinsBalance;
  
  // الألقاب والأوسمة والشرائح
  final String activeTitle;
  final List<String> badges;
  
  // الأدوار والسيطرة (أدمن، مشرف، عضو)
  final String role; // 'super_admin', 'moderator', 'user'
  final bool isGhostModeEnabled; // وضع التخفي للسوبر أدمن

  UserModel({
    required this.uid,
    required this.email,
    required this.fullName,
    required this.gender,
    this.bio = '',
    this.profileImageUrl = '',
    this.isEmailVerified = false,
    this.isBiometricVerified = false,
    this.coinsBalance = 0,
    this.activeTitle = 'عضو جديد',
    this.badges = const [],
    this.role = 'user',
    this.isGhostModeEnabled = false,
  });

  // تحويل البيانات القادمة من Firestore
  factory UserModel.fromMap(Map<String, dynamic> map, String documentId) {
    return UserModel(
      uid: documentId,
      email: map['email'] ?? '',
      fullName: map['fullName'] ?? '',
      gender: map['gender'] ?? 'غير محدد',
      bio: map['bio'] ?? '',
      profileImageUrl: map['profileImageUrl'] ?? '',
      isEmailVerified: map['isEmailVerified'] ?? false,
      isBiometricVerified: map['isBiometricVerified'] ?? false,
      coinsBalance: map['coinsBalance'] ?? 0,
      activeTitle: map['activeTitle'] ?? 'عضو جديد',
      badges: List<String>.from(map['badges'] ?? []),
      role: map['role'] ?? 'user',
      isGhostModeEnabled: map['isGhostModeEnabled'] ?? false,
    );
  }

  // تحويل البيانات لحفظها في Firestore
  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'fullName': fullName,
      'gender': gender,
      'bio': bio,
      'profileImageUrl': profileImageUrl,
      'isEmailVerified': isEmailVerified,
      'isBiometricVerified': isBiometricVerified,
      'coinsBalance': coinsBalance,
      'activeTitle': activeTitle,
      'badges': badges,
      'role': role,
      'isGhostModeEnabled': isGhostModeEnabled,
    };
  }
}
