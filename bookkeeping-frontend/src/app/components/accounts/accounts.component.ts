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
}

