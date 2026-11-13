// ==========================================
// 1. SUMMARY CARD ELEMENTS
// ==========================================

const totalBalanceElement = document.getElementById("total-balance");
const totalIncomeElement = document.getElementById("total-income");
const totalExpensesElement = document.getElementById("total-expenses");


// ==========================================
// 2. TRANSACTION FORM ELEMENTS
// ==========================================

const transactionForm = document.getElementById("transaction-form");
const transactionTitle = document.getElementById("transaction-title");
const transactionAmount = document.getElementById("transaction-amount");
const transactionType = document.getElementById("transaction-type");
const transactionCategory = document.getElementById("transaction-category");
const transactionDate = document.getElementById("transaction-date");


// ==========================================
// 3. TRANSACTION HISTORY ELEMENTS
// ==========================================

const transactionList = document.getElementById("transaction-list");
const searchTransaction = document.getElementById("search-transaction");
const filterType = document.getElementById("filter-type");
const emptyMessage = document.getElementById("empty-message");
const filterMonth = document.getElementById("filter-month");


// ==========================================
// 4. BUDGET ELEMENTS
// ==========================================

const budgetLimitInput = document.getElementById("budget-limit");
const saveBudgetButton = document.getElementById("save-budget");
const budgetPercentage = document.getElementById("budget-percentage");
const progressFill = document.getElementById("progress-fill");
const budgetSummary = document.getElementById("budget-summary");

console.log("SpendWise elements selected successfully!");

// ==========================================
// MONTHLY REPORT ELEMENTS
// ==========================================

const reportMonthInput = document.getElementById("report-month");
const reportIncomeElement = document.getElementById("report-income");
const reportExpensesElement = document.getElementById("report-expenses");
const reportSavingsElement = document.getElementById("report-savings");
const reportSavingsRateElement = document.getElementById("report-savings-rate");


// ==========================================
// 5. LOAD TRANSACTIONS FROM LOCAL STORAGE
// ==========================================

function loadTransactions() {

    const savedTransactions = localStorage.getItem("transactions");

    if (savedTransactions !== null) {

        try {

            const parsedTransactions = JSON.parse(savedTransactions);

            if (Array.isArray(parsedTransactions)) {
                return parsedTransactions;
            }

        } catch (error) {

            console.error("Error loading transactions:", error);

        }
    }

    // Default transactions for first-time users

    return [
        {
            id: 1,
            title: "Monthly Salary",
            amount: 25000,
            type: "income",
            category: "Salary",
            date: "2026-10-31"
        },
        {
            id: 2,
            title: "Lunch",
            amount: 200,
            type: "expense",
            category: "Food",
            date: "2026-10-31"
        },
        {
            id: 3,
            title: "Bus Ticket",
            amount: 50,
            type: "expense",
            category: "Travel",
            date: "2026-10-31"
        }
    ];
}


// ==========================================
// 6. TRANSACTIONS ARRAY
// ==========================================

let transactions = loadTransactions();

// Store the ID of the transaction being edited
let editingTransactionId = null;


// ==========================================
// 7. SAVE TRANSACTIONS
// ==========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ==========================================
// 8. ADD NEW TRANSACTION
// ==========================================

