type Route = {
  label: string;
  href: string;
  role?: "admin";
};

const config = {
  projectName: "LaunchKit",
  projectDescription: "Ship fast. Get customers faster",
  routes: [
    { label: "ICP Auto-Scraper", href: "/icp-auto-scraper" },
    { label: "GTM Strategy Generator", href: "/gtm-strategy-generator" },
    { label: "Waitlist", href: "/waitlist", role: "admin" as const },
    { label: "Settings", href: "/settings" },
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
};

export default config;
