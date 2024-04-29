const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User'); 
const puppeteer = require('puppeteer');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).send('Unauthorized');
}

// Display Budget page
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const budget = await Budget.findOne({ userId: req.session.userId });
        const transactions = await Transaction.find({ userId: req.session.userId });

        // Define category mappings to standardize category names
        const categoryMapping = {
            groceries: 'Groceries',
            utilities: 'Utilities',
            entertainment: 'Entertainment',
            dining_out: 'Dining Out',
            transportation: 'Transportation',
            health_care: 'Health Care',
            education: 'Education',
            personal_care: 'Personal Care',
            savings: 'Savings',
            miscellaneous: 'Miscellaneous'
        };

        // Initialize category spending map with readable labels
        let spendingByCategory = Object.keys(categoryMapping).reduce((acc, key) => {
            acc[categoryMapping[key]] = 0;  // Initialize each category to zero using the mapped names
            return acc;
        }, {});

        // Aggregate spending by category, using mapped names
        transactions.forEach(transaction => {
            const categoryLabel = categoryMapping[transaction.category.trim()];
            if (categoryLabel) {  // Ensure the category is valid and mapped
                spendingByCategory[categoryLabel] += transaction.amount;
            }
        });

        const totalSpent = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
        let remaining = budget ? budget.limit - totalSpent : 0;

        // Render the budget page with the necessary data
        res.render('budget', {
            user,
            budget,
            totalSpent,
            remaining,
            spendingByCategory: JSON.stringify(spendingByCategory) // Pass the aggregated data as a JSON string for use in charts
        });
    } catch (error) {
        console.error('Failed to retrieve budget or user data:', error);
        res.status(500).send('Server error');
    }
});

// Handle Budget creation/update
router.post('/', isAuthenticated, async (req, res) => {
    const { limit, period } = req.body;
    try {
        let budget = await Budget.findOne({ userId: req.session.userId });
        if (budget) {
            // Update existing budget
            budget.limit = limit;
            budget.period = period;
            await budget.save();
        } else {
            // Create new budget
            budget = new Budget({ userId: req.session.userId, limit, period });
            await budget.save();
        }
        res.redirect('/budget');
    } catch (error) {
        res.status(500).render('budget', { error: 'Failed to save budget', form: req.body });
    }
});

// PDF route
router.get('/download-report', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const transactions = await Transaction.find({ userId: req.session.userId });
        const budget = await Budget.findOne({ userId: req.session.userId });
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set up your HTML with Pug rendered or directly use a template string
        const content = `
        <html>
            <head>
                <title>PDF Report</title>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 20px; }
                    .table { width: 100%; border-collapse: collapse; }
                    .table, .table th, .table td { border: 1px solid black; }
                    .table th, .table td { padding: 10px; text-align: left; }
                    h1, h2, h3 { text-align: center; }
                </style>
            </head>
            <body>
                <h1>Budget Report</h1>
                <h2>Hello, ${user.username}!</h2>
                <h3>Your current budget limit is $${budget.limit.toFixed(2)} for ${budget.period}</h3>
                <h3>You have spent $${transactions.reduce((acc, transaction) => acc + transaction.amount, 0).toFixed(2)} so far.</h3>
                <h3>You have $${(budget.limit - transactions.reduce((acc, transaction) => acc + transaction.amount, 0)).toFixed(2)} remaining in your budget.</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr>
                                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                                <td>${transaction.category}</td>
                                <td>$${transaction.amount.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
        `;

        await page.setContent(content);
        await page.emulateMediaType('screen');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        res.contentType('application/pdf');
        res.send(pdf);
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        res.status(500).send('Server error');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/budget'); // Redirect to the budget page if logout fails
        }
        res.clearCookie('connect.sid'); // Assuming 'connect.sid' is your session cookie's name
        res.redirect('/'); // Redirect to home page after successful logout
    });
});

module.exports = router;
