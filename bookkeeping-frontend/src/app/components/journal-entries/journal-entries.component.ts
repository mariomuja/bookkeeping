import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalEntryService } from '../../services/journal-entry.service';
import { AccountService } from '../../services/account.service';
import { OrganizationService } from '../../services/organization.service';
import { JournalEntry, CreateJournalEntryLine } from '../../models/journal-entry.model';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-journal-entries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-entries.component.html',
  styleUrls: ['./journal-entries.component.css']
})
export class JournalEntriesComponent implements OnInit {
  entries: JournalEntry[] = [];
  accounts: Account[] = [];
  loading = true;
  error: string | null = null;
  
  showModal = false;
  
  newEntry = {
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    referenceNumber: '',
    documentType: 'JOURNAL',
    currency: 'USD'
  };
  
  lines: CreateJournalEntryLine[] = [];
  
  constructor(
    private journalEntryService: JournalEntryService,
    private accountService: AccountService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadEntries();
  }

  loadAccounts(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    this.accountService.getAccounts(org.id).subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(a => a.isActive);
      },
      error: (err) => console.error('Failed to load accounts:', err)
    });
  }

  loadEntries(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      this.error = 'Please select an organization';
      this.loading = false;
      return;
    }

    this.journalEntryService.getJournalEntries(org.id).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load journal entries';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openCreateModal(): void {
    this.newEntry = {
      entryDate: new Date().toISOString().split('T')[0],
      description: '',
      referenceNumber: '',
      documentType: 'JOURNAL',
      currency: 'USD'
    };
    this.lines = [
      { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
      { accountId: '', debitAmount: 0, creditAmount: 0, description: '' }
    ];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addLine(): void {
    this.lines.push({
      accountId: '',
      debitAmount: 0,
      creditAmount: 0,
      description: ''
    });
  }

  removeLine(index: number): void {
    if (this.lines.length > 2) {
      this.lines.splice(index, 1);
    }
  }

  getTotalDebits(): number {
    return this.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  }

  getTotalCredits(): number {
    return this.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  }

  isBalanced(): boolean {
    const diff = Math.abs(this.getTotalDebits() - this.getTotalCredits());
    return diff < 0.01;
  }

  saveEntry(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    if (!this.isBalanced()) {
      alert('Entry is not balanced! Debits must equal Credits.');
      return;
    }

    const request = {
      ...this.newEntry,
      lines: this.lines.filter(l => l.accountId && (l.debitAmount > 0 || l.creditAmount > 0))
    };

    this.journalEntryService.createJournalEntry(org.id, request).subscribe({
      next: () => {
        this.loadEntries();
        this.closeModal();
      },
      error: (err) => {
        alert('Failed to create journal entry');
        console.error(err);
      }
    });
  }

  postEntry(entry: JournalEntry): void {
    if (!confirm('Are you sure you want to post this entry? This action cannot be undone.')) {
      return;
    }

    this.journalEntryService.postJournalEntry(entry.id, 'Admin').subscribe({
      next: () => {
        this.loadEntries();
      },
      error: (err) => {
        alert('Failed to post entry');
        console.error(err);
      }
    });
  }

  voidEntry(entry: JournalEntry): void {
    const reason = prompt('Please enter a reason for voiding this entry:');
    if (!reason) return;

    this.journalEntryService.voidJournalEntry(entry.id, reason, 'Admin').subscribe({
      next: () => {
        this.loadEntries();
      },
      error: (err) => {
        alert('Failed to void entry');
        console.error(err);
      }
    });
  }

  getAccountName(accountId: string): string {
    const account = this.accounts.find(a => a.id === accountId);
    return account ? `${account.accountNumber} - ${account.accountName}` : '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'DRAFT': 'gray',
      'POSTED': 'green',
      'VOID': 'red'
    };
    return colors[status] || 'gray';
  }
}

