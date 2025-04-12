/**
 * Affiliate Programs Database
 * Provides data for available affiliate programs and resources
 */

// List of available affiliate programs
export const affiliatePrograms = [
  {
    id: 'amazon',
    name: 'Amazon Associates',
    description: 'Earn up to 10% in advertising fees when customers purchase products through your links.',
    category: 'ecommerce',
    commission: '1-10%',
    cookieDuration: '24 hours',
    paymentThreshold: '$10',
    paymentMethods: ['Direct Deposit', 'Amazon Gift Card', 'Check'],
    applicationProcess: 'Simple registration, requires website/app/channel',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/amazon-associates-logo.png',
    link: 'https://affiliate-program.amazon.com/',
    requirements: [
      'Website, app, or social media presence',
      'Content must comply with Amazon guidelines',
      'Regular traffic or audience'
    ],
    tips: [
      'Focus on product niches you know well',
      'Create honest, detailed reviews',
      'Use Native Shopping Ads for better conversions'
    ]
  },
  {
    id: 'upwork',
    name: 'Upwork Referral Program',
    description: 'Earn when you refer clients or freelancers who spend or earn on the platform.',
    category: 'freelance',
    commission: 'Up to $150 per client; Up to $50 per freelancer',
    cookieDuration: '90 days',
    paymentThreshold: '$10',
    paymentMethods: ['Direct Deposit', 'PayPal', 'Wire Transfer'],
    applicationProcess: 'Automatic for Upwork users',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/upwork-logo.png',
    link: 'https://www.upwork.com/referral/',
    requirements: [
      'Active Upwork account',
      'Compliance with Upwork terms'
    ],
    tips: [
      'Target businesses looking to hire freelancers',
      'Share success stories from the platform',
      'Focus on referring clients for higher returns'
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify Affiliate Program',
    description: 'Earn 200% commission (on average $58) for each user who signs up for a paid plan.',
    category: 'ecommerce',
    commission: '200% of first month subscription fee',
    cookieDuration: '30 days',
    paymentThreshold: '$25',
    paymentMethods: ['PayPal', 'Bank Deposit'],
    applicationProcess: 'Application review process, may take 5-10 days',
    beginnerFriendly: false,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/shopify-logo.png',
    link: 'https://www.shopify.com/affiliates',
    requirements: [
      'Established audience or following',
      'Marketing experience',
      'Ecommerce-focused content'
    ],
    tips: [
      'Create how-to guides for starting online stores',
      'Compare Shopify with other platforms',
      'Target entrepreneur and small business audiences'
    ]
  },
  {
    id: 'fiverr',
    name: 'Fiverr Affiliates',
    description: 'Earn up to $1000 for every first-time buyer or seller you refer to Fiverr.',
    category: 'freelance',
    commission: '$15-$50 CPA or 10% revenue share',
    cookieDuration: '30 days',
    paymentThreshold: '$100',
    paymentMethods: ['PayPal', 'Payoneer', 'Bank Transfer'],
    applicationProcess: 'Application review (1-3 days)',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/fiverr-logo.png',
    link: 'https://affiliates.fiverr.com/',
    requirements: [
      'Active website, blog, or social media',
      'Regular content publishing',
      'Genuine interest in promoting services'
    ],
    tips: [
      'Target entrepreneurs and small businesses',
      'Promote specific services that solve problems',
      'Create "best of Fiverr" service lists'
    ]
  },
  {
    id: 'hostgator',
    name: 'HostGator Affiliate Program',
    description: 'Earn up to $125 per signup and receive competitive commissions on hosting plans.',
    category: 'hosting',
    commission: '$65-$125 per sale',
    cookieDuration: '60 days',
    paymentThreshold: '$100',
    paymentMethods: ['PayPal', 'Check'],
    applicationProcess: 'Instant approval',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/hostgator-logo.png',
    link: 'https://www.hostgator.com/affiliates',
    requirements: [
      'Website or blog',
      'Basic marketing knowledge'
    ],
    tips: [
      'Target website creators and small businesses',
      'Create hosting comparison content',
      'Highlight promotional deals and discounts'
    ]
  },
  {
    id: 'bluehost',
    name: 'Bluehost Affiliate Program',
    description: 'Earn $65 or more for each qualified sign-up you refer to Bluehost.',
    category: 'hosting',
    commission: '$65+ per sale',
    cookieDuration: '90 days',
    paymentThreshold: '$100',
    paymentMethods: ['PayPal', 'Check'],
    applicationProcess: 'Quick application review',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/bluehost-logo.png',
    link: 'https://www.bluehost.com/affiliates',
    requirements: [
      'Website or digital presence',
      'Basic understanding of web hosting'
    ],
    tips: [
      'Create WordPress hosting tutorials',
      'Target beginners setting up their first website',
      'Emphasize reliability and customer support'
    ]
  },
  {
    id: 'robinhood',
    name: 'Robinhood Referral Program',
    description: 'Earn free stock (worth $5-$200) for each new qualified user.',
    category: 'finance',
    commission: 'Free stock valued at $5-$200',
    cookieDuration: 'No expiration (unique link)',
    paymentThreshold: 'N/A',
    paymentMethods: ['Free Stock'],
    applicationProcess: 'Automatic for Robinhood users',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/robinhood-logo.png',
    link: 'https://robinhood.com/us/en/about/referral/',
    requirements: [
      'Have a Robinhood account',
      'Use personal referral link'
    ],
    tips: [
      'Target friends and family new to investing',
      'Explain the benefits of commission-free trades',
      'Highlight free stock opportunity to entice sign-ups'
    ]
  },
  {
    id: 'coinbase',
    name: 'Coinbase Referral Program',
    description: 'Earn $10 in Bitcoin when your referral buys or sells $100 in cryptocurrency.',
    category: 'finance',
    commission: '$10 in Bitcoin',
    cookieDuration: 'No expiration (unique link)',
    paymentThreshold: 'N/A',
    paymentMethods: ['Bitcoin transfer to Coinbase account'],
    applicationProcess: 'Automatic for Coinbase users',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/coinbase-logo.png',
    link: 'https://www.coinbase.com/referral',
    requirements: [
      'Have a Coinbase account',
      'Share personal referral link'
    ],
    tips: [
      'Target crypto beginners',
      'Create educational content about cryptocurrency',
      'Help people through the sign-up process'
    ]
  },
  {
    id: 'etsy',
    name: 'Etsy Affiliate Program',
    description: 'Earn 4% commission on purchases made by users you refer to Etsy.',
    category: 'ecommerce',
    commission: '4% on qualifying purchases',
    cookieDuration: '30 days',
    paymentThreshold: '$20',
    paymentMethods: ['Direct Deposit', 'Check', 'PayPal'],
    applicationProcess: 'Application via Awin affiliate network',
    beginnerFriendly: false,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/etsy-logo.png',
    link: 'https://www.awin.com/us/affiliate-program/etsy',
    requirements: [
      'Join Awin affiliate network',
      'Have established blog or website',
      'Create relevant content for Etsy audience'
    ],
    tips: [
      'Create gift guides featuring Etsy products',
      'Focus on handmade and unique product recommendations',
      'Target specific niches (wedding, home decor, etc.)'
    ]
  },
  {
    id: 'udemy',
    name: 'Udemy Affiliate Program',
    description: 'Earn up to 15% commission on course purchases made through your links.',
    category: 'education',
    commission: '15% on course sales',
    cookieDuration: '7 days',
    paymentThreshold: '$50',
    paymentMethods: ['PayPal', 'Payoneer'],
    applicationProcess: 'Application via affiliate networks (Rakuten, CJ, etc.)',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/udemy-logo.png',
    link: 'https://www.udemy.com/affiliate/',
    requirements: [
      'Join an affiliated network',
      'Have a platform to share links',
      'Create relevant educational content'
    ],
    tips: [
      'Promote courses related to your audience\'s interests',
      'Share during Udemy sales events for better conversions',
      'Create "best courses for X" content'
    ]
  },
  {
    id: 'namecheap',
    name: 'Namecheap Affiliate Program',
    description: 'Earn up to 50% commission on domain registrations and hosting plans.',
    category: 'hosting',
    commission: '20-50% commission',
    cookieDuration: '90 days',
    paymentThreshold: '$50',
    paymentMethods: ['PayPal', 'Namecheap Account Balance'],
    applicationProcess: 'Simple signup, quick approval',
    beginnerFriendly: true,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/namecheap-logo.png',
    link: 'https://www.namecheap.com/affiliates/',
    requirements: [
      'Website or social media presence',
      'Basic understanding of domain names/hosting'
    ],
    tips: [
      'Target website creators and entrepreneurs',
      'Highlight cost-saving compared to competitors',
      'Create tutorials on domain registration process'
    ]
  },
  {
    id: 'notion',
    name: 'Notion Ambassador Program',
    description: 'Earn 20% of paid plans purchased using your referral link, recurring monthly.',
    category: 'productivity',
    commission: '20% recurring monthly commission',
    cookieDuration: 'Lifetime attribution',
    paymentThreshold: '$20',
    paymentMethods: ['PayPal'],
    applicationProcess: 'Application review (selective)',
    beginnerFriendly: false,
    logo: 'https://s3.amazonaws.com/affiliate-program-assets/notion-logo.png',
    link: 'https://www.notion.so/affiliates',
    requirements: [
      'Established audience',
      'Quality content creation',
      'Genuine Notion usage and expertise'
    ],
    tips: [
      'Create Notion templates and tutorials',
      'Showcase creative use cases',
      'Demonstrate productivity improvements'
    ]
  }
];

// List of affiliate marketing resources
export const affiliateResources = [
  {
    id: 'guide-beginners',
    title: 'Complete Beginner\'s Guide to Affiliate Marketing',
    type: 'article',
    category: 'beginner',
    description: 'Learn the fundamentals of affiliate marketing, how it works, and how to start earning your first commission.',
    link: 'https://stackrfinance.com/resources/affiliate-beginners-guide',
    featured: true
  },
  {
    id: 'ethical-promotion',
    title: 'Ethical Affiliate Promotion: Best Practices',
    type: 'article',
    category: 'strategy',
    description: 'Guidelines for promoting affiliate products with integrity while maintaining audience trust.',
    link: 'https://stackrfinance.com/resources/ethical-affiliate-promotion',
    featured: false
  },
  {
    id: 'income-taxes',
    title: 'Managing Taxes for Affiliate Income',
    type: 'article',
    category: 'finance',
    description: 'Understanding tax obligations for affiliate earnings and how to properly track your income.',
    link: 'https://stackrfinance.com/resources/affiliate-income-taxes',
    featured: true
  },
  {
    id: 'content-strategies',
    title: 'Content Strategies that Convert',
    type: 'video',
    category: 'strategy',
    description: 'Learn effective content creation techniques that drive affiliate conversions without being pushy.',
    link: 'https://stackrfinance.com/resources/affiliate-content-strategies',
    featured: false
  },
  {
    id: 'disclosure-templates',
    title: 'Affiliate Disclosure Templates',
    type: 'template',
    category: 'compliance',
    description: 'FTC-compliant disclosure templates you can use for your blog, social media, or videos.',
    link: 'https://stackrfinance.com/resources/affiliate-disclosure-templates',
    featured: true
  },
  {
    id: 'seo-affiliate',
    title: 'SEO for Affiliate Marketers',
    type: 'guide',
    category: 'strategy',
    description: 'Optimize your affiliate content to rank higher in search engines and drive organic traffic.',
    link: 'https://stackrfinance.com/resources/seo-for-affiliates',
    featured: false
  },
  {
    id: 'social-media-promotion',
    title: 'Social Media Affiliate Promotion Guide',
    type: 'guide',
    category: 'strategy',
    description: 'Platform-specific strategies for promoting affiliate offers on social media without spamming.',
    link: 'https://stackrfinance.com/resources/social-media-affiliate-guide',
    featured: false
  },
  {
    id: 'tracking-analytics',
    title: 'Affiliate Link Tracking and Analytics',
    type: 'tutorial',
    category: 'technical',
    description: 'How to properly track your affiliate links and analyze performance to maximize earnings.',
    link: 'https://stackrfinance.com/resources/affiliate-tracking-analytics',
    featured: true
  }
];

/**
 * Get programs by category
 * @param {string} category - Category to filter by
 * @returns {Array} - Filtered programs
 */
export function getProgramsByCategory(category) {
  if (!category || category === 'all') {
    return affiliatePrograms;
  }
  
  return affiliatePrograms.filter(program => program.category === category);
}

/**
 * Get beginner-friendly programs
 * @returns {Array} - Beginner-friendly programs
 */
export function getBeginnerFriendlyPrograms() {
  return affiliatePrograms.filter(program => program.beginnerFriendly === true);
}

/**
 * Search programs by query
 * @param {string} query - Search query
 * @returns {Array} - Search results
 */
export function searchPrograms(query) {
  if (!query) return affiliatePrograms;
  
  const lowerQuery = query.toLowerCase();
  
  return affiliatePrograms.filter(program => 
    program.name.toLowerCase().includes(lowerQuery) || 
    program.description.toLowerCase().includes(lowerQuery) || 
    program.category.toLowerCase().includes(lowerQuery)
  );
}