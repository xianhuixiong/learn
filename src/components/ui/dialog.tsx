import * as React from 'react'
export const Dialog = ({ open, onOpenChange, children }: { open: boolean, onOpenChange: (v:boolean)=>void, children: React.ReactNode }) => {
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={()=>onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border bg-white shadow-lg">{children}</div>
    </div>
  ) : null
}
export const DialogContent = ({ className='', children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`}>{children}</div>
)
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-2">{children}</div>
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>
export const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-slate-600">{children}</p>
