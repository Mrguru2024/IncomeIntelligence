/**
 * Service Agreement Component
 * Provides service and privacy agreements for the financial mentorship platform
 */

/**
 * Show the service agreement modal
 * @param {string} agreementType - Type of agreement ('mentor', 'user', 'privacy')
 * @param {Function} onAccept - Callback function when agreement is accepted
 */
function showAgreementModal(agreementType, onAccept) {
  // Create modal container
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '9999';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.width = '90%';
  modal.style.maxWidth = '800px';
  modal.style.maxHeight = '90vh';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '1.5rem';
  header.style.borderBottom = '1px solid #e5e7eb';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  
  const title = document.createElement('h3');
  
  // Set title based on agreement type
  switch (agreementType) {
    case 'mentor':
      title.textContent = 'Mentor Service Agreement';
      break;
    case 'user':
      title.textContent = 'User Service Agreement';
      break;
    case 'privacy':
      title.textContent = 'Privacy Policy';
      break;
    default:
      title.textContent = 'Service Agreement';
  }
  
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#6b7280';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal content
  const content = document.createElement('div');
  content.style.padding = '1.5rem';
  content.style.overflowY = 'auto';
  content.style.flex = '1';
  
  // Get agreement text based on type
  content.innerHTML = getAgreementText(agreementType);
  
  // Modal footer
  const footer = document.createElement('div');
  footer.style.padding = '1.5rem';
  footer.style.borderTop = '1px solid #e5e7eb';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.backgroundColor = 'transparent';
  cancelButton.style.color = '#6b7280';
  cancelButton.style.border = '1px solid #e5e7eb';
  cancelButton.style.borderRadius = '6px';
  cancelButton.style.padding = '0.75rem 1.5rem';
  cancelButton.style.fontWeight = '500';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  const acceptButton = document.createElement('button');
  acceptButton.textContent = 'I Accept';
  acceptButton.style.backgroundColor = '#4F46E5';
  acceptButton.style.color = 'white';
  acceptButton.style.border = 'none';
  acceptButton.style.borderRadius = '6px';
  acceptButton.style.padding = '0.75rem 1.5rem';
  acceptButton.style.fontWeight = 'bold';
  acceptButton.style.cursor = 'pointer';
  
  acceptButton.addEventListener('click', () => {
    if (onAccept && typeof onAccept === 'function') {
      onAccept();
    }
    document.body.removeChild(modalOverlay);
  });
  
  footer.appendChild(cancelButton);
  footer.appendChild(acceptButton);
  
  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(footer);
  modalOverlay.appendChild(modal);
  
  document.body.appendChild(modalOverlay);
}

/**
 * Get agreement text based on type
 * @param {string} agreementType - Type of agreement
 * @returns {string} HTML content for the agreement
 */
function getAgreementText(agreementType) {
  switch (agreementType) {
    case 'mentor':
      return getMentorAgreementText();
    case 'user':
      return getUserAgreementText();
    case 'privacy':
      return getPrivacyPolicyText();
    default:
      return '<p>Agreement text not found.</p>';
  }
}

/**
 * Get mentor service agreement text
 * @returns {string} HTML content for mentor service agreement
 */
