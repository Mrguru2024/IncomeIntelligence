/**
 * Affiliate Program Hub for Stackr Finance GREEN Edition
 * This component renders a dashboard for managing affiliate programs
 */

import { hasProAccess, createUpgradePrompt } from './utils/subscription-utils.js';
import { affiliatePrograms, affiliateResources, getProgramsByCategory, getBeginnerFriendlyPrograms, searchPrograms } from './affiliates.js';

/**
 * Fetch user's affiliate program data
 * @param {number} userId - Current user ID
 * @returns {Promise<Array>} - User's affiliate program data
 */
async function fetchUserAffiliateData(userId) {
  try {
    // In a real application, this would fetch data from an API
    // For the GREEN version, we're using localStorage
    const storedData = localStorage.getItem(`user_${userId}_affiliates`);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // If no data exists, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return [];
  }
}

/**
 * Join an affiliate program
 * @param {number} userId - User ID
 * @param {string} programId - Affiliate program ID
 * @returns {Promise<Object>} - Result of joining
 */
async function joinAffiliateProgram(userId, programId) {
  try {
    // Get the program details
    const program = affiliatePrograms.find(p => p.id === programId);
    if (!program) {
      throw new Error('Program not found');
    }
    
    // Get existing user affiliates
    const userAffiliates = await fetchUserAffiliateData(userId);
    
    // Check if already joined
    if (userAffiliates.some(a => a.programId === programId)) {
      return { success: false, message: 'Already joined this program' };
    }
    
    // Create new affiliate entry
    const newAffiliate = {
      programId,
      programName: program.name,
      joinedDate: new Date().toISOString(),
      referrals: 0,
      earnings: 0,
      status: 'active',
      notes: '',
      category: program.category
    };
    
    // Add to user's affiliates
    userAffiliates.push(newAffiliate);
    
    // Save updated data
    localStorage.setItem(`user_${userId}_affiliates`, JSON.stringify(userAffiliates));
    
    return { success: true, affiliate: newAffiliate };
  } catch (error) {
    console.error('Error joining affiliate program:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Create an affiliate program card
 * @param {Object} program - Program data
 * @param {boolean} isJoined - Whether user has joined
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Card element
 */
function createProgramCard(program, isJoined, userId) {
  const card = document.createElement('div');
  card.className = 'affiliate-program-card';
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '10px';
  card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
  card.style.overflow = 'hidden';
  card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  card.style.cursor = 'pointer';
  
  // Hover effects
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
  });
  
  // Badge for beginner-friendly programs
  if (program.beginnerFriendly) {
    const badge = document.createElement('div');
    badge.className = 'beginner-badge';
    badge.textContent = 'Beginner Friendly';
    badge.style.position = 'absolute';
    badge.style.top = '12px';
    badge.style.right = '12px';
    badge.style.backgroundColor = '#34A853';
    badge.style.color = 'white';
    badge.style.fontSize = '12px';
    badge.style.padding = '4px 8px';
    badge.style.borderRadius = '4px';
    badge.style.fontWeight = '500';
    card.appendChild(badge);
  }
  
  // Card content
  const content = document.createElement('div');
  content.style.padding = '20px';
  content.style.position = 'relative';
  
  // Program name
  const name = document.createElement('h3');
  name.textContent = program.name;
  name.style.fontSize = '18px';
  name.style.fontWeight = '600';
  name.style.marginBottom = '8px';
  name.style.color = '#333';
  content.appendChild(name);
  
  // Category tag
  const categoryTag = document.createElement('span');
  categoryTag.textContent = program.category.charAt(0).toUpperCase() + program.category.slice(1);
  categoryTag.style.fontSize = '12px';
  categoryTag.style.backgroundColor = '#F0F4F8';
  categoryTag.style.color = '#4A5568';
  categoryTag.style.padding = '3px 8px';
  categoryTag.style.borderRadius = '4px';
  categoryTag.style.marginBottom = '10px';
  categoryTag.style.display = 'inline-block';
  content.appendChild(categoryTag);
  
  // Description
  const description = document.createElement('p');
  description.textContent = program.description;
  description.style.fontSize = '14px';
  description.style.color = '#4A5568';
  description.style.marginTop = '12px';
  description.style.marginBottom = '15px';
  description.style.lineHeight = '1.5';
  content.appendChild(description);
  
  // Commission info
  const commissionContainer = document.createElement('div');
  commissionContainer.style.display = 'flex';
  commissionContainer.style.alignItems = 'center';
  commissionContainer.style.marginBottom = '8px';
  
  const commissionLabel = document.createElement('span');
  commissionLabel.textContent = 'Commission:';
  commissionLabel.style.fontSize = '13px';
  commissionLabel.style.fontWeight = '500';
  commissionLabel.style.color = '#4A5568';
  commissionLabel.style.marginRight = '8px';
  commissionContainer.appendChild(commissionLabel);
  
  const commissionValue = document.createElement('span');
  commissionValue.textContent = program.commission;
  commissionValue.style.fontSize = '14px';
  commissionValue.style.fontWeight = '600';
  commissionValue.style.color = '#2C5282';
  commissionContainer.appendChild(commissionValue);
  
  content.appendChild(commissionContainer);
  
  // Cookie duration
  const cookieContainer = document.createElement('div');
  cookieContainer.style.display = 'flex';
  cookieContainer.style.alignItems = 'center';
  cookieContainer.style.marginBottom = '15px';
  
  const cookieLabel = document.createElement('span');
  cookieLabel.textContent = 'Cookie Duration:';
  cookieLabel.style.fontSize = '13px';
  cookieLabel.style.fontWeight = '500';
  cookieLabel.style.color = '#4A5568';
  cookieLabel.style.marginRight = '8px';
  cookieContainer.appendChild(cookieLabel);
  
  const cookieValue = document.createElement('span');
  cookieValue.textContent = program.cookieDuration;
  cookieValue.style.fontSize = '14px';
  cookieValue.style.color = '#4A5568';
  cookieContainer.appendChild(cookieValue);
  
  content.appendChild(cookieContainer);
  
  // Action button (Join or View)
  const actionBtn = document.createElement('button');
  
  if (isJoined) {
    actionBtn.textContent = 'View Details';
    actionBtn.style.backgroundColor = '#F0F4F8';
    actionBtn.style.color = '#2C5282';
  } else {
    actionBtn.textContent = 'Join Program';
    actionBtn.style.backgroundColor = '#4299E1';
    actionBtn.style.color = 'white';
  }
  
  actionBtn.style.width = '100%';
  actionBtn.style.padding = '10px';
  actionBtn.style.borderRadius = '6px';
  actionBtn.style.border = 'none';
  actionBtn.style.fontWeight = '500';
  actionBtn.style.cursor = 'pointer';
  actionBtn.style.transition = 'background-color 0.2s ease';
  
  actionBtn.addEventListener('mouseenter', () => {
    if (isJoined) {
      actionBtn.style.backgroundColor = '#E2E8F0';
    } else {
      actionBtn.style.backgroundColor = '#3182CE';
    }
  });
  
  actionBtn.addEventListener('mouseleave', () => {
    if (isJoined) {
      actionBtn.style.backgroundColor = '#F0F4F8';
    } else {
      actionBtn.style.backgroundColor = '#4299E1';
    }
  });
  
  actionBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (isJoined) {
      // Open program details or dashboard
      alert(`View your ${program.name} affiliate dashboard`);
    } else {
      // Join the program
      actionBtn.textContent = 'Joining...';
      actionBtn.disabled = true;
      
      const result = await joinAffiliateProgram(userId, program.id);
      
      if (result.success) {
        actionBtn.textContent = 'Joined!';
        actionBtn.style.backgroundColor = '#48BB78';
        
        // Update UI after joining
        setTimeout(() => {
          actionBtn.textContent = 'View Details';
          actionBtn.style.backgroundColor = '#F0F4F8';
          actionBtn.style.color = '#2C5282';
          isJoined = true;
          
          // Refresh the programs list
          updateProgramsList(userId);
        }, 1500);
      } else {
        actionBtn.textContent = 'Error';
        actionBtn.style.backgroundColor = '#F56565';
        
        setTimeout(() => {
          actionBtn.textContent = 'Join Program';
          actionBtn.style.backgroundColor = '#4299E1';
          actionBtn.disabled = false;
        }, 2000);
      }
    }
  });
  
  content.appendChild(actionBtn);
  
  // Visit website link
  const visitLink = document.createElement('a');
  visitLink.textContent = 'Visit Website';
  visitLink.href = program.link;
  visitLink.target = '_blank';
  visitLink.rel = 'noopener noreferrer';
  visitLink.style.fontSize = '14px';
  visitLink.style.color = '#4299E1';
  visitLink.style.textAlign = 'center';
  visitLink.style.display = 'block';
  visitLink.style.marginTop = '10px';
  visitLink.style.textDecoration = 'none';
  
  visitLink.addEventListener('mouseenter', () => {
    visitLink.style.textDecoration = 'underline';
  });
  
  visitLink.addEventListener('mouseleave', () => {
    visitLink.style.textDecoration = 'none';
  });
  
  // Prevent card click when clicking the link
  visitLink.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  content.appendChild(visitLink);
  card.appendChild(content);
  
  // Make entire card clickable to open detailed view
  card.addEventListener('click', () => {
    // Show detailed modal with program info
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '700px';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.position = 'relative';
    modalContent.style.padding = '30px';
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '15px';
    closeBtn.style.right = '20px';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#4A5568';
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modalContent.appendChild(closeBtn);
    
    // Program name
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = program.name;
    modalTitle.style.fontSize = '24px';
    modalTitle.style.fontWeight = '700';
    modalTitle.style.marginBottom = '5px';
    modalContent.appendChild(modalTitle);
    
    // Category
    const modalCategory = document.createElement('div');
    modalCategory.textContent = program.category.charAt(0).toUpperCase() + program.category.slice(1);
    modalCategory.style.fontSize = '14px';
    modalCategory.style.display = 'inline-block';
    modalCategory.style.backgroundColor = '#F0F4F8';
    modalCategory.style.color = '#4A5568';
    modalCategory.style.padding = '3px 10px';
    modalCategory.style.borderRadius = '4px';
    modalCategory.style.marginBottom = '20px';
    modalContent.appendChild(modalCategory);
    
    // Description
    const modalDesc = document.createElement('p');
    modalDesc.textContent = program.description;
    modalDesc.style.fontSize = '16px';
    modalDesc.style.lineHeight = '1.6';
    modalDesc.style.marginBottom = '25px';
    modalContent.appendChild(modalDesc);
    
    // Details section
    const detailsSection = document.createElement('div');
    detailsSection.style.backgroundColor = '#F8FAFC';
    detailsSection.style.borderRadius = '8px';
    detailsSection.style.padding = '20px';
    detailsSection.style.marginBottom = '25px';
    
    const detailsTitle = document.createElement('h3');
    detailsTitle.textContent = 'Program Details';
    detailsTitle.style.fontSize = '18px';
    detailsTitle.style.fontWeight = '600';
    detailsTitle.style.marginBottom = '15px';
    detailsSection.appendChild(detailsTitle);
    
    // Create detail rows
    const details = [
      { label: 'Commission', value: program.commission },
      { label: 'Cookie Duration', value: program.cookieDuration },
      { label: 'Payment Threshold', value: program.paymentThreshold },
      { label: 'Payment Methods', value: program.paymentMethods.join(', ') },
      { label: 'Application Process', value: program.applicationProcess },
      { label: 'Beginner Friendly', value: program.beginnerFriendly ? 'Yes' : 'No' }
    ];
    
    details.forEach(detail => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.marginBottom = '10px';
      
      const label = document.createElement('div');
      label.textContent = detail.label + ':';
      label.style.width = '40%';
      label.style.fontWeight = '500';
      label.style.color = '#4A5568';
      row.appendChild(label);
      
      const value = document.createElement('div');
      value.textContent = detail.value;
      value.style.width = '60%';
      row.appendChild(value);
      
      detailsSection.appendChild(row);
    });
    
    modalContent.appendChild(detailsSection);
    
    // Requirements section
    if (program.requirements && program.requirements.length) {
      const reqSection = document.createElement('div');
      reqSection.style.marginBottom = '25px';
      
      const reqTitle = document.createElement('h3');
      reqTitle.textContent = 'Requirements';
      reqTitle.style.fontSize = '18px';
      reqTitle.style.fontWeight = '600';
      reqTitle.style.marginBottom = '10px';
      reqSection.appendChild(reqTitle);
      
      const reqList = document.createElement('ul');
      reqList.style.paddingLeft = '20px';
      
      program.requirements.forEach(req => {
        const item = document.createElement('li');
        item.textContent = req;
        item.style.marginBottom = '8px';
        item.style.fontSize = '15px';
        reqList.appendChild(item);
      });
      
      reqSection.appendChild(reqList);
      modalContent.appendChild(reqSection);
    }
    
    // Tips section
    if (program.tips && program.tips.length) {
      const tipsSection = document.createElement('div');
      tipsSection.style.marginBottom = '25px';
      
      const tipsTitle = document.createElement('h3');
      tipsTitle.textContent = 'Tips for Success';
      tipsTitle.style.fontSize = '18px';
      tipsTitle.style.fontWeight = '600';
      tipsTitle.style.marginBottom = '10px';
      tipsSection.appendChild(tipsTitle);
      
      const tipsList = document.createElement('ul');
      tipsList.style.paddingLeft = '20px';
      
      program.tips.forEach(tip => {
        const item = document.createElement('li');
        item.textContent = tip;
        item.style.marginBottom = '8px';
        item.style.fontSize = '15px';
        tipsList.appendChild(item);
      });
      
      tipsSection.appendChild(tipsList);
      modalContent.appendChild(tipsSection);
    }
    
    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.display = 'flex';
    actionButtons.style.gap = '15px';
    actionButtons.style.marginTop = '20px';
    
    const primaryBtn = document.createElement('button');
    if (isJoined) {
      primaryBtn.textContent = 'Go to Dashboard';
    } else {
      primaryBtn.textContent = 'Join Program';
    }
    primaryBtn.style.flex = '1';
    primaryBtn.style.padding = '12px';
    primaryBtn.style.backgroundColor = isJoined ? '#48BB78' : '#4299E1';
    primaryBtn.style.color = 'white';
    primaryBtn.style.border = 'none';
    primaryBtn.style.borderRadius = '6px';
    primaryBtn.style.fontWeight = '500';
    primaryBtn.style.cursor = 'pointer';
    
    primaryBtn.addEventListener('click', async () => {
      if (isJoined) {
        alert(`View your ${program.name} affiliate dashboard`);
      } else {
        primaryBtn.textContent = 'Joining...';
        primaryBtn.disabled = true;
        
        const result = await joinAffiliateProgram(userId, program.id);
        
        if (result.success) {
          primaryBtn.textContent = 'Joined!';
          primaryBtn.style.backgroundColor = '#48BB78';
          
          // Update UI after joining
          setTimeout(() => {
            primaryBtn.textContent = 'Go to Dashboard';
            isJoined = true;
            
            // Refresh the programs list
            updateProgramsList(userId);
          }, 1500);
        } else {
          primaryBtn.textContent = 'Error';
          primaryBtn.style.backgroundColor = '#F56565';
          
          setTimeout(() => {
            primaryBtn.textContent = 'Join Program';
            primaryBtn.style.backgroundColor = '#4299E1';
            primaryBtn.disabled = false;
          }, 2000);
        }
      }
    });
    
    actionButtons.appendChild(primaryBtn);
    
    const websiteBtn = document.createElement('a');
    websiteBtn.textContent = 'Visit Website';
    websiteBtn.href = program.link;
    websiteBtn.target = '_blank';
    websiteBtn.rel = 'noopener noreferrer';
    websiteBtn.style.flex = '1';
    websiteBtn.style.padding = '12px';
    websiteBtn.style.backgroundColor = 'white';
    websiteBtn.style.color = '#4299E1';
    websiteBtn.style.border = '1px solid #4299E1';
    websiteBtn.style.borderRadius = '6px';
    websiteBtn.style.textAlign = 'center';
    websiteBtn.style.fontWeight = '500';
    websiteBtn.style.textDecoration = 'none';
    websiteBtn.style.display = 'inline-block';
    
    actionButtons.appendChild(websiteBtn);
    modalContent.appendChild(actionButtons);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  });
  
  return card;
}