function addTransaction(title, amount, type, category, date) {

    const newTransaction = {
        id: Date.now(),
        title: title,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    transactions.push(newTransaction);

    saveTransactions();

    // Refresh dashboard
    searchAndFilterTransactions();
    updateSummary();
    updateBudget();
    updateMonthlyReport();
    updateMonthlySavingsTrend();

    console.log("Transaction added successfully!");

}


// ==========================================
// 9. DISPLAY TRANSACTIONS
// ==========================================

function displayTransactions() {

    displayFilteredTransactions(transactions);

}


// ==========================================
// 10. DISPLAY FILTERED TRANSACTIONS
// ==========================================

function displayFilteredTransactions(filteredTransactions) {

    transactionList.innerHTML = "";

    if (filteredTransactions.length === 0) {

        emptyMessage.style.display = "block";
        return;

    }

    emptyMessage.style.display = "none";

    filteredTransactions.forEach(function (transaction) {

        const row = document.createElement("tr");

        const values = [
            transaction.title,
            transaction.category,
            transaction.date,
            transaction.type,
            `₹${Number(transaction.amount).toFixed(2)}`
        ];

        values.forEach(function (value) {

            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);

        });

        // Action column
        const actionCell = document.createElement("td");


        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.type = "button";
        editButton.classList.add("edit-btn");

        editButton.addEventListener("click", function () {

            editTransaction(transaction.id);

        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.classList.add("delete-btn");

        deleteButton.addEventListener("click", function () {

            const confirmDelete = confirm(
                "Are you sure you want to delete this transaction?"
            );

            if (!confirmDelete) {
                return;
            }

            transactions = transactions.filter(function (item) {

                return item.id !== transaction.id;

            });

            // Cancel editing if this transaction was being edited
            if (editingTransactionId === transaction.id) {

                resetTransactionForm();

            }

            saveTransactions();

            searchAndFilterTransactions();
            updateSummary();
            updateBudget();
            updateMonthlyReport();
            updateMonthlySavingsTrend();

        });


        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        transactionList.appendChild(row);

    });

}


// ==========================================
// 11. EDIT TRANSACTION
// ==========================================

function editTransaction(id) {

    const transaction = transactions.find(function (item) {

        return item.id === id;

    });

    if (!transaction) {
        return;
    }

    editingTransactionId = id;

    // Fill the form with existing values
    transactionTitle.value = transaction.title;
    transactionAmount.value = transaction.amount;
    transactionType.value = transaction.type;
    transactionCategory.value = transaction.category;
    transactionDate.value = transaction.date;

    // Change submit button text
    const submitButton = transactionForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.textContent = "Update Transaction";

    // Bring the form into view
    document.getElementById("add-transaction").scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// 12. RESET TRANSACTION FORM
// ==========================================

function resetTransactionForm() {

    transactionForm.reset();

    editingTransactionId = null;

    const submitButton = transactionForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.textContent = "Add Transaction";

}


// ==========================================
// 13. CATEGORY-WISE EXPENSE BREAKDOWN
// ==========================================

function updateCategoryBreakdown() {

    const categoryList = document.getElementById("category-list");

    if (!categoryList) {
        return;
    }

    // Get only expense transactions
    const expenses = transactions.filter(function (transaction) {

        return transaction.type === "expense";

    });

    // Group expenses by category
    const categoryTotals = {};

    expenses.forEach(function (transaction) {

        const category = transaction.category;
        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount)) {
            return;
        }

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += amount;

    });

    // Clear previous category details
    categoryList.innerHTML = "";

    // Calculate total expenses
    const totalExpenses = Object.values(categoryTotals).reduce(

        function (total, amount) {
            return total + amount;
        },

        0

    );

    if (totalExpenses === 0) {

        categoryList.textContent = "No expenses available yet.";
        return;

    }

    // Display each category
    for (const category in categoryTotals) {

        const amount = categoryTotals[category];
        const percentage = (amount / totalExpenses) * 100;

        const categoryItem = document.createElement("div");
        categoryItem.className = "category-item";

        const categoryInfo = document.createElement("div");
        categoryInfo.className = "category-info";

        const categoryName = document.createElement("span");
        categoryName.textContent = category;

        const categoryAmount = document.createElement("span");

        categoryAmount.textContent =
            `₹${amount.toFixed(2)} (${percentage.toFixed(1)}%)`;

        categoryInfo.appendChild(categoryName);
        categoryInfo.appendChild(categoryAmount);

        const progressContainer = document.createElement("div");
        progressContainer.className = "category-progress";

        const progressBar = document.createElement("div");
        progressBar.className = "category-progress-fill";
        progressBar.style.width = `${percentage}%`;

        progressContainer.appendChild(progressBar);

        categoryItem.appendChild(categoryInfo);
        categoryItem.appendChild(progressContainer);

        categoryList.appendChild(categoryItem);

    }

    console.log("Category breakdown updated:", categoryTotals);

}


// ==========================================
// 14. HIGHEST SPENDING CATEGORY
// ==========================================


function updateHighestSpendingCategory() {

    const highestCategoryElement =
        document.getElementById("highest-category");

    if (!highestCategoryElement) {
        return;
    }

    // Get only valid expense transactions
    const expenses = transactions.filter(function (transaction) {

        const amount = Number(transaction.amount);

        return (
            transaction.type === "expense" &&
            Number.isFinite(amount) &&
            amount > 0
        );

    });

    if (expenses.length === 0) {
        highestCategoryElement.textContent = "No expenses yet";
        return;
    }

    // Calculate total spending for each category
    const categoryTotals = {};

    expenses.forEach(function (transaction) {

        const category = transaction.category.trim() || "Uncategorized";
        const amount = Number(transaction.amount);

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += amount;

    });

    // Find the category with the highest spending
    let highestCategory = null;

    Object.entries(categoryTotals).forEach(function (item) {

        if (
            highestCategory === null ||
            item[1] > highestCategory[1]
        ) {
            highestCategory = item;
        }

    });

    if (!highestCategory) {
        highestCategoryElement.textContent = "No expenses yet";
        return;
    }

    highestCategoryElement.textContent =
        `${highestCategory[0]}: ₹${highestCategory[1].toFixed(2)}`;

}



// ==========================================
// 15. AVERAGE EXPENSE AND TRANSACTION COUNT
// ==========================================

function updateFinancialInsights() {

    const totalTransactionsElement =
        document.getElementById("total-transactions");

    const averageExpenseElement =
        document.getElementById("average-expense");

    if (!totalTransactionsElement || !averageExpenseElement) {
        return;
    }


    // Get only valid expense transactions
const validExpenses = transactions.filter(function (transaction) {

    const amount = Number(transaction.amount);

    return (
        transaction.type === "expense" &&
        Number.isFinite(amount) &&
        amount > 0
    );

});

// Calculate total valid expenses
const totalExpenseAmount = validExpenses.reduce(
    function (total, transaction) {
        return total + Number(transaction.amount);
    },
    0
);

// Calculate accurate average expense
const averageExpense = validExpenses.length > 0
    ? totalExpenseAmount / validExpenses.length
    : 0;

averageExpenseElement.textContent =
    `₹${averageExpense.toFixed(2)}`;

    totalTransactionsElement.textContent = transactions.length;

}


// ==========================================
// 16. HIGHEST SINGLE EXPENSE
// ==========================================

function updateHighestSingleExpense() {

    const highestExpenseElement =
        document.getElementById("highest-expense");

    // This element is optional until added to HTML
    if (!highestExpenseElement) {
        return;
    }

    const expenses = transactions.filter(function (transaction) {

    const amount = Number(transaction.amount);

    return (
        transaction.type === "expense" &&
        Number.isFinite(amount) &&
        amount > 0
    );

});

    if (expenses.length === 0) {

        highestExpenseElement.textContent = "No expenses yet";
        return;

    }

    // Find highest individual expense
    const highestExpense = expenses.reduce(function (highest, transaction) {

        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount)) {
            return highest;
        }

        if (highest === null || amount > highest.amount) {

            return {
                title: transaction.title,
                amount: amount
            };

        }

        return highest;

    }, null);

    if (!highestExpense) {

        highestExpenseElement.textContent = "No expenses yet";
        return;

    }

    highestExpenseElement.textContent =
        `${highestExpense.title} : ₹${highestExpense.amount.toFixed(2)}`;

}


