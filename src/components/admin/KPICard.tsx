import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  title: string
  value: string
  subtitle?: string
  trend?: number // percentage change, e.g. 12.5 or -3.2
  icon: ReactNode
  iconBg?: string
}

export function KPICard({ title, value, subtitle, trend, icon, iconBg = 'bg-green-100' }: Props) {
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0
  const trendNeutral = trend === 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trendPositive ? 'bg-green-50 text-green-600' :
            trendNegative ? 'bg-red-50 text-red-600' :
            'bg-gray-50 text-gray-500'
          }`}>
            {trendPositive && <TrendingUp className="w-3 h-3" />}
            {trendNegative && <TrendingDown className="w-3 h-3" />}
            {trendNeutral && <Minus className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
