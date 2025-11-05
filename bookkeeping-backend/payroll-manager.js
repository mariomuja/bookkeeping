// Payroll Management Module
// Handles employee data, salary calculations, tax, and social security

const { v4: uuidv4 } = require('uuid');

// In-memory storage (in production, use database)
const employees = [];
const payrollRuns = [];
const payslips = [];

// German Tax Brackets 2024 (simplified)
const TAX_BRACKETS_2024 = [
  { limit: 10908, rate: 0 },      // Grundfreibetrag
  { limit: 15999, rate: 0.14 },
  { limit: 62809, rate: 0.24 },
  { limit: 277825, rate: 0.42 },
  { limit: Infinity, rate: 0.45 }
];

// Social Security Rates 2024 (Germany)
const SOCIAL_SECURITY_RATES = {
  pension: { employee: 0.093, employer: 0.093 },           // Rentenversicherung
  unemployment: { employee: 0.012, employer: 0.012 },      // Arbeitslosenversicherung
  health: { employee: 0.073, employer: 0.073 },            // Krankenversicherung (average)
  care: { employee: 0.01775, employer: 0.01775 }           // Pflegeversicherung
};

// Contribution ceiling 2024
const CONTRIBUTION_CEILING = {
  pensionWest: 7550,      // Monthly ceiling West Germany
  pensionEast: 7450,      // Monthly ceiling East Germany
  health: 5175            // Monthly ceiling for health insurance
};

/**
 * Employee Class
 */
class Employee {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.organizationId = data.organizationId;
    this.employeeNumber = data.employeeNumber;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.dateOfBirth = new Date(data.dateOfBirth);
    this.hireDate = new Date(data.hireDate);
    this.position = data.position;
    this.department = data.department;
    this.costCenter = data.costCenter || null;
    
    // Salary information
    this.grossSalaryMonthly = parseFloat(data.grossSalaryMonthly);
    this.paymentFrequency = data.paymentFrequency || 'MONTHLY'; // MONTHLY, BIWEEKLY, WEEKLY
    
    // Tax information
    this.taxClass = data.taxClass || 1; // Steuerklasse (1-6)
    this.taxId = data.taxId; // Steueridentifikationsnummer
    this.churchTax = data.churchTax || false;
    this.childAllowances = data.childAllowances || 0; // Kinderfreibeträge
    
    // Social Security
    this.socialSecurityNumber = data.socialSecurityNumber;
    this.healthInsurance = data.healthInsurance || 'PUBLIC'; // PUBLIC or PRIVATE
    this.region = data.region || 'WEST'; // WEST or EAST Germany
    
    // Bank details
    this.iban = data.iban;
    this.bic = data.bic;
    
