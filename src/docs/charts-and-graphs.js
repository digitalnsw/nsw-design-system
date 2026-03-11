import {
  createPattern,
  defaultNswInkIndex,
  getNswChartPalette,
  getNswAboriginalChartPalette,
  withAlpha,
} from './chart-utilities'

/* global Chart */

const chartJsPrimary = Object.freeze({
  src: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js',
  integrity: 'sha384-zVyRZ9eQ45iRS7ZRZQSFKGJpypyxssU6clBCysSqzjmdGWNn8//uC8dh9DabpAbK',
  crossOrigin: 'anonymous',
  referrerPolicy: 'no-referrer',
})

const chartJsFallback = Object.freeze({
  src: 'https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js',
  integrity: 'sha384-zVyRZ9eQ45iRS7ZRZQSFKGJpypyxssU6clBCysSqzjmdGWNn8//uC8dh9DabpAbK',
  crossOrigin: 'anonymous',
  referrerPolicy: 'no-referrer',
})

function loadScriptOnce(scriptSource) {
  const source = typeof scriptSource === 'string' ? { src: scriptSource } : scriptSource
  const {
    src,
    integrity = '',
    crossOrigin = '',
    referrerPolicy = '',
  } = source || {}

  if (!src) {
    return Promise.reject(new Error('Missing script source'))
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (window.Chart) {
        resolve()
        return
      }

      if (existing.dataset && existing.dataset.loaded === 'true') {
        reject(new Error(`Loaded ${src} but window.Chart is unavailable`))
        return
      }
      if (existing.dataset && existing.dataset.error === 'true') {
        reject(new Error(`Failed to load ${src}`))
        return
      }
      if (existing.readyState === 'complete') {
        reject(new Error(`Failed to load ${src}`))
        return
      }

      let timeoutId = null
      const handleLoad = () => {
        if (timeoutId) clearTimeout(timeoutId)
        if (window.Chart) {
          resolve()
          return
        }
        reject(new Error(`Loaded ${src} but window.Chart is unavailable`))
      }
      const handleError = () => {
        if (timeoutId) clearTimeout(timeoutId)
        reject(new Error(`Failed to load ${src}`))
      }

      existing.addEventListener('load', handleLoad, { once: true })
      existing.addEventListener('error', handleError, { once: true })

      timeoutId = window.setTimeout(() => {
        existing.removeEventListener('load', handleLoad)
        existing.removeEventListener('error', handleError)
        if (window.Chart) {
          resolve()
          return
        }
        reject(new Error(`Timed out while loading ${src}`))
      }, 10000)
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    if (integrity) script.integrity = integrity
    if (crossOrigin) script.crossOrigin = crossOrigin
    if (referrerPolicy) script.referrerPolicy = referrerPolicy
    script.onload = () => {
      if (script.dataset) script.dataset.loaded = 'true'
      if (window.Chart) {
        resolve()
        return
      }
      if (script.dataset) script.dataset.error = 'true'
      reject(new Error(`Loaded ${src} but window.Chart is unavailable`))
    }
    script.onerror = () => {
      if (script.dataset) script.dataset.error = 'true'
      reject(new Error(`Failed to load ${src}`))
    }
    document.head.appendChild(script)
  })
}

