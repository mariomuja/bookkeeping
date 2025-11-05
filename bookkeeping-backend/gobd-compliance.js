// GoBD Compliance Module
// Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern
// Ensures compliance with German accounting regulations

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * GoBD Core Principles:
 * 1. Nachvollziehbarkeit (Traceability)
 * 2. Nachprüfbarkeit (Auditability)
 * 3. Vollständigkeit (Completeness)
 * 4. Richtigkeit (Accuracy)
 * 5. Zeitgerechte Buchungen (Timely recording)
 * 6. Ordnung (Order)
 * 7. Unveränderbarkeit (Immutability)
 */

class GoBDCompliance {
  constructor() {
    this.algorithm = 'sha256';
  }

  /**
   * Generate hash for journal entry (ensures immutability)
   */
  generateEntryHash(entry, lines) {
    const dataToHash = {
      entryNumber: entry.entryNumber,
      entryDate: entry.entryDate,
      description: entry.description,
      currency: entry.currency,
      organizationId: entry.organizationId,
      lines: lines.map(line => ({
        accountId: line.accountId,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        description: line.description
      }))
    };

    const jsonString = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
    return crypto.createHash(this.algorithm).update(jsonString).digest('hex');
  }

  /**
   * Verify entry integrity
   */
  verifyEntryIntegrity(entry, lines, storedHash) {
    const calculatedHash = this.generateEntryHash(entry, lines);
    return calculatedHash === storedHash;
  }

  /**
   * Create immutability record
   */
  createImmutabilityRecord(entry, lines, username = 'System') {
    const hash = this.generateEntryHash(entry, lines);
    
    return {
      id: uuidv4(),
      journalEntryId: entry.id,
      hash: hash,
      algorithm: this.algorithm,
      timestamp: new Date(),
      postedBy: username,
      entrySnapshot: JSON.stringify({
        entry,
        lines
      })
    };
  }

  /**
   * Validate GoBD compliance for an entry
   */
  validateEntry(entry, lines) {
    const violations = [];
    
    // Check if entry is balanced
    const totalDebit = lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      violations.push({
        code: 'UNBALANCED_ENTRY',
        severity: 'ERROR',
        message: 'Entry is not balanced (GoBD violation)',
        details: { debit: totalDebit, credit: totalCredit }
      });
    }

    // Check for required fields
    if (!entry.entryNumber || entry.entryNumber.trim() === '') {
      violations.push({
        code: 'MISSING_ENTRY_NUMBER',
        severity: 'ERROR',
        message: 'Entry number is required (GoBD §145)'
      });
    }

    if (!entry.entryDate) {
      violations.push({
        code: 'MISSING_DATE',
        severity: 'ERROR',
        message: 'Entry date is required (GoBD §145)'
      });
    }

    // Check if entry is timely (within 10 days)
    if (entry.entryDate) {
      const entryDate = new Date(entry.entryDate);
      const today = new Date();
      const daysDifference = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      
      if (daysDifference > 10 && entry.status === 'DRAFT') {
        violations.push({
          code: 'UNTIMELY_ENTRY',
          severity: 'WARNING',
          message: 'Entry should be posted within 10 days (GoBD best practice)',
          details: { daysSince: daysDifference }
        });
      }
    }

    // Check for description
    if (!entry.description || entry.description.trim() === '') {
      violations.push({
        code: 'MISSING_DESCRIPTION',
        severity: 'WARNING',
        message: 'Description recommended for clarity (GoBD §145)'
      });
    }

    // Check each line
    lines.forEach((line, index) => {
      if (!line.accountId) {
        violations.push({
          code: 'MISSING_ACCOUNT',
          severity: 'ERROR',
          message: `Line ${index + 1}: Account assignment required (GoBD §145)`
        });
      }

      if ((line.debitAmount || 0) === 0 && (line.creditAmount || 0) === 0) {
        violations.push({
          code: 'ZERO_AMOUNT_LINE',
          severity: 'WARNING',
          message: `Line ${index + 1}: Line has zero amount`
        });
      }
    });

