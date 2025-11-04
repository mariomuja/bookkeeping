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
  allEntries: JournalEntry[] = [];
  displayedEntries: JournalEntry[] = [];
  accounts: Account[] = [];
  accountsMap: Map<string, Account> = new Map();
  
  loading = true;
  error: string | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 1000;
  totalPages = 0;
  
  // Search and Filter
  searchQuery = '';
  filterAmount = '';
  filterOperator: '>' | '<' | '=' | '>=' | '<=' = '>';
  
  // Sorting
  sortColumn: string = 'entryNumber';
  sortDirection: 'asc' | 'desc' = 'desc';
  
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
        // Create a map for quick lookups
        this.accountsMap = new Map(accounts.map(a => [a.id, a]));
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

    console.log('[JournalEntries] Loading entries...');
    this.journalEntryService.getJournalEntries(org.id).subscribe({
      next: (entries) => {
        console.log('[JournalEntries] Received entries:', entries.length);
        
        // Populate account information in lines
        entries.forEach(entry => {
          if (entry.lines) {
            entry.lines.forEach(line => {
              if (!line.account && line.accountId) {
                line.account = this.accountsMap.get(line.accountId);
              }
            });
          }
        });
        
        this.allEntries = entries;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load journal entries';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allEntries];
    
    // Apply search query (account number, description)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(entry => {
        // Search in description
        if (entry.description?.toLowerCase().includes(query)) return true;
        
        // Search in reference number
        if (entry.referenceNumber?.toLowerCase().includes(query)) return true;
        
        // Search in entry number
        if (entry.entryNumber?.toLowerCase().includes(query)) return true;
        
        // Search in line accounts
        if (entry.lines) {
          return entry.lines.some(line => {
            const account = line.account || this.accountsMap.get(line.accountId);
            if (!account) return false;
            
            return (
              account.accountNumber?.toLowerCase().includes(query) ||
              account.accountName?.toLowerCase().includes(query) ||
              line.description?.toLowerCase().includes(query)
            );
          });
        }
        
        return false;
      });
    }
    
    // Apply amount filter
    if (this.filterAmount.trim()) {
      const amount = parseFloat(this.filterAmount);
      if (!isNaN(amount)) {
        filtered = filtered.filter(entry => {
          if (!entry.lines) return false;
          
          return entry.lines.some(line => {
            const lineAmount = Math.max(line.debitAmount || 0, line.creditAmount || 0);
            switch (this.filterOperator) {
              case '>': return lineAmount > amount;
              case '<': return lineAmount < amount;
              case '=': return Math.abs(lineAmount - amount) < 0.01;
              case '>=': return lineAmount >= amount;
              case '<=': return lineAmount <= amount;
              default: return true;
            }
          });
        });
      }
    }
    
    // Apply sorting
    filtered = this.sortEntries(filtered);
    
    // Calculate pagination
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    
    // Get current page
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedEntries = filtered.slice(startIndex, endIndex);
    
    console.log(`[JournalEntries] Filtered: ${filtered.length}, Displaying: ${this.displayedEntries.length}, Page ${this.currentPage}/${this.totalPages}`);
  }

  sortEntries(entries: JournalEntry[]): JournalEntry[] {
    return entries.sort((a, b) => {
      let compareResult = 0;
      
      switch (this.sortColumn) {
        case 'status':
          compareResult = (a.status || '').localeCompare(b.status || '');
          break;
          
        case 'entryNumber':
          compareResult = (a.entryNumber || '').localeCompare(b.entryNumber || '');
          break;
          
        case 'date':
          compareResult = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
          break;
          
        case 'description':
          compareResult = (a.description || '').localeCompare(b.description || '');
          break;
          
        case 'debitAccount':
          const debitA = this.getDebitAccount(a);
          const debitB = this.getDebitAccount(b);
          compareResult = (debitA?.accountNumber || '').localeCompare(debitB?.accountNumber || '');
          break;
          
        case 'creditAccount':
          const creditA = this.getCreditAccount(a);
          const creditB = this.getCreditAccount(b);
          compareResult = (creditA?.accountNumber || '').localeCompare(creditB?.accountNumber || '');
          break;
          
        case 'amount':
          compareResult = this.getEntryAmount(a) - this.getEntryAmount(b);
          break;
          
        case 'policyNumber':
          compareResult = this.getCustomFieldValue(a, 'policy_number').localeCompare(
            this.getCustomFieldValue(b, 'policy_number')
          );
          break;
          
        case 'claimNumber':
          compareResult = this.getCustomFieldValue(a, 'claim_number').localeCompare(
            this.getCustomFieldValue(b, 'claim_number')
          );
          break;
          
        case 'reference':
          compareResult = (a.referenceNumber || '').localeCompare(b.referenceNumber || '');
          break;
      }
      
      return this.sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 7;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      const start = Math.max(2, this.currentPage - 2);
      const end = Math.min(this.totalPages - 1, this.currentPage + 2);
      
      if (start > 2) pages.push(-1); // Ellipsis
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < this.totalPages - 1) pages.push(-1); // Ellipsis
      
      // Always show last page
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterAmount = '';
    this.currentPage = 1;
    this.applyFilters();
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
    const account = this.accountsMap.get(accountId);
    return account ? `${account.accountNumber} - ${account.accountName}` : accountId;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getAbsoluteDifference(): number {
    return Math.abs(this.getTotalDebits() - this.getTotalCredits());
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'DRAFT': 'gray',
      'POSTED': 'green',
      'VOID': 'red'
    };
    return colors[status] || 'gray';
  }

  getTotalFilteredCount(): number {
    return this.allEntries.length;
  }

  getDisplayRange(): string {
    if (this.displayedEntries.length === 0) return '0-0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(start + this.displayedEntries.length - 1, this.getTotalFilteredCount());
    return `${start}-${end}`;
  }

  // Table display helpers
  getDebitAccount(entry: JournalEntry): Account | undefined {
    if (!entry.lines || entry.lines.length === 0) return undefined;
    const debitLine = entry.lines.find(l => l.debitAmount > 0);
    if (!debitLine) return undefined;
    return debitLine.account || this.accountsMap.get(debitLine.accountId);
  }

  getCreditAccount(entry: JournalEntry): Account | undefined {
    if (!entry.lines || entry.lines.length === 0) return undefined;
    const creditLine = entry.lines.find(l => l.creditAmount > 0);
    if (!creditLine) return undefined;
    return creditLine.account || this.accountsMap.get(creditLine.accountId);
  }

  getEntryAmount(entry: JournalEntry): number {
    if (!entry.lines || entry.lines.length === 0) return 0;
    const debitLine = entry.lines.find(l => l.debitAmount > 0);
    return debitLine ? debitLine.debitAmount : 0;
  }

  getCustomFieldValue(entry: JournalEntry, fieldName: string): string {
    if (!entry.customFields || entry.customFields.length === 0) return '-';
    
    const field = entry.customFields.find(cf => 
      cf.definition?.fieldName === fieldName || 
      cf.fieldDefinitionId === fieldName
    );
    
    return field ? field.fieldValue : '-';
  }
}
