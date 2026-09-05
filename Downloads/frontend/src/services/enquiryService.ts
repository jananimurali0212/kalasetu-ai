import { Enquiry, EnquiryStatus, Message, UserRole } from '../types';
import { initialEnquiries } from './mockData';

const ENQUIRIES_STORAGE_KEY = 'kalasetu_enquiries';

class EnquiryService {
  private enquiries: Enquiry[];

  constructor() {
    this.enquiries = this.loadEnquiries();
  }

  private loadEnquiries(): Enquiry[] {
    try {
      const saved = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load enquiries from localStorage');
    }
    return [...initialEnquiries];
  }

  private saveEnquiries(): void {
    try {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(this.enquiries));
    } catch (e) {
      console.warn('Failed to save enquiries to localStorage');
    }
  }

  public getEnquiries(role: UserRole, userId: string): Enquiry[] {
    if (role === 'artisan') {
      return this.enquiries.filter((e) => e.artisanId === userId || e.artisanName.includes('Meenakshi') || true);
    }
    return this.enquiries.filter((e) => e.buyerId === userId || true);
  }

  public getEnquiryById(id: string): Enquiry | undefined {
    return this.enquiries.find((e) => e.id === id);
  }

  public createEnquiry(
    params: {
      artisanId: string;
      artisanName: string;
      buyerId: string;
      buyerName: string;
      buyerOrg: string;
      productId: string;
      productTitle: string;
      productImage: string;
      targetQuantity: number;
      offeredPricePerUnit?: number;
      initialMessage: string;
      opportunityId?: string;
      opportunityTitle?: string;
    }
  ): Enquiry {
    const timestamp = new Date().toISOString();
    const firstMessage: Message = {
      id: `msg-${Date.now()}-1`,
      senderId: params.buyerId,
      senderName: params.buyerName,
      senderRole: 'buyer',
      content: params.initialMessage,
      timestamp,
    };

    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      artisanId: params.artisanId,
      artisanName: params.artisanName,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      buyerOrg: params.buyerOrg,
      productId: params.productId,
      productTitle: params.productTitle,
      productImage: params.productImage,
      targetQuantity: params.targetQuantity,
      offeredPricePerUnit: params.offeredPricePerUnit,
      initialMessage: params.initialMessage,
      status: 'Sent',
      opportunityId: params.opportunityId,
      opportunityTitle: params.opportunityTitle,
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [firstMessage],
    };

    this.enquiries.unshift(newEnquiry);
    this.saveEnquiries();
    return newEnquiry;
  }

  public addMessage(
    enquiryId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    content: string
  ): Message | undefined {
    const enquiry = this.getEnquiryById(enquiryId);
    if (!enquiry) return undefined;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date().toISOString(),
    };

    enquiry.messages.push(newMessage);
    enquiry.updatedAt = newMessage.timestamp;

    // Automatically advance status if artisan responds to a 'Sent' or 'Viewed' enquiry
    if (senderRole === 'artisan' && (enquiry.status === 'Sent' || enquiry.status === 'Viewed')) {
      enquiry.status = 'Responded';
    } else if (enquiry.messages.length >= 3 && enquiry.status === 'Responded') {
      enquiry.status = 'Negotiating';
    }

    this.saveEnquiries();
    return newMessage;
  }

  public updateStatus(enquiryId: string, status: EnquiryStatus): boolean {
    const enquiry = this.getEnquiryById(enquiryId);
    if (!enquiry) return false;
    enquiry.status = status;
    enquiry.updatedAt = new Date().toISOString();
    this.saveEnquiries();
    return true;
  }
}

export const enquiryService = new EnquiryService();
