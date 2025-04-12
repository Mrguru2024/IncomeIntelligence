/**
 * Dashboard component for Stackr Finance
 * This module renders the main dashboard with financial summary and insights.
 */

import { appState } from './src/main.js';

// Generate realistic dummy data for the dashboard demo
function generateDashboardData() {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Income data
  const monthlyIncome = appState.income?.monthly || 4500;
  
  // Calculate income splits
  const needs = Math.round(monthlyIncome * (appState.user?.splitRatio?.needs || 40) / 100);
  const investments = Math.round(monthlyIncome * (appState.user?.splitRatio?.investments || 30) / 100);
  const savings = Math.round(monthlyIncome * (appState.user?.splitRatio?.savings || 30) / 100);
  
  // Generate expense data for each category
  const currentExpenses = {
    needs: Math.round(needs * 0.85), // 85% of needs budget spent
    investments: Math.round(investments * 0.70), // 70% of investments budget spent
    savings: Math.round(savings * 0.90), // 90% of savings budget spent
  };
  
  // Monthly data for charts
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Last 6 months for charts
  const lastSixMonths = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    lastSixMonths.push(monthNames[monthIndex]);
  }
  
  // Generate monthly income data for the chart
  const incomeData = [];
  for (let i = 0; i < 6; i++) {
    // Random variations around the monthly income
    const variation = 0.9 + (Math.random() * 0.3); // Between 90% and 120%
    incomeData.push(Math.round(monthlyIncome * variation));
  }
  
  // Generate monthly expenses for each category
  const expensesData = {
    needs: [],
    investments: [],
    savings: []
  };
  
  for (let i = 0; i < 6; i++) {
    // Random variations for expenses
    expensesData.needs.push(Math.round(needs * (0.7 + (Math.random() * 0.4)))); // 70% to 110%
    expensesData.investments.push(Math.round(investments * (0.6 + (Math.random() * 0.5)))); // 60% to 110%
    expensesData.savings.push(Math.round(savings * (0.8 + (Math.random() * 0.3)))); // 80% to 110%
  }
  
  // Weekly overview data for the current month
  const weeksInMonth = 4;
  const weeklyData = [];
  
  for (let week = 1; week <= weeksInMonth; week++) {
    const weekIncome = Math.round(monthlyIncome / weeksInMonth);
    const weekNeeds = Math.round(needs / weeksInMonth);
    const weekInvestments = Math.round(investments / weeksInMonth);
    const weekSavings = Math.round(savings / weeksInMonth);
    
    // Random variations for weekly expenses
    const weekNeedsSpent = week < weeksInMonth ? Math.round(weekNeeds * (0.7 + (Math.random() * 0.4))) : currentExpenses.needs - weeklyData.reduce((sum, w) => sum + w.expenses.needs, 0);
    const weekInvestmentsSpent = week < weeksInMonth ? Math.round(weekInvestments * (0.6 + (Math.random() * 0.5))) : currentExpenses.investments - weeklyData.reduce((sum, w) => sum + w.expenses.investments, 0);
    const weekSavingsSpent = week < weeksInMonth ? Math.round(weekSavings * (0.8 + (Math.random() * 0.3))) : currentExpenses.savings - weeklyData.reduce((sum, w) => sum + w.expenses.savings, 0);
    
    weeklyData.push({
      week: `Week ${week}`,
      income: weekIncome,
      budget: {
        needs: weekNeeds,
        investments: weekInvestments,
        savings: weekSavings
      },
      expenses: {
        needs: weekNeedsSpent,
        investments: weekInvestmentsSpent,
        savings: weekSavingsSpent
      }
    });
  }
  
  // Financial insights
  const insights = [
    {
      type: 'positive',
      message: 'Your savings rate is above average for your income level.'
    },
    {
      type: 'warning',
      message: 'Your housing costs are slightly higher than recommended. Consider reviewing for optimization.'
    },
    {
      type: 'tip',
      message: 'Setting up automatic transfers to your investment accounts can help maintain consistency.'
    }
  ];
  
  // Goals progress
  const goals = appState.goals || [
    {
      id: 1,
      name: 'Emergency Fund',
      target: 10000,
      current: 6500,
      category: 'savings'
    },
    {
      id: 2,
      name: 'Tech Equipment',
      target: 2500,
      current: 1200,
      category: 'needs'
    },
    {
      id: 3,
      name: 'Market Investment',
      target: 5000,
      current: 2000,
      category: 'investments'
    }
  ];
  
  return {
    monthly: {
      income: monthlyIncome,
      splits: {
        needs,
        investments,
        savings
      },
      expenses: currentExpenses
    },
    charts: {
      months: lastSixMonths,
      income: incomeData,
      expenses: expensesData
    },
    weekly: weeklyData,
    insights,
    goals
  };
}