/**
 * Create resource card
 * @param {Object} resource - Resource data
 * @returns {HTMLElement} - Card element
 */
function createResourceCard(resource) {
  const card = document.createElement('div');
  card.className = 'affiliate-resource-card';
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
  card.style.overflow = 'hidden';
  card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  card.style.cursor = 'pointer';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.height = '100%';
  
  // Hover effects
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-3px)';
    card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
  });
  
  // Card content
  const content = document.createElement('div');
  content.style.padding = '20px';
  content.style.flex = '1';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  
  // Featured badge
  if (resource.featured) {
    const featuredBadge = document.createElement('div');
    featuredBadge.textContent = 'Featured';
    featuredBadge.style.position = 'absolute';
    featuredBadge.style.top = '10px';
    featuredBadge.style.right = '10px';
    featuredBadge.style.backgroundColor = '#F6AD55';
    featuredBadge.style.color = 'white';
    featuredBadge.style.fontSize = '12px';
    featuredBadge.style.padding = '3px 8px';
    featuredBadge.style.borderRadius = '4px';
    featuredBadge.style.fontWeight = '500';
    card.appendChild(featuredBadge);
  }
  
  // Resource type tag
  const typeTag = document.createElement('span');
  typeTag.textContent = resource.type.charAt(0).toUpperCase() + resource.type.slice(1);
  typeTag.style.fontSize = '12px';
  typeTag.style.backgroundColor = '#F0F4F8';
  typeTag.style.color = '#4A5568';
  typeTag.style.padding = '3px 8px';
  typeTag.style.borderRadius = '4px';
  typeTag.style.display = 'inline-block';
  typeTag.style.marginBottom = '10px';
  content.appendChild(typeTag);
  
  // Resource title
  const title = document.createElement('h3');
  title.textContent = resource.title;
  title.style.fontSize = '16px';
  title.style.fontWeight = '600';
  title.style.marginBottom = '10px';
  title.style.color = '#333';
  content.appendChild(title);
  
  // Resource description
  const description = document.createElement('p');
  description.textContent = resource.description;
  description.style.fontSize = '14px';
  description.style.color = '#4A5568';
  description.style.marginBottom = 'auto';
  description.style.flex = '1';
  description.style.lineHeight = '1.5';
  content.appendChild(description);
  
  // View resource link
  const viewLink = document.createElement('a');
  viewLink.textContent = 'View Resource';
  viewLink.href = resource.link;
  viewLink.target = '_blank';
  viewLink.rel = 'noopener noreferrer';
  viewLink.style.display = 'inline-block';
  viewLink.style.marginTop = '15px';
  viewLink.style.color = '#4299E1';
  viewLink.style.fontWeight = '500';
  viewLink.style.textDecoration = 'none';
  
  viewLink.addEventListener('mouseenter', () => {
    viewLink.style.textDecoration = 'underline';
  });
  
  viewLink.addEventListener('mouseleave', () => {
    viewLink.style.textDecoration = 'none';
  });
  
  // Prevent card click when clicking the link
  viewLink.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  content.appendChild(viewLink);
  card.appendChild(content);
  
  // Make card clickable
  card.addEventListener('click', () => {
    window.open(resource.link, '_blank', 'noopener,noreferrer');
  });
  
  return card;
}