// ==========================================
// 17. UPDATE SUMMARY CARDS
// ==========================================

function updateSummary() {

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function (transaction) {

        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount)) {
            return;
        }

        if (transaction.type === "income") {

            totalIncome += amount;

        } else if (transaction.type === "expense") {

            totalExpenses += amount;

        }

    });

    const totalBalance = totalIncome - totalExpenses;

    totalIncomeElement.textContent = `₹${totalIncome.toFixed(2)}`;
    totalExpensesElement.textContent = `₹${totalExpenses.toFixed(2)}`;
    totalBalanceElement.textContent = `₹${totalBalance.toFixed(2)}`;

    // Refresh all dashboard insights
    updateCategoryBreakdown();
    updateHighestSpendingCategory();
    updateFinancialInsights();
    updateHighestSingleExpense();

}


// ==========================================
// 18. UPDATE BUDGET PROGRESS AND ALERTS
// ==========================================



 // ==========================================
 // 18. UPDATE MONTHLY BUDGET PROGRESS AND ALERTS
 // ==========================================

function updateBudget() {

    const budgetLimit = Number(budgetLimitInput.value);

    // Get current year and month
    const currentDate = new Date();

    const currentMonth =
        currentDate.getFullYear() + "-" +
        String(currentDate.getMonth() + 1).padStart(2, "0");

    // Get only current month's expenses
    const monthlyExpenses = transactions.filter(function (transaction) {

        return (
            transaction.type === "expense" &&
            transaction.date.startsWith(currentMonth)
        );

    });

    // Calculate total monthly expenses
    const totalExpenses = monthlyExpenses.reduce(
        function (total, transaction) {

            const amount = Number(transaction.amount);

            return total + (
                Number.isFinite(amount) ? amount : 0
            );

        },
        0
    );

    // Validate budget
    if (!Number.isFinite(budgetLimit) || budgetLimit <= 0) {

        budgetPercentage.textContent = "0%";
        progressFill.style.width = "0%";
        progressFill.style.backgroundColor = "#2563eb";

        budgetSummary.textContent =
            "Please set a valid budget.";

        return;
    }

    // Calculate budget usage percentage
    const percentage = (totalExpenses / budgetLimit) * 100;

    // Keep progress bar within 100%
    const progress = Math.min(percentage, 100);

    budgetPercentage.textContent =
        `${percentage.toFixed(1)}%`;

    progressFill.style.width = `${progress}%`;

    // Budget alerts
    if (percentage >= 100) {

        progressFill.style.backgroundColor = "#dc2626";

        budgetSummary.textContent =
            `Budget exceeded! You spent ₹${(totalExpenses - budgetLimit).toFixed(2)} extra this month.`;

    } else if (percentage >= 80) {

        progressFill.style.backgroundColor = "#f59e0b";

        budgetSummary.textContent =
            `Warning! You have used ${percentage.toFixed(1)}% of your monthly budget.`;

    } else {

        progressFill.style.backgroundColor = "#2563eb";

        budgetSummary.textContent =
            `₹${totalExpenses.toFixed(2)} spent this month out of ₹${budgetLimit.toFixed(2)}`;

    }
}