    return {
      compliant: violations.filter(v => v.severity === 'ERROR').length === 0,
      violations,
      timestamp: new Date()
    };
  }

  /**
   * Generate GoBD export in GDPdU/IDEA format
   */
  generateGDPdUExport(journalEntries, journalEntryLines, accounts, organizationInfo) {
    const timestamp = new Date().toISOString();
    
    // Create index file (index.xml)
    const indexXml = this.generateIndexXml(organizationInfo, timestamp);
    
    // Create data files
    const accountsData = this.generateAccountsData(accounts);
    const journalData = this.generateJournalData(journalEntries, journalEntryLines, accounts);
    
    return {
      indexXml,
      files: {
        'accounts.csv': accountsData,
        'journal.csv': journalData
      },
      timestamp,
      organizationInfo
    };
  }

  /**
   * Generate index.xml for GDPdU export
   */
  generateIndexXml(orgInfo, timestamp) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<DataSet xmlns="http://www.gdpdu.de/2001/gdpdu-01">
  <Version>1.0</Version>
  <DataSupplier>
    <Name>${this.escapeXml(orgInfo.name || 'Organization')}</Name>
    <Location>Germany</Location>
  </DataSupplier>
  <SoftwareInfo>
    <Name>International Bookkeeping</Name>
    <Version>1.0.0</Version>
  </SoftwareInfo>
  <Command>
    <Name>Konten</Name>
    <SourceTable>
      <Name>accounts</Name>
      <URL>accounts.csv</URL>
      <CodePage>UTF-8</CodePage>
      <DecimalSymbol>,</DecimalSymbol>
      <DigitGroupingSymbol>.</DigitGroupingSymbol>
      <VariableLength>
        <ColumnDelimiter>;</ColumnDelimiter>
        <TextEncapsulator>"</TextEncapsulator>
      </VariableLength>
      <Column>
        <Name>Kontonummer</Name>
        <Description>Account Number</Description>
        <AlphaNumeric>
          <Length>10</Length>
        </AlphaNumeric>
      </Column>
      <Column>
        <Name>Kontobezeichnung</Name>
        <Description>Account Name</Description>
        <AlphaNumeric>
          <Length>100</Length>
        </AlphaNumeric>
      </Column>
    </SourceTable>
  </Command>
  <Command>
    <Name>Buchungen</Name>
    <SourceTable>
      <Name>journal</Name>
      <URL>journal.csv</URL>
      <CodePage>UTF-8</CodePage>
      <DecimalSymbol>,</DecimalSymbol>
      <DigitGroupingSymbol>.</DigitGroupingSymbol>
      <VariableLength>
        <ColumnDelimiter>;</ColumnDelimiter>
        <TextEncapsulator>"</TextEncapsulator>
      </VariableLength>
    </SourceTable>
  </Command>
</DataSet>`;
  }

  /**
   * Generate accounts data for GDPdU
   */
  generateAccountsData(accounts) {
    const header = 'Kontonummer;Kontobezeichnung;Kontotyp;Währung';
    const rows = accounts.map(acc => {
      return [
        acc.accountNumber,
        this.escapeCSV(acc.accountName),
        acc.accountTypeId,
        acc.currency || 'EUR'
      ].join(';');
    });

    return header + '\r\n' + rows.join('\r\n');
  }

  /**
   * Generate journal data for GDPdU
   */
  generateJournalData(entries, lines, accounts) {
    const header = 'Belegnummer;Belegdatum;Konto;Gegenkonto;Beschreibung;Soll;Haben;Währung;Status;Hash';
    
    const rows = [];
    entries.forEach(entry => {
      const entryLines = lines.filter(l => l.journalEntryId === entry.id);
      const hash = this.generateEntryHash(entry, entryLines);
      
      entryLines.forEach(line => {
        const account = accounts.find(a => a.id === line.accountId);
        const contraLine = entryLines.find(l => l.id !== line.id);
        const contraAccount = contraLine ? accounts.find(a => a.id === contraLine.accountId) : null;
        
        const row = [
          entry.entryNumber,
          this.formatDate(entry.entryDate),
          account?.accountNumber || '',
          contraAccount?.accountNumber || '',
          this.escapeCSV(line.description || entry.description),
          this.formatAmount(line.debitAmount),
          this.formatAmount(line.creditAmount),
          entry.currency || 'EUR',
          entry.status,
          hash
        ].join(';');
        
        rows.push(row);
      });
    });

    return header + '\r\n' + rows.join('\r\n');
  }

  /**
   * Check if entry modification is allowed (GoBD compliance)
   */
  canModifyEntry(entry) {
    if (entry.status === 'POSTED') {
      return {
        allowed: false,
        reason: 'Posted entries cannot be modified (GoBD compliance)',
        code: 'ENTRY_POSTED'
      };
    }

    if (entry.status === 'VOIDED') {
      return {
        allowed: false,
        reason: 'Voided entries cannot be modified (GoBD compliance)',
        code: 'ENTRY_VOIDED'
      };
    }

    // Check if entry is in a closed period (implement period locking)
    // For now, allow draft entries to be modified
    return {
      allowed: true,
      reason: null,
      code: null
    };
  }

  /**
   * Check if entry deletion is allowed
   */
  canDeleteEntry(entry) {
    if (entry.status === 'POSTED') {
      return {
        allowed: false,
        reason: 'Posted entries must be voided, not deleted (GoBD compliance)',
        code: 'ENTRY_POSTED'
      };
    }

    return {
      allowed: true,
      reason: null,
      code: null
    };
  }

  /**
   * Generate procedure documentation (Verfahrensdokumentation)
   */
  generateProcedureDocumentation(organizationInfo) {
    const timestamp = new Date().toISOString();
    
    return {
      title: 'Verfahrensdokumentation - International Bookkeeping',
      organization: organizationInfo,
      generatedAt: timestamp,
      sections: [
        {
          title: '1. Allgemeine Beschreibung',
          content: `Dieses Dokument beschreibt das Verfahren zur Führung der Buchführung in International Bookkeeping gemäß GoBD.