/**
 * Create category tabs
 * @param {Array} categories - List of categories
 * @param {string} activeCategory - Current active category
 * @param {Function} onSelect - Category selection callback
 * @returns {HTMLElement} - Tabs container
 */
function createCategoryTabs(categories, activeCategory, onSelect) {
  const container = document.createElement('div');
  container.className = 'category-tabs';
  container.style.display = 'flex';
  container.style.overflowX = 'auto';
  container.style.gap = '10px';
  container.style.padding = '4px';
  container.style.marginBottom = '25px';
  
  categories.forEach(category => {
    const tab = document.createElement('button');
    tab.textContent = category.label;
    tab.style.padding = '8px 16px';
    tab.style.borderRadius = '6px';
    tab.style.border = 'none';
    tab.style.cursor = 'pointer';
    tab.style.whiteSpace = 'nowrap';
    tab.style.transition = 'all 0.2s ease';
    
    // Set active state
    if (category.value === activeCategory) {
      tab.style.backgroundColor = '#4299E1';
      tab.style.color = 'white';
      tab.style.fontWeight = '500';
    } else {
      tab.style.backgroundColor = '#EDF2F7';
      tab.style.color = '#4A5568';
    }
    
    // Hover effects
    tab.addEventListener('mouseenter', () => {
      if (category.value !== activeCategory) {
        tab.style.backgroundColor = '#E2E8F0';
      }
    });
    
    tab.addEventListener('mouseleave', () => {
      if (category.value !== activeCategory) {
        tab.style.backgroundColor = '#EDF2F7';
      }
    });
    
    // Click handler
    tab.addEventListener('click', () => {
      onSelect(category.value);
    });
    
    container.appendChild(tab);
  });
  
  return container;
}

