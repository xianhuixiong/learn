import * as React from 'react'
type Variant = 'default' | 'outline' | 'secondary' | 'destructive'
export const Button = ({ variant='default', className='', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: Variant}) => {
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2'
  const styles: Record<Variant,string> = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50',
    secondary: 'bg-slate-100 hover:bg-slate-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />
}
