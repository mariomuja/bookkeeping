import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { JournalEntriesComponent } from './journal-entries.component';
import { JournalEntryService } from '../../services/journal-entry.service';
import { AccountService } from '../../services/account.service';
import { OrganizationService } from '../../services/organization.service';
import { of } from 'rxjs';

describe('JournalEntriesComponent', () => {
  let component: JournalEntriesComponent;
  let fixture: ComponentFixture<JournalEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        JournalEntriesComponent, 
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalEntriesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total debits correctly', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 100, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 250.50, creditAmount: 0, description: '' },
      { accountId: 'acc3', debitAmount: 0, creditAmount: 350.50, description: '' }
    ];

    expect(component.getTotalDebits()).toBe(350.50);
  });

  it('should calculate total credits correctly', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 100, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 0, creditAmount: 250.50, description: '' },
      { accountId: 'acc3', debitAmount: 0, creditAmount: 100, description: '' }
    ];

    expect(component.getTotalCredits()).toBe(350.50);
  });

  it('should validate balanced entry', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 500, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 0, creditAmount: 500, description: '' }
    ];

    expect(component.isBalanced()).toBe(true);
  });

  it('should validate unbalanced entry', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 500, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 0, creditAmount: 400, description: '' }
    ];

    expect(component.isBalanced()).toBe(false);
  });

  it('should handle rounding in balance validation', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 100.005, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 0, creditAmount: 100.006, description: '' }
    ];

    expect(component.isBalanced()).toBe(true); // Difference < 0.01
  });

  it('should add new line', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 0, creditAmount: 0, description: '' }
    ];

    const initialLength = component.lines.length;
    component.addLine();

    expect(component.lines.length).toBe(initialLength + 1);
  });

  it('should remove line if more than 2 lines', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 100, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 0, creditAmount: 50, description: '' },
      { accountId: 'acc3', debitAmount: 0, creditAmount: 50, description: '' }
    ];

    component.removeLine(1);

    expect(component.lines.length).toBe(2);
  });

  it('should not remove line if only 2 lines', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 100, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 0, creditAmount: 100, description: '' }
    ];

    component.removeLine(0);

    expect(component.lines.length).toBe(2); // Should still be 2
  });

  it('should calculate absolute difference correctly', () => {
    component.lines = [
      { accountId: 'acc1', debitAmount: 1000, creditAmount: 0, description: '' },
      { accountId: 'acc2', debitAmount: 0, creditAmount: 900, description: '' }
    ];

    expect(component.getAbsoluteDifference()).toBe(100);
  });
});