function getMentorAgreementText() {
  return `
    <h4 style="font-size: 18px; margin-bottom: 1rem;">MENTOR SERVICE AGREEMENT</h4>
    
    <p style="margin-bottom: 1.5rem;">
      This Mentor Service Agreement ("Agreement") is entered into by and between Stackr Finance 
      ("Platform") and the individual or entity accepting these terms ("Mentor").
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">1. SERVICES PROVIDED</h5>
    <p style="margin-bottom: 1rem;">
      1.1 The Mentor agrees to provide financial mentorship, coaching, and/or advisory services 
      ("Services") to clients ("Clients") who engage with the Mentor through the Platform.
    </p>
    <p style="margin-bottom: 1.5rem;">
      1.2 The Mentor acknowledges that they are responsible for the content, quality, and legality 
      of the Services they provide to Clients.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">2. MENTOR ELIGIBILITY AND QUALIFICATIONS</h5>
    <p style="margin-bottom: 1rem;">
      2.1 The Mentor represents and warrants that all information provided to the Platform about their 
      qualifications, experience, certifications, and credentials is accurate, complete, and current.
    </p>
    <p style="margin-bottom: 1rem;">
      2.2 The Mentor agrees to promptly update their profile information if any changes occur to their 
      qualifications, certifications, or credentials.
    </p>
    <p style="margin-bottom: 1.5rem;">
      2.3 The Mentor acknowledges that they may be required to provide proof of qualifications, certifications, 
      and credentials upon request by the Platform.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">3. PAYMENT AND FEES</h5>
    <p style="margin-bottom: 1rem;">
      3.1 The Mentor will receive payment for Services provided to Clients at the hourly rate set by the Mentor, 
      less the Platform's service fee as specified in the Platform's current fee schedule.
    </p>
    <p style="margin-bottom: 1rem;">
      3.2 The Platform will handle all payment processing and will remit payment to the Mentor according to the 
      Platform's payment schedule.
    </p>
    <p style="margin-bottom: 1.5rem;">
      3.3 The Mentor acknowledges that they are responsible for all taxes and other obligations related to the 
      fees received for Services provided through the Platform.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">4. CONFIDENTIALITY AND DATA PROTECTION</h5>
    <p style="margin-bottom: 1rem;">
      4.1 The Mentor agrees to maintain the confidentiality of all Client information and data accessed through 
      the Platform or provided by Clients during the provision of Services.
    </p>
    <p style="margin-bottom: 1rem;">
      4.2 The Mentor will only use Client information and data for the purpose of providing the Services and 
      will not disclose such information to any third party without explicit consent from the Client and the Platform.
    </p>
    <p style="margin-bottom: 1.5rem;">
      4.3 The Mentor agrees to comply with all applicable data protection and privacy laws and regulations in 
      relation to the processing of Client personal data.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">5. INTELLECTUAL PROPERTY</h5>
    <p style="margin-bottom: 1rem;">
      5.1 The Mentor retains ownership of the intellectual property rights to the content they create in 
      connection with the Services.
    </p>
    <p style="margin-bottom: 1.5rem;">
      5.2 The Mentor grants the Platform a non-exclusive, worldwide, royalty-free license to use, reproduce, 
      distribute, and display the Mentor's name, likeness, profile information, and testimonials for the purpose 
      of promoting the Platform.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">6. COMPLIANCE WITH LAWS AND REGULATIONS</h5>
    <p style="margin-bottom: 1rem;">
      6.1 The Mentor agrees to comply with all applicable laws, rules, and regulations in connection with the 
      provision of the Services, including but not limited to financial regulations, securities laws, and 
      professional licensing requirements.
    </p>
    <p style="margin-bottom: 1.5rem;">
      6.2 The Mentor acknowledges that they are solely responsible for determining whether they are required to 
      maintain any licenses, registrations, or certifications to provide the Services and for obtaining and 
      maintaining such licenses, registrations, or certifications.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">7. DISCLAIMER OF GUARANTEES</h5>
    <p style="margin-bottom: 1.5rem;">
      7.1 The Mentor agrees not to guarantee or promise specific financial returns, investment performance, or 
      other outcomes to Clients, and acknowledges that all financial advice carries inherent risks.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">8. TERM AND TERMINATION</h5>
    <p style="margin-bottom: 1rem;">
      8.1 This Agreement shall remain in effect until terminated by either party.
    </p>
    <p style="margin-bottom: 1rem;">
      8.2 Either party may terminate this Agreement at any time, with or without cause, by providing written 
      notice to the other party.
    </p>
    <p style="margin-bottom: 1.5rem;">
      8.3 Upon termination, the Mentor will complete any ongoing Services with existing Clients unless otherwise 
      agreed with the Platform.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">9. LIMITATION OF LIABILITY</h5>
    <p style="margin-bottom: 1.5rem;">
      9.1 The Platform shall not be liable for any indirect, incidental, special, consequential, or punitive 
      damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, 
      use, goodwill, or other intangible losses, resulting from (a) the Mentor's provision of the Services; 
      (b) any conduct or content of any Client; or (c) unauthorized access, use, or alteration of the Mentor's 
      content or information.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">10. INDEMNIFICATION</h5>
    <p style="margin-bottom: 1.5rem;">
      10.1 The Mentor agrees to indemnify, defend, and hold harmless the Platform and its affiliates, officers, 
      directors, employees, and agents from and against any and all claims, liabilities, damages, losses, or 
      expenses, including reasonable attorneys' fees and costs, arising out of or in any way connected with 
      (a) the Mentor's access to or use of the Platform; (b) the Mentor's provision of the Services; (c) the 
      Mentor's violation of this Agreement; or (d) the Mentor's violation of any applicable law or the rights 
      of any third party.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">11. GOVERNING LAW AND DISPUTE RESOLUTION</h5>
    <p style="margin-bottom: 1.5rem;">
      11.1 This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction], 
      without regard to its conflict of law principles.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">12. ENTIRE AGREEMENT</h5>
    <p style="margin-bottom: 1.5rem;">
      12.1 This Agreement constitutes the entire agreement between the Mentor and the Platform regarding the 
      Mentor's provision of Services through the Platform and supersedes all prior agreements and understandings, 
      whether written or oral.
    </p>
    
    <p style="font-style: italic;">
      By clicking "I Accept," the Mentor acknowledges that they have read, understood, and agree to be bound by 
      the terms of this Agreement.
    </p>
  `;
}