/**
 * Create search bar
 * @param {Function} onSearch - Search callback
 * @returns {HTMLElement} - Search form
 */
function createSearchBar(onSearch) {
  const container = document.createElement('div');
  container.className = 'search-container';
  container.style.marginBottom = '25px';
  
  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.gap = '10px';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Search affiliate programs...';
  input.style.flex = '1';
  input.style.padding = '10px 16px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid #CBD5E0';
  input.style.fontSize = '14px';
  input.style.outline = 'none';
  
  input.addEventListener('focus', () => {
    input.style.borderColor = '#4299E1';
    input.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.2)';
  });
  
  input.addEventListener('blur', () => {
    input.style.borderColor = '#CBD5E0';
    input.style.boxShadow = 'none';
  });
  
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Search';
  button.style.padding = '10px 16px';
  button.style.backgroundColor = '#4299E1';
  button.style.color = 'white';
  button.style.borderRadius = '6px';
  button.style.border = 'none';
  button.style.fontWeight = '500';
  button.style.cursor = 'pointer';
  
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#3182CE';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#4299E1';
  });
  
  form.appendChild(input);
  form.appendChild(button);
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onSearch(input.value);
  });
  
  container.appendChild(form);
  return container;
}

/**
 * Render the affiliate programs section
 * @param {Array} programs - List of programs to display
 * @param {Array} userAffiliates - User's joined programs
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Programs container
 */
