import 'package:cloud_firestore/cloud_firestore.dart';

/// Payment method options for expenses
enum PaymentMethod {
  cash,
  card,
  upi,
  netbanking,
  other;

  String get displayName {
    switch (this) {
      case PaymentMethod.cash:
        return 'Cash';
      case PaymentMethod.card:
        return 'Card';
      case PaymentMethod.upi:
        return 'UPI';
      case PaymentMethod.netbanking:
        return 'Net Banking';
      case PaymentMethod.other:
        return 'Other';
    }
  }

  static PaymentMethod fromString(String value) {
    return PaymentMethod.values.firstWhere(
      (e) => e.name == value,
      orElse: () => PaymentMethod.other,
    );
  }
}

/// Expense model representing a single expense entry
class ExpenseModel {
  final String id;
  final String userId;
  final double amount;
  final String category;
  final String categoryId;
  final String description;
  final DateTime date;
  final PaymentMethod paymentMethod;
  final String? notes;
  final String? location;
  final List<String>? tags;
  final DateTime createdAt;
  final DateTime updatedAt;

  ExpenseModel({
    required this.id,
    required this.userId,
    required this.amount,
    required this.category,
    required this.categoryId,
    required this.description,
    required this.date,
    required this.paymentMethod,
    this.notes,
    this.location,
    this.tags,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create from Firestore document
  factory ExpenseModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ExpenseModel(
      id: doc.id,
      userId: data['userId'] ?? '',
      amount: (data['amount'] ?? 0).toDouble(),
      category: data['category'] ?? '',
      categoryId: data['categoryId'] ?? '',
      description: data['description'] ?? '',
      date: (data['date'] as Timestamp).toDate(),
      paymentMethod: PaymentMethod.fromString(data['paymentMethod'] ?? 'cash'),
      notes: data['notes'],
      location: data['location'],
      tags: data['tags'] != null ? List<String>.from(data['tags']) : null,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
    );
  }

  /// Convert to Firestore document
  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'amount': amount,
      'category': category,
      'categoryId': categoryId,
      'description': description,
      'date': Timestamp.fromDate(date),
      'paymentMethod': paymentMethod.name,
      'notes': notes,
      'location': location,
      'tags': tags,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  /// Create a copy with updated fields
  ExpenseModel copyWith({
    String? id,
    String? userId,
    double? amount,
    String? category,
    String? categoryId,
    String? description,
    DateTime? date,
    PaymentMethod? paymentMethod,
    String? notes,
    String? location,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ExpenseModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      amount: amount ?? this.amount,
      category: category ?? this.category,
      categoryId: categoryId ?? this.categoryId,
      description: description ?? this.description,
      date: date ?? this.date,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      notes: notes ?? this.notes,
      location: location ?? this.location,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
