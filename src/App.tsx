import React, { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, BookOpen, Sparkles, Shuffle, Repeat, Trophy, Plus, Download, Volume2, Flag, Layers, Wand2, Check, X, HelpCircle, RefreshCw, ArrowLeftRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Term = { id:number, term:string, cn?:string, def:string, example:string, tags?:string[], due?:number, interval?:number }

const SEED_VOCAB: Term[] = [
  { id:1, term:"market dominance", cn:"市场支配地位", def:"A position of economic strength enabling a firm to behave to an appreciable extent independently of competitors, customers, and consumers.", example:"The authority assessed whether the platform's market dominance led to exclusionary conduct.", tags:["EU","Article 102","core"] },
  { id:2, term:"rule of reason", cn:"合理原则", def:"A framework under U.S. antitrust law requiring courts to weigh a restraint's procompetitive benefits against its anticompetitive harms.", example:"The vertical agreement was analyzed under the rule of reason rather than per se rules.", tags:["US","Sherman Act §1","analysis"] },
  { id:3, term:"per se illegal", cn:"本身非法", def:"Conduct deemed unlawful without detailed market analysis because of its manifestly anticompetitive nature, e.g., price‑fixing.", example:"Bid rigging among suppliers is generally per se illegal.", tags:["US","cartel","enforcement"] },
  { id:4, term:"abuse of dominance", cn:"滥用市场支配地位", def:"Exploitation or exclusion by a dominant firm that distorts competition, such as predatory pricing or refusal to deal.", example:"A margin squeeze may constitute abuse of dominance if rivals are foreclosed.", tags:["EU","China","Article 102","AML"] },
  { id:5, term:"unfair competition", cn:"不正当竞争", def:"Business practices contrary to honest commercial ethics that harm competitors or consumers, regulated by specific statutes.", example:"False advertising constitutes unfair competition when it misleads consumers and harms rivals.", tags:["China","AUCL","conduct"] },
  { id:6, term:"tying", cn:"搭售", def:"Conditioning the sale of one product on the purchase of another.", example:"The platform was investigated for tying payment services to in‑app purchases.", tags:["US","EU","platform"] },
  { id:7, term:"exclusive dealing", cn:"独家交易", def:"Agreements requiring a buyer to deal only or mostly with a particular seller, potentially foreclosing rivals.", example:"Exclusive dealing clauses with key influencers raised foreclosure concerns.", tags:["US","EU","verticals"] },
  { id:8, term:"most‑favored‑nation clause (MFN)", cn:"最惠国条款", def:"A provision ensuring a platform receives terms no worse than those offered elsewhere; can soften price competition across channels.", example:"Wide MFNs by online travel agencies prompted investigations in the EU and China.", tags:["platform","parity","verticals"] },
  { id:9, term:"consumer welfare standard", cn:"消费者福利标准", def:"An evaluative lens focusing on effects on prices, output, quality, and innovation when assessing competitive impact.", example:"Critics argue the consumer welfare standard underweights harms to market structure.", tags:["theory","US"] },
  { id:10, term:"fair competition review", cn:"公平竞争审查", def:"An ex ante government process in China to screen policy measures for anti‑competitive effects.", example:"Local rules on data access underwent fair competition review before issuance.", tags:["China","policy","ex‑ante"] },
]

const SEED_SENTENCES = [
  { id:1, text:"The authority applied a market share screen and then conducted an effects analysis under the rule of reason.", cn:"监管机构先使用市场份额筛查，随后依合理原则开展效果分析。" },
  { id:2, text:"Self‑preferencing can be abusive when it forecloses rivals from critical channels of distribution.", cn:"当自我优待排挤竞争对手进入关键分销渠道时，可能构成滥用。" },
  { id:3, text:"A narrow MFN may still dampen price competition by discouraging selective discounts.", cn:"即便是窄最惠国条款也可能抑制价格竞争，因为会打击选择性折扣。" },
]

const SEED_CLOZE = [
  { id:1, passage:"Under EU law, a firm may be found to hold ____ when it can act independently of competitors and customers.", answer:"market dominance", options:["market power","market dominance","collective dominance","buyer power"], tip:"Think Article 102 TFEU phrasing." },
  { id:2, passage:"In U.S. antitrust, hardcore cartels like price‑fixing are typically ____ illegal.", answer:"per se", options:["per se","rule of reason","ancillary","de minimis"], tip:"No balancing required." },
  { id:3, passage:"China's ____ system screens administrative measures for anti‑competitive effects before they are issued.", answer:"fair competition review", options:["AML merger","fair competition review","AUCL sanctions","file‑and‑use"], tip:"Ex ante policy check." },
]

function nextInterval(prev:number, grade:0|1|2|3) {
  const multipliers = [0.5, 1.4, 2.2, 3.5]
  const base = prev || 0.5
  return Math.max(0.5, Math.round(base * multipliers[grade] * 10) / 10)
}

function speak(text:string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = "en-US"
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {}
}

function shuffle<T>(arr:T[]) { return [...arr].sort(() => Math.random() - 0.5) }

function saveFile(filename:string, content:string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}

export default function App() {
  const [showCN, setShowCN] = useState(true)
  const [dataset, setDataset] = useState<Term[]>(() => {
    const saved = localStorage.getItem("antitrust_vocab")
    return saved ? JSON.parse(saved) : SEED_VOCAB
  })
  const [activeTab, setActiveTab] = useState("trainer")

  useEffect(() => {
    localStorage.setItem("antitrust_vocab", JSON.stringify(dataset))
  }, [dataset])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Antitrust English Lab</h1>
          <Badge className="ml-2">Beta</Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowCN((s) => !s)}>
              <Flag className="w-4 h-4 mr-2" /> {showCN ? "Hide CN" : "Show CN"}
            </Button>
            <AddTerm onAdd={(item)=>setDataset(d=>[...d,item])} />
            <Button onClick={() => saveFile("antitrust_vocab.json", JSON.stringify(dataset, null, 2))}>
              <Download className="w-4 h-4 mr-2" /> Export Data
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="trainer">Vocab Trainer</TabsTrigger>
            <TabsTrigger value="builder">Sentence Builder</TabsTrigger>
            <TabsTrigger value="explorer">Term Explorer</TabsTrigger>
            <TabsTrigger value="cloze">Cloze Quiz</TabsTrigger>
            <TabsTrigger value="match">Match Game</TabsTrigger>
          </TabsList>

          <TabsContent value="trainer">
            <Trainer dataset={dataset} setDataset={setDataset} showCN={showCN} />
          </TabsContent>

          <TabsContent value="builder">
            <SentenceBuilder showCN={showCN} />
          </TabsContent>

          <TabsContent value="explorer">
            <Explorer dataset={dataset} showCN={showCN} setDataset={setDataset} />
          </TabsContent>

          <TabsContent value="cloze">
            <ClozeQuiz showCN={showCN} />
          </TabsContent>

          <TabsContent value="match">
            <MatchGame dataset={dataset} />
          </TabsContent>
        </Tabs>

        <FooterNote />
      </main>
    </div>
  )
}

