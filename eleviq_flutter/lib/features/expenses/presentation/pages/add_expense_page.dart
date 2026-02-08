import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../data/models/expense_model.dart';
import '../../data/models/category_model.dart';
import '../../data/expense_service.dart';

class AddExpensePage extends StatefulWidget {
  final ExpenseModel? expense; // For editing existing expense

  const AddExpensePage({super.key, this.expense});

  @override
  State<AddExpensePage> createState() => _AddExpensePageState();
}

class _AddExpensePageState extends State<AddExpensePage> {
  final _formKey = GlobalKey<FormState>();
  final _expenseService = ExpenseService();
  
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _notesController = TextEditingController();
  
  CategoryModel? _selectedCategory;
  DateTime _selectedDate = DateTime.now();
  PaymentMethod _selectedPaymentMethod = PaymentMethod.cash;
  bool _isLoading = false;

  bool get _isEditing => widget.expense != null;

  @override
  void initState() {
    super.initState();
    if (_isEditing) {
      _amountController.text = widget.expense!.amount.toStringAsFixed(2);
      _descriptionController.text = widget.expense!.description;
      _notesController.text = widget.expense!.notes ?? '';
      _selectedCategory = CategoryModel.findById(widget.expense!.categoryId);
      _selectedDate = widget.expense!.date;
      _selectedPaymentMethod = widget.expense!.paymentMethod;
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _saveExpense() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a category')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (_isEditing) {
        await _expenseService.updateExpense(
          widget.expense!.copyWith(
            amount: double.parse(_amountController.text),
            category: _selectedCategory!.name,
            categoryId: _selectedCategory!.id,
            description: _descriptionController.text.trim(),
            date: _selectedDate,
            paymentMethod: _selectedPaymentMethod,
            notes: _notesController.text.trim().isEmpty 
                ? null 
                : _notesController.text.trim(),
            updatedAt: DateTime.now(),
          ),
        );
      } else {
        await _expenseService.addExpense(
          amount: double.parse(_amountController.text),
          category: _selectedCategory!.name,
          categoryId: _selectedCategory!.id,
          description: _descriptionController.text.trim(),
          date: _selectedDate,
          paymentMethod: _selectedPaymentMethod,
          notes: _notesController.text.trim().isEmpty 
              ? null 
              : _notesController.text.trim(),
        );
      }

      if (mounted) {
        Navigator.of(context).pop(true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isEditing ? 'Expense updated!' : 'Expense added!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Expense' : 'Add Expense'),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Amount Input
            _buildAmountInput(),
            const SizedBox(height: 24),

            // Category Selector
            _buildCategorySelector(),
            const SizedBox(height: 24),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'What was this expense for?',
                prefixIcon: Icon(Icons.description_outlined),
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter a description';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Date Picker
            _buildDatePicker(),
            const SizedBox(height: 16),

            // Payment Method
            _buildPaymentMethodSelector(),
            const SizedBox(height: 16),

            // Notes (Optional)
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes (Optional)',
                hintText: 'Any additional details...',
                prefixIcon: Icon(Icons.note_outlined),
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 32),

            // Save Button
            SizedBox(
              height: 56,
              child: FilledButton(
                onPressed: _isLoading ? null : _saveExpense,
                child: _isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        _isEditing ? 'Update Expense' : 'Add Expense',
                        style: const TextStyle(fontSize: 16),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAmountInput() {
    return TextFormField(
      controller: _amountController,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
      ],
      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
      textAlign: TextAlign.center,
      decoration: InputDecoration(
        prefixText: '₹ ',
        prefixStyle: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.primary,
        ),
        hintText: '0.00',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        filled: true,
        fillColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter an amount';
        }
        final amount = double.tryParse(value);
        if (amount == null || amount <= 0) {
          return 'Please enter a valid amount';
        }
        return null;
      },
    );
  }

  Widget _buildCategorySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Category',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            childAspectRatio: 1.2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: CategoryModel.defaultCategories.length,
          itemBuilder: (context, index) {
            final category = CategoryModel.defaultCategories[index];
            final isSelected = _selectedCategory?.id == category.id;
            return GestureDetector(
              onTap: () => setState(() => _selectedCategory = category),
              child: Container(
                decoration: BoxDecoration(
                  color: isSelected 
                      ? category.color.withOpacity(0.2) 
                      : Colors.grey.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? category.color : Colors.transparent,
                    width: 2,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      category.icon,
                      style: const TextStyle(fontSize: 28),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      category.name.split(' ').first,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? category.color : null,
                      ),
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: _selectDate,
      borderRadius: BorderRadius.circular(8),
      child: InputDecorator(
        decoration: const InputDecoration(
          labelText: 'Date',
          prefixIcon: Icon(Icons.calendar_today_outlined),
          border: OutlineInputBorder(),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              DateFormat('EEEE, MMMM d, yyyy').format(_selectedDate),
              style: const TextStyle(fontSize: 16),
            ),
            const Icon(Icons.arrow_drop_down),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Payment Method',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: PaymentMethod.values.map((method) {
            final isSelected = _selectedPaymentMethod == method;
            return ChoiceChip(
              label: Text(method.displayName),
              selected: isSelected,
              onSelected: (_) {
                setState(() => _selectedPaymentMethod = method);
              },
            );
          }).toList(),
        ),
      ],
    );
  }
}
