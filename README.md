# Polytrack.best

> The ultimate browser-based racing game where creativity meets speed. Build custom tracks and race cars in this TrackMania-inspired experience.

## 🎮 Features

- **🏎️ High-Speed Racing**: Experience thrilling races with realistic physics
- **🛠️ Track Builder**: Create custom racing circuits with loops, jumps, and obstacles  
- **👻 Ghost Racing**: Compete against community records and ghost cars
- **📱 Cross-Platform**: Play seamlessly on desktop, mobile, and tablet
- **🌍 Community**: Share tracks and discover creations from players worldwide
- **⚡ Instant Access**: No downloads required - play directly in your browser

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/polytrack-best/polytrack.best.git
   cd polytrack.best
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Serve locally**
   ```bash
   npm run serve
   ```

### Project Structure

```
polytrack.best/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── build.js                # Build script
├── src/
│   └── input.css          # Tailwind source CSS
├── assets/
│   ├── styles.css         # Compiled CSS (generated)
│   ├── logo.svg           # Brand logo
│   ├── og-cover-generator.html    # Social sharing image generator
│   ├── favicon-generator.html     # Favicon generator
│   └── icons/             # PWA icons (generated)
└── memory-bank/           # Project documentation
    ├── projectbrief.md    # Project overview
    ├── productContext.md  # Product background
    ├── systemPatterns.md  # Architecture patterns
    ├── techContext.md     # Technical environment
    ├── activeContext.md   # Current work status
    └── progress.md        # Progress tracking
```

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **TailwindCSS**: Utility-first CSS framework
- **Vanilla JavaScript**: Modern ES6+ features
- **PWA**: Progressive Web App capabilities

### Performance
- **Service Worker**: Caching and offline support
- **Web Vitals**: Performance monitoring
- **Lazy Loading**: Optimized resource loading
- **Preconnect**: DNS prefetching for external resources

### SEO & Analytics
- **Structured Data**: JSON-LD for rich snippets
- **Open Graph**: Social media optimization
- **Meta Tags**: Complete SEO configuration
- **Google Analytics**: User behavior tracking (optional)

## 📊 Performance Metrics

### Target Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### SEO Optimization
- **Keyword Density**: 3.5-4% for "polytrack"
- **Content Quality**: 300+ words per section
- **Semantic HTML**: Proper heading hierarchy (H1-H4)
- **Mobile-First**: Responsive design approach

## 🔧 Configuration

### Environment Variables
Create a `.env` file for local development:

```env
# Analytics (optional)
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Performance monitoring
ENABLE_WEB_VITALS=true

# Development settings
NODE_ENV=development
```

### Tailwind Configuration
The `tailwind.config.js` includes:
- Custom color palette for Polytrack branding
- Extended animations and transitions
- Responsive breakpoints
- Performance optimizations

### Service Worker
The Service Worker implements:
- **Cache First**: Static assets (CSS, images, fonts)
- **Network First**: Dynamic content with cache fallback
- **Stale While Revalidate**: External resources
- **Background Sync**: Analytics data (future feature)

## 🎨 Design System

### Colors
```css
/* Primary Polytrack Blue */
--polytrack-50: #f0f9ff;
--polytrack-500: #0ea5e9;
--polytrack-600: #0284c7;
--polytrack-700: #0369a1;
```

### Typography
- **Font Family**: Inter (system fallback)
- **Headings**: Bold weights with tight line-height
- **Body Text**: Regular weight with relaxed line-height
- **Code**: Monospace for technical content

### Components
- **Buttons**: Primary and secondary variants
- **Cards**: Feature cards with hover effects
- **Navigation**: Responsive header with mobile menu
- **Game Container**: Aspect-ratio locked iframe

## 📱 PWA Features

### Installation
- **Add to Home Screen**: Automatic prompt on supported devices
- **App Icons**: Multiple sizes for different platforms
- **Splash Screen**: Custom loading experience
- **Shortcuts**: Quick access to key features

### Offline Support
- **Static Caching**: Core files available offline
- **Dynamic Caching**: Recently viewed content
- **Fallback Pages**: Graceful offline experience
- **Update Notifications**: Automatic update prompts

## 🔍 SEO Strategy

### Content Optimization
- **Primary Keyword**: "polytrack" (3.5-4% density)
- **Long-tail Keywords**: "polytrack racing game", "build custom tracks"
- **Semantic Content**: Natural language with gaming terminology
- **Internal Linking**: Strategic cross-references between sections

### Technical SEO
- **Structured Data**: WebSite, WebPage, VideoGame, FAQPage schemas
- **Meta Tags**: Complete Open Graph and Twitter Cards
- **Canonical URLs**: Prevent duplicate content issues
- **XML Sitemap**: Auto-generated for search engines

### Performance SEO
- **Core Web Vitals**: Optimized for Google's ranking factors
- **Mobile-First**: Responsive design with touch optimization
- **Page Speed**: Minimized CSS/JS, optimized images
- **HTTPS**: Secure connection required for PWA features

## 🚀 Deployment

### Static Hosting (Recommended)
Deploy to platforms like:
- **Netlify**: Automatic builds from Git
- **Vercel**: Edge network optimization
- **GitHub Pages**: Free hosting for open source
- **Cloudflare Pages**: Global CDN with analytics

### Build Process
```bash
# Production build
npm run build

# Verify build
npm run serve

# Deploy (platform-specific)
# Example for Netlify
netlify deploy --prod --dir .
```

### Environment Setup
1. **Domain Configuration**: Set up custom domain
2. **SSL Certificate**: Enable HTTPS (required for PWA)
3. **CDN Setup**: Configure caching headers
4. **Analytics**: Add Google Analytics tracking
5. **Search Console**: Submit sitemap and monitor performance

## 📈 Analytics & Monitoring

### Performance Monitoring
- **Web Vitals**: Real user metrics
- **Error Tracking**: JavaScript error reporting
- **Load Times**: Resource loading analysis
- **User Experience**: Interaction tracking

### SEO Monitoring
- **Search Rankings**: Keyword position tracking
- **Organic Traffic**: Search engine referrals
- **Click-Through Rates**: SERP performance
- **Conversion Tracking**: Game engagement metrics

### User Analytics
- **Page Views**: Content popularity
- **User Flow**: Navigation patterns
- **Device Types**: Mobile vs desktop usage
- **Geographic Data**: Global user distribution

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **HTML**: Semantic markup with accessibility
- **CSS**: TailwindCSS utilities with custom components
- **JavaScript**: ES6+ with proper error handling
- **Performance**: Optimize for Core Web Vitals

### Testing
- **Cross-Browser**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: iOS Safari, Chrome Mobile
- **Performance**: Lighthouse audits
- **Accessibility**: WAVE and axe testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Polytrack Game**: Original game by Kodub
- **TailwindCSS**: Utility-first CSS framework
- **TrackMania**: Inspiration for racing mechanics
- **Community**: Players and track builders worldwide

## 📞 Support

- **Website**: [polytrack.best](https://polytrack.best)
- **Issues**: [GitHub Issues](https://github.com/polytrack-best/polytrack.best/issues)
- **Discussions**: [GitHub Discussions](https://github.com/polytrack-best/polytrack.best/discussions)
- **Email**: support@polytrack.best

---

**Built with ❤️ for the Polytrack racing community**