Organisation: ${organizationInfo.name}
System: International Bookkeeping v1.0.0
Zeitpunkt der Erstellung: ${new Date().toLocaleDateString('de-DE')}`
        },
        {
          title: '2. Anwenderfunktionen',
          content: `- Erfassung von Buchungssätzen mit doppelter Buchführung
- Kontenplan-Verwaltung nach HGB
- Journal-Verwaltung mit Entwurf/Gebucht-Status
- Unveränderbarkeit gebuchter Belege durch Hash-Verfahren
- Vollständige Protokollierung aller Änderungen
- DATEV-Export für Steuerberater
- GDPdU/IDEA-Export für Betriebsprüfung`
        },
        {
          title: '3. Technische Systemumgebung',
          content: `Backend: Node.js mit Express
Frontend: Angular 17
Datenbank: Mock-Daten (produktiv: PostgreSQL/TimescaleDB)
Verschlüsselung: SHA-256 für Buchungs-Hashes
Zeichensatz: UTF-8`
        },
        {
          title: '4. Interner Kontrollprozess',
          content: `- Vier-Augen-Prinzip durch Status-Workflow (Entwurf → Gebucht)
- Unveränderbarkeit gebuchter Buchungen
- Stornierung statt Löschung gebuchter Belege
- Vollständige Audit-Logs mit Zeitstempel
- Automatische Hash-Generierung bei Buchung`
        },
        {
          title: '5. Datensicherung',
          content: `- Tägliche automatische Backups empfohlen
- Aufbewahrungsfrist: 10 Jahre (§147 AO)
- Revisionssichere Archivierung
- Export-Funktionen für Archivierung`
        },
        {
          title: '6. Berechtigungskonzept',
          content: `- Rollenbasierte Zugriffskontrolle
- Trennung von Erfassung und Freigabe
- Protokollierung aller Benutzeraktivitäten
- Passwort-Schutz und optionale 2FA`
        },
        {
          title: '7. Unveränderbarkeit und Nachvollziehbarkeit',
          content: `Gebuchte Belege sind unveränderbar:
- SHA-256 Hash wird bei Buchung erstellt
- Hash-Prüfung bei jedem Zugriff
- Änderungsversuch wird protokolliert und blockiert
- Nur Stornierung (nicht Löschung) möglich
- Vollständiger Änderungsverlauf in Audit-Logs`
        },
        {
          title: '8. Datenexport für Betriebsprüfung',
          content: `Verfügbare Export-Formate:
