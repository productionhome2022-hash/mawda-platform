// ==========================================
// ملف النماذج الشامل والنهائي لتطبيق مودة (mawda-app-2026)
// (غرفة العمليات الكبرى: البروفايل، الدعم التقني ورفع لقطات الشاشة، الرقابة المالية، والتحويلات)
// ==========================================

// 1. نموذج المستخدم الشامل
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
  
  // ميزات متجر الميزات الخاصة والتحكم المتقدم
  final List<String> activeSpecialFeatures; // الميزات المفعلة
  final List<String> profileVisitors;       // قائمة UIDs للأعضاء الذين زاروا البروفايل
  final bool isOnlineHidden;                // إخفاء حالة الاتصال
  final bool isGhostModeActive;             // وضع الشبح / المجهول
  final String profileAudioUrl;             // رابط الموسيقى الشخصية عند زيارة البروفايل
  final String chatBackgroundUrl;          // رابط خلفية الدردشة الخاصة

  final String lastKnownIp;        // آخر عنوان IP استخدمه العضو
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
    this.activeSpecialFeatures = const [],
    this.profileVisitors = const [],
    this.isOnlineHidden = false,
    this.isGhostModeActive = false,
    this.profileAudioUrl = '',
    this.chatBackgroundUrl = '',
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
      'activeSpecialFeatures': activeSpecialFeatures,
      'profileVisitors': profileVisitors,
      'isOnlineHidden': isOnlineHidden,
      'isGhostModeActive': isGhostModeActive,
      'profileAudioUrl': profileAudioUrl,
      'chatBackgroundUrl': chatBackgroundUrl,
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
      activeSpecialFeatures: List<String>.from(map['activeSpecialFeatures'] ?? []),
      profileVisitors: List<String>.from(map['profileVisitors'] ?? []),
      isOnlineHidden: map['isOnlineHidden'] ?? false,
      isGhostModeActive: map['isGhostModeActive'] ?? false,
      profileAudioUrl: map['profileAudioUrl'] ?? '',
      chatBackgroundUrl: map['chatBackgroundUrl'] ?? '',
      lastKnownIp: map['lastKnownIp'] ?? '',
      deviceId: map['deviceId'] ?? '',
      isBanned: map['isBanned'] ?? false,
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
    );
  }
}

// 2. نموذج رسائل وتذاكر الدعم التقني (مع دعم إرفاق لقطة شاشة Screenshot للزوار والأعضاء)
class SupportTicketModel {
  final String ticketId;
  final String senderUid;          // معرف العضو (أو "GUEST" إذا كان زائراً من خارج المنصة)
  final String senderEmail;        // بريد للتواصل عند تعذر الدخول
  final String senderPhone;        // رقم للتواصل عند الحاجة
  final String subject;            // عنوان المشكلة أو الاستفسار
  final String message;            // نص الرسالة
  final String screenshotUrl;      // رابط لقطة الشاشة المرفقة لمعاينة المشكلة بدقة
  final String category;           // ('login_issue', 'purchase', 'complaint', 'general_inquiry')
  final String status;             // ('pending', 'in_progress', 'resolved', 'closed')
  final DateTime createdAt;