    // Status
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.terminationDate = data.terminationDate ? new Date(data.terminationDate) : null;
    
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

/**
 * Calculate German income tax (simplified)
 */
function calculateIncomeTax(annualGross, taxClass, childAllowances = 0) {
  // Adjust for tax class and child allowances
  let taxableIncome = annualGross;
  
  // Child allowance deduction
  taxableIncome -= childAllowances * 3012; // per child per year (simplified)
  
  // Tax class adjustments (simplified)
  if (taxClass === 3) {
    taxableIncome *= 0.9; // Higher allowance for married with one income
  }
  
  let tax = 0;
  let previousLimit = 0;
  
  for (const bracket of TAX_BRACKETS_2024) {
    if (taxableIncome > previousLimit) {
      const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
      tax += taxableInBracket * bracket.rate;
      previousLimit = bracket.limit;
    }
  }
  
  return Math.max(0, tax);
}

/**
 * Calculate social security contributions
 */
function calculateSocialSecurity(monthlyGross, region = 'WEST', healthInsurance = 'PUBLIC') {
  const contributions = {
    employee: {},
    employer: {},
    total: { employee: 0, employer: 0 }
  };
  
  if (healthInsurance === 'PRIVATE') {
    // Private health insurance - different calculation
    return contributions;
  }
  
  // Determine ceiling
  const pensionCeiling = region === 'WEST' ? CONTRIBUTION_CEILING.pensionWest : CONTRIBUTION_CEILING.pensionEast;
  const healthCeiling = CONTRIBUTION_CEILING.health;
  
  // Calculate base for pension/unemployment (with ceiling)
  const pensionBase = Math.min(monthlyGross, pensionCeiling);
  const healthBase = Math.min(monthlyGross, healthCeiling);
  
  // Pension insurance
  contributions.employee.pension = pensionBase * SOCIAL_SECURITY_RATES.pension.employee;
  contributions.employer.pension = pensionBase * SOCIAL_SECURITY_RATES.pension.employer;
  
  // Unemployment insurance
  contributions.employee.unemployment = pensionBase * SOCIAL_SECURITY_RATES.unemployment.employee;
  contributions.employer.unemployment = pensionBase * SOCIAL_SECURITY_RATES.unemployment.employer;
  
  // Health insurance
  contributions.employee.health = healthBase * SOCIAL_SECURITY_RATES.health.employee;
  contributions.employer.health = healthBase * SOCIAL_SECURITY_RATES.health.employer;
  
  // Care insurance
  contributions.employee.care = healthBase * SOCIAL_SECURITY_RATES.care.employee;
  contributions.employer.care = healthBase * SOCIAL_SECURITY_RATES.care.employer;
  
  // Totals
  contributions.total.employee = Object.values(contributions.employee).reduce((sum, val) => sum + val, 0);
  contributions.total.employer = Object.values(contributions.employer).reduce((sum, val) => sum + val, 0);
  
  return contributions;
}

/**
 * Calculate payslip for an employee
 */
function calculatePayslip(employee, periodStart, periodEnd) {
  const monthlyGross = employee.grossSalaryMonthly;
  const annualGross = monthlyGross * 12;
  
  // Calculate income tax
  const annualTax = calculateIncomeTax(annualGross, employee.taxClass, employee.childAllowances);
  const monthlyTax = annualTax / 12;
  
  // Calculate church tax (8% or 9% of income tax)
  const churchTax = employee.churchTax ? monthlyTax * 0.09 : 0;
  
  // Calculate social security
  const socialSecurity = calculateSocialSecurity(monthlyGross, employee.region, employee.healthInsurance);
  
  // Calculate net salary
  const deductions = monthlyTax + churchTax + socialSecurity.total.employee;
  const netSalary = monthlyGross - deductions;
  
  return {
    id: uuidv4(),
    employeeId: employee.id,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    grossSalary: monthlyGross,
    incomeTax: monthlyTax,
    churchTax: churchTax,
    solidarityTax: monthlyTax * 0.055, // Solidaritätszuschlag
    socialSecurity: {
      pension: socialSecurity.employee.pension,
      unemployment: socialSecurity.employee.unemployment,
      health: socialSecurity.employee.health,
      care: socialSecurity.employee.care,
      total: socialSecurity.total.employee
    },
    employerContributions: {
      pension: socialSecurity.employer.pension,
      unemployment: socialSecurity.employer.unemployment,
      health: socialSecurity.employer.health,
      care: socialSecurity.employer.care,
      total: socialSecurity.total.employer
    },
    totalDeductions: deductions,
    netSalary: netSalary,
    createdAt: new Date()
  };
}

/**
 * Create payroll run for all active employees
 */
function runPayroll(organizationId, periodStart, periodEnd, username = 'System') {
  const orgEmployees = employees.filter(e => 
    e.organizationId === organizationId && 
    e.isActive
  );
  
  const payrollRun = {
    id: uuidv4(),
    organizationId,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    employeeCount: orgEmployees.length,
    status: 'DRAFT',
    totalGross: 0,
    totalNet: 0,
    totalTax: 0,
    totalSocialSecurity: 0,
    payslips: [],
    createdBy: username,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Calculate payslips for all employees
  orgEmployees.forEach(employee => {
    const payslip = calculatePayslip(employee, periodStart, periodEnd);
    payslip.payrollRunId = payrollRun.id;
    payslip.employeeNumber = employee.employeeNumber;
    payslip.employeeName = `${employee.firstName} ${employee.lastName}`;
    payslip.costCenter = employee.costCenter;
    
    payrollRun.payslips.push(payslip);
    payrollRun.totalGross += payslip.grossSalary;
    payrollRun.totalNet += payslip.netSalary;
    payrollRun.totalTax += payslip.incomeTax + payslip.churchTax + payslip.solidarityTax;
    payrollRun.totalSocialSecurity += payslip.socialSecurity.total;
  });
  
  payrollRuns.push(payrollRun);
  return payrollRun;
}

/**
 * Post payroll run (create journal entries)
 */
function postPayrollRun(payrollRunId, journalEntries, journalEntryLines, accounts) {
  const run = payrollRuns.find(r => r.id === payrollRunId);
  if (!run) {
    throw new Error('Payroll run not found');
  }
  
  if (run.status === 'POSTED') {
    throw new Error('Payroll run already posted');
  }
  
  // Find relevant accounts (simplified - should be configurable)
  const salaryExpenseAccount = accounts.find(a => a.accountNumber === '6100');
  const taxLiabilityAccount = accounts.find(a => a.accountNumber === '2000');
  const socialSecLiabilityAccount = accounts.find(a => a.accountNumber === '2100');
  const cashAccount = accounts.find(a => a.accountNumber === '1000');
  
  if (!salaryExpenseAccount || !cashAccount) {
    throw new Error('Required accounts not found');
  }
  
  // Create journal entry
  const journalEntry = {
    id: uuidv4(),
    organizationId: run.organizationId,
    entryNumber: `PAY-${run.id.substring(0, 8)}`,
    entryDate: run.periodEnd,
    description: `Payroll ${run.periodStart.toISOString().split('T')[0]} - ${run.periodEnd.toISOString().split('T')[0]}`,
    currency: 'EUR',
    status: 'POSTED',
    documentType: 'PAYROLL',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const lines = [];
  let lineNumber = 1;
  
  // Debit: Salary Expense
  lines.push({
    id: uuidv4(),
    journalEntryId: journalEntry.id,
    accountId: salaryExpenseAccount.id,
    lineNumber: lineNumber++,
    description: 'Gross Salaries',
    debitAmount: run.totalGross,
    creditAmount: 0,
    createdAt: new Date()
  });
  
  // Credit: Tax Liabilities
  if (taxLiabilityAccount && run.totalTax > 0) {
    lines.push({
      id: uuidv4(),
      journalEntryId: journalEntry.id,
      accountId: taxLiabilityAccount.id,
      lineNumber: lineNumber++,
      description: 'Tax Withholdings',
      debitAmount: 0,
      creditAmount: run.totalTax,
      createdAt: new Date()
    });
  }
  
  // Credit: Social Security Liabilities
  if (socialSecLiabilityAccount && run.totalSocialSecurity > 0) {
    lines.push({
      id: uuidv4(),
      journalEntryId: journalEntry.id,
      accountId: socialSecLiabilityAccount.id,
      lineNumber: lineNumber++,
      description: 'Social Security Withholdings',
      debitAmount: 0,
      creditAmount: run.totalSocialSecurity,
      createdAt: new Date()
    });
  }
  
  // Credit: Cash (Net Salaries)
  lines.push({
    id: uuidv4(),
    journalEntryId: journalEntry.id,
    accountId: cashAccount.id,
    lineNumber: lineNumber++,
    description: 'Net Salaries Payable',
    debitAmount: 0,
    creditAmount: run.totalNet,
    createdAt: new Date()
  });
  
  // Add to mock data
  journalEntries.push(journalEntry);
  journalEntryLines.push(...lines);
  
  // Update payroll run status
  run.status = 'POSTED';
  run.journalEntryId = journalEntry.id;
  run.updatedAt = new Date();
  
  return {
    payrollRun: run,
    journalEntry,
    lines
  };
}

// CRUD Operations

function createEmployee(organizationId, employeeData, username = 'System') {
  const employee = new Employee({
    ...employeeData,
    organizationId
  });
  
  employees.push(employee);
  return employee;
}

function getEmployees(organizationId, filters = {}) {
  let result = employees.filter(e => e.organizationId === organizationId);
  
  if (filters.isActive !== undefined) {
    result = result.filter(e => e.isActive === (filters.isActive === 'true'));
  }
  
  if (filters.department) {
    result = result.filter(e => e.department === filters.department);
  }
  
  if (filters.costCenter) {
    result = result.filter(e => e.costCenter === filters.costCenter);
  }
  
  return result;
}

function getEmployee(id) {
  const employee = employees.find(e => e.id === id);
  if (!employee) {
    throw new Error('Employee not found');
  }
  return employee;
}

function updateEmployee(id, updates, username = 'System') {
  const employee = getEmployee(id);
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined && key !== 'id' && key !== 'organizationId') {
      employee[key] = updates[key];
    }
  });
  
  employee.updatedAt = new Date();
  return employee;
}

function deleteEmployee(id) {
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Employee not found');
  }
  employees.splice(index, 1);
}

function getPayrollRuns(organizationId, filters = {}) {
  let result = payrollRuns.filter(r => r.organizationId === organizationId);
  
  if (filters.status) {
    result = result.filter(r => r.status === filters.status);
  }
  
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

function getPayrollRun(id) {
  const run = payrollRuns.find(r => r.id === id);
  if (!run) {
    throw new Error('Payroll run not found');
  }
  return run;
}

module.exports = {
  Employee,
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  runPayroll,
  postPayrollRun,
  getPayrollRuns,
  getPayrollRun,
  calculateIncomeTax,
  calculateSocialSecurity,
  TAX_BRACKETS_2024,
  SOCIAL_SECURITY_RATES
};

