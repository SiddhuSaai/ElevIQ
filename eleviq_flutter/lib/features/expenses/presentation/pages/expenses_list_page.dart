import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/expense_model.dart';
import '../../data/models/category_model.dart';
import '../../data/expense_service.dart';
import 'add_expense_page.dart';

class ExpensesListPage extends StatefulWidget {
  const ExpensesListPage({super.key});

  @override
  State<ExpensesListPage> createState() => _ExpensesListPageState();
}

class _ExpensesListPageState extends State<ExpensesListPage> {
  final ExpenseService _expenseService = ExpenseService();
  String? _selectedCategoryFilter;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Expenses'),
        centerTitle: true,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              setState(() {
                _selectedCategoryFilter = value == 'all' ? null : value;
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'all',
                child: Text('All Categories'),
              ),
              const PopupMenuDivider(),
              ...CategoryModel.defaultCategories.map(
                (category) => PopupMenuItem(
                  value: category.id,
                  child: Row(
                    children: [
                      Text(category.icon),
                      const SizedBox(width: 8),
                      Text(category.name),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      body: StreamBuilder<List<ExpenseModel>>(
        stream: _selectedCategoryFilter != null
            ? _expenseService.getExpensesByCategory(_selectedCategoryFilter!)
            : _expenseService.getExpenses(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Error: ${snapshot.error}'),
                ],
              ),
            );
          }

          final expenses = snapshot.data ?? [];

          if (expenses.isEmpty) {
            return _buildEmptyState();
          }

          // Group expenses by date
          final groupedExpenses = _groupExpensesByDate(expenses);

          return RefreshIndicator(
            onRefresh: () async {
              setState(() {});
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: groupedExpenses.length,
              itemBuilder: (context, index) {
                final date = groupedExpenses.keys.elementAt(index);
                final dayExpenses = groupedExpenses[date]!;
                return _buildDateGroup(date, dayExpenses);
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _navigateToAddExpense(),
        icon: const Icon(Icons.add),
        label: const Text('Add Expense'),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No expenses yet',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tap the button below to add your first expense',
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () => _navigateToAddExpense(),
            icon: const Icon(Icons.add),
            label: const Text('Add Expense'),
          ),
        ],
      ),
    );
  }

  Map<String, List<ExpenseModel>> _groupExpensesByDate(
    List<ExpenseModel> expenses,
  ) {
    final Map<String, List<ExpenseModel>> grouped = {};
    for (final expense in expenses) {
      final dateKey = DateFormat('yyyy-MM-dd').format(expense.date);
      grouped.putIfAbsent(dateKey, () => []).add(expense);
    }
    return grouped;
  }

  Widget _buildDateGroup(String dateKey, List<ExpenseModel> expenses) {
    final date = DateTime.parse(dateKey);
    final isToday = DateFormat('yyyy-MM-dd').format(DateTime.now()) == dateKey;
    final isYesterday = DateFormat('yyyy-MM-dd').format(
          DateTime.now().subtract(const Duration(days: 1)),
        ) ==
        dateKey;

    String dateLabel;
    if (isToday) {
      dateLabel = 'Today';
    } else if (isYesterday) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = DateFormat('EEEE, MMMM d').format(date);
    }

    final dayTotal = expenses.fold<double>(
      0,
      (sum, expense) => sum + expense.amount,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                dateLabel,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Text(
                '₹${dayTotal.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
            ],
          ),
        ),
        ...expenses.map((expense) => _buildExpenseCard(expense)),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildExpenseCard(ExpenseModel expense) {
    final category = CategoryModel.findById(expense.categoryId);

    return Dismissible(
      key: Key(expense.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: Colors.red,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      confirmDismiss: (direction) async {
        return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Delete Expense'),
            content: const Text(
              'Are you sure you want to delete this expense?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.red,
                ),
                child: const Text('Delete'),
              ),
            ],
          ),
        );
      },
      onDismissed: (direction) async {
        try {
          await _expenseService.deleteExpense(expense.id);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Expense deleted'),
                backgroundColor: Colors.green,
              ),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Error: $e'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: InkWell(
          onTap: () => _navigateToEditExpense(expense),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Category Icon
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: (category?.color ?? Colors.grey).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      category?.icon ?? '📦',
                      style: const TextStyle(fontSize: 24),
                    ),
                  ),
                ),
                const SizedBox(width: 16),

                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        expense.description,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            category?.name ?? 'Other',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            ' • ',
                            style: TextStyle(color: Colors.grey[400]),
                          ),
                          Text(
                            expense.paymentMethod.displayName,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Amount
                Text(
                  '₹${expense.amount.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _navigateToAddExpense() async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const AddExpensePage()),
    );
    if (result == true) {
      setState(() {});
    }
  }

  Future<void> _navigateToEditExpense(ExpenseModel expense) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => AddExpensePage(expense: expense),
      ),
    );
    if (result == true) {
      setState(() {});
    }
  }
}
