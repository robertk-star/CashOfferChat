-- CashOfferChat Phase 20: Editable widget welcome message
-- Safe to run more than once.

alter table public.business_settings
  add column if not exists widget_welcome_message text;

update public.business_settings
set widget_welcome_message = 'Hi! I can answer questions about selling a house as-is for cash. If you want a property review, use the quote button and enter the house details.'
where widget_welcome_message is null or trim(widget_welcome_message) = '';
