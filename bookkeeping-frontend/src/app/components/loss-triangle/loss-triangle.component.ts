import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LossTriangleService } from '../../services/loss-triangle.service';
import { OrganizationService } from '../../services/organization.service';
import { LossTriangle, ReserveEstimate } from '../../models/loss-triangle.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

Chart.register(...registerables);

@Component({
  selector: 'app-loss-triangle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loss-triangle.component.html',
  styleUrls: ['./loss-triangle.component.css']
})
export class LossTriangleComponent implements OnInit {
  @ViewChild('cumulativeChart', { static: false }) cumulativeChartRef!: ElementRef;
  @ViewChild('developmentChart', { static: false }) developmentChartRef!: ElementRef;
  @ViewChild('triangleContent', { static: false }) triangleContentRef!: ElementRef;

  triangleType: 'PAID' | 'INCURRED' = 'PAID';
  selectedPolicyType: string = '';
  lossTriangle: LossTriangle | null = null;
  reserveEstimates: ReserveEstimate[] = [];
  loading = false;
  error: string | null = null;

  policyTypes = ['Auto', 'Home', 'Life', 'Health', 'Business', 'Liability'];
  
  cumulativeChart: Chart | null = null;
  developmentChart: Chart | null = null;

  viewMode: 'cumulative' | 'incremental' = 'cumulative';

  constructor(
    private lossTriangleService: LossTriangleService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadTriangle();
  }

  loadTriangle(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      this.error = 'Please select an organization';
      return;
    }

    this.loading = true;
    this.error = null;

    const options = {
      triangleType: this.triangleType,
      policyType: this.selectedPolicyType || undefined,
      developmentPeriods: 12
    };

