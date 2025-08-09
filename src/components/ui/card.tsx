import * as React from 'react'
export const Card = ({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-2xl border bg-white ${className}`} {...props} />
)
export const CardHeader = ({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 border-b ${className}`} {...props} />
)
export const CardTitle = ({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props} />
)
export const CardDescription = ({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <p className={`text-sm text-slate-600 ${className}`} {...props} />
)
export const CardContent = ({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`} {...props} />
)
