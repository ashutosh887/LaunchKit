import { LucideIcon, Sparkles, TrendingUp, Users, Settings, MessageSquare, CheckSquare, LayoutDashboard, Download, Share2, BarChart3, Shield } from "lucide-react";

type Route = {
  label: string;
  href: string;
  role?: "admin";
  icon: LucideIcon;
};

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  detailedDescription: string;
};

type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const config = {
  projectName: "LaunchKit",
  projectDescription: "Ship fast. Get customers faster",
  routes: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "ICP Auto-Scraper", href: "/icp-auto-scraper", icon: Sparkles },
    { label: "GTM Strategy Generator", href: "/gtm-strategy-generator", icon: TrendingUp },
    { label: "Messaging Generator", href: "/messaging-generator", icon: MessageSquare },
    { label: "Action Checklist", href: "/action-checklist", icon: CheckSquare },
    { label: "Admin Dashboard", href: "/admin-dashboard", role: "admin" as const, icon: Shield },
    { label: "Waitlist Management", href: "/waitlist-management", role: "admin" as const, icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
  ] as Route[],
  roles: {
    admin: ["ashutoshj887@gmail.com", "mansisondhi103@gmail.com"],
    default: "user",
  },
  waitlist: {
    heading: "Hey there! Being a founder suits you… maybe a little too well",
    subheading: "Now time to turn that founder energy into revenue.",
    highlightText: "Just 3 clicks and you are all set to land your",
    highlightBold: "FIRST PAYING USER",
  },
  social: {
    twitter: "https://x.com/launchkitapp",
  },
  plans: {
    trial: {
      maxCreations: 3,
    },
    pro: {
      maxCreations: -1,
    },
  },
  home: {
    hero: {
      subtitle: "Get your first paying customer in 48 hours with AI-powered ICP analysis, GTM strategies, and actionable checklists.",
      modesNote: "Direct API or Agent mode—choose in Settings.",
      cta: {
        primary: "Get Started",
        secondary: "Join Waitlist",
      },
    },
    features: {
      heading: "Everything you need to get your first customer",
      subheading: "From ICP analysis to execution, we've got you covered",
      items: [
        {
          icon: Sparkles,
          title: "ICP Auto-Scraper",
          description: "Analyze websites to understand your ideal customer profile",
          detailedDescription: "Paste any website URL and get instant insights about your ideal customer.",
        },
        {
          icon: TrendingUp,
          title: "GTM Strategy Generator",
          description: "Generate comprehensive go-to-market strategies",
          detailedDescription: "Get a complete 48-hour launch plan with channels, templates, and metrics.",
        },
        {
          icon: MessageSquare,
          title: "Messaging Generator",
          description: "Create high-conversion messaging lines",
          detailedDescription: "Generate messaging that converts. Headlines, value props, and DM openers ready to use.",
        },
        {
          icon: CheckSquare,
          title: "Action Checklist",
          description: "Get actionable checklists to execute your strategy",
          detailedDescription: "Turn your GTM strategy into actionable tasks. Every task takes ≤30 minutes.",
        },
      ] as Feature[],
      benefits: [
        {
          icon: Download,
          title: "Export Everything",
          description: "Download ICP analyses, GTM strategies, and checklists as Excel files",
        },
        {
          icon: Share2,
          title: "Share ICP Cards",
          description: "Generate shareable ICP summary cards for LinkedIn and Twitter",
        },
        {
          icon: BarChart3,
          title: "Track Progress",
          description: "Monitor your ICP analyses, strategies, and generated content in one place",
        },
      ] as Benefit[],
    },
  },
};

export default config;
