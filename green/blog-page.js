/**
 * Blog Page Component for Stackr Finance
 * Displays blog posts in a responsive, interactive layout optimized for all devices
 */

import { 
  blogCategories, 
  filterPostsByCategory, 
  getFeaturedPosts, 
  getLatestPosts,
  searchPosts
} from './blog-data.js';

/**
 * Render blog page component
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {HTMLElement} Blog page element
 */
export function renderBlogPage(isAuthenticated = false) {
  // State management for the page
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSearchResults = [];

  // Create main container
  const container = document.createElement('div');
  container.className = 'blog-page-container';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  container.style.padding = '24px';
  
  // Add a simple header for non-authenticated users
  if (!isAuthenticated) {
    const header = document.createElement('header');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '16px 0';
    header.style.marginBottom = '24px';
    header.style.borderBottom = '1px solid var(--color-border, #E5E7EB)';
    
    // Logo
    const logo = document.createElement('div');
    logo.style.fontWeight = 'bold';
    logo.style.fontSize = '24px';
    logo.style.background = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent, #5D5FEF) 100%)';
    logo.style.webkitBackgroundClip = 'text';
    logo.style.webkitTextFillColor = 'transparent';
    logo.style.backgroundClip = 'text';
    logo.style.cursor = 'pointer';
    logo.textContent = 'Stackr';
    logo.addEventListener('click', () => {
      window.location.hash = 'landing';
    });
    
    // Nav links
    const navLinks = document.createElement('div');
    navLinks.style.display = 'flex';
    navLinks.style.gap = '24px';
    
    const loginLink = document.createElement('a');
    loginLink.href = '#login';
    loginLink.textContent = 'Log In';
    loginLink.style.fontWeight = '500';
    loginLink.style.textDecoration = 'none';
    loginLink.style.color = 'var(--color-text, #1F2937)';
    loginLink.style.transition = 'color 0.2s ease';
    loginLink.addEventListener('mouseenter', () => {
      loginLink.style.color = 'var(--color-primary)';
    });
    loginLink.addEventListener('mouseleave', () => {
      loginLink.style.color = 'var(--color-text, #1F2937)';
    });
    
    const registerButton = document.createElement('a');
    registerButton.href = '#register';
    registerButton.textContent = 'Sign Up';
    registerButton.style.fontWeight = '500';
    registerButton.style.textDecoration = 'none';
    registerButton.style.backgroundColor = 'var(--color-primary)';
    registerButton.style.color = 'white';
    registerButton.style.padding = '8px 16px';
    registerButton.style.borderRadius = '4px';
    registerButton.style.transition = 'background-color 0.2s ease';
    registerButton.addEventListener('mouseenter', () => {
      registerButton.style.backgroundColor = 'var(--color-primary-dark, #3182CE)';
    });
    registerButton.addEventListener('mouseleave', () => {
      registerButton.style.backgroundColor = 'var(--color-primary)';
    });
    
    navLinks.appendChild(loginLink);
    navLinks.appendChild(registerButton);
    
    header.appendChild(logo);
    header.appendChild(navLinks);
    
    container.appendChild(header);
  }
  
  // Page title section with search
  const titleSection = createTitleSection();
  container.appendChild(titleSection);
  
  // Featured posts section
  const featuredSection = createFeaturedSection();
  container.appendChild(featuredSection);
  
  // Main content area with sidebar and post listing
  const contentArea = document.createElement('div');
  contentArea.className = 'blog-content-area';
  contentArea.style.display = 'flex';
  contentArea.style.flexDirection = 'column-reverse';
  contentArea.style.gap = '24px';
  contentArea.style.marginTop = '40px';
  
  // For tablet and desktop, use row layout
  const mediaQuery = window.matchMedia('(min-width: 768px)');
  if (mediaQuery.matches) {
    contentArea.style.flexDirection = 'row';
  }
  
  // Create sidebar with categories
  const sidebar = createSidebar();
  
  // Create post listing area
  const postsArea = document.createElement('div');
  postsArea.className = 'blog-posts-area';
  postsArea.style.flex = '1';
  
  // Initial posts display
  renderPostsList(postsArea, filterPostsByCategory(currentCategory));
  
  // Add the sidebar and posts area to the content area
  contentArea.appendChild(postsArea);
  contentArea.appendChild(sidebar);
  container.appendChild(contentArea);
  
  // Add responsive handling for window resizing
  window.addEventListener('resize', () => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    contentArea.style.flexDirection = mediaQuery.matches ? 'row' : 'column-reverse';
  });
  
  /**
   * Create the title section with search functionality
   * @returns {HTMLElement} Title section element
   */
  function createTitleSection() {
    const section = document.createElement('div');
    section.className = 'blog-title-section';
    section.style.marginBottom = '32px';
    
    // Page heading
    const heading = document.createElement('h1');
    heading.textContent = 'Stackr Finance Blog';
    heading.style.fontSize = '2.5rem';
    heading.style.fontWeight = 'bold';
    heading.style.marginBottom = '16px';
    heading.style.background = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent, #5D5FEF) 100%)';
    heading.style.webkitBackgroundClip = 'text';
    heading.style.webkitTextFillColor = 'transparent';
    heading.style.backgroundClip = 'text';
    heading.style.textFillColor = 'transparent';
    
    // Description
    const description = document.createElement('p');
    description.textContent = 'Expert insights to help you build financial freedom through the 40/30/30 approach.';
    description.style.fontSize = '1.1rem';
    description.style.color = 'var(--color-text-secondary, #6B7280)';
    description.style.marginBottom = '24px';
    description.style.maxWidth = '800px';
    
    // Search bar
    const searchContainer = document.createElement('div');
    searchContainer.style.position = 'relative';
    searchContainer.style.maxWidth = '500px';
    
    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    searchIcon.style.position = 'absolute';
    searchIcon.style.top = '50%';
    searchIcon.style.left = '12px';
    searchIcon.style.transform = 'translateY(-50%)';
    searchIcon.style.color = 'var(--color-text-secondary, #6B7280)';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search articles...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '12px 12px 12px 40px';
    searchInput.style.fontSize = '1rem';
    searchInput.style.border = '1px solid var(--color-border, #E5E7EB)';
    searchInput.style.borderRadius = '8px';
    searchInput.style.backgroundColor = 'var(--color-background-secondary, #F9FAFB)';
    
    // Add search functionality
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      
      if (searchQuery.length === 0) {
        // If search is cleared, show category posts
        renderPostsList(postsArea, filterPostsByCategory(currentCategory));
        // Remove "search results" label if it exists
        const searchLabel = document.querySelector('.search-results-label');
        if (searchLabel) searchLabel.remove();
      } else if (searchQuery.length >= 2) {
        // Search with at least 2 characters
        currentSearchResults = searchPosts(searchQuery);
        renderPostsList(postsArea, currentSearchResults);
        
        // Show search results count
        let searchLabel = document.querySelector('.search-results-label');
        if (!searchLabel) {
          searchLabel = document.createElement('div');
          searchLabel.className = 'search-results-label';
          searchLabel.style.marginTop = '16px';
          searchLabel.style.fontSize = '0.9rem';
          searchLabel.style.color = 'var(--color-text-secondary, #6B7280)';
          searchContainer.appendChild(searchLabel);
        }
        
        if (currentSearchResults.length === 0) {
          searchLabel.textContent = `No results found for "${searchQuery}"`;
        } else {
          searchLabel.textContent = `Found ${currentSearchResults.length} result${currentSearchResults.length === 1 ? '' : 's'} for "${searchQuery}"`;
        }
      }
    });
    
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    
    section.appendChild(heading);
    section.appendChild(description);
    section.appendChild(searchContainer);
    
    return section;
  }
  
  /**
   * Create the featured posts section
   * @returns {HTMLElement} Featured section element
   */
  function createFeaturedSection() {
    const featuredPosts = getFeaturedPosts(3);
    
    const section = document.createElement('div');
    section.className = 'featured-posts-section';
    section.style.marginTop = '32px';
    
    // Section title
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = 'Featured Articles';
    sectionTitle.style.fontSize = '1.5rem';
    sectionTitle.style.fontWeight = 'bold';
    sectionTitle.style.marginBottom = '24px';
    sectionTitle.style.position = 'relative';
    sectionTitle.style.paddingLeft = '12px';
    
    // Add highlight accent to section title
    const titleAccent = document.createElement('div');
    titleAccent.style.position = 'absolute';
    titleAccent.style.left = '0';
    titleAccent.style.top = '0';
    titleAccent.style.bottom = '0';
    titleAccent.style.width = '4px';
    titleAccent.style.backgroundColor = 'var(--color-primary)';
    titleAccent.style.borderRadius = '4px';
    sectionTitle.appendChild(titleAccent);
    
    section.appendChild(sectionTitle);
    
    // Container for featured posts
    const featuredContainer = document.createElement('div');
    featuredContainer.className = 'featured-posts-container';
    featuredContainer.style.display = 'grid';
    featuredContainer.style.gap = '24px';
    featuredContainer.style.marginBottom = '40px';
    
    // Responsive grid
    const mediaQueryMobile = window.matchMedia('(max-width: 640px)');
    const mediaQueryTablet = window.matchMedia('(min-width: 641px) and (max-width: 1023px)');
    
    if (mediaQueryMobile.matches) {
      // Single column for mobile
      featuredContainer.style.gridTemplateColumns = '1fr';
    } else if (mediaQueryTablet.matches) {
      // Two columns for tablet
      featuredContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
      // Three columns for desktop
      featuredContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    }
    
    // Create and add featured post cards
    featuredPosts.forEach(post => {
      const card = createFeaturedPostCard(post);
      featuredContainer.appendChild(card);
    });
    
    section.appendChild(featuredContainer);
    
    // Add responsive grid adjustment on window resize
    window.addEventListener('resize', () => {
      const mediaQueryMobile = window.matchMedia('(max-width: 640px)');
      const mediaQueryTablet = window.matchMedia('(min-width: 641px) and (max-width: 1023px)');
      
      if (mediaQueryMobile.matches) {
        featuredContainer.style.gridTemplateColumns = '1fr';
      } else if (mediaQueryTablet.matches) {
        featuredContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
      } else {
        featuredContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
      }
    });
    
    return section;
  }
  
  /**
   * Create a featured post card
   * @param {Object} post - Post data
   * @returns {HTMLElement} Post card element
   */
  function createFeaturedPostCard(post) {
    const card = document.createElement('div');
    card.className = 'featured-post-card';
    card.style.borderRadius = '12px';
    card.style.overflow = 'hidden';
    card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)';
    card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    card.style.backgroundColor = 'var(--color-background, #FFFFFF)';
    card.style.height = '100%';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)';
    });
    
    // Add click event
    card.addEventListener('click', () => {
      openArticle(post.slug);
    });
    
    // Card image
    const imageContainer = document.createElement('div');
    imageContainer.style.height = '180px';
    imageContainer.style.overflow = 'hidden';
    
    const image = document.createElement('img');
    image.src = post.image;
    image.alt = post.title;
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.style.transition = 'transform 0.3s ease';
    
    // Image hover zoom effect
    imageContainer.addEventListener('mouseenter', () => {
      image.style.transform = 'scale(1.05)';
    });
    
    imageContainer.addEventListener('mouseleave', () => {
      image.style.transform = 'scale(1)';
    });
    
    imageContainer.appendChild(image);
    
    // Card content
    const content = document.createElement('div');
    content.style.padding = '16px';
    content.style.flex = '1';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    
    // Find the matching category object
    const category = blogCategories.find(cat => cat.id === post.category) || blogCategories[0];
    
    // Category label
    const categoryLabel = document.createElement('span');
    categoryLabel.textContent = category.name;
    categoryLabel.style.display = 'inline-block';
    categoryLabel.style.fontSize = '0.75rem';
    categoryLabel.style.fontWeight = 'bold';
    categoryLabel.style.padding = '4px 8px';
    categoryLabel.style.borderRadius = '4px';
    categoryLabel.style.marginBottom = '12px';
    categoryLabel.style.backgroundColor = `${category.color}15`; // 15% opacity
    categoryLabel.style.color = category.color;
    
    // Post title
    const title = document.createElement('h3');
    title.textContent = post.title;
    title.style.fontSize = '1.25rem';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.lineHeight = '1.4';
    
    // Post excerpt
    const excerpt = document.createElement('p');
    excerpt.textContent = post.excerpt;
    excerpt.style.fontSize = '0.9rem';
    excerpt.style.color = 'var(--color-text-secondary, #6B7280)';
    excerpt.style.marginBottom = '16px';
    excerpt.style.flex = '1';
    excerpt.style.lineHeight = '1.6';
    
    // Post metadata
    const meta = document.createElement('div');
    meta.style.display = 'flex';
    meta.style.alignItems = 'center';
    meta.style.fontSize = '0.8rem';
    meta.style.color = 'var(--color-text-muted, #9CA3AF)';
    meta.style.marginTop = 'auto';
    
    // Author image
    const authorImg = document.createElement('img');
    authorImg.src = post.avatar;
    authorImg.alt = post.author;
    authorImg.style.width = '24px';
    authorImg.style.height = '24px';
    authorImg.style.borderRadius = '50%';
    authorImg.style.marginRight = '8px';
    authorImg.style.objectFit = 'cover';
    
    // Post info
    const postInfo = document.createElement('div');
    postInfo.style.display = 'flex';
    postInfo.style.flexDirection = 'column';
    
    const authorName = document.createElement('span');
    authorName.textContent = post.author;
    authorName.style.fontWeight = '500';
    
    const postDate = document.createElement('span');
    postDate.textContent = `${post.date} · ${post.readTime}`;
    
    postInfo.appendChild(authorName);
    postInfo.appendChild(postDate);
    
    meta.appendChild(authorImg);
    meta.appendChild(postInfo);
    
    // Assemble card content
    content.appendChild(categoryLabel);
    content.appendChild(title);
    content.appendChild(excerpt);
    content.appendChild(meta);
    
    // Assemble card
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
    sidebar.style.width = '100%';
    sidebar.style.maxWidth = '300px';
    
    // Categories section
    const categoriesSection = document.createElement('div');
    categoriesSection.className = 'categories-section';
    categoriesSection.style.marginBottom = '32px';
    
    // Categories title
    const categoriesTitle = document.createElement('h3');
    categoriesTitle.textContent = 'Categories';
    categoriesTitle.style.fontSize = '1.2rem';
    categoriesTitle.style.fontWeight = 'bold';
    categoriesTitle.style.marginBottom = '16px';
    
    categoriesSection.appendChild(categoriesTitle);
    
    // Categories list
    const categoriesList = document.createElement('ul');
    categoriesList.style.listStyleType = 'none';
    categoriesList.style.padding = '0';
    categoriesList.style.margin = '0';
    
    // Add category items
    blogCategories.forEach(category => {
      const categoryItem = document.createElement('li');
      categoryItem.style.marginBottom = '8px';
      
      const categoryLink = document.createElement('a');
      categoryLink.href = '#';
      categoryLink.dataset.category = category.id;
      categoryLink.style.display = 'flex';
      categoryLink.style.alignItems = 'center';
      categoryLink.style.padding = '8px 12px';
      categoryLink.style.borderRadius = '6px';
      categoryLink.style.textDecoration = 'none';
      categoryLink.style.color = 'var(--color-text, #1F2937)';
      categoryLink.style.transition = 'background-color 0.2s ease';
      
      // Set active style for current category
      if (category.id === currentCategory) {
        categoryLink.style.backgroundColor = 'var(--color-primary-light, rgba(66, 153, 225, 0.1))';
        categoryLink.style.color = 'var(--color-primary, #4299E1)';
        categoryLink.style.fontWeight = 'bold';
      }
      
      // Add icon if available
      if (category.icon) {
        const icon = document.createElement('span');
        icon.innerHTML = category.icon;
        icon.style.marginRight = '12px';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.color = category.id !== 'all' ? category.color : 'var(--color-primary)';
        categoryLink.appendChild(icon);
      }
      
      // Add category name
      const name = document.createElement('span');
      name.textContent = category.name;
      categoryLink.appendChild(name);
      
      // Add click event
      categoryLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active category
        currentCategory = category.id;
        searchQuery = '';
        
        // Clear search input
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.value = '';
        
        // Remove search results label if it exists
        const searchLabel = document.querySelector('.search-results-label');
        if (searchLabel) searchLabel.remove();
        
        // Update active styles
        document.querySelectorAll('.blog-sidebar a').forEach(link => {
          link.style.backgroundColor = 'transparent';
          link.style.color = 'var(--color-text, #1F2937)';
          link.style.fontWeight = 'normal';
        });
        
        categoryLink.style.backgroundColor = 'var(--color-primary-light, rgba(66, 153, 225, 0.1))';
        categoryLink.style.color = 'var(--color-primary, #4299E1)';
        categoryLink.style.fontWeight = 'bold';
        
        // Update posts list
        renderPostsList(postsArea, filterPostsByCategory(currentCategory));
      });
      
      categoryItem.appendChild(categoryLink);
      categoriesList.appendChild(categoryItem);
    });
    
    categoriesSection.appendChild(categoriesList);
    sidebar.appendChild(categoriesSection);
    
    // Latest posts section
    const latestSection = document.createElement('div');
    latestSection.className = 'latest-posts-section';
    
    // Latest posts title
    const latestTitle = document.createElement('h3');
    latestTitle.textContent = 'Latest Articles';
    latestTitle.style.fontSize = '1.2rem';
    latestTitle.style.fontWeight = 'bold';
    latestTitle.style.marginBottom = '16px';
    
    latestSection.appendChild(latestTitle);
    
    // Latest posts list
    const latestPosts = getLatestPosts(5);
    const latestList = document.createElement('div');
    latestList.style.display = 'flex';
    latestList.style.flexDirection = 'column';
    latestList.style.gap = '16px';
    
    latestPosts.forEach(post => {
      const postItem = document.createElement('div');
      postItem.style.display = 'flex';
      postItem.style.gap = '12px';
      postItem.style.cursor = 'pointer';
      
      // Add click event
      postItem.addEventListener('click', () => {
        openArticle(post.slug);
      });
      
      // Post thumbnail
      const thumbnail = document.createElement('img');
      thumbnail.src = post.image;
      thumbnail.alt = post.title;
      thumbnail.style.width = '60px';
      thumbnail.style.height = '60px';
      thumbnail.style.borderRadius = '6px';
      thumbnail.style.objectFit = 'cover';
      
      // Post info
      const postInfo = document.createElement('div');
      postInfo.style.flex = '1';
      
      const postTitle = document.createElement('h4');
      postTitle.textContent = post.title;
      postTitle.style.fontSize = '0.9rem';
      postTitle.style.fontWeight = '600';
      postTitle.style.margin = '0 0 4px 0';
      postTitle.style.display = '-webkit-box';
      postTitle.style.webkitLineClamp = '2';
      postTitle.style.webkitBoxOrient = 'vertical';
      postTitle.style.overflow = 'hidden';
      
      const postMeta = document.createElement('span');
      postMeta.textContent = post.date;
      postMeta.style.fontSize = '0.75rem';
      postMeta.style.color = 'var(--color-text-muted, #9CA3AF)';
      
      postInfo.appendChild(postTitle);
      postInfo.appendChild(postMeta);
      
      postItem.appendChild(thumbnail);
      postItem.appendChild(postInfo);
      
      latestList.appendChild(postItem);
    });
    
    latestSection.appendChild(latestList);
    sidebar.appendChild(latestSection);
    
    // Newsletter signup section
    const newsletterSection = document.createElement('div');
    newsletterSection.className = 'newsletter-section';
    newsletterSection.style.marginTop = '32px';
    newsletterSection.style.padding = '24px';
    newsletterSection.style.borderRadius = '12px';
    newsletterSection.style.backgroundColor = 'var(--color-primary-light, rgba(66, 153, 225, 0.1))';
    
    const newsletterTitle = document.createElement('h3');
    newsletterTitle.textContent = 'Subscribe to Our Newsletter';
    newsletterTitle.style.fontSize = '1.1rem';
    newsletterTitle.style.fontWeight = 'bold';
    newsletterTitle.style.marginBottom = '12px';
    
    const newsletterDesc = document.createElement('p');
    newsletterDesc.textContent = 'Get the latest financial insights delivered straight to your inbox.';
    newsletterDesc.style.fontSize = '0.9rem';
    newsletterDesc.style.marginBottom = '16px';
    newsletterDesc.style.color = 'var(--color-text-secondary, #6B7280)';
    
    const newsletterForm = document.createElement('form');
    newsletterForm.style.display = 'flex';
    newsletterForm.style.flexDirection = 'column';
    newsletterForm.style.gap = '12px';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Your email address';
    emailInput.required = true;
    emailInput.style.padding = '10px 12px';
    emailInput.style.border = '1px solid var(--color-border, #E5E7EB)';
    emailInput.style.borderRadius = '6px';
    emailInput.style.fontSize = '0.9rem';
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Subscribe';
    submitBtn.style.padding = '10px 16px';
    submitBtn.style.backgroundColor = 'var(--color-primary, #4299E1)';
    submitBtn.style.color = 'white';
    submitBtn.style.border = 'none';
    submitBtn.style.borderRadius = '6px';
    submitBtn.style.fontSize = '0.9rem';
    submitBtn.style.fontWeight = 'bold';
    submitBtn.style.cursor = 'pointer';
    submitBtn.style.transition = 'background-color 0.2s ease';
    
    // Button hover effect
    submitBtn.addEventListener('mouseenter', () => {
      submitBtn.style.backgroundColor = 'var(--color-primary-dark, #3182CE)';
    });
    
    submitBtn.addEventListener('mouseleave', () => {
      submitBtn.style.backgroundColor = 'var(--color-primary, #4299E1)';
    });
    
    // Form submission
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simple validation
      if (emailInput.validity.valid) {
        // Show success message
        newsletterForm.style.display = 'none';
        
        const successMsg = document.createElement('div');
        successMsg.style.textAlign = 'center';
        successMsg.style.padding = '16px 0';
        
        const checkIcon = document.createElement('div');
        checkIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        checkIcon.style.color = 'var(--color-success, #10B981)';
        checkIcon.style.marginBottom = '8px';
        checkIcon.style.display = 'flex';
        checkIcon.style.justifyContent = 'center';
        
        const successText = document.createElement('p');
        successText.textContent = 'Thanks for subscribing!';
        successText.style.fontSize = '0.9rem';
        successText.style.fontWeight = 'bold';
        
        successMsg.appendChild(checkIcon);
        successMsg.appendChild(successText);
        
        newsletterSection.appendChild(successMsg);
      }
    });
    
    newsletterForm.appendChild(emailInput);
    newsletterForm.appendChild(submitBtn);
    
    newsletterSection.appendChild(newsletterTitle);
    newsletterSection.appendChild(newsletterDesc);
    newsletterSection.appendChild(newsletterForm);
    
    sidebar.appendChild(newsletterSection);
    
    return sidebar;
  }
  
  /**
   * Render posts list in the specified container
   * @param {HTMLElement} container - Container element
   * @param {Array} posts - Posts to render
   */
  function renderPostsList(container, posts) {
    // Clear the container
    container.innerHTML = '';
    
    // Create posts list wrapper
    const postsListWrapper = document.createElement('div');
    postsListWrapper.style.display = 'grid';
    postsListWrapper.style.gap = '32px';
    
    // Responsive grid
    const mediaQueryMobile = window.matchMedia('(max-width: 640px)');
    const mediaQueryTablet = window.matchMedia('(min-width: 641px) and (max-width: 1023px)');
    
    if (mediaQueryMobile.matches) {
      // Single column for mobile
      postsListWrapper.style.gridTemplateColumns = '1fr';
    } else if (mediaQueryTablet.matches) {
      // Two columns for tablet
      postsListWrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
      // Two columns for desktop
      postsListWrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }
    
    // Check if posts exist
    if (posts.length === 0) {
      const noResults = document.createElement('div');
      noResults.style.gridColumn = '1 / -1';
      noResults.style.textAlign = 'center';
      noResults.style.padding = '64px 0';
      
      const noResultsIcon = document.createElement('div');
      noResultsIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
      noResultsIcon.style.color = 'var(--color-text-muted, #9CA3AF)';
      noResultsIcon.style.marginBottom = '16px';
      noResultsIcon.style.display = 'flex';
      noResultsIcon.style.justifyContent = 'center';
      
      const noResultsText = document.createElement('h3');
      noResultsText.textContent = searchQuery ? 'No articles match your search' : 'No articles in this category yet';
      noResultsText.style.fontSize = '1.2rem';
      noResultsText.style.fontWeight = 'bold';
      noResultsText.style.color = 'var(--color-text-secondary, #6B7280)';
      noResultsText.style.marginBottom = '8px';
      
      const noResultsSubtext = document.createElement('p');
      noResultsSubtext.textContent = searchQuery ? 'Try different keywords or browse by category' : 'Check back soon for new content';
      noResultsSubtext.style.fontSize = '0.9rem';
      noResultsSubtext.style.color = 'var(--color-text-muted, #9CA3AF)';
      
      noResults.appendChild(noResultsIcon);
      noResults.appendChild(noResultsText);
      noResults.appendChild(noResultsSubtext);
      
      postsListWrapper.appendChild(noResults);
    } else {
      // Create and add post cards
      posts.forEach(post => {
        const card = createPostCard(post);
        postsListWrapper.appendChild(card);
      });
    }
    
    container.appendChild(postsListWrapper);
    
    // Add responsive grid adjustment on window resize
    window.addEventListener('resize', () => {
      const mediaQueryMobile = window.matchMedia('(max-width: 640px)');
      const mediaQueryTablet = window.matchMedia('(min-width: 641px) and (max-width: 1023px)');
      
      if (mediaQueryMobile.matches) {
        postsListWrapper.style.gridTemplateColumns = '1fr';
      } else if (mediaQueryTablet.matches) {
        postsListWrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
      } else {
        postsListWrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
      }
    });
  }
  
  /**
   * Create a post card
   * @param {Object} post - Post data
   * @returns {HTMLElement} Post card element
   */
  function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.borderRadius = '12px';
    card.style.overflow = 'hidden';
    card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)';
    card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    card.style.backgroundColor = 'var(--color-background, #FFFFFF)';
    card.style.height = '100%';
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)';
    });
    
    // Add click event
    card.addEventListener('click', () => {
      openArticle(post.slug);
    });
    
    // Card image
    const imageContainer = document.createElement('div');
    imageContainer.style.height = '200px';
    imageContainer.style.overflow = 'hidden';
    
    const image = document.createElement('img');
    image.src = post.image;
    image.alt = post.title;
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.style.transition = 'transform 0.3s ease';
    
    // Image hover zoom effect
    imageContainer.addEventListener('mouseenter', () => {
      image.style.transform = 'scale(1.05)';
    });
    
    imageContainer.addEventListener('mouseleave', () => {
      image.style.transform = 'scale(1)';
    });
    
    imageContainer.appendChild(image);
    
    // Card content
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.flex = '1';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    
    // Find the matching category object
    const category = blogCategories.find(cat => cat.id === post.category) || blogCategories[0];
    
    // Category and date row
    const metaRow = document.createElement('div');
    metaRow.style.display = 'flex';
    metaRow.style.justifyContent = 'space-between';
    metaRow.style.alignItems = 'center';
    metaRow.style.marginBottom = '12px';
    
    // Category label
    const categoryLabel = document.createElement('span');
    categoryLabel.textContent = category.name;
    categoryLabel.style.display = 'inline-block';
    categoryLabel.style.fontSize = '0.75rem';
    categoryLabel.style.fontWeight = 'bold';
    categoryLabel.style.padding = '4px 8px';
    categoryLabel.style.borderRadius = '4px';
    categoryLabel.style.backgroundColor = `${category.color}15`; // 15% opacity
    categoryLabel.style.color = category.color;
    
    // Date label
    const dateLabel = document.createElement('span');
    dateLabel.textContent = post.date;
    dateLabel.style.fontSize = '0.8rem';
    dateLabel.style.color = 'var(--color-text-muted, #9CA3AF)';
    
    metaRow.appendChild(categoryLabel);
    metaRow.appendChild(dateLabel);
    
    // Post title
    const title = document.createElement('h3');
    title.textContent = post.title;
    title.style.fontSize = '1.25rem';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '12px';
    title.style.lineHeight = '1.4';
    
    // Post excerpt
    const excerpt = document.createElement('p');
    excerpt.textContent = post.excerpt;
    excerpt.style.fontSize = '0.9rem';
    excerpt.style.color = 'var(--color-text-secondary, #6B7280)';
    excerpt.style.marginBottom = '16px';
    excerpt.style.flex = '1';
    excerpt.style.lineHeight = '1.6';
    
    // Author row
    const authorRow = document.createElement('div');
    authorRow.style.display = 'flex';
    authorRow.style.alignItems = 'center';
    authorRow.style.marginTop = 'auto';
    
    // Author image
    const authorImg = document.createElement('img');
    authorImg.src = post.avatar;
    authorImg.alt = post.author;
    authorImg.style.width = '32px';
    authorImg.style.height = '32px';
    authorImg.style.borderRadius = '50%';
    authorImg.style.marginRight = '12px';
    authorImg.style.objectFit = 'cover';
    
    // Author info
    const authorInfo = document.createElement('div');
    
    const authorName = document.createElement('div');
    authorName.textContent = post.author;
    authorName.style.fontSize = '0.85rem';
    authorName.style.fontWeight = '600';
    
    const authorRole = document.createElement('div');
    authorRole.textContent = post.authorRole;
    authorRole.style.fontSize = '0.75rem';
    authorRole.style.color = 'var(--color-text-muted, #9CA3AF)';
    
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(authorRole);
    
    // Read time
    const readTime = document.createElement('span');
    readTime.textContent = post.readTime;
    readTime.style.fontSize = '0.75rem';
    readTime.style.color = 'var(--color-text-muted, #9CA3AF)';
    readTime.style.marginLeft = 'auto';
    
    authorRow.appendChild(authorImg);
    authorRow.appendChild(authorInfo);
    authorRow.appendChild(readTime);
    
    // Assemble card content
    content.appendChild(metaRow);
    content.appendChild(title);
    content.appendChild(excerpt);
    content.appendChild(authorRow);
    
    // Assemble card
    card.appendChild(imageContainer);
    card.appendChild(content);
    
    return card;
  }
  
  /**
   * Open an article by slug
   * @param {string} slug - Article slug
   */
  function openArticle(slug) {
    // Create URL with slug
    window.location.hash = `blog/${slug}`;
  }
  
  return container;
}

