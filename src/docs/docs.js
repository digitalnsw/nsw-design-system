import Autocomplete from './autocomplete'
import ExpandableSearch from './expandable-search'
import DownloadPDF from './download-pdf'
import ColorSwatches from './color-swatches'
import {
  createPattern,
  preloadSvgPattern,
  defaultNswInkIndex,
  getNswChartPalette,
} from './chart-utilities'

/* global Chart */

const CHART_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js'
const CHART_JS_FALLBACK = 'https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js'

// Prevent icon flash: hide icons until font loads
document.documentElement.classList.add('material-icons-loading')

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (window.Chart) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false)
  }

  const input = document.createElement('textarea')
  input.value = text
  input.setAttribute('readonly', '')
  input.style.position = 'absolute'
  input.style.left = '-9999px'
  document.body.appendChild(input)
  input.select()

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch (error) {
    copied = false
  }

  document.body.removeChild(input)
  return Promise.resolve(copied)
}

function buildChecklistCopyText(fieldset) {
  const items = Array.from(fieldset.querySelectorAll('.nsw-form__checkbox-input'))
    .map((input) => {
      if (!input.id) return null
      const label = fieldset.querySelector(`label[for="${input.id}"]`)
      if (!label) return null
      return {
        checked: Boolean(input.checked),
        text: label.textContent.trim(),
      }
    })
    .filter(Boolean)

  const checkedCount = items.filter((item) => item.checked).length
  const total = items.length
  const remaining = Math.max(0, total - checkedCount)

  const lines = [
    'Charts and graphs review checklist',
    `Completed: ${checkedCount}/${total}`,
    `Remaining: ${remaining}`,
    '',
    ...items.map((item) => `- [${item.checked ? 'x' : ' '}] ${item.text}`),
  ]

  return {
    text: lines.join('\n'),
    checkedCount,
    total,
  }
}

function initReviewChecklistCopy() {
  const copyButtons = document.querySelectorAll('.js-review-checklist-copy')
  if (!copyButtons.length) return

  copyButtons.forEach((button) => {
    let resetTimer = null

    button.addEventListener('click', () => {
      const checklistId = button.getAttribute('data-checklist-id')
      const fieldset = checklistId ? document.getElementById(checklistId) : null
      if (!fieldset) return

      const buttonText = button.querySelector('span:last-child')
      const originalLabel = buttonText ? buttonText.textContent : 'Copy checklist'
      const { text, checkedCount, total } = buildChecklistCopyText(fieldset)

      copyTextToClipboard(text).then((copied) => {
        if (buttonText) {
          buttonText.textContent = copied
            ? `Copied checklist (${checkedCount}/${total} complete)`
            : 'Copy failed'
        }

        if (resetTimer) {
          clearTimeout(resetTimer)
        }

        resetTimer = setTimeout(() => {
          if (buttonText) buttonText.textContent = originalLabel
          resetTimer = null
        }, 5000)
      })
    }, false)
  })
}

