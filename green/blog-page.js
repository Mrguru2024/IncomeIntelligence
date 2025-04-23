/**
 * Blog Page Component for Stackr Finance
 * Displays blog posts in a futuristic, highly interactive bento box layout optimized for all devices
 * This modern layout enhances reader engagement and improves SEO with structured data
 */

import { blogPosts, blogCategories, filterPostsByCategory, getFeaturedPosts, getLatestPosts, getRelatedPosts, searchPosts, getPostBySlug, getPopularTags, formatDate } from './blog-data.js';

/**
 * Render blog page component with SEO optimization
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {HTMLElement} Blog page element
 */
export function renderBlogPage(isAuthenticated = false) {
  // Create main blog element with structured data for SEO
  const blogElement = document.createElement('div');
  blogElement.className = 'blog-page';
  blogElement.setAttribute('data-page-type', 'blog');
  blogElement.setAttribute('data-seo-title', 'Financial Insights for Service Providers | Stackr Finance Blog');
  blogElement.setAttribute('data-seo-description', 'Discover actionable financial strategies designed specifically for service providers. Learn budgeting, investing, and income growth techniques from industry experts.');
  
  // Add schema.org structured data for SEO
  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Stackr Finance Blog",
    "description": "Financial insights and strategies for service providers",
    "url": window.location.href,
    "publisher": {
      "@type": "Organization",
      "name": "Stackr Finance",
      "logo": {
        "@type": "ImageObject",
        "url": "/assets/logo.png"
      }
    }
  });
  blogElement.appendChild(schemaScript);
  
  // Hero section with animated gradient background
  const heroSection = createHeroSection();
  blogElement.appendChild(heroSection);
  
  // Main content container with bento box layout
  const mainContainer = document.createElement('div');
  mainContainer.className = 'blog-main-container';
  
  // Featured content in bento grid layout
  const bentoGrid = createBentoGrid();
  mainContainer.appendChild(bentoGrid);
  
  // Interactive content container with filters and posts
  const contentContainer = document.createElement('div');
  contentContainer.className = 'blog-content-container';
  
  // Create tabs for category filtering
  const categoryTabs = createCategoryTabs();
  contentContainer.appendChild(categoryTabs);
  
  // Posts container with masonry layout
  const postsContainer = document.createElement('div');
  postsContainer.className = 'blog-posts-container';
  
  // Blog posts list
  const postsListContainer = document.createElement('div');
  postsListContainer.className = 'blog-posts-list';
  postsContainer.appendChild(postsListContainer);
  
  // Sidebar with categories, newsletter signup and filters
  const sidebar = createEnhancedSidebar();
  
  // Add content to the layout
  contentContainer.appendChild(postsContainer);
  contentContainer.appendChild(sidebar);
  mainContainer.appendChild(contentContainer);
  blogElement.appendChild(mainContainer);
  
  // Newsletter and community section
  const communitySection = createCommunitySection();
  blogElement.appendChild(communitySection);
  
  // Initial posts load - all posts with animation
  renderPostsList(postsListContainer, blogPosts, true);
  
  // Add intersection observers for scroll animations
  addScrollAnimations(blogElement);
  
  return blogElement;
  
  /**
   * Create the hero section with animated gradient background
   * @returns {HTMLElement} Hero section element
   */
  function createHeroSection() {
    const section = document.createElement('div');
    section.className = 'blog-hero-section';
    section.style.position = 'relative';
    section.style.overflow = 'hidden';
    section.style.padding = '80px 20px';
    section.style.borderRadius = '20px';
    section.style.margin = '0 20px 40px';
    section.style.background = 'linear-gradient(120deg, #1a365d 0%, #3182ce 50%, #63b3ed 100%)';
    section.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    section.style.color = 'white';
    section.style.textAlign = 'center';
    
    // Animated background elements
    const bgElement1 = document.createElement('div');
    bgElement1.className = 'hero-bg-element';
    bgElement1.style.position = 'absolute';
    bgElement1.style.top = '-50px';
    bgElement1.style.right = '-50px';
    bgElement1.style.width = '300px';
    bgElement1.style.height = '300px';
    bgElement1.style.borderRadius = '50%';
    bgElement1.style.background = 'rgba(255, 255, 255, 0.1)';
    bgElement1.style.animation = 'float 20s infinite ease-in-out';
    section.appendChild(bgElement1);
    
    const bgElement2 = document.createElement('div');
    bgElement2.className = 'hero-bg-element';
    bgElement2.style.position = 'absolute';
    bgElement2.style.bottom = '-100px';
    bgElement2.style.left = '10%';
    bgElement2.style.width = '400px';
    bgElement2.style.height = '400px';
    bgElement2.style.borderRadius = '50%';
    bgElement2.style.background = 'rgba(255, 255, 255, 0.05)';
    bgElement2.style.animation = 'float 25s infinite ease-in-out reverse';
    section.appendChild(bgElement2);
    
    // Animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(20px, -20px) rotate(5deg); }
        50% { transform: translate(0, -40px) rotate(0deg); }
        75% { transform: translate(-20px, -20px) rotate(-5deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    // Content container
    const content = document.createElement('div');
    content.className = 'hero-content';
    content.style.position = 'relative';
    content.style.zIndex = '2';
    content.style.maxWidth = '800px';
    content.style.margin = '0 auto';
    
    // Hero title with gradient text
    const title = document.createElement('h1');
    title.innerHTML = 'Financial Wisdom for <span class="gradient-text">Service Providers</span>';
    title.className = 'hero-title';
    title.style.fontSize = '3.5rem';
    title.style.fontWeight = '800';
    title.style.marginBottom = '20px';
    title.style.lineHeight = '1.2';
    
    // Add gradient text style
    const gradientStyle = document.createElement('style');
    gradientStyle.textContent = `
      .gradient-text {
        background: linear-gradient(90deg, #FFD700, #FFA500);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: pulse 3s infinite ease-in-out;
      }
    `;
    document.head.appendChild(gradientStyle);
    
    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Discover expert financial strategies tailored for freelancers and independent professionals';
    subtitle.className = 'hero-subtitle';
    subtitle.style.fontSize = '1.5rem';
    subtitle.style.fontWeight = '400';
    subtitle.style.marginBottom = '40px';
    subtitle.style.opacity = '0.9';
    
    // Search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'hero-search-container';
    searchContainer.style.display = 'flex';
    searchContainer.style.maxWidth = '600px';
    searchContainer.style.margin = '0 auto';
    searchContainer.style.background = 'rgba(255, 255, 255, 0.9)';
    searchContainer.style.borderRadius = '50px';
    searchContainer.style.padding = '8px 8px 8px 24px';
    searchContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
    
    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    searchIcon.style.color = '#3182ce';
    searchIcon.style.marginRight = '8px';
    searchIcon.style.display = 'flex';
    searchIcon.style.alignItems = 'center';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for financial wisdom...';
    searchInput.className = 'hero-search-input';
    searchInput.style.border = 'none';
    searchInput.style.background = 'transparent';
    searchInput.style.padding = '12px 16px';
    searchInput.style.fontSize = '1rem';
    searchInput.style.color = '#1a365d';
    searchInput.style.flex = '1';
    searchInput.style.outline = 'none';
    
    const searchButton = document.createElement('button');
    searchButton.textContent = 'Find Insights';
    searchButton.className = 'hero-search-button';
    searchButton.style.padding = '10px 20px';
    searchButton.style.background = 'linear-gradient(90deg, #3182ce, #63b3ed)';
    searchButton.style.color = 'white';
    searchButton.style.border = 'none';
    searchButton.style.borderRadius = '50px';
    searchButton.style.fontSize = '0.9rem';
    searchButton.style.fontWeight = '600';
    searchButton.style.cursor = 'pointer';
    searchButton.style.transition = 'all 0.3s ease';
    
    searchButton.addEventListener('mouseover', () => {
      searchButton.style.transform = 'scale(1.05)';
      searchButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    });
    
    searchButton.addEventListener('mouseout', () => {
      searchButton.style.transform = 'scale(1)';
      searchButton.style.boxShadow = 'none';
    });
    
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        const results = searchPosts(query);
        renderPostsList(postsListContainer, results, true);
      }
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchButton.click();
      }
    });
    
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    
    // Stats bar
    const statsBar = document.createElement('div');
    statsBar.className = 'hero-stats-bar';
    statsBar.style.display = 'flex';
    statsBar.style.justifyContent = 'center';
    statsBar.style.marginTop = '40px';
    statsBar.style.color = 'rgba(255, 255, 255, 0.9)';
    
    const stats = [
      { label: 'Articles', value: blogPosts.length },
      { label: 'Categories', value: blogCategories.length - 1 }, // Subtract 'All' category
      { label: 'Readers', value: '10K+' },
      { label: 'Success Stories', value: '350+' }
    ];
    
    stats.forEach((stat, index) => {
      const statItem = document.createElement('div');
      statItem.className = 'hero-stat-item';
      statItem.style.margin = '0 20px';
      statItem.style.textAlign = 'center';
      
      const statValue = document.createElement('div');
      statValue.textContent = stat.value;
      statValue.className = 'hero-stat-value';
      statValue.style.fontSize = '2rem';
      statValue.style.fontWeight = '700';
      
      const statLabel = document.createElement('div');
      statLabel.textContent = stat.label;
      statLabel.className = 'hero-stat-label';
      statLabel.style.fontSize = '0.9rem';
      statLabel.style.opacity = '0.8';
      
      statItem.appendChild(statValue);
      statItem.appendChild(statLabel);
      statsBar.appendChild(statItem);
      
      // Add separator except for last item
      if (index < stats.length - 1) {
        const separator = document.createElement('div');
        separator.className = 'hero-stat-separator';
        separator.style.width = '1px';
        separator.style.height = '40px';
        separator.style.background = 'rgba(255, 255, 255, 0.3)';
        separator.style.margin = 'auto 15px';
        statsBar.appendChild(separator);
      }
    });
    
    // Assemble content
    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(searchContainer);
    content.appendChild(statsBar);
    section.appendChild(content);
    
    return section;
  }
  
  /**
   * Create a bento grid layout for featured content
   * @returns {HTMLElement} Bento grid container
   */
  function createBentoGrid() {
    const container = document.createElement('div');
    container.className = 'blog-bento-grid';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(4, 1fr)';
    container.style.gridTemplateRows = 'repeat(2, auto)';
    container.style.gap = '20px';
    container.style.padding = '0 20px';
    container.style.marginBottom = '60px';
    
    // Make grid responsive
    const mediaQuery = `
      @media (max-width: 1200px) {
        .blog-bento-grid {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(4, auto);
        }
        .bento-item-featured {
          grid-column: span 2 !important;
        }
      }
      
      @media (max-width: 768px) {
        .blog-bento-grid {
          grid-template-columns: 1fr;
          grid-template-rows: auto;
        }
        .bento-item {
          grid-column: span 1 !important;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = mediaQuery;
    document.head.appendChild(style);
    
    // Get featured content
    const featuredPosts = getFeaturedPosts(5);
    
    // Featured article (large)
    const featuredItem = createBentoItem(featuredPosts[0], 'featured');
    featuredItem.style.gridColumn = 'span 2';
    featuredItem.style.gridRow = 'span 2';
    container.appendChild(featuredItem);
    
    // Latest articles
    featuredPosts.slice(1, 5).forEach((post, index) => {
      let variant = 'standard';
      if (index === 1) variant = 'quote';
      if (index === 2) variant = 'stat';
      
      const item = createBentoItem(post, variant);
      container.appendChild(item);
    });
    
    return container;
    
    /**
     * Create a bento grid item
     * @param {Object} post - Post data
     * @param {string} variant - Item variant (featured, standard, quote, stat)
     * @returns {HTMLElement} Bento item element
     */
    function createBentoItem(post, variant = 'standard') {
      const item = document.createElement('div');
      item.className = `bento-item bento-item-${variant}`;
      item.style.borderRadius = '20px';
      item.style.overflow = 'hidden';
      item.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
      item.style.transition = 'all 0.3s ease';
      item.style.cursor = 'pointer';
      
      // Apply different styles based on variant
      if (variant === 'featured') {
        item.style.background = `linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%), url(${post.coverImage})`;
        item.style.backgroundSize = 'cover';
        item.style.backgroundPosition = 'center';
        item.style.color = 'white';
        item.style.padding = '30px';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.justifyContent = 'flex-end';
        item.style.minHeight = '400px';
        
        const category = document.createElement('div');
        category.textContent = blogCategories.find(c => c.id === post.categoryId)?.name || 'Uncategorized';
        category.style.textTransform = 'uppercase';
        category.style.fontSize = '0.8rem';
        category.style.fontWeight = '600';
        category.style.marginBottom = '8px';
        category.style.color = '#FFD700';
        
        const title = document.createElement('h2');
        title.textContent = post.title;
        title.style.fontSize = '2rem';
        title.style.fontWeight = '700';
        title.style.marginBottom = '16px';
        title.style.lineHeight = '1.3';
        
        const meta = document.createElement('div');
        meta.style.display = 'flex';
        meta.style.alignItems = 'center';
        meta.style.marginBottom = '16px';
        
        const authorImg = document.createElement('div');
        authorImg.style.width = '40px';
        authorImg.style.height = '40px';
        authorImg.style.borderRadius = '50%';
        authorImg.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        authorImg.style.marginRight = '12px';
        authorImg.style.display = 'flex';
        authorImg.style.alignItems = 'center';
        authorImg.style.justifyContent = 'center';
        authorImg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        
        const authorInfo = document.createElement('div');
        const authorName = document.createElement('div');
        authorName.textContent = post.author;
        authorName.style.fontWeight = '600';
        authorName.style.fontSize = '0.9rem';
        
        const publishDate = document.createElement('div');
        publishDate.textContent = formatDate(post.publishDate);
        publishDate.style.fontSize = '0.8rem';
        publishDate.style.opacity = '0.8';
        
        authorInfo.appendChild(authorName);
        authorInfo.appendChild(publishDate);
        
        meta.appendChild(authorImg);
        meta.appendChild(authorInfo);
        
        const excerpt = document.createElement('p');
        excerpt.textContent = post.excerpt;
        excerpt.style.marginBottom = '20px';
        excerpt.style.fontSize = '1rem';
        excerpt.style.lineHeight = '1.6';
        excerpt.style.opacity = '0.9';
        
        const readMore = document.createElement('div');
        readMore.innerHTML = 'Read Article <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        readMore.style.display = 'flex';
        readMore.style.alignItems = 'center';
        readMore.style.gap = '8px';
        readMore.style.fontWeight = '600';
        readMore.style.fontSize = '0.9rem';
        
        item.appendChild(category);
        item.appendChild(title);
        item.appendChild(meta);
        item.appendChild(excerpt);
        item.appendChild(readMore);
      } 
      else if (variant === 'quote') {
        item.style.background = 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)';
        item.style.color = 'white';
        item.style.padding = '30px';
        
        const quoteIcon = document.createElement('div');
        quoteIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path><path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path></svg>';
        quoteIcon.style.opacity = '0.5';
        quoteIcon.style.marginBottom = '16px';
        
        const quoteText = document.createElement('p');
        quoteText.textContent = '"' + post.excerpt + '"';
        quoteText.style.fontSize = '1.2rem';
        quoteText.style.fontStyle = 'italic';
        quoteText.style.marginBottom = '20px';
        quoteText.style.lineHeight = '1.6';
        
        const meta = document.createElement('div');
        meta.style.display = 'flex';
        meta.style.alignItems = 'center';
        
        const author = document.createElement('div');
        author.textContent = '— ' + post.author;
        author.style.fontWeight = '600';
        
        const title = document.createElement('div');
        title.textContent = post.title;
        title.style.fontSize = '0.8rem';
        title.style.opacity = '0.8';
        
        meta.appendChild(author);
        
        item.appendChild(quoteIcon);
        item.appendChild(quoteText);
        item.appendChild(meta);
      }
      else if (variant === 'stat') {
        item.style.background = 'linear-gradient(135deg, #065F46 0%, #10B981 100%)';
        item.style.color = 'white';
        item.style.padding = '30px';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.justifyContent = 'center';
        item.style.alignItems = 'center';
        item.style.textAlign = 'center';
        
        const statValue = document.createElement('div');
        statValue.textContent = '87%';
        statValue.style.fontSize = '3.5rem';
        statValue.style.fontWeight = '800';
        statValue.style.marginBottom = '8px';
        statValue.style.background = 'linear-gradient(90deg, #d1fae5, #ffffff)';
        statValue.style.webkitBackgroundClip = 'text';
        statValue.style.backgroundClip = 'text';
        statValue.style.color = 'transparent';
        
        const statLabel = document.createElement('div');
        statLabel.textContent = 'of service providers improved their finances with these strategies';
        statLabel.style.fontSize = '1rem';
        statLabel.style.lineHeight = '1.5';
        statLabel.style.marginBottom = '16px';
        
        const readMore = document.createElement('a');
        readMore.textContent = 'Read the research';
        readMore.style.fontSize = '0.9rem';
        readMore.style.fontWeight = '600';
        readMore.style.textDecoration = 'underline';
        
        item.appendChild(statValue);
        item.appendChild(statLabel);
        item.appendChild(readMore);
      }
      else {
        // Standard item
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.backgroundColor = 'white';
        
        const imageContainer = document.createElement('div');
        imageContainer.style.height = '180px';
        imageContainer.style.overflow = 'hidden';
        
        const image = document.createElement('img');
        image.src = post.coverImage;
        image.alt = post.title;
        image.style.width = '100%';
        image.style.height = '100%';
        image.style.objectFit = 'cover';
        image.style.transition = 'transform 0.5s ease';
        imageContainer.appendChild(image);
        
        const content = document.createElement('div');
        content.style.padding = '20px';
        content.style.flex = '1';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        
        const category = document.createElement('div');
        category.textContent = blogCategories.find(c => c.id === post.categoryId)?.name || 'Uncategorized';
        category.style.color = blogCategories.find(c => c.id === post.categoryId)?.color || '#3182CE';
        category.style.fontSize = '0.8rem';
        category.style.fontWeight = '600';
        category.style.marginBottom = '8px';
        
        const title = document.createElement('h3');
        title.textContent = post.title;
        title.style.fontSize = '1.2rem';
        title.style.fontWeight = '700';
        title.style.marginBottom = '12px';
        title.style.color = '#1A202C';
        title.style.lineHeight = '1.4';
        
        const excerpt = document.createElement('p');
        excerpt.textContent = post.excerpt;
        excerpt.style.fontSize = '0.9rem';
        excerpt.style.color = '#4A5568';
        excerpt.style.marginBottom = '16px';
        excerpt.style.lineHeight = '1.6';
        excerpt.style.flex = '1';
        
        const meta = document.createElement('div');
        meta.style.display = 'flex';
        meta.style.justifyContent = 'space-between';
        meta.style.alignItems = 'center';
        meta.style.borderTop = '1px solid #E2E8F0';
        meta.style.paddingTop = '12px';
        meta.style.fontSize = '0.8rem';
        meta.style.color = '#718096';
        
        const date = document.createElement('div');
        date.textContent = formatDate(post.publishDate);
        
        const readTime = document.createElement('div');
        readTime.textContent = `${Math.ceil(post.content.length / 1000)} min read`;
        
        meta.appendChild(date);
        meta.appendChild(readTime);
        
        content.appendChild(category);
        content.appendChild(title);
        content.appendChild(excerpt);
        content.appendChild(meta);
        
        item.appendChild(imageContainer);
        item.appendChild(content);
      }
      
      // Add hover effects
      item.addEventListener('mouseover', () => {
        item.style.transform = 'translateY(-5px)';
        item.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        
        // Zoom in image if present
        const img = item.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1.05)';
        }
      });
      
      item.addEventListener('mouseout', () => {
        item.style.transform = 'translateY(0)';
        item.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
        
        // Reset image
        const img = item.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1)';
        }
      });
      
      // Add click handler
      item.addEventListener('click', () => {
        openArticle(post.slug);
      });
      
      return item;
    }
  }
  
  /**
   * Create category tabs for filtering
   * @returns {HTMLElement} Category tabs element
   */
  function createCategoryTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'blog-category-tabs';
    tabsContainer.style.marginBottom = '30px';
    tabsContainer.style.overflowX = 'auto';
    tabsContainer.style.scrollbarWidth = 'none'; // Hide scrollbar for Firefox
    tabsContainer.style.msOverflowStyle = 'none'; // Hide scrollbar for IE/Edge
    
    // Hide scrollbar for Chrome/Safari
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = `
      .blog-category-tabs::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(scrollbarStyle);
    
    const tabsList = document.createElement('div');
    tabsList.className = 'tabs-list';
    tabsList.style.display = 'flex';
    tabsList.style.gap = '10px';
    tabsList.style.padding = '0 20px';
    
    // All posts tab
    const allTab = createCategoryTab('all', 'All Posts', true);
    tabsList.appendChild(allTab);
    
    // Category tabs
    blogCategories.filter(category => category.id !== 'all').forEach(category => {
      const tab = createCategoryTab(category.id, category.name, false, category.color, category.icon);
      tabsList.appendChild(tab);
    });
    
    tabsContainer.appendChild(tabsList);
    return tabsContainer;
    
    /**
     * Create a category tab
     * @param {string} id - Category ID
     * @param {string} name - Category name
     * @param {boolean} isActive - Whether the tab is active
     * @param {string} color - Category color
     * @param {string} icon - Category icon HTML
     * @returns {HTMLElement} Tab element
     */
    function createCategoryTab(id, name, isActive = false, color = '#3182CE', icon = null) {
      const tab = document.createElement('button');
      tab.className = `category-tab ${isActive ? 'active' : ''}`;
      tab.setAttribute('data-category', id);
      tab.style.display = 'flex';
      tab.style.alignItems = 'center';
      tab.style.gap = '8px';
      tab.style.padding = '10px 16px';
      tab.style.borderRadius = '50px';
      tab.style.border = 'none';
      tab.style.backgroundColor = isActive ? color : '#EDF2F7';
      tab.style.color = isActive ? 'white' : '#4A5568';
      tab.style.fontSize = '0.9rem';
      tab.style.fontWeight = isActive ? '600' : '500';
      tab.style.cursor = 'pointer';
      tab.style.transition = 'all 0.2s ease';
      tab.style.whiteSpace = 'nowrap';
      
      if (icon) {
        const iconSpan = document.createElement('span');
        iconSpan.innerHTML = icon;
        iconSpan.style.display = 'flex';
        iconSpan.style.alignItems = 'center';
        tab.appendChild(iconSpan);
      }
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = name;
      tab.appendChild(nameSpan);
      
      // Add click handler
      tab.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.category-tab').forEach(t => {
          t.classList.remove('active');
          t.style.backgroundColor = '#EDF2F7';
          t.style.color = '#4A5568';
          t.style.fontWeight = '500';
        });
        
        tab.classList.add('active');
        tab.style.backgroundColor = color;
        tab.style.color = 'white';
        tab.style.fontWeight = '600';
        
        // Filter posts
        if (id === 'all') {
          renderPostsList(postsListContainer, blogPosts, true);
        } else {
          const filteredPosts = filterPostsByCategory(id);
          renderPostsList(postsListContainer, filteredPosts, true);
        }
      });
      
      return tab;
    }
  }
  
  /**
   * Create enhanced sidebar with newsletter signup
   * @returns {HTMLElement} Enhanced sidebar element
   */
  function createEnhancedSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'blog-sidebar';
    sidebar.style.position = 'sticky';
    sidebar.style.top = '20px';
    
    // Newsletter signup
    const newsletterSection = document.createElement('div');
    newsletterSection.className = 'blog-sidebar-section newsletter-signup';
    newsletterSection.style.backgroundColor = 'white';
    newsletterSection.style.borderRadius = '16px';
    newsletterSection.style.padding = '24px';
    newsletterSection.style.marginBottom = '30px';
    newsletterSection.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.05)';
    newsletterSection.style.border = '1px solid #E2E8F0';
    
    const newsletterTitle = document.createElement('h3');
    newsletterTitle.textContent = 'Get Financial Tips';
    newsletterTitle.style.fontSize = '1.2rem';
    newsletterTitle.style.fontWeight = '700';
    newsletterTitle.style.marginBottom = '10px';
    newsletterTitle.style.color = '#1A202C';
    
    const newsletterDesc = document.createElement('p');
    newsletterDesc.textContent = 'Join 10,000+ service providers who get weekly financial insights.';
    newsletterDesc.style.fontSize = '0.95rem';
    newsletterDesc.style.color = '#4A5568';
    newsletterDesc.style.marginBottom = '20px';
    newsletterDesc.style.lineHeight = '1.5';
    
    const signupForm = document.createElement('form');
    signupForm.className = 'newsletter-form';
    signupForm.style.display = 'flex';
    signupForm.style.flexDirection = 'column';
    signupForm.style.gap = '12px';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Your email address';
    emailInput.required = true;
    emailInput.style.padding = '12px 16px';
    emailInput.style.borderRadius = '8px';
    emailInput.style.border = '1px solid #CBD5E0';
    emailInput.style.fontSize = '0.95rem';
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Subscribe Now';
    submitButton.style.backgroundColor = '#3182CE';
    submitButton.style.color = 'white';
    submitButton.style.padding = '12px';
    submitButton.style.borderRadius = '8px';
    submitButton.style.border = 'none';
    submitButton.style.fontSize = '0.95rem';
    submitButton.style.fontWeight = '600';
    submitButton.style.cursor = 'pointer';
    submitButton.style.transition = 'all 0.2s ease';
    
    submitButton.addEventListener('mouseover', () => {
      submitButton.style.backgroundColor = '#2C5282';
    });
    
    submitButton.addEventListener('mouseout', () => {
      submitButton.style.backgroundColor = '#3182CE';
    });
    
    signupForm.appendChild(emailInput);
    signupForm.appendChild(submitButton);
    
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulate successful signup
      signupForm.innerHTML = '';
      
      const successMessage = document.createElement('div');
      successMessage.style.backgroundColor = '#C6F6D5';
      successMessage.style.color = '#22543D';
      successMessage.style.padding = '12px';
      successMessage.style.borderRadius = '8px';
      successMessage.style.display = 'flex';
      successMessage.style.alignItems = 'center';
      successMessage.style.gap = '10px';
      
      const checkIcon = document.createElement('span');
      checkIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      
      const successText = document.createElement('span');
      successText.textContent = 'Success! Check your inbox.';
      
      successMessage.appendChild(checkIcon);
      successMessage.appendChild(successText);
      signupForm.appendChild(successMessage);
    });
    
    const privacyNote = document.createElement('p');
    privacyNote.textContent = 'We respect your privacy. Unsubscribe anytime.';
    privacyNote.style.fontSize = '0.8rem';
    privacyNote.style.color = '#718096';
    privacyNote.style.marginTop = '10px';
    privacyNote.style.textAlign = 'center';
    
    newsletterSection.appendChild(newsletterTitle);
    newsletterSection.appendChild(newsletterDesc);
    newsletterSection.appendChild(signupForm);
    newsletterSection.appendChild(privacyNote);
    sidebar.appendChild(newsletterSection);
    
    // Popular tags with enhanced styling
    const tagsSection = document.createElement('div');
    tagsSection.className = 'blog-sidebar-section';
    tagsSection.style.backgroundColor = 'white';
    tagsSection.style.borderRadius = '16px';
    tagsSection.style.padding = '24px';
    tagsSection.style.marginBottom = '30px';
    tagsSection.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.05)';
    tagsSection.style.border = '1px solid #E2E8F0';
    
    const tagsHeading = document.createElement('h3');
    tagsHeading.textContent = 'Popular Topics';
    tagsHeading.style.fontSize = '1.2rem';
    tagsHeading.style.fontWeight = '700';
    tagsHeading.style.marginBottom = '16px';
    tagsHeading.style.color = '#1A202C';
    
    const tagCloud = document.createElement('div');
    tagCloud.className = 'blog-tag-cloud';
    tagCloud.style.display = 'flex';
    tagCloud.style.flexWrap = 'wrap';
    tagCloud.style.gap = '8px';
    
    const popularTags = getPopularTags(12);
    popularTags.forEach(tag => {
      const tagItem = document.createElement('span');
      tagItem.textContent = tag.name;
      tagItem.className = 'blog-tag-item';
      tagItem.style.padding = '6px 12px';
      tagItem.style.backgroundColor = '#EDF2F7';
      tagItem.style.color = '#4A5568';
      tagItem.style.borderRadius = '50px';
      tagItem.style.fontSize = '0.85rem';
      tagItem.style.cursor = 'pointer';
      tagItem.style.transition = 'all 0.2s ease';
      
      tagItem.addEventListener('mouseover', () => {
        tagItem.style.backgroundColor = '#E2E8F0';
      });
      
      tagItem.addEventListener('mouseout', () => {
        tagItem.style.backgroundColor = '#EDF2F7';
      });
      
      tagItem.addEventListener('click', () => {
        // Filter posts by tag
        const filteredPosts = blogPosts.filter(post => 
          post.tags.includes(tag.name)
        );
        renderPostsList(postsListContainer, filteredPosts, true);
      });
      
      tagCloud.appendChild(tagItem);
    });
    
    tagsSection.appendChild(tagsHeading);
    tagsSection.appendChild(tagCloud);
    sidebar.appendChild(tagsSection);
    
    // Trending articles
    const trendingSection = document.createElement('div');
    trendingSection.className = 'blog-sidebar-section';
    trendingSection.style.backgroundColor = 'white';
    trendingSection.style.borderRadius = '16px';
    trendingSection.style.padding = '24px';
    trendingSection.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.05)';
    trendingSection.style.border = '1px solid #E2E8F0';
    
    const trendingHeading = document.createElement('h3');
    trendingHeading.textContent = 'Trending Articles';
    trendingHeading.style.fontSize = '1.2rem';
    trendingHeading.style.fontWeight = '700';
    trendingHeading.style.marginBottom = '16px';
    trendingHeading.style.color = '#1A202C';
    
    const trendingList = document.createElement('div');
    trendingList.className = 'trending-articles-list';
    trendingList.style.display = 'flex';
    trendingList.style.flexDirection = 'column';
    trendingList.style.gap = '16px';
    
    // Get trending articles (first 4)
    const trendingPosts = getLatestPosts(4);
    
    trendingPosts.forEach((post, index) => {
      const article = document.createElement('div');
      article.className = 'trending-article';
      article.style.display = 'flex';
      article.style.gap = '12px';
      article.style.cursor = 'pointer';
      
      const number = document.createElement('div');
      number.textContent = `0${index + 1}`;
      number.style.fontSize = '1.2rem';
      number.style.fontWeight = '800';
      number.style.color = '#CBD5E0';
      number.style.minWidth = '30px';
      
      const content = document.createElement('div');
      
      const title = document.createElement('h4');
      title.textContent = post.title;
      title.style.fontSize = '0.95rem';
      title.style.fontWeight = '600';
      title.style.marginBottom = '4px';
      title.style.color = '#2D3748';
      title.style.lineHeight = '1.4';
      
      const meta = document.createElement('div');
      meta.style.display = 'flex';
      meta.style.alignItems = 'center';
      meta.style.gap = '8px';
      meta.style.fontSize = '0.8rem';
      meta.style.color = '#718096';
      
      const date = document.createElement('span');
      date.textContent = formatDate(post.publishDate);
      
      const dot = document.createElement('span');
      dot.textContent = '•';
      
      const readTime = document.createElement('span');
      readTime.textContent = `${Math.ceil(post.content.length / 1000)} min read`;
      
      meta.appendChild(date);
      meta.appendChild(dot);
      meta.appendChild(readTime);
      
      content.appendChild(title);
      content.appendChild(meta);
      
      article.appendChild(number);
      article.appendChild(content);
      
      article.addEventListener('click', () => {
        openArticle(post.slug);
      });
      
      trendingList.appendChild(article);
    });
    
    trendingSection.appendChild(trendingHeading);
    trendingSection.appendChild(trendingList);
    sidebar.appendChild(trendingSection);
    
    return sidebar;
  }
  
  /**
   * Create the community section with newsletter and discussion
   * @returns {HTMLElement} Community section element
   */
  function createCommunitySection() {
    const section = document.createElement('div');
    section.className = 'blog-community-section';
    section.style.backgroundColor = '#F7FAFC';
    section.style.padding = '60px 20px';
    section.style.marginTop = '80px';
    section.style.borderTop = '1px solid #E2E8F0';
    section.style.borderBottom = '1px solid #E2E8F0';
    
    const container = document.createElement('div');
    container.style.maxWidth = '1200px';
    container.style.margin = '0 auto';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '40px';
    
    // Community column
    const communityCol = document.createElement('div');
    communityCol.style.flex = '1';
    communityCol.style.minWidth = '300px';
    
    const communityTitle = document.createElement('h2');
    communityTitle.textContent = 'Join Our Community';
    communityTitle.style.fontSize = '1.8rem';
    communityTitle.style.fontWeight = '700';
    communityTitle.style.marginBottom = '16px';
    communityTitle.style.color = '#1A202C';
    
    const communityDesc = document.createElement('p');
    communityDesc.textContent = 'Connect with other service providers to share insights, strategies, and success stories.';
    communityDesc.style.fontSize = '1.1rem';
    communityDesc.style.marginBottom = '24px';
    communityDesc.style.color = '#4A5568';
    communityDesc.style.lineHeight = '1.6';
    
    const communityStats = document.createElement('div');
    communityStats.style.display = 'flex';
    communityStats.style.gap = '30px';
    communityStats.style.marginBottom = '30px';
    
    const stats = [
      { value: '15K+', label: 'Members' },
      { value: '200+', label: 'Daily Posts' },
      { value: '24/7', label: 'Support' }
    ];
    
    stats.forEach(stat => {
      const statItem = document.createElement('div');
      
      const statValue = document.createElement('div');
      statValue.textContent = stat.value;
      statValue.style.fontSize = '2rem';
      statValue.style.fontWeight = '800';
      statValue.style.color = '#3182CE';
      statValue.style.marginBottom = '4px';
      
      const statLabel = document.createElement('div');
      statLabel.textContent = stat.label;
      statLabel.style.fontSize = '0.9rem';
      statLabel.style.color = '#718096';
      
      statItem.appendChild(statValue);
      statItem.appendChild(statLabel);
      communityStats.appendChild(statItem);
    });
    
    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join Discussion';
    joinButton.style.backgroundColor = '#3182CE';
    joinButton.style.color = 'white';
    joinButton.style.padding = '12px 24px';
    joinButton.style.borderRadius = '8px';
    joinButton.style.fontSize = '1rem';
    joinButton.style.fontWeight = '600';
    joinButton.style.border = 'none';
    joinButton.style.cursor = 'pointer';
    joinButton.style.transition = 'all 0.2s ease';
    
    joinButton.addEventListener('mouseover', () => {
      joinButton.style.backgroundColor = '#2C5282';
    });
    
    joinButton.addEventListener('mouseout', () => {
      joinButton.style.backgroundColor = '#3182CE';
    });
    
    communityCol.appendChild(communityTitle);
    communityCol.appendChild(communityDesc);
    communityCol.appendChild(communityStats);
    communityCol.appendChild(joinButton);
    
    // Comment column
    const commentCol = document.createElement('div');
    commentCol.style.flex = '1';
    commentCol.style.minWidth = '300px';
    
    const commentTitle = document.createElement('h3');
    commentTitle.textContent = 'Recent Discussions';
    commentTitle.style.fontSize = '1.4rem';
    commentTitle.style.fontWeight = '700';
    commentTitle.style.marginBottom = '20px';
    commentTitle.style.color = '#1A202C';
    
    const commentsList = document.createElement('div');
    commentsList.className = 'recent-comments';
    commentsList.style.display = 'flex';
    commentsList.style.flexDirection = 'column';
    commentsList.style.gap = '16px';
    
    const comments = [
      {
        author: "Sarah Johnson",
        text: "The 40/30/30 rule completely changed how I handle my freelance income. I've been debt-free for 3 months now!",
        timestamp: "2 hours ago",
        avatar: "SJ"
      },
      {
        author: "Michael Chen",
        text: "Has anyone tried the Subscription Sniper tool? I'm curious about how much it actually saved people.",
        timestamp: "5 hours ago",
        avatar: "MC"
      },
      {
        author: "Alicia Rodriguez",
        text: "The emergency fund guide was exactly what I needed. Starting small with $500 and building from there.",
        timestamp: "1 day ago",
        avatar: "AR"
      }
    ];
    
    comments.forEach(comment => {
      const commentItem = document.createElement('div');
      commentItem.className = 'comment-item';
      commentItem.style.display = 'flex';
      commentItem.style.gap = '12px';
      commentItem.style.padding = '16px';
      commentItem.style.backgroundColor = 'white';
      commentItem.style.borderRadius = '12px';
      commentItem.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
      
      const avatar = document.createElement('div');
      avatar.textContent = comment.avatar;
      avatar.style.width = '40px';
      avatar.style.height = '40px';
      avatar.style.borderRadius = '50%';
      avatar.style.backgroundColor = '#3182CE';
      avatar.style.color = 'white';
      avatar.style.display = 'flex';
      avatar.style.alignItems = 'center';
      avatar.style.justifyContent = 'center';
      avatar.style.fontWeight = '600';
      avatar.style.flexShrink = '0';
      
      const content = document.createElement('div');
      
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.marginBottom = '8px';
      
      const author = document.createElement('div');
      author.textContent = comment.author;
      author.style.fontWeight = '600';
      author.style.color = '#2D3748';
      
      const timestamp = document.createElement('div');
      timestamp.textContent = comment.timestamp;
      timestamp.style.fontSize = '0.8rem';
      timestamp.style.color = '#718096';
      
      header.appendChild(author);
      header.appendChild(timestamp);
      
      const text = document.createElement('p');
      text.textContent = comment.text;
      text.style.fontSize = '0.95rem';
      text.style.color = '#4A5568';
      text.style.lineHeight = '1.5';
      text.style.marginBottom = '8px';
      
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '16px';
      actions.style.fontSize = '0.8rem';
      actions.style.color = '#718096';
      
      const reply = document.createElement('button');
      reply.textContent = 'Reply';
      reply.style.background = 'none';
      reply.style.border = 'none';
      reply.style.padding = '0';
      reply.style.color = '#3182CE';
      reply.style.fontWeight = '600';
      reply.style.cursor = 'pointer';
      
      const like = document.createElement('button');
      like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg> Like';
      like.style.display = 'flex';
      like.style.alignItems = 'center';
      like.style.gap = '4px';
      like.style.background = 'none';
      like.style.border = 'none';
      like.style.padding = '0';
      like.style.color = '#718096';
      like.style.cursor = 'pointer';
      
      actions.appendChild(reply);
      actions.appendChild(like);
      
      content.appendChild(header);
      content.appendChild(text);
      content.appendChild(actions);
      
      commentItem.appendChild(avatar);
      commentItem.appendChild(content);
      
      commentsList.appendChild(commentItem);
    });
    
    const viewMore = document.createElement('a');
    viewMore.textContent = 'View All Discussions →';
    viewMore.href = '#';
    viewMore.style.color = '#3182CE';
    viewMore.style.fontWeight = '600';
    viewMore.style.marginTop = '16px';
    viewMore.style.display = 'inline-block';
    viewMore.style.textDecoration = 'none';
    
    commentCol.appendChild(commentTitle);
    commentCol.appendChild(commentsList);
    commentCol.appendChild(viewMore);
    
    container.appendChild(communityCol);
    container.appendChild(commentCol);
    section.appendChild(container);
    
    return section;
  }
  
  /**
   * Add scroll animations to elements
   * @param {HTMLElement} container - Container element
   */
  function addScrollAnimations(container) {
    // Create animation CSS
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
      .fade-in-up {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      
      .fade-in-up.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .fade-in-left {
        opacity: 0;
        transform: translateX(-20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      
      .fade-in-left.visible {
        opacity: 1;
        transform: translateX(0);
      }
      
      .fade-in-right {
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      
      .fade-in-right.visible {
        opacity: 1;
        transform: translateX(0);
      }
    `;
    document.head.appendChild(animationStyle);
    
    // Add animation classes to elements
    const heroElements = container.querySelectorAll('.blog-hero-section > *');
    heroElements.forEach((el, index) => {
      el.classList.add('fade-in-up');
      el.style.transitionDelay = `${index * 0.1}s`;
    });
    
    const bentoItems = container.querySelectorAll('.bento-item');
    bentoItems.forEach((el, index) => {
      el.classList.add('fade-in-up');
      el.style.transitionDelay = `${index * 0.1}s`;
    });
    
    const postCards = container.querySelectorAll('.blog-post-card');
    postCards.forEach((el, index) => {
      el.classList.add('fade-in-up');
      el.style.transitionDelay = `${index * 0.05}s`;
    });
    
    const sidebarSections = container.querySelectorAll('.blog-sidebar-section');
    sidebarSections.forEach((el, index) => {
      el.classList.add('fade-in-right');
      el.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Set up intersection observer
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });
      
      // Observe all elements with animation classes
      const animatedElements = container.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
      animatedElements.forEach(el => {
        observer.observe(el);
      });
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      const animatedElements = container.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
      animatedElements.forEach(el => {
        el.classList.add('visible');
      });
    }
  }
  
  /**
   * Render posts list in the specified container with animation
   * @param {HTMLElement} container - Container element
   * @param {Array} posts - Posts to render
   * @param {boolean} animate - Whether to animate the posts
   */
  function renderPostsList(container, posts, animate = false) {
    // Clear container
    container.innerHTML = '';
    
    if (posts.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'blog-no-results';
      noResults.textContent = 'No posts found. Try a different search or category.';
      noResults.style.padding = '40px';
      noResults.style.textAlign = 'center';
      noResults.style.color = '#718096';
      noResults.style.fontSize = '1.1rem';
      container.appendChild(noResults);
      return;
    }
    
    // Create masonry layout
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    container.style.gap = '30px';
    container.style.padding = '0 0 40px 0';
    
    posts.forEach((post, index) => {
      const postCard = createEnhancedPostCard(post);
      
      if (animate) {
        postCard.style.opacity = '0';
        postCard.style.transform = 'translateY(20px)';
        postCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        postCard.style.transitionDelay = `${index * 0.05}s`;
        
        // Trigger animation after a small delay
        setTimeout(() => {
          postCard.style.opacity = '1';
          postCard.style.transform = 'translateY(0)';
        }, 10);
      }
      
      container.appendChild(postCard);
    });
  }
  
  /**
   * Create an enhanced post card with modern design and interactivity
   * @param {Object} post - Post data
   * @returns {HTMLElement} Enhanced post card element
   */
  function createEnhancedPostCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-post-card';
    card.style.backgroundColor = 'white';
    card.style.borderRadius = '16px';
    card.style.overflow = 'hidden';
    card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.05)';
    card.style.transition = 'all 0.3s ease';
    card.style.border = '1px solid #E2E8F0';
    card.style.cursor = 'pointer';
    
    // Add hover effects
    card.addEventListener('mouseover', () => {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = '0 20px 30px rgba(0, 0, 0, 0.1)';
    });
    
    card.addEventListener('mouseout', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.05)';
    });
    
    // Image container with overlay effect
    const imageContainer = document.createElement('div');
    imageContainer.className = 'blog-post-image-container';
    imageContainer.style.height = '200px';
    imageContainer.style.position = 'relative';
    imageContainer.style.overflow = 'hidden';
    
    const image = document.createElement('img');
    image.src = post.coverImage;
    image.alt = post.title;
    image.className = 'blog-post-image';
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.style.transition = 'transform 0.5s ease';
    
    // Category badge
    const category = document.createElement('span');
    const categoryData = blogCategories.find(c => c.id === post.categoryId);
    category.textContent = categoryData?.name || 'Uncategorized';
    category.className = 'blog-post-category';
    category.style.position = 'absolute';
    category.style.top = '12px';
    category.style.left = '12px';
    category.style.backgroundColor = categoryData?.color || '#3182CE';
    category.style.color = 'white';
    category.style.padding = '4px 12px';
    category.style.borderRadius = '20px';
    category.style.fontSize = '0.75rem';
    category.style.fontWeight = '600';
    category.style.letterSpacing = '0.5px';
    category.style.textTransform = 'uppercase';
    category.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    
    imageContainer.appendChild(image);
    imageContainer.appendChild(category);
    
    // Content section
    const content = document.createElement('div');
    content.className = 'blog-post-content';
    content.style.padding = '20px';
    
    // Post metadata
    const meta = document.createElement('div');
    meta.className = 'blog-post-meta';
    meta.style.display = 'flex';
    meta.style.alignItems = 'center';
    meta.style.marginBottom = '12px';
    meta.style.fontSize = '0.8rem';
    meta.style.color = '#718096';
    
    const date = document.createElement('span');
    date.className = 'blog-post-date';
    date.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    date.innerHTML += ' ' + formatDate(post.publishDate);
    date.style.display = 'flex';
    date.style.alignItems = 'center';
    date.style.gap = '4px';
    
    const readTime = document.createElement('span');
    readTime.className = 'blog-post-read-time';
    readTime.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
    readTime.innerHTML += ` ${Math.max(1, Math.ceil(post.content.length / 1000))} min read`;
    readTime.style.display = 'flex';
    readTime.style.alignItems = 'center';
    readTime.style.gap = '4px';
    readTime.style.marginLeft = '12px';
    
    meta.appendChild(date);
    meta.appendChild(readTime);
    
    // Title with line-clamp for consistent height
    const title = document.createElement('h3');
    title.textContent = post.title;
    title.className = 'blog-post-title';
    title.style.fontSize = '1.25rem';
    title.style.fontWeight = '700';
    title.style.marginBottom = '10px';
    title.style.color = '#1A202C';
    title.style.lineHeight = '1.4';
    title.style.display = '-webkit-box';
    title.style.webkitLineClamp = '2';
    title.style.webkitBoxOrient = 'vertical';
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';
    
    // Excerpt with line-clamp
    const excerpt = document.createElement('p');
    excerpt.textContent = post.excerpt;
    excerpt.className = 'blog-post-excerpt';
    excerpt.style.fontSize = '0.95rem';
    excerpt.style.lineHeight = '1.6';
    excerpt.style.color = '#4A5568';
    excerpt.style.marginBottom = '16px';
    excerpt.style.display = '-webkit-box';
    excerpt.style.webkitLineClamp = '3';
    excerpt.style.webkitBoxOrient = 'vertical';
    excerpt.style.overflow = 'hidden';
    excerpt.style.textOverflow = 'ellipsis';
    
    // Author info with avatar
    const authorContainer = document.createElement('div');
    authorContainer.className = 'blog-post-author-container';
    authorContainer.style.display = 'flex';
    authorContainer.style.alignItems = 'center';
    authorContainer.style.justifyContent = 'space-between';
    authorContainer.style.borderTop = '1px solid #E2E8F0';
    authorContainer.style.paddingTop = '12px';
    
    const authorInfo = document.createElement('div');
    authorInfo.className = 'blog-post-author-info';
    authorInfo.style.display = 'flex';
    authorInfo.style.alignItems = 'center';
    
    const authorAvatar = document.createElement('div');
    authorAvatar.className = 'blog-post-author-avatar';
    authorAvatar.style.width = '30px';
    authorAvatar.style.height = '30px';
    authorAvatar.style.borderRadius = '50%';
    authorAvatar.style.backgroundColor = '#E2E8F0';
    authorAvatar.style.marginRight = '8px';
    authorAvatar.style.display = 'flex';
    authorAvatar.style.alignItems = 'center';
    authorAvatar.style.justifyContent = 'center';
    authorAvatar.style.color = '#4A5568';
    authorAvatar.style.fontWeight = '600';
    authorAvatar.style.fontSize = '0.8rem';
    
    // Set avatar initials
    const authorInitials = post.author.split(' ').map(n => n[0]).join('');
    authorAvatar.textContent = authorInitials;
    
    const authorName = document.createElement('span');
    authorName.className = 'blog-post-author-name';
    authorName.textContent = post.author;
    authorName.style.fontSize = '0.85rem';
    authorName.style.fontWeight = '600';
    authorName.style.color = '#2D3748';
    
    authorInfo.appendChild(authorAvatar);
    authorInfo.appendChild(authorName);
    
    // Read more button with arrow
    const readMore = document.createElement('a');
    readMore.textContent = 'Read Article';
    readMore.className = 'blog-post-read-more';
    readMore.style.fontSize = '0.85rem';
    readMore.style.fontWeight = '600';
    readMore.style.color = '#3182CE';
    readMore.style.display = 'flex';
    readMore.style.alignItems = 'center';
    readMore.style.gap = '4px';
    
    const arrowIcon = document.createElement('span');
    arrowIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
    arrowIcon.style.transition = 'transform 0.2s ease';
    readMore.appendChild(arrowIcon);
    
    readMore.addEventListener('mouseover', () => {
      arrowIcon.style.transform = 'translateX(3px)';
    });
    
    readMore.addEventListener('mouseout', () => {
      arrowIcon.style.transform = 'translateX(0)';
    });
    
    authorContainer.appendChild(authorInfo);
    authorContainer.appendChild(readMore);
    
    // Assemble card
    content.appendChild(meta);
    content.appendChild(title);
    content.appendChild(excerpt);
    content.appendChild(authorContainer);
    
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    // Add SEO-friendly structured data
    const articleSchema = document.createElement('script');
    articleSchema.type = 'application/ld+json';
    articleSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "image": post.coverImage,
      "datePublished": post.publishDate,
      "author": {
        "@type": "Person",
        "name": post.author
      }
    });
    card.appendChild(articleSchema);
    
    // Add click handler for entire card
    card.addEventListener('click', () => {
      openArticle(post.slug);
    });
    
    return card;
  }
  
  /**
   * Create the title section with search functionality
   * @returns {HTMLElement} Title section element
   */
  function createTitleSection() {
    const section = document.createElement('div');
    section.className = 'blog-title-section';
    
    const title = document.createElement('h1');
    title.textContent = 'Stackr Finance Blog';
    title.className = 'blog-title';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Financial wisdom for service providers';
    subtitle.className = 'blog-subtitle';
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'blog-search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search articles...';
    searchInput.className = 'blog-search-input';
    
    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.className = 'blog-search-button';
    
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        const results = searchPosts(query);
        renderPostsList(postsListContainer, results);
      }
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchButton.click();
      }
    });
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    
    section.appendChild(title);
    section.appendChild(subtitle);
    section.appendChild(searchContainer);
    
    return section;
  }
  
  /**
   * Create the featured posts section
   * @returns {HTMLElement} Featured section element
   */
  function createFeaturedSection() {
    const section = document.createElement('div');
    section.className = 'blog-featured-section';
    
    const heading = document.createElement('h2');
    heading.textContent = 'Featured Articles';
    heading.className = 'blog-section-heading';
    section.appendChild(heading);
    
    const featuredGrid = document.createElement('div');
    featuredGrid.className = 'blog-featured-grid';
    
    const featuredPosts = getFeaturedPosts(3);
    
    featuredPosts.forEach(post => {
      const postCard = createFeaturedPostCard(post);
      featuredGrid.appendChild(postCard);
    });
    
    section.appendChild(featuredGrid);
    return section;
  }
  
  /**
   * Create a featured post card
   * @param {Object} post - Post data
   * @returns {HTMLElement} Post card element
   */
  function createFeaturedPostCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-featured-card';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'blog-featured-image-container';
    
    const image = document.createElement('img');
    image.src = post.coverImage;
    image.alt = post.title;
    image.className = 'blog-featured-image';
    imageContainer.appendChild(image);
    
    const content = document.createElement('div');
    content.className = 'blog-featured-content';
    
    const title = document.createElement('h3');
    title.textContent = post.title;
    title.className = 'blog-featured-title';
    
    const excerpt = document.createElement('p');
    excerpt.textContent = post.excerpt;
    excerpt.className = 'blog-featured-excerpt';
    
    const readMore = document.createElement('a');
    readMore.textContent = 'Read more';
    readMore.href = `#blog/${post.slug}`;
    readMore.className = 'blog-featured-link';
    readMore.addEventListener('click', (e) => {
      e.preventDefault();
      openArticle(post.slug);
    });
    
    content.appendChild(title);
    content.appendChild(excerpt);
    content.appendChild(readMore);
    
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    return card;
  }
  
  /**
   * Create the sidebar with categories and filters
   * @returns {HTMLElement} Sidebar element
   */
  function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'blog-sidebar';
    
    // Categories section
    const categoriesSection = document.createElement('div');
    categoriesSection.className = 'blog-sidebar-section';
    
    const categoriesHeading = document.createElement('h3');
    categoriesHeading.textContent = 'Categories';
    categoriesHeading.className = 'blog-sidebar-heading';
    categoriesSection.appendChild(categoriesHeading);
    
    const categoriesList = document.createElement('ul');
    categoriesList.className = 'blog-categories-list';
    
    // All posts category
    const allCategory = document.createElement('li');
    allCategory.textContent = 'All Posts';
    allCategory.className = 'blog-category-item active';
    allCategory.addEventListener('click', () => {
      // Clear active class from all categories
      categoriesList.querySelectorAll('li').forEach(item => {
        item.classList.remove('active');
      });
      allCategory.classList.add('active');
      
      // Show all posts
      renderPostsList(postsListContainer, blogPosts);
    });
    categoriesList.appendChild(allCategory);
    
    // Individual categories
    blogCategories.forEach(category => {
      const categoryItem = document.createElement('li');
      categoryItem.textContent = category.name;
      categoryItem.className = 'blog-category-item';
      categoryItem.addEventListener('click', () => {
        // Clear active class from all categories
        categoriesList.querySelectorAll('li').forEach(item => {
          item.classList.remove('active');
        });
        categoryItem.classList.add('active');
        
        // Filter posts by category
        const filteredPosts = filterPostsByCategory(category.id);
        renderPostsList(postsListContainer, filteredPosts);
      });
      categoriesList.appendChild(categoryItem);
    });
    
    categoriesSection.appendChild(categoriesList);
    sidebar.appendChild(categoriesSection);
    
    // Popular tags section
    const tagsSection = document.createElement('div');
    tagsSection.className = 'blog-sidebar-section';
    
    const tagsHeading = document.createElement('h3');
    tagsHeading.textContent = 'Popular Tags';
    tagsHeading.className = 'blog-sidebar-heading';
    tagsSection.appendChild(tagsHeading);
    
    const tagCloud = document.createElement('div');
    tagCloud.className = 'blog-tag-cloud';
    
    const popularTags = getPopularTags(10);
    popularTags.forEach(tag => {
      const tagItem = document.createElement('span');
      tagItem.textContent = `${tag.name} (${tag.count})`;
      tagItem.className = 'blog-tag-item';
      tagItem.addEventListener('click', () => {
        // Filter posts by tag
        const filteredPosts = blogPosts.filter(post => 
          post.tags.includes(tag.name)
        );
        renderPostsList(postsListContainer, filteredPosts);
      });
      tagCloud.appendChild(tagItem);
    });
    
    tagsSection.appendChild(tagCloud);
    sidebar.appendChild(tagsSection);
    
    return sidebar;
  }
  
  /**
   * Render posts list in the specified container
   * @param {HTMLElement} container - Container element
   * @param {Array} posts - Posts to render
   */
  function renderPostsList(container, posts) {
    // Clear container
    container.innerHTML = '';
    
    if (posts.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'blog-no-results';
      noResults.textContent = 'No posts found. Try a different search or category.';
      container.appendChild(noResults);
      return;
    }
    
    posts.forEach(post => {
      const postCard = createPostCard(post);
      container.appendChild(postCard);
    });
  }
  
  /**
   * Create a post card
   * @param {Object} post - Post data
   * @returns {HTMLElement} Post card element
   */
  function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-post-card';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'blog-post-image-container';
    
    const image = document.createElement('img');
    image.src = post.coverImage;
    image.alt = post.title;
    image.className = 'blog-post-image';
    imageContainer.appendChild(image);
    
    const content = document.createElement('div');
    content.className = 'blog-post-content';
    
    const category = document.createElement('span');
    category.textContent = blogCategories.find(c => c.id === post.categoryId)?.name || 'Uncategorized';
    category.className = 'blog-post-category';
    
    const title = document.createElement('h3');
    title.textContent = post.title;
    title.className = 'blog-post-title';
    
    const meta = document.createElement('div');
    meta.className = 'blog-post-meta';
    
    const date = document.createElement('span');
    date.textContent = formatDate(post.publishDate);
    date.className = 'blog-post-date';
    
    const author = document.createElement('span');
    author.textContent = post.author;
    author.className = 'blog-post-author';
    
    meta.appendChild(date);
    meta.appendChild(author);
    
    const excerpt = document.createElement('p');
    excerpt.textContent = post.excerpt;
    excerpt.className = 'blog-post-excerpt';
    
    const readMore = document.createElement('a');
    readMore.textContent = 'Read more';
    readMore.href = `#blog/${post.slug}`;
    readMore.className = 'blog-post-link';
    readMore.addEventListener('click', (e) => {
      e.preventDefault();
      openArticle(post.slug);
    });
    
    content.appendChild(category);
    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(excerpt);
    content.appendChild(readMore);
    
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    return card;
  }
  
  /**
   * Open an article by slug
   * @param {string} slug - Article slug
   */
  function openArticle(slug) {
    window.location.hash = `#blog/${slug}`;
  }
}

/**
 * Render individual blog article page
 * @param {string} slug - Article slug
 * @returns {HTMLElement} Article page element
 */
export function renderArticlePage(slug, isAuthenticated = false) {
  const article = getPostBySlug(slug);
  
  if (!article) {
    const notFound = document.createElement('div');
    notFound.className = 'blog-not-found';
    
    const heading = document.createElement('h2');
    heading.textContent = 'Article Not Found';
    
    const message = document.createElement('p');
    message.textContent = 'The article you are looking for does not exist or has been removed.';
    
    const backLink = document.createElement('a');
    backLink.href = '#blog';
    backLink.textContent = 'Back to Blog';
    backLink.className = 'blog-back-link';
    
    notFound.appendChild(heading);
    notFound.appendChild(message);
    notFound.appendChild(backLink);
    
    return notFound;
  }
  
  const articlePage = document.createElement('div');
  articlePage.className = 'blog-article-page';
  
  // Back link
  const backLink = document.createElement('a');
  backLink.href = '#blog';
  backLink.textContent = '← Back to Blog';
  backLink.className = 'blog-back-link';
  articlePage.appendChild(backLink);
  
  // Article header
  const header = document.createElement('header');
  header.className = 'blog-article-header';
  
  const category = document.createElement('span');
  category.textContent = blogCategories.find(c => c.id === article.categoryId)?.name || 'Uncategorized';
  category.className = 'blog-article-category';
  
  const title = document.createElement('h1');
  title.textContent = article.title;
  title.className = 'blog-article-title';
  
  const meta = document.createElement('div');
  meta.className = 'blog-article-meta';
  
  const date = document.createElement('span');
  date.textContent = formatDate(article.publishDate);
  date.className = 'blog-article-date';
  
  const author = document.createElement('span');
  author.textContent = `by ${article.author}`;
  author.className = 'blog-article-author';
  
  meta.appendChild(date);
  meta.appendChild(author);
  
  header.appendChild(category);
  header.appendChild(title);
  header.appendChild(meta);
  
  // Feature image
  const featureImage = document.createElement('img');
  featureImage.src = article.coverImage;
  featureImage.alt = article.title;
  featureImage.className = 'blog-article-feature-image';
  
  // Article container with content and sidebar
  const articleContainer = document.createElement('div');
  articleContainer.className = 'blog-article-container';
  
  // Article content
  const content = document.createElement('div');
  content.className = 'blog-article-content';
  content.innerHTML = article.content;
  
  // Apply styling to content elements
  styleArticleContent(content);
  
  // Sidebar with table of contents
  const sidebar = document.createElement('div');
  sidebar.className = 'blog-article-sidebar';
  
  // Table of contents
  const toc = createTableOfContents(content);
  sidebar.appendChild(toc);
  
  articleContainer.appendChild(content);
  articleContainer.appendChild(sidebar);
  
  // Tags
  const tags = document.createElement('div');
  tags.className = 'blog-article-tags';
  
  const tagsTitle = document.createElement('span');
  tagsTitle.textContent = 'Tags:';
  tagsTitle.className = 'blog-tags-title';
  tags.appendChild(tagsTitle);
  
  article.tags.forEach(tag => {
    const tagLink = document.createElement('a');
    tagLink.textContent = tag;
    tagLink.href = `#blog?tag=${encodeURIComponent(tag)}`;
    tagLink.className = 'blog-tag-link';
    tags.appendChild(tagLink);
  });
  
  // Related articles
  const related = createRelatedArticles(article.id);
  
  // Assemble page
  articlePage.appendChild(header);
  articlePage.appendChild(featureImage);
  articlePage.appendChild(articleContainer);
  articlePage.appendChild(tags);
  articlePage.appendChild(related);
  
  return articlePage;
  
  /**
   * Create table of contents from article content
   * @param {HTMLElement} content - Article content element
   * @returns {HTMLElement} TOC element
   */
  function createTableOfContents(content) {
    const toc = document.createElement('div');
    toc.className = 'blog-table-of-contents';
    
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'Table of Contents';
    tocTitle.className = 'blog-toc-title';
    toc.appendChild(tocTitle);
    
    const tocList = document.createElement('ul');
    tocList.className = 'blog-toc-list';
    
    // Get all headings in the content
    const headings = content.querySelectorAll('h2, h3');
    
    // If no headings, hide TOC
    if (headings.length === 0) {
      toc.style.display = 'none';
      return toc;
    }
    
    headings.forEach((heading, index) => {
      // Add ID to heading if not exists
      if (!heading.id) {
        heading.id = `section-${index}`;
      }
      
      const listItem = document.createElement('li');
      listItem.className = `blog-toc-item toc-${heading.tagName.toLowerCase()}`;
      
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.className = 'blog-toc-link';
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
      });
      
      listItem.appendChild(link);
      tocList.appendChild(listItem);
    });
    
    toc.appendChild(tocList);
    return toc;
  }
  
  /**
   * Create related articles section
   * @param {number} postId - Current post ID
   * @returns {HTMLElement} Related articles element
   */
  function createRelatedArticles(postId) {
    const related = document.createElement('div');
    related.className = 'blog-related-articles';
    
    const relatedTitle = document.createElement('h3');
    relatedTitle.textContent = 'Related Articles';
    relatedTitle.className = 'blog-related-title';
    related.appendChild(relatedTitle);
    
    const relatedGrid = document.createElement('div');
    relatedGrid.className = 'blog-related-grid';
    
    const relatedPosts = getRelatedPosts(postId, 3);
    
    relatedPosts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'blog-related-card';
      
      const image = document.createElement('img');
      image.src = post.coverImage;
      image.alt = post.title;
      image.className = 'blog-related-image';
      
      const title = document.createElement('h4');
      title.textContent = post.title;
      title.className = 'blog-related-card-title';
      
      const link = document.createElement('a');
      link.href = `#blog/${post.slug}`;
      link.className = 'blog-related-link';
      link.appendChild(image);
      link.appendChild(title);
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openArticle(post.slug);
      });
      
      card.appendChild(link);
      relatedGrid.appendChild(card);
    });
    
    related.appendChild(relatedGrid);
    return related;
  }
  
  /**
   * Style article content elements
   * @param {HTMLElement} content - Article content element
   */
  function styleArticleContent(content) {
    // Add classes to elements
    content.querySelectorAll('h2').forEach(el => {
      el.classList.add('blog-content-h2');
    });
    
    content.querySelectorAll('h3').forEach(el => {
      el.classList.add('blog-content-h3');
    });
    
    content.querySelectorAll('p').forEach(el => {
      el.classList.add('blog-content-p');
    });
    
    content.querySelectorAll('ul').forEach(el => {
      el.classList.add('blog-content-ul');
    });
    
    content.querySelectorAll('ol').forEach(el => {
      el.classList.add('blog-content-ol');
    });
    
    content.querySelectorAll('li').forEach(el => {
      el.classList.add('blog-content-li');
    });
    
    content.querySelectorAll('blockquote').forEach(el => {
      el.classList.add('blog-content-blockquote');
    });
    
    content.querySelectorAll('code').forEach(el => {
      el.classList.add('blog-content-code');
    });
    
    content.querySelectorAll('pre').forEach(el => {
      el.classList.add('blog-content-pre');
    });
    
    content.querySelectorAll('a').forEach(el => {
      el.classList.add('blog-content-a');
      
      // Open external links in new tab
      if (el.href.startsWith('http')) {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }
    });
    
    content.querySelectorAll('img').forEach(el => {
      el.classList.add('blog-content-img');
      
      // Wrap images in figure with caption if alt text exists
      if (el.alt) {
        const figure = document.createElement('figure');
        figure.className = 'blog-content-figure';
        
        const caption = document.createElement('figcaption');
        caption.textContent = el.alt;
        caption.className = 'blog-content-figcaption';
        
        // Replace img with figure
        el.parentNode.insertBefore(figure, el);
        figure.appendChild(el);
        figure.appendChild(caption);
      }
    });
    
    // Add responsive tables
    content.querySelectorAll('table').forEach(el => {
      el.classList.add('blog-content-table');
      
      // Wrap table in a container for horizontal scrolling
      const wrapper = document.createElement('div');
      wrapper.className = 'blog-table-wrapper';
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    });
  }
  
  /**
   * Open an article by slug
   * Function used by related articles and other links
   * @param {string} slug - Article slug
   */
  function openArticle(slug) {
    window.location.hash = `#blog/${slug}`;
  }
}

