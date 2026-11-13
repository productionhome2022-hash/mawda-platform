// Canonical Flutter projection of the server-owned Mawda users/{uid} document.
// Wallet writes are server-only; "coins" is the sole canonical balance field.
class UserModel {
  final String uid;
  final String email;
  final String displayName;
  final int coins;
  final String? username;
  final String? fullName;
  final int? age;
  final String? profession;
  final String? country;
  final String? region;
  final String? gender;
  final String? maritalStatus;
  final String bio;
  final List<String> interests;
  final List<String> goals;
  final String accountStatus;
  final bool profileCompleted;
  final String profileVisibility;
  final String? avatarMediaId;
  final String? coverMediaId;

  const UserModel({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.coins,
    this.username,
    this.fullName,
    this.age,
    this.profession,
    this.country,
    this.region,
    this.gender,
    this.maritalStatus,
    this.bio = '',
    this.interests = const [],
    this.goals = const [],
    this.accountStatus = 'unknown',
    this.profileCompleted = false,
    this.profileVisibility = 'private',
    this.avatarMediaId,
    this.coverMediaId,
  });

  static String _string(Object? value, [String fallback = '']) =>
      value is String ? value : fallback;

  static int _integer(Object? value, [int fallback = 0]) =>
      value is int ? value : value is num && value.isFinite ? value.toInt() : fallback;

  static List<String> _stringList(Object? value) {
    if (value is! List) return const [];
    return List<String>.unmodifiable(value.whereType<String>());
  }

  factory UserModel.fromMap(Map<String, dynamic> map, String documentId) {
    return UserModel(
      uid: documentId,
      email: _string(map['email']),
      displayName: _string(map['displayName'], 'مستخدم مودة'),
      // Read the legacy alias only for migration compatibility; never write it.
      coins: _integer(map['coins'] ?? map['coinsBalance']),
      username: map['username'] is String ? map['username'] as String : null,
      fullName: map['fullName'] is String ? map['fullName'] as String : null,
      age: map['age'] is num ? _integer(map['age']) : null,
      profession: map['profession'] is String ? map['profession'] as String : null,
      country: map['country'] is String ? map['country'] as String : null,
      region: map['region'] is String ? map['region'] as String : null,
      gender: map['gender'] is String ? map['gender'] as String : null,
      maritalStatus: map['maritalStatus'] is String ? map['maritalStatus'] as String : null,
      bio: _string(map['bio']),
      interests: _stringList(map['interests']),
      goals: _stringList(map['goals']),
      // Unknown/missing account states remain non-active in the client projection.
      accountStatus: _string(map['accountStatus'], 'unknown'),
      profileCompleted: map['profileCompleted'] == true,
      profileVisibility: _string(map['profileVisibility'], 'private'),
      avatarMediaId: map['avatarMediaId'] is String ? map['avatarMediaId'] as String : null,
      coverMediaId: map['coverMediaId'] is String ? map['coverMediaId'] as String : null,
    );
  }

  /// Serializes only the canonical member-profile projection. Privileged fields,
  /// verification claims and wallet balances must be changed through callables.
  Map<String, dynamic> toMap() => {
        'email': email,
        'displayName': displayName,
        'fullName': fullName ?? displayName,
        'username': username,
        'age': age,
        'profession': profession,
        'country': country,
        'region': region,
        'gender': gender,
        'maritalStatus': maritalStatus,
        'bio': bio,
        'interests': interests,
        'goals': goals,
        'accountStatus': accountStatus,
        'profileCompleted': profileCompleted,
        'profileVisibility': profileVisibility,
        'avatarMediaId': avatarMediaId,
        'coverMediaId': coverMediaId,
        'coins': coins,
      };
}
