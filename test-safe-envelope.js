// Import our test harness
import { testReactComponent } from './react-test-harness.js';

// Mock React
const React = {
  createElement: (type, props, ...children) => ({
    type,
    props: { ...props, children: children.length === 0 ? null : children.length === 1 ? children[0] : children }
  }),
  useState: (initialValue) => [initialValue, () => {}]
};

// Mock components used by SafeEnvelope
const Card = ({ children, className }) => React.createElement('Card', { className }, children);
const CardHeader = ({ children, className }) => React.createElement('CardHeader', { className }, children);
const CardTitle = ({ children, className }) => React.createElement('CardTitle', { className }, children);
const CardContent = ({ children, className }) => React.createElement('CardContent', { className }, children);
const Progress = ({ value, className }) => React.createElement('Progress', { value, className });
const Button = ({ children, onClick, className, 'aria-label': ariaLabel }) => 
  React.createElement('Button', { onClick, className, 'aria-label': ariaLabel }, children);
const Lock = ({ className }) => React.createElement('LockIcon', { className });
const Unlock = ({ className }) => React.createElement('UnlockIcon', { className });

// Mock formatCurrency
const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

// SafeEnvelope component (simplified version of the actual component)
function SafeEnvelope({ 
  category, 
  allocated, 
  spent, 
  total, 
  isLocked: propIsLocked, 
  onLockToggle 
}) {
  const [isLockedState, setIsLockedState] = React.useState(false);
  
  // Use either the prop or the state
  const isLocked = propIsLocked !== undefined ? propIsLocked : isLockedState;
  const progress = (spent / allocated) * 100;
  const remaining = allocated - spent;
  
  const handleLockToggle = () => {
    if (onLockToggle) {
      onLockToggle(!isLocked);
    } else {
      setIsLockedState(!isLocked);
    }
  };
  
  return React.createElement(
    Card, 
    { className: isLocked ? 'border-2 border-primary' : '' },
    React.createElement(
      CardHeader, 
      { className: "pb-1 xs:pb-2 pt-2 xs:pt-3 px-2 xs:px-4 flex flex-row justify-between items-center" },
      React.createElement(CardTitle, { className: "text-xs xs:text-sm font-medium" }, category),
      React.createElement(
        Button, 
        { 
          variant: "ghost", 
          size: "sm",
          onClick: handleLockToggle,
          className: "h-6 w-6 xs:h-8 xs:w-8 p-0",
          'aria-label': "Toggle lock"
        },
        isLocked 
          ? React.createElement(Lock, { className: "h-3 w-3 xs:h-4 xs:w-4 text-primary" })
          : React.createElement(Unlock, { className: "h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" })
      )
    ),
    React.createElement(
      CardContent, 
      { className: "p-2 xs:p-4" },
      React.createElement(
        'div', 
        { className: "space-y-1 xs:space-y-2" },
        React.createElement(Progress, { value: progress, className: "h-1.5 xs:h-2" }),
        React.createElement(
          'div', 
          { className: "flex justify-between text-[9px] xs:text-xs" },
          React.createElement('span', { className: "truncate pr-1" }, `Spent: ${formatCurrency(spent)}`),
          React.createElement('span', { className: "truncate pl-1" }, `Budget: ${formatCurrency(allocated)}`)
        ),
        React.createElement(
          'div', 
          { 
            className: `text-[9px] xs:text-xs ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`
          },
          `${formatCurrency(Math.abs(remaining))} ${remaining < 0 ? 'over' : 'left'}`
        ),
        isLocked && React.createElement(
          'div', 
          { className: "text-[9px] xs:text-xs text-primary mt-1 xs:mt-2 truncate" },
          '🔒 Envelope locked'
        )
      )
    )
  );
}

// Run the test
console.log("Testing SafeEnvelope component");

// Test with basic props
testReactComponent('SafeEnvelope - Unlocked', SafeEnvelope, {
  category: 'Test Category',
  allocated: 1000,
  spent: 500,
  total: 1000,
  isLocked: false,
  onLockToggle: () => console.log('Lock toggled')
});

// Test with locked state
testReactComponent('SafeEnvelope - Locked', SafeEnvelope, {
  category: 'Test Category',
  allocated: 1000,
  spent: 500,
  total: 1000,
  isLocked: true,
  onLockToggle: () => console.log('Lock toggled')
});