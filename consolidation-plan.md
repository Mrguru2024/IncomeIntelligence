# Stackr Consolidation Plan

## Features to Migrate from Green Version

1. **Quote Generator**
   - Enhanced quote generator with multiple tiers
   - Client preview functionality
   - Quote data management
   - Service agreement integration

2. **User Profile Management**
   - Browser-compatible user profile module
   - User profile persistence

3. **Guardrails Feature**
   - Spending guardrails implementation
   - Guardrails notifications

4. **Invoicing System**
   - Stripe payment integration
   - Invoice generation and management

5. **Financial Mentorship**
   - Mentorship platform features
   - Service listings

6. **Additional Key Components**
   - Distance calculator
   - AI personalization
   - Financial journey tracking

## Cleanup Tasks

1. **Remove Duplicate Files**
   - Multiple App.tsx variants (CleanApp.tsx, FreshApp.tsx, MinimalApp.tsx)
   - Multiple main.tsx variants (clean-main.tsx, direct-main.tsx, fresh-main.tsx, etc.)
   - Backup files (.bak, .backup, .orig)

2. **Consolidate Configuration**
   - Combine multiple vite.config.ts files
   - Standardize environment variables

3. **Streamline Dependencies**
   - Remove unused packages from package.json
   - Organize common utilities

## Migration Strategy

1. For each feature:
   - Create React components for the green version functionality
   - Implement the feature in the React codebase
   - Ensure data compatibility between systems
   - Test thoroughly to ensure functionality is preserved
   - Remove the green version implementation once migrated

2. For each cleanup task:
   - Identify the active, primary version of each file
   - Remove duplicates and unused variants
   - Update imports and references

## Code Size Optimization

1. **Reduce Bundle Size**
   - Implement code splitting for large features
   - Lazy load non-critical components
   - Optimize image assets

2. **Improve Performance**
   - Memoize expensive calculations
   - Implement virtualization for long lists
   - Optimize state management

## Timeline

1. **Phase 1: Critical Features Migration**
   - Quote Generator
   - User Profile Management
   - Guardrails Feature

2. **Phase 2: Secondary Features Migration**
   - Financial Mentorship
   - Invoicing System
   - Remaining components

3. **Phase 3: Cleanup and Optimization**
   - Remove duplicate code
   - Optimize bundle size
   - Final testing and polish