// Render the dashboard page
export function renderDashboardPage() {
  // Main container
  const dashboardContainer = document.createElement('div');
  dashboardContainer.className = 'dashboard-container';
  
  // Generate dashboard data
  const dashboardData = generateDashboardData();
  
  // Header section
  const header = document.createElement('header');
  header.className = 'dashboard-header';
  header.innerHTML = `
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold mb-1">Financial Dashboard</h1>
        <p class="text-gray-600">Overview of your financial health</p>
      </div>
      <div class="mt-4 md:mt-0">
        <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          + Add Income
        </button>
      </div>
    </div>
  `;
  dashboardContainer.appendChild(header);
  
  // Summary cards section
  const summarySection = document.createElement('section');
  summarySection.className = 'summary-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8';
  
  // Income card
  const incomeCard = document.createElement('div');
  incomeCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  incomeCard.innerHTML = `
    <div class="card-header flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold">Monthly Income</h3>
      <span class="text-sm bg-green-100 text-green-800 py-1 px-2 rounded">Active</span>
    </div>
    <div class="card-value text-2xl font-bold">$${dashboardData.monthly.income.toLocaleString()}</div>
    <div class="text-sm text-gray-600 mt-1">Next income on ${new Date().getDate() > 15 ? '1st' : '15th'}</div>
    <div class="mt-3 pt-3 border-t border-gray-100">
      <div class="text-sm">40/30/30 Split:</div>
      <div class="flex mt-2">
        <div style="width: 40%; background-color: #34A853; height: 8px; border-radius: 4px 0 0 4px;"></div>
        <div style="width: 30%; background-color: #4285F4; height: 8px;"></div>
        <div style="width: 30%; background-color: #FBBC05; height: 8px; border-radius: 0 4px 4px 0;"></div>
      </div>
      <div class="flex text-xs mt-1 justify-between">
        <div>Needs: $${dashboardData.monthly.splits.needs.toLocaleString()}</div>
        <div>Invest: $${dashboardData.monthly.splits.investments.toLocaleString()}</div>
        <div>Save: $${dashboardData.monthly.splits.savings.toLocaleString()}</div>
      </div>
    </div>
  `;
  
  // Expenses card
  const expensesCard = document.createElement('div');
  expensesCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  expensesCard.innerHTML = `
    <div class="card-header flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold">Monthly Expenses</h3>
      <span class="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">Tracking</span>
    </div>
    <div class="card-value text-2xl font-bold">$${(dashboardData.monthly.expenses.needs + 
                                                dashboardData.monthly.expenses.investments + 
                                                dashboardData.monthly.expenses.savings).toLocaleString()}</div>
    <div class="text-sm text-gray-600 mt-1">
      ${Math.round(((dashboardData.monthly.expenses.needs + 
                   dashboardData.monthly.expenses.investments + 
                   dashboardData.monthly.expenses.savings) / 
                  dashboardData.monthly.income) * 100)}% of income
    </div>
    <div class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex justify-between text-sm mb-1">
        <div>Needs:</div>
        <div>$${dashboardData.monthly.expenses.needs.toLocaleString()} / $${dashboardData.monthly.splits.needs.toLocaleString()}</div>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((dashboardData.monthly.expenses.needs / dashboardData.monthly.splits.needs) * 100))}%"></div>
      </div>
      
      <div class="flex justify-between text-sm mb-1 mt-2">
        <div>Investments:</div>
        <div>$${dashboardData.monthly.expenses.investments.toLocaleString()} / $${dashboardData.monthly.splits.investments.toLocaleString()}</div>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-accent h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((dashboardData.monthly.expenses.investments / dashboardData.monthly.splits.investments) * 100))}%"></div>
      </div>
      
      <div class="flex justify-between text-sm mb-1 mt-2">
        <div>Savings:</div>
        <div>$${dashboardData.monthly.expenses.savings.toLocaleString()} / $${dashboardData.monthly.splits.savings.toLocaleString()}</div>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-secondary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((dashboardData.monthly.expenses.savings / dashboardData.monthly.splits.savings) * 100))}%"></div>
      </div>
    </div>
  `;
  
  // Remaining budget card
  const remainingCard = document.createElement('div');
  remainingCard.className = 'card bg-white p-4 rounded-lg shadow-sm';
  
  const remainingNeeds = dashboardData.monthly.splits.needs - dashboardData.monthly.expenses.needs;
  const remainingInvestments = dashboardData.monthly.splits.investments - dashboardData.monthly.expenses.investments;
  const remainingSavings = dashboardData.monthly.splits.savings - dashboardData.monthly.expenses.savings;
  const totalRemaining = remainingNeeds + remainingInvestments + remainingSavings;
  
  remainingCard.innerHTML = `
    <div class="card-header flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold">Remaining Budget</h3>
      <span class="text-sm bg-yellow-100 text-yellow-800 py-1 px-2 rounded">This Month</span>
    </div>
    <div class="card-value text-2xl font-bold">$${totalRemaining.toLocaleString()}</div>
    <div class="text-sm text-gray-600 mt-1">
      ${Math.round((totalRemaining / dashboardData.monthly.income) * 100)}% of income left
    </div>
    <div class="mt-3 pt-3 border-t border-gray-100">
      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <div class="text-sm font-medium">Needs</div>
          <div class="text-lg font-semibold ${remainingNeeds >= 0 ? 'text-green-600' : 'text-red-600'}">
            $${Math.abs(remainingNeeds).toLocaleString()}
          </div>
          <div class="text-xs">${remainingNeeds >= 0 ? 'remaining' : 'over budget'}</div>
        </div>
        <div>
          <div class="text-sm font-medium">Invest</div>
          <div class="text-lg font-semibold ${remainingInvestments >= 0 ? 'text-green-600' : 'text-red-600'}">
            $${Math.abs(remainingInvestments).toLocaleString()}
          </div>
          <div class="text-xs">${remainingInvestments >= 0 ? 'remaining' : 'over budget'}</div>
        </div>
        <div>
          <div class="text-sm font-medium">Save</div>
          <div class="text-lg font-semibold ${remainingSavings >= 0 ? 'text-green-600' : 'text-red-600'}">
            $${Math.abs(remainingSavings).toLocaleString()}
          </div>
          <div class="text-xs">${remainingSavings >= 0 ? 'remaining' : 'over budget'}</div>
        </div>
      </div>
    </div>
  `;
  
  summarySection.appendChild(incomeCard);
  summarySection.appendChild(expensesCard);
  summarySection.appendChild(remainingCard);
  dashboardContainer.appendChild(summarySection);
  
  // Income and expense trends section
  const trendsSection = document.createElement('section');
  trendsSection.className = 'trends-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8';
  
  // Income trend chart
  const incomeTrend = document.createElement('div');
  incomeTrend.className = 'income-trend bg-white p-4 rounded-lg shadow-sm';
  incomeTrend.innerHTML = `
    <h3 class="text-lg font-semibold mb-4">Income Trend</h3>
    <div class="chart-container" style="height: 200px;">
      <canvas id="incomeChart"></canvas>
    </div>
  `;
  
  // Expense breakdown chart
  const expenseBreakdown = document.createElement('div');
  expenseBreakdown.className = 'expense-breakdown bg-white p-4 rounded-lg shadow-sm';
  expenseBreakdown.innerHTML = `
    <h3 class="text-lg font-semibold mb-4">Expense Breakdown</h3>
    <div class="chart-container" style="height: 200px;">
      <canvas id="expenseChart"></canvas>
    </div>
  `;
  
  trendsSection.appendChild(incomeTrend);
  trendsSection.appendChild(expenseBreakdown);
  dashboardContainer.appendChild(trendsSection);
  
  // Goals and insights section
  const goalsInsightsSection = document.createElement('section');
  goalsInsightsSection.className = 'goals-insights-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8';
  
  // Savings goals
  const goalsContainer = document.createElement('div');
  goalsContainer.className = 'goals-container bg-white p-4 rounded-lg shadow-sm';
  goalsContainer.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Savings Goals</h3>
      <button class="text-sm text-primary hover:underline">
        + Add Goal
      </button>
    </div>
    <div class="goals-list space-y-4">
      ${dashboardData.goals.map(goal => {
        const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));
        return `
          <div class="goal-item">
            <div class="flex justify-between mb-1">
              <div class="font-medium">${goal.name}</div>
              <div class="text-sm">$${goal.current.toLocaleString()} / $${goal.target.toLocaleString()}</div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-${goal.category === 'needs' ? 'primary' : goal.category === 'investments' ? 'accent' : 'secondary'} 
                        h-2.5 rounded-full" 
                  style="width: ${progressPercent}%"></div>
            </div>
            <div class="flex justify-between mt-1">
              <div class="text-xs text-gray-600">
                ${goal.category.charAt(0).toUpperCase() + goal.category.slice(1)} Goal
              </div>
              <div class="text-xs font-medium">
                ${progressPercent}% complete
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Financial insights
  const insightsContainer = document.createElement('div');
  insightsContainer.className = 'insights-container bg-white p-4 rounded-lg shadow-sm';
  insightsContainer.innerHTML = `
    <h3 class="text-lg font-semibold mb-4">Financial Insights</h3>
    <div class="insights-list space-y-4">
      ${dashboardData.insights.map(insight => {
        const colorClass = insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                          insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200';
        
        const iconClass = insight.type === 'positive' ? 'text-green-500' :
                         insight.type === 'warning' ? 'text-yellow-500' :
                         'text-blue-500';
        
        const icon = insight.type === 'positive' ? '✓' :
                    insight.type === 'warning' ? '⚠' :
                    'ℹ';
        
        return `
          <div class="insight-item p-3 ${colorClass} border rounded-md">
            <div class="flex">
              <div class="mr-3 ${iconClass} text-lg">${icon}</div>
              <div>${insight.message}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="mt-4 text-center">
      <button class="text-primary hover:underline text-sm">
        Get AI-Powered Financial Advice
      </button>
    </div>
  `;
  
  goalsInsightsSection.appendChild(goalsContainer);
  goalsInsightsSection.appendChild(insightsContainer);
  dashboardContainer.appendChild(goalsInsightsSection);
  
  // Weekly breakdown section
  const weeklySection = document.createElement('section');
  weeklySection.className = 'weekly-section mb-8';
  weeklySection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Weekly Breakdown - Current Month</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Needs</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investments</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${dashboardData.weekly.map((week, index) => {
              const totalBudget = week.budget.needs + week.budget.investments + week.budget.savings;
              const totalSpent = week.expenses.needs + week.expenses.investments + week.expenses.savings;
              const status = totalSpent <= totalBudget ? 'On Budget' : 'Over Budget';
              const statusClass = totalSpent <= totalBudget ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
              
              return `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${week.week}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">$${week.income.toLocaleString()}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    $${week.expenses.needs.toLocaleString()} / $${week.budget.needs.toLocaleString()}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    $${week.expenses.investments.toLocaleString()} / $${week.budget.investments.toLocaleString()}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    $${week.expenses.savings.toLocaleString()} / $${week.budget.savings.toLocaleString()}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs ${statusClass} rounded-full">
                      ${status}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  dashboardContainer.appendChild(weeklySection);
  
  // Quick actions section
  const quickActionsSection = document.createElement('section');
  quickActionsSection.className = 'quick-actions-section mb-8';
  quickActionsSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <a href="#income" class="p-4 border rounded-lg hover:bg-gray-50">
          <div class="text-2xl mb-2">💸</div>
          <div class="font-medium">Record Income</div>
        </a>
        <a href="#expenses" class="p-4 border rounded-lg hover:bg-gray-50">
          <div class="text-2xl mb-2">📝</div>
          <div class="font-medium">Log Expense</div>
        </a>
        <a href="#moneymentor" class="p-4 border rounded-lg hover:bg-gray-50">
          <div class="text-2xl mb-2">🤖</div>
          <div class="font-medium">Financial Advice</div>
        </a>
        <a href="#settings" class="p-4 border rounded-lg hover:bg-gray-50">
          <div class="text-2xl mb-2">⚙️</div>
          <div class="font-medium">Adjust Splits</div>
        </a>
      </div>
    </div>
  `;
  dashboardContainer.appendChild(quickActionsSection);
  
  // Add chart rendering script
  setTimeout(() => {
    try {
      // Check if charting library is available
      if (typeof Chart !== 'undefined') {
        // Income chart
        const incomeCtx = document.getElementById('incomeChart');
        if (incomeCtx) {
          new Chart(incomeCtx, {
            type: 'line',
            data: {
              labels: dashboardData.charts.months,
              datasets: [{
                label: 'Income',
                data: dashboardData.charts.income,
                backgroundColor: 'rgba(52, 168, 83, 0.1)',
                borderColor: 'rgba(52, 168, 83, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }
          });
        }
        
        // Expense chart
        const expenseCtx = document.getElementById('expenseChart');
        if (expenseCtx) {
          new Chart(expenseCtx, {
            type: 'bar',
            data: {
              labels: dashboardData.charts.months,
              datasets: [
                {
                  label: 'Needs',
                  data: dashboardData.charts.expenses.needs,
                  backgroundColor: 'rgba(52, 168, 83, 0.7)'
                },
                {
                  label: 'Investments',
                  data: dashboardData.charts.expenses.investments,
                  backgroundColor: 'rgba(66, 133, 244, 0.7)'
                },
                {
                  label: 'Savings',
                  data: dashboardData.charts.expenses.savings,
                  backgroundColor: 'rgba(251, 188, 5, 0.7)'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  stacked: true
                },
                y: {
                  stacked: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              }
            }
          });
        }
      } else {
        console.warn('Chart.js not available, skipping chart rendering');
        // Add a note about charts not being available
        const chartContainers = dashboardContainer.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
          container.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <div class="text-center text-gray-500">
                <p>Charts visualization requires Chart.js</p>
                <p class="text-sm mt-2">Data is still being tracked</p>
              </div>
            </div>
          `;
        });
      }
    } catch (error) {
      console.error('Error rendering charts:', error);
    }
  }, 100);
  
  return dashboardContainer;
}