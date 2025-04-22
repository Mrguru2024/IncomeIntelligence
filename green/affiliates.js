// Affiliate Program Data for Stackr Finance GREEN Edition

// Sample affiliate programs that users can join to earn income
export const affiliatePrograms = [
  {
    id: 'amazon',
    name: 'Amazon Associates',
    description: 'Earn commissions by promoting products from Amazon.com.',
    commission: '1-10% depending on product category',
    requirements: 'Website, blog, or social media presence',
    link: 'https://affiliate-program.amazon.com/',
    categories: ['retail', 'e-commerce', 'general'],
    beginner_friendly: true
  },
  {
    id: 'shopify',
    name: 'Shopify Affiliate Program',
    description: 'Earn by referring new merchants to Shopify e-commerce platform.',
    commission: '$58 per paying customer referred',
    requirements: 'Website or audience interested in e-commerce',
    link: 'https://www.shopify.com/affiliates',
    categories: ['e-commerce', 'business', 'tech'],
    beginner_friendly: true
  },
  {
    id: 'hostgator',
    name: 'HostGator',
    description: 'Promote web hosting services and earn per signup.',
    commission: 'Up to $100 per signup',
    requirements: 'Tech or business audience',
    link: 'https://www.hostgator.com/affiliates',
    categories: ['hosting', 'tech', 'business'],
    beginner_friendly: true
  },
  {
    id: 'fiverr',
    name: 'Fiverr Affiliates',
    description: 'Earn by referring buyers and sellers to Fiverr marketplace.',
    commission: '$15-$150 per first-time buyer or seller',
    requirements: 'Audience interested in freelance services',
    link: 'https://affiliates.fiverr.com/',
    categories: ['freelance', 'gig economy', 'services'],
    beginner_friendly: true
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    description: 'Promote email marketing tools to creators and earn recurring commissions.',
    commission: '30% recurring commission monthly',
    requirements: 'Creator or business audience',
    link: 'https://convertkit.com/affiliates',
    categories: ['email marketing', 'creator economy', 'tech'],
    beginner_friendly: false
  },
  {
    id: 'teachable',
    name: 'Teachable',
    description: 'Earn by promoting this course creation platform.',
    commission: '30% recurring for the life of referred user',
    requirements: 'Education, creator, or entrepreneurial audience',
    link: 'https://teachable.com/affiliates',
    categories: ['education', 'creator economy', 'courses'],
    beginner_friendly: true
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    description: 'Refer friends to get free stocks for both of you.',
    commission: 'Free stock for each referral (valued $3-$225)',
    requirements: 'Personal referrals only, no web marketing',
    link: 'https://robinhood.com/us/en/support/articles/invite-friends-get-free-stock/',
    categories: ['investing', 'finance', 'stocks'],
    beginner_friendly: true
  },
  {
    id: 'wealthfront',
    name: 'Wealthfront',
    description: 'Refer friends to this automated investment service.',
    commission: '$5,000 managed free for each referral',
    requirements: 'Personal network only',
    link: 'https://www.wealthfront.com/invite',
    categories: ['investing', 'finance', 'robo-advisor'],
    beginner_friendly: true
  },
  {
    id: 'bluehost',
    name: 'Bluehost',
    description: 'Promote web hosting services to your audience.',
    commission: '$65 per referral',
    requirements: 'Website or tech-focused audience',
    link: 'https://www.bluehost.com/affiliates',
    categories: ['hosting', 'tech', 'websites'],
    beginner_friendly: true
  },
  {
    id: 'udemy',
    name: 'Udemy Affiliate Program',
    description: 'Earn by promoting online courses on various topics.',
    commission: '15% of course purchases',
    requirements: 'Website, blog, or email list',
    link: 'https://www.udemy.com/affiliate/',
    categories: ['education', 'courses', 'skills'],
    beginner_friendly: true
  }
];

// Affiliate marketing resources and guides
export const affiliateResources = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of affiliate marketing and how to choose the right programs.',
    type: 'guide',
    difficulty: 'beginner'
  },
  {
    title: 'Affiliate Link Disclosures',
    description: 'Learn about legal requirements for disclosing affiliate relationships.',
    type: 'legal',
    difficulty: 'beginner'
  },
  {
    title: 'Conversion Optimization',
    description: 'Tips to increase your affiliate conversion rates.',
    type: 'strategy',
    difficulty: 'intermediate'
  },
  {
    title: 'Content Marketing for Affiliates',
    description: 'How to create valuable content that drives affiliate sales.',
    type: 'strategy',
    difficulty: 'intermediate'
  },
  {
    title: 'Email Marketing Strategies',
    description: 'Using email lists to promote affiliate offers effectively.',
    type: 'strategy',
    difficulty: 'advanced'
  }
];

// Helper function to filter programs by category
export function getProgramsByCategory(category) {
  return affiliatePrograms.filter(program => 
    program.categories.includes(category)
  );
}

// Helper function to get beginner-friendly programs
export function getBeginnerFriendlyPrograms() {
  return affiliatePrograms.filter(program => program.beginner_friendly);
}

// Helper function to search programs by name or description
export function searchPrograms(query) {
  const searchText = query.toLowerCase();
  return affiliatePrograms.filter(program => 
    program.name.toLowerCase().includes(searchText) || 
    program.description.toLowerCase().includes(searchText)
  );
}