function FooterNote() {
  return (
    <div className="mt-8 flex items-start gap-3 text-sm text-slate-600">
      <HelpCircle className="w-4 h-4 mt-0.5" />
      <p>
        Tip: Click a term to hear it. Add your own case‑specific vocabulary (e.g., "self‑preferencing", "gatekeeper", "undertaking", "platform parity clause").
        All data stays locally in your browser. Export to .json to back up or share with classmates.
      </p>
    </div>
  )
}

function AddTerm({ onAdd }: { onAdd: (t:Term)=>void }) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState("")
  const [def, setDef] = useState("")
  const [example, setExample] = useState("")
  const [cn, setCn] = useState("")
  const [tags, setTags] = useState("")
  return (
    <>
      <Button variant="outline" onClick={()=>setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Term</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new term</DialogTitle>
            <DialogDescription>Keep it concise and add an authentic example sentence.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <LabeledInput label="Term" value={term} setValue={setTerm} placeholder="e.g., self‑preferencing" />
            <LabeledInput label="Definition" value={def} setValue={setDef} placeholder="Short, precise definition" />
            <LabeledInput label="Example" value={example} setValue={setExample} placeholder="Write a legal‑style sentence" />
            <LabeledInput label="中文释义 (optional)" value={cn} setValue={setCn} placeholder="简明中文解释" />
            <LabeledInput label="Tags (comma‑separated)" value={tags} setValue={setTags} placeholder="EU, platform, verticals" />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={()=>{ onAdd({ id:Date.now(), term:term.trim(), def:def.trim(), example:example.trim(), cn:cn.trim(), tags: tags.split(',').map(t=>t.trim()).filter(Boolean) }); setOpen(false); }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function LabeledInput({ label, value, setValue, placeholder }:{ label:string, value:string, setValue:(s:string)=>void, placeholder?:string }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm text-slate-700">{label}</label>
      <Input value={value} onChange={(e)=>setValue(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function Trainer({ dataset, setDataset, showCN }:{ dataset:Term[], setDataset:(u:Term[]|((d:Term[])=>Term[]))=>void, showCN:boolean }) {
  const [queue, setQueue] = useState<Term[]>(() => dataset.map(d => ({ ...d, due:0, interval:0.5 })))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setQueue(q => {
      const map = new Map(q.map(i => [i.id, i]))
      return dataset.map(d => map.get(d.id) || { ...d, due:0, interval:0.5 })
    })
  }, [dataset])

  const sorted = useMemo(() => [...queue].sort((a,b)=> (a.due||0) - (b.due||0)), [queue])
  const current = sorted[index % sorted.length]

  function gradeCard(grade:0|1|2|3) {
    setQueue(q => q.map(c => {
      if (c.id !== current.id) return c
      const next = nextInterval(c.interval!, grade)
      return { ...c, interval: next, due: Date.now() + next * 24 * 60 * 60 * 1000 }
    }))
    setFlipped(false); setIndex(i=>i+1)
  }

  if (!current) return null

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Flashcard</CardTitle>
          <CardDescription>Click to flip. Grade yourself to schedule the next review.</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            className="h-56 md:h-64 bg-gradient-to-br from-slate-50 to-white border rounded-2xl flex items-center justify-center cursor-pointer"
            onClick={() => setFlipped(f => !f)}
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {!flipped ? (
              <div className="text-center p-6">
                <div className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <button className="p-1 rounded hover:bg-slate-100" onClick={(e)=>{ e.stopPropagation(); speak(current.term) }} title="Speak">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  {current.term}
                </div>
                {showCN && <div className="text-slate-600">{current.cn}</div>}
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {current.tags?.map((t,i) => <Badge key={i} className="border-slate-300">{t}</Badge>)}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-600 mb-2">Definition</p>
                <p className="text-lg">{current.def}</p>
                <p className="text-sm text-slate-600 mt-4">Example</p>
                <p className="italic">“{current.example}”</p>
              </div>
            )}
          </motion.div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <Button variant="secondary" onClick={()=>gradeCard(0)}><X className="w-4 h-4 mr-2" /> Again</Button>
            <Button variant="outline" onClick={()=>gradeCard(1)}>Hard</Button>
            <Button onClick={()=>gradeCard(2)}><Check className="w-4 h-4 mr-2" /> Good</Button>
            <Button variant="outline" onClick={()=>gradeCard(3)}>Easy</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Repeat className="w-5 h-5" /> Practice Mixer</CardTitle>
          <CardDescription>Quick mixed practice to reinforce collocations and usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Mixer dataset={queue} showCN={showCN} />
        </CardContent>
      </Card>
    </div>
  )
}

function Mixer({ dataset, showCN }:{ dataset:Term[], showCN:boolean }) {
  const getRandomPrompt = (data:Term[]) => {
    const item = data[Math.floor(Math.random() * data.length)]
    const prompt = `Define: ${item.term}`
    return { item, prompt }
  }
  const [q, setQ] = useState(()=>getRandomPrompt(dataset))
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-50 rounded-xl border">
        <div className="text-sm text-slate-600">Prompt</div>
        <div className="font-medium">{q.prompt}</div>
        {showCN && <div className="text-xs text-slate-500 mt-1">提示：{q.item.cn}</div>}
      </div>
      <Input value={answer} onChange={(e)=>setAnswer(e.target.value)} placeholder="Type your definition in English" />
      <div className="flex gap-2">
        <Button onClick={()=>{
          const ok = answer.toLowerCase().split(" ").slice(0,6).some(w => q.item.def.toLowerCase().includes(w))
          setResult(ok ? "Looks good — your keywords match!" : "Not quite. Flip the card and review keywords like in the example.")
        }}>Check</Button>
        <Button variant="outline" onClick={()=>{ setQ(getRandomPrompt(dataset)); setAnswer(""); setResult(null) }}><Shuffle className="w-4 h-4 mr-2" /> New</Button>
      </div>
      {result && <div className="text-sm text-slate-700">{result}</div>}
    </div>
  )
}

function SentenceBuilder({ showCN }:{ showCN:boolean }) {
  const [seedIndex, setSeedIndex] = useState(0)
  const sentence = SEED_SENTENCES[seedIndex % SEED_SENTENCES.length]
  const tokens = useMemo(() => shuffle(sentence.text.replace(/\.$/, "").split(/\s+/)), [seedIndex])
  const [built, setBuilt] = useState<string[]>([])

  function moveToken(t:string) { setBuilt(b => (b.includes(t) ? b : [...b, t])) }
  function removeToken(t:string) { setBuilt(b => b.filter(x => x !== t)) }

  const correct = built.join(" ") + "." === sentence.text

  return (
    <div className="grid lg:grid-cols-3 gap-4 mt-4">
      <Card className="lg:col-span-2 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5" /> Drag to Build the Sentence</CardTitle>
          {showCN && <CardDescription>{sentence.cn}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="min-h-[56px] p-3 rounded-xl border bg-slate-50 mb-3">
            <div className="flex flex-wrap gap-2">
              {built.map((t,i)=>(
                <Badge key={i} className="cursor-pointer" onClick={()=>removeToken(t) as any}>{t}</Badge>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl border">
            <div className="flex flex-wrap gap-2">
              {tokens.map((t,i)=>(
                <Button key={i} variant="outline" onClick={()=>moveToken(t)}>{t}</Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="secondary" onClick={()=>setSeedIndex(i=>i+1)}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
            {correct ? <Badge>Perfect!</Badge> : <span className="text-sm text-slate-600">Click words to build the sentence in order.</span>}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> Collocations</CardTitle>
          <CardDescription>Useful legal phrases for precision.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              ["foreclose rivals","排除竞争对手"],
              ["appreciable effect on competition","对竞争产生显著影响"],
              ["ancillary restraint","附属限制"],
              ["harm to innovation incentives","降低创新激励"],
              ["evidentiary burden","举证责任"],
            ].map(([en,cn],i)=>(
              <li key={i} className="flex items-center justify-between p-2 rounded-lg border bg-slate-50">
                <span>{en}</span>
                {showCN && <span className="text-slate-500">{cn}</span>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function Explorer({ dataset, showCN, setDataset }:{ dataset:Term[], showCN:boolean, setDataset:(u:Term[]|((d:Term[])=>Term[]))=>void }) {
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState("all")
  const [sel, setSel] = useState<Term | null>(null)
  const filtered = dataset.filter(d =>
    (filter === "all" || d.tags?.some(t => t.toLowerCase().includes(filter))) &&
    (d.term.toLowerCase().includes(q.toLowerCase()) || d.def.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <div className="mt-4 grid lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5" /> Term Explorer</CardTitle>
          <CardDescription>Search by keyword; filter by jurisdiction or topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Search term or definition…" value={q} onChange={(e)=>setQ(e.target.value)} />
            <select className="px-3 py-2 border rounded-xl bg-white" value={filter} onChange={(e)=>setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="us">US</option>
              <option value="eu">EU</option>
              <option value="china">China</option>
              <option value="platform">Platform</option>
              <option value="verticals">Verticals</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((d)=>(
              <Card key={d.id} className="border rounded-xl hover:shadow-sm transition cursor-pointer" onClick={()=>setSel(d)}>
                <CardContent className="p-4">
                  <div className="font-medium text-slate-900 mb-1">{d.term}</div>
                  {showCN && <div className="text-xs text-slate-500 mb-1">{d.cn}</div>}
                  <div className="text-sm line-clamp-2 text-slate-700">{d.def}</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {d.tags?.slice(0,3).map((t,i)=>(<Badge key={i} className="border-slate-300">{t}</Badge>))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" /> Mini Quiz</CardTitle>
          <CardDescription>Multiple choice from your dataset.</CardDescription>
        </CardHeader>
        <CardContent>
          <MiniQuiz items={dataset} />
        </CardContent>
      </Card>

      <Dialog open={!!sel} onOpenChange={()=>setSel(null)}>
        <DialogContent>
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {sel.term}
                  <button className="p-1 rounded hover:bg-slate-100" onClick={()=>speak(sel.term)} title="Speak">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </DialogTitle>
                <DialogDescription>{showCN && sel.cn}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Definition</p>
                  <p>{sel.def}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Example</p>
                  <p className="italic">“{sel.example}”</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sel.tags?.map((t,i)=>(<Badge key={i} className="border-slate-300">{t}</Badge>))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="destructive" onClick={()=>{ setDataset(arr => arr.filter(x => x.id !== sel.id)); setSel(null) }}>Delete</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MiniQuiz({ items }:{ items:Term[] }) {
  const [i, setI] = useState(0)
  const q = items[i % items.length]
  const options = useMemo(() => shuffle([q.def, ...shuffle(items.filter(x=>x.id!==q.id)).slice(0,3).map(x=>x.def)]), [i])
  const [sel, setSel] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600">Question</div>
      <div className="font-medium">What is the best definition of “{q.term}”?</div>
      <div className="grid gap-2">
        {options.map((opt, idx) => (
          <button key={idx} className={`text-left p-3 rounded-xl border ${sel === null ? "hover:bg-slate-50" : opt === q.def ? "bg-green-50 border-green-300" : sel === opt ? "bg-red-50 border-red-300" : "opacity-70"}`} onClick={()=>setSel(opt)} disabled={sel !== null}>
            {opt}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={()=>{ setI(n=>n+1); setSel(null) }}>Next</Button>
        {sel && (sel === q.def ? <Badge>Correct</Badge> : <Badge className="border-red-300 text-red-700">Try again</Badge>)}
      </div>
    </div>
  )
}

function ClozeQuiz({ showCN }:{ showCN:boolean }) {
  const [i, setI] = useState(0)
  const item = SEED_CLOZE[i % SEED_CLOZE.length]
  const [choice, setChoice] = useState("")

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Fill in the Blank</CardTitle>
          <CardDescription>{item.tip}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-3">{item.passage.replace("____", "_____")}</p>
          <div className="grid gap-2">
            {item.options.map(opt => (
              <button key={opt} onClick={()=>setChoice(opt)} className={`text-left p-3 rounded-xl border ${choice === opt ? "bg-indigo-50 border-indigo-300" : "hover:bg-slate-50"}`}>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center mt-3">
            <Button onClick={()=>setI(n=>n+1)}>Next</Button>
            {choice && (choice === item.answer ? <Badge>Correct</Badge> : <Badge className="border-red-300 text-red-700">Answer: {item.answer}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Sentence Mining</CardTitle>
          <CardDescription>Tap a sentence to hear it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SEED_SENTENCES.map(s => (
              <div key={s.id} className="p-3 rounded-xl border hover:bg-slate-50 cursor-pointer" onClick={()=>speak(s.text)}>
                <div>{s.text}</div>
                {showCN && <div className="text-xs text-slate-500 mt-1">{s.cn}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MatchGame({ dataset }:{ dataset:Term[] }) {
  const [pairs, setPairs] = useState(() => shuffle(dataset).slice(0, Math.min(6, dataset.length)).map(d => ({ id:d.id, term:d.term, def:d.def })))
  const left = pairs.map(p=>p.term)
  const right = useMemo(() => shuffle(pairs.map(p=>p.def)), [pairs])
  const [match, setMatch] = useState<{ term?:string, def?:string }>({})
  const [done, setDone] = useState(false)

  function chooseTerm(t:string) { setMatch(m => ({ ...m, term:t })) }
  function chooseDef(d:string) { setMatch(m => ({ ...m, def:d })) }

  useEffect(() => {
    if (match.term && match.def) {
      const p = pairs.find(x => x.term === match.term)
      if (p && p.def === match.def) setPairs(arr => arr.filter(x => x.term !== p.term))
      setMatch({})
    }
  }, [match])

  useEffect(() => { if (pairs.length === 0) setDone(true) }, [pairs.length])

  return (
    <div className="mt-4 grid md:grid-cols-2 gap-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ArrowLeftRight className="w-5 h-5" /> Match Terms</CardTitle>
          <CardDescription>Pick a term, then its correct definition.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              {left.map(t => (
                <button key={t} className={`w-full text-left p-3 rounded-xl border ${match.term === t ? "bg-indigo-50 border-indigo-300" : "hover:bg-slate-50"}`} onClick={()=>chooseTerm(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {right.map(d => (
                <button key={d} className={`w-full text-left p-3 rounded-xl border ${match.def === d ? "bg-indigo-50 border-indigo-300" : "hover:bg-slate-50"}`} onClick={()=>chooseDef(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button className="inline-flex items-center rounded-2xl border px-4 py-2 text-sm hover:bg-slate-50" onClick={()=>location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </button>
            {done && <Badge>Great job!</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Study Tips</CardTitle>
          <CardDescription>Make legal English stick.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Speak out loud: click the <span className="inline-flex items-center"><Volume2 className="inline w-4 h-4 mr-1" />icon</span> to hear key terms and shadow them.</li>
            <li>Create your own examples using real cases (e.g., app stores, MFN in travel platforms).</li>
            <li>Mix micro‑skills: definitions, collocations, and sentence order—then test with the mini quiz.</li>
            <li>Study in short sprints (10–15 min) and come back—spaced review is built into the trainer.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
