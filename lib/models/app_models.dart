// ==========================================
// ملف النماذج الشامل والنهائي لتطبيق مودة (mawda-app-2026)
// (غرفة العمليات الكبرى: البروفايل، الإشعارات، الحظر، المشرفون، والنظام المالي)
// ==========================================

// 1. نموذج المستخدم الشامل (البروفايل الاجتماعي المتكامل ولوحة التحكم)
class UserModel {
  final String uid;
  final String username;          // المعرف الفريد الخاص بالبروفايل (مثل @username)
  final String email;
  final String displayName;
  final String profileImageUrl;   // الصورة الشخصية
  final String coverImageUrl;     // صورة الغلاف
  final String bio;               // النبذة التعريفية والحالة الشخصية
  final String location;          // الموقع الجغرافي
  final String relationshipStatus;// الحالة الاجتماعية / هدف التعارف
  final bool isEmailVerified;       // توثيق البريد الإلزامي (500 كوينز)
  final bool isBiometricVerified;  // التوثيق البيومتري (1500 كوينز)
  final int coins;                 // رصيد الكوينز الحالي
  final List<String> badges;       // قائمة الأوسمة المملوكة
  final List<String> titles;       // قائمة الألقاب المملوكة
  final List<String> photosGallery;// معرض الصور الشخصية (ألبومات العضو)
  final String lastKnownIp;        // آخر عنوان IP استخدمه العضو (لأغراض المراقبة والأمان)
  final String deviceId;           // معرف الجهاز الفريد
  final bool isBanned;             // هل الحساب محظور؟
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.uid,
    required this.username,
    required this.email,
    required this.displayName,
    this.profileImageUrl = '',
    this.coverImageUrl = '',
    this.bio = '',
    this.location = '',
    this.relationshipStatus = '',
    this.isEmailVerified = false,
    this.isBiometricVerified = false,
    this.coins = 500,
    this.badges = const [],
    this.titles = const [],
    this.photosGallery = const [],
    this.lastKnownIp = '',
    this.deviceId = '',
    this.isBanned = false,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'username': username,
      'email': email,
      'displayName': displayName,
      'profileImageUrl': profileImageUrl,
      'coverImageUrl': coverImageUrl,
      'bio': bio,
      'location': location,
      'relationshipStatus': relationshipStatus,
      'isEmailVerified': isEmailVerified,
      'isBiometricVerified': isBiometricVerified,
      'coins': coins,
      'badges': badges,
      'titles': titles,
      'photosGallery': photosGallery,
      'lastKnownIp': lastKnownIp,
      'deviceId': deviceId,
      'isBanned': isBanned,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      uid: map['uid'] ?? '',
      username: map['username'] ?? '',
      email: map['email'] ?? '',
      displayName: map['displayName'] ?? '',
      profileImageUrl: map['profileImageUrl'] ?? '',
      coverImageUrl: map['coverImageUrl'] ?? '',
      bio: map['bio'] ?? '',
      location: map['location'] ?? '',
      relationshipStatus: map['relationshipStatus'] ?? '',
      isEmailVerified: map['isEmailVerified'] ?? false,
      isBiometricVerified: map['isBiometricVerified'] ?? false,
      coins: map['coins'] ?? 0,
      badges: List<String>.from(map['badges'] ?? []),
      titles: List<String>.from(map['titles'] ?? []),
      photosGallery: List<String>.from(map['photosGallery'] ?? []),
      lastKnownIp: map['lastKnownIp'] ?? '',
      deviceId: map['deviceId'] ?? '',
      isBanned: map['isBanned'] ?? false,
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
    );
  }
}

// 2. نموذج صلاحيات المشرفين المساعدين (Moderators)
class ModeratorPermissionModel {
  final String moderatorId;
  final String userId;
  final bool canManageRooms;       // مراقبة الغرف العامة
  final bool canBanUsers;          // صلاحية الحظر المؤقت
  final bool canReviewVerifications;// مراجعة طلبات التوثيق
  final DateTime assignedAt;

  ModeratorPermissionModel({
    required this.moderatorId,
    required this.userId,
    this.canManageRooms = true,
    this.canBanUsers = false,
    this.canReviewVerifications = false,
    required this.assignedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'moderatorId': moderatorId,
      'userId': userId,
      'canManageRooms': canManageRooms,
      'canBanUsers': canBanUsers,
      'canReviewVerifications': canReviewVerifications,
      'assignedAt': assignedAt.toIso8601String(),
    };
  }

