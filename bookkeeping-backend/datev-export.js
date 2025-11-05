// DATEV Export Module
// Generates DATEV ASCII format files for German tax advisors
// Supports SKR03 and SKR04 account frameworks

const { v4: uuidv4 } = require('uuid');

/**
 * DATEV ASCII Format Specification:
 * - Semicolon-separated values
 * - Header with metadata
 * - Data records with specific fields
 * - Encoding: ISO-8859-1 or UTF-8 with BOM
 */

class DatevExporter {
  constructor(accountFramework = 'SKR03') {
    this.accountFramework = accountFramework; // SKR03 or SKR04
    this.version = '7.0'; // DATEV format version
  }

  /**
   * Export journal entries to DATEV format
   */
  exportToDatev(journalEntries, journalEntryLines, accounts, options = {}) {
    const {
      organizationName = 'Demo Company',
      consultantNumber = 1000, // Berater-Nummer
      clientNumber = 10001, // Mandanten-Nummer
      fiscalYearStart = new Date(new Date().getFullYear(), 0, 1),
      accountLength = 4,
      exportType = 'TRANSACTIONS', // TRANSACTIONS or BALANCES
      dateFrom = null,
      dateTo = null
    } = options;

    // Filter entries by date range if provided
    let filteredEntries = journalEntries;
    if (dateFrom || dateTo) {
      filteredEntries = journalEntries.filter(entry => {
        const entryDate = new Date(entry.entryDate);
        if (dateFrom && entryDate < new Date(dateFrom)) return false;
        if (dateTo && entryDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Only export posted entries
    const postedEntries = filteredEntries.filter(e => e.status === 'POSTED');

    // Generate header
    const header = this.generateHeader({
      organizationName,
      consultantNumber,
      clientNumber,
      fiscalYearStart,
      accountLength,
      exportType,
      dateFrom: dateFrom || fiscalYearStart,
      dateTo: dateTo || new Date()
    });

    // Generate data records
    const dataRecords = this.generateDataRecords(postedEntries, journalEntryLines, accounts, {
      accountLength,
      fiscalYearStart
    });

    // Combine header and data
    const output = header + '\r\n' + dataRecords.join('\r\n');

    return {
      filename: this.generateFilename(consultantNumber, clientNumber, exportType),
      content: output,
      encoding: 'utf-8',
      recordCount: dataRecords.length,
      dateRange: {
        from: dateFrom || fiscalYearStart,
        to: dateTo || new Date()
      }
    };
  }

  /**
   * Generate DATEV header
   */
  generateHeader(options) {
    const {
      organizationName,
      consultantNumber,
      clientNumber,
      fiscalYearStart,
      accountLength,
      exportType,
      dateFrom,
      dateTo
    } = options;

    const fiscalYear = fiscalYearStart.getFullYear();
    const formatVersion = '7.0';
    const dataCategory = exportType === 'BALANCES' ? '16' : '21'; // 21 = Buchungsstapel, 16 = Buchungstextkonstanten
    const formatName = 'Buchungsstapel';
    const formatVersion2 = '9';
    const createdDate = this.formatDatevDate(new Date());
    
    // DATEV Header Structure (simplified version)
    const headerFields = [
      'EXTF',                                    // 1. Identifier
      formatVersion,                             // 2. Format version
      dataCategory,                              // 3. Data category
      formatName,                                // 4. Format name
      formatVersion2,                            // 5. Format version
      createdDate,                               // 6. Created date
      '',                                        // 7. Reserved
      '',                                        // 8. Reserved
      organizationName,                          // 9. Company name
      consultantNumber.toString(),              // 10. Consultant number
      clientNumber.toString(),                  // 11. Client number
      this.formatDatevDate(fiscalYearStart),    // 12. Fiscal year start
      accountLength.toString(),                 // 13. Account number length
      this.formatDatevDate(dateFrom),           // 14. Date from
      this.formatDatevDate(dateTo),             // 15. Date to
      '',                                        // 16. Label
      '0',                                       // 17. With VAT
      'EUR',                                     // 18. Currency
      '',                                        // 19. Reserved
      '',                                        // 20. Reserved
      this.accountFramework                      // 21. Account framework (SKR03/SKR04)
    ];

    return headerFields.join(';');
  }

  /**
   * Generate data records from journal entries
   */
  generateDataRecords(journalEntries, journalEntryLines, accounts, options) {
    const records = [];

    for (const entry of journalEntries) {
      const lines = journalEntryLines.filter(l => l.journalEntryId === entry.id);
      
      // Group lines into debit/credit pairs
      for (const line of lines) {
        const account = accounts.find(a => a.id === line.accountId);
        if (!account) continue;

        const isDebit = line.debitAmount > 0;
        const amount = isDebit ? line.debitAmount : line.creditAmount;
        
        if (amount === 0) continue;

        // Find the offsetting entry (contra account)
        const contraLine = lines.find(l => 
          l.id !== line.id && 
          ((isDebit && l.creditAmount > 0) || (!isDebit && l.debitAmount > 0))
        );
        
        const contraAccount = contraLine ? accounts.find(a => a.id === contraLine.accountId) : null;

        const record = this.generateDataRecord({
          amount,
          debitCredit: isDebit ? 'S' : 'H', // S = Soll (debit), H = Haben (credit)
          account: account.accountNumber,
          contraAccount: contraAccount?.accountNumber || '',
          date: new Date(entry.entryDate),
          description: line.description || entry.description,
          documentNumber: entry.entryNumber,
          documentType: entry.documentType || 'JE',
          fiscalYearStart: options.fiscalYearStart
        });

        records.push(record);
      }
    }

    return records;
  }

  /**
   * Generate single DATEV data record
   */
  generateDataRecord(data) {
    const {
      amount,
      debitCredit,
      account,
      contraAccount,
      date,
      description,
      documentNumber,
      documentType,
      fiscalYearStart
    } = data;

    // DATEV Record Structure
    const fields = [
      this.formatAmount(amount),                 // 1. Amount (Umsatz)
      debitCredit,                               // 2. Debit/Credit (S/H)
      'EUR',                                     // 3. Currency
      '',                                        // 4. Exchange rate
      account,                                   // 5. Account (Konto)
      contraAccount,                             // 6. Contra account (Gegenkonto)
      documentNumber,                            // 7. Document number (Belegnummer)
      this.formatDatevDate(date),               // 8. Date (Belegdatum)
      this.cleanDescription(description),        // 9. Description (Buchungstext)
      '',                                        // 10. Posting key
      '',                                        // 11. Cost center 1
      '',                                        // 12. Cost center 2
      '',                                        // 13. Tax rate
      '',                                        // 14. Reserved
      '',                                        // 15. Reserved
      '',                                        // 16. Reserved
      '',                                        // 17. Reserved
      '',                                        // 18. Reserved
      '',                                        // 19. Reserved
      '',                                        // 20. Reserved
      documentType                               // 21. Document type
    ];

    return fields.join(';');
  }

  /**
   * Format amount for DATEV (decimal with comma separator)
   */
  formatAmount(amount) {
    return amount.toFixed(2).replace('.', ',');
  }

  /**
   * Format date for DATEV (DDMM format)
   */
  formatDatevDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return day + month;
  }

  /**
   * Clean description for DATEV (remove special characters)
   */
  cleanDescription(text) {
    if (!text) return '';
    // Remove or replace characters not allowed in DATEV
    return text
      .replace(/[;"]/g, ' ')  // Remove semicolons and quotes
      .replace(/[\r\n]/g, ' ') // Remove line breaks
      .substring(0, 60)         // Max 60 characters
      .trim();
  }

  /**
   * Generate filename according to DATEV naming convention
   */
  generateFilename(consultantNumber, clientNumber, exportType) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // DATEV format: EXTF_Buchungsstapel_<consultant>_<client>_<YYYYMMDD>.csv
    const typeCode = exportType === 'BALANCES' ? 'Kontenbeschriftungen' : 'Buchungsstapel';
    return `EXTF_${typeCode}_${consultantNumber}_${clientNumber}_${year}${month}${day}.csv`;
  }

  /**
   * Map generic accounts to DATEV SKR03/SKR04
   * This is a basic mapping - should be extended based on business needs
   */
  mapToDatevAccount(accountNumber, accountType, framework = 'SKR03') {
    // For now, we'll use the existing account numbers
    // In a full implementation, you'd map to standard DATEV accounts
    
    const skr03Mapping = {
      // Assets
      'ASSET_CURRENT': { start: 1000, end: 1999 },
      'ASSET_FIXED': { start: 200, end: 999 },
      // Liabilities
      'LIABILITY_CURRENT': { start: 1600, end: 1799 },
      'LIABILITY_LONG_TERM': { start: 600, end: 799 },
      // Equity
      'EQUITY_CAPITAL': { start: 800, end: 899 },
      'EQUITY_RETAINED': { start: 900, end: 979 },
      // Revenue
      'REVENUE_SALES': { start: 8000, end: 8999 },
      // Expenses
      'EXPENSE_OPERATING': { start: 4000, end: 6999 },
      'EXPENSE_COGS': { start: 3000, end: 3999 }
    };

    const skr04Mapping = {
      // Similar structure for SKR04
      // SKR04 uses different numbering
    };

    const mapping = framework === 'SKR03' ? skr03Mapping : skr04Mapping;
    
    // Return original account number (simplified)
    // In production, implement proper mapping logic
    return accountNumber;
  }

  /**
   * Validate DATEV export data
   */
  validateExportData(journalEntries, journalEntryLines) {
    const errors = [];

    // Check for balanced entries
    for (const entry of journalEntries) {
      const lines = journalEntryLines.filter(l => l.journalEntryId === entry.id);
      const totalDebit = lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
      const totalCredit = lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        errors.push({
          entryId: entry.id,
          entryNumber: entry.entryNumber,
          error: `Unbalanced entry: Debit ${totalDebit} vs Credit ${totalCredit}`
        });
      }
    }

    // Check for missing account numbers
    const invalidLines = journalEntryLines.filter(l => !l.accountId);
    if (invalidLines.length > 0) {
      errors.push({
        error: `${invalidLines.length} lines without account assignment`
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Get DATEV account framework information
   */
  getAccountFrameworkInfo(framework = 'SKR03') {
    const frameworks = {
      'SKR03': {
        name: 'SKR03 - Standardkontenrahmen für Handelsunternehmen',
        description: 'Prozessgliederungsprinzip',
        accountRanges: {
          assets: '0000-1999',
          liabilities: '2000-2999',
          revenue: '8000-8999',
          expenses: '4000-7999'
        }
      },
      'SKR04': {
        name: 'SKR04 - Standardkontenrahmen für Industrieunternehmen',
        description: 'Abschlussgliederungsprinzip',
        accountRanges: {
          assets: '0000-0999',
          liabilities: '1000-1999',
          revenue: '4000-4999',
          expenses: '5000-7999'
        }
      }
    };

    return frameworks[framework] || frameworks['SKR03'];
  }
}

module.exports = {
  DatevExporter
};

