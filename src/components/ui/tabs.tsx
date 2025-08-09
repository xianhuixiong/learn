import * as React from 'react'
type TabsCtx = { value: string, setValue: (v:string)=>void }
const Ctx = React.createContext<TabsCtx | null>(null)
export const Tabs = ({ value, onValueChange, children }: { value: string, onValueChange: (v:string)=>void, children: React.ReactNode }) => (
  <Ctx.Provider value={{ value, setValue: onValueChange }}>{children}</Ctx.Provider>
)
export const TabsList = ({ className='', children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-2xl border bg-white p-1 ${className}`}>{children}</div>
)
export const TabsTrigger = ({ value, children }: { value: string, children: React.ReactNode }) => {
  const ctx = React.useContext(Ctx)!
  const active = ctx.value === value
  return (
    <button onClick={()=>ctx.setValue(value)} className={`px-3 py-2 text-sm rounded-xl ${active ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}>{children}</button>
  )
}
export const TabsContent = ({ value, children }: { value: string, children: React.ReactNode }) => {
  const ctx = React.useContext(Ctx)!
  if (ctx.value !== value) return null
  return <div className="mt-3">{children}</div>
}
