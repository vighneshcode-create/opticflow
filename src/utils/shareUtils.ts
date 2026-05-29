import { Customer, Order } from '../types';
import { getStoreSettings } from './storeSettings';

export function getWhatsAppMessage(customer: Customer, order: Order): string {
  const settings = getStoreSettings();
  const itemSummary = order.items
    .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
    .join('\n');

  return `Hello *${customer.name}*,\n\nThank you for visiting *${settings.storeName}*! Here are the details of your recent purchase:\n\n*Invoice ID:* #${order.id}\n*Date:* ${order.date}\n\n*Items Purchased:*\n${itemSummary}\n\n*Total Amount:* ₹${order.total.toLocaleString('en-IN')}\n*Payment Status:* ${order.status}\n\nWe have generated your Digital E-prescription & E-bill. You can download and save it directly from your device.\n\n_If you have any questions or require adjustments, please reply to this chat._\n\nBest regards,\n*${settings.storeName}*\n${settings.practitionerName}, ${settings.practitionerTitle}`;
}

export function getWhatsAppUrl(customer: Customer, order: Order): string {
  const formattedPhone = customer.mobile.replace(/\D/g, '');
  // Append country code 91 if length is 10 digits
  const targetPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
  const text = encodeURIComponent(getWhatsAppMessage(customer, order));
  return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${text}`;
}

export function getSMSMessage(customer: Customer, order: Order): string {
  const settings = getStoreSettings();
  return `Hello ${customer.name}, your ${settings.storeName} bill #${order.id} for Rs.${order.total.toLocaleString('en-IN')} is generated. Thank you for your trust! ${settings.practitionerName}`;
}

export function getSMSUrl(customer: Customer, order: Order): string {
  const formattedPhone = customer.mobile.replace(/\D/g, '');
  const text = encodeURIComponent(getSMSMessage(customer, order));
  
  // Return different sms schema for iOS/Android
  return `sms:${formattedPhone}?&body=${text}`;
}
