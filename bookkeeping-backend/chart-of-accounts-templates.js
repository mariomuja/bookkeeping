// Chart of Accounts Templates
// Standard account frameworks (Kontenrahmen) for different countries and industries

/**
 * Account Framework Templates
 * Each template contains a predefined chart of accounts with standard account numbers and names
 */

const accountFrameworks = {
  // German Standard Account Frameworks
  SKR03: {
    id: 'SKR03',
    name: 'SKR 03 - Prozessgliederungsprinzip',
    country: 'DE',
    description: 'DATEV-Standardkontenrahmen nach Prozessgliederung - am weitesten verbreitet in Deutschland',
    accounts: [
      // Klasse 0: Anlagevermögen
      { number: '0027', name: 'Pkw', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0030', name: 'Geschäftsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0080', name: 'Betriebs- und Geschäftsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0110', name: 'Gebäude', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0130', name: 'Grundstücke', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0150', name: 'Maschinen', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0210', name: 'Beteiligungen', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0280', name: 'Finanzanlagen', type: 'ASSET', category: 'FIXED_ASSETS' },
      
      // Klasse 1: Umlaufvermögen
      { number: '1000', name: 'Kasse', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1200', name: 'Bank', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1360', name: 'Forderungen aus Lieferungen und Leistungen', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1400', name: 'Sonstige Vermögensgegenstände', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1576', name: 'Abziehbare Vorsteuer 19%', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1718', name: 'Erhaltene Anzahlungen 19% USt', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1766', name: 'Umsatzsteuer 19%', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1780', name: 'Umsatzsteuer-Vorauszahlungen', type: 'ASSET', category: 'CURRENT_ASSETS' },
      
      // Klasse 2: Eigenkapital
      { number: '2000', name: 'Eigenkapital', type: 'EQUITY', category: 'EQUITY' },
      { number: '2100', name: 'Gezeichnetes Kapital', type: 'EQUITY', category: 'EQUITY' },
      { number: '2150', name: 'Kapitalrücklage', type: 'EQUITY', category: 'EQUITY' },
      { number: '2160', name: 'Gesetzliche Rücklage', type: 'EQUITY', category: 'EQUITY' },
      { number: '2200', name: 'Gewinnvortrag vor Verwendung', type: 'EQUITY', category: 'EQUITY' },
      { number: '2210', name: 'Verlustvortrag vor Verwendung', type: 'EQUITY', category: 'EQUITY' },
      { number: '2300', name: 'Privatentnahmen allgemein', type: 'EQUITY', category: 'EQUITY' },
      { number: '2310', name: 'Privateinlagen', type: 'EQUITY', category: 'EQUITY' },
      
      // Klasse 3: Wareneingang und Bestandsveränderungen  
      { number: '3000', name: 'Wareneingang', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '3100', name: 'Bezugsnebenkosten', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '3200', name: 'Warenbestand', type: 'ASSET', category: 'INVENTORY' },
      { number: '3400', name: 'Wareneingang 19% Vorsteuer', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '3800', name: 'Erhaltene Skonti 19% Vorsteuer', type: 'REVENUE', category: 'OTHER_INCOME' },
      
      // Klasse 4: Betriebliche Aufwendungen
      { number: '4000', name: 'Aufwendungen für Roh-, Hilfs- und Betriebsstoffe', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4110', name: 'Löhne', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '4120', name: 'Gehälter', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '4130', name: 'Gesetzliche soziale Aufwendungen', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '4140', name: 'Freiwillige soziale Aufwendungen', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '4200', name: 'Raumkosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4210', name: 'Mietleasing', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4240', name: 'Gas, Strom, Wasser', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4280', name: 'Reinigung', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4300', name: 'Instandhaltung betrieblicher Räume', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4500', name: 'Kfz-Kosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4510', name: 'Kfz-Versicherungen', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4520', name: 'Kfz-Steuern', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4530', name: 'Laufende Kfz-Betriebskosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4540', name: 'Kfz-Reparaturen', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4600', name: 'Werbekosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4610', name: 'Reisekosten Arbeitnehmer', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4630', name: 'Geschenke abzugsfähig', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4650', name: 'Bewirtungskosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4660', name: 'Reisekosten Unternehmer', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4670', name: 'Porto', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4680', name: 'Telefon', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4700', name: 'Buchführungskosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4710', name: 'Rechts- und Beratungskosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4730', name: 'Beiträge', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4760', name: 'Versicherungen', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4800', name: 'Sonstige betriebliche Aufwendungen', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4830', name: 'Zinsaufwendungen', type: 'EXPENSE', category: 'FINANCIAL' },
      { number: '4840', name: 'Abschreibungen auf Sachanlagen', type: 'EXPENSE', category: 'DEPRECIATION' },
      { number: '4850', name: 'Abschreibungen auf Finanzanlagen', type: 'EXPENSE', category: 'DEPRECIATION' },
      { number: '4900', name: 'Steuern vom Einkommen und Ertrag', type: 'EXPENSE', category: 'TAXES' },
      { number: '4910', name: 'Körperschaftsteuer', type: 'EXPENSE', category: 'TAXES' },
      { number: '4920', name: 'Gewerbesteuer', type: 'EXPENSE', category: 'TAXES' },
      { number: '4950', name: 'Sonstige Steuern', type: 'EXPENSE', category: 'TAXES' },
      
      // Klasse 8: Erlöskonten
      { number: '8000', name: 'Umsatzerlöse', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '8100', name: 'Erlöse 19% USt', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '8120', name: 'Erlöse 7% USt', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '8125', name: 'Erlöse steuerfrei', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '8200', name: 'Provisionserlöse', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '8300', name: 'Bestandsveränderungen', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '8400', name: 'Erlöse aus Anlagenverkäufen', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '8500', name: 'Gewährte Skonti 19% USt', type: 'EXPENSE', category: 'SALES_DEDUCTIONS' },
      { number: '8600', name: 'Erlöse aus Vermietung', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '8700', name: 'Zinserträge', type: 'REVENUE', category: 'FINANCIAL' },
      { number: '8900', name: 'Sonstige betriebliche Erträge', type: 'REVENUE', category: 'OTHER_INCOME' }
    ]
  },

  SKR04: {
    id: 'SKR04',
    name: 'SKR 04 - Abschlussgliederungsprinzip',
    country: 'DE',
    description: 'DATEV-Standardkontenrahmen nach Bilanzgliederung (§266 HGB)',
    accounts: [
      // Klasse 0: Anlagevermögen
      { number: '0027', name: 'Pkw', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0030', name: 'Geschäftsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0100', name: 'Grundstücke und grundstücksgleiche Rechte', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0200', name: 'Gebäude auf eigenem Grund und Boden', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0400', name: 'Technische Anlagen und Maschinen', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0600', name: 'Betriebs- und Geschäftsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0800', name: 'Anlagen im Bau', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0920', name: 'Beteiligungen', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0960', name: 'Wertpapiere des Anlagevermögens', type: 'ASSET', category: 'FIXED_ASSETS' },
      
      // Klasse 1: Umlaufvermögen
      { number: '1000', name: 'Kasse', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1200', name: 'Bank', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1400', name: 'Forderungen aus Lieferungen und Leistungen', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1500', name: 'Sonstige Vermögensgegenstände', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1571', name: 'Abziehbare Vorsteuer 19%', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1576', name: 'Abziehbare Vorsteuer 7%', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1700', name: 'Sonstige Verbindlichkeiten', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1771', name: 'Umsatzsteuer 19%', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1776', name: 'Umsatzsteuer 7%', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1780', name: 'Umsatzsteuer-Vorauszahlungen', type: 'ASSET', category: 'CURRENT_ASSETS' },
      
      // Klasse 2: Eigenkapital, Rückstellungen, Verbindlichkeiten
      { number: '2000', name: 'Eigenkapital', type: 'EQUITY', category: 'EQUITY' },
      { number: '2100', name: 'Gezeichnetes Kapital', type: 'EQUITY', category: 'EQUITY' },
      { number: '2150', name: 'Kapitalrücklage', type: 'EQUITY', category: 'EQUITY' },
      { number: '2170', name: 'Gewinnrücklagen', type: 'EQUITY', category: 'EQUITY' },
      { number: '2200', name: 'Gewinnvortrag', type: 'EQUITY', category: 'EQUITY' },
      { number: '2210', name: 'Verlustvortrag', type: 'EQUITY', category: 'EQUITY' },
      { number: '2300', name: 'Privatentnahmen', type: 'EQUITY', category: 'EQUITY' },
      { number: '2310', name: 'Privateinlagen', type: 'EQUITY', category: 'EQUITY' },
      { number: '2600', name: 'Pensionsrückstellungen', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      { number: '2650', name: 'Steuerrückstellungen', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2700', name: 'Sonstige Rückstellungen', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      
      // Klasse 5: Betriebliche Erträge
      { number: '5000', name: 'Umsatzerlöse', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '5200', name: 'Bestandsveränderungen', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '5400', name: 'Erlöse aus dem Abgang von Anlagevermögen', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '5600', name: 'Mieterträge', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '5700', name: 'Sonstige betriebliche Erträge', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '5800', name: 'Erträge aus Beteiligungen', type: 'REVENUE', category: 'FINANCIAL' },
      { number: '5900', name: 'Zinsen und ähnliche Erträge', type: 'REVENUE', category: 'FINANCIAL' },
      
      // Klasse 6: Betriebliche Aufwendungen
      { number: '6000', name: 'Materialaufwand', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '6100', name: 'Fremdleistungen', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '6200', name: 'Löhne und Gehälter', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '6300', name: 'Soziale Abgaben und Aufwendungen', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '6400', name: 'Abschreibungen', type: 'EXPENSE', category: 'DEPRECIATION' },
      { number: '6500', name: 'Raumkosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6520', name: 'Instandhaltung', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6540', name: 'Fahrzeugkosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6560', name: 'Werbekosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6600', name: 'Kosten der Warenabgabe', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6620', name: 'Rechts- und Beratungskosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6640', name: 'Versicherungen', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6660', name: 'Beiträge und Gebühren', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6680', name: 'Reisekosten', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6700', name: 'Sonstige betriebliche Aufwendungen', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6800', name: 'Zinsaufwendungen', type: 'EXPENSE', category: 'FINANCIAL' },
      { number: '6900', name: 'Steuern', type: 'EXPENSE', category: 'TAXES' },
      { number: '6920', name: 'Körperschaftsteuer', type: 'EXPENSE', category: 'TAXES' },
      { number: '6940', name: 'Gewerbesteuer', type: 'EXPENSE', category: 'TAXES' }
    ]
  },

  IKR: {
    id: 'IKR',
    name: 'IKR - Industriekontenrahmen',
    country: 'DE',
    description: 'Kontenrahmen für Industrieunternehmen',
    accounts: [
      // Klasse 0: Anlagevermögen und Kapital
      { number: '0000', name: 'Gezeichnetes Kapital', type: 'EQUITY', category: 'EQUITY' },
      { number: '0100', name: 'Kapitalrücklage', type: 'EQUITY', category: 'EQUITY' },
      { number: '0200', name: 'Gewinnrücklagen', type: 'EQUITY', category: 'EQUITY' },
      { number: '0300', name: 'Gewinn-/Verlustvortrag', type: 'EQUITY', category: 'EQUITY' },
      { number: '0400', name: 'Verbindlichkeiten gegenüber Kreditinstituten', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      { number: '0500', name: 'Anleihen', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      { number: '0600', name: 'Grundstücke und Gebäude', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0700', name: 'Technische Anlagen und Maschinen', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0800', name: 'Betriebs- und Geschäftsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '0900', name: 'Beteiligungen', type: 'ASSET', category: 'FIXED_ASSETS' },
      
      // Klasse 1: Finanz- und Privatvermögen
      { number: '1000', name: 'Forderungen aus Lieferungen und Leistungen', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1100', name: 'Sonstige Forderungen', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1200', name: 'Wertpapiere', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1300', name: 'Kasse', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1400', name: 'Bank', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1500', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1600', name: 'Sonstige Verbindlichkeiten', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '1700', name: 'Vorsteuer', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1800', name: 'Umsatzsteuer', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      
      // Klasse 2: Abgrenzungskonten
      { number: '2000', name: 'Roh-, Hilfs- und Betriebsstoffe', type: 'ASSET', category: 'INVENTORY' },
      { number: '2100', name: 'Unfertige Erzeugnisse', type: 'ASSET', category: 'INVENTORY' },
      { number: '2200', name: 'Fertige Erzeugnisse', type: 'ASSET', category: 'INVENTORY' },
      { number: '2300', name: 'Waren', type: 'ASSET', category: 'INVENTORY' },
      { number: '2400', name: 'Geleistete Anzahlungen', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '2500', name: 'Erhaltene Anzahlungen', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      
      // Klasse 4: Betriebliche Aufwendungen
      { number: '4000', name: 'Materialaufwand', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '4100', name: 'Löhne', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '4200', name: 'Gehälter', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '4300', name: 'Soziale Abgaben', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '4800', name: 'Sonstige betriebliche Aufwendungen', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '4900', name: 'Abschreibungen', type: 'EXPENSE', category: 'DEPRECIATION' },
      
      // Klasse 5: Betriebliche Erträge
      { number: '5000', name: 'Umsatzerlöse Inland', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '5100', name: 'Umsatzerlöse Ausland', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '5400', name: 'Bestandsveränderungen', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '5800', name: 'Sonstige betriebliche Erträge', type: 'REVENUE', category: 'OTHER_INCOME' }
    ]
  },

  GAAP: {
    id: 'GAAP',
    name: 'US GAAP',
    country: 'US',
    description: 'Generally Accepted Accounting Principles (United States)',
    accounts: [
      // 1000-1999: Assets
      { number: '1000', name: 'Cash', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1010', name: 'Petty Cash', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1020', name: 'Cash in Bank - Checking', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1030', name: 'Cash in Bank - Savings', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1100', name: 'Accounts Receivable', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1110', name: 'Allowance for Doubtful Accounts', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1200', name: 'Inventory', type: 'ASSET', category: 'INVENTORY' },
      { number: '1300', name: 'Prepaid Expenses', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1400', name: 'Property, Plant & Equipment', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1410', name: 'Land', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1420', name: 'Buildings', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1430', name: 'Equipment', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1440', name: 'Vehicles', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1450', name: 'Accumulated Depreciation', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1500', name: 'Intangible Assets', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1600', name: 'Investments', type: 'ASSET', category: 'FIXED_ASSETS' },
      
      // 2000-2999: Liabilities
      { number: '2000', name: 'Accounts Payable', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2100', name: 'Accrued Expenses', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2110', name: 'Accrued Wages', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2120', name: 'Accrued Taxes', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2200', name: 'Short-term Debt', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2300', name: 'Long-term Debt', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      { number: '2400', name: 'Deferred Revenue', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      
      // 3000-3999: Equity
      { number: '3000', name: 'Common Stock', type: 'EQUITY', category: 'EQUITY' },
      { number: '3100', name: 'Preferred Stock', type: 'EQUITY', category: 'EQUITY' },
      { number: '3200', name: 'Additional Paid-in Capital', type: 'EQUITY', category: 'EQUITY' },
      { number: '3300', name: 'Retained Earnings', type: 'EQUITY', category: 'EQUITY' },
      { number: '3400', name: 'Treasury Stock', type: 'EQUITY', category: 'EQUITY' },
      { number: '3500', name: 'Dividends', type: 'EQUITY', category: 'EQUITY' },
      
      // 4000-4999: Revenue
      { number: '4000', name: 'Sales Revenue', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '4100', name: 'Service Revenue', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '4200', name: 'Sales Returns and Allowances', type: 'REVENUE', category: 'SALES_DEDUCTIONS' },
      { number: '4300', name: 'Sales Discounts', type: 'REVENUE', category: 'SALES_DEDUCTIONS' },
      { number: '4400', name: 'Interest Income', type: 'REVENUE', category: 'FINANCIAL' },
      { number: '4500', name: 'Other Income', type: 'REVENUE', category: 'OTHER_INCOME' },
      
      // 5000-5999: Cost of Goods Sold
      { number: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '5100', name: 'Purchases', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '5200', name: 'Purchase Discounts', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '5300', name: 'Freight-in', type: 'EXPENSE', category: 'COST_OF_SALES' },
      
      // 6000-6999: Operating Expenses
      { number: '6000', name: 'Salaries and Wages', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '6100', name: 'Employee Benefits', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '6200', name: 'Payroll Taxes', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '6300', name: 'Rent Expense', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6400', name: 'Utilities', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6500', name: 'Office Supplies', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6600', name: 'Depreciation Expense', type: 'EXPENSE', category: 'DEPRECIATION' },
      { number: '6700', name: 'Insurance', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6800', name: 'Marketing and Advertising', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '6900', name: 'Professional Fees', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      
      // 7000-7999: Other Expenses
      { number: '7000', name: 'Interest Expense', type: 'EXPENSE', category: 'FINANCIAL' },
      { number: '7100', name: 'Income Tax Expense', type: 'EXPENSE', category: 'TAXES' },
      { number: '7900', name: 'Miscellaneous Expenses', type: 'EXPENSE', category: 'OPERATING_EXPENSES' }
    ]
  },

  IFRS: {
    id: 'IFRS',
    name: 'IFRS',
    country: 'INTERNATIONAL',
    description: 'International Financial Reporting Standards',
    accounts: [
      // Assets
      { number: '1000', name: 'Cash and Cash Equivalents', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1100', name: 'Trade Receivables', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1200', name: 'Inventories', type: 'ASSET', category: 'INVENTORY' },
      { number: '1300', name: 'Prepayments', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '1400', name: 'Property, Plant and Equipment', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1500', name: 'Intangible Assets', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1600', name: 'Financial Assets', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '1700', name: 'Deferred Tax Assets', type: 'ASSET', category: 'FIXED_ASSETS' },
      
      // Liabilities
      { number: '2000', name: 'Trade Payables', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2100', name: 'Accrued Liabilities', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2200', name: 'Provisions', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '2300', name: 'Borrowings', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      { number: '2400', name: 'Deferred Tax Liabilities', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      
      // Equity
      { number: '3000', name: 'Share Capital', type: 'EQUITY', category: 'EQUITY' },
      { number: '3100', name: 'Share Premium', type: 'EQUITY', category: 'EQUITY' },
      { number: '3200', name: 'Retained Earnings', type: 'EQUITY', category: 'EQUITY' },
      { number: '3300', name: 'Other Reserves', type: 'EQUITY', category: 'EQUITY' },
      
      // Revenue
      { number: '4000', name: 'Revenue from Contracts with Customers', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '4100', name: 'Other Operating Income', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '4200', name: 'Finance Income', type: 'REVENUE', category: 'FINANCIAL' },
      
      // Expenses
      { number: '5000', name: 'Cost of Sales', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '5100', name: 'Distribution Costs', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '5200', name: 'Administrative Expenses', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '5300', name: 'Employee Benefits', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '5400', name: 'Depreciation and Amortisation', type: 'EXPENSE', category: 'DEPRECIATION' },
      { number: '5500', name: 'Finance Costs', type: 'EXPENSE', category: 'FINANCIAL' },
      { number: '5600', name: 'Income Tax Expense', type: 'EXPENSE', category: 'TAXES' }
    ]
  },

  PCG: {
    id: 'PCG',
    name: 'Plan Comptable Général',
    country: 'FR',
    description: 'Französischer Kontenrahmen (France)',
    accounts: [
      // Classe 1: Comptes de capitaux
      { number: '101', name: 'Capital', type: 'EQUITY', category: 'EQUITY' },
      { number: '106', name: 'Réserves', type: 'EQUITY', category: 'EQUITY' },
      { number: '110', name: 'Report à nouveau', type: 'EQUITY', category: 'EQUITY' },
      { number: '120', name: 'Résultat', type: 'EQUITY', category: 'EQUITY' },
      { number: '164', name: 'Emprunts', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      
      // Classe 2: Comptes d'immobilisations
      { number: '211', name: 'Terrains', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '213', name: 'Constructions', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '215', name: 'Installations techniques', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '218', name: 'Matériel de bureau', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '261', name: 'Titres de participation', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '281', name: 'Amortissements', type: 'ASSET', category: 'FIXED_ASSETS' },
      
      // Classe 4: Comptes de tiers
      { number: '401', name: 'Fournisseurs', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '411', name: 'Clients', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '421', name: 'Personnel', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '431', name: 'Sécurité sociale', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '445', name: 'État - TVA', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '512', name: 'Banques', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '530', name: 'Caisse', type: 'ASSET', category: 'CURRENT_ASSETS' },
      
      // Classe 6: Comptes de charges
      { number: '601', name: 'Achats de marchandises', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '606', name: 'Achats non stockés', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '611', name: 'Sous-traitance', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '613', name: 'Locations', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '616', name: 'Primes d\'assurance', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '621', name: 'Personnel extérieur', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '641', name: 'Rémunérations du personnel', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '645', name: 'Charges sociales', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '661', name: 'Charges d\'intérêts', type: 'EXPENSE', category: 'FINANCIAL' },
      { number: '681', name: 'Dotations aux amortissements', type: 'EXPENSE', category: 'DEPRECIATION' },
      
      // Classe 7: Comptes de produits
      { number: '701', name: 'Ventes de marchandises', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '706', name: 'Prestations de services', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '708', name: 'Produits des activités annexes', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '761', name: 'Produits financiers', type: 'REVENUE', category: 'FINANCIAL' },
      { number: '791', name: 'Transferts de charges', type: 'REVENUE', category: 'OTHER_INCOME' }
    ]
  },

  PGC: {
    id: 'PGC',
    name: 'Plan General de Contabilidad',
    country: 'ES',
    description: 'Spanischer Kontenrahmen (Spain)',
    accounts: [
      // Grupo 1: Financiación básica
      { number: '100', name: 'Capital social', type: 'EQUITY', category: 'EQUITY' },
      { number: '112', name: 'Reserva legal', type: 'EQUITY', category: 'EQUITY' },
      { number: '113', name: 'Reservas voluntarias', type: 'EQUITY', category: 'EQUITY' },
      { number: '129', name: 'Resultado del ejercicio', type: 'EQUITY', category: 'EQUITY' },
      { number: '170', name: 'Deudas a largo plazo', type: 'LIABILITY', category: 'LONG_TERM_LIABILITIES' },
      
      // Grupo 2: Activo no corriente
      { number: '210', name: 'Terrenos', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '211', name: 'Construcciones', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '213', name: 'Maquinaria', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '216', name: 'Mobiliario', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '217', name: 'Equipos informáticos', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '218', name: 'Elementos de transporte', type: 'ASSET', category: 'FIXED_ASSETS' },
      { number: '281', name: 'Amortización acumulada', type: 'ASSET', category: 'FIXED_ASSETS' },
      
      // Grupo 4: Acreedores y deudores
      { number: '400', name: 'Proveedores', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '430', name: 'Clientes', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '465', name: 'Remuneraciones pendientes de pago', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '472', name: 'IVA soportado', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '477', name: 'IVA repercutido', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '521', name: 'Deudas a corto plazo', type: 'LIABILITY', category: 'CURRENT_LIABILITIES' },
      { number: '570', name: 'Caja', type: 'ASSET', category: 'CURRENT_ASSETS' },
      { number: '572', name: 'Bancos', type: 'ASSET', category: 'CURRENT_ASSETS' },
      
      // Grupo 6: Compras y gastos
      { number: '600', name: 'Compras de mercaderías', type: 'EXPENSE', category: 'COST_OF_SALES' },
      { number: '621', name: 'Arrendamientos', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '622', name: 'Reparaciones y conservación', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '623', name: 'Servicios profesionales', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '625', name: 'Primas de seguros', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '627', name: 'Publicidad', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '628', name: 'Suministros', type: 'EXPENSE', category: 'OPERATING_EXPENSES' },
      { number: '640', name: 'Sueldos y salarios', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '642', name: 'Seguridad Social', type: 'EXPENSE', category: 'PERSONNEL' },
      { number: '662', name: 'Intereses de deudas', type: 'EXPENSE', category: 'FINANCIAL' },
      { number: '681', name: 'Amortización', type: 'EXPENSE', category: 'DEPRECIATION' },
      
      // Grupo 7: Ventas e ingresos
      { number: '700', name: 'Ventas de mercaderías', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '705', name: 'Prestaciones de servicios', type: 'REVENUE', category: 'OPERATING_REVENUE' },
      { number: '759', name: 'Ingresos por servicios diversos', type: 'REVENUE', category: 'OTHER_INCOME' },
      { number: '769', name: 'Otros ingresos financieros', type: 'REVENUE', category: 'FINANCIAL' }
    ]
  }
};

/**
 * Get all available account frameworks
 */
function getAccountFrameworks() {
  return Object.keys(accountFrameworks).map(key => ({
    id: accountFrameworks[key].id,
    name: accountFrameworks[key].name,
    country: accountFrameworks[key].country,
    description: accountFrameworks[key].description,
    accountCount: accountFrameworks[key].accounts.length
  }));
}

/**
 * Get a specific account framework by ID
 */
function getAccountFramework(frameworkId) {
  return accountFrameworks[frameworkId] || null;
}

/**
 * Get accounts for a specific framework
 */
function getFrameworkAccounts(frameworkId) {
  const framework = accountFrameworks[frameworkId];
  return framework ? framework.accounts : [];
}

module.exports = {
  getAccountFrameworks,
  getAccountFramework,
  getFrameworkAccounts,
  accountFrameworks
};

