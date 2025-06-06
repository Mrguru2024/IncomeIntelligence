import React from 'react';
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
  
  // Icons for income categories
  Wrench,
  Bell,
  MessageSquare,
  ShoppingBag,
  Briefcase,
  Link,
  UserPlus,
  Smartphone,
  Target,
  TrendingUp,
  Package,
  Award,
  Hammer, // Instead of Tool
  
  // Icons for financial features
  DollarSign,
  CreditCard as Card,
  PieChart,
  BarChart2,
  Calendar,
  Clock,
  Send,
  Download,
  Upload,
  Search,
  Filter,
  Sliders,
  Save,
  Edit,
  RefreshCw,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Shield,
  Home,
  Inbox,
  Bell as Notification,
  Star,
  Heart,
  ThumbsUp,
  Zap,
  Flag,
  
  // Additional utility icons
  ArrowDown,
  ArrowUp,
  Maximize,
  Minimize,
  RotateCw,
  Share2,
  Copy,
  List,
  LayoutGrid,
  Columns,
  CornerDownLeft,
  CornerRightDown
} from 'lucide-react';

// A simple object mapping of icon names to components
export const Icons = {
  // Core icons
  logo: Command,
  close: X,
  help: HelpCircle,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  arrow: ArrowRight,
  user: User,
  check: Check,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  twitter: Twitter,
  menu: Menu,
  
  // Income categories
  wrench: Wrench,
  bell: Bell,
  messagesSquare: MessageSquare,
  tool: Hammer, // Using Hammer instead of Tool
  shoppingBag: ShoppingBag,
  briefcase: Briefcase,
  link: Link,
  userPlus: UserPlus,
  smartphone: Smartphone,
  target: Target,
  trendingUp: TrendingUp,
  package: Package,
  award: Award,
  fileText: FileText,
  moreHorizontal: MoreVertical,
  
  // Financial features
  dollarSign: DollarSign,
  card: Card,
  pieChart: PieChart,
  barChart: BarChart2,
  calendar: Calendar,
  clock: Clock,
  send: Send,
  download: Download,
  upload: Upload,
  search: Search,
  filter: Filter,
  sliders: Sliders,
  save: Save,
  edit: Edit,
  refresh: RefreshCw,
  alertCircle: AlertCircle,
  info: Info,
  eye: Eye,
  eyeOff: EyeOff,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  shield: Shield,
  home: Home,
  inbox: Inbox,
  notification: Notification,
  star: Star,
  heart: Heart,
  thumbsUp: ThumbsUp,
  zap: Zap,
  flag: Flag,
  
  // Additional utility icons
  arrowDown: ArrowDown,
  arrowUp: ArrowUp,
  maximize: Maximize,
  minimize: Minimize,
  rotate: RotateCw,
  share: Share2,
  copy: Copy,
  list: List,
  grid: LayoutGrid,
  columns: Columns,
  enter: CornerDownLeft,
  exit: CornerRightDown,
};