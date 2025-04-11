/**
 * Blog Page Component for Stackr Finance
 * Displays blog posts in a responsive, interactive layout optimized for all devices
 */

import { blogPosts, blogCategories, filterPostsByCategory, getFeaturedPosts, getLatestPosts, getRelatedPosts, searchPosts, getPostBySlug, getPopularTags, formatDate } from './blog-data.js';

/**
 * Render blog page component
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {HTMLElement} Blog page element
 */
export function renderBlogPage(isAuthenticated = false) {
  const blogElement = document.createElement('div');
  blogElement.className = 'blog-page';
  
  // Title section
  const titleSection = createTitleSection();
  blogElement.appendChild(titleSection);
  
  // Main content container
  const mainContainer = document.createElement('div');
  mainContainer.className = 'blog-main-container';
  
  // Featured posts
  const featuredSection = createFeaturedSection();
  mainContainer.appendChild(featuredSection);
  
  // Two-column layout for posts and sidebar
  const contentContainer = document.createElement('div');
  contentContainer.className = 'blog-content-container';
  
  // Posts container
  const postsContainer = document.createElement('div');
  postsContainer.className = 'blog-posts-container';
  
  // Blog posts list
  const postsListContainer = document.createElement('div');
  postsListContainer.className = 'blog-posts-list';
  postsContainer.appendChild(postsListContainer);
  
  // Sidebar with categories and filters
  const sidebar = createSidebar();
  
  // Add content to the layout
  contentContainer.appendChild(postsContainer);
  contentContainer.appendChild(sidebar);
  mainContainer.appendChild(contentContainer);
  blogElement.appendChild(mainContainer);
  
  // Initial posts load - all posts
  renderPostsList(postsListContainer, blogPosts);
  
  return blogElement;
  
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