interface ProgressProps {
    value?: number
    className?: string
  }
  
  export function Progress({ value = 0, className = "" }: ProgressProps) {
    return (
      <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-600 ${className}`}>
        <div
          className="h-full bg-[#89132E] transition-all duration-200"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    )
  }
  
  