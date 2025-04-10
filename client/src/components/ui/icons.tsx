import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  LucideProps,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
  Menu,
  Home,
  BarChart,
  DollarSign,
  PieChart,
  Calendar,
  Bell,
  Headphones,
  LogOut,
  Wallet,
  ChevronsUpDown,
  LayoutDashboard,
  Sparkles
} from "lucide-react";

// Merge all icons into a single object
export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  settings: Settings,
  billing: CreditCard,
  arrowRight: ArrowRight,
  help: HelpCircle,
  user: User,
  warning: AlertTriangle,
  image: Image,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  menu: Menu,
  home: Home,
  chart: BarChart,
  dollar: DollarSign,
  pieChart: PieChart,
  calendar: Calendar,
  notification: Bell,
  voiceCommand: Headphones,
  logout: LogOut,
  wallet: Wallet,
  file: File,
  fileText: FileText,
  check: Check,
  plus: Plus,
  moreVertical: MoreVertical,
  chevronUpDown: ChevronsUpDown,
  dashboard: LayoutDashboard,
  sparkles: Sparkles,

  // Social icons  
  twitter: Twitter,

  // Custom icon components can be added here
  stackr: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="4" x="3" y="16" rx="1" />
      <rect width="18" height="4" x="3" y="10" rx="1" />
      <rect width="18" height="4" x="3" y="4" rx="1" />
    </svg>
  ),
};