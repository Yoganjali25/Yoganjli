// Helper to convert number amounts to Indian Currency English Words
// e.g. 2200 -> "Two Thousand Two Hundred Rupees Only"

export function numberToIndianRupeesWords(num: number): string {
  if (!num || isNaN(num) || num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  };

  let n = Math.floor(Math.abs(num));
  let words = '';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  if (crore > 0) words += inWords(crore) + ' Crore ';
  if (lakh > 0) words += inWords(lakh) + ' Lakh ';
  if (thousand > 0) words += inWords(thousand) + ' Thousand ';
  if (hundred > 0) words += inWords(hundred) + ' ';

  const paise = Math.round((Math.abs(num) - Math.floor(Math.abs(num))) * 100);
  let paiseWords = '';
  if (paise > 0) {
    paiseWords = ' and ' + inWords(paise) + ' Paise';
  }

  return (words.trim() + ' Rupees' + paiseWords + ' Only').replace(/\s+/g, ' ');
}

export interface InvoiceLineItem {
  id: string;
  title: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  
  // Biller
  billerName: string;
  billerInstructor: string;
  billerAddress: string;
  billerEmail: string;
  billerPhone: string;
  billerLogoUrl: string;

  // Bill To (Client or Brand)
  clientName: string;
  clientSubtitle: string;
  clientInstagram: string;
  clientLogoUrl: string;

  // Reel / Collab Link
  collabReelLink: string;

  // Items
  items: InvoiceLineItem[];

  // Bank
  bankAccountHolder: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankUpiId: string;

  // Notes
  notes: string[];
  footerNote: string;
}

export const DEFAULT_SAMPLE_INVOICE: InvoiceData = {
  invoiceNo: 'YG/25-26/012',
  invoiceDate: '2026-05-31',
  dueDate: '2026-06-15',

  billerName: 'Yoganjali',
  billerInstructor: 'Anjali Negi',
  billerAddress: 'Srinagar Garhwal, Pauri Uttarakhand',
  billerEmail: 'Negidytto@gmail.com',
  billerPhone: '8449137304',
  billerLogoUrl: '/yoganjali-logo.png',

  clientName: 'Sirona Hygiene',
  clientSubtitle: 'Breaking taboos & solving unaddressed period & intimate hygiene issues for vulva owners!',
  clientInstagram: '@sironahygiene',
  clientLogoUrl: '',

  collabReelLink: 'https://www.instagram.com/reels/DZ1GcJ1heKx/',

  items: [
    {
      id: '1',
      title: 'Instagram Reel Creation',
      description: 'Content creation, shooting, editing and posting\n(Refer Reel Link Above)',
      qty: 1,
      unitPrice: 2000
    },
    {
      id: '2',
      title: 'Product Cost / Reimbursement',
      description: 'Reimbursement for product received',
      qty: 1,
      unitPrice: 200
    }
  ],

  bankAccountHolder: 'ANOOP NEGI',
  bankName: 'SBI (State Bank of India)',
  bankAccountNumber: '35873988790',
  bankIfscCode: 'SBIN0006778',
  bankUpiId: '8449137304@upi',

  notes: [
    'Payment to be made within 15 days from the invoice date.',
    'Please share the payment screenshot once the transaction is completed.',
    'For any queries, feel free to reach out.'
  ],
  footerNote: 'Thank you for your timely payment.'
};
