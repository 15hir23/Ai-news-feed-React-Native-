# 📈 AI Trade News - React Native News Aggregator

A beautiful, feature-rich React Native mobile application that delivers real-time financial market news with AI-powered insights, sentiment analysis, and an intelligent trading assistant chatbot.

![React Native](https://img.shields.io/badge/React%20Native-0.74-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Requirements ✅
- **📰 News Feed**: Displays 15+ financial news articles with title, source, timestamp, and high-quality thumbnails
- **🤖 AI Summary**: One-tap access to AI-generated 3-line summaries with key insights via elegant modal
- **🔄 Pull-to-Refresh**: Seamless refresh mechanism to fetch the latest market news
- **🌙 Dark Mode**: Beautiful dark theme optimized for extended reading sessions (light mode also available)
- **📱 Responsive Design**: Adaptive layout that works perfectly on all screen sizes

### Bonus Features 🎁
- **AI Trading Assistant Chatbot**: Interactive AI that provides market insights, answers questions about stocks/crypto, and analyzes news in real-time
- **Real-time Market Ticker**: Live updates for SPY, BTC, and ETH with price movements
- **Sentiment Analysis**: Automatic sentiment classification (Bullish/Bearish/Neutral) for each article
- **Smart Search**: Real-time search across headlines and summaries
- **Category Filtering**: Filter news by Stocks, Crypto, Tech, Business, or Markets
- **Community Discussion**: Comment system for each article with likes and user interactions
- **Bookmarks**: Save articles for later reading
- **Reading History**: Track read articles with visual indicators
- **Settings Panel**: Comprehensive settings with statistics, notifications, and data management
- **Theme Toggle**: Switch between dark and light modes instantly
- **Trending Topics**: Automatically extracted trending keywords from news
- **Smart Notifications**: Configurable alerts for price movements, news, and community replies

## 🎥 Demo Video

**[🎬 Watch 1-Minute Loom Walkthrough](YOUR_LOOM_LINK_HERE)**

*Replace with your Loom video link showcasing the app's features*

## 📸 Screenshots

| News Feed | AI Summary | Chatbot |
|-----------|------------|---------|
| ![Feed](screenshots/feed.png) | ![Summary](screenshots/summary.png) | ![Chat](screenshots/chat.png) |

*Add screenshots to a `/screenshots` folder in your repo*

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (installed globally)
- **Expo Go** app on your mobile device (iOS/Android)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-trade-news.git
cd ai-trade-news
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables** (Optional)

Create a `.env` file in the root directory:
```env
REACT_APP_NEWS_API_KEY=your_newsapi_key_here
```

> **Note**: The app includes a demo API key and falls back to mock data if the API is unavailable, so it works out of the box!

4. **Start the development server**
```bash
npx expo start
```

5. **Run on your device**
- Scan the QR code with **Expo Go** (Android) or **Camera** app (iOS)
- Or press `a` for Android emulator, `i` for iOS simulator

## 📦 Project Structure

```
ai-trade-news/
├── App.tsx                 # Main application component
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (create this)
└── README.md            # This file
```

## 🛠️ Technologies Used

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe JavaScript
- **NewsAPI** - Real-time news aggregation
- **React Hooks** - State management (useState, useEffect, useCallback, useRef)
- **Animated API** - Smooth animations and transitions
- **KeyboardAvoidingView** - Intelligent keyboard handling

## 🎨 Key Features Breakdown

### 1. News Feed
- Fetches real-time financial news from NewsAPI
- Displays rich cards with images, categories, and sentiment badges
- Auto-categorization into Stocks, Crypto, Tech, Business, Markets
- Visual indicators for read/unread articles
- Bookmark and share functionality

### 2. AI Summary Modal
- Elegant modal with AI-generated summaries
- Key highlights extraction (3 bullet points)
- Sentiment analysis visualization
- Direct link to community discussions
- Source attribution and timestamp

### 3. AI Trading Assistant
- Context-aware chatbot powered by news data
- Answers questions about markets, stocks, and crypto
- Real-time news search integration
- Markdown-style formatted responses
- Typing indicators and smooth scrolling

### 4. Market Ticker
- Real-time price updates (simulated)
- Color-coded price movements (green/red)
- Horizontal scrolling for multiple assets
- Updates every 30 seconds

### 5. Community Features
- Per-article comment threads
- Like/upvote system
- User-friendly comment composition
- Keyboard-aware UI

### 6. Settings & Customization
- Usage statistics dashboard
- Notification preferences
- Theme switching
- Data management (clear history/bookmarks)

## 🔧 Configuration

### API Key Setup

The app uses NewsAPI for fetching news. You have two options:

**Option 1: Use included demo key (default)**
- Works out of the box with limited requests
- Fallback to mock data if quota exceeded

**Option 2: Use your own API key**
1. Get free API key from [newsapi.org](https://newsapi.org/)
2. Add to `.env` file:
```env
REACT_APP_NEWS_API_KEY=your_key_here
```

### Customization

**Change theme colors:**
Edit the `theme` object in `App.tsx`:
```typescript
const theme = {
  dark: {
    accent: '#8b5cf6',  // Change primary color
    // ... other colors
  }
}
```

**Modify news categories:**
```typescript
const categories = ['All', 'Stocks', 'Crypto', 'Tech', 'Business', 'Markets'];
```

**Adjust refresh interval for market data:**
```typescript
const marketInterval = setInterval(updateMarketData, 30000); // 30 seconds
```

## 📱 Build for Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA
```bash
npx expo build:ios
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🐛 Troubleshooting

**Issue: API rate limit exceeded**
- Solution: The app automatically falls back to mock data

**Issue: Images not loading**
- Solution: Check internet connection; mock data has fallback images

**Issue: Expo Go won't connect**
- Solution: Ensure phone and computer are on same WiFi network

**Issue: Keyboard covers input**
- Solution: App uses KeyboardAvoidingView, but you may need to adjust behavior prop for your device

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/15hir23

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org/) for providing news data
- [Unsplash](https://unsplash.com/) for placeholder images
- [Expo](https://expo.dev/) for amazing development tools
- [React Native Community](https://reactnative.dev/) for excellent documentation

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**⭐ If you find this project useful, please consider giving it a star!**
