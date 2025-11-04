// Insurance Loss Triangle Calculator
// Implements Chain Ladder method for reserve estimation

/**
 * Calculate loss development triangle from journal entries
 * @param {Array} entries - Journal entries with custom fields
 * @param {Object} options - Calculation options
 * @returns {Object} Loss triangle with development factors
 */
function calculateLossTriangle(entries, customFieldDefs, options = {}) {
  const {
    triangleType = 'PAID',
    policyType = null,
    developmentPeriods = 12, // months
    asOfDate = new Date()
  } = options;

  console.log(`\n📊 Calculating Loss Triangle:`);
  console.log(`   Type: ${triangleType}`);
  console.log(`   Policy Type: ${policyType || 'All'}`);
  console.log(`   Development Periods: ${developmentPeriods}`);

  // Get field definitions
  const policyTypeField = customFieldDefs.find(f => f.fieldName === 'policy_type');
  const claimNumberField = customFieldDefs.find(f => f.fieldName === 'claim_number');
  const policyStartDateField = customFieldDefs.find(f => f.fieldName === 'policy_start_date');

  // Filter to claim entries only
  let claimEntries = entries.filter(e => 
    e.description && e.description.includes('Claim')
  );

  // Filter by policy type if specified
  if (policyType && policyTypeField) {
    claimEntries = claimEntries.filter(e => {
      const typeField = e.customFields?.find(cf => cf.fieldDefinitionId === policyTypeField.id);
      return typeField && typeField.fieldValue === policyType;
    });
  }

  console.log(`   Claim Entries: ${claimEntries.length}`);

  // Build triangle data structure
  const triangleMap = {}; // Key: accidentYear, Value: { developmentMonth: amount }

  claimEntries.forEach(entry => {
    // Get accident year from policy start date or entry date
    const policyStartField = entry.customFields?.find(cf => 
      cf.fieldDefinitionId === policyStartDateField?.id
    );
    
    const accidentDate = policyStartField ? new Date(policyStartField.fieldValue) : new Date(entry.entryDate);
    const accidentYear = accidentDate.getFullYear();
    
    // Calculate development period (months since accident)
    const claimDate = new Date(entry.entryDate);
    const monthsSinceAccident = 
      (claimDate.getFullYear() - accidentYear) * 12 + 
      (claimDate.getMonth() - accidentDate.getMonth());
    
    // Group into development periods (e.g., 0-11 months = period 0, 12-23 = period 1)
    const developmentPeriod = Math.floor(monthsSinceAccident / 12);
    
    if (developmentPeriod < 0 || developmentPeriod >= developmentPeriods) {
      return; // Skip if outside development range
    }

    // Initialize year if not exists
    if (!triangleMap[accidentYear]) {
      triangleMap[accidentYear] = {};
      for (let i = 0; i < developmentPeriods; i++) {
        triangleMap[accidentYear][i] = { paid: 0, count: 0 };
      }
    }

    // Get paid amount from entry lines (credit to claims payable = paid amount)
    const paidAmount = entry.lines?.reduce((sum, line) => 
      sum + (line.creditAmount || 0), 0
    ) || 0;

    // Accumulate
    triangleMap[accidentYear][developmentPeriod].paid += paidAmount;
    triangleMap[accidentYear][developmentPeriod].count += 1;
  });

  // Convert to cumulative triangle
  const accidentYears = Object.keys(triangleMap).map(Number).sort((a, b) => a - b);
  const triangleData = [];

  accidentYears.forEach(year => {
    const periods = triangleMap[year];
    const cumulativePaid = [];
    const cumulativeIncurred = [];
    let cumSum = 0;

    for (let i = 0; i < developmentPeriods; i++) {
      cumSum += periods[i]?.paid || 0;
      cumulativePaid.push(cumSum);
      cumulativeIncurred.push(cumSum); // For simplification, using same as paid
    }

    triangleData.push({
      accidentYear: year,
      developmentPeriods: Array.from({ length: developmentPeriods }, (_, i) => i),
      cumulativePaid,
      cumulativeIncurred,
      claimCount: Object.values(periods).reduce((sum, p) => sum + p.count, 0)
    });
  });

  // Calculate development factors (age-to-age factors)
  const developmentFactors = calculateDevelopmentFactors(triangleData, developmentPeriods);

  // Calculate ultimate loss and reserves
  const ultimateLoss = [];
  const reserves = [];

  triangleData.forEach((yearData, idx) => {
    const latestPeriod = getLatestNonZeroPeriod(yearData.cumulativePaid);
    const latestPaid = yearData.cumulativePaid[latestPeriod] || 0;

    // Apply chain ladder to estimate ultimate
    let ultimate = latestPaid;
    for (let period = latestPeriod; period < developmentPeriods - 1; period++) {
      const factor = developmentFactors[period] || 1.0;
      ultimate *= factor;
    }

    ultimateLoss.push(ultimate);
    reserves.push(Math.max(0, ultimate - latestPaid));
  });

  console.log(`   ✅ Triangle calculated for ${accidentYears.length} years`);

  return {
    triangleType,
    data: triangleData,
    developmentFactors: calculateDevelopmentFactorMatrix(triangleData),
    ultimateLoss,
    reserves,
    metadata: {
      asOfDate,
      currency: 'USD',
      policyType: policyType || 'All Types',
      totalYears: triangleData.length,
      totalPeriods: developmentPeriods
    }
  };
}

