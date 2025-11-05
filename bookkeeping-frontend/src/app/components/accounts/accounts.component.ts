import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { OrganizationService } from '../../services/organization.service';
import { Account, AccountType } from '../../models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export interface AccountFramework {
  id: string;
  name: string;
  country: string;
  description: string;
  accountCount: number;
}

export interface FrameworkAccount {
  number: string;
  name: string;
  type: string;
  category: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  accounts: Account[];
  skippedAccounts: any[];
  framework: string;
}

export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  accountTypes: AccountType[] = [];
  filteredAccounts: Account[] = [];
  loading = true;
  error: string | null = null;
  
  searchQuery = '';
  filterCategory = 'ALL';
  showModal = false;
  isEditMode = false;
  
  // Framework import properties
  showFrameworkModal = false;
  frameworks: AccountFramework[] = [];
  selectedFramework: string = '';
  frameworkAccounts: FrameworkAccount[] = [];
  selectedAccountNumbers: string[] = [];
  loadingFrameworks = false;
  loadingFrameworkAccounts = false;
  importing = false;
  importResult: ImportResult | null = null;
  
  currentAccount: Partial<Account> = {
    accountNumber: '',
    accountName: '',
    accountTypeId: 0,
    currency: 'USD',
    isSystemAccount: false,
    isActive: true
  };

  constructor(
    private accountService: AccountService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadAccountTypes();
    this.loadAccounts();
  }

  loadAccountTypes(): void {
    this.accountService.getAccountTypes().subscribe({
      next: (types) => {
        this.accountTypes = types;
      },
      error: (err) => {
        console.error('Failed to load account types:', err);
      }
    });
  }

  loadAccounts(): void {
    const org = this.organizationService.getCurrentOrganization();
    console.log('[AccountsComponent] Current organization:', org);
    
    if (!org) {
      this.error = 'Please select an organization';
      this.loading = false;
      console.error('[AccountsComponent] No organization found!');
      return;
    }

    console.log('[AccountsComponent] Fetching accounts for org:', org.id);
    this.accountService.getAccounts(org.id).subscribe({
      next: (accounts) => {
        console.log('[AccountsComponent] Received accounts:', accounts.length, accounts);
        this.accounts = accounts;
        this.filteredAccounts = accounts;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load accounts';
        this.loading = false;
        console.error('[AccountsComponent] Error loading accounts:', err);
      }
    });
  }

  filterAccounts(): void {
    this.filteredAccounts = this.accounts.filter(account => {
      const matchesSearch = 
        account.accountNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        account.accountName.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = this.filterCategory === 'ALL' || 
        account.accountType?.category === this.filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentAccount = {
      accountNumber: '',
      accountName: '',
      accountTypeId: this.accountTypes[0]?.id || 0,
      currency: 'USD',
      isSystemAccount: false,
      isActive: true
    };
    this.showModal = true;
  }

  openEditModal(account: Account): void {
    this.isEditMode = true;
    this.currentAccount = { ...account };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveAccount(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    if (this.isEditMode && this.currentAccount.id) {
      this.accountService.updateAccount(this.currentAccount.id, this.currentAccount).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeModal();
        },
        error: (err) => {
          alert('Failed to update account');
          console.error(err);
        }
      });
    } else {
      this.accountService.createAccount(org.id, this.currentAccount).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeModal();
        },
        error: (err) => {
          alert('Failed to create account');
          console.error(err);
        }
      });
    }
  }

  deleteAccount(account: Account): void {
    if (!confirm(`Are you sure you want to delete account ${account.accountNumber} - ${account.accountName}?`)) {
      return;
    }

    this.accountService.deleteAccount(account.id).subscribe({
      next: () => {
        this.loadAccounts();
      },
      error: (err) => {
        alert('Failed to delete account');
        console.error(err);
      }
    });
  }

  getAccountTypeName(accountTypeId: number): string {
    return this.accountTypes.find(t => t.id === accountTypeId)?.name || 'Unknown';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'ASSET': 'blue',
      'LIABILITY': 'red',
      'EQUITY': 'green',
      'REVENUE': 'purple',
      'EXPENSE': 'orange'
    };
    return colors[category] || 'gray';
  }

  // Framework import methods
  openFrameworkModal(): void {
    this.showFrameworkModal = true;
    this.importResult = null;
    this.loadFrameworks();
  }

  closeFrameworkModal(): void {
    this.showFrameworkModal = false;
    this.selectedFramework = '';
    this.frameworkAccounts = [];
    this.selectedAccountNumbers = [];
    this.importResult = null;
  }

  loadFrameworks(): void {
    this.loadingFrameworks = true;
    this.accountService.getAccountFrameworks().subscribe({
      next: (frameworks) => {
        this.frameworks = frameworks;
        this.loadingFrameworks = false;
      },
      error: (err) => {
        console.error('Failed to load frameworks:', err);
        this.loadingFrameworks = false;
        alert('Failed to load account frameworks');
      }
    });
  }

  onFrameworkChange(): void {
    if (!this.selectedFramework) {
      this.frameworkAccounts = [];
      this.selectedAccountNumbers = [];
      return;
    }

    this.loadingFrameworkAccounts = true;
    this.accountService.getFrameworkAccounts(this.selectedFramework).subscribe({
      next: (accounts) => {
        this.frameworkAccounts = accounts;
        this.selectedAccountNumbers = []; // Reset selection
        this.loadingFrameworkAccounts = false;
      },
      error: (err) => {
        console.error('Failed to load framework accounts:', err);
        this.loadingFrameworkAccounts = false;
        alert('Failed to load framework accounts');
      }
    });
  }

  toggleAccountSelection(accountNumber: string): void {
    const index = this.selectedAccountNumbers.indexOf(accountNumber);
    if (index > -1) {
      this.selectedAccountNumbers.splice(index, 1);
    } else {
      this.selectedAccountNumbers.push(accountNumber);
    }
  }

  selectAllAccounts(): void {
    this.selectedAccountNumbers = this.frameworkAccounts.map(acc => acc.number);
  }

  deselectAllAccounts(): void {
    this.selectedAccountNumbers = [];
  }

  isAccountSelected(accountNumber: string): boolean {
    return this.selectedAccountNumbers.includes(accountNumber);
  }

  importSelectedAccounts(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org || !this.selectedFramework) return;

    if (this.selectedAccountNumbers.length === 0) {
      alert('Please select at least one account to import');
      return;
    }

    this.importing = true;
    this.accountService.importFrameworkAccounts(org.id, this.selectedFramework, this.selectedAccountNumbers).subscribe({
      next: (result) => {
        this.importResult = result;
        this.importing = false;
        this.loadAccounts(); // Reload accounts to show newly imported ones
        
        // Show success message
        const message = `Successfully imported ${result.imported} account(s). ${result.skipped} account(s) were skipped (already exist).`;
        alert(message);
        
        // Reset selection but keep modal open to see results
        this.selectedAccountNumbers = [];
      },
      error: (err) => {
        console.error('Failed to import accounts:', err);
        this.importing = false;
        alert('Failed to import accounts');
      }
    });
  }

  importAllAccounts(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org || !this.selectedFramework) return;

    if (!confirm(`Import all ${this.frameworkAccounts.length} accounts from ${this.selectedFramework}?`)) {
      return;
    }

    this.importing = true;
    this.accountService.importFrameworkAccounts(org.id, this.selectedFramework, []).subscribe({
      next: (result) => {
        this.importResult = result;
        this.importing = false;
        this.loadAccounts();
        
        const message = `Successfully imported ${result.imported} account(s). ${result.skipped} account(s) were skipped (already exist).`;
        alert(message);
      },
      error: (err) => {
        console.error('Failed to import accounts:', err);
        this.importing = false;
        alert('Failed to import accounts');
      }
    });
  }
}

