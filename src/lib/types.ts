export type SellerLeadInput = {
  name?: string;
  phone?: string;
  email?: string;
  propertyAddress?: string;
  propertyCity?: string;
  timeline?: string;
  situation?: string;
  propertyCondition?: string;
  notes?: string;
  sourceUrl?: string;
  conversationId?: string;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