function initChartsAndGraphs() {
  let chartTargets = document.querySelectorAll('canvas[data-chart]')
  if (!chartTargets.length) {
    chartTargets = document.querySelectorAll(
      'canvas[id^="chart"], canvas[id^="example"], #bar, #pie',
    )
  }
  if (!chartTargets.length) return

  const renderCharts = () => {
    if (!window.Chart) return

    const palette = getNswChartPalette({ cssScope: document.body })
    const aboriginalPalette = getNswAboriginalChartPalette({ cssScope: document.body })
    const textDark = palette.grey01
    const chartLayoutPadding = {
      top: 12,
      right: 12,
      bottom: 12,
      left: 12,
    }

    Chart.defaults.font.family = "'Public Sans'"
    Chart.defaults.font.size = 13
    Chart.defaults.font.weight = 400
    Chart.defaults.color = textDark
    Chart.defaults.borderColor = palette.grey03
    Chart.defaults.elements.line.borderWidth = 2
    Chart.defaults.elements.point.radius = 2
    Chart.defaults.elements.point.hoverRadius = 4
    Chart.defaults.elements.point.borderWidth = 1
    Chart.defaults.elements.bar.borderRadius = 0
    Chart.defaults.elements.bar.borderWidth = 0
    Chart.defaults.plugins.legend.labels.boxWidth = 18
    Chart.defaults.plugins.legend.labels.boxHeight = 18
    Chart.defaults.plugins.legend.labels.padding = 10
    Chart.defaults.plugins.legend.labels.color = palette.grey01
    Chart.defaults.plugins.legend.labels.font = { size: 12, weight: 500 }
    Chart.defaults.plugins.title = Chart.defaults.plugins.title || {}
    Chart.defaults.plugins.title.font = { size: 16, weight: 600 }
    Chart.defaults.plugins.title.padding = {
      top: 8,
      bottom: 16,
    }
    Chart.defaults.plugins.legend.onClick = () => {}
    Chart.defaults.layout = Chart.defaults.layout || {}
    Chart.defaults.layout.padding = chartLayoutPadding
    if (Chart.defaults.scale) {
      Chart.defaults.scale.grid.color = palette.grey03
      Chart.defaults.scale.grid.drawBorder = false
      Chart.defaults.scale.ticks.color = palette.grey02
      Chart.defaults.scale.ticks.font = { size: 12 }
      Chart.defaults.scale.ticks.padding = 6
      Chart.defaults.scale.title = Chart.defaults.scale.title || {}
      Chart.defaults.scale.title.font = { size: 13, weight: 500 }
      Chart.defaults.scale.title.padding = {
        top: 8,
        bottom: 8,
      }
    }

    const patternPresets = {
      default: {
        size: 8,
        rotate: 0,
        alignToElement: false,
        tintSvg: true,
        inkColor: 'auto',
        minContrast: 3,
        enforceContrast: false,
        inkIndex: defaultNswInkIndex,
      },
      diagonal: {},
      vertical: {},
      dots: {},
      zigzag: {},
      cross: {},
    }

    const getPatternFill = (context, style, baseColor, overrides = {}) => {
      if (!context || !context.chart || !context.chart.ctx) return baseColor
      const preset = patternPresets[style] || patternPresets.default
      return createPattern(context, {
        ...patternPresets.default,
        ...preset,
        ...overrides,
        style,
        baseColor,
      }) || baseColor
    }

    const createChart = (canvasId, config) => {
      const canvas = document.getElementById(canvasId)
      if (!canvas) return
      canvas.classList.add('nsw-docs__chart-canvas')
      canvas.style.backgroundColor = canvas.dataset.chartBg === 'none' ? 'transparent' : '#FFFFFF'
      if (Chart.getChart && Chart.getChart(canvas)) return

      const options = config && config.options ? config.options : {}
      const plugins = options.plugins || {}
      const legend = plugins.legend || {}
      const chartHeight = canvas.dataset.chartHeight || canvas.getAttribute('height')
      const hasExplicitChartHeight = Boolean(chartHeight)

      if (hasExplicitChartHeight) {
        canvas.style.height = /^\d+(\.\d+)?$/.test(chartHeight) ? `${chartHeight}px` : chartHeight
      }

      new Chart(canvas, {
        ...config,
        options: {
          responsive: options.responsive !== false,
          maintainAspectRatio: Object.prototype.hasOwnProperty.call(options, 'maintainAspectRatio')
            ? options.maintainAspectRatio
            : !hasExplicitChartHeight,
          ...options,
          plugins: {
            ...plugins,
            legend: {
              ...legend,
              onClick: () => {},
            },
          },
        },
      })
    }

    createChart('bar', {
      type: 'bar',
      data: {
        labels: [
          'A thing',
          'Another thing',
          'Third thing',
          'Fourth thing',
          'Fifth thing',
          'Penultimate thing',
          'Last thing',
        ],
        datasets: [{
          label: false,
          data: [125, 50, 100, 75, 50, 25, 75],
          backgroundColor: [palette.blue02],
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })

    createChart('pie', {
      type: 'pie',
      data: {
        labels: [
          'A thing',
          'Another thing',
          'Third thing',
          'Fourth thing',
          'Fifth thing',
          'Penultimate thing',
          'Last thing',
        ],
        datasets: [{
          label: 'Example Dataset',
          data: [125, 50, 100, 75, 50, 25, 75],
          hoverOffset: 8,
          backgroundColor: [
            palette.blue02,
            palette.teal02,
            palette.grey02,
            palette.purple02,
            palette.orange02,
            palette.brown02,
          ],
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    })

    createChart('example1Bad', {
      type: 'bar',
      data: {
        labels: [
          'Illawarra Shoalhaven',
          'Central Coast',
          'Hunter New England',
          'Western NSW',
        ],
        datasets: [{
          data: [96, 101, 98, 104],
          backgroundColor: [palette.blue02],
        }],
      },
      options: {
        scales: {
          y: {
            min: 90,
            max: 110,
          },
          x: {
            ticks: {
              maxRotation: 60,
              minRotation: 60,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })

    createChart('example1Good', {
      type: 'bar',
      data: {
        labels: [
          'Illawarra Shoalhaven',
          'Central Coast',
          'Hunter New England',
          'Western NSW',
        ],
        datasets: [{
          label: 'Completions',
          data: [96, 101, 98, 104],
          backgroundColor: [palette.blue02],
        }],
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Completions (count)',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Service completions by region (Jan to Jun 2025)',
          },
        },
      },
    })

    createChart('example2Bad', {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Resolved on time',
          data: [120, 140, 110, 150],
          backgroundColor: palette.green04,
        }, {
          label: 'Resolved late',
          data: [30, 25, 40, 20],
          backgroundColor: palette.red04,
        }],
      },
      options: {
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })

    createChart('example2Good', {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Resolved on time',
          data: [120, 140, 110, 150],
          backgroundColor: palette.purple01,
          borderColor: palette.purple01,
          borderWidth: 1,
        }, {
          label: 'Resolved late',
          data: [30, 25, 40, 20],
          backgroundColor: (context) => getPatternFill(context, 'vertical', palette.purple02, {
            svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
          }),
          borderColor: palette.grey03,
          borderWidth: 0,
        }],
      },
      options: {
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cases',
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Resolution by quarter (2025)',
          },
        },
      },
    })

    createChart('example3Bad', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Applications',
          data: [220, 260, 310, 370, 420, 390],
          borderColor: palette.grey02,
          backgroundColor: palette.grey03,
          pointRadius: 3,
          tension: 0.3,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    createChart('example3Good', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Applications',
          data: [220, 260, 310, 370, 420, 390],
          borderColor: palette.blue02,
          backgroundColor: palette.blue02,
          pointRadius: 3,
          tension: 0.3,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Online applications (Jan to Jun 2025)',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Applications',
            },
          },
        },
      },
    })

    createChart('example4Bad', {
      type: 'pie',
      data: {
        labels: [
          'Category A', 'Category B', 'Category C', 'Category D',
          'Category E', 'Category F', 'Category G', 'Category H',
          'Category I', 'Category J', 'Category K', 'Category L',
        ],
        datasets: [{
          data: [12, 11, 10, 9, 8, 8, 7, 7, 6, 6, 5, 4],
          backgroundColor: [
            palette.blue02, palette.red02, palette.green02, palette.orange02,
            palette.purple02, palette.teal02, palette.fuchsia02, palette.brown02,
            palette.blue03, palette.red03, palette.green03, palette.orange03,
          ],
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    })

    createChart('example4Good', {
      type: 'pie',
      data: {
        labels: ['Digital', 'Phone', 'In person', 'Mail'],
        datasets: [{
          data: [46, 28, 17, 9],
          backgroundColor: (context) => {
            if (context.dataIndex === 3) {
              return getPatternFill(context, 'dots', palette.purple01, {
                svgUrl: '/assets/images/chart-pattern-dot-grid.svg',
                size: 12,
                inkColor: '#FFFFFF',
              })
            }
            return [palette.red01, palette.red02, palette.purple02, palette.purple01][context.dataIndex]
          },
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Service channel share (Q2 2025, percent)',
          },
        },
      },
    })

    const anatomyDataLabelsPlugin = {
      id: 'anatomyDataLabelsPlugin',
      afterDatasetsDraw: (chart) => {
        const { ctx, data } = chart
        ctx.save()
        ctx.fillStyle = palette.grey01
        ctx.font = "600 11px 'Public Sans'"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'

        data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex)
          if (!meta || meta.hidden) return
          meta.data.forEach((point, pointIndex) => {
            const value = dataset.data[pointIndex]
            if (!Number.isFinite(value)) return
            const position = point.tooltipPosition()
            ctx.fillText(String(value), position.x, position.y - 4)
          })
        })

        ctx.restore()
      },
    }

    createChart('chartAnatomy', {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Resolved on time',
            data: [410, 438, 467, 492, 525, 508],
            backgroundColor: palette.blue02,
          },
          {
            label: 'Resolved late',
            data: [72, 68, 74, 70, 66, 61],
            backgroundColor: palette.fuchsia02,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Service request resolutions by month (Jan to Jun 2026, count)',
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.formattedValue}`,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month (2026)',
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            suggestedMax: 560,
            ticks: {
              stepSize: 100,
            },
            title: {
              display: true,
              text: 'Requests (count)',
            },
          },
        },
      },
      plugins: [anatomyDataLabelsPlugin],
    })

    createChart('chartCompBar', {
      type: 'bar',
      data: {
        labels: ['Online', 'Phone', 'In person'],
        datasets: [{
          label: 'Visits',
          data: [320, 210, 140],
          backgroundColor: palette.purple02,
          barThickness: 72,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Visits by channel (Q1 2025, count)',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Channel',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Visits (count)',
            },
          },
        },
      },
    })

    createChart('chartCompBarHorizontal', {
      type: 'bar',
      data: {
        labels: ['South Western Sydney', 'Northern Sydney', 'Illawarra Shoalhaven'],
        datasets: [{
          label: 'Requests',
          data: [88, 74, 65],
          backgroundColor: palette.red01,
        }],
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Requests by service region (Q1 2025, count)',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Requests (count)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Service region',
            },
          },
        },
      },
    })

    createChart('chartCompGroupedHorizontal', {
      type: 'bar',
      data: {
        labels: ['South Western Sydney', 'Northern Sydney', 'Illawarra Shoalhaven'],
        datasets: [{
          label: '2024',
          data: [74, 68, 59],
          backgroundColor: palette.blue02,
        }, {
          label: '2025',
          data: [88, 74, 65],
          backgroundColor: palette.orange02,
        }],
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Requests by region (2024 vs 2025, count)',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Requests (count)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Service region',
            },
          },
        },
      },
    })

    createChart('chartCompStacked', {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Met target',
          data: [45, 52, 48, 60],
          backgroundColor: palette.blue02,
          barThickness: 72,
        }, {
          label: 'Below target',
          data: [15, 12, 18, 10],
          backgroundColor: palette.blue01,
          barThickness: 72,
        }],
      },
      options: {
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Quarter (2025)',
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cases (count)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Target status by quarter (2025, count)',
          },
        },
      },
    })

    createChart('chartTrendLine', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Applications',
          data: [120, 160, 210, 260, 310, 295],
          borderColor: palette.blue02,
          backgroundColor: palette.blue02,
          pointRadius: 4,
          borderWidth: 2,
          tension: 0.3,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Applications by month (Jan to Jun 2025, count)',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month (2025)',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Applications (count)',
            },
          },
        },
      },
    })

    createChart('chartTrendMultiLine', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Online submissions',
          data: [95, 120, 140, 165, 190, 210],
          borderColor: palette.blue02,
          backgroundColor: palette.blue02,
          pointRadius: 4,
          borderWidth: 2,
          borderDash: [],
          tension: 0.25,
        }, {
          label: 'Phone submissions',
          data: [130, 125, 118, 110, 105, 98],
          borderColor: palette.brown01,
          backgroundColor: palette.brown02,
          pointRadius: 4,
          borderWidth: 2,
          borderDash: [8, 6],
          tension: 0.25,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Submissions by channel (Jan to Jun 2025, count)',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month (2025)',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Submissions (count)',
            },
          },
        },
      },
    })

    createChart('chartTrendArea', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Total users',
          data: [300, 360, 420, 520, 610, 580],
          borderColor: palette.blue02,
          backgroundColor: palette.blue04,
          fill: true,
          pointRadius: 4,
          borderWidth: 2,
          tension: 0.3,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Total users by month (Jan to Jun 2025, count)',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month (2025)',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Users (count)',
            },
          },
        },
      },
    })

    createChart('chartTrendLineBarCombo', {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          type: 'bar',
          label: 'Applications',
          data: [120, 160, 210, 260, 310, 295],
          yAxisID: 'y',
          backgroundColor: palette.fuchsia01,
          order: 2,
        }, {
          type: 'line',
          label: 'Conversion rate',
          data: [38, 41, 43, 47, 49, 46],
          yAxisID: 'y1',
          borderColor: palette.fuchsia01,
          backgroundColor: palette.fuchsia02,
          borderWidth: 2,
          pointRadius: 4,
          tension: 0.25,
          order: 1,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Applications and conversion rate (Jan to Jun 2025)',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month (2025)',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Applications (count)',
            },
          },
          y1: {
            beginAtZero: true,
            max: 60,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: (value) => `${value}%`,
            },
            title: {
              display: true,
              text: 'Conversion rate (%)',
            },
          },
        },
      },
    })

    createChart('chartTrendSparkline', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Trend',
          data: [12, 18, 22, 20, 25, 23],
          borderColor: palette.blue02,
          backgroundColor: palette.blue02,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Monthly trend sparkline (Jan to Jun 2025)',
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
      },
    })

    createChart('chartPropDoughnut', {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Declined'],
        datasets: [{
          data: [62, 24, 14],
          backgroundColor: (context) => {
            if (context.dataIndex === 1) {
              return getPatternFill(context, 'diagonal', palette.purple02, {
                svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
              })
            }
            return [palette.purple01, palette.orange02, palette.red02][context.dataIndex]
          },
        }],
      },
      options: {
        aspectRatio: 1.4,
        radius: '86%',
        cutout: '58%',
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Application status share (Q2 2025, percent)',
          },
        },
      },
    })

    createChart('chartPropPie', {
      type: 'pie',
      data: {
        labels: ['Digital', 'Phone', 'In person', 'Mail'],
        datasets: [{
          data: [40, 25, 20, 15],
          backgroundColor: (context) => {
            if (context.dataIndex === 1) {
              return getPatternFill(context, 'diagonal', aboriginalPalette.billabongBlue, {
                svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
                size: 8,
                inkColor: '#FFFFFF',
              })
            }
            if (context.dataIndex === 3) {
              return getPatternFill(context, 'dots', aboriginalPalette.bushPlum, {
                svgUrl: '/assets/images/chart-pattern-dot-grid.svg',
                size: 12,
                inkColor: '#FFFFFF',
              })
            }
            return [
              aboriginalPalette.orangeOchre,
              aboriginalPalette.billabongBlue,
              aboriginalPalette.marshlandLime,
              aboriginalPalette.bushPlum,
            ][context.dataIndex]
          },
        }],
      },
      options: {
        aspectRatio: 1.4,
        radius: '86%',
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Channel share (Q2 2025)',
          },
        },
      },
    })

    createChart('chartPropStacked', {
      type: 'bar',
      data: {
        labels: ['Program A', 'Program B', 'Program C'],
        datasets: [{
          label: 'Completed',
          data: [70, 55, 62],
          backgroundColor: palette.blue01,
          barThickness: 72,
        }, {
          label: 'In progress',
          data: [20, 30, 18],
          backgroundColor: (context) => getPatternFill(context, 'vertical', palette.fuchsia02, {
            svgUrl: '/assets/images/chart-pattern-zigzag-chevron.svg',
            size: 12,
          }),
          barThickness: 72,
        }],
      },
      options: {
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Program',
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Status (count)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Program completion status (Q2 2025, count)',
          },
        },
      },
    })

    createChart('chartPropStackedProportional', {
      type: 'bar',
      data: {
        labels: ['Digital', 'Phone', 'In person', 'Mail'],
        datasets: [{
          label: 'Completed',
          data: [72, 66, 58, 64],
          backgroundColor: palette.red01,
        }, {
          label: 'In progress',
          data: [28, 34, 42, 36],
          backgroundColor: (context) => getPatternFill(context, 'diagonal', palette.orange02, {
            svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
            size: 8,
          }),
        }],
      },
      options: {
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Channel',
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value) => `${value}%`,
            },
            title: {
              display: true,
              text: 'Share of total (%)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Outcome share by channel (Q2 2025, 100% stacked)',
          },
        },
      },
    })

    createChart('chartDistScatter', {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Metro service centres',
            data: [
              { x: 2.0, y: 5.0 },
              { x: 3.0, y: 6.1 },
              { x: 4.0, y: 7.0 },
              { x: 4.5, y: 6.6 },
              { x: 5.5, y: 8.1 },
              { x: 6.0, y: 8.9 },
              { x: 7.0, y: 10.1 },
              { x: 7.5, y: 9.4 },
              { x: 8.2, y: 11.2 },
              { x: 9.0, y: 12.0 },
              { x: 10.0, y: 13.3 },
              { x: 10.8, y: 12.9 },
              { x: 11.5, y: 14.2 },
              { x: 12.2, y: 15.1 },
              { x: 13.0, y: 16.3 },
              { x: 14.0, y: 17.2 },
              { x: 15.0, y: 18.6 },
              { x: 16.0, y: 19.4 },
            ],
            backgroundColor: palette.red01,
            borderColor: palette.red01,
            pointRadius: 4,
            borderWidth: 2,
          },
          {
            label: 'Regional service centres',
            data: [
              { x: 5.0, y: 11.4 },
              { x: 9.0, y: 16.1 },
              { x: 12.0, y: 10.8 },
            ],
            backgroundColor: palette.fuchsia02,
            borderColor: palette.fuchsia01,
            pointRadius: 4,
            borderWidth: 2,
            pointRadius: 8,
            pointStyle: 'triangle',
          },
        ],
      },
      options: {
        layout: {
          padding: {
            left: 12,
            right: 8,
            top: 8,
            bottom: 4,
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyleWidth: 16,
            },
          },
          title: {
            display: true,
            text: 'Case volume vs processing time (Q2 2025)',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Weekly case volume',
            },
            min: 0,
            max: 18,
            ticks: {
              stepSize: 2,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Average processing time (days)',
            },
            min: 4,
            max: 22,
          },
        },
      },
    })

    createChart('chartDistBubble', {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Metro locations',
          data: [
            { x: 4, y: 6, r: 8 },
            { x: 6, y: 8, r: 10 },
            { x: 9, y: 11, r: 12 },
            { x: 12, y: 14, r: 14 },
            { x: 15, y: 18, r: 16 },
          ],
          backgroundColor: palette.blue02,
          borderColor: palette.blue01,
          pointRadius: 4,
          borderWidth: 2,
        }, {
          label: 'Regional locations',
          data: [
            { x: 3, y: 7, r: 7 },
            { x: 5, y: 10, r: 8 },
            { x: 8, y: 13, r: 10 },
            { x: 10, y: 16, r: 11 },
            { x: 13, y: 19, r: 13 },
          ],
          backgroundColor: palette.fuchsia02,
          borderColor: palette.fuchsia01,
          pointRadius: 4,
          borderWidth: 2,
        }],
      },
      options: {
        layout: {
          padding: {
            left: 12,
            right: 8,
            top: 8,
            bottom: 6,
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              pointStyleWidth: 12,
            },
          },
          title: {
            display: true,
            text: 'Demand, wait time and volume by location (Q2 2025)',
          },
        },
        scales: {
          x: {
            min: 0,
            max: 18,
            ticks: {
              stepSize: 2,
            },
            title: {
              display: true,
              text: 'Weekly demand (index)',
            },
          },
          y: {
            min: 4,
            max: 22,
            ticks: {
              stepSize: 3,
            },
            title: {
              display: true,
              text: 'Average wait time (days)',
            },
          },
        },
      },
    })

    createChart('chartDistDotPlot', {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Processing time observations',
          data: [
            { x: 1, y: 4.1 }, { x: 1, y: 5.2 }, { x: 1, y: 6.0 }, { x: 1, y: 7.2 },
            { x: 2, y: 5.1 }, { x: 2, y: 5.8 }, { x: 2, y: 6.5 }, { x: 2, y: 7.8 },
            { x: 3, y: 6.0 }, { x: 3, y: 6.9 }, { x: 3, y: 7.6 }, { x: 3, y: 8.9 },
            { x: 4, y: 5.5 }, { x: 4, y: 6.4 }, { x: 4, y: 7.0 }, { x: 4, y: 8.3 },
            { x: 5, y: 4.8 }, { x: 5, y: 5.9 }, { x: 5, y: 6.7 }, { x: 5, y: 7.4 },
          ],
          backgroundColor: palette.green02,
          borderColor: palette.green01,
          borderWidth: 1.5,
          pointRadius: 6,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          title: {
            display: true,
            text: 'Wait-time distribution by weekday (Q2 2025, days)',
          },
        },
        scales: {
          x: {
            min: 0.5,
            max: 5.5,
            ticks: {
              stepSize: 1,
              callback: (value) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][value - 1] || '',
            },
            title: {
              display: true,
              text: 'Weekday',
            },
          },
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
            },
            title: {
              display: true,
              text: 'Processing time (days)',
            },
          },
        },
      },
    })

    createChart('chartDistHistogram', {
      type: 'bar',
      data: {
        labels: ['0-2', '3-4', '5-6', '7-8', '9-10', '11-12', '13+'],
        datasets: [{
          label: 'Case frequency',
          data: [4, 9, 15, 12, 6, 3, 1],
          backgroundColor: palette.purple02,
          borderColor: palette.purple01,
          borderWidth: 1,
          barPercentage: 1,
          categoryPercentage: 1,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Processing-time distribution (Q2 2025, binned days)',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Processing time range (days)',
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 3,
            },
            title: {
              display: true,
              text: 'Number of cases',
            },
          },
        },
      },
    })

    createChart('chartDistRadar', {
      type: 'radar',
      data: {
        labels: ['Timeliness', 'Accuracy', 'Coverage', 'Clarity', 'Accessibility'],
        datasets: [{
          label: 'Service A',
          data: [78, 84, 72, 81, 75],
          borderColor: palette.blue02,
          backgroundColor: withAlpha(palette.blue02, 0.2),
          pointBackgroundColor: palette.blue02,
          pointBorderColor: palette.blue01,
          pointRadius: 3,
        }, {
          label: 'Service B',
          data: [55, 72, 87, 68, 74],
          borderColor: palette.orange01,
          backgroundColor: withAlpha(palette.red02, 0.2),
          pointBackgroundColor: palette.red02,
          pointBorderColor: palette.red01,
          pointRadius: 3,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Capability profile comparison (2025 index)',
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              showLabelBackdrop: false,
            },
            pointLabels: {
              font: {
                size: 12,
              },
            },
            angleLines: {
              color: palette.grey03,
            },
            grid: {
              color: palette.grey03,
            },
          },
        },
      },
    })
  }

  const ensureChartJS = () => {
    if (window.Chart) {
      renderCharts()
      return
    }
    loadScriptOnce(chartJsPrimary)
      .then(renderCharts)
      .catch(() => loadScriptOnce(chartJsFallback).then(renderCharts))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('Chart.js failed to load:', err)
      })
  }

  ensureChartJS()
}

initChartsAndGraphs()