  factory ModeratorPermissionModel.fromMap(Map<String, dynamic> map) {
    return ModeratorPermissionModel(
      moderatorId: map['moderatorId'] ?? '',
      userId: map['userId'] ?? '',
      canManageRooms: map['canManageRooms'] ?? true,
      canBanUsers: map['canBanUsers'] ?? false,
      canReviewVerifications: map['canReviewVerifications'] ?? false,
      assignedAt: DateTime.parse(map['assignedAt']),
    );
  }
}

// 3. نموذج سجلات الحظر (24 ساعة، 3 أيام، أسبوع، أو نهائي حسب الجهاز والـ IP)
class BanRecordModel {
  final String banId;
  final String targetUserId;
  final String targetIp;
  final String targetDeviceId;
  final String reason;
  final DateTime bannedAt;
  final DateTime expiresAt;        // إذا كانت فارغة أو بعيدة جداً تعني حظراً نهائياً
  final String bannedByAdminId;

  BanRecordModel({
    required this.banId,
    required this.targetUserId,
    required this.targetIp,
    required this.targetDeviceId,
    required this.reason,
    required this.bannedAt,
    required this.expiresAt,
    required this.bannedByAdminId,
  });

  Map<String, dynamic> toMap() {
    return {
      'banId': banId,
      'targetUserId': targetUserId,
      'targetIp': targetIp,
      'targetDeviceId': targetDeviceId,
      'reason': reason,
      'bannedAt': bannedAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
      'bannedByAdminId': bannedByAdminId,
    };
  }

  factory BanRecordModel.fromMap(Map<String, dynamic> map) {
    return BanRecordModel(
      banId: map['banId'] ?? '',
      targetUserId: map['targetUserId'] ?? '',
      targetIp: map['targetIp'] ?? '',
      targetDeviceId: map['targetDeviceId'] ?? '',
      reason: map['reason'] ?? '',
      bannedAt: DateTime.parse(map['bannedAt']),
      expiresAt: DateTime.parse(map['expiresAt']),
      bannedByAdminId: map['bannedByAdminId'] ?? '',
    );
  }
}

// 4. نموذج الإعدادات المالية واقتصاد المنصة (باقات الكوينز ومكافآت الحضور والإعلانات)
class PlatformFinancialConfigModel {
  final int dailyRewardCoins;      // مكافأة الحضور اليومي
  final int hourlyRewardCoins;     // مكافأة الحضور الساعي
  final int weeklyRewardCoins;     // مكافأة الحضور الأسبوعي المتواصل
  final int adWatchRewardCoins;    // مكافأة الكوينز الخاصة بمشاهدة الإعلانات التجارية
  final Map<String, dynamic> coinPackages; // باقات بيع الكوينز المتنوعة

  PlatformFinancialConfigModel({
    this.dailyRewardCoins = 50,
    this.hourlyRewardCoins = 10,
    this.weeklyRewardCoins = 500,
    this.adWatchRewardCoins = 20,
    this.coinPackages = const {},
  });

  Map<String, dynamic> toMap() {
    return {
      'dailyRewardCoins': dailyRewardCoins,
      'hourlyRewardCoins': hourlyRewardCoins,
      'weeklyRewardCoins': weeklyRewardCoins,
      'adWatchRewardCoins': adWatchRewardCoins,
      'coinPackages': coinPackages,
    };
  }

  factory PlatformFinancialConfigModel.fromMap(Map<String, dynamic> map) {
    return PlatformFinancialConfigModel(
      dailyRewardCoins: map['dailyRewardCoins'] ?? 50,
      hourlyRewardCoins: map['hourlyRewardCoins'] ?? 10,
      weeklyRewardCoins: map['weeklyRewardCoins'] ?? 500,
      adWatchRewardCoins: map['adWatchRewardCoins'] ?? 20,
      coinPackages: Map<String, dynamic>.from(map['coinPackages'] ?? {}),
    );
  }
}

// 5. نموذج نظام المكافآت وتتبع تكرار الاستلام للمستخدم
class RewardModel {
  final String userId;
  final DateTime? lastDailyClaim;     
  final DateTime? lastHourlyClaim;    
  final DateTime? lastWeeklyClaim;    
  final int weeklyStreakCount;        

  RewardModel({
    required this.userId,
    this.lastDailyClaim,
    this.lastHourlyClaim,
    this.lastWeeklyClaim,
    this.weeklyStreakCount = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'lastDailyClaim': lastDailyClaim?.toIso8601String(),
      'lastHourlyClaim': lastHourlyClaim?.toIso8601String(),
      'lastWeeklyClaim': lastWeeklyClaim?.toIso8601String(),
      'weeklyStreakCount': weeklyStreakCount,
    };
  }

