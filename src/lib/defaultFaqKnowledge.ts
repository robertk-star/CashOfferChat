import { normalizeForSettingsMatch } from "@/lib/businessSettings";

export type DefaultFAQItem = {
  id: string;
  category: string;
  triggerQuestion: string;
  triggerPhrases: string[];
  answer: string;
};

export const defaultCashBuyerFAQ: DefaultFAQItem[] = [
  {
    id: "offer-price-determined",
    category: "Offer Process & Pricing",
    triggerQuestion: "How is the cash offer price determined for my house?",
    triggerPhrases: [
      "how is the offer determined",
      "how do you determine the offer",
      "how do you price my house",
      "how is cash offer calculated",
      "what determines the offer",
      "how do you calculate the offer",
    ],
    answer:
      "Cash offers are usually based on the property location, size, layout, condition, comparable nearby sales, and the likely value after repairs. If the property needs work, a buyer may factor in repair costs, holding costs, resale risk, and an investor profit margin before making an offer. The exact number depends on the property and local market.",
  },
  {
    id: "full-market-value",
    category: "Offer Process & Pricing",
    triggerQuestion: "Do these companies pay full market value?",
    triggerPhrases: [
      "do you pay full market value",
      "do cash buyers pay market value",
      "will i get full value",
      "do you pay retail",
      "will i get top dollar",
      "why is cash offer lower",
    ],
    answer:
      "A direct cash offer is usually designed for speed, certainty, convenience, and selling as-is, not necessarily for getting the highest retail price. Traditional cash buyers may offer below full retail market value because they take on repair costs, resale risk, holding costs, and closing speed. Some iBuyer-style platforms may offer closer to market value, but they often have stricter property requirements and may charge service fees. The best option depends on your goals and property condition.",
  },
  {
    id: "fees-commissions",
    category: "Fees, Commissions, and Closing Costs",
    triggerQuestion: "Are there any hidden fees, service charges, or commissions?",
    triggerPhrases: [
      "hidden fees",
      "service charges",
      "commissions",
      "do i pay commission",
      "closing costs",
      "realtor fees",
      "do you charge fees",
      "any fees",
    ],
    answer:
      "Many traditional direct cash buyers do not charge realtor commissions or service fees when they buy directly from the seller, and some may cover standard closing costs. iBuyer-style platforms can work differently and may charge service or third-party closing fees. Before signing anything, confirm the exact net amount, fees, and closing terms in writing.",
  },
  {
    id: "clean-repairs",
    category: "Property Condition & Repair Rules",
    triggerQuestion: "Do I need to clean the house or make repairs before selling?",
    triggerPhrases: [
      "do i need to clean",
      "make repairs",
      "fix the house",
      "clean out",
      "leave junk",
      "leave furniture",
      "as is",
      "as-is",
      "trash",
      "broken appliances",
    ],
    answer:
      "Usually no. Many as-is cash buyers can review properties without requiring the seller to clean, paint, repair structural issues, remove unwanted items, or prepare the home for showings. In many cases, unwanted furniture, trash, or broken appliances can be handled after closing. The team still needs to review the property details before confirming what is possible.",
  },
  {
    id: "property-types",
    category: "Property Condition & Repair Rules",
    triggerQuestion: "What specific types of property situations do you buy?",
    triggerPhrases: [
      "what types of houses do you buy",
      "what property situations",
      "foreclosure",
      "bankruptcy",
      "probate",
      "inherited",
      "structural",
      "roof issues",
      "termite",
      "fire damage",
      "flood damage",
      "bad tenants",
      "non paying tenants",
      "duplex",
      "condo",
      "townhome",
    ],
    answer:
      "Cash buyers often review many property situations, including single-family homes, townhomes, duplexes, condos, inherited properties, vacant homes, tenant-occupied properties, homes needing major repairs, roof or structural issues, termite damage, and fire or flood history. Foreclosure, bankruptcy, probate, and tenant issues may involve legal or financial considerations, so the team can review the property details while you also speak with qualified professionals where needed.",
  },
  {
    id: "timeline",
    category: "Timelines, Logistics, and Moving Out",
    triggerQuestion: "How fast can the process move from start to finish?",
    triggerPhrases: [
      "how fast",
      "how quickly",
      "how long does it take",
      "close fast",
      "close in 7 days",
      "close in 14 days",
      "24 hours",
      "48 hours",
      "timeline",
      "when can close",
    ],
    answer:
      "Many cash-offer processes can move quickly. Initial estimates or offers are often discussed within 24 to 48 hours after the seller shares basic details or completes a walkthrough. Closing can sometimes happen in about 7 to 14 days if the title is clean and both sides are ready, but the actual timeline depends on the property, title work, and the seller’s needs.",
  },
  {
    id: "move-out",
    category: "Timelines, Logistics, and Moving Out",
    triggerQuestion: "Do I have to move out immediately upon accepting an offer?",
    triggerPhrases: [
      "move out immediately",
      "when do i move",
      "flexible closing date",
      "choose closing date",
      "need time to move",
      "after closing",
      "stay after closing",
    ],
    answer:
      "Usually no. Many buyers work with sellers to choose a closing or move-out timeline that fits the situation. Some sales can close quickly, while others can be scheduled farther out so the seller has time to coordinate the move. The exact timeline should be agreed to in writing before closing.",
  },
  {
    id: "no-obligation",
    category: "Legality, Agents, and Commitment",
    triggerQuestion: "Am I obligated to sell if I submit my information or request a cash offer?",
    triggerPhrases: [
      "am i obligated",
      "no obligation",
      "do i have to sell",
      "request an offer",
      "submit my information",
      "can i walk away",
      "non binding",
      "free offer",
    ],
    answer:
      "No. Requesting a cash offer or submitting property information is typically free and non-binding. You are not obligated to sell unless you choose to sign a formal purchase agreement. If the offer or terms do not work for you, you can walk away.",
  },
  {
    id: "working-with-agent",
    category: "Legality, Agents, and Commitment",
    triggerQuestion: "Can I still sell to a cash buyer if I am already working with a real estate agent?",
    triggerPhrases: [
      "already have an agent",
      "working with a realtor",
      "listing agent",
      "exclusive contract",
      "listed with agent",
      "agent commission",
    ],
    answer:
      "Possibly. Some cash buyers can work with sellers who already have a real estate agent, and some platforms work directly with listing agents. If you have an active listing or exclusivity agreement, you may still be responsible for your agent’s commission or other contract terms. Review your agreement and speak with your agent or a qualified professional before making a decision.",
  },
];