// Add CSS styles for the blog
const addBlogStyles = () => {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Blog styles */
    .blog-page {
      font-family: var(--font-family, sans-serif);
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .blog-title-section {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem 0;
    }
    
    .blog-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--primary-color, #4a6cf7);
    }
    
    .blog-subtitle {
      font-size: 1.2rem;
      color: var(--text-muted, #6b7280);
      margin-bottom: 1.5rem;
    }
    
    .blog-search-container {
      display: flex;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .blog-search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 4px 0 0 4px;
      font-size: 1rem;
    }
    
    .blog-search-button {
      padding: 0.75rem 1.5rem;
      background-color: var(--primary-color, #4a6cf7);
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-weight: 500;
    }
    
    .blog-search-button:hover {
      background-color: var(--primary-dark, #3451b2);
    }
    
    .blog-main-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .blog-featured-section {
      margin-bottom: 2rem;
    }
    
    .blog-section-heading {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--border-color, #e5e7eb);
    }
    
    .blog-featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .blog-featured-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
      background-color: white;
    }
    
    .blog-featured-card:hover {
      transform: translateY(-5px);
    }
    
    .blog-featured-image-container {
      height: 200px;
      overflow: hidden;
    }
    
    .blog-featured-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .blog-featured-card:hover .blog-featured-image {
      transform: scale(1.05);
    }
    
    .blog-featured-content {
      padding: 1.5rem;
    }
    
    .blog-featured-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--heading-color, #1f2937);
    }
    
    .blog-featured-excerpt {
      color: var(--text-color, #4b5563);
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .blog-featured-link {
      display: inline-block;
      color: var(--primary-color, #4a6cf7);
      font-weight: 500;
      text-decoration: none;
    }
    
    .blog-featured-link:hover {
      text-decoration: underline;
    }
    
    .blog-content-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    
    .blog-posts-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .blog-posts-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .blog-post-card {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1.5rem;
      padding: 1.5rem;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .blog-post-image-container {
      height: 100%;
      min-height: 200px;
      overflow: hidden;
      border-radius: 4px;
    }
    
    .blog-post-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .blog-post-category {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background-color: var(--primary-light, #eef2ff);
      color: var(--primary-color, #4a6cf7);
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }
    
    .blog-post-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--heading-color, #1f2937);
    }
    
    .blog-post-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      color: var(--text-muted, #6b7280);
      font-size: 0.875rem;
    }
    
    .blog-post-excerpt {
      margin-bottom: 1rem;
      line-height: 1.5;
      color: var(--text-color, #4b5563);
    }
    
    .blog-post-link {
      display: inline-block;
      color: var(--primary-color, #4a6cf7);
      font-weight: 500;
      text-decoration: none;
    }
    
    .blog-post-link:hover {
      text-decoration: underline;
    }
    
    .blog-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .blog-sidebar-section {
      padding: 1.5rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .blog-sidebar-heading {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      color: var(--heading-color, #1f2937);
    }
    
    .blog-categories-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .blog-category-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-light, #f3f4f6);
      cursor: pointer;
      transition: color 0.2s ease;
    }
    
    .blog-category-item:hover {
      color: var(--primary-color, #4a6cf7);
    }
    
    .blog-category-item.active {
      color: var(--primary-color, #4a6cf7);
      font-weight: 500;
    }
    
    .blog-tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .blog-tag-item {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background-color: var(--background-light, #f3f4f6);
      border-radius: 9999px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .blog-tag-item:hover {
      background-color: var(--primary-light, #eef2ff);
      color: var(--primary-color, #4a6cf7);
    }
    
    .blog-no-results {
      padding: 2rem;
      text-align: center;
      background-color: white;
      border-radius: 8px;
      color: var(--text-muted, #6b7280);
    }
    
    /* Article page styles */
    .blog-article-page {
      font-family: var(--font-family, sans-serif);
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .blog-back-link {
      display: inline-block;
      margin-bottom: 2rem;
      color: var(--text-color, #4b5563);
      text-decoration: none;
      font-weight: 500;
    }
    
    .blog-back-link:hover {
      color: var(--primary-color, #4a6cf7);
    }
    
    .blog-article-header {
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .blog-article-category {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background-color: var(--primary-light, #eef2ff);
      color: var(--primary-color, #4a6cf7);
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    
    .blog-article-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--heading-color, #1f2937);
      line-height: 1.2;
    }
    
    .blog-article-meta {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      color: var(--text-muted, #6b7280);
    }
    
    .blog-article-feature-image {
      width: 100%;
      max-height: 500px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    
    .blog-article-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .blog-article-content {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .blog-article-sidebar {
      position: sticky;
      top: 2rem;
      align-self: start;
    }
    
    .blog-table-of-contents {
      background-color: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .blog-toc-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    
    .blog-toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .blog-toc-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-light, #f3f4f6);
    }
    
    .blog-toc-item.toc-h3 {
      padding-left: 1rem;
    }
    
    .blog-toc-link {
      text-decoration: none;
      color: var(--text-color, #4b5563);
      transition: color 0.2s ease;
    }
    
    .blog-toc-link:hover {
      color: var(--primary-color, #4a6cf7);
    }
    
    .blog-article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    
    .blog-tags-title {
      font-weight: 500;
      color: var(--text-muted, #6b7280);
    }
    
    .blog-tag-link {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background-color: var(--background-light, #f3f4f6);
      border-radius: 9999px;
      font-size: 0.875rem;
      text-decoration: none;
      color: var(--text-color, #4b5563);
      transition: background-color 0.2s ease;
    }
    
    .blog-tag-link:hover {
      background-color: var(--primary-light, #eef2ff);
      color: var(--primary-color, #4a6cf7);
    }
    
    .blog-related-articles {
      margin-top: 3rem;
      margin-bottom: 3rem;
    }
    
    .blog-related-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--border-color, #e5e7eb);
    }
    
    .blog-related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .blog-related-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
      background-color: white;
    }
    
    .blog-related-card:hover {
      transform: translateY(-5px);
    }
    
    .blog-related-link {
      display: block;
      text-decoration: none;
    }
    
    .blog-related-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .blog-related-card-title {
      padding: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--heading-color, #1f2937);
    }
    
    /* Content styles */
    .blog-content-h2 {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: var(--heading-color, #1f2937);
    }
    
    .blog-content-h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 1.5rem 0 1rem;
      color: var(--heading-color, #1f2937);
    }
    
    .blog-content-p {
      margin-bottom: 1.5rem;
      line-height: 1.7;
      color: var(--text-color, #4b5563);
    }
    
    .blog-content-ul, .blog-content-ol {
      padding-left: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .blog-content-li {
      margin-bottom: 0.5rem;
      line-height: 1.7;
      color: var(--text-color, #4b5563);
    }
    
    .blog-content-blockquote {
      border-left: 4px solid var(--primary-color, #4a6cf7);
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
      background-color: var(--background-light, #f3f4f6);
      font-style: italic;
      color: var(--text-color, #4b5563);
    }
    
    .blog-content-code {
      font-family: monospace;
      background-color: var(--background-light, #f3f4f6);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }
    
    .blog-content-pre {
      background-color: var(--code-bg, #1e293b);
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    
    .blog-content-pre code {
      background-color: transparent;
      padding: 0;
      color: var(--code-text, #e2e8f0);
      font-family: monospace;
    }
    
    .blog-content-a {
      color: var(--primary-color, #4a6cf7);
      text-decoration: none;
    }
    
    .blog-content-a:hover {
      text-decoration: underline;
    }
    
    .blog-content-img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    .blog-content-figure {
      margin: 2rem 0;
    }
    
    .blog-content-figcaption {
      text-align: center;
      margin-top: 0.75rem;
      font-size: 0.875rem;
      color: var(--text-muted, #6b7280);
    }
    
    .blog-table-wrapper {
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    
    .blog-content-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .blog-content-table th {
      background-color: var(--background-light, #f3f4f6);
      font-weight: 600;
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid var(--border-color, #e5e7eb);
    }
    
    .blog-content-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-light, #f3f4f6);
    }
    
    .blog-content-table tr:nth-child(even) {
      background-color: var(--background-lightest, #f9fafb);
    }
    
    /* Responsive styles */
    @media (max-width: 1024px) {
      .blog-article-container {
        grid-template-columns: 1fr;
      }
      
      .blog-article-sidebar {
        position: static;
        margin-bottom: 2rem;
      }
    }
    
    @media (max-width: 768px) {
      .blog-content-container {
        grid-template-columns: 1fr;
      }
      
      .blog-sidebar {
        order: -1;
        margin-bottom: 2rem;
      }
      
      .blog-post-card {
        grid-template-columns: 1fr;
      }
      
      .blog-article-title {
        font-size: 2rem;
      }
    }
    
    @media (max-width: 480px) {
      .blog-featured-grid {
        grid-template-columns: 1fr;
      }
      
      .blog-related-grid {
        grid-template-columns: 1fr;
      }
      
      .blog-article-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `;
  document.head.appendChild(styleEl);
};

// Call the function to add styles
addBlogStyles();