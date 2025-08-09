import * as React from 'react'
export const Slider = ({ value, onValueChange, min=0, max=100, step=1 }:{ value: number, onValueChange:(n:number)=>void, min?:number, max?:number, step?:number }) => {
  return (
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>onValueChange(parseFloat(e.target.value))} className="w-full" />
  )
}
