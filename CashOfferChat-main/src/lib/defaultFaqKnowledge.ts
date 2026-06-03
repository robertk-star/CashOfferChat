export type DefaultFAQItem = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

export const defaultFaqItems: DefaultFAQItem[] = [
  {
    id: "as-is",
    question: "Do you buy houses as-is?",
    keywords: ["as is", "as-is", "repairs", "fix", "clean", "cleanout", "junk", "condition"],
    answer:
      "Yes. Many as-is cash buyers can review houses without requiring the seller to make repairs, clean out the property, paint, or prepare it for showings first. The exact details depend on the property, but you can enter the house information if you want the team to review it.",
  },
  {
    id: "timeline",
    question: "How fast can the process move from start to finish?",
    keywords: ["how fast", "close", "closing", "timeline", "how long", "quick", "asap", "days"],
    answer:
      "Some cash sale processes can move quickly, often within days to a couple of weeks if the title is clear and both sides are ready. The exact timing depends on the property, title status, and your preferred move-out timeline.",
  },
  {
    id: "fees",
    question: "Are there hidden fees, service charges, or commissions?",
    keywords: ["fee", "fees", "commission", "commissions", "closing cost", "costs", "service charge", "hidden"],
    answer:
      "Many traditional direct cash buyers do not charge realtor commissions or service fees, but exact terms should always be confirmed before signing. Some iBuyer-style platforms or marketplaces may charge service fees or third-party closing costs.",
  },
  {
    id: "market-value",
    question: "Do cash buyers pay full market value?",
    keywords: ["full market", "market value", "fmv", "top dollar", "retail", "worth", "value"],
    answer:
      "A direct cash offer is usually designed for speed, convenience, and selling as-is, not necessarily for getting the highest retail price. Cash buyers may offer below full retail value because they take on repair costs, resale risk, holding costs, and the convenience of a faster sale.",
  },
  {
    id: "offer-process",
    question: "How is the cash offer price determined?",
    keywords: ["offer price", "offer determined", "calculate", "formula", "cash offer", "how much", "price determined"],
    answer:
      "A cash offer is generally based on the property location, size, layout, condition, nearby comparable sales, estimated repair costs, holding costs, resale risk, and the buyer’s expected margin. The team usually needs the property details before giving a serious review.",
  },
  {
    id: "property-types",
    question: "What types of property situations do cash buyers handle?",
    keywords: ["types", "property type", "duplex", "condo", "townhome", "inherited", "probate", "vacant", "fire", "flood", "termite", "structural"],
    answer:
      "Cash buyers often review single-family homes, townhomes, duplexes, condos, inherited properties, vacant houses, rental properties, tenant-occupied houses, and properties needing repairs. Exact buying criteria depend on the business and local market.",
  },
  {
    id: "tenants",
    question: "Do you buy houses with tenants?",
    keywords: ["tenant", "tenants", "renter", "renters", "rental", "occupied", "non paying", "lease"],
    answer:
      "Tenant-occupied properties can often be reviewed. The team may want to know whether the tenant is current, month-to-month, under lease, or causing issues. You can enter the property information so they can review the situation.",
  },
  {
    id: "obligation",
    question: "Am I obligated to sell if I request a cash offer?",
    keywords: ["obligated", "obligation", "no obligation", "commit", "required", "have to sell", "free offer"],
    answer:
      "No. Requesting information or a cash offer is generally non-binding. You are not obligated unless you choose to sign a formal purchase agreement. If an offer does not meet your needs, you can walk away.",
  },
  {
    id: "agent",
    question: "Can I sell to a cash buyer if I already have a real estate agent?",
    keywords: ["agent", "realtor", "listed", "listing", "mls", "exclusivity", "commission"],
    answer:
      "It may be possible, but if you have an active listing agreement or exclusivity contract, you may still have obligations to your agent. Review your agreement or speak with your agent or a qualified professional before making a decision.",
  },
  {
    id: "foreclosure",
    question: "Can you stop foreclosure?",
    keywords: ["foreclosure", "auction", "behind", "payments", "bankruptcy", "default", "notice"],
    answer:
      "A fast sale may be one option to discuss, but CashOfferChat cannot provide legal or financial advice or guarantee any foreclosure outcome. If there is a deadline, it is important to speak with a qualified professional as well as the buying team quickly.",
  },
  {
    id: "move-out",
    question: "Do I have to move out immediately after accepting an offer?",
    keywords: ["move out", "move-out", "moving", "stay", "closing date", "possession", "relocation"],
    answer:
      "Not necessarily. Many buyers can work with the seller on a closing and move-out timeline. The exact timing should be discussed with the team before signing an agreement.",
  },
];

export function getDefaultFaqItems() {
  return defaultFaqItems;
}
