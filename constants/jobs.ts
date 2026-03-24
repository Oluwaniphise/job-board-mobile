export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  salaryRange: string;
  summary: string;
  description: string;
  requirements: string[];
};

export const JOB_LISTINGS: JobListing[] = [
  {
    id: "job-frontend-001",
    title: "Frontend Engineer (React Native)",
    company: "TalentHive",
    location: "Remote",
    type: "Full-time",
    salaryRange: "$75,000 - $95,000",
    summary:
      "Build and ship mobile features for a growing recruitment platform.",
    description:
      "You will collaborate with product and backend teams to deliver new candidate and employer experiences. This role focuses on clean UI implementation, app performance, and shipping reliably.",
    requirements: [
      "2+ years building React Native applications",
      "Strong TypeScript and API integration skills",
      "Experience with Expo Router or React Navigation",
      "Ability to translate designs into polished interfaces",
    ],
  },
  {
    id: "job-backend-002",
    title: "Backend Engineer (Node.js)",
    company: "CareerLoop",
    location: "Lagos, NG",
    type: "Full-time",
    salaryRange: "$65,000 - $85,000",
    summary: "Own APIs and services powering job search and applications.",
    description:
      "You will design and maintain secure, scalable REST APIs used by web and mobile clients. You will work closely with frontend engineers to ensure predictable API contracts and fast iteration.",
    requirements: [
      "3+ years with Node.js and SQL databases",
      "Experience designing REST APIs",
      "Knowledge of authentication and authorization patterns",
      "Comfortable writing tests and reviewing pull requests",
    ],
  },
  {
    id: "job-product-003",
    title: "Product Designer",
    company: "NextHire",
    location: "Hybrid - Abuja, NG",
    type: "Contract",
    salaryRange: "$40/hr - $55/hr",
    summary: "Design end-to-end candidate and recruiter journeys.",
    description:
      "You will define interaction flows and high-fidelity designs for job discovery, profile management, and hiring workflows. This is a hands-on role with regular user feedback loops.",
    requirements: [
      "Portfolio with shipped mobile and web products",
      "Strong UI and interaction design craft",
      "Experience working with product and engineering teams",
      "Ability to run fast experiments and iterate",
    ],
  },
];

export function getJobById(jobId: string) {
  return JOB_LISTINGS.find((job) => job.id === jobId);
}