/**
 * Get user service agreement text
 * @returns {string} HTML content for user service agreement
 */
function getUserAgreementText() {
  return `
    <h4 style="font-size: 18px; margin-bottom: 1rem;">USER SERVICE AGREEMENT</h4>
    
    <p style="margin-bottom: 1.5rem;">
      This User Service Agreement ("Agreement") is entered into by and between Stackr Finance 
      ("Platform") and the individual or entity accepting these terms ("User").
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">1. SERVICES OFFERED</h5>
    <p style="margin-bottom: 1rem;">
      1.1 The Platform provides a marketplace connecting Users with financial mentors, coaches, and advisors 
      ("Mentors") who provide financial mentorship, coaching, and/or advisory services ("Services").
    </p>
    <p style="margin-bottom: 1.5rem;">
      1.2 The Platform does not itself provide financial advice, investment advice, or any other financial services, 
      and is not responsible for the content, quality, or legality of the Services provided by Mentors.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">2. USER ACCOUNT</h5>
    <p style="margin-bottom: 1rem;">
      2.1 To access the Services, the User must create an account with accurate, complete, and updated information.
    </p>
    <p style="margin-bottom: 1.5rem;">
      2.2 The User is responsible for maintaining the confidentiality of their account credentials and for all 
      activities that occur under their account.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">3. PAYMENT AND FEES</h5>
    <p style="margin-bottom: 1rem;">
      3.1 The User agrees to pay all fees associated with the Services they request through the Platform, according 
      to the rates set by the Mentors and the Platform.
    </p>
    <p style="margin-bottom: 1rem;">
      3.2 All payments will be processed through the Platform's payment system, and the User agrees to provide valid 
      payment information.
    </p>
    <p style="margin-bottom: 1.5rem;">
      3.3 The Platform may offer subscription plans with different features and pricing. The User will be billed 
      according to the subscription plan they select.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">4. RELATIONSHIP WITH MENTORS</h5>
    <p style="margin-bottom: 1rem;">
      4.1 The User acknowledges that Mentors are independent contractors and not employees or agents of the Platform.
    </p>
    <p style="margin-bottom: 1rem;">
      4.2 The User understands that the Platform does not endorse or guarantee the accuracy, reliability, or quality of 
      the Services provided by Mentors.
    </p>
    <p style="margin-bottom: 1.5rem;">
      4.3 The User agrees to communicate with Mentors solely through the Platform and not to attempt to circumvent the 
      Platform to engage directly with Mentors outside the Platform.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">5. USER RESPONSIBILITIES</h5>
    <p style="margin-bottom: 1rem;">
      5.1 The User agrees to provide accurate and complete information when requesting Services from Mentors.
    </p>
    <p style="margin-bottom: 1rem;">
      5.2 The User acknowledges that financial decisions and actions taken based on the Services are the User's sole 
      responsibility.
    </p>
    <p style="margin-bottom: 1.5rem;">
      5.3 The User agrees to comply with all applicable laws and regulations in connection with their use of the Platform 
      and the Services.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">6. DISCLAIMER OF WARRANTIES</h5>
    <p style="margin-bottom: 1rem;">
      6.1 The Platform provides the marketplace "as is" and "as available" without warranties of any kind, either express 
      or implied.
    </p>
    <p style="margin-bottom: 1.5rem;">
      6.2 The Platform does not guarantee that the Services provided by Mentors will meet the User's requirements or 
      expectations, or that they will result in any specific financial outcome.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">7. LIMITATION OF LIABILITY</h5>
    <p style="margin-bottom: 1.5rem;">
      7.1 The Platform shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
      or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, 
      or other intangible losses, resulting from (a) the User's use of or inability to use the Platform; (b) any conduct 
      or content of any Mentor; or (c) unauthorized access, use, or alteration of the User's content or information.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">8. DATA SHARING AND PRIVACY</h5>
    <p style="margin-bottom: 1rem;">
      8.1 The User consents to the Platform sharing their information with Mentors as necessary for the provision of the 
      Services.
    </p>
    <p style="margin-bottom: 1.5rem;">
      8.2 The User's personal data will be processed in accordance with the Platform's Privacy Policy, which the User 
      acknowledges having read and understood.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">9. TERM AND TERMINATION</h5>
    <p style="margin-bottom: 1rem;">
      9.1 This Agreement shall remain in effect until terminated by either party.
    </p>
    <p style="margin-bottom: 1rem;">
      9.2 The User may terminate this Agreement at any time by closing their account.
    </p>
    <p style="margin-bottom: 1.5rem;">
      9.3 The Platform may terminate or suspend the User's access to the Platform at any time, with or without cause, 
      and with or without notice.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">10. DISPUTE RESOLUTION</h5>
    <p style="margin-bottom: 1.5rem;">
      10.1 Any disputes arising from this Agreement or the User's use of the Platform shall be resolved in accordance 
      with the laws of [Jurisdiction], without regard to its conflict of law principles.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">11. CHANGES TO THE AGREEMENT</h5>
    <p style="margin-bottom: 1.5rem;">
      11.1 The Platform reserves the right to modify this Agreement at any time. The User will be notified of significant 
      changes, and continued use of the Platform after such changes constitutes acceptance of the modified Agreement.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">12. ENTIRE AGREEMENT</h5>
    <p style="margin-bottom: 1.5rem;">
      12.1 This Agreement, together with the Platform's Privacy Policy, constitutes the entire agreement between the User 
      and the Platform regarding the User's use of the Platform and supersedes all prior agreements and understandings, 
      whether written or oral.
    </p>
    
    <p style="font-style: italic;">
      By clicking "I Accept," the User acknowledges that they have read, understood, and agree to be bound by the terms of 
      this Agreement.
    </p>
  `;
}

