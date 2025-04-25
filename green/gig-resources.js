/**
 * Gig Resources Module
 * Provides structured data for gig platforms and educational resources
 */

export const gigCategories = [
  {
    id: 'freelance',
    name: 'Freelance Services',
    description: 'Offer your professional skills on platforms that connect you with clients worldwide.',
    platforms: [
      {
        name: 'Upwork',
        description: 'The largest freelance marketplace for finding clients and long-term projects.',
        url: 'https://www.upwork.com',
        beginner_friendly: true
      },
      {
        name: 'Fiverr',
        description: 'Marketplace for offering packaged services (gigs) with clear deliverables and pricing.',
        url: 'https://www.fiverr.com',
        beginner_friendly: true
      },
      {
        name: 'Freelancer',
        description: 'Bid-based platform with a wide range of project categories and global clients.',
        url: 'https://www.freelancer.com',
        beginner_friendly: false
      },
      {
        name: 'Toptal',
        description: 'Exclusive network for the top 3% of freelance talent with premium clients.',
        url: 'https://www.toptal.com',
        beginner_friendly: false
      },
      {
        name: 'PeoplePerHour',
        description: 'UK-based platform focused on connecting businesses with professional freelancers.',
        url: 'https://www.peopleperhour.com',
        beginner_friendly: true
      }
    ],
    resources: [
      {
        title: 'Freelancing Success Guide',
        type: 'guide',
        url: 'https://www.upwork.com/resources/beginners-guide-to-freelancing'
      },
      {
        title: 'How to Create a Standout Profile',
        type: 'article',
        url: 'https://www.fiverr.com/gig-university'
      },
      {
        title: 'Pricing Strategies for Freelancers',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=jE53O1PzmNU'
      }
    ]
  },
  {
    id: 'content',
    name: 'Content Creation',
    description: 'Create engaging content and build an audience across various platforms.',
    platforms: [
      {
        name: 'YouTube',
        description: 'Video platform for creators to build an audience and earn through ads, memberships, and more.',
        url: 'https://www.youtube.com/creators',
        beginner_friendly: true
      },
      {
        name: 'Substack',
        description: 'Platform for writers to publish newsletters and build paid subscriptions.',
        url: 'https://substack.com',
        beginner_friendly: true
      },
      {
        name: 'Patreon',
        description: 'Membership platform that lets creators earn recurring income from supporters.',
        url: 'https://www.patreon.com',
        beginner_friendly: true
      },
      {
        name: 'Medium',
        description: 'Publishing platform that pays writers based on member reading time.',
        url: 'https://medium.com/creators',
        beginner_friendly: true
      },
      {
        name: 'Twitch',
        description: 'Live streaming platform popular for gaming and creative content.',
        url: 'https://www.twitch.tv',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'YouTube Creator Academy',
        type: 'course',
        url: 'https://creatoracademy.youtube.com'
      },
      {
        title: 'Writing Online: How to Find Your Audience',
        type: 'article',
        url: 'https://blog.substack.com/p/writing-online'
      },
      {
        title: 'The Complete Guide to Earning on Patreon',
        type: 'guide',
        url: 'https://www.patreon.com/creator-guide'
      }
    ]
  },
  {
    id: 'affiliate',
    name: 'Affiliate Marketing',
    description: 'Earn commissions by promoting products and services from other companies.',
    platforms: [
      {
        name: 'Amazon Associates',
        description: 'The largest affiliate program with millions of products to promote.',
        url: 'https://affiliate-program.amazon.com',
        beginner_friendly: true
      },
      {
        name: 'ShareASale',
        description: 'Affiliate network with thousands of merchant programs across various niches.',
        url: 'https://www.shareasale.com',
        beginner_friendly: true
      },
      {
        name: 'CJ Affiliate',
        description: 'Premium affiliate network with well-known brands and higher commission rates.',
        url: 'https://www.cj.com',
        beginner_friendly: false
      },
      {
        name: 'ClickBank',
        description: 'Marketplace for digital products with high commission rates.',
        url: 'https://www.clickbank.com',
        beginner_friendly: true
      },
      {
        name: 'Impact',
        description: 'Partnership automation platform used by major brands like Airbnb and Adidas.',
        url: 'https://impact.com',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'Affiliate Marketing for Beginners',
        type: 'guide',
        url: 'https://www.affiliatemarketertraining.com/affiliate-marketing-for-beginners/'
      },
      {
        title: 'How to Create Converting Affiliate Content',
        type: 'article',
        url: 'https://www.authorityhacker.com/affiliate-marketing-content/'
      },
      {
        title: 'The Complete Amazon Associates Guide',
        type: 'course',
        url: 'https://www.nichepursuits.com/amazon-affiliate-marketing-guide/'
      }
    ]
  },
  {
    id: 'digital',
    name: 'Digital Products',
    description: 'Create and sell digital products with minimal overhead and passive income potential.',
    platforms: [
      {
        name: 'Etsy',
        description: 'Marketplace popular for digital downloads like printables, patterns, and templates.',
        url: 'https://www.etsy.com',
        beginner_friendly: true
      },
      {
        name: 'Gumroad',
        description: 'Simple platform for selling digital products directly to your audience.',
        url: 'https://gumroad.com',
        beginner_friendly: true
      },
      {
        name: 'Teachable',
        description: 'Platform for creating and selling online courses with your own branding.',
        url: 'https://teachable.com',
        beginner_friendly: true
      },
      {
        name: 'Podia',
        description: 'All-in-one platform for courses, digital downloads, and memberships.',
        url: 'https://www.podia.com',
        beginner_friendly: true
      },
      {
        name: 'Creative Market',
        description: 'Marketplace for design assets like fonts, templates, and graphics.',
        url: 'https://creativemarket.com',
        beginner_friendly: false
      }
    ],
    resources: [
      {
        title: 'How to Create Your First Digital Product',
        type: 'guide',
        url: 'https://convertkit.com/how-to-create-a-digital-product'
      },
      {
        title: 'Pricing Strategies for Digital Products',
        type: 'article',
        url: 'https://podia.com/articles/how-to-price-digital-products'
      },
      {
        title: 'From Zero to $10K with Digital Products',
        type: 'course',
        url: 'https://www.shopify.com/blog/digital-products'
      }
    ]
  },
  {
    id: 'local',
    name: 'Local Services',
    description: 'Offer in-person services in your local community with minimal startup costs.',
    platforms: [
      {
        name: 'TaskRabbit',
        description: 'Platform for offering services like furniture assembly, moving help, and handyman work.',
        url: 'https://www.taskrabbit.com',
        beginner_friendly: true
      },
      {
        name: 'Care.com',
        description: 'Platform for offering childcare, pet care, senior care, and housekeeping services.',
        url: 'https://www.care.com',
        beginner_friendly: true
      },
      {
        name: 'Thumbtack',
        description: 'Marketplace for local professional services from house painting to personal training.',
        url: 'https://www.thumbtack.com',
        beginner_friendly: true
      },
      {
        name: 'Rover',
        description: 'Platform specifically for pet sitting and dog walking services.',
        url: 'https://www.rover.com',
        beginner_friendly: true
      },
      {
        name: 'Nextdoor',
        description: 'Neighborhood app where you can offer services to people in your local community.',
        url: 'https://nextdoor.com',
        beginner_friendly: true
      }
    ],
    resources: [
      {
        title: 'How to Start a Local Service Business',
        type: 'guide',
        url: 'https://www.sba.gov/business-guide/10-steps-start-your-business'
      },
      {
        title: 'Marketing Your Local Services Online',
        type: 'article',
        url: 'https://www.wordstream.com/blog/ws/2020/01/16/local-service-ads'
      },
      {
        title: 'Setting Your Rates for Local Services',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=pGVH2JC3R5U'
      }
    ]
  }
];