// ==========================================
// MONTHLY FINANCIAL REPORT
// ==========================================

function updateMonthlyReport() {

    if (
        !reportMonthInput ||
        !reportIncomeElement ||
        !reportExpensesElement ||
        !reportSavingsElement ||
        !reportSavingsRateElement
    ) {
        return;
    }

    // Get selected month
    const selectedMonth = reportMonthInput.value;

    if (!selectedMonth) {
        return;
    }

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    // Calculate selected month's income and expenses
    transactions.forEach(function (transaction) {

        if (!transaction.date.startsWith(selectedMonth)) {
            return;
        }

        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount)) {
            return;
        }

        if (transaction.type === "income") {
            monthlyIncome += amount;
        } else if (transaction.type === "expense") {
            monthlyExpenses += amount;
        }

    });

    // Calculate savings
    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Calculate savings percentage
    const savingsRate = monthlyIncome > 0
        ? (monthlySavings / monthlyIncome) * 100
        : 0;

    // Display report
    reportIncomeElement.textContent =
        `₹${monthlyIncome.toFixed(2)}`;

    reportExpensesElement.textContent =
        `₹${monthlyExpenses.toFixed(2)}`;

    reportSavingsElement.textContent =
        `₹${monthlySavings.toFixed(2)}`;

    reportSavingsRateElement.textContent =
        `${savingsRate.toFixed(1)}%`;

    // Refresh the monthly expense chart
    updateMonthlyExpenseChart();
}


// ==========================================
// MONTHLY EXPENSE CHART
// ==========================================

function updateMonthlyExpenseChart() {

    const chartContainer = document.getElementById(
        "monthly-expense-chart"
    );

    if (!chartContainer || !reportMonthInput) {
        return;
    }

    const selectedMonth = reportMonthInput.value;

    if (!selectedMonth) {
        chartContainer.textContent = "Select a month to view expenses.";
        return;
    }

    // Get expenses for the selected month
    const monthlyExpenses = transactions.filter(function (transaction) {

        return (
            transaction.type === "expense" &&
            transaction.date.startsWith(selectedMonth)
        );

    });

    // Group expenses by category
    const categoryTotals = {};

    monthlyExpenses.forEach(function (transaction) {

        const category = transaction.category;
        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount)) {
            return;
        }

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += amount;

    });

    // Clear previous chart
    chartContainer.innerHTML = "";

    const categories = Object.entries(categoryTotals);

    if (categories.length === 0) {

        chartContainer.textContent =
            "No expenses available for this month.";

        return;
    }

    // Find highest category amount
    const highestAmount = Math.max(
        ...categories.map(function (item) {
            return item[1];
        })
    );

    // Create chart bars
    categories.forEach(function (item) {

        const category = item[0];
        const amount = item[1];

        const percentage = (amount / highestAmount) * 100;

        const chartItem = document.createElement("div");
        chartItem.className = "chart-item";

        const chartInfo = document.createElement("div");
        chartInfo.className = "chart-info";

        const categoryName = document.createElement("span");
        categoryName.textContent = category;

        const categoryAmount = document.createElement("span");
        categoryAmount.textContent = `₹${amount.toFixed(2)}`;

        chartInfo.appendChild(categoryName);
        chartInfo.appendChild(categoryAmount);

        const barContainer = document.createElement("div");
        barContainer.className = "chart-bar-container";

        const bar = document.createElement("div");
        bar.className = "chart-bar";
        bar.style.width = `${percentage}%`;

        barContainer.appendChild(bar);

        chartItem.appendChild(chartInfo);
        chartItem.appendChild(barContainer);

        chartContainer.appendChild(chartItem);

    });

}