const ignoredTokens = new Set([
  "you",
  "the",
  "and",
  "for",
  "can",
  "how",
  "does",
  "with",
  "that",
  "this",
  "what",
  "will",
  "would",
  "buy",
  "house",
  "houses",
  "home",
  "property",
  "cash",
  "offer",
]);

function tokens(value: string) {
  return normalizeForSettingsMatch(value)
    .split(" ")
    .filter((token) => token.length > 2 && !ignoredTokens.has(token));
}

export function findDefaultFAQAnswer(message: string) {
  const normalizedMessage = normalizeForSettingsMatch(message);
  let best: { item: DefaultFAQItem; score: number } | null = null;

  for (const item of defaultCashBuyerFAQ) {
    let score = 0;
    const phrases = [item.triggerQuestion, ...item.triggerPhrases];
    for (const phrase of phrases) {
      const normalizedPhrase = normalizeForSettingsMatch(phrase);
      if (!normalizedPhrase) continue;
      if (normalizedMessage.includes(normalizedPhrase)) score += 20;
      const phraseTokens = tokens(phrase);
      for (const token of phraseTokens) {
        if (normalizedMessage.includes(token)) score += 1;
      }
    }

    if (score >= 3 && (!best || score > best.score)) {
      best = { item, score };
    }
  }

  return best?.item || null;
}

export function formatDefaultFAQForPrompt() {
  return defaultCashBuyerFAQ
    .map((item) => `Category: ${item.category}\nQuestion: ${item.triggerQuestion}\nAnswer: ${item.answer}`)
    .join("\n\n");
}
