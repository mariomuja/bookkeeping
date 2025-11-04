// Unit Tests for Loss Triangle Calculator
const assert = require('assert');
const calculator = require('../loss-triangle-calculator');

console.log('\n🧪 Running Loss Triangle Calculator Tests...\n');

// Test 1: Calculate Development Factors
(function testDevelopmentFactors() {
  try {
    console.log('Test 1: calculateDevelopmentFactors');
    const triangleData = [
      { accidentYear: 2022, cumulativePaid: [100, 150, 180, 200] },
      { accidentYear: 2023, cumulativePaid: [200, 300, 360, 400] }
    ];

    const factors = calculator.calculateDevelopmentFactors(triangleData, 4);

    assert(factors.length === 3, 'Should have 3 factors');
    
    // Period 0 to 1: (150 + 300) / (100 + 200) = 450 / 300 = 1.5
    assert(Math.abs(factors[0] - 1.5) < 0.01, `Factor 0 should be ~1.5, got ${factors[0]}`);
    
    console.log('   ✓ Development factors calculated correctly');
  } catch (error) {
    console.error('   ✗ FAILED:', error.message);
    process.exit(1);
  }
})();

// Test 2: Calculate Reserve Estimates
(function testReserveEstimates() {
  try {
    console.log('\nTest 2: calculateReserveEstimates');
    const lossTriangle = {
      data: [{ accidentYear: 2023, cumulativePaid: [100, 150, 180, 200, 210] }],
      ultimateLoss: [250]
    };

    const estimates = calculator.calculateReserveEstimates(lossTriangle);

    assert(estimates.length === 1, 'Should have 1 estimate');
    assert(estimates[0].paidToDate === 210, 'Paid to date should be 210');
    assert(estimates[0].ultimateLoss === 250, 'Ultimate loss should be 250');
    assert(estimates[0].ibnrReserve === 40, 'IBNR should be 40');
    assert(Math.abs(estimates[0].percentDeveloped - 84) < 1, 'Percent developed should be ~84%');

    console.log('   ✓ Reserve estimates calculated correctly');
  } catch (error) {
    console.error('   ✗ FAILED:', error.message);
    process.exit(1);
  }
})();

// Test 3: Incremental Triangle
(function testIncrementalTriangle() {
  try {
    console.log('\nTest 3: getIncrementalTriangle');
    const lossTriangle = {
      data: [{ accidentYear: 2023, cumulativePaid: [100, 250, 400, 500], claimCount: 10 }]
    };

    const incremental = calculator.getIncrementalTriangle(lossTriangle);

    assert(incremental[0].incrementalPaid[0] === 100, 'First period should be 100');
    assert(incremental[0].incrementalPaid[1] === 150, 'Second period should be 150');
    assert(incremental[0].incrementalPaid[2] === 150, 'Third period should be 150');
    assert(incremental[0].incrementalPaid[3] === 100, 'Fourth period should be 100');

    console.log('   ✓ Incremental triangle conversion correct');
  } catch (error) {
    console.error('   ✗ FAILED:', error.message);
    process.exit(1);
  }
})();

console.log('\n✅ All backend tests passed!\n');
process.exit(0);
