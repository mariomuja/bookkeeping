// DATEV Export Module Tests

const { DatevExporter } = require('../datev-export');

describe('DatevExporter', () => {
  let exporter;
  
  beforeEach(() => {
    exporter = new DatevExporter('SKR03');
  });

  describe('Constructor', () => {
    test('should create instance with SKR03 framework', () => {
      expect(exporter.accountFramework).toBe('SKR03');
      expect(exporter.version).toBe('7.0');
    });

    test('should create instance with SKR04 framework', () => {
      const exporter04 = new DatevExporter('SKR04');
      expect(exporter04.accountFramework).toBe('SKR04');
    });
  });

  describe('Format Amount', () => {
    test('should format amount with comma decimal separator', () => {
      expect(exporter.formatAmount(1234.56)).toBe('1234,56');
    });

    test('should format zero correctly', () => {
      expect(exporter.formatAmount(0)).toBe('0,00');
    });

    test('should format negative amount', () => {
      expect(exporter.formatAmount(-500.75)).toBe('-500,75');
    });

    test('should round to 2 decimal places', () => {
      expect(exporter.formatAmount(100.999)).toBe('101,00');
    });
  });

  describe('Format DATEV Date', () => {
    test('should format date as DDMM', () => {
      const date = new Date('2024-01-15');
      expect(exporter.formatDatevDate(date)).toBe('1501');
    });

    test('should handle end of year date', () => {
      const date = new Date('2024-12-31');
      expect(exporter.formatDatevDate(date)).toBe('3112');
    });

    test('should return empty string for null date', () => {
      expect(exporter.formatDatevDate(null)).toBe('');
    });

    test('should pad single digit day and month', () => {
      const date = new Date('2024-05-05');
      expect(exporter.formatDatevDate(date)).toBe('0505');
    });
  });

  describe('Clean Description', () => {
    test('should remove semicolons', () => {
      expect(exporter.cleanDescription('Text; with; semicolons')).toBe('Text  with  semicolons');
    });

    test('should remove line breaks', () => {
      expect(exporter.cleanDescription('Line 1\nLine 2\rLine 3')).toBe('Line 1 Line 2 Line 3');
    });

    test('should limit to 60 characters', () => {
      const longText = 'A'.repeat(100);
      expect(exporter.cleanDescription(longText).length).toBe(60);
    });

    test('should handle empty string', () => {
      expect(exporter.cleanDescription('')).toBe('');
    });

    test('should handle null', () => {
      expect(exporter.cleanDescription(null)).toBe('');
    });
  });

  describe('Generate Filename', () => {
    test('should generate correct filename for transactions', () => {
      const filename = exporter.generateFilename(1000, 10001, 'TRANSACTIONS');
      expect(filename).toMatch(/^EXTF_Buchungsstapel_1000_10001_\d{8}\.csv$/);
    });

    test('should generate correct filename for balances', () => {
      const filename = exporter.generateFilename(1000, 10001, 'BALANCES');
      expect(filename).toMatch(/^EXTF_Kontenbeschriftungen_1000_10001_\d{8}\.csv$/);
    });
  });

  describe('Validate Export Data', () => {
    test('should pass validation for balanced entries', () => {
      const entries = [{
        id: '1',
        organizationId: 'org1',
        status: 'POSTED'
      }];
      
      const lines = [
        { id: 'l1', journalEntryId: '1', accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { id: 'l2', journalEntryId: '1', accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const validation = exporter.validateExportData(entries, lines);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should fail validation for unbalanced entries', () => {
      const entries = [{
        id: '1',
        entryNumber: 'JE-001',
        organizationId: 'org1',
        status: 'POSTED'
      }];
      
      const lines = [
        { id: 'l1', journalEntryId: '1', accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { id: 'l2', journalEntryId: '1', accountId: 'a2', debitAmount: 0, creditAmount: 50 }
      ];

      const validation = exporter.validateExportData(entries, lines);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0].error).toContain('Unbalanced');
    });

    test('should detect missing account assignments', () => {
      const entries = [{ id: '1', status: 'POSTED' }];
      const lines = [
        { id: 'l1', journalEntryId: '1', accountId: null, debitAmount: 100, creditAmount: 0 }
      ];

      const validation = exporter.validateExportData(entries, lines);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.error.includes('without account'))).toBe(true);
    });
  });

  describe('Get Account Framework Info', () => {
    test('should return SKR03 information', () => {
      const info = exporter.getAccountFrameworkInfo('SKR03');
      expect(info.name).toContain('SKR03');
      expect(info.description).toContain('Prozessgliederungsprinzip');
      expect(info.accountRanges).toBeDefined();
    });

    test('should return SKR04 information', () => {
      const info = exporter.getAccountFrameworkInfo('SKR04');
      expect(info.name).toContain('SKR04');
      expect(info.description).toContain('Abschlussgliederungsprinzip');
    });

    test('should default to SKR03 for unknown framework', () => {
      const info = exporter.getAccountFrameworkInfo('UNKNOWN');
      expect(info.name).toContain('SKR03');
    });
  });

  describe('Export To DATEV', () => {
    test('should generate complete DATEV export', () => {
      const entries = [{
        id: 'e1',
        organizationId: 'org1',
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Test entry',
        status: 'POSTED',
        currency: 'EUR'
      }];

      const lines = [
        {
          id: 'l1',
          journalEntryId: 'e1',
          accountId: 'a1',
          lineNumber: 1,
          description: 'Debit',
          debitAmount: 100,
          creditAmount: 0
        },
        {
          id: 'l2',
          journalEntryId: 'e1',
          accountId: 'a2',
          lineNumber: 2,
          description: 'Credit',
          debitAmount: 0,
          creditAmount: 100
        }
      ];

      const accounts = [
        { id: 'a1', accountNumber: '1000', accountName: 'Cash' },
        { id: 'a2', accountNumber: '4000', accountName: 'Revenue' }
      ];

      const result = exporter.exportToDatev(entries, lines, accounts, {
        organizationName: 'Test Company',
        consultantNumber: 1000,
        clientNumber: 10001
      });

      expect(result.filename).toBeDefined();
      expect(result.filename).toContain('.csv');
      expect(result.content).toBeDefined();
      expect(result.content).toContain('EXTF');
      expect(result.recordCount).toBe(2);
      expect(result.encoding).toBe('utf-8');
    });

    test('should only export posted entries', () => {
      const entries = [
        { id: 'e1', organizationId: 'org1', status: 'POSTED', entryDate: new Date() },
        { id: 'e2', organizationId: 'org1', status: 'DRAFT', entryDate: new Date() }
      ];

      const lines = [
        { id: 'l1', journalEntryId: 'e1', accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { id: 'l2', journalEntryId: 'e1', accountId: 'a2', debitAmount: 0, creditAmount: 100 },
        { id: 'l3', journalEntryId: 'e2', accountId: 'a1', debitAmount: 50, creditAmount: 0 },
        { id: 'l4', journalEntryId: 'e2', accountId: 'a2', debitAmount: 0, creditAmount: 50 }
      ];

      const accounts = [
        { id: 'a1', accountNumber: '1000' },
        { id: 'a2', accountNumber: '4000' }
      ];

      const result = exporter.exportToDatev(entries, lines, accounts, {});
      
      // Should only have 2 records (from the POSTED entry)
      expect(result.recordCount).toBe(2);
    });

    test('should filter by date range when provided', () => {
      const entries = [
        { id: 'e1', organizationId: 'org1', status: 'POSTED', entryDate: new Date('2024-01-15') },
        { id: 'e2', organizationId: 'org1', status: 'POSTED', entryDate: new Date('2024-06-15') }
      ];

      const lines = [
        { id: 'l1', journalEntryId: 'e1', accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { id: 'l2', journalEntryId: 'e1', accountId: 'a2', debitAmount: 0, creditAmount: 100 },
        { id: 'l3', journalEntryId: 'e2', accountId: 'a1', debitAmount: 50, creditAmount: 0 },
        { id: 'l4', journalEntryId: 'e2', accountId: 'a2', debitAmount: 0, creditAmount: 50 }
      ];

      const accounts = [
        { id: 'a1', accountNumber: '1000' },
        { id: 'a2', accountNumber: '4000' }
      ];

      const result = exporter.exportToDatev(entries, lines, accounts, {
        dateFrom: '2024-01-01',
        dateTo: '2024-03-31'
      });
      
      // Should only export records from Q1
      expect(result.recordCount).toBe(2);
    });
  });
});

