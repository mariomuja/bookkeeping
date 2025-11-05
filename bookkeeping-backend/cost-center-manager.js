// Cost Center Management Module
// Handles cost centers, cost objects, and allocation

const { v4: uuidv4 } = require('uuid');

// In-memory storage
const costCenters = [];
const costObjects = [];
const costAllocations = [];

/**
 * Cost Center Class
 */
class CostCenter {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.organizationId = data.organizationId;
    this.costCenterNumber = data.costCenterNumber;
    this.name = data.name;
    this.description = data.description || '';
    this.parentId = data.parentId || null; // For hierarchical cost centers
    this.type = data.type || 'COST_CENTER'; // COST_CENTER, PROFIT_CENTER, SERVICE_CENTER
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.responsiblePerson = data.responsiblePerson || null;
    this.displayOrder = data.displayOrder || 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

/**
 * Cost Object (Kostenträger) Class
 */
class CostObject {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.organizationId = data.organizationId;
    this.costObjectNumber = data.costObjectNumber;
    this.name = data.name;
    this.description = data.description || '';
    this.type = data.type || 'PROJECT'; // PROJECT, PRODUCT, SERVICE, DEPARTMENT
    this.startDate = data.startDate ? new Date(data.startDate) : new Date();
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    this.budgetAmount = data.budgetAmount || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// CRUD Operations for Cost Centers

function createCostCenter(organizationId, data, username = 'System') {
  // Check for duplicate cost center number
  const existing = costCenters.find(cc => 
    cc.organizationId === organizationId && 
    cc.costCenterNumber === data.costCenterNumber
  );
  
  if (existing) {
    throw new Error('Cost center number already exists');
  }
  
  const costCenter = new CostCenter({
    ...data,
    organizationId
  });
  
  costCenters.push(costCenter);
  return costCenter;
}

function getCostCenters(organizationId, filters = {}) {
  let result = costCenters.filter(cc => cc.organizationId === organizationId);
  
  if (filters.isActive !== undefined) {
    result = result.filter(cc => cc.isActive === (filters.isActive === 'true'));
  }
  
  if (filters.type) {
    result = result.filter(cc => cc.type === filters.type);
  }
  
  if (filters.parentId !== undefined) {
    if (filters.parentId === 'null') {
      result = result.filter(cc => cc.parentId === null);
    } else {
      result = result.filter(cc => cc.parentId === filters.parentId);
    }
  }
  
  return result.sort((a, b) => a.displayOrder - b.displayOrder);
}

function getCostCenter(id) {
  const costCenter = costCenters.find(cc => cc.id === id);
  if (!costCenter) {
    throw new Error('Cost center not found');
  }
  return costCenter;
}

function updateCostCenter(id, updates, username = 'System') {
  const costCenter = getCostCenter(id);
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined && key !== 'id' && key !== 'organizationId') {
      costCenter[key] = updates[key];
    }
  });
  
  costCenter.updatedAt = new Date();
  return costCenter;
}

function deleteCostCenter(id) {
  // Check if cost center has children
  const hasChildren = costCenters.some(cc => cc.parentId === id);
  if (hasChildren) {
    throw new Error('Cannot delete cost center with child cost centers');
  }
  
  const index = costCenters.findIndex(cc => cc.id === id);
  if (index === -1) {
    throw new Error('Cost center not found');
  }
  
  costCenters.splice(index, 1);
}

// CRUD Operations for Cost Objects

function createCostObject(organizationId, data, username = 'System') {
  const costObject = new CostObject({
    ...data,
    organizationId
  });
  
  costObjects.push(costObject);
  return costObject;
}

function getCostObjects(organizationId, filters = {}) {
  let result = costObjects.filter(co => co.organizationId === organizationId);
  
  if (filters.isActive !== undefined) {
    result = result.filter(co => co.isActive === (filters.isActive === 'true'));
  }
  
  if (filters.type) {
    result = result.filter(co => co.type === filters.type);
  }
  
  return result.sort((a, b) => a.costObjectNumber.localeCompare(b.costObjectNumber));
}

function getCostObject(id) {
  const costObject = costObjects.find(co => co.id === id);
  if (!costObject) {
    throw new Error('Cost object not found');
  }
  return costObject;
}

function updateCostObject(id, updates, username = 'System') {
  const costObject = getCostObject(id);
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined && key !== 'id' && key !== 'organizationId') {
      costObject[key] = updates[key];
    }
  });
  
  costObject.updatedAt = new Date();
  return costObject;
}