// ==========================================
// MONTHLY SAVINGS TREND
// ==========================================


function updateMonthlySavingsTrend() {

    const trendContainer = document.getElementById(
        "monthly-savings-trend"
    );

    if (!trendContainer) {
        return;
    }

    // Group transactions by month
    const monthlyData = {};

    transactions.forEach(function (transaction) {

        const amount = Number(transaction.amount);

        if (
            !transaction.date ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return;
        }

        const monthKey = transaction.date.substring(0, 7);

        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) {
            return;
        }

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                income: 0,
                expenses: 0
            };
        }

        if (transaction.type === "income") {
            monthlyData[monthKey].income += amount;
        } else if (transaction.type === "expense") {
            monthlyData[monthKey].expenses += amount;
        }

    });

    // Get only months containing transactions
    const activeMonths = Object.keys(monthlyData)
        .sort()
        .slice(-6);

    trendContainer.innerHTML = "";

    if (activeMonths.length === 0) {
        trendContainer.textContent =
            "No transaction history available yet.";
        return;
    }

    const months = activeMonths.map(function (monthKey) {

        const data = monthlyData[monthKey];

        const date = new Date(
            Number(monthKey.substring(0, 4)),
            Number(monthKey.substring(5, 7)) - 1,
            1
        );

        return {
            name: date.toLocaleString("en-IN", {
                month: "short",
                year: "numeric"
            }),
            income: data.income,
            expenses: data.expenses,
            savings: data.income - data.expenses
        };

    });

    const highestAmount = Math.max(
        1,
        ...months.flatMap(function (item) {
            return [
                item.income,
                item.expenses,
                Math.abs(item.savings)
            ];
        })
    );

    months.forEach(function (item) {

        const monthContainer = document.createElement("div");
        monthContainer.className = "savings-trend-month";

        const monthHeading = document.createElement("h3");
        monthHeading.textContent = item.name;

        monthContainer.appendChild(monthHeading);

        const values = [
            {
                label: "Income",
                amount: item.income,
                className: "trend-income"
            },
            {
                label: "Expense",
                amount: item.expenses,
                className: "trend-expenses"
            },
            {
                label: "Savings",
                amount: item.savings,
                className: "trend-savings"
            }
        ];

        values.forEach(function (value) {

            const row = document.createElement("div");
            row.className = "trend-item";

            const label = document.createElement("span");
            label.className = "trend-label";
            label.textContent = value.label;

            const barContainer = document.createElement("div");
            barContainer.className = "trend-bar-container";

            const bar = document.createElement("div");
            bar.className = `trend-bar ${value.className}`;

            const percentage =
                (Math.abs(value.amount) / highestAmount) * 100;

            bar.style.width = `${percentage}%`;

            barContainer.appendChild(bar);

            const amount = document.createElement("span");
            amount.className = "trend-amount";
            amount.textContent = `₹${value.amount.toFixed(2)}`;

            row.appendChild(label);
            row.appendChild(barContainer);
            row.appendChild(amount);

            monthContainer.appendChild(row);

        });

        trendContainer.appendChild(monthContainer);

    });

}


// ==========================================
// 19. SEARCH AND FILTER TRANSACTIONS
// ==========================================

