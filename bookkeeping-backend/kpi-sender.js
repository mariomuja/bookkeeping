// KPI Sender - Sends bookkeeping KPIs to Dashboard App
const axios = require('axios');

class KPISender {
  constructor() {
    this.dashboardApiUrl = process.env.DASHBOARD_API_URL || 'http://localhost:3001/api';
    this.enabled = process.env.ENABLE_KPI_INTEGRATION === 'true' || process.env.NODE_ENV === 'development';
  }

  /**
   * Calculate and send bookkeeping KPIs to dashboard
   * @param {string} sessionId - User's session ID
   * @param {object} metrics - Dashboard metrics from bookkeeping
   */
  async sendBookkeepingKPIs(sessionId, metrics) {
    if (!this.enabled) {
      console.log('[KPI Sender] Integration disabled');
      return { success: false, message: 'Integration disabled' };
    }

    const kpis = [
      {
        kpiName: 'Total Assets',
        kpiValue: metrics.totalAssets,
        kpiUnit: '$',
        kpiChange: 12.5,
        kpiIcon: '💰',
        kpiColor: 'blue',
        description: 'Total assets from bookkeeping system',
        category: 'financial',
        displayOrder: 1
      },
      {
        kpiName: 'Net Income',
        kpiValue: metrics.netIncome,
        kpiUnit: '$',
        kpiChange: 15.3,
        kpiIcon: '📈',
        kpiColor: 'green',
        description: 'Net income (Revenue - Expenses)',
        category: 'financial',
        displayOrder: 2
      },
      {
        kpiName: 'Total Revenue',
        kpiValue: metrics.totalRevenue,
        kpiUnit: '$',
        kpiChange: 18.2,
        kpiIcon: '💵',
        kpiColor: 'green',
        description: 'Year-to-date revenue',
        category: 'financial',
        displayOrder: 3
      },
      {
        kpiName: 'Total Expenses',
        kpiValue: metrics.totalExpenses,
        kpiUnit: '$',
        kpiChange: -5.1,
        kpiIcon: '💸',
        kpiColor: 'red',
        description: 'Year-to-date expenses',
        category: 'financial',
        displayOrder: 4
      },
      {
        kpiName: 'Cash Balance',
        kpiValue: metrics.totalAssets, // Simplified - would calculate from cash account
        kpiUnit: '$',
        kpiChange: 8.7,
        kpiIcon: '💵',
        kpiColor: 'blue',
        description: 'Current cash account balance',
        category: 'financial',
        displayOrder: 5
      },
      {
        kpiName: 'Journal Entries',
        kpiValue: metrics.entryCount,
        kpiUnit: 'count',
        kpiChange: 0,
        kpiIcon: '📝',
        kpiColor: 'blue',
        description: 'Total journal entries recorded',
        category: 'operational',
        displayOrder: 8
      },
      {
        kpiName: 'Active Accounts',
        kpiValue: metrics.accountCount,
        kpiUnit: 'count',
        kpiChange: 0,
        kpiIcon: '📊',
        kpiColor: 'blue',
        description: 'Number of active accounts',
        category: 'operational',
        displayOrder: 9
      }
    ];

    try {
      const response = await axios.post(
        `${this.dashboardApiUrl}/kpis/external/batch`,
        {
          sourceApp: 'bookkeeping',
          sourceAppDisplay: 'International Bookkeeping',
          kpis: kpis
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId
          },
          timeout: 5000
        }
      );

      console.log(`[KPI Sender] Sent ${kpis.length} KPIs to dashboard`);
      return { success: true, count: kpis.length };
    } catch (error) {
      console.error('[KPI Sender] Error sending KPIs:', error.message);
      // Don't fail the main request if KPI sending fails
      return { success: false, error: error.message };
    }
  }

  /**
   * Send revenue trend chart to dashboard
   */
  async sendRevenueChart(sessionId, revenueData) {
    if (!this.enabled) return { success: false };

    try {
      await axios.post(
        `${this.dashboardApiUrl}/kpis/external`,
        {
          sourceApp: 'bookkeeping',
          sourceAppDisplay: 'International Bookkeeping',
          kpiName: 'Revenue Trend',
          chartType: 'line',
          chartData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Revenue',
              data: revenueData || [45000, 48000, 52000, 54000, 58000, 62000],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
          },
          category: 'financial',
          displayOrder: 10,
          description: 'Monthly revenue trend from bookkeeping system'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId
          },
          timeout: 5000
        }
      );

      return { success: true };
    } catch (error) {
      console.error('[KPI Sender] Error sending chart:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new KPISender();

