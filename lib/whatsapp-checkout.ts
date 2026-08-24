/**
 * whatsapp-checkout.ts
 * -----------------------------------------------------------------------
 * Builds a clean, readable order receipt and turns it into a wa.me deep
 * link that opens WhatsApp with the message pre-filled, addressed to the
 * showroom's business number. This is the "checkout" flow for markets
 * where customers trust a human conversation over an online payment form.
 * -----------------------------------------------------------------------
 */

// Shape of a single line item, matching what the cart drawer already tracks.
export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number; // unit price actually charged (after discount)
  qty: number;
}

export interface WhatsAppCheckoutOptions {
  /** Business WhatsApp number in international format, digits only, no "+". e.g. "919876543210" */
  businessPhone: string;
  /** Optional customer name, if collected before checkout. */
  customerName?: string;
  /** Optional delivery pincode/city, if collected before checkout. */
  location?: string;
}

/** Formats a number as Indian-locale rupees, e.g. 12999 -> "₹12,999" */
function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Builds the plain-text receipt shown inside the WhatsApp message.
 * Kept as its own function so it can also be used for order confirmation
 * emails, printed receipts, etc. — not just the WhatsApp link.
 */
export function buildReceiptText(
  cartItems: CartItem[],
  total: number,
  options?: Pick<WhatsAppCheckoutOptions, "customerName" | "location">
): string {
  if (cartItems.length === 0) {
    throw new Error("buildReceiptText: cartItems must not be empty");
  }

  const lines: string[] = [];

  lines.push("🧵 *Vastra Mahal — Order Request*");
  lines.push("");

  if (options?.customerName) {
    lines.push(`Customer: ${options.customerName}`);
  }
  if (options?.location) {
    lines.push(`Delivery to: ${options.location}`);
  }
  if (options?.customerName || options?.location) {
    lines.push("");
  }

  lines.push("*Items:*");
  cartItems.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    lines.push(
      `${i + 1}. ${item.name} (${item.category}) — Qty ${item.qty} × ${formatINR(item.price)} = ${formatINR(lineTotal)}`
    );
  });

  lines.push("");
  lines.push(`*Total: ${formatINR(total)}*`);
  lines.push("");
  lines.push("Please confirm availability and delivery timeline. Thank you!");

  return lines.join("\n");
}

/**
 * Builds a ready-to-use https://wa.me link. Opening this URL (e.g. via
 * an <a href> or window.open) launches WhatsApp with the receipt text
 * pre-filled in the message box, addressed to the store's number.
 *
 * The customer still has to tap "Send" themselves — this is intentional:
 * WhatsApp does not allow sending messages without explicit user action,
 * which also means no message is ever sent on the store's behalf silently.
 */
export function buildWhatsAppCheckoutLink(
  cartItems: CartItem[],
  total: number,
  options: WhatsAppCheckoutOptions
): string {
  const digitsOnly = options.businessPhone.replace(/\D/g, "");
  if (!digitsOnly) {
    throw new Error("buildWhatsAppCheckoutLink: businessPhone must contain digits");
  }

  const receipt = buildReceiptText(cartItems, total, options);
  const encodedText = encodeURIComponent(receipt);

  return `https://wa.me/${digitsOnly}?text=${encodedText}`;
}

/*
 * -----------------------------------------------------------------------
 * EXAMPLE USAGE (e.g. inside the cart drawer's checkout button)
 * -----------------------------------------------------------------------
 *
 * const link = buildWhatsAppCheckoutLink(cartItems, cartTotal, {
 *   businessPhone: "919876543210",
 *   customerName: "Priya",
 *   location: "Warangal, TG",
 * });
 *
 * <a href={link} target="_blank" rel="noreferrer">
 *   Proceed to Order via WhatsApp
 * </a>
 * -----------------------------------------------------------------------
 */