function initChartsAndGraphs() {
  const chartTargets = document.querySelectorAll(
    `#bar, #pie, #example1Bad, #example1Good, #example2Bad, #example2Good, #example3Bad, #example3Good,
    #chartAnatomy,
    #chartCompBar, #chartCompBarHorizontal, #chartCompStacked,
    #chartTrendLine, #chartTrendArea, #chartTrendSparkline,
    #chartPropDoughnut, #chartPropPie, #chartPropStacked,
    #chartDistScatter, #chartDistHeatmap`,
  )
  if (!chartTargets.length) return

  const renderCharts = async () => {
    if (!window.Chart) return

    await Promise.all([
      preloadSvgPattern('/assets/images/chart-pattern-grid-tight.svg'),
      preloadSvgPattern('/assets/images/chart-pattern-cross-diagonal.svg'),
      preloadSvgPattern('/assets/images/chart-pattern-diagonal-lines.svg'),
      preloadSvgPattern('/assets/images/chart-pattern-dot-grid.svg'),
      preloadSvgPattern('/assets/images/chart-pattern-checker-small.svg'),
      preloadSvgPattern('/assets/images/chart-pattern-zigzag-chevron.svg'),
      preloadSvgPattern('/assets/images/chart-pattern-grid-wide.svg'),
    ])

    const palette = getNswChartPalette({ cssScope: document.body })
    const textDark = palette.grey01

    Chart.defaults.font.family = "'Public Sans'"
    Chart.defaults.font.size = 12
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
    Chart.defaults.plugins.legend.labels.padding = 12
    Chart.defaults.plugins.legend.labels.color = palette.grey01
    Chart.defaults.plugins.legend.labels.font = { size: 11, weight: 500 }
    if (Chart.defaults.scale) {
      Chart.defaults.scale.grid.color = palette.grey03
      Chart.defaults.scale.grid.drawBorder = false
      Chart.defaults.scale.ticks.color = palette.grey02
      Chart.defaults.scale.ticks.font = { size: 11 }
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
      if (Chart.getChart && Chart.getChart(canvas)) return
      new Chart(canvas, config)
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
            palette.yellow02,
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
          backgroundColor: palette.blue02,
          borderColor: palette.grey01,
          borderWidth: 1,
        }, {
          label: 'Resolved late',
          data: [30, 25, 40, 20],
          backgroundColor: (context) => getPatternFill(context, 'vertical', palette.blue04, {
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
            backgroundColor: palette.red02,
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
          backgroundColor: [palette.grey02, palette.blue02, palette.purple02],
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
            title: {
              display: true,
              text: 'Visits',
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
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Requests',
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
        }, {
          label: 'Below target',
          data: [15, 12, 18, 10],
          backgroundColor: (context) => getPatternFill(context, 'cross', palette.blue04, {
            svgUrl: '/assets/images/chart-pattern-cross-diagonal.svg',
            size: 12,
          }),
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
            position: 'bottom',
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
          pointRadius: 2,
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
              return getPatternFill(context, 'diagonal', palette.purple03, {
                svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
              })
            }
            return [palette.blue02, palette.purple03, palette.red02][context.dataIndex]
          },
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

    createChart('chartPropPie', {
      type: 'pie',
      data: {
        labels: ['Digital', 'Phone', 'In person', 'Mail'],
        datasets: [{
          data: [40, 25, 20, 15],
          backgroundColor: (context) => {
            if (context.dataIndex === 3) {
              return getPatternFill(context, 'dots', palette.grey03, {
                svgUrl: '/assets/images/chart-pattern-dot-grid.svg',
                size: 12,
              })
            }
            return [palette.blue02, palette.red03, palette.purple02, palette.grey03][context.dataIndex]
          },
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

    createChart('chartPropStacked', {
      type: 'bar',
      data: {
        labels: ['Program A', 'Program B', 'Program C'],
        datasets: [{
          label: 'Completed',
          data: [70, 55, 62],
          backgroundColor: palette.blue01,
        }, {
          label: 'In progress',
          data: [20, 30, 18],
          backgroundColor: (context) => getPatternFill(context, 'vertical', palette.fuchsia02, {
            svgUrl: '/assets/images/chart-pattern-zigzag-chevron.svg',
            size: 12,
          }),
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
            position: 'bottom',
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
            backgroundColor: palette.blue02,
            borderColor: palette.blue01,
            borderWidth: 1,
            pointRadius: 2,
          },
          {
            label: 'Regional service centres',
            data: [
              { x: 5.0, y: 11.4 },
              { x: 9.0, y: 15.1 },
              { x: 12.0, y: 10.8 },
            ],
            backgroundColor: palette.red02,
            borderColor: palette.red01,
            borderWidth: 1,
            pointStyle: 'rect',
            pointRadius: 5,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
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

    createChart('chartDistHeatmap', {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Intensity',
          data: [
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
            { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
          ],
          pointStyle: 'rect',
          pointRadius: 12,
          backgroundColor: [
            palette.blue04, palette.blue04, palette.blue03, palette.blue02,
            palette.blue04, palette.blue03, palette.blue02, palette.blue01,
            palette.blue03, palette.blue02, palette.blue01, palette.blue01,
          ],
          borderColor: palette.grey01,
          borderWidth: 1,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            min: 0.5,
            max: 4.5,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: true,
              text: 'Weekday',
            },
          },
          y: {
            min: 0.5,
            max: 3.5,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: true,
              text: 'Service type',
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
    loadScriptOnce(CHART_JS_CDN)
      .then(renderCharts)
      .catch(() => loadScriptOnce(CHART_JS_FALLBACK).then(renderCharts))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('Chart.js failed to load:', err)
      })
  }

  ensureChartJS()
}

function initDocs() {
  const codeButtons = document.querySelectorAll('.js-code-button')

  codeButtons.forEach((button) => {
    const code = button.nextElementSibling
    const text = button.querySelector('span')

    button.addEventListener('click', () => {
      if (code.classList.contains('active')) {
        button.classList.remove('active')
        code.classList.remove('active')
        text.textContent = 'Show code'
      } else {
        button.classList.add('active')
        code.classList.add('active')
        text.textContent = 'Hide code'
      }
    }, false)
  })

  const copyButtons = document.querySelectorAll('.js-code-copy')

  copyButtons.forEach((button) => {
    const code = button.nextElementSibling
    const text = button.querySelector('span')
    const script = code.querySelector('script')

    script.remove()

    button.addEventListener('click', () => {
      const elem = document.createElement('textarea')
      elem.value = code.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      document.body.appendChild(elem)
      elem.select()
      document.execCommand('copy')
      text.textContent = 'Copied'
      document.body.removeChild(elem)

      setTimeout(() => {
        text.textContent = 'Copy'
      }, 2000)
    }, false)
  })

  const navLinks = document.querySelectorAll('.nsw-docs__nav a')
  let currentURL = window.location.pathname

  if (currentURL === '/') currentURL = '/home/index.html'

  navLinks.forEach((link) => {
    let linkURL = link.getAttribute('href')
    const sanitisedURL = new URL(linkURL, window.location.origin)
    linkURL = sanitisedURL.pathname + sanitisedURL.search + sanitisedURL.hash

    if (linkURL === '/') linkURL = '/home/index.html'

    if (currentURL.match(linkURL)) {
      link.classList.add('current')

      if (link.closest('ul').classList.contains('nsw-main-nav__sub-list')) {
        const list = link.closest('.nsw-main-nav__sub-nav')
        const button = list.previousElementSibling

        list.classList.add('current-section')
        button.classList.add('current-section')
        button.click()
      } else {
        link.classList.add('current-section')
      }
    }
  })

  const autoComplete = document.querySelectorAll('.js-autocomplete')

  if (autoComplete) {
    autoComplete.forEach((element) => {
      new Autocomplete(element).init()
    })
  }

  const expandableSearch = document.querySelectorAll('.js-header')

  if (expandableSearch) {
    expandableSearch.forEach((element) => {
      new ExpandableSearch(element).init()
    })
  }

  const downloadPDF = document.querySelectorAll('.js-download-page')

  if (downloadPDF) {
    downloadPDF.forEach((element) => {
      new DownloadPDF(element).init()
    })
  }

  initReviewChecklistCopy()
  initChartsAndGraphs()

  const colorConfig = {
    variables: {
      'brand-dark': '--nsw-brand-dark',
      'brand-light': '--nsw-brand-light',
      'brand-supplementary': '--nsw-brand-supplementary',
      'brand-accent': '--nsw-brand-accent',
      'brand-accent-light': '--nsw-brand-accent-light',
      'link-colour': '--nsw-link',
      'visited-link-colour': '--nsw-visited',
      'hover-background-colour': '--nsw-hover',
      'active-background-colour': '--nsw-active',
      focus: '--nsw-focus',
    },
    palettes: {
      default: {
        label: 'Default Palette',
        'Blue 01': {
          val: '#002664',
          'brand-dark': { label: 'Blue 01', value: '#002664' },
          'brand-light': { label: 'Blue 04', value: '#CBEDFD' },
          'brand-supplementary': { label: 'Blue 02', value: '#146CFD' },
          'brand-accent': { label: 'Red 02', value: '#D7153A' },
          'brand-accent-light': { label: 'Red 04', value: '#FFE6EA' },
          'link-colour': { label: 'Blue 01', value: '#002664' },
          'visited-link-colour': { label: '', value: '#551A8B' },
          'hover-background-colour': { label: '', value: 'rgba(0, 38, 100, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(0, 38, 100, 0.2)' },
          focus: { label: '', value: '#0086B3' },
        },
        'Purple 01': {
          val: '#441170',
          'brand-dark': { label: 'Purple 01', value: '#441170' },
          'brand-light': { label: 'Purple 04', value: '#E6E1FD' },
          'brand-supplementary': { label: 'Purple 02', value: '#8055F1' },
          'brand-accent': { label: 'Yellow 02', value: '#FAAF05' },
          'brand-accent-light': { label: 'Yellow 04', value: '#FFF4CF' },
          'link-colour': { label: 'Purple 01', value: '#441170' },
          'visited-link-colour': { label: '', value: '#70114D' },
          'hover-background-colour': { label: '', value: 'rgba(68, 17, 112, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(68, 17, 112, 0.2)' },
          focus: { label: '', value: '#351BB5' },
        },
        'Fuchsia 01': {
          val: '#65004D',
          'brand-dark': { label: 'Fuchsia 01', value: '#65004D' },
          'brand-light': { label: 'Fuchsia 04', value: '#F0E6ED' },
          'brand-supplementary': { label: 'Fuchsia 02', value: '#D912AE' },
          'brand-accent': { label: 'Orange 02', value: '#F3631B' },
          'brand-accent-light': { label: 'Orange 04', value: '#FDEDDF' },
          'link-colour': { label: 'Fuchsia 01', value: '#65004D' },
          'visited-link-colour': { label: '', value: '#983379' },
          'hover-background-colour': { label: '', value: 'rgba(101, 0, 77, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(101, 0, 77, 0.2)' },
          focus: { label: '', value: '#9D00B4' },
        },
        'Red 01': {
          val: '#630019',
          'brand-dark': { label: 'Red 01', value: '#630019' },
          'brand-light': { label: 'Red 04', value: '#FFE6EA' },
          'brand-supplementary': { label: 'Red 02', value: '#D7153A' },
          'brand-accent': { label: 'Brown 02', value: '#B68D5D' },
          'brand-accent-light': { label: 'Brown 04', value: '#EDE3D7' },
          'link-colour': { label: 'Red 01', value: '#630019' },
          'visited-link-colour': { label: '', value: '#9C3D1B' },
          'hover-background-colour': { label: '', value: 'rgba(99, 0, 25, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(99, 0, 25, 0.2)' },
          focus: { label: '', value: '#B2006E' },
        },
        'Orange 01': {
          val: '#941B00',
          'brand-dark': { label: 'Orange 01', value: '#941B00' },
          'brand-light': { label: 'Orange 04', value: '#FDEDDF' },
          'brand-supplementary': { label: 'Orange 02', value: '#F3631B' },
          'brand-accent': { label: 'Purple 02', value: '#8055F1' },
          'brand-accent-light': { label: 'Purple 04', value: '#E6E1FD' },
          'link-colour': { label: 'Orange 01', value: '#941B00' },
          'visited-link-colour': { label: '', value: '#7D4D27' },
          'hover-background-colour': { label: '', value: 'rgba(148, 27, 0, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(148, 27, 0, 0.2)' },
          focus: { label: '', value: '#E3002A' },
        },
        'Brown 01': {
          val: '#523719',
          'brand-dark': { label: 'Brown 01', value: '#523719' },
          'brand-light': { label: 'Brown 04', value: '#EDE3D7' },
          'brand-supplementary': { label: 'Brown 02', value: '#B68D5D' },
          'brand-accent': { label: 'Teal 02', value: '#2E808E' },
          'brand-accent-light': { label: 'Teal 04', value: '#D1EEEA' },
          'link-colour': { label: 'Brown 01', value: '#523719' },
          'visited-link-colour': { label: '', value: '#914132' },
          'hover-background-colour': { label: '', value: 'rgba(82, 55, 25, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(82, 55, 25, 0.2)' },
          focus: { label: '', value: '#8F3B2B' },
        },
        'Yellow 01': {
          val: '#694800',
          'brand-dark': { label: 'Yellow 01', value: '#694800' },
          'brand-light': { label: 'Yellow 04', value: '#FFF4CF' },
          'brand-supplementary': { label: 'Yellow 02', value: '#FAAF05' },
          'brand-accent': { label: 'Green 02', value: '#00AA45' },
          'brand-accent-light': { label: 'Green 04', value: '#DBFADF' },
          'link-colour': { label: 'Yellow 01', value: '#694800' },
          'visited-link-colour': { label: '', value: '#5B5A16' },
          'hover-background-colour': { label: '', value: 'rgba(105, 72, 0, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(105, 72, 0, 0.2)' },
          focus: { label: '', value: '#B83B00' },
        },
        'Green 01': {
          val: '#004000',
          'brand-dark': { label: 'Green 01', value: '#004000' },
          'brand-light': { label: 'Green 04', value: '#DBFADF' },
          'brand-supplementary': { label: 'Green 02', value: '#00AA45' },
          'brand-accent': { label: 'Blue 02', value: '#146CFD' },
          'brand-accent-light': { label: 'Blue 04', value: '#CBEDFD' },
          'link-colour': { label: 'Green 01', value: '#004000' },
          'visited-link-colour': { label: '', value: '#016740' },
          'hover-background-colour': { label: '', value: 'rgba(0, 64, 0, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(0, 64, 0, 0.2)' },
          focus: { label: '', value: '#348F00' },
        },
        'Teal 01': {
          val: '#0B3F47',
          'brand-dark': { label: 'Teal 01', value: '#0B3F47' },
          'brand-light': { label: 'Teal 04', value: '#D1EEEA' },
          'brand-supplementary': { label: 'Teal 02', value: '#2E808E' },
          'brand-accent': { label: 'Fuchsia 02', value: '#D912AE' },
          'brand-accent-light': { label: 'Fuchsia 04', value: '#FDDEF2' },
          'link-colour': { label: 'Teal 01', value: '#0B3F47' },
          'visited-link-colour': { label: '', value: '#265E76' },
          'hover-background-colour': { label: '', value: 'rgba(11, 63, 71, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(11, 63, 71, 0.2)' },
          focus: { label: '', value: '#168B70' },
        },
      },
      aboriginal: {
        label: 'Aboriginal Palette',
        'Earth-Red': {
          val: '#950906',
          'brand-dark': { label: 'Earth Red', value: '#950906' },
          'brand-light': { label: 'Galah Pink', value: '#FDD9D9' },
          'brand-supplementary': { label: 'Ember Red', value: '#E1261C' },
          'brand-accent': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'link-colour': { label: 'Earth Red', value: '#950906' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Earth Red', value: 'rgba(149, 9, 6, 0.1)' },
          'active-background-colour': { label: 'Earth Red', value: 'rgba(149, 9, 6, 0.2)' },
          focus: { label: 'Ember Red', value: '#E1261C' },
        },
        'Deep Orange': {
          val: '#882600',
          'brand-dark': { label: 'Deep Orange', value: '#882600' },
          'brand-light': { label: 'Sunset Orange', value: '#F9D4BE' },
          'brand-supplementary': { label: 'Orange Ochre', value: '#EE6314' },
          'brand-accent': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'link-colour': { label: 'Deep Orange', value: '#882600' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Deep Orange', value: 'rgba(136, 38, 0, 0.1)' },
          'active-background-colour': { label: 'Deep Orange', value: 'rgba(136, 38, 0, 0.2)' },
          focus: { label: 'Orange Ochre', value: '#EE6314' },
        },
        'Riverbed Brown': {
          val: '#552105',
          'brand-dark': { label: 'Riverbed Brown', value: '#552105' },
          'brand-light': { label: 'Macadamia Brown', value: '#E9C8B2' },
          'brand-supplementary': { label: 'Firewood Brown', value: '#9E5332' },
          'brand-accent': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'link-colour': { label: 'Riverbed Brown', value: '#552105' },
          'visited-link-colour': { label: 'Spirit Lilac', value: '#9A5E93' },
          'hover-background-colour': { label: 'Riverbed Brown', value: 'rgba(85, 33, 5, 0.1)' },
          'active-background-colour': { label: 'Riverbed Brown', value: 'rgba(85, 33, 5, 0.2)' },
          focus: { label: 'Firewood Brown', value: '#9E5332' },
        },
        'Bush Honey Yellow': {
          val: '#895E00',
          'brand-dark': { label: 'Bush Honey Yellow', value: '#895E00' },
          'brand-light': { label: 'Sunbeam Yellow', value: '#FFF1C5' },
          'brand-supplementary': { label: 'Sandstone Yellow', value: '#FEA927' },
          'brand-accent': { label: 'Spirit Lilac', value: '#9A5E93' },
          'brand-accent-light': { label: 'Dusk Purple', value: '#E4CCE0' },
          'link-colour': { label: 'Bush Honey Yellow', value: '#895E00' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Bush Honey Yellow', value: 'rgba(105, 72, 0, 0.1)' },
          'active-background-colour': { label: 'Bush Honey Yellow', value: 'rgba(105, 72, 0, 0.2)' },
          focus: { label: 'Saltwater Blue', value: '#0D6791' },
        },
        'Bushland Green': {
          val: '#215834',
          'brand-dark': { label: 'Bushland Green', value: '#215834' },
          'brand-light': { label: 'Saltbush Green', value: '#DAE6D1' },
          'brand-supplementary': { label: 'Marshland Lime', value: '#78A146' },
          'brand-accent': { label: 'Firewood Brown', value: '#9E5332' },
          'brand-accent-light': { label: 'Macadamia Brown', value: '#E9C8B2' },
          'link-colour': { label: 'Bushland Green', value: '#215834' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Bushland Green', value: 'rgba(33, 88, 52, 0.1)' },
          'active-background-colour': { label: 'Bushland Green', value: 'rgba(33, 88, 52, 0.2)' },
          focus: { label: 'Marshland Lime', value: '#78A146' },
        },
        'Billabong Blue': {
          val: '#162953',
          'brand-dark': { label: 'Billabong Blue', value: '#00405E' },
          'brand-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'brand-supplementary': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent': { label: 'Orange Ochre', value: '#EE6314' },
          'brand-accent-light': { label: 'Sunset Orange', value: '#F9D4BE' },
          'link-colour': { label: 'Saltwater Blue', value: '#0D6791' },
          'visited-link-colour': { label: 'Spirit Lilac', value: '#9A5E93' },
          'hover-background-colour': { label: 'Billabong Blue', value: 'rgba(0, 64, 94, 0.1)' },
          'active-background-colour': { label: 'Billabong Blue', value: 'rgba(0, 64, 94, 0.2)' },
          focus: { label: 'Saltwater Blue', value: '#0D6791' },
        },
        'Bush Plum': {
          val: '#472642',
          'brand-dark': { label: 'Bush Plum', value: '#472642' },
          'brand-light': { label: 'Dusk Purple', value: '#E4CCE0' },
          'brand-supplementary': { label: 'Spirit Lilac', value: '#9A5E93' },
          'brand-accent': { label: 'Orange Ochre', value: '#EE6314' },
          'brand-accent-light': { label: 'Sunset Orange', value: '#F9D4BE' },
          'link-colour': { label: 'Bush Plum', value: '#472642' },
          'visited-link-colour': { label: 'Spirit Lilac', value: '#9A5E93' },
          'hover-background-colour': { label: 'Bush Plum', value: 'rgba(71, 38, 66, 0.1)' },
          'active-background-colour': { label: 'Bush Plum', value: 'rgba(71, 38, 66, 0.2)' },
          focus: { label: 'Orange Ochre', value: '#EE6314' },
        },
        'Charcoal Grey': {
          val: '#2D2D2D',
          'brand-dark': { label: 'Charcoal Grey', value: '#272727' },
          'brand-light': { label: 'Smoke Grey', value: '#E5E3E0' },
          'brand-supplementary': { label: 'Bush Honey Yellow', value: '#694800' },
          'brand-accent': { label: 'Sandstone Yellow', value: '#FEA927' },
          'brand-accent-light': { label: 'Sunbeam Yellow', value: '#FFF1C5' },
          'link-colour': { label: 'Charcoal Grey', value: '#272727' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Charcoal Grey', value: 'rgba(39, 39, 39, 0.1)' },
          'active-background-colour': { label: 'Charcoal Grey', value: 'rgba(39, 39, 39, 0.2)' },
          focus: { label: 'Sandstone Yellow', value: '#FEA927' },
        },
      },
    },
  }

  // Partial theming (accent-only, updates brand-accent without affecting others)
  const accentConfig = {
    variables: {
      'brand-accent': '--nsw-brand-accent',
    },
    palettes: {
      'Default Palette': {
        'Blue 02': { val: '#146CFD', 'brand-accent': '#146CFD' },
        'Purple 02': { val: '#8055F1', 'brand-accent': '#8055F1' },
        'Fuchsia 02': { val: '#D912AE', 'brand-accent': '#D912AE' },
        'Red 02': { val: '#D7153A', 'brand-accent': '#D7153A' },
        'Orange 02': { val: '#F3631B', 'brand-accent': '#F3631B' },
        'Brown 02': { val: '#B68D5D', 'brand-accent': '#B68D5D' },
        'Yellow 02': { val: '#FAAF05', 'brand-accent': '#FAAF05' },
        'Green 02': { val: '#00AA45', 'brand-accent': '#00AA45' },
        'Teal 02': { val: '#2E808E', 'brand-accent': '#2E808E' },
      },
      'Aboriginal Palette': {
        'Ember Red': { val: '#E1261C', 'brand-accent': '#E1261C' },
        'Orange Ochre': { val: '#EE6314', 'brand-accent': '#EE6314' },
        'Firewood Brown': { val: '#9E5332', 'brand-accent': '#9E5332' },
        'Sandstone Yellow': { val: '#FEA927', 'brand-accent': '#FEA927' },
        'Marshland Lime': { val: '#78A146', 'brand-accent': '#78A146' },
        'Saltwater Blue': { val: '#0D6791', 'brand-accent': '#0D6791' },
        'Spirit Lilac': { val: '#9A5E93', 'brand-accent': '#9A5E93' },
        'Emu Grey': { val: '#555555', 'brand-accent': '#555555' },
      },
    },
  }

  // Initialise Color Swatches for full-page and content-only pages
  document.querySelectorAll('.js-color-swatches').forEach((element) => {
    new ColorSwatches(element, colorConfig).init()
  })

  // Initialise Color Swatches for partial re-theming (only updates brand-accent)
  document.querySelectorAll('.js-color-swatch[data-mode="accent-only"]').forEach((element) => {
    new ColorSwatches(element, accentConfig).init()
  })

  // Initialise Quick Exit (module-based)
  const hasQuickExitAPI = () => !!(window.NSW && window.NSW.QuickExit)

  // Delegated: button demos use data-module + optional data-options JSON
  document.addEventListener('click', (evt) => {
    const btn = evt.target.closest('button[data-module="quick-exit"]')
    if (!btn) return
    evt.preventDefault()
    if (!hasQuickExitAPI()) return

    let opts = {}
    const optAttr = btn.getAttribute('data-options')
    if (optAttr && optAttr.trim()) {
      try {
        opts = JSON.parse(optAttr)
      } catch (err) {
        // Swallow JSON errors so docs don't break if the attribute is malformed
        // eslint-disable-next-line no-console
        console.warn('Invalid data-options for Quick Exit demo:', err)
      }
    }

    window.NSW.QuickExit.init(opts)
  })
  // --- End Quick Exit ---
}

initDocs()

// Show icons when Material Icons font is ready
function handleIconsReady() {
  document.documentElement.classList.remove('material-icons-loading')
  document.documentElement.classList.add('material-icons-loaded')
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(handleIconsReady)
} else {
  window.addEventListener('load', handleIconsReady)
}