  SupportTicketModel({
    required this.ticketId,
    this.senderUid = 'GUEST',
    required this.senderEmail,
    this.senderPhone = '',
    required this.subject,
    required this.message,
    this.screenshotUrl = '',
    this.category = 'general_inquiry',
    this.status = 'pending',
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'ticketId': ticketId,
      'senderUid': senderUid,
      'senderEmail': senderEmail,
      'senderPhone': senderPhone,
      'subject': subject,
      'message': message,
      'screenshotUrl': screenshotUrl,
      'category': category,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory SupportTicketModel.fromMap(Map<String, dynamic> map) {
    return SupportTicketModel(
      ticketId: map['ticketId'] ?? '',
      senderUid: map['senderUid'] ?? 'GUEST',
      senderEmail: map['senderEmail'] ?? '',
      senderPhone: map['senderPhone'] ?? '',
      subject: map['subject'] ?? '',
      message: map['message'] ?? '',
      screenshotUrl: map['screenshotUrl'] ?? '',
      category: map['category'] ?? 'general_inquiry',
      status: map['status'] ?? 'pending',
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 3. نموذج الإعدادات المالية (مع باقات المتجر وزر التواصل المباشر)
class PlatformFinancialConfigModel {
  final int dailyRewardCoins;      
  final int hourlyRewardCoins;     
  final int weeklyRewardCoins;     
  final int adWatchRewardCoins;    
  final double transferCommissionPercentage; 
  final Map<String, dynamic> coinPackages; 
  final String customPurchaseContactUrl;  

  PlatformFinancialConfigModel({
    this.dailyRewardCoins = 50,
    this.hourlyRewardCoins = 10,
    this.weeklyRewardCoins = 500,
    this.adWatchRewardCoins = 20,
    this.transferCommissionPercentage = 10.0,
    this.coinPackages = const {},
    this.customPurchaseContactUrl = 'https://wa.me/mawda_admin',
  });

  Map<String, dynamic> toMap() {
    return {
      'dailyRewardCoins': dailyRewardCoins,
      'hourlyRewardCoins': hourlyRewardCoins,
      'weeklyRewardCoins': weeklyRewardCoins,
      'adWatchRewardCoins': adWatchRewardCoins,
      'transferCommissionPercentage': transferCommissionPercentage,
      'coinPackages': coinPackages,
      'customPurchaseContactUrl': customPurchaseContactUrl,
    };
  }

  factory PlatformFinancialConfigModel.fromMap(Map<String, dynamic> map) {
    return PlatformFinancialConfigModel(
      dailyRewardCoins: map['dailyRewardCoins'] ?? 50,
      hourlyRewardCoins: map['hourlyRewardCoins'] ?? 10,
      weeklyRewardCoins: map['weeklyRewardCoins'] ?? 500,
      adWatchRewardCoins: map['adWatchRewardCoins'] ?? 20,
      transferCommissionPercentage: (map['transferCommissionPercentage'] ?? 10.0).toDouble(),
      coinPackages: Map<String, dynamic>.from(map['coinPackages'] ?? {}),
      customPurchaseContactUrl: map['customPurchaseContactUrl'] ?? '',
    );
  }
}

// 4. نموذج السجل والرقابة المالية الشاملة للسوبر أدمن
class CoinAdminAuditModel {
  final String auditId;
  final String transactionType;   
  final String senderId;
  final String receiverId;
  final int amount;
  final String status;            
  final String details;
  final DateTime timestamp;

  CoinAdminAuditModel({
    required this.auditId,
    required this.transactionType,
    required this.senderId,
    required this.receiverId,
    required this.amount,
    this.status = 'completed',
    this.details = '',
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'auditId': auditId,
      'transactionType': transactionType,
      'senderId': senderId,
      'receiverId': receiverId,
      'amount': amount,
      'status': status,
      'details': details,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory CoinAdminAuditModel.fromMap(Map<String, dynamic> map) {
    return CoinAdminAuditModel(
      auditId: map['auditId'] ?? '',
      transactionType: map['transactionType'] ?? '',
      senderId: map['senderId'] ?? '',
      receiverId: map['receiverId'] ?? '',
      amount: map['amount'] ?? 0,
      status: map['status'] ?? 'completed',
      details: map['details'] ?? '',
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 5. نموذج سجلات إلغاء المعاملات والتحويلات المشبوهة
class TransactionCancellationModel {
  final String cancellationId;
  final String targetAuditId;
  final String adminId;
  final String reason;            
  final bool coinsReverted;       
  final DateTime cancelledAt;

  TransactionCancellationModel({
    required this.cancellationId,
    required this.targetAuditId,
    required this.adminId,
    required this.reason,
    this.coinsReverted = true,
    required this.cancelledAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'cancellationId': cancellationId,
      'targetAuditId': targetAuditId,
      'adminId': adminId,
      'reason': reason,
      'coinsReverted': coinsReverted,
      'cancelledAt': cancelledAt.toIso8601String(),
    };
  }

  factory TransactionCancellationModel.fromMap(Map<String, dynamic> map) {
    return TransactionCancellationModel(
      cancellationId: map['cancellationId'] ?? '',
      targetAuditId: map['targetAuditId'] ?? '',
      adminId: map['adminId'] ?? '',
      reason: map['reason'] ?? '',
      coinsReverted: map['coinsReverted'] ?? true,
      cancelledAt: DateTime.parse(map['cancelledAt']),
    );
  }
}

// 6. نموذج تحويل الكوينز بين الأعضاء
class CoinTransferTransactionModel {
  final String transactionId;
  final String senderId;
  final String receiverId;
  final int grossAmount;
  final double commissionPercentage;
  final int commissionAmount;
  final int netAmount;
  final DateTime timestamp;

  CoinTransferTransactionModel({
    required this.transactionId,
    required this.senderId,
    required this.receiverId,
    required this.grossAmount,
    required this.commissionPercentage,
    required this.commissionAmount,
    required this.netAmount,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'transactionId': transactionId,
      'senderId': senderId,
      'receiverId': receiverId,
      'grossAmount': grossAmount,
      'commissionPercentage': commissionPercentage,
      'commissionAmount': commissionAmount,
      'netAmount': netAmount,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory CoinTransferTransactionModel.fromMap(Map<String, dynamic> map) {
    return CoinTransferTransactionModel(
      transactionId: map['transactionId'] ?? '',
      senderId: map['senderId'] ?? '',
      receiverId: map['receiverId'] ?? '',
      grossAmount: map['grossAmount'] ?? 0,
      commissionPercentage: (map['commissionPercentage'] ?? 0.0).toDouble(),
      commissionAmount: map['commissionAmount'] ?? 0,
      netAmount: map['netAmount'] ?? 0,
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 7. نموذج الرسائل (مع وضع الشبح)
class MessageModel {
  final String messageId;
  final String roomId;
  final String senderId;
  final String text;
  final String mediaUrl;
  final String mediaType;
  final bool isAnonymous;
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
    this.isAnonymous = false,
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
      'isAnonymous': isAnonymous,
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
      isAnonymous: map['isAnonymous'] ?? false,
      timestamp: DateTime.parse(map['timestamp']),
      expiresAt: DateTime.parse(map['expiresAt']),
      isDeletedForEveryone: map['isDeletedForEveryone'] ?? false,
    );
  }
}

// 8. نموذج صلاحيات المشرفين المساعدين
class ModeratorPermissionModel {
  final String moderatorId;
  final String userId;
  final bool canManageRooms;
  final bool canBanUsers;
  final bool canReviewVerifications;
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

// 9. نموذج سجلات الحظر الذكي
class BanRecordModel {
  final String banId;
  final String targetUserId;
  final String targetIp;
  final String targetDeviceId;
  final String reason;
  final DateTime bannedAt;
  final DateTime expiresAt;
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

// 10. نموذج نظام المكافآت والحضور
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

// 11. نموذج الإشعارات الشامل
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

// 12. نموذج الهدايا وإهداء الكوينز والأوسمة والألقاب
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

// 13. نموذج اليوميات والمنشورات
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

// 14. نموذج الستوريات المؤقتة
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

// 15. نموذج طلبات التوثيق البيومتري
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

// 16. نموذج غرف الدردشة
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

// 17. نموذج الإعلانات التجارية
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
