// Sample Insurance Data Generator
const { v4: uuidv4 } = require('uuid');
const mockData = require('./mock-data');

const policyTypes = ['Auto', 'Home', 'Life', 'Health', 'Business', 'Liability'];
const claimStatuses = ['Open', 'Under Review', 'Approved', 'Paid', 'Closed'];

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary', 
                     'William', 'Patricia', 'Richard', 'Jennifer', 'Thomas', 'Linda', 'Charles', 'Barbara'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 
                   'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson'];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function randomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - random(0, daysBack));
  return date.toISOString().split('T')[0];
}

function randomItem(array) {
  return array[random(0, array.length - 1)];
}

function generateInsuranceData(organizationId, count = 10000) {
  console.log(`\n🏗️  Generating ${count.toLocaleString()} insurance bookings...`);
  console.log(`   Organization: ${organizationId}`);
  
  const now = new Date();
  const entries = [];
  const lines = [];
  const customFields = [];
  
  // Get field definitions
  const policyNumberField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'policy_number'
  );
  const masterPolicyField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'master_policy_number'
  );
  const claimNumberField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'claim_number'
  );
  const policyTypeField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'policy_type'
  );
  const claimStatusField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'claim_status'
  );
  const premiumAmountField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'premium_amount'
  );
  const claimAmountField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'claim_amount'
  );
  const policyStartField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'policy_start_date'
  );
  const insuredPartyField = mockData.customFieldDefinitions.find(f => 
    f.organizationId === organizationId && f.fieldName === 'insured_party'
  );
  
  // Get accounts
  const cashAccount = mockData.accounts.find(a => 
    a.organizationId === organizationId && a.accountNumber === '1000'
  );
  const premiumAccount = mockData.accounts.find(a => 
    a.organizationId === organizationId && a.accountNumber === '4000'
  );
  const claimsExpenseAccount = mockData.accounts.find(a => 
    a.organizationId === organizationId && a.accountNumber === '6000'
  );
  const claimsPayableAccount = mockData.accounts.find(a => 
    a.organizationId === organizationId && a.accountNumber === '2100'
  );
  
  if (!cashAccount || !premiumAccount || !claimsExpenseAccount || !claimsPayableAccount) {
    console.error('❌ Required accounts not found!');
    return { entries: [], lines: [], customFields: [] };
  }
  
  const startNum = mockData.journalEntries.length + 1;
  let progressCounter = 0;
  const progressInterval = Math.max(1, Math.floor(count / 20)); // Update progress 20 times
  
  for (let i = 0; i < count; i++) {
    const isClaim = Math.random() < 0.3; // 30% are claims
    const entryId = uuidv4();
    const entryNum = startNum + i;
    const entryDate = randomDate(730); // Within last 2 years
    const policyNum = `POL-${String(entryNum).padStart(8, '0')}`;
    const policyType = randomItem(policyTypes);
    const insuredName = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
    
    // Create journal entry
    const entry = {
      id: entryId,
      organizationId,
      entryNumber: `JE-${String(entryNum).padStart(10, '0')}`,
      entryDate,
      entryTimestamp: new Date(entryDate),
      description: isClaim ? `Insurance Claim Payment - ${policyType}` : `Premium Collection - ${policyType}`,
      referenceNumber: isClaim ? `REF-CLM-${entryNum}` : `REF-PREM-${entryNum}`,
      documentType: isClaim ? 'CLAIM' : 'PREMIUM',
      source: 'SAMPLE_DATA',
      currency: 'USD',
      baseCurrency: 'USD',
      exchangeRate: 1.0,
      status: 'POSTED',
      postedAt: new Date(entryDate),
      postedBy: 'System',
      createdBy: 'System',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    entries.push(entry);
    
    // Create lines
    if (isClaim) {
      // Claim payment: Debit Claims Expense, Credit Claims Payable
      const claimAmount = randomFloat(1000, 50000);
      
      lines.push({
        id: uuidv4(),
        journalEntryId: entryId,
        lineNumber: 1,
        accountId: claimsExpenseAccount.id,
        debitAmount: claimAmount,
        creditAmount: 0,
        debitBaseAmount: claimAmount,
        creditBaseAmount: 0,
        taxAmount: 0,
        description: `Claim payment for ${policyNum}`
      });
      
      lines.push({
        id: uuidv4(),
        journalEntryId: entryId,
        lineNumber: 2,
        accountId: claimsPayableAccount.id,
        debitAmount: 0,
        creditAmount: claimAmount,
        debitBaseAmount: 0,
        creditBaseAmount: claimAmount,
        taxAmount: 0,
        description: `Claims payable for ${policyNum}`
      });
      
      // Add claim custom fields
      if (claimNumberField) {
        const claimNum = `CLM-${String(entryNum).padStart(8, '0')}`;
        customFields.push({
          id: uuidv4(),
          journalEntryId: entryId,
          fieldDefinitionId: claimNumberField.id,
          fieldValue: claimNum,
          createdAt: now,
          updatedAt: now
        });
      }
      
      if (claimStatusField) {
        customFields.push({
          id: uuidv4(),
          journalEntryId: entryId,
          fieldDefinitionId: claimStatusField.id,
          fieldValue: randomItem(claimStatuses),
          createdAt: now,
          updatedAt: now
        });
      }
      
      if (claimAmountField) {
        customFields.push({
          id: uuidv4(),
          journalEntryId: entryId,
          fieldDefinitionId: claimAmountField.id,
          fieldValue: claimAmount.toString(),
          createdAt: now,
          updatedAt: now
        });
      }
      
    } else {
      // Premium collection: Debit Cash, Credit Premium Revenue
      const premiumAmount = randomFloat(100, 5000);
      
      lines.push({
        id: uuidv4(),
        journalEntryId: entryId,
        lineNumber: 1,
        accountId: cashAccount.id,
        debitAmount: premiumAmount,
        creditAmount: 0,
        debitBaseAmount: premiumAmount,
        creditBaseAmount: 0,
        taxAmount: 0,
        description: `Premium collected for ${policyNum}`
      });
      
      lines.push({
        id: uuidv4(),
        journalEntryId: entryId,
        lineNumber: 2,
        accountId: premiumAccount.id,
        debitAmount: 0,
        creditAmount: premiumAmount,
        debitBaseAmount: 0,
        creditBaseAmount: premiumAmount,
        taxAmount: 0,
        description: `Premium revenue for ${policyNum}`
      });
      
      if (premiumAmountField) {
        customFields.push({
          id: uuidv4(),
          journalEntryId: entryId,
          fieldDefinitionId: premiumAmountField.id,
          fieldValue: premiumAmount.toString(),
          createdAt: now,
          updatedAt: now
        });
      }
    }
    
    // Add common custom fields
    if (policyNumberField) {
      customFields.push({
        id: uuidv4(),
        journalEntryId: entryId,
        fieldDefinitionId: policyNumberField.id,
        fieldValue: policyNum,
        createdAt: now,
        updatedAt: now
      });
    }
    
    if (policyTypeField) {
      customFields.push({
        id: uuidv4(),
        journalEntryId: entryId,
        fieldDefinitionId: policyTypeField.id,
        fieldValue: policyType,
        createdAt: now,
        updatedAt: now
      });
    }
    
    if (insuredPartyField) {
      customFields.push({
        id: uuidv4(),
        journalEntryId: entryId,
        fieldDefinitionId: insuredPartyField.id,
        fieldValue: insuredName,
        createdAt: now,
        updatedAt: now
      });
    }
    
    if (policyStartField) {
      customFields.push({
        id: uuidv4(),
        journalEntryId: entryId,
        fieldDefinitionId: policyStartField.id,
        fieldValue: randomDate(365),
        createdAt: now,
        updatedAt: now
      });
    }
    
    // Master policy grouping (every 100 policies)
    if (masterPolicyField && entryNum % 100 === 0) {
      const masterNum = `MP-${String(Math.floor(entryNum / 100)).padStart(6, '0')}`;
      customFields.push({
        id: uuidv4(),
        journalEntryId: entryId,
        fieldDefinitionId: masterPolicyField.id,
        fieldValue: masterNum,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // Progress indicator
    progressCounter++;
    if (progressCounter % progressInterval === 0) {
      const percent = Math.round((i / count) * 100);
      process.stdout.write(`\r   Progress: ${percent}% (${i.toLocaleString()}/${count.toLocaleString()} records)`);
    }
  }
  
  console.log(`\r   Progress: 100% (${count.toLocaleString()}/${count.toLocaleString()} records)`);
  console.log(`\n✅ Generated successfully:`);
  console.log(`   📄 ${entries.length.toLocaleString()} journal entries`);
  console.log(`   📊 ${lines.length.toLocaleString()} transaction lines`);
  console.log(`   🏷️  ${customFields.length.toLocaleString()} custom field values\n`);
  
  return { entries, lines, customFields };
}

module.exports = { generateInsuranceData };

