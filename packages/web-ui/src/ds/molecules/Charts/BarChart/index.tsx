'use client'
import { useCallback, useMemo } from 'react'

import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts'
import {
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

import { Text } from '../../../atoms/Text'
import { BarChartConfig, CartesianDataItem } from '../types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../atoms/Charts'
import { useMeasure } from '../../../../browser'
import { useTruncatedTick } from './useTruncatedTick'

const CustomTick = ({
  x,
  y,
  value,
  availableWidth,
}: {
  x: number
  y: number
  value: string | number
  availableWidth: number
}) => {
  const { originalText, truncatedText } = useTruncatedTick({
    text: value.toString(),
    availableWidth,
  })

  return (
    <text x={x} y={y} dy={16} textAnchor='middle'>
      <title>{originalText}</title>
      {truncatedText}
    </text>
  )
}

export function BarChart({ config }: { config: BarChartConfig }) {
  const [containerRef, dimensions] = useMeasure<HTMLDivElement>()
  const perTickWidth =
    config.data.length > 0 ? dimensions.width / config.data.length : 0

  const color = useMemo(
    () => config.color ?? 'hsl(var(--primary))',
    [config.color],
  )

  const labelFormatter = useCallback(
    (_: string, payload: Payload<ValueType, NameType>[]) => {
      const dataPayload = payload[0]!.payload as CartesianDataItem
      if (config.tooltipLabel) {
        return config.tooltipLabel(dataPayload)
      }

      return <Text.H5B>{dataPayload.label}</Text.H5B>
    },
    [config],
  )

  const tooltipFormatter = useCallback(
    (
      _value: ValueType,
      name: NameType,
      payload: Payload<ValueType, NameType>,
    ) => {
      if (name !== 'y') return null // Used to display a single content

      const item = payload.payload as CartesianDataItem
      if (config.tooltipContent) return config.tooltipContent(item)

      return (
        <div className='flex w-full flex-col gap-2'>
          <div className='flex w-full gap-2 justify-between'>
            <Text.H6B>{config.xAxis.label}</Text.H6B>
            <Text.H6>{item.x}</Text.H6>
          </div>
          <div className='flex w-full gap-2 justify-between'>
            <Text.H6B>{config.yAxis.label}</Text.H6B>
            <Text.H6>{item.y}</Text.H6>
          </div>
        </div>
      )
    },
    [config],
  )

  return (
    <ChartContainer
      ref={containerRef}
      config={{
        x: {
          label: config.xAxis.label,
        },
        y: {
          label: config.yAxis.label,
        },
      }}
    >
      <RechartsBarChart
        width={dimensions.width}
        height={dimensions.height}
        data={config.data.map((item) => ({
          x: item.x,
          y: item.y,
        }))}
        maxBarSize={50}
      >
        <XAxis
          allowDataOverflow
          dataKey='x'
          tickLine={config.xAxis.tickLine ?? false}
          axisLine={config.xAxis.axisLine ?? false}
          type={config.xAxis.type}
          unit={config.xAxis.unit}
          tickFormatter={config.xAxis.tickFormatter}
          domain={
            config.xAxis.type === 'number'
              ? [config.xAxis.min ?? 'dataMin', config.xAxis.max ?? 'dataMax']
              : undefined
          }
          offset={5}
          interval={config.xAxis.type === 'category' ? 0 : undefined}
          tick={(tick) => (
            <CustomTick
              y={tick.y}
              x={tick.x}
              value={
                tick.tickFormatter
                  ? tick.tickFormatter(tick.payload.value)
                  : tick.payload.value
              }
              availableWidth={perTickWidth}
            />
          )}
        />
        <YAxis
          dataKey='y'
          tickLine={config.yAxis.tickLine ?? false}
          axisLine={config.yAxis.axisLine ?? false}
          tickFormatter={config.yAxis.tickFormatter}
          type={config.yAxis.type}
          unit={config.yAxis.unit}
          domain={
            config.yAxis.type === 'number'
              ? [config.yAxis.min ?? 'dataMin', config.yAxis.max ?? 'dataMax']
              : undefined
          }
          offset={5}
        />
        <Bar dataKey='y' fill={color} radius={[4, 4, 0, 0]} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey='y'
              nameKey='y'
              labelFormatter={labelFormatter}
              formatter={tooltipFormatter}
            />
          }
          cursor={false}
        />
      </RechartsBarChart>
    </ChartContainer>
  )
}