    this.lossTriangleService.getLossTriangle(org.id, options).subscribe({
      next: (triangle) => {
        this.lossTriangle = triangle;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 100);
        this.loadReserves();
      },
      error: (err) => {
        this.error = 'Failed to load loss triangle';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadReserves(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    this.lossTriangleService.getReserveEstimates(org.id, this.selectedPolicyType || undefined).subscribe({
      next: (estimates) => {
        this.reserveEstimates = estimates;
      },
      error: (err) => console.error('Failed to load reserves:', err)
    });
  }

  onFilterChange(): void {
    this.loadTriangle();
  }

  renderCharts(): void {
    if (!this.lossTriangle) return;

    this.renderCumulativeChart();
    this.renderDevelopmentFactorChart();
  }

  renderCumulativeChart(): void {
    if (this.cumulativeChart) {
      this.cumulativeChart.destroy();
    }

    const canvas = this.cumulativeChartRef?.nativeElement;
    if (!canvas || !this.lossTriangle) return;

    const ctx = canvas.getContext('2d');
    const data = this.lossTriangle.data;

    const datasets = data.map((yearData, idx) => ({
      label: `${yearData.accidentYear}`,
      data: yearData.cumulativePaid,
      borderColor: this.getColorForIndex(idx),
      backgroundColor: this.getColorForIndex(idx, 0.1),
      borderWidth: 2,
      tension: 0.1
    }));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: Array.from({ length: 12 }, (_, i) => `${i * 12}-${(i + 1) * 12 - 1} months`),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Cumulative Paid Claims by Accident Year',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cumulative Paid Amount ($)'
            },
            ticks: {
              callback: (value) => '$' + this.formatNumber(value as number)
            }
          },
          x: {
            title: {
              display: true,
              text: 'Development Period'
            }
          }
        }
      }
    };

    this.cumulativeChart = new Chart(ctx, config);
  }

  renderDevelopmentFactorChart(): void {
    if (this.developmentChart) {
      this.developmentChart.destroy();
    }

    const canvas = this.developmentChartRef?.nativeElement;
    if (!canvas || !this.lossTriangle) return;

    const ctx = canvas.getContext('2d');
    
    // Calculate average factors across all years
    const avgFactors: number[] = [];
    const factorMatrix = this.lossTriangle.developmentFactors;
    
    if (factorMatrix && factorMatrix.length > 0) {
      const numPeriods = factorMatrix[0].length;
      
      for (let period = 0; period < numPeriods; period++) {
        let sum = 0;
        let count = 0;
        
        factorMatrix.forEach(yearFactors => {
          if (yearFactors[period] !== null && yearFactors[period] !== undefined) {
            sum += yearFactors[period];
            count++;
          }
        });
        
        avgFactors.push(count > 0 ? sum / count : 1.0);
      }
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Array.from({ length: avgFactors.length }, (_, i) => `${i} to ${i + 1}`),
        datasets: [{
          label: 'Development Factor',
          data: avgFactors,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Average Development Factors (Chain Ladder)',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Factor'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Development Period'
            }
          }
        }
      }
    };

    this.developmentChart = new Chart(ctx, config);
  }

  getColorForIndex(index: number, alpha: number = 1): string {
    const colors = [
      `rgba(59, 130, 246, ${alpha})`,   // blue
      `rgba(239, 68, 68, ${alpha})`,    // red
      `rgba(16, 185, 129, ${alpha})`,   // green
      `rgba(168, 85, 247, ${alpha})`,   // purple
      `rgba(245, 158, 11, ${alpha})`,   // orange
      `rgba(236, 72, 153, ${alpha})`,   // pink
      `rgba(20, 184, 166, ${alpha})`,   // teal
      `rgba(251, 146, 60, ${alpha})`    // amber
    ];
    return colors[index % colors.length];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercent(value: number): string {
    return value.toFixed(1) + '%';
  }

  getCellValue(yearData: any, periodIndex: number): number {
    if (this.viewMode === 'cumulative') {
      return yearData.cumulativePaid[periodIndex] || 0;
    } else {
      const current = yearData.cumulativePaid[periodIndex] || 0;
      const previous = periodIndex > 0 ? (yearData.cumulativePaid[periodIndex - 1] || 0) : 0;
      return current - previous;
    }
  }

  getDevelopmentFactor(yearIndex: number, periodIndex: number): number | null {
    if (!this.lossTriangle || !this.lossTriangle.developmentFactors) return null;
    if (!this.lossTriangle.developmentFactors[yearIndex]) return null;
    return this.lossTriangle.developmentFactors[yearIndex][periodIndex];
  }

  getAverageFactor(periodIndex: number): number {
    if (!this.lossTriangle || !this.lossTriangle.developmentFactors) return 1.0;
    
    let sum = 0;
    let count = 0;
    
    this.lossTriangle.developmentFactors.forEach(yearFactors => {
      const factor = yearFactors[periodIndex];
      if (factor !== null && factor !== undefined) {
        sum += factor;
        count++;
      }
    });
    
    return count > 0 ? sum / count : 1.0;
  }

  getTotalReserves(): number {
    return this.reserveEstimates.reduce((sum, est) => sum + est.ibnrReserve, 0);
  }

  getTotalUltimateLoss(): number {
    return this.reserveEstimates.reduce((sum, est) => sum + est.ultimateLoss, 0);
  }

  getTotalPaidToDate(): number {
    return this.reserveEstimates.reduce((sum, est) => sum + est.paidToDate, 0);
  }

  getTotalForPeriod(periodIndex: number): number {
    if (!this.lossTriangle) return 0;
    return this.lossTriangle.data.reduce((sum, yearData) => {
      return sum + this.getCellValue(yearData, periodIndex);
    }, 0);
  }

  getFirstYearPeriods(): number[] {
    if (!this.lossTriangle || !this.lossTriangle.data || this.lossTriangle.data.length === 0) {
      return [];
    }
    const periods = this.lossTriangle.data[0].developmentPeriods;
    return periods.slice(0, -1);
  }

  getYearPeriods(yearData: any): number[] {
    if (!yearData || !yearData.developmentPeriods) {
      return [];
    }
    return yearData.developmentPeriods.slice(0, -1);
  }

  async exportToPDF(): Promise<void> {
    const content = this.triangleContentRef?.nativeElement;
    if (!content) return;

    this.loading = true;

    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `loss-triangle-${this.triangleType}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      this.loading = false;
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF');
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.cumulativeChart) {
      this.cumulativeChart.destroy();
    }
    if (this.developmentChart) {
      this.developmentChart.destroy();
    }
  }
}

