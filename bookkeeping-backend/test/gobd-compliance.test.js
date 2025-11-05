// GoBD Compliance Module Tests

const { GoBDCompliance } = require('../gobd-compliance');

describe('GoBDCompliance', () => {
  let gobd;
  
  beforeEach(() => {
    gobd = new GoBDCompliance();
  });

  describe('Hash Generation', () => {
    test('should generate consistent hash for same data', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Test entry',
        currency: 'EUR',
        organizationId: 'org1'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0, description: 'Debit' },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100, description: 'Credit' }
      ];

      const hash1 = gobd.generateEntryHash(entry, lines);
      const hash2 = gobd.generateEntryHash(entry, lines);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 character hex
    });

    test('should generate different hash for different data', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Test entry',
        currency: 'EUR',
        organizationId: 'org1'
      };

      const lines1 = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0, description: 'Debit' },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100, description: 'Credit' }
      ];

      const lines2 = [
        { accountId: 'a1', debitAmount: 200, creditAmount: 0, description: 'Debit' },
        { accountId: 'a2', debitAmount: 0, creditAmount: 200, description: 'Credit' }
      ];

      const hash1 = gobd.generateEntryHash(entry, lines1);
      const hash2 = gobd.generateEntryHash(entry, lines2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Entry Validation', () => {
    test('should validate balanced entry as compliant', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Balanced entry',
        status: 'DRAFT'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const validation = gobd.validateEntry(entry, lines);

      expect(validation.compliant).toBe(true);
      expect(validation.violations.filter(v => v.severity === 'ERROR')).toHaveLength(0);
    });

    test('should fail validation for unbalanced entry', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: new Date(),
        description: 'Unbalanced',
        status: 'DRAFT'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { accountId: 'a2', debitAmount: 0, creditAmount: 50 }
      ];

      const validation = gobd.validateEntry(entry, lines);

      expect(validation.compliant).toBe(false);
      expect(validation.violations.some(v => v.code === 'UNBALANCED_ENTRY')).toBe(true);
    });

    test('should require entry number', () => {
      const entry = {
        entryNumber: '',
        entryDate: new Date(),
        description: 'No number',
        status: 'DRAFT'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const validation = gobd.validateEntry(entry, lines);

      expect(validation.compliant).toBe(false);
      expect(validation.violations.some(v => v.code === 'MISSING_ENTRY_NUMBER')).toBe(true);
    });

    test('should require entry date', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: null,
        description: 'No date',
        status: 'DRAFT'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const validation = gobd.validateEntry(entry, lines);

      expect(validation.compliant).toBe(false);
      expect(validation.violations.some(v => v.code === 'MISSING_DATE')).toBe(true);
    });

    test('should warn for untimely entries', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 15); // 15 days ago

      const entry = {
        entryNumber: 'JE-001',
        entryDate: oldDate,
        description: 'Old entry',
        status: 'DRAFT'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const validation = gobd.validateEntry(entry, lines);

      expect(validation.violations.some(v => v.code === 'UNTIMELY_ENTRY')).toBe(true);
    });

    test('should validate lines have account assignment', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: new Date(),
        description: 'Test',
        status: 'DRAFT'
      };

      const lines = [
        { accountId: null, debitAmount: 100, creditAmount: 0 },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const validation = gobd.validateEntry(entry, lines);

      expect(validation.compliant).toBe(false);
      expect(validation.violations.some(v => v.code === 'MISSING_ACCOUNT')).toBe(true);
    });
  });

  describe('Integrity Verification', () => {
    test('should verify valid hash', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Test',
        currency: 'EUR',
        organizationId: 'org1'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0, description: 'Debit' },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100, description: 'Credit' }
      ];

      const hash = gobd.generateEntryHash(entry, lines);
      const isValid = gobd.verifyEntryIntegrity(entry, lines, hash);

      expect(isValid).toBe(true);
    });

    test('should detect tampered data', () => {
      const entry = {
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Test',
        currency: 'EUR',
        organizationId: 'org1'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0, description: 'Debit' },
        { accountId: 'a2', debitAmount: 0, creditAmount: 100, description: 'Credit' }
      ];

      const hash = gobd.generateEntryHash(entry, lines);

      // Tamper with the data
      lines[0].debitAmount = 200;

      const isValid = gobd.verifyEntryIntegrity(entry, lines, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('Immutability Record', () => {
    test('should create immutability record with all required fields', () => {
      const entry = {
        id: 'e1',
        entryNumber: 'JE-001',
        entryDate: new Date(),
        description: 'Test',
        currency: 'EUR',
        organizationId: 'org1'
      };

      const lines = [
        { accountId: 'a1', debitAmount: 100, creditAmount: 0, description: 'Test' }
      ];

      const record = gobd.createImmutabilityRecord(entry, lines, 'TestUser');

      expect(record.id).toBeDefined();
      expect(record.journalEntryId).toBe('e1');
      expect(record.hash).toBeDefined();
      expect(record.algorithm).toBe('sha256');
      expect(record.postedBy).toBe('TestUser');
      expect(record.timestamp).toBeInstanceOf(Date);
      expect(record.entrySnapshot).toBeDefined();
    });
  });

  describe('GDPdU Export', () => {
    test('should generate GDPdU export with index.xml', () => {
      const entries = [{
        id: 'e1',
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Test',
        currency: 'EUR'
      }];

      const lines = [
        { journalEntryId: 'e1', accountId: 'a1', debitAmount: 100, creditAmount: 0, description: 'Test' },
        { journalEntryId: 'e1', accountId: 'a2', debitAmount: 0, creditAmount: 100, description: 'Test' }
      ];

      const accounts = [
        { id: 'a1', accountNumber: '1000', accountName: 'Cash' },
        { id: 'a2', accountNumber: '4000', accountName: 'Revenue' }
      ];

      const orgInfo = { name: 'Test Company' };

      const exportData = gobd.generateGDPdUExport(entries, lines, accounts, orgInfo);

      expect(exportData.indexXml).toBeDefined();
      expect(exportData.indexXml).toContain('<?xml');
      expect(exportData.indexXml).toContain('Test Company');
      expect(exportData.files['accounts.csv']).toBeDefined();
      expect(exportData.files['journal.csv']).toBeDefined();
      expect(exportData.timestamp).toBeDefined();
    });
  });

  describe('Procedure Documentation', () => {
    test('should generate complete procedure documentation', () => {
      const orgInfo = {
        name: 'Test Company',
        countryCode: 'DE'
      };

      const doc = gobd.generateProcedureDocumentation(orgInfo);

      expect(doc.title).toContain('Verfahrensdokumentation');
      expect(doc.sections).toBeDefined();
      expect(doc.sections.length).toBeGreaterThan(5);
      expect(doc.sections[0].title).toContain('Allgemeine Beschreibung');
      expect(doc.organization).toBe(orgInfo);
    });
  });

  describe('Compliance Check', () => {
    test('should pass compliance check for valid data', () => {
      const entries = [{
        id: 'e1',
        entryNumber: 'JE-001',
        entryDate: new Date('2024-01-15'),
        description: 'Test',
        status: 'POSTED',
        hash: 'abc123',
        postedAt: new Date(),
        postedBy: 'User'
      }];

      const lines = [
        { journalEntryId: 'e1', accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { journalEntryId: 'e1', accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const auditLogs = [{
        entityType: 'JOURNAL_ENTRY',
        entityId: 'e1',
        action: 'POST'
      }];

      const check = gobd.performComplianceCheck(entries, lines, auditLogs);

      expect(check.complianceLevel).toBe('FULL');
      expect(check.issues).toHaveLength(0);
    });

    test('should detect missing hash on posted entry', () => {
      const entries = [{
        id: 'e1',
        entryNumber: 'JE-001',
        entryDate: new Date(),
        description: 'Test',
        status: 'POSTED'
        // Missing hash, postedAt, postedBy
      }];

      const lines = [
        { journalEntryId: 'e1', accountId: 'a1', debitAmount: 100, creditAmount: 0 },
        { journalEntryId: 'e1', accountId: 'a2', debitAmount: 0, creditAmount: 100 }
      ];

      const check = gobd.performComplianceCheck(entries, lines, []);

      expect(check.complianceLevel).toBe('NON_COMPLIANT');
      expect(check.issues.length).toBeGreaterThan(0);
      expect(check.issues[0].issue).toContain('missing hash');
    });
  });

  describe('Helper Functions', () => {
    test('should escape XML special characters', () => {
      expect(gobd.escapeXml('Test & <Company>')).toBe('Test &amp; &lt;Company&gt;');
    });

    test('should escape CSV fields with semicolons', () => {
      expect(gobd.escapeCSV('Text; with; semicolons')).toBe('"Text; with; semicolons"');
    });

    test('should format amount with comma', () => {
      expect(gobd.formatAmount(1234.56)).toBe('1234,56');
    });

    test('should format date as ISO', () => {
      const date = new Date('2024-01-15');
      expect(gobd.formatDate(date)).toBe('2024-01-15');
    });
  });
});