function searchAndFilterTransactions() {

    const searchText = searchTransaction.value
        .trim()
        .toLowerCase();

    const selectedType = filterType.value;

    const selectedMonth = filterMonth.value;

    const filteredTransactions = transactions.filter(function (transaction) {

        // Search by transaction title
        const matchesSearch = transaction.title
            .toLowerCase()
            .includes(searchText);

        // Filter by income or expense
        const matchesType =
            selectedType === "all" ||
            transaction.type === selectedType;

        // Filter by month
        const matchesMonth =
            selectedMonth === "" ||
            transaction.date.startsWith(selectedMonth);

        return matchesSearch && matchesType && matchesMonth;

    });

    displayFilteredTransactions(filteredTransactions);

}


// ==========================================
// 20. FORM SUBMISSION EVENT
// ==========================================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = transactionTitle.value.trim();

    const amount = Number(transactionAmount.value);

    const type = transactionType.value;

    const category = transactionCategory.value;

    const date = transactionDate.value;

    // Validate form values
    if (
        title === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !["income", "expense"].includes(type) ||
        category === "" ||
        date === ""
    ) {

        alert("Please enter valid transaction details.");
        return;

    }

    if (editingTransactionId !== null) {

        // UPDATE EXISTING TRANSACTION
        const transaction = transactions.find(function (item) {

            return item.id === editingTransactionId;

        });

        if (!transaction) {

            alert("Transaction not found.");

            resetTransactionForm();

            return;

        }

        transaction.title = title;
        transaction.amount = amount;
        transaction.type = type;
        transaction.category = category;
        transaction.date = date;

        console.log("Transaction updated successfully!");

    } else {

        // ADD NEW TRANSACTION
        const newTransaction = {

            id: Date.now(),
            title: title,
            amount: amount,
            type: type,
            category: category,
            date: date

        };

        transactions.push(newTransaction);

        console.log("Transaction added successfully!");

    }

    // Save transaction data
    saveTransactions();

    // Refresh dashboard
    searchAndFilterTransactions();
    updateSummary();
    updateBudget();
    updateMonthlyReport();
    updateMonthlySavingsTrend();

    // Reset form
    resetTransactionForm();

});


// ==========================================
// 21. SEARCH EVENT
// ==========================================

searchTransaction.addEventListener("input", function () {

    searchAndFilterTransactions();

});


// ==========================================
// 22. TYPE FILTER EVENT
// ==========================================

filterType.addEventListener("change", function () {

    searchAndFilterTransactions();

});


// ==========================================
// 23. MONTH FILTER EVENT
// ==========================================

filterMonth.addEventListener("change", function () {

    searchAndFilterTransactions();

});

// ==========================================
// MONTHLY REPORT MONTH CHANGE EVENT
// ==========================================

if (reportMonthInput) {
    reportMonthInput.addEventListener("change", function () {
        updateMonthlyReport();
    });
}

// ==========================================
// 24. SAVE BUDGET BUTTON EVENT
// ==========================================

saveBudgetButton.addEventListener("click", function () {

    saveBudget();

});


// ==========================================
// 25. SAVE BUDGET TO LOCAL STORAGE
// ==========================================

function saveBudget() {

    const budgetLimit = Number(budgetLimitInput.value);

    if (!Number.isFinite(budgetLimit) || budgetLimit <= 0) {

        alert("Please enter a valid budget amount.");
        return;

    }

    localStorage.setItem("budgetLimit", budgetLimit);

    updateBudget();

    console.log("Budget saved successfully!");

}


// ==========================================
// 26. LOAD BUDGET FROM LOCAL STORAGE
// ==========================================

function loadBudget() {

    const savedBudget = localStorage.getItem("budgetLimit");

    if (savedBudget !== null) {

        budgetLimitInput.value = savedBudget;

    }

}

// ==========================================
// SIDEBAR ACTIVE NAVIGATION
// ==========================================

const sidebarLinks = document.querySelectorAll(".sidebar nav a");

function setActiveNavigation() {

    const currentHash = window.location.hash || "#dashboard";

    sidebarLinks.forEach(function (link) {

        link.classList.toggle(
            "active",
            link.getAttribute("href") === currentHash
        );

    });
}

sidebarLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        sidebarLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});

window.addEventListener("hashchange", setActiveNavigation);

setActiveNavigation();


// ==========================================
// 27. INITIAL PAGE LOAD
// ==========================================

// Set current month as default report month
const today = new Date();

if (reportMonthInput) {
    reportMonthInput.value =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0");
}

loadBudget();

searchAndFilterTransactions();

updateSummary();

updateBudget();

updateMonthlyReport();

updateMonthlySavingsTrend();

console.log("SpendWise application loaded successfully!");