/**
 * Calculate development factors (age-to-age factors)
 */
function calculateDevelopmentFactors(triangleData, totalPeriods) {
  const factors = [];

  for (let period = 0; period < totalPeriods - 1; period++) {
    let sumCurrent = 0;
    let sumNext = 0;
    let count = 0;

    triangleData.forEach(yearData => {
      const current = yearData.cumulativePaid[period];
      const next = yearData.cumulativePaid[period + 1];

      if (current > 0 && next > 0) {
        sumCurrent += current;
        sumNext += next;
        count++;
      }
    });

    // Weighted average factor
    const factor = count > 0 && sumCurrent > 0 ? sumNext / sumCurrent : 1.0;
    factors.push(factor);
  }

  return factors;
}

/**
 * Calculate full development factor matrix
 */
function calculateDevelopmentFactorMatrix(triangleData) {
  const matrix = [];

  triangleData.forEach((yearData, yearIdx) => {
    const yearFactors = [];
    
    for (let period = 0; period < yearData.cumulativePaid.length - 1; period++) {
      const current = yearData.cumulativePaid[period];
      const next = yearData.cumulativePaid[period + 1];
      
      const factor = current > 0 && next > 0 ? next / current : null;
      yearFactors.push(factor);
    }
    
    matrix.push(yearFactors);
  });

  return matrix;
}

/**
 * Find the latest non-zero period
 */
function getLatestNonZeroPeriod(cumulativeArray) {
  for (let i = cumulativeArray.length - 1; i >= 0; i--) {
    if (cumulativeArray[i] > 0) {
      return i;
    }
  }
  return 0;
}

/**
 * Calculate reserve estimates for each accident year
 */
function calculateReserveEstimates(lossTriangle) {
  const estimates = [];

  lossTriangle.data.forEach((yearData, idx) => {
    const latestPeriod = getLatestNonZeroPeriod(yearData.cumulativePaid);
    const paidToDate = yearData.cumulativePaid[latestPeriod] || 0;
    const ultimateLoss = lossTriangle.ultimateLoss[idx] || paidToDate;
    const ibnrReserve = Math.max(0, ultimateLoss - paidToDate);

    estimates.push({
      accidentYear: yearData.accidentYear,
      paidToDate,
      caseReserves: 0, // Would need additional data
      ibnrReserve,
      ultimateLoss,
      percentDeveloped: paidToDate > 0 ? (paidToDate / ultimateLoss) * 100 : 0
    });
  });

  return estimates;
}

/**
 * Format triangle for incremental view
 */
function getIncrementalTriangle(lossTriangle) {
  const incremental = [];

  lossTriangle.data.forEach(yearData => {
    const incrementalPaid = [];
    
    for (let i = 0; i < yearData.cumulativePaid.length; i++) {
      const current = yearData.cumulativePaid[i] || 0;
      const previous = i > 0 ? (yearData.cumulativePaid[i - 1] || 0) : 0;
      incrementalPaid.push(current - previous);
    }

    incremental.push({
      accidentYear: yearData.accidentYear,
      incrementalPaid,
      claimCount: yearData.claimCount
    });
  });

  return incremental;
}

module.exports = {
  calculateLossTriangle,
  calculateDevelopmentFactors,
  calculateReserveEstimates,
  getIncrementalTriangle
};

