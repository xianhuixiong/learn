import * as React from 'react'
export const Badge = ({ className='', children }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`inline-flex items-center rounded-xl border px-2 py-1 text-xs ${className}`}>{children}</span>
)
