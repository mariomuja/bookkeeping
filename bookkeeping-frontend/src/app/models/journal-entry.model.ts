import { JournalEntryCustomField } from './custom-field.model';

export interface JournalEntry {
  id: string;
  organizationId: string;
  entryNumber: string;
  entryDate: Date;
  entryTimestamp: Date;
  fiscalPeriodId?: string;
  description: string;
  referenceNumber?: string;
  documentType?: string;
  source: string;
  currency: string;
  exchangeRate: number;
  baseCurrency: string;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  postedAt?: Date;
  postedBy?: string;
  voidReason?: string;
  voidedAt?: Date;
  voidedBy?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lines?: JournalEntryLine[];
  customFields?: JournalEntryCustomField[];
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  lineNumber: number;
  accountId: string;
  account?: { accountNumber: string; accountName: string };
  debitAmount: number;
  creditAmount: number;
  debitBaseAmount: number;
  creditBaseAmount: number;
  description?: string;
  costCenter?: string;
  taxCode?: string;
  taxAmount: number;
}

export interface CreateJournalEntryRequest {
  entryDate: string;
  description: string;
  referenceNumber?: string;
  documentType?: string;
  currency: string;
  lines: CreateJournalEntryLine[];
}

export interface CreateJournalEntryLine {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  costCenter?: string;
  taxCode?: string;
}

