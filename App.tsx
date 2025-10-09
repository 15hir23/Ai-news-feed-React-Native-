import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  Image, 
  Modal, 
  ScrollView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive sizing utility
const normalize = (size: number) => {
  const scale = width / 375;
  return Math.round(size * scale);
};

// API Configuration
const API_CONFIG = {
  newsApi: {
    key: process.env.REACT_APP_NEWS_API_KEY || '0a561c5368184719a6b99ab37feb381e', 
    url: 'https://newsapi.org/v2/everything'
  },
};

export default function App() {
  type NewsItem = {
    id: string;
    title: string;
    source: string;
    time: string;
    timestamp: number;
    image: string;
    category: string;
    sentiment: string;
    summary: string;
    keyPoints: string[];
    url: string;
  };

  type ChatMessage = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
  };

  type Comment = {
    id: string;
    user: string;
    text: string;
    time: string;
    likes: number;
  };

  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readHistory, setReadHistory] = useState<string[]>([]);
  const [showCommunity, setShowCommunity] = useState(false);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<Array<{keyword: string, count: number}>>([]);
  const [marketData, setMarketData] = useState({
    spy: { price: 445.23, change: +1.2 },
    btc: { price: 48234, change: +2.8 },
    eth: { price: 2543, change: -0.5 }
  });
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    newsAlerts: true,
    communityReplies: true
  });
  
  const categories = ['All', 'Stocks', 'Crypto', 'Tech', 'Business', 'Markets'];

  const theme = {
    dark: {
      bg: '#0a0e1a',
      bgSecondary: '#0f172a',
      card: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      accent: '#8b5cf6',
      accentLight: '#a78bfa',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      border: '#334155',
      chatBubbleUser: '#8b5cf6',
      chatBubbleBot: '#334155'
    },
    light: {
      bg: '#f8fafc',
      bgSecondary: '#ffffff',
      card: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      accent: '#8b5cf6',
      accentLight: '#a78bfa',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      border: '#e2e8f0',
      chatBubbleUser: '#8b5cf6',
      chatBubbleBot: '#e2e8f0'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    fetchNews();
    initializeChatbot();
    updateMarketData();
    
    const marketInterval = setInterval(updateMarketData, 30000);
    return () => clearInterval(marketInterval);
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, selectedCategory, searchQuery]);

  useEffect(() => {
    calculateTrendingTopics();
  }, [news]);

  const initializeChatbot = () => {
    setChatMessages([
      {
        id: '1',
        text: 'Hi! I\'m your AI Trading Assistant 🤖\n\nI can help you with:\n• Market trend analysis\n• News summaries\n• Investment insights\n• Stock/Crypto updates\n\nWhat would you like to know?',
        sender: 'bot',
        timestamp: Date.now()
      }
    ]);
  };

  const updateMarketData = () => {
    setMarketData(prev => ({
      spy: { 
        price: prev.spy.price + (Math.random() - 0.5) * 2,
        change: +(Math.random() * 3 - 1).toFixed(2)
      },
      btc: { 
        price: prev.btc.price + (Math.random() - 0.5) * 200,
        change: +(Math.random() * 5 - 2).toFixed(2)
      },
      eth: { 
        price: prev.eth.price + (Math.random() - 0.5) * 50,
        change: +(Math.random() * 4 - 1.5).toFixed(2)
      }
    }));
  };

  const calculateTrendingTopics = () => {
    const keywords: Record<string, number> = {};
    news.forEach(item => {
      const words = (item.title + ' ' + item.summary)
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 4);
      
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });

    const trending = Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([keyword, count]) => ({ keyword, count }));
    
    setTrendingTopics(trending);
  };

  const markAsRead = (newsId: string) => {
    if (!readHistory.includes(newsId)) {
      setReadHistory(prev => [...prev, newsId]);
    }
  };

  const addComment = (newsId: string) => {
    if (!commentInput.trim()) return;
    
    const newComment = {
      id: String(Date.now()),
      user: 'User' + Math.floor(Math.random() * 1000),
      text: commentInput.trim(),
      time: 'Just now',
      likes: 0
    };

    setComments(prev => ({
      ...prev,
      [newsId]: [...(prev[newsId] || []), newComment]
    }));
    
    setCommentInput('');
    Keyboard.dismiss();
  };

  const likeComment = (newsId: string, commentId: string) => {
    setComments(prev => ({
      ...prev,
      [newsId]: prev[newsId]?.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      ) || []
    }));
  };

  const shareNews = (item: NewsItem) => {
    alert(`Sharing: ${item.title}\n\nIn production, this would open your device's share sheet.`);
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      
      if (!API_CONFIG.newsApi.key) {
        console.warn('NewsAPI key not found, using mock data');
        setNews(getMockNews());
        return;
      }

      const queries = [
        'stock market trading',
        'cryptocurrency bitcoin',
        'tech stocks FAANG',
        'nasdaq dow jones',
        'federal reserve interest rates',
        'economy inflation',
        'trading investment',
        'financial markets'
      ];
      
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const response = await fetch(
        `${API_CONFIG.newsApi.url}?q=${encodeURIComponent(randomQuery)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${API_CONFIG.newsApi.key}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        const processedNews = data.articles
          .filter((article: any) => article.title && article.urlToImage)
          .map((article: any, index: number) => ({
            id: String(index + 1),
            title: article.title,
            source: article.source.name,
            time: getTimeAgo(article.publishedAt),
            timestamp: new Date(article.publishedAt).getTime(),
            image: article.urlToImage,
            category: categorizeNews(article.title + ' ' + (article.description || '')),
            sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
            summary: article.description || article.content || 'No summary available.',
            keyPoints: extractKeyPoints(article.description || article.content || ''),
            url: article.url
          }))
          .slice(0, 15);
        
        setNews(processedNews);
      } else {
        console.warn('No articles found in API response, using mock data');
        setNews(getMockNews());
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      console.warn('Falling back to mock data');
      setNews(getMockNews());
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const categorizeNews = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('stock') || lower.includes('trading') || lower.includes('shares')) return 'Stocks';
    if (lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('ethereum')) return 'Crypto';
    if (lower.includes('tech') || lower.includes('software') || lower.includes('ai') || lower.includes('apple') || lower.includes('google')) return 'Tech';
    if (lower.includes('market') || lower.includes('dow') || lower.includes('nasdaq') || lower.includes('s&p')) return 'Markets';
    return 'Business';
  };

  const analyzeSentiment = (text: string) => {
    const lower = text.toLowerCase();
    const positive = ['surge', 'gain', 'rally', 'rise', 'jump', 'soar', 'boost', 'up', 'high', 'record', 'profit', 'growth', 'success'];
    const negative = ['fall', 'drop', 'crash', 'decline', 'loss', 'down', 'plunge', 'sink', 'slump', 'weak'];
    
    let score = 0;
    positive.forEach(word => { if (lower.includes(word)) score++; });
    negative.forEach(word => { if (lower.includes(word)) score--; });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  };

  const extractKeyPoints = (text: string) => {
    if (!text) return [];
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).map(s => s.trim());
  };

  const getMockNews = () => [
    {
      id: '1',
      title: 'Stock Market Reaches New Heights as Tech Sector Leads Rally',
      source: 'Financial Times',
      time: '2 hours ago',
      timestamp: Date.now() - 7200000,
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      category: 'Stocks',
      sentiment: 'positive',
      summary: 'Major stock indices hit record highs today as technology stocks led a broad-based rally. The S&P 500 gained 1.8% while the Nasdaq jumped 2.3%, driven by strong earnings reports and optimistic economic forecasts.',
      keyPoints: ['S&P 500 up 1.8%', 'Tech sector leading gains', 'Record trading volumes'],
      url: '#'
    },
    {
      id: '2',
      title: 'Bitcoin Surges Past $48,000 on Institutional Demand',
      source: 'CoinDesk',
      time: '3 hours ago',
      timestamp: Date.now() - 10800000,
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
      category: 'Crypto',
      sentiment: 'positive',
      summary: 'Bitcoin rallied above $48,000 driven by increased institutional buying and positive ETF inflows. Major investment firms report record demand for cryptocurrency exposure.',
      keyPoints: ['BTC breaks $48K', 'ETF inflows surge', 'Institutional adoption grows'],
      url: '#'
    },
    {
      id: '3',
      title: 'Federal Reserve Signals Potential Rate Cuts in Coming Months',
      source: 'Bloomberg',
      time: '5 hours ago',
      timestamp: Date.now() - 18000000,
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
      category: 'Markets',
      sentiment: 'neutral',
      summary: 'The Federal Reserve indicated it may consider interest rate cuts if inflation continues its downward trend. Market participants are pricing in multiple rate cuts this year.',
      keyPoints: ['Rate cut expectations rise', 'Inflation showing signs of cooling', 'Market volatility expected'],
      url: '#'
    }
  ];

  const filterNews = () => {
    let filtered = news;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredNews(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  }, []);

  const sendMessage = async () => {
    if (!chatInput.trim() || isSendingMessage) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      text: chatInput.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setIsSendingMessage(true);
    
    // Dismiss keyboard after sending
    Keyboard.dismiss();

    try {
      const botResponse = await generateAIResponse(currentInput);
      setChatMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: ChatMessage = {
        id: String(Date.now() + 1),
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: 'bot',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const generateAIResponse = async (input: string): Promise<ChatMessage> => {
    const lowerInput = input.toLowerCase();
    
    const relevantArticles = news.filter(article => {
      const searchText = (article.title + ' ' + article.summary + ' ' + article.category).toLowerCase();
      const keywords = lowerInput.split(' ').filter(word => word.length > 2);
      return keywords.some(keyword => searchText.includes(keyword));
    });

    if (relevantArticles.length > 0) {
      return generateResponseFromArticles(input, relevantArticles);
    }

    try {
      const freshArticles = await searchNewsAPI(input);
      if (freshArticles.length > 0) {
        return generateResponseFromArticles(input, freshArticles);
      }
    } catch (error) {
      console.error('Error fetching fresh news:', error);
    }

    return getFallbackResponse(input);
  };

  const searchNewsAPI = async (query: string): Promise<NewsItem[]> => {
    try {
      const response = await fetch(
        `${API_CONFIG.newsApi.url}?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${API_CONFIG.newsApi.key}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search news');
      }
      
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        return data.articles
          .filter((article: any) => article.title && article.urlToImage)
          .map((article: any, index: number) => ({
            id: `search-${index + 1}`,
            title: article.title,
            source: article.source.name,
            time: getTimeAgo(article.publishedAt),
            timestamp: new Date(article.publishedAt).getTime(),
            image: article.urlToImage,
            category: categorizeNews(article.title + ' ' + (article.description || '')),
            sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
            summary: article.description || article.content || 'No summary available.',
            keyPoints: extractKeyPoints(article.description || article.content || ''),
            url: article.url
          }));
      }
      return [];
    } catch (error) {
      console.error('Error searching news API:', error);
      return [];
    }
  };

  const generateResponseFromArticles = (input: string, articles: NewsItem[]): ChatMessage => {
    const lowerInput = input.toLowerCase();
    
    const sortedArticles = articles
      .map(article => {
        const searchText = (article.title + ' ' + article.summary).toLowerCase();
        const keywords = lowerInput.split(' ').filter(word => word.length > 2);
        const relevanceScore = keywords.filter(keyword => searchText.includes(keyword)).length;
        return { article, relevanceScore };
      })
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(item => item.article)
      .slice(0, 3);

    if (sortedArticles.length === 0) {
      return getFallbackResponse(input);
    }

    let response = `📊 Based on current news about "${input}":\n\n`;

    sortedArticles.forEach((article, index) => {
      response += `📰 **${article.title}**\n`;
      response += `🏷️ Category: ${article.category}\n`;
      response += `📈 Sentiment: ${article.sentiment === 'positive' ? '↗ Bullish' : article.sentiment === 'negative' ? '↘ Bearish' : '→ Neutral'}\n`;
      response += `📝 ${article.summary.substring(0, 150)}${article.summary.length > 150 ? '...' : ''}\n`;
      response += `🕐 ${article.time}\n\n`;
    });

    response += `💡 **Key Insights:**\n`;
    
    const overallSentiment = calculateOverallSentiment(sortedArticles);
    response += `• Market sentiment: ${overallSentiment}\n`;
    
    const categories = [...new Set(sortedArticles.map(a => a.category))];
    response += `• Trending sectors: ${categories.join(', ')}\n`;
    
    if (sortedArticles.some(a => a.sentiment === 'positive')) {
      response += `• Positive developments in ${sortedArticles.filter(a => a.sentiment === 'positive').map(a => a.category).join(', ')}\n`;
    }
    
    response += `\n🔍 Check the news feed for detailed analysis!`;

    return {
      id: String(Date.now() + 1),
      text: response,
      sender: 'bot',
      timestamp: Date.now()
    };
  };

  const calculateOverallSentiment = (articles: NewsItem[]): string => {
    const sentimentCount = articles.reduce((acc, article) => {
      acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (sentimentCount.positive > sentimentCount.negative && sentimentCount.positive > (sentimentCount.neutral || 0)) {
      return '↗ Mostly Positive';
    } else if (sentimentCount.negative > sentimentCount.positive && sentimentCount.negative > (sentimentCount.neutral || 0)) {
      return '↘ Mostly Negative';
    } else {
      return '→ Mixed/Neutral';
    }
  };

  const getFallbackResponse = (input: string): ChatMessage => {
    const responses = [
      `🤔 I couldn't find specific news about "${input}" in my current data.\n\nTry these related topics:\n• Stock market trends\n• Cryptocurrency updates\n• Tech company earnings\n• Economic indicators\n\nOr check the news feed for the latest market updates!`,
      
      `📭 No recent news found specifically about "${input}".\n\nThe market moves fast! Try:\n• Searching for broader terms\n• Checking different categories\n• Looking at major market indices\n• Reviewing economic calendar events`,
      
      `🔍 I don't have fresh news about "${input}" right now.\n\n💡 Popular topics I can help with:\n• Bitcoin and cryptocurrency\n• Stock market performance\n• Federal Reserve updates\n• Tech sector news\n• Trading strategies\n\nTry the search feature in the news feed!`
    ];

    return {
      id: String(Date.now() + 1),
      text: responses[Math.floor(Math.random() * responses.length)],
      sender: 'bot',
      timestamp: Date.now()
    };
  };

  const toggleBookmark = (newsId: string) => {
    setBookmarks(prev => 
      prev.includes(newsId) 
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    );
  };

  const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
    const badgeColor = sentiment === 'positive' ? colors.success : 
                       sentiment === 'negative' ? colors.danger : colors.warning;
    const badgeText = sentiment === 'positive' ? '↗ Bullish' : 
                      sentiment === 'negative' ? '↘ Bearish' : '→ Neutral';
    
    return (
      <View style={[styles.sentimentBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.sentimentText}>{badgeText}</Text>
      </View>
    );
  };

  const MarketTicker = () => (
    <View style={[styles.tickerContainer, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.border }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tickerContent}
      >
        <View style={styles.tickerItem}>
          <Text style={[styles.tickerLabel, { color: colors.textSecondary }]}>SPY</Text>
          <Text style={[styles.tickerPrice, { color: colors.text }]}>
            ${marketData.spy.price.toFixed(2)}
          </Text>
          <Text style={[styles.tickerChange, { 
            color: marketData.spy.change >= 0 ? colors.success : colors.danger 
          }]}>
            {marketData.spy.change >= 0 ? '↗' : '↘'} {Math.abs(marketData.spy.change)}%
          </Text>
        </View>

        <View style={[styles.tickerDivider, { backgroundColor: colors.border }]} />

        <View style={styles.tickerItem}>
          <Text style={[styles.tickerLabel, { color: colors.textSecondary }]}>BTC</Text>
          <Text style={[styles.tickerPrice, { color: colors.text }]}>
            ${marketData.btc.price.toFixed(0)}
          </Text>
          <Text style={[styles.tickerChange, { 
            color: marketData.btc.change >= 0 ? colors.success : colors.danger 
          }]}>
            {marketData.btc.change >= 0 ? '↗' : '↘'} {Math.abs(marketData.btc.change)}%
          </Text>
        </View>

        <View style={[styles.tickerDivider, { backgroundColor: colors.border }]} />

        <View style={styles.tickerItem}>
          <Text style={[styles.tickerLabel, { color: colors.textSecondary }]}>ETH</Text>
          <Text style={[styles.tickerPrice, { color: colors.text }]}>
            ${marketData.eth.price.toFixed(2)}
          </Text>
          <Text style={[styles.tickerChange, { 
            color: marketData.eth.change >= 0 ? colors.success : colors.danger 
          }]}>
            {marketData.eth.change >= 0 ? '↗' : '↘'} {Math.abs(marketData.eth.change)}%
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  const CategoryFilter = () => (
    <View style={{ backgroundColor: colors.bg }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryButton,
              { 
                backgroundColor: selectedCategory === category ? colors.accent : colors.card,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category ? '#fff' : colors.text }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const NewsCard = ({ item }: { item: NewsItem }) => {
    const isRead = readHistory.includes(item.id);
    const isBookmarked = bookmarks.includes(item.id);
    const commentCount = comments[item.id]?.length || 0;

    return (
      <TouchableOpacity 
        style={[styles.card, { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          opacity: isRead ? 0.7 : 1
        }]}
        onPress={() => {
          markAsRead(item.id);
          setSelectedNews(item);
        }}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        <View style={styles.cardBadges}>
          <View style={[styles.categoryLabel, { backgroundColor: colors.accent }]}>
            <Text style={styles.categoryLabelText}>{item.category}</Text>
          </View>
          <View style={styles.cardActionButtons}>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                shareNews(item);
              }}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                toggleBookmark(item.id);
              }}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>
                {isBookmarked ? '🔖' : '📑'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isRead && (
          <View style={styles.readBadge}>
            <Text style={styles.readBadgeText}>✓ Read</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={3}>
            {item.title}
          </Text>
          
          <View style={styles.metaContainer}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              📰 {item.source}
            </Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              🕐 {item.time}
            </Text>
          </View>

          <SentimentBadge sentiment={item.sentiment} />

          <View style={styles.cardFooter}>
            <TouchableOpacity
              onPress={() => {
                markAsRead(item.id);
                setSelectedNews(item);
              }}
              style={[styles.summaryButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.summaryButtonText}>View AI Summary</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedNews(item);
                setShowCommunity(true);
              }}
              style={[styles.commentButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.commentButtonText, { color: colors.text }]}>
                💬 {commentCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const CommunityModal = () => (
    <Modal
      visible={showCommunity}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCommunity(false)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalIcon}>💬</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Community Discussion
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowCommunity(false)}
                style={[styles.closeButton, { backgroundColor: colors.bg }]}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.communityScroll}
              contentContainerStyle={styles.communityScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {selectedNews && (
                <>
                  <Text style={[styles.communityNewsTitle, { color: colors.text }]} numberOfLines={2}>
                    {selectedNews.title}
                  </Text>

                  <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
                    <Text style={[styles.commentsSectionTitle, { color: colors.text }]}>
                      💭 Comments ({comments[selectedNews.id]?.length || 0})
                    </Text>

                    {comments[selectedNews.id]?.map((comment) => (
                      <View key={comment.id} style={[styles.commentItem, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                        <View style={styles.commentHeader}>
                          <Text style={[styles.commentUser, { color: colors.accent }]}>
                            👤 {comment.user}
                          </Text>
                          <Text style={[styles.commentTime, { color: colors.textSecondary }]}>
                            {comment.time}
                          </Text>
                        </View>
                        <Text style={[styles.commentText, { color: colors.text }]}>
                          {comment.text}
                        </Text>
                        <TouchableOpacity 
                          style={styles.likeButton}
                          onPress={() => likeComment(selectedNews.id, comment.id)}
                        >
                          <Text style={styles.likeButtonText}>
                            👍 {comment.likes}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {(!comments[selectedNews.id] || comments[selectedNews.id].length === 0) && (
                      <View style={styles.noComments}>
                        <Text style={[styles.noCommentsText, { color: colors.textSecondary }]}>
                          No comments yet. Be the first to share your thoughts!
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={[styles.commentInputContainer, { 
              backgroundColor: colors.bg,
              borderTopColor: colors.border 
            }]}>
              <TextInput
                style={[styles.commentInput, { 
                  color: colors.text, 
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }]}
                placeholder="Share your thoughts..."
                placeholderTextColor={colors.textSecondary}
                value={commentInput}
                onChangeText={setCommentInput}
                multiline
                maxLength={300}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={() => selectedNews && addComment(selectedNews.id)}
              />
              <TouchableOpacity 
                onPress={() => selectedNews && addComment(selectedNews.id)}
                style={[styles.commentSendButton, { 
                  backgroundColor: commentInput.trim() ? colors.accent : colors.border 
                }]}
                disabled={!commentInput.trim()}
              >
                <Text style={styles.commentSendText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  const SettingsModal = () => (
    <Modal
      visible={showSettings}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.settingsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalIcon}>⚙️</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Settings
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowSettings(false)}
              style={[styles.closeButton, { backgroundColor: colors.bg }]}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsScroll}>
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
                📊 Statistics
              </Text>
              <View style={[styles.statsGrid, { backgroundColor: colors.bg }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.accent }]}>{news.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Articles</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{bookmarks.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bookmarks</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.warning }]}>{readHistory.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Read</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
                🔔 Notifications
              </Text>
              {Object.entries(notifications).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.settingItem, { borderBottomColor: colors.border }]}
                  onPress={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                >
                  <Text style={[styles.settingItemText, { color: colors.text }]}>
                    {key === 'priceAlerts' ? '💰 Price Alerts' : 
                     key === 'newsAlerts' ? '📰 News Alerts' : 
                     '💬 Community Replies'}
                  </Text>
                  <Text style={styles.settingItemValue}>
                    {value ? '✅' : '⬜'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
                🎨 Appearance
              </Text>
              <TouchableOpacity
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={() => setIsDarkMode(!isDarkMode)}
              >
                <Text style={[styles.settingItemText, { color: colors.text }]}>
                  {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </Text>
                <Text style={styles.settingItemValue}>
                  {isDarkMode ? '🌙' : '☀️'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
                🗂️ Data Management
              </Text>
              <TouchableOpacity
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setReadHistory([]);
                  alert('Reading history cleared!');
                }}
              >
                <Text style={[styles.settingItemText, { color: colors.text }]}>
                  Clear Reading History
                </Text>
                <Text style={styles.settingItemValue}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setBookmarks([]);
                  alert('Bookmarks cleared!');
                }}
              >
                <Text style={[styles.settingItemText, { color: colors.text }]}>
                  Clear Bookmarks
                </Text>
                <Text style={styles.settingItemValue}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const NewsDetailModal = () => (
    <Modal
      visible={selectedNews !== null && !showCommunity}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedNews(null)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalIcon}>✨</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  AI Analysis
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedNews(null)}
                style={[styles.closeButton, { backgroundColor: colors.bg }]}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              {selectedNews && (
                <>
                  <Image 
                    source={{ uri: selectedNews.image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />

                  <Text style={[styles.modalNewsTitle, { color: colors.text }]}>
                    {selectedNews.title}
                  </Text>

                  <View style={styles.modalMetaRow}>
                    <SentimentBadge sentiment={selectedNews.sentiment} />
                    <View style={[styles.categoryLabel, { backgroundColor: colors.accent }]}>
                      <Text style={styles.categoryLabelText}>{selectedNews.category}</Text>
                    </View>
                  </View>

                  <View style={[styles.summaryBox, { 
                    backgroundColor: colors.bg,
                    borderLeftColor: colors.accent 
                  }]}>
                    <Text style={[styles.summaryLabel, { color: colors.accentLight }]}>
                      📊 AI-Generated Summary
                    </Text>
                    <Text style={[styles.summaryText, { color: colors.text }]}>
                      {selectedNews.summary}
                    </Text>
                  </View>

                  {selectedNews.keyPoints && selectedNews.keyPoints.length > 0 && (
                    <View style={[styles.keyPointsBox, { 
                      backgroundColor: colors.bg,
                      borderColor: colors.border 
                    }]}>
                      <Text style={[styles.keyPointsTitle, { color: colors.text }]}>
                        🎯 Key Highlights
                      </Text>
                      {selectedNews.keyPoints.map((point, index) => (
                        <View key={index} style={styles.keyPointItem}>
                          <Text style={[styles.keyPointBullet, { color: colors.accent }]}>•</Text>
                          <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
                            {point}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.modalMetaContainer}>
                    <Text style={[styles.modalMetaText, { color: colors.textSecondary }]}>
                      📰 Source: {selectedNews.source}
                    </Text>
                    <Text style={[styles.modalMetaText, { color: colors.textSecondary }]}>
                      🕐 Published {selectedNews.time}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowCommunity(true)}
                    style={[styles.joinDiscussionButton, { backgroundColor: colors.accent }]}
                  >
                    <Text style={styles.joinDiscussionText}>
                      💬 Join Discussion ({comments[selectedNews.id]?.length || 0})
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  const ChatbotModal = () => {
    const scrollViewRef = useRef<ScrollView | null>(null);
    
    useEffect(() => {
      if (showChatbot) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }, [chatMessages, showChatbot]);

    return (
      <Modal
        visible={showChatbot}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChatbot(false)}
      >
        <View style={styles.chatModalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatModalContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={[styles.chatModalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.chatModalHeader, { 
                backgroundColor: colors.accent,
                borderBottomColor: colors.border 
              }]}>
                <View style={styles.chatHeaderLeft}>
                  <Text style={styles.chatModalIcon}>🤖</Text>
                  <View>
                    <Text style={styles.chatModalTitle}>AI Trading Assistant</Text>
                    <Text style={styles.chatModalSubtitle}>Your market insights companion</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowChatbot(false)}
                  style={styles.chatModalCloseButton}
                >
                  <Text style={styles.chatModalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                ref={scrollViewRef}
                style={styles.chatModalMessages}
                contentContainerStyle={styles.chatModalMessagesContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {chatMessages.map(msg => (
                  <View 
                    key={msg.id}
                    style={[
                      styles.chatModalBubble,
                      msg.sender === 'user' ? styles.chatModalBubbleUser : styles.chatModalBubbleBot,
                      { 
                        backgroundColor: msg.sender === 'user' 
                          ? colors.chatBubbleUser 
                          : colors.chatBubbleBot 
                      }
                    ]}
                  >
                    <Text style={[
                      styles.chatModalBubbleText,
                      { color: msg.sender === 'user' ? '#fff' : colors.text }
                    ]}>
                      {msg.text}
                    </Text>
                  </View>
                ))}
                {isSendingMessage && (
                  <View style={[styles.chatModalBubble, styles.chatModalBubbleBot, { backgroundColor: colors.chatBubbleBot }]}>
                    <ActivityIndicator size="small" color={colors.accent} />
                  </View>
                )}
              </ScrollView>

              <View style={[styles.chatModalInputContainer, { 
                backgroundColor: colors.bg,
                borderTopColor: colors.border 
              }]}>
                <TextInput
                  style={[styles.chatModalInput, { 
                    color: colors.text, 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }]}
                  placeholder="Ask about markets, stocks, crypto..."
                  placeholderTextColor={colors.textSecondary}
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline
                  maxLength={500}
                  editable={!isSendingMessage}
                  returnKeyType="default"
                  blurOnSubmit={false}
                />
                <TouchableOpacity 
                  onPress={sendMessage}
                  style={[styles.chatModalSendButton, { 
                    backgroundColor: (chatInput.trim() && !isSendingMessage) ? colors.accent : colors.border 
                  }]}
                  disabled={!chatInput.trim() || isSendingMessage}
                >
                  <Text style={styles.chatModalSendText}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.bg}
        />
        
        <View style={[styles.header, { backgroundColor: colors.bgSecondary }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                📈 AI Trade News
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Real-time market insights
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowSettings(true)}
                style={[styles.settingsIconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={styles.settingsIconText}>⚙️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowChatbot(true)}
                style={[styles.chatIconButton, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.chatIconText}>💬</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setIsDarkMode(!isDarkMode)}
                style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={styles.themeEmoji}>{isDarkMode ? '🌙' : '☀️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.searchContainer, { 
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search news..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <MarketTicker />
    
        <CategoryFilter />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Fetching latest market news...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNews}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <NewsCard item={item} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No news found
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Try adjusting your filters or pull to refresh
                </Text>
              </View>
            }
          />
        )}

        <NewsDetailModal />
        <CommunityModal />
        <SettingsModal />
        <ChatbotModal />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: '800',
    marginBottom: normalize(4),
  },
  headerSubtitle: {
    fontSize: normalize(13),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  settingsIconButton: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(21),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  settingsIconText: {
    fontSize: normalize(18),
  },
  chatIconButton: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(21),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chatIconText: {
    fontSize: normalize(20),
  },
  themeButton: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(21),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeEmoji: {
    fontSize: normalize(18),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: normalize(16),
    marginRight: normalize(8),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    padding: 0,
  },
  clearButton: {
    fontSize: normalize(18),
    paddingHorizontal: normalize(8),
  },
  tickerContainer: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(20),
    borderBottomWidth: 1,
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: normalize(20),
  },
  tickerItem: {
    alignItems: 'center',
    paddingHorizontal: normalize(12),
  },
  tickerLabel: {
    fontSize: normalize(11),
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  tickerPrice: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  tickerChange: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  tickerDivider: {
    width: 1,
    height: normalize(40),
    marginHorizontal: normalize(8),
  },
  categoryContainer: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(12),
  },
  categoryContent: {
    paddingRight: normalize(20),
  },
  categoryButton: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    marginRight: normalize(8),
    borderWidth: 1,
  },
  categoryText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(40),
  },
  loadingText: {
    marginTop: normalize(16),
    fontSize: normalize(15),
    textAlign: 'center',
  },
  listContent: {
    padding: normalize(20),
    paddingTop: normalize(8),
  },
  card: {
    borderRadius: normalize(16),
    marginBottom: normalize(16),
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: normalize(200),
  },
  cardBadges: {
    position: 'absolute',
    top: normalize(12),
    left: normalize(12),
    right: normalize(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
  },
  categoryLabelText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '700',
  },
  cardActionButtons: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: normalize(20),
    width: normalize(36),
    height: normalize(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: normalize(16),
  },
  readBadge: {
    position: 'absolute',
    top: normalize(12),
    right: normalize(12),
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(8),
  },
  readBadgeText: {
    color: '#fff',
    fontSize: normalize(10),
    fontWeight: '600',
  },
  cardContent: {
    padding: normalize(16),
  },
  cardTitle: {
    fontSize: normalize(17),
    fontWeight: '700',
    marginBottom: normalize(12),
    lineHeight: normalize(24),
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(12),
    flexWrap: 'wrap',
    gap: normalize(8),
  },
  metaText: {
    fontSize: normalize(12),
  },
  sentimentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(8),
    marginBottom: normalize(12),
  },
  sentimentText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  summaryButton: {
    flex: 1,
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(12),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  summaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: normalize(13),
  },
  commentButton: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  commentButtonText: {
    fontWeight: '600',
    fontSize: normalize(13),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(80),
    paddingHorizontal: normalize(40),
  },
  emptyIcon: {
    fontSize: normalize(48),
    marginBottom: normalize(16),
  },
  emptyText: {
    fontSize: normalize(18),
    fontWeight: '600',
    marginBottom: normalize(8),
  },
  emptySubtext: {
    fontSize: normalize(14),
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: normalize(28),
    borderTopRightRadius: normalize(28),
    maxHeight: height * 0.85,
    minHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(24),
    paddingBottom: normalize(16),
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  modalIcon: {
    fontSize: normalize(22),
  },
  modalTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
  },
  closeButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  closeButtonText: {
    fontSize: normalize(18),
    fontWeight: '600',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(40),
    flexGrow: 1,
  },
  modalImage: {
    width: '100%',
    height: normalize(180),
    borderRadius: normalize(12),
    marginBottom: normalize(16),
  },
  modalNewsTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    marginBottom: normalize(16),
    lineHeight: normalize(24),
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: normalize(8),
    marginBottom: normalize(16),
    flexWrap: 'wrap',
  },
  summaryBox: {
    padding: normalize(16),
    borderRadius: normalize(16),
    borderLeftWidth: 4,
    marginBottom: normalize(16),
  },
  summaryLabel: {
    fontSize: normalize(14),
    fontWeight: '700',
    marginBottom: normalize(8),
  },
  summaryText: {
    fontSize: normalize(15),
    lineHeight: normalize(24),
    letterSpacing: 0.3,
  },
  keyPointsBox: {
    padding: normalize(18),
    borderRadius: normalize(16),
    marginBottom: normalize(20),
    borderWidth: 1,
  },
  keyPointsTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginBottom: normalize(12),
  },
  keyPointItem: {
    flexDirection: 'row',
    marginBottom: normalize(8),
    paddingRight: normalize(8),
  },
  keyPointBullet: {
    fontSize: normalize(20),
    marginRight: normalize(8),
    fontWeight: '700',
  },
  keyPointText: {
    flex: 1,
    fontSize: normalize(14),
    lineHeight: normalize(20),
    letterSpacing: 0.2,
  },
  modalMetaContainer: {
    gap: normalize(8),
    paddingTop: normalize(8),
    paddingBottom: normalize(20),
  },
  modalMetaText: {
    fontSize: normalize(13),
  },
  joinDiscussionButton: {
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(12),
    alignItems: 'center',
    marginTop: normalize(8),
    marginBottom: normalize(16),
  },
  joinDiscussionText: {
    color: '#fff',
    fontSize: normalize(15),
    fontWeight: '700',
  },
  communityScroll: {
    flex: 1,
  },
  communityScrollContent: {
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(20),
  },
  communityNewsTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginBottom: normalize(16),
    lineHeight: normalize(22),
  },
  commentsSection: {
    paddingTop: normalize(16),
    borderTopWidth: 1,
  },
  commentsSectionTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginBottom: normalize(16),
  },
  commentItem: {
    padding: normalize(14),
    borderRadius: normalize(12),
    marginBottom: normalize(12),
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  commentUser: {
    fontSize: normalize(13),
    fontWeight: '700',
  },
  commentTime: {
    fontSize: normalize(11),
  },
  commentText: {
    fontSize: normalize(14),
    lineHeight: normalize(20),
    marginBottom: normalize(8),
  },
  likeButton: {
    alignSelf: 'flex-start',
  },
  likeButtonText: {
    fontSize: normalize(12),
  },
  noComments: {
    paddingVertical: normalize(40),
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: normalize(14),
    textAlign: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: normalize(16),
    gap: normalize(12),
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(24),
    fontSize: normalize(14),
    maxHeight: normalize(100),
    borderWidth: 1,
  },
  commentSendButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  commentSendText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: '600',
  },
  settingsContainer: {
    marginHorizontal: normalize(20),
    marginVertical: normalize(60),
    borderRadius: normalize(20),
    maxHeight: height * 0.8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  settingsScroll: {
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(24),
  },
  settingsSection: {
    marginBottom: normalize(24),
  },
  settingsSectionTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginBottom: normalize(12),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: normalize(20),
    borderRadius: normalize(12),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: normalize(28),
    fontWeight: '800',
    marginBottom: normalize(4),
  },
  statLabel: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
  },
  settingItemText: {
    fontSize: normalize(15),
    fontWeight: '500',
  },
  settingItemValue: {
    fontSize: normalize(20),
  },
  // New Chatbot Modal Styles
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  chatModalContainer: {
    width: '100%',
    maxWidth: normalize(450),
    height: height * 0.75,
    maxHeight: normalize(650),
  },
  chatModalContent: {
    flex: 1,
    borderRadius: normalize(24),
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    flex: 1,
  },
  chatModalIcon: {
    fontSize: normalize(28),
  },
  chatModalTitle: {
    fontSize: normalize(17),
    fontWeight: '700',
    color: '#fff',
    marginBottom: normalize(2),
  },
  chatModalSubtitle: {
    fontSize: normalize(12),
    color: '#fff',
    opacity: 0.9,
  },
  chatModalCloseButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatModalCloseText: {
    color: '#fff',
    fontSize: normalize(20),
    fontWeight: '600',
  },
  chatModalMessages: {
    flex: 1,
    paddingHorizontal: normalize(16),
  },
  chatModalMessagesContent: {
    paddingVertical: normalize(16),
    paddingBottom: normalize(20),
  },
  chatModalBubble: {
    maxWidth: '85%',
    padding: normalize(14),
    borderRadius: normalize(18),
    marginBottom: normalize(12),
  },
  chatModalBubbleUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: normalize(4),
  },
  chatModalBubbleBot: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: normalize(4),
  },
  chatModalBubbleText: {
    fontSize: normalize(14),
    lineHeight: normalize(20),
  },
  chatModalInputContainer: {
    flexDirection: 'row',
    padding: normalize(16),
    gap: normalize(12),
    borderTopWidth: 1,
  },
  chatModalInput: {
    flex: 1,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(24),
    fontSize: normalize(14),
    maxHeight: normalize(100),
    borderWidth: 1,
  },
  chatModalSendButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chatModalSendText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: '600',
  },
});