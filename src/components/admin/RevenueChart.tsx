'use client'

import { useState } from 'react'
import { formatPrice } from '@/utils/currency'

interface DataPoint {
  date: string
  revenue: number
  orders: number
}

interface Props {
  data: DataPoint[]
}

export function RevenueChart({ data }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No data for this period
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const chartHeight = 180
  const chartWidth = 100 // percentage

  return (
    <div className="relative">
      {/* Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 whitespace-nowrap">
          <p className="font-semibold">{data[hoveredIndex]!.date}</p>
          <p>Revenue: {formatPrice(data[hoveredIndex]!.revenue)}</p>
          <p>Orders: {data[hoveredIndex]!.orders}</p>
        </div>
      )}

      {/* Chart */}
      <div className="flex items-end gap-1 mt-8" style={{ height: chartHeight }}>
        {data.map((point, i) => {
          const barHeight = Math.max((point.revenue / maxRevenue) * chartHeight, 2)
          const isHovered = hoveredIndex === i
          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center gap-0.5 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-150 ${
                  isHovered ? 'bg-brand-gold' : 'bg-brand-forest/70 group-hover:bg-brand-forest'
                }`}
                style={{ height: barHeight }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels — show every 5th date */}
      <div className="flex mt-2">
        {data.map((point, i) => (
          <div key={point.date} className="flex-1 text-center">
            {i % 5 === 0 && (
              <span className="text-xs text-gray-400">
                {point.date.slice(5)} {/* MM-DD */}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-brand-forest/70 rounded-sm" />
          Revenue
        </div>
        <p className="text-gray-400">Hover a bar for details</p>
      </div>
    </div>
  )
}