  factory RewardModel.fromMap(Map<String, dynamic> map) {
    return RewardModel(
      userId: map['userId'] ?? '',
      lastDailyClaim: map['lastDailyClaim'] != null ? DateTime.parse(map['lastDailyClaim']) : null,
      lastHourlyClaim: map['lastHourlyClaim'] != null ? DateTime.parse(map['lastHourlyClaim']) : null,
      lastWeeklyClaim: map['lastWeeklyClaim'] != null ? DateTime.parse(map['lastWeeklyClaim']) : null,
      weeklyStreakCount: map['weeklyStreakCount'] ?? 0,
    );
  }
}

// 6. نموذج الإشعارات الشامل (رسائل، إشارات، طلبات، هدايا، وتنبيهات الإدارة)
class NotificationModel {
  final String notificationId;
  final String userId;
  final String senderId;
  final String type;               
  final String title;
  final String body;
  final String targetId;
  final bool isRead;
  final DateTime timestamp;

  NotificationModel({
    required this.notificationId,
    required this.userId,
    required this.senderId,
    required this.type,
    required this.title,
    required this.body,
    this.targetId = '',
    this.isRead = false,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'notificationId': notificationId,
      'userId': userId,
      'senderId': senderId,
      'type': type,
      'title': title,
      'body': body,
      'targetId': targetId,
      'isRead': isRead,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory NotificationModel.fromMap(Map<String, dynamic> map) {
    return NotificationModel(
      notificationId: map['notificationId'] ?? '',
      userId: map['userId'] ?? '',
      senderId: map['senderId'] ?? '',
      type: map['type'] ?? '',
      title: map['title'] ?? '',
      body: map['body'] ?? '',
      targetId: map['targetId'] ?? '',
      isRead: map['isRead'] ?? false,
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 7. نموذج الهدايا وإهداء الكوينز، الأوسمة، والألقاب بين الأعضاء
class GiftTransactionModel {
  final String giftId;
  final String senderId;
  final String receiverId;
  final String giftType;           
  final String giftValue;
  final DateTime timestamp;

  GiftTransactionModel({
    required this.giftId,
    required this.senderId,
    required this.receiverId,
    required this.giftType,
    required this.giftValue,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'giftId': giftId,
      'senderId': senderId,
      'receiverId': receiverId,
      'giftType': giftType,
      'giftValue': giftValue,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory GiftTransactionModel.fromMap(Map<String, dynamic> map) {
    return GiftTransactionModel(
      giftId: map['giftId'] ?? '',
      senderId: map['senderId'] ?? '',
      receiverId: map['receiverId'] ?? '',
      giftType: map['giftType'] ?? '',
      giftValue: map['giftValue'] ?? '',
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 8. نموذج اليوميات والمنشورات (نشر، تفاعلات، ومشاركة)
class PostModel {
  final String postId;
  final String authorId;
  final String contentText;
  final String mediaUrl;
  final String mediaType;
  final List<String> likes;
  final int sharesCount;
  final DateTime createdAt;

  PostModel({
    required this.postId,
    required this.authorId,
    required this.contentText,
    this.mediaUrl = '',
    this.mediaType = 'text',
    this.likes = const [],
    this.sharesCount = 0,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'postId': postId,
      'authorId': authorId,
      'contentText': contentText,
      'mediaUrl': mediaUrl,
      'mediaType': mediaType,
      'likes': likes,
      'sharesCount': sharesCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory PostModel.fromMap(Map<String, dynamic> map) {
    return PostModel(
      postId: map['postId'] ?? '',
      authorId: map['authorId'] ?? '',
      contentText: map['contentText'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      mediaType: map['mediaType'] ?? 'text',
      likes: List<String>.from(map['likes'] ?? []),
      sharesCount: map['sharesCount'] ?? 0,
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 9. نموذج الستوريات (ميزة مستأجرة تنتهي بعد 24 ساعة)
class StoryModel {
  final String storyId;
  final String userId;
  final String mediaUrl;
  final DateTime createdAt;
  final DateTime expiresAt;

  StoryModel({
    required this.storyId,
    required this.userId,
    required this.mediaUrl,
    required this.createdAt,
    required this.expiresAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'storyId': storyId,
      'userId': userId,
      'mediaUrl': mediaUrl,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
    };
  }

  factory StoryModel.fromMap(Map<String, dynamic> map) {
    return StoryModel(
      storyId: map['storyId'] ?? '',
      userId: map['userId'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      createdAt: DateTime.parse(map['createdAt']),
      expiresAt: DateTime.parse(map['expiresAt']),
    );
  }
}

// 10. نموذج طلبات التوثيق البيومتري
class VerificationModel {
  final String requestId;
  final String userId;
  final String audioVoiceprintUrl; 
  final String movingSelfieUrl;    
  final String status;             
  final DateTime submittedAt;

  VerificationModel({
    required this.requestId,
    required this.userId,
    required this.audioVoiceprintUrl,
    required this.movingSelfieUrl,
    this.status = 'pending',
    required this.submittedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'requestId': requestId,
      'userId': userId,
      'audioVoiceprintUrl': audioVoiceprintUrl,
      'movingSelfieUrl': movingSelfieUrl,
      'status': status,
      'submittedAt': submittedAt.toIso8601String(),
    };
  }

  factory VerificationModel.fromMap(Map<String, dynamic> map) {
    return VerificationModel(
      requestId: map['requestId'] ?? '',
      userId: map['userId'] ?? '',
      audioVoiceprintUrl: map['audioVoiceprintUrl'] ?? '',
      movingSelfieUrl: map['movingSelfieUrl'] ?? '',
      status: map['status'] ?? 'pending',
      submittedAt: DateTime.parse(map['submittedAt']),
    );
  }
}

// 11. نموذج غرف الدردشة (العامة والمستأجرة الخاصة)
class RoomModel {
  final String roomId;
  final String roomName;
  final bool isPublic;
  final bool isRented;             
  final String ownerId;            
  final DateTime? rentalExpiresAt; 
  final DateTime createdAt;

  RoomModel({
    required this.roomId,
    required this.roomName,
    required this.isPublic,
    this.isRented = false,
    required this.ownerId,
    this.rentalExpiresAt,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'roomId': roomId,
      'roomName': roomName,
      'isPublic': isPublic,
      'isRented': isRented,
      'ownerId': ownerId,
      'rentalExpiresAt': rentalExpiresAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory RoomModel.fromMap(Map<String, dynamic> map) {
    return RoomModel(
      roomId: map['roomId'] ?? '',
      roomName: map['roomName'] ?? '',
      isPublic: map['isPublic'] ?? true,
      isRented: map['isRented'] ?? false,
      ownerId: map['ownerId'] ?? '',
      rentalExpiresAt: map['rentalExpiresAt'] != null ? DateTime.parse(map['rentalExpiresAt']) : null,
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 12. نموذج الرسائل (مع التدمير التلقائي بعد ساعتين والحذف للجميع)
class MessageModel {
  final String messageId;
  final String roomId;
  final String senderId;
  final String text;
  final String mediaUrl;           
  final String mediaType;          
  final DateTime timestamp;
  final DateTime expiresAt;        
  final bool isDeletedForEveryone; 

  MessageModel({
    required this.messageId,
    required this.roomId,
    required this.senderId,
    required this.text,
    this.mediaUrl = '',
    this.mediaType = 'text',
    required this.timestamp,
    required this.expiresAt,
    this.isDeletedForEveryone = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'messageId': messageId,
      'roomId': roomId,
      'senderId': senderId,
      'text': text,
      'mediaUrl': mediaUrl,
      'mediaType': mediaType,
      'timestamp': timestamp.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
      'isDeletedForEveryone': isDeletedForEveryone,
    };
  }

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel(
      messageId: map['messageId'] ?? '',
      roomId: map['roomId'] ?? '',
      senderId: map['senderId'] ?? '',
      text: map['text'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      mediaType: map['mediaType'] ?? 'text',
      timestamp: DateTime.parse(map['timestamp']),
      expiresAt: DateTime.parse(map['expiresAt']),
      isDeletedForEveryone: map['isDeletedForEveryone'] ?? false,
    );
  }
}

// 13. نموذج الإعلانات التجارية (للسوبر أدمن حصراً)
class AdModel {
  final String adId;
  final String title;
  final String content;
  final String mediaUrl;           
  final String linkUrl;            
  final String createdBy;          
  final DateTime createdAt;

  AdModel({
    required this.adId,
    required this.title,
    required this.content,
    this.mediaUrl = '',
    this.linkUrl = '',
    required this.createdBy,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'adId': adId,
      'title': title,
      'content': content,
      'mediaUrl': mediaUrl,
      'linkUrl': linkUrl,
      'createdBy': createdBy,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory AdModel.fromMap(Map<String, dynamic> map) {
    return AdModel(
      adId: map['adId'] ?? '',
      title: map['title'] ?? '',
      content: map['content'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      linkUrl: map['linkUrl'] ?? '',
      createdBy: map['createdBy'] ?? '',
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}
