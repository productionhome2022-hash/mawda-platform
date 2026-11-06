// ==========================================
// ملف النماذج الشامل والنهائي لتطبيق مودة (mawda-app-2026)
// (يشمل البروفايل، الإشعارات، الهدايا، اليوميات، الستوريات، والدردشات)
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
  final Map<String, dynamic> rewardsTracker; // تتبع المكافآت (يومي، ساعي، أسبوعي)
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
    this.rewardsTracker = const {},
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
      'rewardsTracker': rewardsTracker,
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
      rewardsTracker: Map<String, dynamic>.from(map['rewardsTracker'] ?? {}),
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
    );
  }
}

// 2. نموذج الإشعارات الشامل (رسائل، إشارات، طلبات، هدايا، وتنبيهات الإدارة)
class NotificationModel {
  final String notificationId;
  final String userId;             // العضو المستلم للإشعار
  final String senderId;           // العضو المرسل (أو 'admin' للإدارة العامة)
  final String type;               // نوع الإشعار: ('message', 'mention', 'friend_request', 'gift', 'admin_broadcast')
  final String title;              // عنوان الإشعار
  final String body;               // نص الإشعار التفصيلي
  final String targetId;           // معرف الهدف للتوجه إليه مباشرة (مثل roomId أو postId)
  final bool isRead;               // هل تمت قراءة الإشعار؟
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

// 3. نموذج الهدايا وإهداء الكوينز، الأوسمة، والألقاب بين الأعضاء
class GiftTransactionModel {
  final String giftId;
  final String senderId;
  final String receiverId;
  final String giftType;           // ('coins', 'badge', 'title')
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

// 4. نموذج اليوميات والمنشورات (نشر، تفاعلات، ومشاركة)
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

// 5. نموذج الستوريات (ميزة مستأجرة تنتهي بعد 24 ساعة)
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

// 6. نموذج طلبات التوثيق البيومتري
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

// 7. نموذج غرف الدردشة (العامة والمستأجرة الخاصة)
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

// 8. نموذج الرسائل (مع التدمير التلقائي بعد ساعتين والحذف للجميع)
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

// 9. نموذج الإعلانات التجارية (للسوبر أدمن حصراً)
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
