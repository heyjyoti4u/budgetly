# Expense Tracker PWA

A beautiful, offline-first Progressive Web App for smart budget management and expense tracking. Built with Next.js, Tailwind CSS, and IndexedDB for local data storage.

## Features

### Budget Management
- **Custom Budget Categories** - 8 default categories (Food, Travel, Personal, Entertainment, Recharge, Subscription, SIP, Other) with the ability to add custom categories
- **Per-Category Budget Allocation** - Set monthly budget for each category
- **Real-Time Budget Tracking** - Instantly see remaining budget as you add expenses
- **Color-Coded Categories** - Each category has a unique vibrant color for easy identification
- **Visual Progress Bars** - See at-a-glance how much of each budget you've used

### Monthly Cycles
- **Custom Salary Date** - Set your salary date (1-31st of each month) for budget reset cycle
- **Automatic Budget Reset** - Budget cycles automatically reset on your configured salary date
- **Total Budget Overview** - Dashboard shows total allocated budget, spent amount, and remaining balance

### Expense Tracking
- **Quick Expense Entry** - Fast, minimal-friction way to record expenses
- **Category Selection** - Quick category picker with icons and names
- **Amount Input** - Simple numeric input for expense amounts
- **Optional Notes** - Add details about what you spent on
- **Real-Time Updates** - Category budgets update instantly when expenses are added

### History & Analytics
- **Monthly Expense History** - View all expenses in the current cycle
- **Past Month Data** - Historical tracking across multiple months
- **Transaction Details** - See category, amount, and date for each expense

### PWA Capabilities
- **Offline-First** - Works completely offline with local IndexedDB storage
- **Installable** - Install on mobile home screen or desktop as a standalone app
- **Fast & Responsive** - Optimized for mobile with smooth animations
- **Service Worker** - Background sync and offline functionality
- **No Network Required** - All data stored locally on your device

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with vibrant color system
- **State Management**: Zustand
- **Database**: IndexedDB (client-side, offline-first)
- **PWA**: Web Manifest, Service Worker
- **Icons**: Lucide React

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open http://localhost:3000 in your browser

### Using the App

#### Setting Up Your Budget
1. Go to **Settings** (bottom navigation)
2. Set your salary date (when your budget resets each month)
3. Go to **Dashboard** to see category cards
4. Click **Edit** (pencil icon) on each category to set your monthly budget

#### Recording an Expense
1. Click the **+ Add Expense** button
2. Select a category
3. Enter the amount
4. (Optional) Add a note about the expense
5. Click **Record Expense**
6. Watch your budget update in real-time!

#### Viewing History
1. Click the **History** tab in bottom navigation
2. See all expenses for the current budget cycle
3. Transactions show category, date, and amount

#### Managing Settings
1. Click **Settings** in bottom navigation
2. Adjust your salary date if needed
3. Changes take effect immediately

## Features Breakdown

### Dashboard
- Total budget overview with progress bar
- All categories at a glance with individual progress
- Quick-add expense button
- Real-time budget calculations
- Visual status (on-budget vs over-budget)

### Category Management
- 8 pre-configured default categories
- Custom categories can be added
- Edit budget allocation per category
- Color-coded for easy identification
- Icons for quick visual reference

### Budget Cycles
- Monthly budget allocation resets automatically
- Custom salary date configuration (1-31)
- Flexible budgeting for irregular income
- Clear cycle dates displayed

### Real-Time Updates
- Expenses instantly deduct from category budget
- Total budget automatically recalculates
- Progress bars update smoothly
- Remaining budget displayed prominently

## Data Storage

All data is stored locally on your device using IndexedDB:
- Categories and their budgets
- Expenses and transaction history
- Budget cycle configuration
- Settings (salary date)

**No data is sent to servers.** Everything is private and stays on your device.

## Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## PWA Installation

### On Mobile (Android/iOS)
1. Open the app in your browser
2. Tap the menu (⋮) or share button
3. Select "Add to home screen" or "Install app"
4. The app will appear on your home screen

### On Desktop
1. Open the app in supported browsers
2. Click the install icon in the address bar
3. The app will install as a standalone application

## Offline Usage

Once installed, the app works completely offline:
- Add expenses without internet
- View history and budgets
- All data syncs when back online
- Service worker caches all resources

## Performance

- Optimized for mobile devices
- Smooth animations and transitions
- Fast load times with Turbopack
- Responsive design for all screen sizes

## Privacy

- All data stored locally on your device
- No tracking or analytics for user behavior
- No cloud sync or backups (local only)
- Full control of your financial data

## Troubleshooting

### Budget not updating?
- Refresh the page or reopen the app
- Check if you're in the current budget cycle
- Verify the expense was recorded (check History)

### Service Worker not registering?
- Check browser console for errors
- Ensure you're on HTTPS (or localhost for development)
- Try clearing browser cache and reinstalling

### Categories not showing?
- Categories load when the app initializes
- Wait a moment for IndexedDB to load
- Try refreshing the page

## Future Enhancements

Potential features for future versions:
- Export/import budget data
- Budget templates
- Recurring expenses
- Spending analytics and reports
- Multiple budgets/profiles
- Dark mode improvements
- Expense categories search

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please reach out or create an issue in the repository.

---

**Made with ❤️ for better financial management**