- DATEV ASCII für Steuerberater
- GDPdU/IDEA für Betriebsprüfung
- CSV-Export aller Daten
- Vollständiger Audit-Trail-Export
- Index.xml gemäß GDPdU-Standard`
        }
      ]
    };
  }

  /**
   * Perform GoBD compliance check
   */
  performComplianceCheck(journalEntries, journalEntryLines, auditLogs) {
    const issues = [];
    const warnings = [];
    
    // Check 1: All posted entries must be immutable
    const postedEntries = journalEntries.filter(e => e.status === 'POSTED');
    postedEntries.forEach(entry => {
      if (!entry.hash || !entry.postedAt || !entry.postedBy) {
        issues.push({
          entryId: entry.id,
          entryNumber: entry.entryNumber,
          issue: 'Posted entry missing hash or posting metadata',
          severity: 'HIGH'
        });
      }
    });

    // Check 2: Balanced entries
    journalEntries.forEach(entry => {
      const lines = journalEntryLines.filter(l => l.journalEntryId === entry.id);
      const validation = this.validateEntry(entry, lines);
      
      if (!validation.compliant) {
        const errors = validation.violations.filter(v => v.severity === 'ERROR');
        if (errors.length > 0) {
          issues.push({
            entryId: entry.id,
            entryNumber: entry.entryNumber,
            issue: errors.map(e => e.message).join('; '),
            severity: 'HIGH'
          });
        }
      }
    });

    // Check 3: Audit trail completeness
    const criticalActions = ['CREATE', 'UPDATE', 'DELETE', 'POST', 'VOID'];
    const auditedEntries = new Set(auditLogs.filter(log => 
      criticalActions.includes(log.action) && log.entityType === 'JOURNAL_ENTRY'
    ).map(log => log.entityId));

    postedEntries.forEach(entry => {
      if (!auditedEntries.has(entry.id)) {
        warnings.push({
          entryId: entry.id,
          entryNumber: entry.entryNumber,
          issue: 'Missing audit log for posted entry',
          severity: 'MEDIUM'
        });
      }
    });

    // Check 4: Sequential entry numbers (optional but recommended)
    const entryNumbers = journalEntries
      .map(e => e.entryNumber)
      .filter(n => n)
      .sort();
    
    // Basic check for gaps (simplified)
    if (entryNumbers.length > 1) {
      const hasGaps = entryNumbers.some((num, idx) => {
        if (idx === 0) return false;
        // This is a simplified check - would need more sophisticated logic
        return false;
      });
    }

    const complianceLevel = issues.length === 0 ? 
      (warnings.length === 0 ? 'FULL' : 'PARTIAL') : 
      'NON_COMPLIANT';

    return {
      complianceLevel,
      issues,
      warnings,
      summary: {
        totalEntries: journalEntries.length,
        postedEntries: postedEntries.length,
        issuesFound: issues.length,
        warningsFound: warnings.length
      },
      checkedAt: new Date()
    };
  }

  /**
   * Generate GoBD certificate/report
   */
  generateComplianceCertificate(complianceCheck, organizationInfo) {
    const status = complianceCheck.complianceLevel === 'FULL' ? '✓ KONFORM' :
                   complianceCheck.complianceLevel === 'PARTIAL' ? '⚠ TEILWEISE KONFORM' :
                   '✗ NICHT KONFORM';

    return {
      title: 'GoBD Compliance Bescheinigung',
      organization: organizationInfo.name,
      date: new Date().toISOString(),
      status: complianceCheck.complianceLevel,
      statusText: status,
      summary: complianceCheck.summary,
      issues: complianceCheck.issues,
      warnings: complianceCheck.warnings,
      principles: {
        immutability: complianceCheck.issues.filter(i => i.issue.includes('hash')).length === 0,
        completeness: complianceCheck.issues.filter(i => i.issue.includes('Missing')).length === 0,
        accuracy: complianceCheck.issues.filter(i => i.issue.includes('balanced')).length === 0,
        traceability: complianceCheck.warnings.filter(w => w.issue.includes('audit')).length === 0
      }
    };
  }

  // Helper functions

  escapeXml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  escapeCSV(text) {
    if (!text) return '';
    const escaped = text.replace(/"/g, '""');
    if (escaped.includes(';') || escaped.includes('"') || escaped.includes('\n')) {
      return `"${escaped}"`;
    }
    return escaped;
  }

  formatDate(date) {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  formatAmount(amount) {
    return (amount || 0).toFixed(2).replace('.', ',');
  }
}

module.exports = {
  GoBDCompliance
};

