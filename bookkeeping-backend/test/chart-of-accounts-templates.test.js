const assert = require('assert');
const chartOfAccountsTemplates = require('../chart-of-accounts-templates');

describe('Chart of Accounts Templates', function() {
  
  describe('getAccountFrameworks', function() {
    it('should return an array of frameworks', function() {
      const frameworks = chartOfAccountsTemplates.getAccountFrameworks();
      assert(Array.isArray(frameworks));
      assert(frameworks.length > 0);
    });

    it('should include framework properties', function() {
      const frameworks = chartOfAccountsTemplates.getAccountFrameworks();
      const framework = frameworks[0];
      assert(framework.id);
      assert(framework.name);
      assert(framework.country);
      assert(framework.description);
      assert(typeof framework.accountCount === 'number');
    });

    it('should include SKR03, SKR04, IKR, GAAP, IFRS, PCG, PGC', function() {
      const frameworks = chartOfAccountsTemplates.getAccountFrameworks();
      const ids = frameworks.map(f => f.id);
      assert(ids.includes('SKR03'));
      assert(ids.includes('SKR04'));
      assert(ids.includes('IKR'));
      assert(ids.includes('GAAP'));
      assert(ids.includes('IFRS'));
      assert(ids.includes('PCG'));
      assert(ids.includes('PGC'));
    });
  });

  describe('getAccountFramework', function() {
    it('should return a framework by ID', function() {
      const framework = chartOfAccountsTemplates.getAccountFramework('SKR03');
      assert(framework);
      assert.strictEqual(framework.id, 'SKR03');
      assert(framework.accounts);
      assert(Array.isArray(framework.accounts));
    });

    it('should return null for invalid ID', function() {
      const framework = chartOfAccountsTemplates.getAccountFramework('INVALID');
      assert.strictEqual(framework, null);
    });

    it('should include account details', function() {
      const framework = chartOfAccountsTemplates.getAccountFramework('SKR03');
      const account = framework.accounts[0];
      assert(account.number);
      assert(account.name);
      assert(account.type);
      assert(account.category);
    });
  });

  describe('getFrameworkAccounts', function() {
    it('should return accounts for a framework', function() {
      const accounts = chartOfAccountsTemplates.getFrameworkAccounts('SKR03');
      assert(Array.isArray(accounts));
      assert(accounts.length > 0);
    });

    it('should return empty array for invalid framework', function() {
      const accounts = chartOfAccountsTemplates.getFrameworkAccounts('INVALID');
      assert(Array.isArray(accounts));
      assert.strictEqual(accounts.length, 0);
    });

    it('should include required account properties', function() {
      const accounts = chartOfAccountsTemplates.getFrameworkAccounts('GAAP');
      const account = accounts[0];
      assert(account.number);
      assert(account.name);
      assert(account.type);
      assert(account.category);
      assert(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].includes(account.type));
    });
  });

  describe('Framework Coverage', function() {
    it('SKR03 should have German accounts', function() {
      const framework = chartOfAccountsTemplates.getAccountFramework('SKR03');
      assert.strictEqual(framework.country, 'DE');
      assert(framework.accounts.length > 50);
      
      // Check for typical German accounts
      const accountNumbers = framework.accounts.map(a => a.number);
      assert(accountNumbers.includes('1000')); // Kasse
      assert(accountNumbers.includes('1200')); // Bank
      assert(accountNumbers.includes('8100')); // Erlöse 19% USt
    });

    it('GAAP should have US accounts', function() {
      const framework = chartOfAccountsTemplates.getAccountFramework('GAAP');
      assert.strictEqual(framework.country, 'US');
      assert(framework.accounts.length > 30);
      
      // Check for typical US accounts
      const accountNumbers = framework.accounts.map(a => a.number);
      assert(accountNumbers.includes('1000')); // Cash
      assert(accountNumbers.includes('4000')); // Sales Revenue
    });

    it('PCG should have French accounts', function() {
      const framework = chartOfAccountsTemplates.getAccountFramework('PCG');
      assert.strictEqual(framework.country, 'FR');
      assert(framework.accounts.length > 20);
      
      // Check for typical French accounts
      const accountNumbers = framework.accounts.map(a => a.number);
      assert(accountNumbers.includes('101')); // Capital
      assert(accountNumbers.includes('512')); // Banques
    });
  });

  describe('Data Validation', function() {
    it('all frameworks should have valid data', function() {
      const frameworks = chartOfAccountsTemplates.getAccountFrameworks();
      
      frameworks.forEach(frameworkInfo => {
        const framework = chartOfAccountsTemplates.getAccountFramework(frameworkInfo.id);
        assert(framework);
        assert(framework.accounts.length > 0);
        
        framework.accounts.forEach(account => {
          assert(account.number, `Account in ${frameworkInfo.id} missing number`);
          assert(account.name, `Account ${account.number} in ${frameworkInfo.id} missing name`);
          assert(account.type, `Account ${account.number} in ${frameworkInfo.id} missing type`);
          assert(account.category, `Account ${account.number} in ${frameworkInfo.id} missing category`);
        });
      });
    });
  });
});

