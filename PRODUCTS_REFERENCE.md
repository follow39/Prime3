# Prime3 - Product Reference Guide

**Quick reference for App Store Connect setup**

Last Updated: 2025-11-15

---

## Product IDs (Copy-Paste Ready)

### For App Store Connect

```
Product 1 (Annual Subscription):
Product ID: com.prime3.app.premium.annual
Reference Name: Premium Annual Subscription
Type: Auto-Renewable Subscription
Subscription Group: Premium Access
Duration: 1 Year
Price Tier: Tier 16 ($15.48 USD/year, displayed as $1.29/month)

Product 2 (Lifetime Purchase):
Product ID: com.prime3.app.premium.lifetime
Reference Name: Premium Lifetime Access
Type: Non-Consumable
Price Tier: Tier 15 ($14.99 USD one-time)
```

---

## Product Comparison Table

| Feature | Free | Premium Annual | Premium Lifetime |
|---------|------|----------------|------------------|
| **Price** | Free | $15.48/year ($1.29/mo) | $14.99 one-time (40% off) |
| **Daily Planning** | ✅ | ✅ | ✅ |
| **3 Daily Goals** | ✅ | ✅ | ✅ |
| **Task Management** | ✅ | ✅ | ✅ |
| **Notifications** | ✅ | ✅ | ✅ |
| **Dark/Light Theme** | ✅ | ✅ | ✅ |
| **Biometric Lock** | ✅ | ✅ | ✅ |
| **Data Encryption** | ✅ | ✅ | ✅ |
| **Review Page** | ❌ | ✅ | ✅ |
| **Analytics & Charts** | ❌ | ✅ | ✅ |
| **Historical Data** | ❌ | ✅ | ✅ |
| **Export Statistics** | ❌ | ✅ | ✅ |
| **Auto-Renewal** | N/A | Yes | No (one-time) |
| **Best For** | Trying the app | Regular users | Long-term users |

---

## App Store Descriptions

### Annual Subscription

**Display Name** (English - US):
```
Premium Annual
```

**Description** (English - US):
```
Unlock all premium features including analytics, historical review, and visual charts. Renews annually.
```

**Marketing Copy** (for App Store listing):
```
Get full access to Prime3's powerful productivity features with an annual subscription. Track your progress over time with detailed analytics, visualize your completion rates with beautiful charts, and review your entire task history. Your subscription automatically renews each year so you never lose access to your data and insights.

Perfect for committed users who want continuous access to all premium features.
```

---

### Lifetime Purchase

**Display Name** (English - US):
```
Premium Lifetime
```

**Description** (English - US):
```
One-time purchase for permanent access to all premium features. Never expires, no subscriptions.
```

**Marketing Copy** (for App Store listing):
```
Make a single purchase and unlock Prime3's premium features forever. No recurring charges, no expiration dates, no surprises. Get lifetime access to advanced analytics, complete task history, visual charts, and all future premium features we add.

Perfect for users who prefer to own their apps rather than rent them. Pay once, benefit forever.
```

---

## App Store Listing Copy

### Subtitle (30 characters max)
```
Daily Planning & Analytics
```

### Description (4000 characters max)
```
FOCUS ON WHAT MATTERS

Prime3 helps you achieve your daily goals with a simple, powerful approach:
choose three goals each day and make them happen.

FREE FEATURES

✓ Daily Planning - Plan your three most important tasks
✓ Task Management - Create, edit, and complete goals
✓ Smart Notifications - Stay on track throughout your day
✓ Secure & Private - All data encrypted and stored locally
✓ Beautiful Design - Dark and light themes
✓ Biometric Lock - Protect your goals with Face ID/Touch ID

PREMIUM FEATURES

Upgrade to Premium for powerful analytics and insights:

📊 Visual Analytics
See your productivity trends with beautiful line charts and heatmaps.

📈 Performance Statistics
Track completion rates across days, weeks, and months.

📅 Complete History
Review all your past goals and achievements.

💾 Export & Share
Download your statistics and share your progress.

PRICING

• Annual Subscription: $15.48/year (just $1.29/month)
• Lifetime Access: $14.99 one-time (40% off - was $24.99)

PRIVACY & SECURITY

Your data stays on your device. No cloud sync, no tracking,
no data collection. Everything is encrypted and private.

Questions? Contact us at prime3.app@mailbox.org
```

### Keywords (100 characters max, comma-separated)
```
productivity,goals,daily planner,task manager,focus,analytics,habit tracker,three goals,achievement
```

---

## Pricing Strategy

### Why $15.48/year ($1.29/month)?

**Positioning**: Aggressively low pricing for maximum conversions
- Very low barrier to entry
- Significantly lower than competitors (Todoist: $48/year, OmniFocus: $50/year)
- "$1.29/month" feels negligible to most users
- Encourages trial conversions

### Why $14.99 lifetime (40% off sale from $24.99)?

**Strategy**: Nearly identical to annual price creates urgency
- Sale pricing creates FOMO (fear of missing out)
- Strikethrough pricing ($24.99 → $14.99) triggers loss aversion
- Nearly same price as annual → most users choose lifetime
- One-time revenue capture vs recurring subscriptions
- Positions as "Most Popular" for social proof

**Expected Split**: 80% lifetime, 20% annual

---

## Revenue Projections

**Note**: Aggressive pricing favors lifetime purchases

**Conservative** (1,000 users, 8% conversion):
- 64 lifetime × $14.99 = $959
- 16 annual × $15.48 = $248
- **Total**: ~$1,200

**Optimistic** (10,000 users, 12% conversion):
- 960 lifetime × $14.99 = $14,390
- 240 annual × $15.48 = $3,715
- **Total**: ~$18,000

---

## Support & Legal

### Contact Information
- **Support Email**: prime3.app@mailbox.org

### Note for App Store Submission
Apple may require Privacy Policy and Terms of Service URLs. You have two options:
1. Create simple static HTML pages and host them (GitHub Pages, Netlify, etc.)
2. Use the template files (PRIVACY_POLICY.md, TERMS_OF_SERVICE.md) to create these pages

---

## FAQ for Customers

**Q: What's the difference between Annual and Lifetime?**
```
Annual ($15.48/year, billed as $1.29/month):
- Automatically renews each year
- Cancel anytime
- Best for trying premium features

Lifetime ($14.99 one-time - 40% off):
- Pay once, use forever
- Never expires
- Nearly same price as annual - best value!
```

**Q: Can I switch from Annual to Lifetime?**
```
Yes! Purchase the Lifetime option and your annual subscription
will automatically be cancelled. Contact Apple Support if you'd
like a pro-rated refund for your remaining annual subscription time.
```

**Q: What if I cancel my subscription?**
```
You'll keep premium access until the end of your current billing period.
After that, you'll return to the free tier but keep all your data.
You can re-subscribe anytime to regain premium features.
```

**Q: Is my data safe if I don't renew?**
```
Absolutely. All your tasks are stored locally on your device
and remain accessible. Premium features (analytics, charts)
will be locked, but your core task data is always yours.
```

---

**For implementation details, see: [PAYMENTS_GUIDE.md](PAYMENTS_GUIDE.md)**
