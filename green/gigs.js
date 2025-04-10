// Stackr Gigs Data for GREEN Edition

// Available gig categories with example platforms
export const gigCategories = [
  {
    id: 'freelance',
    name: 'Freelance Services',
    description: 'Offer your professional skills on freelance marketplaces',
    platforms: [
      {
        name: 'Upwork',
        url: 'https://www.upwork.com',
        description: 'The largest freelance marketplace with diverse project types'
      },
      {
        name: 'Fiverr',
        url: 'https://www.fiverr.com',
        description: 'Package and sell your services as "gigs" starting at $5'
      },
      {
        name: 'Freelancer',
        url: 'https://www.freelancer.com',
        description: 'Bid on projects posted by clients worldwide'
      },
      {
        name: 'PeoplePerHour',
        url: 'https://www.peopleperhour.com',
        description: 'UK-based platform with fixed-price "hourlies"'
      }
    ],
    skills: ['Writing', 'Design', 'Programming', 'Marketing', 'Admin Support', 'Consulting'],
    beginner_friendly: true,
    income_potential: '$15-$150+ per hour depending on skills and experience',
    time_commitment: 'Flexible, from a few hours per week to full-time'
  },
  {
    id: 'content',
    name: 'Content Creation',
    description: 'Create blogs, videos, podcasts, or other digital content',
    platforms: [
      {
        name: 'YouTube',
        url: 'https://www.youtube.com',
        description: 'Video content platform with ad revenue sharing'
      },
      {
        name: 'Medium',
        url: 'https://medium.com',
        description: 'Publish articles and earn from the Partner Program'
      },
      {
        name: 'Substack',
        url: 'https://substack.com',
        description: 'Start a paid newsletter and collect subscription revenue'
      },
      {
        name: 'Anchor',
        url: 'https://anchor.fm',
        description: 'Create, distribute, and monetize podcasts'
      }
    ],
    skills: ['Writing', 'Video Production', 'Public Speaking', 'Subject Expertise'],
    beginner_friendly: true,
    income_potential: 'Variable, from $0-$10,000+ per month with large audience',
    time_commitment: 'Medium to high, requires consistent content production'
  },
  {
    id: 'digital_products',
    name: 'Digital Products',
    description: 'Create and sell e-books, courses, templates, or digital art',
    platforms: [
      {
        name: 'Gumroad',
        url: 'https://gumroad.com',
        description: 'Simple platform to sell digital products directly to customers'
      },
      {
        name: 'Teachable',
        url: 'https://teachable.com',
        description: 'Create and sell online courses with your own branding'
      },
      {
        name: 'Etsy',
        url: 'https://www.etsy.com',
        description: 'Marketplace for digital downloads, printables, and templates'
      },
      {
        name: 'Creative Market',
        url: 'https://creativemarket.com',
        description: 'Sell design assets, fonts, templates, and graphics'
      }
    ],
    skills: ['Design', 'Teaching', 'Writing', 'Subject Expertise'],
    beginner_friendly: true,
    income_potential: 'Scalable, from a few hundred to $10,000+ monthly with popular products',
    time_commitment: 'High upfront work, lower maintenance after creation'
  },
  {
    id: 'local_services',
    name: 'Local Services',
    description: 'Offer services in your community like tutoring or handyman work',
    platforms: [
      {
        name: 'TaskRabbit',
        url: 'https://www.taskrabbit.com',
        description: 'Connect with people in your area who need help with tasks'
      },
      {
        name: 'Thumbtack',
        url: 'https://www.thumbtack.com',
        description: 'Find local customers for your service business'
      },
      {
        name: 'Care.com',
        url: 'https://www.care.com',
        description: 'Offer childcare, senior care, pet care, and housekeeping'
      },
      {
        name: 'Nextdoor',
        url: 'https://nextdoor.com',
        description: 'Connect with neighbors who need local services'
      }
    ],
    skills: ['Home Repair', 'Tutoring', 'Pet Care', 'Cleaning', 'Yard Work'],
    beginner_friendly: true,
    income_potential: '$15-$75+ per hour depending on service type',
    time_commitment: 'Flexible, can be evenings and weekends'
  },
  {
    id: 'used_gear',
    name: 'Sell Used Gear',
    description: 'Resell items you no longer need or buy and flip items for profit',
    platforms: [
      {
        name: 'eBay',
        url: 'https://www.ebay.com',
        description: 'The largest online marketplace for used items'
      },
      {
        name: 'Facebook Marketplace',
        url: 'https://www.facebook.com/marketplace',
        description: 'Local buying and selling with no fees'
      },
      {
        name: 'Reverb',
        url: 'https://reverb.com',
        description: 'Specialized marketplace for musical instruments and gear'
      },
      {
        name: 'Poshmark',
        url: 'https://poshmark.com',
        description: 'Social marketplace for fashion items'
      }
    ],
    skills: ['Product Knowledge', 'Photography', 'Negotiation', 'Customer Service'],
    beginner_friendly: true,
    income_potential: 'Variable, from pocket money to $1000s monthly for serious flippers',
    time_commitment: 'Flexible, scales with inventory and sales volume'
  }
];

// Gig economy tips and resources
export const gigResources = [
  {
    title: 'Getting Started Guide',
    description: 'How to pick the right gig economy platform for your skills',
    type: 'guide',
    difficulty: 'beginner'
  },
  {
    title: 'Setting Your Rates',
    description: 'How to price your services competitively while maintaining your value',
    type: 'strategy',
    difficulty: 'beginner'
  },
  {
    title: 'Building Your Profile',
    description: 'Tips for creating a standout profile that attracts clients',
    type: 'guide',
    difficulty: 'beginner'
  },
  {
    title: 'Getting Your First Clients',
    description: 'Strategies to land your first few jobs and build reviews',
    type: 'strategy',
    difficulty: 'beginner'
  },
  {
    title: 'Time Management for Gig Workers',
    description: 'How to balance multiple gigs and maintain productivity',
    type: 'productivity',
    difficulty: 'intermediate'
  },
  {
    title: 'Tax Considerations for Independent Contractors',
    description: 'Understanding your tax obligations as a gig worker',
    type: 'legal',
    difficulty: 'intermediate'
  }
];

// Helper function to get a specific gig category by ID
export function getGigCategoryById(id) {
  return gigCategories.find(category => category.id === id);
}

// Helper function to search gig categories
export function searchGigCategories(query) {
  const searchText = query.toLowerCase();
  return gigCategories.filter(category => 
    category.name.toLowerCase().includes(searchText) || 
    category.description.toLowerCase().includes(searchText) ||
    category.skills.some(skill => skill.toLowerCase().includes(searchText))
  );
}

// Helper function to get resources by difficulty level
export function getResourcesByDifficulty(level) {
  return gigResources.filter(resource => resource.difficulty === level);
}