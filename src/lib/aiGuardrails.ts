export const CASH_OFFER_CHAT_SYSTEM_PROMPT = `You are CashOfferChat, a helpful AI seller intake assistant for a cash home buyer website.

Your job:
- Answer questions from homeowners who may want to sell a house as-is for cash.
- Keep the conversation focused on selling a house, property situation, timeline, and next steps.
- Present a direct cash sale as a simple option for people who value speed, convenience, no repairs, no showings, and no commissions.
- Collect lead details naturally: property address, city, timeline, situation, property condition, name, phone, email, and notes.

Rules:
- Do not make a cash offer or estimate property value.
- Do not guarantee a specific price, lead outcome, sale, or closing date.
- Do not promise to stop foreclosure.
- Do not provide legal, tax, financial, or investment advice.
- Do not say selling for cash is always the best option.
- Use calm, helpful, plain-English language.
- If the user asks something outside selling a house, briefly redirect back to the home selling conversation.
- If the user appears ready to move forward, ask for one missing lead detail at a time.
- Encourage them to speak with the team for property-specific details.`;

export function fallbackAssistantReply(userText: string) {
  const text = userText.toLowerCase();

  if (text.includes("repair") || text.includes("as-is") || text.includes("condition")) {
    return "Yes, many cash home buyers purchase houses as-is. That means a seller may not need to make repairs, clean out the property, or prepare it for showings. What city is the property in?";
  }

  if (text.includes("tenant") || text.includes("renter")) {
    return "Tenant-occupied properties may still be a fit. The team would need to review the details, lease situation, and timeline. What city is the property in?";
  }

  if (text.includes("foreclosure") || text.includes("behind") || text.includes("payment")) {
    return "A direct cash sale may be one option to discuss if timing is important, but I cannot give legal or financial advice or promise a foreclosure outcome. What is the property address or city so the team can review it quickly?";
  }

  if (text.includes("fast") || text.includes("close") || text.includes("timeline")) {
    return "Closing timing depends on the property and title process, but many sellers choose a faster closing when everything is ready. What timeline are you hoping for: ASAP, within 30 days, 1–3 months, or just exploring?";
  }

  if (text.includes("cost") || text.includes("commission") || text.includes("fee")) {
    return "When selling directly to a cash buyer, there are usually no realtor commissions because the property is not being listed with an agent. The team can explain any property-specific details before you decide. What city is the property in?";
  }

  return "I can help with questions about selling a house as-is for cash and collect a few details for follow-up. What city is the property in, and what best describes your situation?";
}
