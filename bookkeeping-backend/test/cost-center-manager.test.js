// Cost Center Manager Tests

const costCenterManager = require('../cost-center-manager');

describe('CostCenterManager', () => {
  beforeEach(() => {
    // Clear cost centers array
    costCenterManager._costCenters.length = 0;
    costCenterManager._costObjects.length = 0;
  });

  describe('Cost Center CRUD Operations', () => {
    test('should create cost center', () => {
      const ccData = {
        costCenterNumber: '100',
        name: 'Administration',
        description: 'Admin department',
        type: 'COST_CENTER'
      };

      const costCenter = costCenterManager.createCostCenter('org1', ccData);

      expect(costCenter.id).toBeDefined();
      expect(costCenter.costCenterNumber).toBe('100');
      expect(costCenter.name).toBe('Administration');
      expect(costCenter.isActive).toBe(true);
    });

    test('should not allow duplicate cost center numbers', () => {
      costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'First'
      });

      expect(() => {
        costCenterManager.createCostCenter('org1', {
          costCenterNumber: '100',
          name: 'Duplicate'
        });
      }).toThrow('Cost center number already exists');
    });

    test('should get cost centers by organization', () => {
      costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'CC1'
      });

      costCenterManager.createCostCenter('org2', {
        costCenterNumber: '200',
        name: 'CC2'
      });

      const org1Centers = costCenterManager.getCostCenters('org1');
      expect(org1Centers.length).toBe(1);
      expect(org1Centers[0].name).toBe('CC1');
    });

    test('should filter cost centers by type', () => {
      costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'Cost Center',
        type: 'COST_CENTER'
      });

      costCenterManager.createCostCenter('org1', {
        costCenterNumber: '200',
        name: 'Profit Center',
        type: 'PROFIT_CENTER'
      });

      const profitCenters = costCenterManager.getCostCenters('org1', { type: 'PROFIT_CENTER' });
      expect(profitCenters.length).toBe(1);
      expect(profitCenters[0].name).toBe('Profit Center');
    });

    test('should update cost center', () => {
      const cc = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'Original Name'
      });

      const updated = costCenterManager.updateCostCenter(cc.id, {
        name: 'Updated Name',
        description: 'New description'
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('New description');
    });

    test('should delete cost center without children', () => {
      const cc = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'Test'
      });

      costCenterManager.deleteCostCenter(cc.id);

      expect(() => costCenterManager.getCostCenter(cc.id)).toThrow('Cost center not found');
    });

    test('should not delete cost center with children', () => {
      const parent = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'Parent'
      });

      costCenterManager.createCostCenter('org1', {
        costCenterNumber: '110',
        name: 'Child',
        parentId: parent.id
      });

      expect(() => costCenterManager.deleteCostCenter(parent.id))
        .toThrow('Cannot delete cost center with child cost centers');
    });
  });

  describe('Cost Center Hierarchy', () => {
    test('should build hierarchical structure', () => {
      const parent = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'Parent'
      });

      const child1 = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '110',
        name: 'Child 1',
        parentId: parent.id
      });

      const child2 = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '120',
        name: 'Child 2',
        parentId: parent.id
      });

      const hierarchy = costCenterManager.getCostCenterHierarchy('org1');

      expect(hierarchy.length).toBe(1);
      expect(hierarchy[0].name).toBe('Parent');
      expect(hierarchy[0].children.length).toBe(2);
      expect(hierarchy[0].children[0].name).toBe('Child 1');
    });

    test('should handle multi-level hierarchy', () => {
      const grandparent = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'Grandparent'
      });

      const parent = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '110',
        name: 'Parent',
        parentId: grandparent.id
      });

      const child = costCenterManager.createCostCenter('org1', {
        costCenterNumber: '111',
        name: 'Child',
        parentId: parent.id
      });

      const hierarchy = costCenterManager.getCostCenterHierarchy('org1');

      expect(hierarchy[0].children[0].children.length).toBe(1);
      expect(hierarchy[0].children[0].children[0].name).toBe('Child');
    });
  });

  describe('Cost Objects', () => {
    test('should create cost object', () => {
      const coData = {
        costObjectNumber: 'PRJ001',
        name: 'Project Alpha',
        type: 'PROJECT',
        budgetAmount: 100000
      };

      const costObject = costCenterManager.createCostObject('org1', coData);

      expect(costObject.id).toBeDefined();
      expect(costObject.costObjectNumber).toBe('PRJ001');
      expect(costObject.budgetAmount).toBe(100000);
    });

    test('should get cost objects by type', () => {
      costCenterManager.createCostObject('org1', {
        costObjectNumber: 'PRJ001',
        name: 'Project',
        type: 'PROJECT'
      });

      costCenterManager.createCostObject('org1', {
        costObjectNumber: 'PROD001',
        name: 'Product',
        type: 'PRODUCT'
      });

      const projects = costCenterManager.getCostObjects('org1', { type: 'PROJECT' });
      expect(projects.length).toBe(1);
      expect(projects[0].type).toBe('PROJECT');
    });
  });

  describe('Cost Center Report', () => {
    test('should calculate cost center report with zero transactions', () => {
      costCenterManager.createCostCenter('org1', {
        costCenterNumber: '100',
        name: 'Test CC'
      });

      const report = costCenterManager.getCostCenterReport('org1', [], []);

      expect(report.length).toBeGreaterThan(0);
      expect(report[0].totalDebits).toBe(0);
      expect(report[0].totalCredits).toBe(0);
    });
  });
});