/**
 * Render individual blog article page
 * @param {string} slug - Article slug
 * @returns {HTMLElement} Article page element
 */
export function renderArticlePage(slug, isAuthenticated = false) {
  // Import blog data functions
  const { getPostBySlug, getRelatedPosts, blogCategories } = window.blogData;
  
  // Get post data
  const post = getPostBySlug(slug);
  if (!post) {
    // Post not found, return error element
    const errorContainer = document.createElement('div');
    errorContainer.style.maxWidth = '800px';
    errorContainer.style.margin = '40px auto';
    errorContainer.style.padding = '24px';
    errorContainer.style.textAlign = 'center';
    
    const errorIcon = document.createElement('div');
    errorIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    errorIcon.style.color = 'var(--color-error, #EF4444)';
    errorIcon.style.marginBottom = '24px';
    errorIcon.style.display = 'flex';
    errorIcon.style.justifyContent = 'center';
    
    const errorTitle = document.createElement('h2');
    errorTitle.textContent = 'Article Not Found';
    errorTitle.style.fontSize = '1.8rem';
    errorTitle.style.fontWeight = 'bold';
    errorTitle.style.marginBottom = '16px';
    
    const errorMessage = document.createElement('p');
    errorMessage.textContent = "We couldn't find the article you're looking for. It may have been moved or deleted.";
    errorMessage.style.fontSize = '1.1rem';
    errorMessage.style.color = 'var(--color-text-secondary, #6B7280)';
    errorMessage.style.marginBottom = '24px';
    
    const backButton = document.createElement('a');
    backButton.href = '#blog';
    backButton.textContent = 'Back to Blog';
    backButton.style.display = 'inline-block';
    backButton.style.padding = '12px 24px';
    backButton.style.backgroundColor = 'var(--color-primary, #4299E1)';
    backButton.style.color = 'white';
    backButton.style.borderRadius = '6px';
    backButton.style.fontWeight = 'bold';
    backButton.style.textDecoration = 'none';
    
    errorContainer.appendChild(errorIcon);
    errorContainer.appendChild(errorTitle);
    errorContainer.appendChild(errorMessage);
    errorContainer.appendChild(backButton);
    
    return errorContainer;
  }
  
  // Main container
  const container = document.createElement('div');
  container.className = 'article-container';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  container.style.padding = '24px';
  
  // Add a simple header for non-authenticated users
  if (!isAuthenticated) {
    const header = document.createElement('header');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '16px 0';
    header.style.marginBottom = '24px';
    header.style.borderBottom = '1px solid var(--color-border, #E5E7EB)';
    
    // Logo
    const logo = document.createElement('div');
    logo.style.fontWeight = 'bold';
    logo.style.fontSize = '24px';
    logo.style.background = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent, #5D5FEF) 100%)';
    logo.style.webkitBackgroundClip = 'text';
    logo.style.webkitTextFillColor = 'transparent';
    logo.style.backgroundClip = 'text';
    logo.style.cursor = 'pointer';
    logo.textContent = 'Stackr';
    logo.addEventListener('click', () => {
      window.location.hash = 'landing';
    });
    
    // Nav links
    const navLinks = document.createElement('div');
    navLinks.style.display = 'flex';
    navLinks.style.gap = '24px';
    
    const loginLink = document.createElement('a');
    loginLink.href = '#login';
    loginLink.textContent = 'Log In';
    loginLink.style.fontWeight = '500';
    loginLink.style.textDecoration = 'none';
    loginLink.style.color = 'var(--color-text, #1F2937)';
    loginLink.style.transition = 'color 0.2s ease';
    loginLink.addEventListener('mouseenter', () => {
      loginLink.style.color = 'var(--color-primary)';
    });
    loginLink.addEventListener('mouseleave', () => {
      loginLink.style.color = 'var(--color-text, #1F2937)';
    });
    
    const registerButton = document.createElement('a');
    registerButton.href = '#register';
    registerButton.textContent = 'Sign Up';
    registerButton.style.fontWeight = '500';
    registerButton.style.textDecoration = 'none';
    registerButton.style.backgroundColor = 'var(--color-primary)';
    registerButton.style.color = 'white';
    registerButton.style.padding = '8px 16px';
    registerButton.style.borderRadius = '4px';
    registerButton.style.transition = 'background-color 0.2s ease';
    registerButton.addEventListener('mouseenter', () => {
      registerButton.style.backgroundColor = 'var(--color-primary-dark, #3182CE)';
    });
    registerButton.addEventListener('mouseleave', () => {
      registerButton.style.backgroundColor = 'var(--color-primary)';
    });
    
    navLinks.appendChild(loginLink);
    navLinks.appendChild(registerButton);
    
    header.appendChild(logo);
    header.appendChild(navLinks);
    
    container.appendChild(header);
  }
  
  // Back button
  const backLink = document.createElement('a');
  backLink.href = '#blog';
  backLink.style.display = 'inline-flex';
  backLink.style.alignItems = 'center';
  backLink.style.color = 'var(--color-text-secondary, #6B7280)';
  backLink.style.fontSize = '0.9rem';
  backLink.style.marginBottom = '24px';
  backLink.style.textDecoration = 'none';
  
  const backIcon = document.createElement('span');
  backIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
  backIcon.style.marginRight = '8px';
  
  const backText = document.createElement('span');
  backText.textContent = 'Back to Blog';
  
  backLink.appendChild(backIcon);
  backLink.appendChild(backText);
  container.appendChild(backLink);
  
  // Article content section
  const articleSection = document.createElement('div');
  articleSection.style.display = 'flex';
  articleSection.style.flexDirection = 'column-reverse';
  articleSection.style.gap = '32px';
  
  // For tablet and desktop, use row layout
  const mediaQuery = window.matchMedia('(min-width: 1024px)');
  if (mediaQuery.matches) {
    articleSection.style.flexDirection = 'row';
  }
  
  // Main content area
  const mainContent = document.createElement('div');
  mainContent.style.flex = '1';
  mainContent.style.maxWidth = '100%';
  
  if (mediaQuery.matches) {
    mainContent.style.maxWidth = 'calc(100% - 300px - 32px)';
  }
  
  // Article header
  const articleHeader = document.createElement('header');
  articleHeader.style.marginBottom = '32px';
  
  // Find the matching category object
  const category = blogCategories.find(cat => cat.id === post.category) || blogCategories[0];
  
  // Category label
  const categoryLabel = document.createElement('a');
  categoryLabel.href = `#blog?category=${post.category}`;
  categoryLabel.textContent = category.name;
  categoryLabel.style.display = 'inline-block';
  categoryLabel.style.fontSize = '0.85rem';
  categoryLabel.style.fontWeight = 'bold';
  categoryLabel.style.padding = '4px 12px';
  categoryLabel.style.borderRadius = '16px';
  categoryLabel.style.marginBottom = '16px';
  categoryLabel.style.backgroundColor = `${category.color}15`; // 15% opacity
  categoryLabel.style.color = category.color;
  categoryLabel.style.textDecoration = 'none';
  
  // Article title
  const title = document.createElement('h1');
  title.textContent = post.title;
  title.style.fontSize = '2.5rem';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '16px';
  title.style.lineHeight = '1.3';
  
  // Responsive title size
  const titleMediaQuery = window.matchMedia('(max-width: 640px)');
  if (titleMediaQuery.matches) {
    title.style.fontSize = '1.8rem';
  }
  
  // Article excerpt
  const excerpt = document.createElement('p');
  excerpt.textContent = post.excerpt;
  excerpt.style.fontSize = '1.2rem';
  excerpt.style.color = 'var(--color-text-secondary, #6B7280)';
  excerpt.style.marginBottom = '24px';
  excerpt.style.lineHeight = '1.6';
  
  // Author and metadata row
  const metaRow = document.createElement('div');
  metaRow.style.display = 'flex';
  metaRow.style.alignItems = 'center';
  metaRow.style.gap = '16px';
  metaRow.style.marginBottom = '32px';
  
  // Author section
  const authorSection = document.createElement('div');
  authorSection.style.display = 'flex';
  authorSection.style.alignItems = 'center';
  
  const authorImg = document.createElement('img');
  authorImg.src = post.avatar;
  authorImg.alt = post.author;
  authorImg.style.width = '48px';
  authorImg.style.height = '48px';
  authorImg.style.borderRadius = '50%';
  authorImg.style.marginRight = '12px';
  authorImg.style.objectFit = 'cover';
  
  const authorInfo = document.createElement('div');
  
  const authorName = document.createElement('div');
  authorName.textContent = post.author;
  authorName.style.fontSize = '1rem';
  authorName.style.fontWeight = '600';
  
  const authorRole = document.createElement('div');
  authorRole.textContent = post.authorRole;
  authorRole.style.fontSize = '0.85rem';
  authorRole.style.color = 'var(--color-text-muted, #9CA3AF)';
  
  authorInfo.appendChild(authorName);
  authorInfo.appendChild(authorRole);
  
  authorSection.appendChild(authorImg);
  authorSection.appendChild(authorInfo);
  
  // Metadata section
  const metadataSection = document.createElement('div');
  metadataSection.style.display = 'flex';
  metadataSection.style.alignItems = 'center';
  metadataSection.style.gap = '24px';
  
  // Date info
  const dateInfo = document.createElement('div');
  dateInfo.style.display = 'flex';
  dateInfo.style.alignItems = 'center';
  dateInfo.style.color = 'var(--color-text-secondary, #6B7280)';
  dateInfo.style.fontSize = '0.9rem';
  
  const dateIcon = document.createElement('span');
  dateIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
  dateIcon.style.marginRight = '6px';
  
  const dateText = document.createElement('span');
  dateText.textContent = post.date;
  
  dateInfo.appendChild(dateIcon);
  dateInfo.appendChild(dateText);
  
  // Read time info
  const readTimeInfo = document.createElement('div');
  readTimeInfo.style.display = 'flex';
  readTimeInfo.style.alignItems = 'center';
  readTimeInfo.style.color = 'var(--color-text-secondary, #6B7280)';
  readTimeInfo.style.fontSize = '0.9rem';
  
  const readTimeIcon = document.createElement('span');
  readTimeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
  readTimeIcon.style.marginRight = '6px';
  
  const readTimeText = document.createElement('span');
  readTimeText.textContent = post.readTime;
  
  readTimeInfo.appendChild(readTimeIcon);
  readTimeInfo.appendChild(readTimeText);
  
  metadataSection.appendChild(dateInfo);
  metadataSection.appendChild(readTimeInfo);
  
  // Assemble meta row
  metaRow.appendChild(authorSection);
  metaRow.appendChild(metadataSection);
  
  // Featured image
  const featuredImage = document.createElement('img');
  featuredImage.src = post.image;
  featuredImage.alt = post.title;
  featuredImage.style.width = '100%';
  featuredImage.style.height = 'auto';
  featuredImage.style.maxHeight = '500px';
  featuredImage.style.objectFit = 'cover';
  featuredImage.style.borderRadius = '8px';
  featuredImage.style.marginBottom = '32px';
  
  // Article content
  const articleContent = document.createElement('div');
  articleContent.className = 'article-content';
  articleContent.innerHTML = post.content;
  articleContent.style.fontSize = '1.1rem';
  articleContent.style.lineHeight = '1.8';
  articleContent.style.color = 'var(--color-text, #1F2937)';
  
  // Style article content elements
  styleArticleContent(articleContent);
  
  // Tags section
  const tagsSection = document.createElement('div');
  tagsSection.style.marginTop = '40px';
  tagsSection.style.display = 'flex';
  tagsSection.style.flexWrap = 'wrap';
  tagsSection.style.gap = '8px';
  
  post.tags.forEach(tag => {
    const tagLink = document.createElement('a');
    tagLink.href = `#blog?tag=${tag}`;
    tagLink.textContent = `#${tag}`;
    tagLink.style.display = 'inline-block';
    tagLink.style.padding = '6px 12px';
    tagLink.style.backgroundColor = 'var(--color-background-secondary, #F9FAFB)';
    tagLink.style.color = 'var(--color-text-secondary, #6B7280)';
    tagLink.style.borderRadius = '16px';
    tagLink.style.fontSize = '0.85rem';
    tagLink.style.textDecoration = 'none';
    
    tagsSection.appendChild(tagLink);
  });
  
  // Share section
  const shareSection = document.createElement('div');
  shareSection.style.marginTop = '40px';
  shareSection.style.padding = '24px';
  shareSection.style.borderRadius = '8px';
  shareSection.style.backgroundColor = 'var(--color-background-secondary, #F9FAFB)';
  
  const shareTitle = document.createElement('h3');
  shareTitle.textContent = 'Share this article';
  shareTitle.style.fontSize = '1.1rem';
  shareTitle.style.fontWeight = 'bold';
  shareTitle.style.marginBottom = '16px';
  
  const shareButtons = document.createElement('div');
  shareButtons.style.display = 'flex';
  shareButtons.style.gap = '12px';
  
  // Create share buttons
  const platforms = [
    {
      name: 'Twitter',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
      color: '#1DA1F2'
    },
    {
      name: 'Facebook',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
      color: '#1877F2'
    },
    {
      name: 'LinkedIn',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
      color: '#0A66C2'
    },
    {
      name: 'Email',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
      color: '#EA4335'
    }
  ];
  
  platforms.forEach(platform => {
    const button = document.createElement('button');
    button.title = `Share on ${platform.name}`;
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '40px';
    button.style.height = '40px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = `${platform.color}15`; // 15% opacity
    button.style.color = platform.color;
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.2s ease';
    button.innerHTML = platform.icon;
    
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = `${platform.color}30`; // 30% opacity
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = `${platform.color}15`; // 15% opacity
    });
    
    button.addEventListener('click', () => {
      // Get the current URL
      const url = window.location.href;
      
      // Share based on platform
      switch (platform.name) {
        case 'Twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, '_blank');
          break;
        case 'Facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'LinkedIn':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'Email':
          window.location.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`;
          break;
      }
    });
    
    shareButtons.appendChild(button);
  });
  
  shareSection.appendChild(shareTitle);
  shareSection.appendChild(shareButtons);
  
  // Assemble article header
  articleHeader.appendChild(categoryLabel);
  articleHeader.appendChild(title);
  articleHeader.appendChild(excerpt);
  articleHeader.appendChild(metaRow);
  
  // Assemble main content
  mainContent.appendChild(articleHeader);
  mainContent.appendChild(featuredImage);
  mainContent.appendChild(articleContent);
  mainContent.appendChild(tagsSection);
  mainContent.appendChild(shareSection);
  
  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.style.width = '100%';
  sidebar.style.maxWidth = '300px';
  
  // Table of contents
  const tocSection = createTableOfContents(articleContent);
  sidebar.appendChild(tocSection);
  
  // Related articles
  const relatedSection = createRelatedArticles(post.id);
  sidebar.appendChild(relatedSection);
  
  // Newsletter signup
  const newsletterSection = document.createElement('div');
  newsletterSection.className = 'newsletter-section';
  newsletterSection.style.marginTop = '32px';
  newsletterSection.style.padding = '24px';
  newsletterSection.style.borderRadius = '12px';
  newsletterSection.style.backgroundColor = 'var(--color-primary-light, rgba(66, 153, 225, 0.1))';
  
  const newsletterTitle = document.createElement('h3');
  newsletterTitle.textContent = 'Subscribe to Our Newsletter';
  newsletterTitle.style.fontSize = '1.1rem';
  newsletterTitle.style.fontWeight = 'bold';
  newsletterTitle.style.marginBottom = '12px';
  
  const newsletterDesc = document.createElement('p');
  newsletterDesc.textContent = 'Get the latest financial insights delivered straight to your inbox.';
  newsletterDesc.style.fontSize = '0.9rem';
  newsletterDesc.style.marginBottom = '16px';
  newsletterDesc.style.color = 'var(--color-text-secondary, #6B7280)';
  
  const newsletterForm = document.createElement('form');
  newsletterForm.style.display = 'flex';
  newsletterForm.style.flexDirection = 'column';
  newsletterForm.style.gap = '12px';
  
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Your email address';
  emailInput.required = true;
  emailInput.style.padding = '10px 12px';
  emailInput.style.border = '1px solid var(--color-border, #E5E7EB)';
  emailInput.style.borderRadius = '6px';
  emailInput.style.fontSize = '0.9rem';
  
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Subscribe';
  submitBtn.style.padding = '10px 16px';
  submitBtn.style.backgroundColor = 'var(--color-primary, #4299E1)';
  submitBtn.style.color = 'white';
  submitBtn.style.border = 'none';
  submitBtn.style.borderRadius = '6px';
  submitBtn.style.fontSize = '0.9rem';
  submitBtn.style.fontWeight = 'bold';
  submitBtn.style.cursor = 'pointer';
  submitBtn.style.transition = 'background-color 0.2s ease';
  
  // Button hover effect
  submitBtn.addEventListener('mouseenter', () => {
    submitBtn.style.backgroundColor = 'var(--color-primary-dark, #3182CE)';
  });
  
  submitBtn.addEventListener('mouseleave', () => {
    submitBtn.style.backgroundColor = 'var(--color-primary, #4299E1)';
  });
  
  // Form submission
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simple validation
    if (emailInput.validity.valid) {
      // Show success message
      newsletterForm.style.display = 'none';
      
      const successMsg = document.createElement('div');
      successMsg.style.textAlign = 'center';
      successMsg.style.padding = '16px 0';
      
      const checkIcon = document.createElement('div');
      checkIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      checkIcon.style.color = 'var(--color-success, #10B981)';
      checkIcon.style.marginBottom = '8px';
      checkIcon.style.display = 'flex';
      checkIcon.style.justifyContent = 'center';
      
      const successText = document.createElement('p');
      successText.textContent = 'Thanks for subscribing!';
      successText.style.fontSize = '0.9rem';
      successText.style.fontWeight = 'bold';
      
      successMsg.appendChild(checkIcon);
      successMsg.appendChild(successText);
      
      newsletterSection.appendChild(successMsg);
    }
  });
  
  newsletterForm.appendChild(emailInput);
  newsletterForm.appendChild(submitBtn);
  
  newsletterSection.appendChild(newsletterTitle);
  newsletterSection.appendChild(newsletterDesc);
  newsletterSection.appendChild(newsletterForm);
  
  sidebar.appendChild(newsletterSection);
  
  // Assemble article section
  articleSection.appendChild(mainContent);
  articleSection.appendChild(sidebar);
  
  container.appendChild(articleSection);
  
  // Add responsive layout handling
  window.addEventListener('resize', () => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    articleSection.style.flexDirection = mediaQuery.matches ? 'row' : 'column-reverse';
    
    if (mediaQuery.matches) {
      mainContent.style.maxWidth = 'calc(100% - 300px - 32px)';
    } else {
      mainContent.style.maxWidth = '100%';
    }
    
    const titleMediaQuery = window.matchMedia('(max-width: 640px)');
    title.style.fontSize = titleMediaQuery.matches ? '1.8rem' : '2.5rem';
  });
  
  /**
   * Create table of contents from article content
   * @param {HTMLElement} content - Article content element
   * @returns {HTMLElement} TOC element
   */
  function createTableOfContents(content) {
    const tocSection = document.createElement('div');
    tocSection.className = 'toc-section';
    tocSection.style.padding = '24px';
    tocSection.style.borderRadius = '8px';
    tocSection.style.backgroundColor = 'var(--color-background-secondary, #F9FAFB)';
    tocSection.style.marginBottom = '32px';
    
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'Table of Contents';
    tocTitle.style.fontSize = '1.1rem';
    tocTitle.style.fontWeight = 'bold';
    tocTitle.style.marginBottom = '16px';
    
    tocSection.appendChild(tocTitle);
    
    // Extract headings from content
    const headings = [];
    const headingElements = content.querySelectorAll('h2, h3');
    
    if (headingElements.length === 0) {
      const noToc = document.createElement('p');
      noToc.textContent = 'No headings found in this article.';
      noToc.style.fontSize = '0.9rem';
      noToc.style.color = 'var(--color-text-secondary, #6B7280)';
      tocSection.appendChild(noToc);
      return tocSection;
    }
    
    // Process headings
    headingElements.forEach((heading, index) => {
      // Add ID to the heading for navigation
      const headingId = `heading-${index}`;
      heading.id = headingId;
      
      headings.push({
        id: headingId,
        text: heading.textContent,
        level: heading.tagName === 'H2' ? 2 : 3
      });
    });
    
    // Create TOC list
    const tocList = document.createElement('ul');
    tocList.style.listStyleType = 'none';
    tocList.style.padding = '0';
    tocList.style.margin = '0';
    
    headings.forEach(heading => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = '8px';
      
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.text;
      link.style.display = 'block';
      link.style.fontSize = '0.9rem';
      link.style.color = 'var(--color-text-secondary, #6B7280)';
      link.style.textDecoration = 'none';
      link.style.padding = '4px 0';
      link.style.transition = 'color 0.2s ease';
      
      // Indent H3 headings
      if (heading.level === 3) {
        link.style.paddingLeft = '16px';
        link.style.fontSize = '0.85rem';
      }
      
      // Hover effect
      link.addEventListener('mouseenter', () => {
        link.style.color = 'var(--color-primary, #4299E1)';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.color = 'var(--color-text-secondary, #6B7280)';
      });
      
      // Smooth scroll to heading
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetHeading = document.getElementById(heading.id);
        if (targetHeading) {
          targetHeading.scrollIntoView({ behavior: 'smooth' });
          
          // Highlight the heading briefly
          const originalBackground = targetHeading.style.backgroundColor;
          
          targetHeading.style.backgroundColor = 'var(--color-primary-light, rgba(66, 153, 225, 0.2))';
          targetHeading.style.transition = 'background-color 0.5s ease';
          
          setTimeout(() => {
            targetHeading.style.backgroundColor = originalBackground;
          }, 1500);
        }
      });
      
      listItem.appendChild(link);
      tocList.appendChild(listItem);
    });
    
    tocSection.appendChild(tocList);
    
    return tocSection;
  }
  
  /**
   * Create related articles section
   * @param {number} postId - Current post ID
   * @returns {HTMLElement} Related articles element
   */
  function createRelatedArticles(postId) {
    const relatedSection = document.createElement('div');
    relatedSection.className = 'related-articles-section';
    relatedSection.style.marginTop = '32px';
    
    const relatedTitle = document.createElement('h3');
    relatedTitle.textContent = 'Related Articles';
    relatedTitle.style.fontSize = '1.1rem';
    relatedTitle.style.fontWeight = 'bold';
    relatedTitle.style.marginBottom = '16px';
    
    relatedSection.appendChild(relatedTitle);
    
    // Get related posts
    const relatedPosts = getRelatedPosts(postId, 3);
    
    if (relatedPosts.length === 0) {
      const noRelated = document.createElement('p');
      noRelated.textContent = 'No related articles found.';
      noRelated.style.fontSize = '0.9rem';
      noRelated.style.color = 'var(--color-text-secondary, #6B7280)';
      relatedSection.appendChild(noRelated);
      return relatedSection;
    }
    
    // Create related posts list
    const relatedList = document.createElement('div');
    relatedList.style.display = 'flex';
    relatedList.style.flexDirection = 'column';
    relatedList.style.gap = '16px';
    
    relatedPosts.forEach(post => {
      const postItem = document.createElement('div');
      postItem.style.display = 'flex';
      postItem.style.gap = '12px';
      postItem.style.cursor = 'pointer';
      
      // Add click event
      postItem.addEventListener('click', () => {
        openArticle(post.slug);
      });
      
      // Post thumbnail
      const thumbnail = document.createElement('img');
      thumbnail.src = post.image;
      thumbnail.alt = post.title;
      thumbnail.style.width = '60px';
      thumbnail.style.height = '60px';
      thumbnail.style.borderRadius = '6px';
      thumbnail.style.objectFit = 'cover';
      
      // Post info
      const postInfo = document.createElement('div');
      postInfo.style.flex = '1';
      
      const postTitle = document.createElement('h4');
      postTitle.textContent = post.title;
      postTitle.style.fontSize = '0.9rem';
      postTitle.style.fontWeight = '600';
      postTitle.style.margin = '0 0 4px 0';
      postTitle.style.display = '-webkit-box';
      postTitle.style.webkitLineClamp = '2';
      postTitle.style.webkitBoxOrient = 'vertical';
      postTitle.style.overflow = 'hidden';
      
      const postMeta = document.createElement('span');
      postMeta.textContent = post.date;
      postMeta.style.fontSize = '0.75rem';
      postMeta.style.color = 'var(--color-text-muted, #9CA3AF)';
      
      postInfo.appendChild(postTitle);
      postInfo.appendChild(postMeta);
      
      postItem.appendChild(thumbnail);
      postItem.appendChild(postInfo);
      
      relatedList.appendChild(postItem);
    });
    
    relatedSection.appendChild(relatedList);
    
    return relatedSection;
  }
  
  /**
   * Style article content elements
   * @param {HTMLElement} content - Article content element
   */
  function styleArticleContent(content) {
    // Style headings
    const headings = content.querySelectorAll('h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      heading.style.fontWeight = 'bold';
      heading.style.marginTop = '1.5em';
      heading.style.marginBottom = '0.5em';
      heading.style.lineHeight = '1.3';
      
      // H2 styles
      if (heading.tagName === 'H2') {
        heading.style.fontSize = '1.8rem';
        heading.style.borderBottom = '1px solid var(--color-border, #E5E7EB)';
        heading.style.paddingBottom = '0.3em';
      }
      
      // H3 styles
      if (heading.tagName === 'H3') {
        heading.style.fontSize = '1.5rem';
      }
      
      // H4 styles
      if (heading.tagName === 'H4') {
        heading.style.fontSize = '1.25rem';
      }
    });
    
    // Style paragraphs
    const paragraphs = content.querySelectorAll('p');
    paragraphs.forEach(paragraph => {
      paragraph.style.marginBottom = '1.2em';
      paragraph.style.lineHeight = '1.8';
    });
    
    // Style lists
    const lists = content.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.style.paddingLeft = '1.5em';
      list.style.marginBottom = '1.2em';
      list.style.lineHeight = '1.8';
    });
    
    // Style list items
    const listItems = content.querySelectorAll('li');
    listItems.forEach(item => {
      item.style.marginBottom = '0.5em';
    });
    
    // Style links
    const links = content.querySelectorAll('a');
    links.forEach(link => {
      link.style.color = 'var(--color-primary, #4299E1)';
      link.style.textDecoration = 'none';
      link.style.transition = 'color 0.2s ease';
      
      // Hover effect
      link.addEventListener('mouseenter', () => {
        link.style.color = 'var(--color-primary-dark, #3182CE)';
        link.style.textDecoration = 'underline';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.color = 'var(--color-primary, #4299E1)';
        link.style.textDecoration = 'none';
      });
    });
    
    // Style blockquotes
    const blockquotes = content.querySelectorAll('blockquote');
    blockquotes.forEach(quote => {
      quote.style.borderLeft = '4px solid var(--color-primary-light, rgba(66, 153, 225, 0.3))';
      quote.style.paddingLeft = '1em';
      quote.style.margin = '1.5em 0';
      quote.style.color = 'var(--color-text-secondary, #6B7280)';
      quote.style.fontStyle = 'italic';
    });
    
    // Style tables
    const tables = content.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '1.5em';
      table.style.fontSize = '0.9em';
      
      // Style table header cells
      const headerCells = table.querySelectorAll('th');
      headerCells.forEach(cell => {
        cell.style.backgroundColor = 'var(--color-background-secondary, #F9FAFB)';
        cell.style.padding = '12px 16px';
        cell.style.textAlign = 'left';
        cell.style.fontWeight = 'bold';
        cell.style.borderBottom = '2px solid var(--color-border, #E5E7EB)';
      });
      
      // Style table data cells
      const dataCells = table.querySelectorAll('td');
      dataCells.forEach(cell => {
        cell.style.padding = '12px 16px';
        cell.style.borderBottom = '1px solid var(--color-border, #E5E7EB)';
      });
      
      // Style alternating rows
      const rows = table.querySelectorAll('tr:nth-child(even)');
      rows.forEach(row => {
        row.style.backgroundColor = 'var(--color-background-secondary, #F9FAFB)';
      });
    });
    
    // Style code blocks
    const codeBlocks = content.querySelectorAll('pre, code');
    codeBlocks.forEach(block => {
      block.style.fontFamily = 'monospace';
      block.style.backgroundColor = 'var(--color-background-secondary, #F9FAFB)';
      block.style.borderRadius = '4px';
      
      if (block.tagName === 'PRE') {
        block.style.padding = '16px';
        block.style.overflow = 'auto';
        block.style.marginBottom = '1.5em';
      } else {
        block.style.padding = '2px 4px';
      }
    });
    
    // Style images
    const images = content.querySelectorAll('img');
    images.forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      img.style.marginBottom = '1.5em';
    });
    
    // Style horizontal rules
    const rules = content.querySelectorAll('hr');
    rules.forEach(rule => {
      rule.style.border = 'none';
      rule.style.height = '1px';
      rule.style.backgroundColor = 'var(--color-border, #E5E7EB)';
      rule.style.margin = '2em 0';
    });
  }
  
  /**
   * Open an article by slug
   * Function used by related articles and other links
   * @param {string} slug - Article slug
   */
  function openArticle(slug) {
    // Update URL and reload the article
    window.location.hash = `blog/${slug}`;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  return container;
}

/**
 * Make blog data globally accessible
 */
window.blogData = {
  filterPostsByCategory,
  getFeaturedPosts,
  getLatestPosts,
  getPostBySlug,
  getRelatedPosts,
  searchPosts,
  blogCategories
};