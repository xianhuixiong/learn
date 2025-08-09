import * as React from 'react'
export const Input = ({ className='', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className}`} {...props} />
)