function renderProgramsList(programs, userAffiliates, userId) {
  const container = document.createElement('div');
  container.className = 'programs-container';
  
  // No results state
  if (programs.length === 0) {
    const noResults = document.createElement('div');
    noResults.style.textAlign = 'center';
    noResults.style.padding = '50px 0';
    
    const icon = document.createElement('div');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
    icon.style.color = '#A0AEC0';
    icon.style.marginBottom = '16px';
    noResults.appendChild(icon);
    
    const message = document.createElement('h3');
    message.textContent = 'No programs found';
    message.style.fontSize = '18px';
    message.style.fontWeight = '600';
    message.style.marginBottom = '8px';
    message.style.color = '#4A5568';
    noResults.appendChild(message);
    
    const subMessage = document.createElement('p');
    subMessage.textContent = 'Try adjusting your search or filter criteria';
    subMessage.style.fontSize = '16px';
    subMessage.style.color = '#718096';
    noResults.appendChild(subMessage);
    
    container.appendChild(noResults);
    return container;
  }
  
  // Program grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  grid.style.gap = '20px';
  
  // Create a card for each program
  programs.forEach(program => {
    // Check if user has joined this program
    const isJoined = userAffiliates.some(a => a.programId === program.id);
    
    // Create program card
    const card = createProgramCard(program, isJoined, userId);
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
  return container;
}

/**
 * Render the affiliate resources section
 * @param {Array} resources - List of resources
 * @returns {HTMLElement} - Resources container
 */
function renderResourcesList(resources) {
  const container = document.createElement('div');
  container.className = 'resources-container';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Affiliate Marketing Resources';
  heading.style.fontSize = '22px';
  heading.style.fontWeight = '600';
  heading.style.marginBottom = '20px';
  heading.style.marginTop = '40px';
  container.appendChild(heading);
  
  // Resources grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
  grid.style.gap = '20px';
  
  // Create a card for each resource
  resources.forEach(resource => {
    const card = createResourceCard(resource);
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
  return container;
}

/**
 * Render metrics card showing affiliate performance
 * @param {Array} userAffiliates - User's affiliates data 
 * @returns {HTMLElement} - Metrics card
 */
function renderMetricsCard(userAffiliates) {
  const container = document.createElement('div');
  container.className = 'metrics-card';
  container.style.backgroundColor = 'white';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
  container.style.padding = '24px';
  container.style.marginBottom = '30px';
  
  // Metrics header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '20px';
  
  const title = document.createElement('h3');
  title.textContent = 'Your Affiliate Performance';
  title.style.fontSize = '18px';
  title.style.fontWeight = '600';
  title.style.margin = '0';
  header.appendChild(title);
  
  const periodSelector = document.createElement('select');
  periodSelector.style.padding = '6px 10px';
  periodSelector.style.borderRadius = '4px';
  periodSelector.style.border = '1px solid #CBD5E0';
  periodSelector.style.fontSize = '14px';
  
  const periods = ['This Month', 'Last Month', 'Last 3 Months', 'This Year', 'All Time'];
  periods.forEach(period => {
    const option = document.createElement('option');
    option.value = period.toLowerCase().replace(/\s/g, '_');
    option.textContent = period;
    periodSelector.appendChild(option);
  });
  
  header.appendChild(periodSelector);
  container.appendChild(header);
  
  // Metrics grid
  const metricsGrid = document.createElement('div');
  metricsGrid.style.display = 'grid';
  metricsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  metricsGrid.style.gap = '20px';
  
  // Calculate metrics
  const totalPrograms = userAffiliates.length;
  const totalReferrals = userAffiliates.reduce((sum, affiliate) => sum + affiliate.referrals, 0);
  const totalEarnings = userAffiliates.reduce((sum, affiliate) => sum + affiliate.earnings, 0);
  
  // Create metric items
  const metrics = [
    {
      label: 'Programs Joined',
      value: totalPrograms,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      color: '#4299E1'
    },
    {
      label: 'Total Referrals',
      value: totalReferrals,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
      color: '#48BB78'
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      color: '#F6AD55'
    }
  ];
  
  metrics.forEach(metric => {
    const metricItem = document.createElement('div');
    metricItem.style.backgroundColor = '#F7FAFC';
    metricItem.style.borderRadius = '8px';
    metricItem.style.padding = '16px';
    
    const metricIcon = document.createElement('div');
    metricIcon.innerHTML = metric.icon;
    metricIcon.style.color = metric.color;
    metricIcon.style.marginBottom = '10px';
    metricItem.appendChild(metricIcon);
    
    const metricValue = document.createElement('div');
    metricValue.textContent = metric.value;
    metricValue.style.fontSize = '24px';
    metricValue.style.fontWeight = '700';
    metricValue.style.marginBottom = '8px';
    metricItem.appendChild(metricValue);
    
    const metricLabel = document.createElement('div');
    metricLabel.textContent = metric.label;
    metricLabel.style.fontSize = '14px';
    metricLabel.style.color = '#718096';
    metricItem.appendChild(metricLabel);
    
    metricsGrid.appendChild(metricItem);
  });
  
  container.appendChild(metricsGrid);
  
  // Join your first program message (if no programs joined)
  if (totalPrograms === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '20px';
    emptyState.style.marginTop = '20px';
    emptyState.style.backgroundColor = '#F7FAFC';
    emptyState.style.borderRadius = '8px';
    
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Join your first affiliate program to start tracking your performance.';
    emptyMessage.style.color = '#718096';
    emptyMessage.style.margin = '0';
    
    emptyState.appendChild(emptyMessage);
    container.appendChild(emptyState);
  }
  
  return container;
}

/**
 * Render the affiliate hub page
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Page container
 */
export function renderAffiliateHub(userId) {
  const container = document.createElement('div');
  container.className = 'affiliate-hub-container';
  container.style.maxWidth = '1280px';
  container.style.margin = '0 auto';
  container.style.padding = '20px';
  
  // Check if user has Pro access for this feature
  const appState = window.appState || { user: {} };
  if (!hasProAccess(appState.user)) {
    return createUpgradePrompt('Affiliate Program Hub');
  }
  
  // Page header
  const header = document.createElement('div');
  header.style.marginBottom = '30px';
  
  const pageTitle = document.createElement('h1');
  pageTitle.textContent = 'Affiliate Program Hub';
  pageTitle.style.fontSize = '28px';
  pageTitle.style.fontWeight = '700';
  pageTitle.style.marginBottom = '10px';
  header.appendChild(pageTitle);
  
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'Find and join affiliate programs to generate additional income streams.';
  pageDescription.style.fontSize = '16px';
  pageDescription.style.color = '#4A5568';
  pageDescription.style.maxWidth = '750px';
  header.appendChild(pageDescription);
  
  container.appendChild(header);
  
  // State variables
  let activeCategory = 'all';
  let userAffiliates = [];
  let filteredPrograms = affiliatePrograms;
  let searchQuery = '';
  
  // Fetch user's affiliate data
  fetchUserAffiliateData(userId).then(data => {
    userAffiliates = data;
    
    // Render performance metrics
    const metricsCard = renderMetricsCard(userAffiliates);
    container.appendChild(metricsCard);
    
    // Render the program list
    updateProgramsList(userId);
  });
  
  // Programs section
  const programsSection = document.createElement('div');
  programsSection.style.marginBottom = '40px';
  
  // Category tabs
  const categories = [
    { label: 'All Programs', value: 'all' },
    { label: 'E-commerce', value: 'ecommerce' },
    { label: 'Finance', value: 'finance' },
    { label: 'Hosting', value: 'hosting' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Education', value: 'education' },
    { label: 'Productivity', value: 'productivity' },
    { label: 'Beginner Friendly', value: 'beginner' }
  ];
  
  const onCategorySelect = (category) => {
    activeCategory = category;
    
    // Update filtered programs
    if (category === 'beginner') {
      filteredPrograms = getBeginnerFriendlyPrograms();
    } else {
      filteredPrograms = getProgramsByCategory(category);
    }
    
    // If there's a search query, apply it
    if (searchQuery) {
      filteredPrograms = filteredPrograms.filter(program => 
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Update the UI
    updateProgramsList(userId);
  };
  
  const categoryTabs = createCategoryTabs(categories, activeCategory, onCategorySelect);
  programsSection.appendChild(categoryTabs);
  
  // Search bar
  const onSearch = (query) => {
    searchQuery = query;
    
    // Apply category filter first
    if (activeCategory === 'beginner') {
      filteredPrograms = getBeginnerFriendlyPrograms();
    } else {
      filteredPrograms = getProgramsByCategory(activeCategory);
    }
    
    // Then apply search filter if there's a query
    if (query) {
      filteredPrograms = searchPrograms(query).filter(program => {
        // Apply category filter if not on 'all'
        return (activeCategory === 'all' || 
                (activeCategory === 'beginner' && program.beginnerFriendly) || 
                program.category === activeCategory);
      });
    }
    
    // Update the UI
    updateProgramsList(userId);
  };
  
  const searchBar = createSearchBar(onSearch);
  programsSection.appendChild(searchBar);
  
  // Programs list container (will be populated)
  const programsListContainer = document.createElement('div');
  programsListContainer.id = 'programs-list-container';
  programsSection.appendChild(programsListContainer);
  
  container.appendChild(programsSection);
  
  // Resources section
  const resourcesList = renderResourcesList(affiliateResources);
  container.appendChild(resourcesList);
  
  // Function to update the programs list
  function updateProgramsList(userId) {
    // Fetch latest user affiliate data
    fetchUserAffiliateData(userId).then(data => {
      userAffiliates = data;
      
      // Render the programs list
      const programsList = renderProgramsList(filteredPrograms, userAffiliates, userId);
      
      // Replace the old list with the new one
      const oldList = document.getElementById('programs-list-container');
      if (oldList) {
        oldList.innerHTML = '';
        oldList.appendChild(programsList);
      }
    });
  }
  
  return container;
}