/**
 * Get privacy policy text
 * @returns {string} HTML content for privacy policy
 */
function getPrivacyPolicyText() {
  return `
    <h4 style="font-size: 18px; margin-bottom: 1rem;">PRIVACY POLICY</h4>
    
    <p style="margin-bottom: 1.5rem;">
      This Privacy Policy describes how Stackr Finance ("we," "our," or "us") collects, uses, and 
      shares personal information when you use our financial mentorship platform ("Platform").
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">1. INFORMATION WE COLLECT</h5>
    <p style="margin-bottom: 0.5rem;">
      1.1 Information You Provide to Us:
    </p>
    <ul style="margin-bottom: 1rem; padding-left: 1.5rem;">
      <li>Account information (name, email address, phone number, etc.)</li>
      <li>Profile information (professional background, expertise, etc. for Mentors)</li>
      <li>Financial information (income, savings, debts, financial goals, etc.)</li>
      <li>Payment information</li>
      <li>Communications with Mentors or other users</li>
      <li>Survey responses and feedback</li>
    </ul>
    
    <p style="margin-bottom: 0.5rem;">
      1.2 Information We Collect Automatically:
    </p>
    <ul style="margin-bottom: 1rem; padding-left: 1.5rem;">
      <li>Usage data (how you interact with our Platform)</li>
      <li>Device information (IP address, browser type, operating system, etc.)</li>
      <li>Location information</li>
      <li>Cookies and similar technologies</li>
    </ul>
    
    <p style="margin-bottom: 1.5rem;">
      1.3 Information from Third Parties:
      <br>
      We may receive information about you from third parties, such as social media platforms, identity 
      verification services, or other financial institutions, with your consent.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">2. HOW WE USE YOUR INFORMATION</h5>
    <p style="margin-bottom: 0.5rem;">
      We use the information we collect to:
    </p>
    <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
      <li>Provide, maintain, and improve the Platform</li>
      <li>Process transactions and send related information</li>
      <li>Connect users with Mentors</li>
      <li>Send notifications, updates, and promotional messages</li>
      <li>Respond to your comments, questions, and customer service requests</li>
      <li>Monitor and analyze trends, usage, and activities</li>
      <li>Detect, prevent, and address fraud, security issues, and technical issues</li>
      <li>Comply with legal obligations</li>
    </ul>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">3. SHARING OF INFORMATION</h5>
    <p style="margin-bottom: 0.5rem;">
      3.1 With Mentors and Users:
      <br>
      We share information between users and Mentors as necessary for the provision of mentorship services.
    </p>
    
    <p style="margin-bottom: 0.5rem;">
      3.2 With Service Providers:
      <br>
      We share information with third-party vendors, consultants, and other service providers who need access to 
      such information to carry out work on our behalf.
    </p>
    
    <p style="margin-bottom: 0.5rem;">
      3.3 For Legal Reasons:
      <br>
      We may share information if we believe disclosure is necessary to comply with a legal process, protect our 
      rights, respond to claims, or protect the safety of others.
    </p>
    
    <p style="margin-bottom: 1.5rem;">
      3.4 With Your Consent:
      <br>
      We may share information with third parties when you have given us your consent to do so.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">4. DATA RETENTION</h5>
    <p style="margin-bottom: 1.5rem;">
      We retain personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
      unless a longer retention period is required or permitted by law.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">5. DATA SECURITY</h5>
    <p style="margin-bottom: 1.5rem;">
      We implement appropriate technical and organizational measures to protect the security of your personal information. 
      However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee 
      absolute security.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">6. YOUR RIGHTS AND CHOICES</h5>
    <p style="margin-bottom: 0.5rem;">
      Depending on your location, you may have certain rights regarding your personal information, including:
    </p>
    <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
      <li>Accessing your personal information</li>
      <li>Correcting inaccurate information</li>
      <li>Deleting your information</li>
      <li>Restricting or objecting to our use of your information</li>
      <li>Data portability</li>
      <li>Withdrawing consent</li>
    </ul>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">7. COOKIES</h5>
    <p style="margin-bottom: 1.5rem;">
      We use cookies and similar technologies to collect information about your activity on our Platform. You can 
      set your browser to refuse all or some browser cookies or to alert you when cookies are being sent.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">8. CHILDREN'S PRIVACY</h5>
    <p style="margin-bottom: 1.5rem;">
      Our Platform is not intended for children under 18 years of age, and we do not knowingly collect personal 
      information from children under 18.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">9. INTERNATIONAL DATA TRANSFERS</h5>
    <p style="margin-bottom: 1.5rem;">
      Your information may be transferred to, and processed in, countries other than the country in which you reside. 
      These countries may have data protection laws that are different from the laws of your country.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">10. CHANGES TO THIS PRIVACY POLICY</h5>
    <p style="margin-bottom: 1.5rem;">
      We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
      Privacy Policy on this page and, where appropriate, sending you a notification.
    </p>
    
    <h5 style="font-size: 16px; margin-bottom: 0.5rem;">11. CONTACT US</h5>
    <p style="margin-bottom: 1.5rem;">
      If you have any questions about this Privacy Policy, please contact us at privacy@stackrfinance.com.
    </p>
    
    <p style="font-style: italic;">
      By clicking "I Accept," you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
    </p>
  `;
}

export { showAgreementModal };