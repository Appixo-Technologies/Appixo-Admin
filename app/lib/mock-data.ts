export type EnquiryStatus = "New" | "Contacted" | "Qualified" | "Closed";

export type Enquiry = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

export const enquiryData: Enquiry[] = [
  {
    id: 101,
    name: "Arjun Mehta",
    email: "arjun@northstar.in",
    company: "Northstar Labs",
    phone: "+91 98765 43210",
    subject: "Website redesign enquiry",
    message:
      "We need a premium admin dashboard and a marketing website refresh for our B2B platform.",
    status: "New",
    createdAt: "2026-09-01",
  },
  {
    id: 102,
    name: "Sana Rizvi",
    email: "sana@cieloworks.com",
    company: "Cielo Works",
    phone: "+91 99887 66554",
    subject: "CRM integration request",
    message:
      "Looking for a quote on integrating lead capture and CRM workflows with our existing sales process.",
    status: "Contacted",
    createdAt: "2026-08-29",
  },
  {
    id: 103,
    name: "Rohan Nair",
    email: "rohan@vantage.co",
    company: "Vantage Digital",
    phone: "+91 97654 32109",
    subject: "Product demo request",
    message:
      "We would like to understand the product capabilities and schedule a live product walkthrough.",
    status: "Qualified",
    createdAt: "2026-08-25",
  },
  {
    id: 104,
    name: "Priya Sethi",
    email: "priya@infohub.ai",
    company: "InfoHub AI",
    phone: "+91 98222 77881",
    subject: "Q1 marketing package",
    message:
      "Need a package for brand strategy, lead generation, and ongoing digital campaign support.",
    status: "Closed",
    createdAt: "2026-08-18",
  },
];

export const dashboardStats = [
  { label: "Total enquiries", value: enquiryData.length, trend: "+12%" },
  { label: "New leads", value: 9, trend: "+4%" },
  { label: "Qualified", value: 13, trend: "+7%" },
  { label: "Closed deals", value: 27, trend: "+16%" },
];
