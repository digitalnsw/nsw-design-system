import {
  createPattern,
  defaultNswInkIndex,
  getNswChartPalette,
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
    const textDark = palette.grey01
    const chartLayoutPadding = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }

    const publicSansFontFamily = "'Public Sans', Arial, sans-serif"

    Chart.defaults.font.family = publicSansFontFamily
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
    Chart.defaults.plugins.legend.labels.boxWidth = 12
    Chart.defaults.plugins.legend.labels.boxHeight = 12
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 12
    Chart.defaults.plugins.legend.labels.padding = 10
    Chart.defaults.plugins.legend.labels.color = palette.grey01
    Chart.defaults.plugins.legend.labels.font = {
      family: publicSansFontFamily,
      size: 12,
      weight: 500,
    }
    Chart.defaults.plugins.title = Chart.defaults.plugins.title || {}
    Chart.defaults.plugins.title.font = {
      family: publicSansFontFamily,
      size: 16,
      weight: 700,
    }
    Chart.defaults.plugins.title.padding = {
      top: 8,
      bottom: 24,
    }
    Chart.defaults.plugins.title.align = 'start'
    Chart.defaults.plugins.legend.onClick = () => {}
    Chart.defaults.layout = Chart.defaults.layout || {}
    Chart.defaults.layout.padding = chartLayoutPadding
    if (Chart.defaults.scale) {
      Chart.defaults.scale.grid.color = palette.grey04
      Chart.defaults.scale.grid.borderColor = palette.grey03
      Chart.defaults.scale.grid.drawBorder = true
      Chart.defaults.scale.ticks.color = palette.grey02
      Chart.defaults.scale.ticks.font = {
        family: publicSansFontFamily,
        size: 12,
      }
      Chart.defaults.scale.ticks.padding = 6
      Chart.defaults.scale.title = Chart.defaults.scale.title || {}
      Chart.defaults.scale.title.font = {
        family: publicSansFontFamily,
        size: 13,
        weight: 500,
      }
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

    const toPaddingObject = (padding) => {
      if (Number.isFinite(padding)) {
        return {
          top: padding,
          right: padding,
          bottom: padding,
          left: padding,
        }
      }

      const value = padding || {}
      return {
        top: Number.isFinite(value.top) ? value.top : 0,
        right: Number.isFinite(value.right) ? value.right : 0,
        bottom: Number.isFinite(value.bottom) ? value.bottom : 0,
        left: Number.isFinite(value.left) ? value.left : 0,
      }
    }

    const mergePadding = (basePadding, extraPadding) => {
      const base = toPaddingObject(basePadding)
      const extra = toPaddingObject(extraPadding)
      return {
        top: base.top + extra.top,
        right: base.right + extra.right,
        bottom: base.bottom + extra.bottom,
        left: base.left + extra.left,
      }
    }

    const formatCompactNumber = (value) => {
      if (!Number.isFinite(value)) return ''
      if (Math.abs(value) >= 100 || Number.isInteger(value)) return `${Math.round(value)}`
      return `${Number(value.toFixed(1))}`
    }

    const wrapTickLabel = (value, maxCharsPerLine = 24) => {
      const text = typeof value === 'string' ? value.trim() : `${value || ''}`.trim()
      if (!text) return ''
      if (text.length <= maxCharsPerLine) return text

      const words = text.split(/\s+/)
      const lines = []
      let currentLine = words.shift() || ''

      words.forEach((word) => {
        if ((`${currentLine} ${word}`).length <= maxCharsPerLine) {
          currentLine = `${currentLine} ${word}`
          return
        }
        lines.push(currentLine)
        currentLine = word
      })

      if (currentLine) lines.push(currentLine)
      return lines
    }

    const toCanvasFont = (fontOptions = {}) => {
      const style = fontOptions.style || 'normal'
      const weight = fontOptions.weight || 400
      const size = fontOptions.size || 12
      const family = fontOptions.family || publicSansFontFamily
      return `${style} ${weight} ${size}px ${family}`
    }

    const normaliseDirectLabelLines = (value) => {
      if (Array.isArray(value)) {
        return value
          .filter((line) => line != null && line !== '')
          .map((line) => `${line}`)
      }

      if (value == null || value === '') return []
      return [`${value}`]
    }

    const directSegmentLabelsPlugin = {
      id: 'nswDirectLabels',
      afterDatasetsDraw: (chart, _args, pluginOptions = {}) => {
        if (pluginOptions.display === false) return
        if (!['pie', 'doughnut'].includes(chart.config.type)) return

        const datasetIndex = Number.isInteger(pluginOptions.datasetIndex)
          ? pluginOptions.datasetIndex
          : 0
        const dataset = chart.data.datasets[datasetIndex]
        const meta = chart.getDatasetMeta(datasetIndex)
        if (!dataset || !meta || meta.hidden || !meta.data || !meta.data.length) return

        const total = dataset.data.reduce((sum, entry) => {
          const value = Number(entry)
          return Number.isFinite(value) ? sum + value : sum
        }, 0)
        if (total <= 0) return

        const { ctx } = chart
        const labelFontOptions = {
          family: publicSansFontFamily,
          size: 12,
          weight: 600,
          ...pluginOptions.labelFont,
        }
        const valueFontOptions = {
          family: publicSansFontFamily,
          size: 12,
          weight: 400,
          ...pluginOptions.valueFont,
        }
        const labelFont = toCanvasFont(labelFontOptions)
        const valueFont = toCanvasFont(valueFontOptions)
        const labelLineHeight = Number.isFinite(pluginOptions.labelLineHeight)
          ? pluginOptions.labelLineHeight
          : 14
        const valueLineHeight = Number.isFinite(pluginOptions.valueLineHeight)
          ? pluginOptions.valueLineHeight
          : 14
        const lineGap = Number.isFinite(pluginOptions.lineGap) ? pluginOptions.lineGap : 2
        const minGap = Number.isFinite(pluginOptions.minGap) ? pluginOptions.minGap : 10
        const radialOffset = Number.isFinite(pluginOptions.radialOffset)
          ? pluginOptions.radialOffset
          : 18
        const canvasMargin = Number.isFinite(pluginOptions.canvasMargin)
          ? pluginOptions.canvasMargin
          : 14
        const labelPadding = Number.isFinite(pluginOptions.labelPadding)
          ? pluginOptions.labelPadding
          : 8
        const leaderLineWidth = Number.isFinite(pluginOptions.leaderLineWidth)
          ? pluginOptions.leaderLineWidth
          : 1.5
        const labels = Array.isArray(chart.data.labels) ? chart.data.labels : []
        const itemsBySide = {
          left: [],
          right: [],
        }

        meta.data.forEach((arc, dataIndex) => {
          const value = Number(dataset.data[dataIndex])
          if (!Number.isFinite(value) || value <= 0) return

          const percentage = (value / total) * 100
          const label = labels[dataIndex] || `Segment ${dataIndex + 1}`
          const lines = normaliseDirectLabelLines(
            typeof pluginOptions.formatter === 'function'
              ? pluginOptions.formatter({
                chart,
                dataset,
                datasetIndex,
                dataIndex,
                label,
                total,
                value,
                percentage,
              })
              : [label, `${formatCompactNumber(percentage)}%`],
          )
          if (!lines.length) return

          const startAngle = Number.isFinite(arc.startAngle) ? arc.startAngle : 0
          const endAngle = Number.isFinite(arc.endAngle) ? arc.endAngle : 0
          const midAngle = (startAngle + endAngle) / 2
          const side = Math.cos(midAngle) >= 0 ? 'right' : 'left'
          const outerRadius = Number.isFinite(arc.outerRadius) ? arc.outerRadius : 0
          const anchorRadius = outerRadius + 4
          const elbowRadius = outerRadius + radialOffset
          const x = Number.isFinite(arc.x) ? arc.x : chart.width / 2
          const y = Number.isFinite(arc.y) ? arc.y : chart.height / 2

          const measureLineWidth = (line, index) => {
            ctx.font = index === 0 ? labelFont : valueFont
            return ctx.measureText(line).width
          }

          const textWidth = lines.reduce((max, line, index) => (
            Math.max(max, measureLineWidth(line, index))
          ), 0)
          const textHeight = lines.reduce((height, _line, index) => (
            height + (index === 0 ? labelLineHeight : valueLineHeight)
          ), 0) + (lines.length > 1 ? lineGap * (lines.length - 1) : 0)

          itemsBySide[side].push({
            side,
            lines,
            textWidth,
            textHeight,
            targetY: y + (Math.sin(midAngle) * elbowRadius),
            anchorX: x + (Math.cos(midAngle) * anchorRadius),
            anchorY: y + (Math.sin(midAngle) * anchorRadius),
            elbowX: x + (Math.cos(midAngle) * elbowRadius),
            elbowY: y + (Math.sin(midAngle) * elbowRadius),
          })
        })

        const clampLabelsWithinCanvas = (items) => {
          if (!items.length) return []

          const minY = canvasMargin
          const maxY = chart.height - canvasMargin
          const sortedItems = [...items]
            .sort((leftItem, rightItem) => leftItem.targetY - rightItem.targetY)
            .map((item) => ({
              ...item,
              resolvedY: item.targetY,
            }))

          let cursorTop = minY - minGap
          sortedItems.forEach((item, index) => {
            const halfHeight = item.textHeight / 2
            const resolvedY = Math.max(item.targetY, cursorTop + minGap + halfHeight)
            sortedItems[index] = {
              ...item,
              resolvedY,
            }
            cursorTop = resolvedY + halfHeight
          })

          let cursorBottom = maxY + minGap
          for (let index = sortedItems.length - 1; index >= 0; index -= 1) {
            const item = sortedItems[index]
            const halfHeight = item.textHeight / 2
            const resolvedY = Math.min(item.resolvedY, cursorBottom - minGap - halfHeight)
            sortedItems[index] = {
              ...item,
              resolvedY,
            }
            cursorBottom = resolvedY - halfHeight
          }

          cursorTop = minY - minGap
          sortedItems.forEach((item, index) => {
            const halfHeight = item.textHeight / 2
            const resolvedY = Math.max(item.resolvedY, cursorTop + minGap + halfHeight)
            sortedItems[index] = {
              ...item,
              resolvedY,
            }
            cursorTop = resolvedY + halfHeight
          })

          return sortedItems
        }

        itemsBySide.left = clampLabelsWithinCanvas(itemsBySide.left)
        itemsBySide.right = clampLabelsWithinCanvas(itemsBySide.right)

        ctx.save()
        ctx.strokeStyle = pluginOptions.lineColor || palette.grey02
        ctx.lineWidth = leaderLineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.textBaseline = 'top'

        Object.values(itemsBySide).forEach((items) => {
          items.forEach((item) => {
            const lineEndX = item.side === 'right'
              ? chart.width - canvasMargin - item.textWidth - labelPadding
              : canvasMargin + item.textWidth + labelPadding

            ctx.beginPath()
            ctx.moveTo(item.anchorX, item.anchorY)
            ctx.lineTo(item.elbowX, item.elbowY)
            ctx.lineTo(lineEndX, item.resolvedY)
            ctx.stroke()

            ctx.textAlign = item.side === 'right' ? 'left' : 'right'
            const textX = item.side === 'right'
              ? lineEndX + labelPadding
              : lineEndX - labelPadding

            let lineY = item.resolvedY - (item.textHeight / 2)
            item.lines.forEach((line, index) => {
              ctx.font = index === 0 ? labelFont : valueFont
              ctx.fillStyle = index === 0
                ? (pluginOptions.labelColor || textDark)
                : (pluginOptions.valueColor || textDark)
              ctx.fillText(line, textX, lineY)
              lineY += index === 0 ? labelLineHeight + lineGap : valueLineHeight + lineGap
            })
          })
        })

        ctx.restore()
      },
    }

    const getDatasetColor = (value) => {
      if (Array.isArray(value)) return value[0]
      return value
    }

    const isTrianglePointStyle = (pointStyle) => pointStyle === 'triangle'

    const legendTrianglePointStyles = new Map()

    const getLegendTrianglePointStyle = (color) => {
      const cacheKey = typeof color === 'string' ? color : palette.blue02
      if (legendTrianglePointStyles.has(cacheKey)) {
        return legendTrianglePointStyles.get(cacheKey)
      }

      const size = 14
      const symbol = document.createElement('canvas')
      symbol.width = size
      symbol.height = size
      const context = symbol.getContext('2d')
      if (context) {
        context.clearRect(0, 0, size, size)
        context.fillStyle = cacheKey
        context.beginPath()
        context.moveTo(size / 2, 0.5)
        context.lineTo(size - 0.5, size - 1)
        context.lineTo(0.5, size - 1)
        context.closePath()
        context.fill()
      }

      legendTrianglePointStyles.set(cacheKey, symbol)
      return symbol
    }

    const pointStyleLegendLabels = (chart) => {
      const defaults = Chart.defaults.plugins.legend.labels.generateLabels(chart)
      return defaults.map((item) => {
        const dataset = chart.data.datasets[item.datasetIndex] || {}
        const datasetType = dataset.type || chart.config.type
        if (!['line', 'bar', 'radar', 'scatter', 'bubble'].includes(datasetType)) return item

        const pointBorderColor = getDatasetColor(dataset.pointBorderColor)
        const borderColor = getDatasetColor(dataset.borderColor)
        const pointBackgroundColor = getDatasetColor(dataset.pointBackgroundColor)
        const backgroundColor = getDatasetColor(dataset.backgroundColor)
        const fillStyle = borderColor || pointBackgroundColor || backgroundColor || pointBorderColor || item.fillStyle

        const pointStyle = dataset.pointStyle || (datasetType === 'bar' ? 'rect' : 'circle')
        const legendPointStyle = isTrianglePointStyle(pointStyle)
          ? getLegendTrianglePointStyle(fillStyle)
          : pointStyle

        return {
          ...item,
          pointStyle: legendPointStyle,
          fillStyle,
          strokeStyle: fillStyle,
          lineWidth: 0,
        }
      })
    }

    const toHeadingText = (value) => {
      if (Array.isArray(value)) return value.join(' ')
      return typeof value === 'string' ? value : ''
    }

    const splitTrailingBracketedText = (value) => {
      if (!value) {
        return {
          heading: '',
          bracketed: '',
        }
      }

      const match = value.match(/^(.*)\s+\(([^()]*)\)\s*$/)
      if (!match) {
        return {
          heading: value.trim(),
          bracketed: '',
        }
      }

      return {
        heading: match[1].trim(),
        bracketed: match[2].trim(),
      }
    }

    const createChart = (canvasId, config) => {
      const canvas = document.getElementById(canvasId)
      if (!canvas) return
      if (!canvas.hasAttribute('tabindex')) {
        canvas.setAttribute('tabindex', '0')
      }
      canvas.classList.add('nsw-docs__chart-canvas')
      canvas.style.backgroundColor = canvas.dataset.chartBg === 'none' ? 'transparent' : '#FFFFFF'

      const options = config && config.options ? config.options : {}
      const plugins = options.plugins || {}
      const legend = plugins.legend || {}
      const layout = options.layout || {}
      const title = plugins.title || {}
      const subtitle = plugins.subtitle || {}
      const callout = plugins.callout || {}
      const directLabels = plugins.nswDirectLabels || {}
      const useDirectLabels = ['pie', 'doughnut'].includes(config.type) && directLabels.display === true
      const directLabelLayoutPadding = directLabels.layoutPadding || {
        top: 20,
        right: 56,
        bottom: 20,
        left: 56,
      }
      const chartHeight = canvas.dataset.chartHeight || canvas.getAttribute('height')
      const hasExplicitChartHeight = Boolean(chartHeight)
      const chartPlugins = Array.isArray(config.plugins) ? [...config.plugins] : []
      const host = canvas.parentElement
      if (!host) return
      let chartPanel = canvas.closest('.nsw-docs__chart-panel')

      if (!chartPanel || chartPanel.parentElement !== host) {
        chartPanel = document.createElement('div')
        chartPanel.className = 'nsw-docs__chart-panel'
        host.insertBefore(chartPanel, canvas)
      }

      const isRadialChart = ['pie', 'doughnut', 'radar'].includes(config.type)
      chartPanel.classList.toggle('nsw-docs__chart-panel--radial', isRadialChart)

      let plot = chartPanel.querySelector('.nsw-docs__chart-panel-plot')
      if (!plot) {
        plot = document.createElement('div')
        plot.className = 'nsw-docs__chart-panel-plot'
        chartPanel.appendChild(plot)
      }

      if (chartPanel) {
        const existingHeader = chartPanel.querySelector('.nsw-docs__chart-panel-header')
        if (existingHeader) existingHeader.remove()

        const rawTitleText = toHeadingText(title.text)
        const rawSubtitleText = toHeadingText(subtitle.text)
        const splitTitle = splitTrailingBracketedText(rawTitleText)
        const inferredSubtitleText = !rawSubtitleText ? splitTitle.bracketed : ''
        const titleText = splitTitle.heading
        const subtitleText = rawSubtitleText || inferredSubtitleText
        const calloutValue = toHeadingText(callout.value)
        const calloutContext = toHeadingText(callout.context)
        const calloutItems = Array.isArray(callout.items)
          ? callout.items
            .map((item) => ({
              label: toHeadingText(item && item.label),
              value: toHeadingText(item && item.value),
            }))
            .filter((item) => item.label || item.value)
          : []
        const hasTitle = title.display === true && titleText
        const hasSubtitle = Boolean(subtitleText) && (
          subtitle.display === true || Boolean(inferredSubtitleText)
        )
        const hasCalloutValue = callout.display === true && calloutValue
        const hasCalloutItems = callout.display === true && calloutItems.length > 0
        const hasCallout = hasCalloutValue || hasCalloutItems

        if (hasTitle || hasSubtitle || hasCallout) {
          const heading = document.createElement('div')
          heading.className = 'nsw-docs__chart-panel-header'

          const appendHeadingText = (target) => {
            if (hasTitle) {
              const headingTitle = document.createElement('p')
              headingTitle.className = 'nsw-docs__chart-panel-title'
              headingTitle.textContent = titleText
              target.appendChild(headingTitle)
            }

            if (hasSubtitle) {
              const headingSubtitle = document.createElement('p')
              headingSubtitle.className = 'nsw-docs__chart-panel-subtitle'
              headingSubtitle.textContent = subtitleText
              target.appendChild(headingSubtitle)
            }

            if (hasCalloutValue) {
              const headingCallout = document.createElement('p')
              headingCallout.className = 'nsw-docs__chart-panel-callout-value'
              headingCallout.textContent = calloutValue
              target.appendChild(headingCallout)

              if (calloutContext) {
                const headingCalloutContext = document.createElement('p')
                headingCalloutContext.className = 'nsw-docs__chart-panel-callout-context'
                headingCalloutContext.textContent = calloutContext
                target.appendChild(headingCalloutContext)
              }
            }
          }

          if (hasCalloutItems) {
            heading.classList.add('nsw-docs__chart-panel-header--split')

            const headingMain = document.createElement('div')
            headingMain.className = 'nsw-docs__chart-panel-header-main'
            appendHeadingText(headingMain)
            if (headingMain.childElementCount > 0) {
              heading.appendChild(headingMain)
            }

            const headingCalloutGrid = document.createElement('div')
            headingCalloutGrid.className = 'nsw-docs__chart-panel-callout-grid'

            calloutItems.forEach((item) => {
              const headingCalloutItem = document.createElement('div')
              headingCalloutItem.className = 'nsw-docs__chart-panel-callout-item'

              if (item.label) {
                const headingCalloutLabel = document.createElement('p')
                headingCalloutLabel.className = 'nsw-docs__chart-panel-callout-label'
                headingCalloutLabel.textContent = item.label
                headingCalloutItem.appendChild(headingCalloutLabel)
              }

              if (item.value) {
                const headingCalloutValue = document.createElement('p')
                headingCalloutValue.className = 'nsw-docs__chart-panel-callout-value'
                headingCalloutValue.textContent = item.value
                headingCalloutItem.appendChild(headingCalloutValue)
              }

              headingCalloutGrid.appendChild(headingCalloutItem)
            })

            heading.appendChild(headingCalloutGrid)
          } else {
            appendHeadingText(heading)
          }

          chartPanel.insertBefore(heading, plot)
        }
      }

      if (canvas.parentElement !== plot) {
        plot.appendChild(canvas)
      }

      if (hasExplicitChartHeight) {
        plot.style.height = /^\d+(\.\d+)?$/.test(chartHeight) ? `${chartHeight}px` : chartHeight
      } else {
        plot.style.height = ''
      }

      canvas.style.height = '100%'
      if (Chart.getChart && Chart.getChart(canvas)) return

      if (useDirectLabels && !chartPlugins.includes(directSegmentLabelsPlugin)) {
        chartPlugins.push(directSegmentLabelsPlugin)
      }

      const sourceData = config && config.data ? config.data : {}
      const sourceDatasets = Array.isArray(sourceData.datasets) ? sourceData.datasets : []
      const normalisedDatasets = sourceDatasets.map((dataset) => {
        const datasetType = dataset && dataset.type ? dataset.type : config.type
        if (!['line', 'radar'].includes(datasetType)) return dataset

        const pointStyle = dataset.pointStyle || 'circle'
        const trianglePointStyle = isTrianglePointStyle(pointStyle)
        const basePointRadius = Number.isFinite(dataset.pointRadius) ? dataset.pointRadius : 6
        const basePointHoverRadius = Number.isFinite(dataset.pointHoverRadius)
          ? dataset.pointHoverRadius
          : basePointRadius + 2
        const basePointHitRadius = Number.isFinite(dataset.pointHitRadius)
          ? dataset.pointHitRadius
          : 4
        const triangleRadiusOffset = trianglePointStyle && datasetType === 'radar' ? 2 : 0

        return {
          ...dataset,
          pointRadius: basePointRadius + triangleRadiusOffset,
          pointHoverRadius: basePointHoverRadius + triangleRadiusOffset,
          pointHitRadius: basePointHitRadius + triangleRadiusOffset,
        }
      })

      new Chart(canvas, {
        ...config,
        data: {
          ...sourceData,
          datasets: normalisedDatasets,
        },
        plugins: chartPlugins,
        options: {
          responsive: options.responsive !== false,
          maintainAspectRatio: Object.prototype.hasOwnProperty.call(options, 'maintainAspectRatio')
            ? options.maintainAspectRatio
            : !hasExplicitChartHeight,
          ...options,
          layout: {
            ...layout,
            padding: useDirectLabels
              ? mergePadding(layout.padding, directLabelLayoutPadding)
              : layout.padding,
          },
          plugins: {
            ...plugins,
            nswDirectLabels: {
              display: useDirectLabels,
              ...directLabels,
            },
            legend: {
              ...legend,
              display: useDirectLabels ? false : legend.display,
              onClick: () => {},
            },
            title: {
              ...title,
              display: false,
            },
            subtitle: {
              ...subtitle,
              display: false,
            },
            callout: {
              ...callout,
              display: false,
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
          nswDirectLabels: {
            display: false,
          },
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
          nswDirectLabels: {
            display: false,
          },
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
          backgroundColor: (context) => [
            palette.red01, palette.red02, palette.purple01, palette.purple02,
          ][context.dataIndex],
        }],
      },
      options: {
        plugins: {
          nswDirectLabels: {
            display: true,
            layoutPadding: {
              top: 20,
              right: 56,
              bottom: 20,
              left: 56,
            },
          },
          title: {
            display: true,
            text: 'Service channel share (Q2 2025, percent)',
            fullSize: true,
            align: 'start',
            font: {
              size: 15,
              weight: 700,
            },
            padding: {
              top: 8,
              bottom: 30,
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

    const anatomyResolvedEarlyData = [410, 438, 467, 492, 525, 508]
    const anatomyResolvedLateData = [72, 68, 74, 70, 66, 61]
    const anatomyResolvedEarlyTotal = anatomyResolvedEarlyData.reduce(
      (total, value) => total + value,
      0,
    )
    const anatomyResolvedLateTotal = anatomyResolvedLateData.reduce(
      (total, value) => total + value,
      0,
    )

    createChart('chartAnatomy', {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Resolved on time',
            data: anatomyResolvedEarlyData,
            backgroundColor: palette.blue01,
          },
          {
            label: 'Resolved late',
            data: anatomyResolvedLateData,
            backgroundColor: palette.blue02,
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
            text: 'Service requests by type',
            padding: {
              top: 8,
              bottom: 8,
            },
          },
          subtitle: {
            display: true,
            text: 'Number of requests (000s)',
          },
          callout: {
            display: true,
            items: [
              {
                label: 'Resolved early',
                value: anatomyResolvedEarlyTotal.toLocaleString('en-AU'),
              },
              {
                label: 'Resolved late',
                value: anatomyResolvedLateTotal.toLocaleString('en-AU'),
              },
            ],
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
        labels: ['City of Sydney', 'Parramatta', 'Blacktown', 'Liverpool', 'Penrith', 'Camden'],
        datasets: [{
          label: 'Applications assessed',
          data: [312, 284, 251, 198, 176, 143],
          backgroundColor: palette.blue01,
          barThickness: 34,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Development applications assessed',
          },
          subtitle: {
            display: true,
            text: 'By local government area, January to March 2025',
          },
        },
        scales: {
          x: {
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    createChart('chartCompBarHorizontal', {
      type: 'bar',
      data: {
        labels: [
          'Rental Assistance for Vulnerable Households',
          'Small Business Digital Transformation Grant',
          'Regional Infrastructure Maintenance Program',
          'Early Childhood Development Support Initiative',
          'Aboriginal Community Housing Improvement Fund',
          'Domestic Violence Crisis Response Program',
        ].map((label) => wrapTickLabel(label)),
        datasets: [{
          label: 'Funding ($M)',
          data: [48.2, 31.6, 27.4, 22.8, 18.3, 14.7],
          backgroundColor: palette.blue01,
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
            text: 'Programme funding allocations',
          },
          subtitle: {
            display: true,
            text: 'By programme, 2024-25 ($M)',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
          },
        },
      },
    })

    createChart('chartPropStacked', {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Phone',
          data: [4200, 3900, 3600, 3200],
          backgroundColor: palette.blue01,
          barThickness: 56,
        }, {
          label: 'Digital',
          data: [5800, 6400, 7100, 8200],
          backgroundColor: (context) => getPatternFill(context, 'diagonal', palette.blue02, {
            svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
            size: 8,
          }),
          barThickness: 56,
        }, {
          label: 'In person',
          data: [1100, 980, 890, 760],
          backgroundColor: palette.red01,
          barThickness: 56,
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
            suggestedMax: 14000,
            ticks: {
              stepSize: 2000,
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Support requests by contact type',
          },
          subtitle: {
            display: true,
            text: 'Volume by channel, 2024-25 financial year',
          },
        },
      },
    })

    createChart('chartCompGroupedHorizontal', {
      type: 'bar',
      data: {
        labels: [
          'Contractor licence -- building',
          'Contractor licence -- electrical',
          'Supervisor certificate',
          'Tradesperson certificate',
          'Owner-builder permit',
        ].map((label) => wrapTickLabel(label)),
        datasets: [{
          label: 'Lodged',
          data: [1840, 1210, 980, 760, 430],
          backgroundColor: palette.blue01,
        }, {
          label: 'Approved',
          data: [1620, 1090, 870, 690, 380],
          backgroundColor: (context) => getPatternFill(context, 'diagonal', palette.blue02, {
            svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
            size: 8,
          }),
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
            text: 'Licence applications lodged and approved',
          },
          subtitle: {
            display: true,
            text: 'By category, January to June 2025',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
          },
        },
      },
    })

    createChart('chartTrendLine', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Incidents',
          data: [3240, 2980, 3100, 2760, 2640, 2580, 2490, 2520, 2710, 2890, 3040, 3380],
          borderColor: palette.blue01,
          backgroundColor: palette.blue01,
          pointRadius: 6,
          pointStyle: 'circle',
          pointBackgroundColor: palette.blue01,
          pointBorderColor: palette.white,
          pointBorderWidth: 2,
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
            text: 'Road incident reports',
          },
          subtitle: {
            display: true,
            text: 'NSW monthly total, January to December 2024',
          },
        },
        scales: {
          x: {
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    createChart('chartTrendMultiLine', {
      type: 'line',
      data: {
        labels: ['Jul 2024', 'Jan 2025', 'Jun 2025'],
        datasets: [{
          label: 'Web',
          data: [42000, 48000, 51000],
          borderColor: palette.blue01,
          backgroundColor: palette.blue01,
          pointRadius: 6,
          pointStyle: 'circle',
          pointBackgroundColor: palette.blue01,
          pointBorderColor: palette.white,
          pointBorderWidth: 2,
          borderWidth: 2,
          borderDash: [],
          tension: 0.25,
        }, {
          label: 'App',
          data: [18000, 24000, 31000],
          borderColor: palette.blue02,
          backgroundColor: palette.blue02,
          pointRadius: 8,
          pointStyle: 'triangle',
          pointBackgroundColor: palette.blue02,
          pointBorderColor: palette.white,
          pointBorderWidth: 2,
          borderWidth: 2,
          borderDash: [8, 6],
          tension: 0.25,
        }, {
          label: 'Assisted digital',
          data: [6200, 5400, 4100],
          borderColor: palette.red01,
          backgroundColor: palette.red01,
          pointRadius: 7,
          pointStyle: 'rectRot',
          pointBackgroundColor: palette.red01,
          pointBorderColor: palette.white,
          pointBorderWidth: 2,
          borderWidth: 2,
          borderDash: [2, 6],
          tension: 0.25,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyleWidth: 12,
              boxWidth: 12,
              boxHeight: 12,
              generateLabels: pointStyleLegendLabels,
            },
          },
          title: {
            display: true,
            text: 'Online service transactions by channel',
          },
          subtitle: {
            display: true,
            text: 'Monthly volume, July 2024 to June 2025',
          },
        },
        scales: {
          x: {
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    createChart('chartTrendArea', {
      type: 'line',
      data: {
        labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Cumulative total',
          data: [12.4, 28.7, 41.2, 58.9, 74.3, 89.1],
          borderColor: palette.blue01,
          backgroundColor: withAlpha(palette.blue01, 0.2),
          fill: true,
          pointRadius: 6,
          pointStyle: 'circle',
          pointBackgroundColor: palette.blue01,
          pointBorderColor: palette.white,
          pointBorderWidth: 2,
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
            text: 'Grant funding disbursed',
          },
          subtitle: {
            display: true,
            text: 'Running total by month, July to December 2024',
          },
        },
        scales: {
          x: {
          },
          y: {
            beginAtZero: true,
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
          label: 'Visits',
          data: [18400, 16200, 19100, 17800, 20400, 21200],
          yAxisID: 'y',
          backgroundColor: palette.blue01,
          order: 2,
        }, {
          type: 'line',
          label: 'Average wait time',
          data: [12, 10, 14, 11, 16, 18],
          yAxisID: 'y1',
          borderColor: palette.blue02,
          backgroundColor: palette.blue02,
          borderWidth: 2,
          pointRadius: 6,
          pointStyle: 'circle',
          pointBackgroundColor: palette.blue02,
          pointBorderColor: palette.white,
          pointBorderWidth: 2,
          tension: 0.25,
          order: 1,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyleWidth: 12,
              boxWidth: 12,
              boxHeight: 12,
              generateLabels: pointStyleLegendLabels,
            },
          },
          title: {
            display: true,
            text: 'Service centre visits and average wait time',
          },
          subtitle: {
            display: true,
            text: 'Monthly comparison, January to June 2025',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Visits (count)',
            },
          },
          y1: {
            beginAtZero: true,
            max: 24,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'Average wait time (minutes)',
            },
          },
        },
      },
    })

    createChart('chartTrendStackedArea', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Standard',
          data: [200, 230, 300, 330, 520, 600],
          borderColor: palette.green01,
          backgroundColor: palette.green04,
          fill: 'origin',
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
          borderDash: [],
          tension: 0.25,
          stack: 'stackedArea',
          order: 1,
        }, {
          label: 'High',
          data: [540, 620, 640, 680, 690, 700],
          borderColor: palette.blue01,
          backgroundColor: palette.blue04,
          fill: '-1',
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
          borderDash: [],
          tension: 0.25,
          stack: 'stackedArea',
          order: 2,
        }, {
          label: 'Critical',
          data: [80, 90, 95, 120, 135, 150],
          borderColor: palette.red01,
          backgroundColor: palette.red04,
          fill: '-1',
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
          borderDash: [],
          tension: 0.25,
          stack: 'stackedArea',
          order: 3,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyleWidth: 12,
              boxWidth: 12,
              boxHeight: 12,
              generateLabels: pointStyleLegendLabels,
            },
          },
          title: {
            display: true,
            text: 'Support cases open by priority level',
          },
          subtitle: {
            display: true,
            text: 'Cumulative open cases, January to June 2025',
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            beginAtZero: true,
            stacked: true,
            max: 1500,
            ticks: {
              stepSize: 300,
            },
          },
        },
      },
    })

    createChart('chartPropDoughnut', {
      type: 'doughnut',
      data: {
        labels: ['Resolved on first contact', 'Escalated'],
        datasets: [{
          data: [78, 22],
          backgroundColor: (context) => {
            if (context.dataIndex === 1) {
              return getPatternFill(context, 'diagonal', palette.red01, {
                svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
                size: 8,
              })
            }
            return [palette.blue01, palette.red01][context.dataIndex]
          },
        }],
      },
      options: {
        aspectRatio: 1.4,
        radius: '86%',
        cutout: '58%',
        plugins: {
          nswDirectLabels: {
            display: true,
            layoutPadding: {
              top: 20,
              right: 84,
              bottom: 20,
              left: 56,
            },
            formatter: ({ label, percentage }) => {
              if (label === 'Resolved on first contact') {
                return ['Resolved on first', 'contact', `${formatCompactNumber(percentage)}%`]
              }
              return [label, `${formatCompactNumber(percentage)}%`]
            },
          },
          title: {
            display: true,
            text: 'Service requests resolved on first contact',
          },
          subtitle: {
            display: true,
            text: 'Share of total requests, Q2 2025. Total: 14,820 requests.',
            fullSize: true,
            align: 'start',
            font: {
              size: 13,
              weight: 400,
            },
            padding: {
              top: 0,
              bottom: 12,
            },
          },
          legend: {
            display: false,
            fullSize: true,
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
          backgroundColor: (context) => [
            palette.blue01,
            palette.blue02,
            palette.red01,
            palette.red02,
          ][context.dataIndex],
        }],
      },
      options: {
        aspectRatio: 1.4,
        radius: '86%',
        plugins: {
          nswDirectLabels: {
            display: true,
            layoutPadding: {
              top: 20,
              right: 56,
              bottom: 20,
              left: 56,
            },
          },
          title: {
            display: true,
            text: 'Service request channel share',
          },
          subtitle: {
            display: true,
            text: 'Q2 2025',
            fullSize: true,
            align: 'start',
            font: {
              size: 13,
              weight: 400,
            },
            padding: {
              top: 0,
              bottom: 12,
            },
          },
          legend: {
            display: false,
            fullSize: true,
          },
        },
      },
    })

    createChart('chartPropStackedProportional', {
      type: 'bar',
      data: {
        labels: ['Metro', 'Hunter', 'Illawarra', 'Western NSW'],
        datasets: [{
          label: 'Resolved',
          data: [74, 71, 68, 65],
          backgroundColor: palette.blue01,
        }, {
          label: 'Escalated',
          data: [18, 20, 22, 24],
          backgroundColor: (context) => getPatternFill(context, 'diagonal', palette.blue02, {
            svgUrl: '/assets/images/chart-pattern-diagonal-lines.svg',
            size: 8,
          }),
        }, {
          label: 'Withdrawn',
          data: [8, 9, 10, 11],
          backgroundColor: palette.red01,
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
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value) => `${value}%`,
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Complaint outcomes by region',
          },
          subtitle: {
            display: true,
            text: 'Percentage share, January to June 2025',
          },
        },
      },
    })

    createChart('chartDistScatter', {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Applications',
            data: [
              { x: 18, y: 3.8 },
              { x: 22, y: 4.5 },
              { x: 26, y: 4.9 },
              { x: 31, y: 6.2 },
              { x: 38, y: 7.4 },
              { x: 45, y: 8.9 },
              { x: 52, y: 10.8 },
              { x: 58, y: 12.6 },
              { x: 62, y: 14.2 },
              { x: 69, y: 16.4 },
              { x: 74, y: 17.9 },
              { x: 79, y: 19.1 },
              { x: 86, y: 22.0 },
            ],
            backgroundColor: withAlpha(palette.blue01, 0.8),
            borderColor: palette.blue01,
            pointRadius: 6,
            borderWidth: 2,
            pointStyle: 'circle',
            pointBackgroundColor: withAlpha(palette.blue01, 0.8),
            pointBorderColor: palette.blue01,
            pointBorderWidth: 2,
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
            display: false,
          },
          title: {
            display: true,
            text: 'Application complexity and processing time',
          },
          subtitle: {
            display: true,
            text: 'Individual applications, Q1 2025',
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
            },
          },
          y: {
            min: 0,
            max: 24,
            ticks: {
              stepSize: 4,
            },
          },
        },
      },
    })

    createChart('chartDistBubble', {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Locations',
          data: [
            { x: 42, y: 9, r: 14 },
            { x: 51, y: 11, r: 12 },
            { x: 57, y: 13, r: 11 },
            { x: 63, y: 15, r: 10 },
            { x: 68, y: 17, r: 9 },
            { x: 74, y: 19, r: 8 },
          ],
          backgroundColor: withAlpha(palette.blue01, 0.75),
          borderColor: palette.blue01,
          pointRadius: 5,
          borderWidth: 2,
          pointBackgroundColor: withAlpha(palette.blue01, 0.75),
          pointBorderColor: palette.blue01,
          pointBorderWidth: 2,
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
            display: false,
          },
          title: {
            display: true,
            text: 'Application complexity, processing time and volume',
          },
          subtitle: {
            display: true,
            text: 'By location, Q1 2025',
          },
        },
        scales: {
          x: {
            min: 35,
            max: 80,
            ticks: {
              stepSize: 5,
            },
          },
          y: {
            min: 6,
            max: 22,
            ticks: {
              stepSize: 2,
            },
          },
        },
      },
    })

    createChart('chartDistDotPlot', {
      type: 'scatter',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
          label: 'Processing time observations',
          data: [
            { x: 'Mon', y: 4.1 }, { x: 'Mon', y: 5.2 }, { x: 'Mon', y: 6.0 }, { x: 'Mon', y: 7.2 },
            { x: 'Tue', y: 5.1 }, { x: 'Tue', y: 5.8 }, { x: 'Tue', y: 6.5 }, { x: 'Tue', y: 7.8 },
            { x: 'Wed', y: 6.0 }, { x: 'Wed', y: 6.9 }, { x: 'Wed', y: 7.6 }, { x: 'Wed', y: 8.9 },
            { x: 'Thu', y: 5.5 }, { x: 'Thu', y: 6.4 }, { x: 'Thu', y: 7.0 }, { x: 'Thu', y: 8.3 },
            { x: 'Fri', y: 4.8 }, { x: 'Fri', y: 5.9 }, { x: 'Fri', y: 6.7 }, { x: 'Fri', y: 7.4 },
          ],
          backgroundColor: withAlpha(palette.blue01, 0.8),
          borderColor: palette.blue01,
          borderWidth: 1.5,
          pointRadius: 6,
          pointStyle: 'circle',
          pointBackgroundColor: withAlpha(palette.blue01, 0.8),
          pointBorderColor: palette.blue01,
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
            text: 'Wait-time distribution by weekday',
          },
          subtitle: {
            display: true,
            text: 'Individual observations, Q2 2025',
          },
        },
        scales: {
          x: {
            type: 'category',
            offset: true,
            grid: {
              offset: true,
            },
            ticks: {
              autoSkip: false,
            },
          },
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
            },
          },
        },
      },
    })

    createChart('chartDistHistogram', {
      type: 'bar',
      data: {
        labels: ['0-1', '1-2', '2-3', '3-5', '5-10', '10+'],
        datasets: [{
          label: 'Number of calls',
          data: [1840, 3210, 4890, 6120, 3840, 1100],
          backgroundColor: palette.blue01,
          borderColor: palette.blue01,
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.92,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Customer call response times',
          },
          subtitle: {
            display: true,
            text: 'Distribution of call duration, March 2025',
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1000,
            },
          },
        },
      },
    })

    createChart('chartDistRadar', {
      type: 'radar',
      data: {
        labels: ['Timeliness', 'Accuracy', 'Satisfaction', 'Accessibility', 'Resolution rate'],
        datasets: [{
          label: 'Metro',
          data: [84, 91, 87, 79, 88],
          borderColor: palette.blue01,
          backgroundColor: withAlpha(palette.blue01, 0.2),
          pointBackgroundColor: palette.blue01,
          pointBorderColor: palette.blue01,
          pointStyle: 'circle',
          pointRadius: 4,
        }, {
          label: 'Regional',
          data: [76, 88, 82, 71, 80],
          borderColor: palette.blue02,
          backgroundColor: withAlpha(palette.blue02, 0.2),
          pointBackgroundColor: palette.blue02,
          pointBorderColor: palette.blue02,
          pointStyle: 'triangle',
          borderDash: [8, 6],
          pointRadius: 4,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyleWidth: 12,
              boxWidth: 12,
              boxHeight: 12,
              generateLabels: pointStyleLegendLabels,
            },
          },
          title: {
            display: true,
            text: 'Service delivery performance across five dimensions',
          },
          subtitle: {
            display: true,
            text: 'Regional comparison, 2024-25 (score out of 100)',
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: palette.grey01,
              font: {
                size: 13,
                weight: 400,
              },
              showLabelBackdrop: true,
              backdropColor: withAlpha(palette.white, 0.92),
              backdropPadding: 3,
              z: 0,
            },
            pointLabels: {
              font: {
                family: publicSansFontFamily,
                size: 12,
              },
            },
            angleLines: {
              color: palette.grey03,
              z: -1,
            },
            grid: {
              color: palette.grey04,
              z: -1,
            },
          },
        },
      },
    })
  }

  const waitForChartFonts = () => {
    if (!document.fonts || typeof document.fonts.load !== 'function') {
      return Promise.resolve()
    }

    const fontReadyPromise = Promise.all([
      document.fonts.load("400 16px 'Public Sans'"),
      document.fonts.load("600 16px 'Public Sans'"),
    ]).catch(() => {})

    // Avoid blocking charts indefinitely if a font request stalls.
    const timeoutPromise = new Promise((resolve) => {
      window.setTimeout(resolve, 1800)
    })

    return Promise.race([fontReadyPromise, timeoutPromise])
  }

  const renderChartsWhenReady = () => waitForChartFonts().then(() => {
    renderCharts()
  })

  const ensureChartJS = () => {
    if (window.Chart) {
      renderChartsWhenReady()
      return
    }
    loadScriptOnce(chartJsPrimary)
      .then(renderChartsWhenReady)
      .catch(() => loadScriptOnce(chartJsFallback).then(renderChartsWhenReady))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('Chart.js failed to load:', err)
      })
  }

  ensureChartJS()
}

initChartsAndGraphs()