/**
 * Get platforms and resources by category
 * @param {string} categoryId - Category identifier
 * @returns {Object|null} Category object with platforms and resources
 */
export function getGigCategoryById(categoryId) {
  return gigCategories.find(category => category.id === categoryId) || null;
}

/**
 * Get all beginner-friendly platforms across categories
 * @returns {Array} Array of beginner-friendly platforms with category info
 */
export function getBeginnerFriendlyPlatforms() {
  const beginnerPlatforms = [];
  
  gigCategories.forEach(category => {
    category.platforms.forEach(platform => {
      if (platform.beginner_friendly) {
        beginnerPlatforms.push({
          ...platform,
          category: category.name
        });
      }
    });
  });
  
  return beginnerPlatforms;
}

/**
 * Search for gig platforms by keyword
 * @param {string} query - Search term
 * @returns {Array} Matching platforms with category info
 */
export function searchGigPlatforms(query) {
  const searchTerm = query.toLowerCase();
  const results = [];
  
  gigCategories.forEach(category => {
    category.platforms.forEach(platform => {
      if (platform.name.toLowerCase().includes(searchTerm) || 
          platform.description.toLowerCase().includes(searchTerm)) {
        results.push({
          ...platform,
          category: category.name
        });
      }
    });
  });
  
  return results;
}

/**
 * Get all learning resources across categories
 * @returns {Array} Array of resources with category info
 */
export function getAllGigResources() {
  const allResources = [];
  
  gigCategories.forEach(category => {
    if (category.resources) {
      category.resources.forEach(resource => {
        allResources.push({
          ...resource,
          category: category.name
        });
      });
    }
  });
  
  return allResources;
}