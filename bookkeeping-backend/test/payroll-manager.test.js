// Payroll Manager Tests

const payrollManager = require('../payroll-manager');

describe('PayrollManager', () => {
  beforeEach(() => {
    // Clear employees array
    payrollManager._employees.length = 0;
  });

  describe('Employee CRUD Operations', () => {
    test('should create employee with all required fields', () => {
      const employeeData = {
        employeeNumber: 'EMP001',
        firstName: 'Max',
        lastName: 'Mustermann',
        dateOfBirth: '1990-01-15',
        hireDate: '2024-01-01',
        position: 'Software Developer',
        department: 'IT',
        grossSalaryMonthly: 5000,
        taxClass: 1,
        taxId: '12345678901',
        socialSecurityNumber: 'DE123456',
        iban: 'DE89370400440532013000'
      };

      const employee = payrollManager.createEmployee('org1', employeeData);

      expect(employee.id).toBeDefined();
      expect(employee.firstName).toBe('Max');
      expect(employee.lastName).toBe('Mustermann');
      expect(employee.grossSalaryMonthly).toBe(5000);
      expect(employee.isActive).toBe(true);
    });

    test('should get employees by organization', () => {
      payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4000
      });

      payrollManager.createEmployee('org2', {
        employeeNumber: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1992-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4500
      });

      const org1Employees = payrollManager.getEmployees('org1');
      expect(org1Employees.length).toBe(1);
      expect(org1Employees[0].firstName).toBe('John');
    });

    test('should filter employees by department', () => {
      payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        hireDate: '2024-01-01',
        department: 'IT',
        grossSalaryMonthly: 4000
      });

      payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1992-01-01',
        hireDate: '2024-01-01',
        department: 'Sales',
        grossSalaryMonthly: 4500
      });

      const itEmployees = payrollManager.getEmployees('org1', { department: 'IT' });
      expect(itEmployees.length).toBe(1);
      expect(itEmployees[0].firstName).toBe('John');
    });

    test('should update employee', () => {
      const employee = payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4000
      });

      const updated = payrollManager.updateEmployee(employee.id, {
        grossSalaryMonthly: 4500,
        position: 'Senior Developer'
      });

      expect(updated.grossSalaryMonthly).toBe(4500);
      expect(updated.position).toBe('Senior Developer');
    });

    test('should delete employee', () => {
      const employee = payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4000
      });

      payrollManager.deleteEmployee(employee.id);

      expect(() => payrollManager.getEmployee(employee.id)).toThrow('Employee not found');
    });
  });

  describe('Tax Calculations', () => {
    test('should calculate zero tax for income below Grundfreibetrag', () => {
      const tax = payrollManager.calculateIncomeTax(10000, 1, 0);
      expect(tax).toBe(0);
    });

    test('should calculate tax for middle income bracket', () => {
      const tax = payrollManager.calculateIncomeTax(50000, 1, 0);
      expect(tax).toBeGreaterThan(0);
      expect(tax).toBeLessThan(50000);
    });

    test('should reduce tax with child allowances', () => {
      const taxNoChildren = payrollManager.calculateIncomeTax(50000, 1, 0);
      const taxWith Children = payrollManager.calculateIncomeTax(50000, 1, 2);
      expect(taxWithChildren).toBeLessThan(taxNoChildren);
    });

    test('should provide tax benefit for tax class 3', () => {
      const taxClass1 = payrollManager.calculateIncomeTax(50000, 1, 0);
      const taxClass3 = payrollManager.calculateIncomeTax(50000, 3, 0);
      expect(taxClass3).toBeLessThan(taxClass1);
    });
  });

  describe('Social Security Calculations', () => {
    test('should calculate all social security contributions', () => {
      const contributions = payrollManager.calculateSocialSecurity(4000, 'WEST', 'PUBLIC');

      expect(contributions.employee.pension).toBeGreaterThan(0);
      expect(contributions.employee.unemployment).toBeGreaterThan(0);
      expect(contributions.employee.health).toBeGreaterThan(0);
      expect(contributions.employee.care).toBeGreaterThan(0);
      expect(contributions.total.employee).toBeGreaterThan(0);
      expect(contributions.total.employer).toBeGreaterThan(0);
    });

    test('should respect contribution ceiling', () => {
      const highSalary = payrollManager.calculateSocialSecurity(10000, 'WEST', 'PUBLIC');
      const cappedAmount = payrollManager.SOCIAL_SECURITY_RATES.pension.employee * 7550;
      
      expect(highSalary.employee.pension).toBeLessThanOrEqual(cappedAmount * 1.01);
    });

    test('should have equal employee and employer contributions', () => {
      const contributions = payrollManager.calculateSocialSecurity(4000, 'WEST', 'PUBLIC');

      expect(contributions.employee.pension).toBeCloseTo(contributions.employer.pension, 2);
      expect(contributions.employee.health).toBeCloseTo(contributions.employer.health, 2);
    });
  });

  describe('Payroll Run', () => {
    test('should create payroll run for all active employees', () => {
      payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4000,
        taxClass: 1
      });

      payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1992-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4500,
        taxClass: 1
      });

      const payrollRun = payrollManager.runPayroll('org1', '2024-01-01', '2024-01-31');

      expect(payrollRun.employeeCount).toBe(2);
      expect(payrollRun.payslips.length).toBe(2);
      expect(payrollRun.totalGross).toBe(8500);
      expect(payrollRun.totalNet).toBeGreaterThan(0);
      expect(payrollRun.totalNet).toBeLessThan(payrollRun.totalGross);
      expect(payrollRun.status).toBe('DRAFT');
    });

    test('should not include inactive employees in payroll run', () => {
      payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP001',
        firstName: 'Active',
        lastName: 'Employee',
        dateOfBirth: '1990-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4000,
        isActive: true
      });

      payrollManager.createEmployee('org1', {
        employeeNumber: 'EMP002',
        firstName: 'Inactive',
        lastName: 'Employee',
        dateOfBirth: '1992-01-01',
        hireDate: '2024-01-01',
        grossSalaryMonthly: 4500,
        isActive: false
      });

      const payrollRun = payrollManager.runPayroll('org1', '2024-01-01', '2024-01-31');

      expect(payrollRun.employeeCount).toBe(1);
      expect(payrollRun.payslips[0].employeeName).toContain('Active');
    });
  });
});