function deleteCostObject(id) {
  const index = costObjects.findIndex(co => co.id === id);
  if (index === -1) {
    throw new Error('Cost object not found');
  }
  
  costObjects.splice(index, 1);
}

/**
 * Get cost center hierarchy
 */
function getCostCenterHierarchy(organizationId) {
  const orgCostCenters = getCostCenters(organizationId);
  
  // Build tree structure
  function buildTree(parentId = null) {
    return orgCostCenters
      .filter(cc => cc.parentId === parentId)
      .map(cc => ({
        ...cc,
        children: buildTree(cc.id)
      }));
  }
  
  return buildTree();
}

/**
 * Calculate cost center report
 */
function getCostCenterReport(organizationId, journalEntryLines, accounts, costCenterId = null, periodStart = null, periodEnd = null) {
  const orgCostCenters = costCenterId 
    ? [getCostCenter(costCenterId)]
    : getCostCenters(organizationId, { isActive: 'true' });
  
  const report = orgCostCenters.map(cc => {
    // Find all lines associated with this cost center
    const ccLines = journalEntryLines.filter(line => line.costCenter === cc.id);
    
    let totalDebits = 0;
    let totalCredits = 0;
    const accountBreakdown = {};
    
    ccLines.forEach(line => {
      const account = accounts.find(a => a.id === line.accountId);
      if (!account) return;
      
      totalDebits += line.debitAmount || 0;
      totalCredits += line.creditAmount || 0;
      
      if (!accountBreakdown[account.accountNumber]) {
        accountBreakdown[account.accountNumber] = {
          accountName: account.accountName,
          debits: 0,
          credits: 0,
          balance: 0
        };
      }
      
      accountBreakdown[account.accountNumber].debits += line.debitAmount || 0;
      accountBreakdown[account.accountNumber].credits += line.creditAmount || 0;
      accountBreakdown[account.accountNumber].balance += (line.debitAmount || 0) - (line.creditAmount || 0);
    });
    
    return {
      costCenter: cc,
      totalDebits,
      totalCredits,
      netCost: totalDebits - totalCredits,
      accountBreakdown,
      transactionCount: ccLines.length
    };
  });
  
  return report;
}

/**
 * Calculate contribution margin (Deckungsbeitrag)
 */
function calculateContributionMargin(organizationId, journalEntryLines, accounts, accountTypes) {
  const costCenterReport = getCostCenterReport(organizationId, journalEntryLines, accounts);
  
  return costCenterReport.map(ccData => {
    const cc = ccData.costCenter;
    
    // Separate fixed and variable costs
    let variableCosts = 0;
    let fixedCosts = 0;
    let revenue = 0;
    
    Object.entries(ccData.accountBreakdown).forEach(([accountNumber, data]) => {
      const account = accounts.find(a => a.accountNumber === accountNumber);
      if (!account) return;
      
      const accountType = accountTypes.find(at => at.id === account.accountTypeId);
      if (!accountType) return;
      
      if (accountType.category === 'REVENUE') {
        revenue += data.credits - data.debits;
      } else if (accountType.category === 'EXPENSE') {
        // Simplified: assume first digit determines if variable
        const isVariable = accountNumber.startsWith('5'); // Variable costs
        if (isVariable) {
          variableCosts += data.debits - data.credits;
        } else {
          fixedCosts += data.debits - data.credits;
        }
      }
    });
    
    const contributionMargin1 = revenue - variableCosts;
    const contributionMargin2 = contributionMargin1 - fixedCosts;
    
    return {
      costCenter: cc,
      revenue,
      variableCosts,
      contributionMargin1,
      contributionMarginRatio1: revenue > 0 ? (contributionMargin1 / revenue) * 100 : 0,
      fixedCosts,
      contributionMargin2,
      contributionMarginRatio2: revenue > 0 ? (contributionMargin2 / revenue) * 100 : 0
    };
  });
}

module.exports = {
  CostCenter,
  CostObject,
  createCostCenter,
  getCostCenters,
  getCostCenter,
  updateCostCenter,
  deleteCostCenter,
  createCostObject,
  getCostObjects,
  getCostObject,
  updateCostObject,
  deleteCostObject,
  getCostCenterHierarchy,
  getCostCenterReport,
  calculateContributionMargin,
  // Export arrays for testing
  _costCenters: costCenters,
  _costObjects: costObjects
};

