"use client"

import type React from "react"
import { useState } from "react"
import MagicUIProvider from "@/components/magic-ui/MagicUIProvider"
import MagicUI from "@/components/magic-ui/MagicUI"
import MagicUIPage from "@/components/magic-ui/MagicUIPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Code,
  Eye,
  Copy,
  Check,
  Sparkles,
  Palette,
  Database,
  FileText,
  Zap,
} from "lucide-react"

const themes = [
  {
    name: "Emerald",
    value: { primary: "#10b981", background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", text: "#065f46" },
    color: "bg-emerald-500",
  },
  {
    name: "Ocean",
    value: { primary: "#0ea5e9", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", text: "#0c4a6e" },
    color: "bg-sky-500",
  },
  {
    name: "Sunset",
    value: { primary: "#f59e0b", background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", text: "#92400e" },
    color: "bg-amber-500",
  },
  {
    name: "Purple",
    value: { primary: "#8b5cf6", background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", text: "#581c87" },
    color: "bg-violet-500",
  },
  {
    name: "Rose",
    value: { primary: "#f43f5e", background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)", text: "#881337" },
    color: "bg-rose-500",
  },
]

const prefilled = {
  prd: "An Ecommerce project",
  description:
    "Product card",
  data: JSON.stringify(
    {
      name: "Bamboo Wireless Charger",
      price: 49.99,
      ecoRating: 4.8,
      image: "https://example.com/nonexistent-charger.jpg",
      features: ["100% Renewable Materials", "Carbon Neutral Shipping", "Recyclable Packaging"],
    }
  ),
  mode: "component",
}

const exampleTemplates = [
  {
    name: "Product Card",
    icon: "🛍️",
    description: "E-commerce product showcase",
    data: {
      name: "Eco-Friendly Water Bottle",
      price: 24.99,
      rating: 4.9,
      image: "https://example.com/bottle.jpg",
    },
  },
  {
    name: "User Profile",
    icon: "👤",
    description: "User profile with avatar and stats",
    data: {
      name: "Alex Green",
      role: "Sustainability Expert",
      avatar: "https://example.com/avatar.jpg",
      followers: 1240,
    },
  },
  {
    name: "Dashboard Widget",
    icon: "��",
    description: "Analytics dashboard component",
    data: {
      title: "Carbon Footprint Saved",
      value: "2.4 tons",
      trend: "+15%",
      period: "This month",
    },
  },
]

function getCode({ mode, description, data }: { mode: string; description: string; data: string }) {
  let parsed
  try {
    parsed = JSON.parse(data)
  } catch {
    parsed = {}
  }
  const dataString = JSON.stringify(parsed, null, 2)
  if (mode === "component") {
    return `<MagicUI\n  id="playground-demo"\n  moduleName="playground-demo"\n  description={${JSON.stringify(description)}}\n  data={${dataString}}\n/>`
  } else {
    return `<MagicUIPage\n  id="playground-demo-page"\n  moduleName="playground-demo-page"\n  description={${JSON.stringify(description)}}\n  data={${dataString}}\n/>`
  }
}

function PreviewTabs({ code, children }: { code: string; children: React.ReactNode }) {
  const [tab, setTab] = useState<"preview" | "code">("preview")
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full">
      <Tabs value={tab} onValueChange={(value) => setTab(value as "preview" | "code")} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-emerald-100 border border-emerald-200">
            <TabsTrigger
              value="preview"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Code className="w-4 h-4" />
              Code
            </TabsTrigger>
          </TabsList>
          {tab === "code" && (
            <Button
              onClick={copyCode}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>

        <TabsContent value="preview" className="mt-0">
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 p-6 min-h-[400px] shadow-xl backdrop-blur-sm">
            {children}
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-0">
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-gray-900 to-gray-800 p-6 min-h-[400px] shadow-xl relative overflow-hidden">
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap mt-8 leading-relaxed">{code}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function sanitizeForMagicUI(value: any): any {
  if (value == null) return value
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value
  if (Array.isArray(value)) {
    if (value.every((v) => v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean")) {
      return value
    }
    return JSON.stringify(value)
  }
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString()
    return JSON.stringify(value)
  }
  return String(value)
}

function MagicUIWithApiKey(props: any) {
  return <MagicUI {...props} apiKey={props.apiKey} />
}

function MagicUIPageWithApiKey(props: any) {
  return <MagicUIPage {...props} apiKey={props.apiKey} />
}

export default function AwesomePlaygroundPage() {
  const [prd, setPrd] = useState(prefilled.prd)
  const [apiKey, setApiKey] = useState("")
  const [theme, setTheme] = useState(themes[0].value)
  const [themeIndex, setThemeIndex] = useState(0)
  const [mode, setMode] = useState<"component" | "page">(prefilled.mode as "component" | "page")
  const [description, setDescription] = useState(prefilled.description)
  const [data, setData] = useState(prefilled.data)

  let parsedData: any = {}
  let isValidJson = true
  try {
    parsedData = JSON.parse(data)
  } catch {
    parsedData = {}
    isValidJson = false
  }

  const sanitizedData = sanitizeForMagicUI(parsedData)
  const code = getCode({ mode, description, data })

  const loadTemplate = (template: (typeof exampleTemplates)[0]) => {
    setDescription(
      `Create a ${template.description} with the provided data structure. Make it modern and visually appealing.`,
    )
    setData(JSON.stringify(template.data, null, 2))
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                  MagicUI Playground
                </h1>
                <p className="text-sm text-emerald-600">Build beautiful UIs with AI</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
              <Zap className="w-3 h-3 mr-1" />
              Live Preview
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Configuration Panel */}
        <aside className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-emerald-200 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* API Key */}
              <div>
                <label className="flex items-center gap-2 font-semibold text-emerald-800 mb-2">
                  <Zap className="w-4 h-4" />
                  API Key
                </label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  className="w-full border-2 border-emerald-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/50"
                  placeholder="sk-..."
                />
              </div>

              {/* Theme Selection */}
              <div>
                <label className="flex items-center gap-2 font-semibold text-emerald-800 mb-3">
                  <Palette className="w-4 h-4" />
                  Theme
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {themes.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        setTheme(t.value)
                        setThemeIndex(i)
                      }}
                      className={`w-12 h-12 rounded-xl ${t.color} shadow-lg transition-all hover:scale-110 ${
                        themeIndex === i ? "ring-4 ring-emerald-300 ring-offset-2" : ""
                      }`}
                      title={t.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-emerald-600 mt-2">Selected: {themes[themeIndex].name}</p>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="flex items-center gap-2 font-semibold text-emerald-800 mb-2">
                  <FileText className="w-4 h-4" />
                  Generation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode("component")}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      mode === "component"
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                        : "border-emerald-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="font-semibold">Component</div>
                    <div className="text-xs text-gray-600">Single UI element</div>
                  </button>
                  <button
                    onClick={() => setMode("page")}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      mode === "page"
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                        : "border-emerald-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="font-semibold">Full Page</div>
                    <div className="text-xs text-gray-600">Complete layout</div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card className="border-2 border-emerald-200 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Sparkles className="w-5 h-5" />
                Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-2">
                {exampleTemplates.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => loadTemplate(template)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <div className="font-semibold text-emerald-800">{template.name}</div>
                      <div className="text-xs text-emerald-600">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PRD Input */}
          <Card className="border-2 border-emerald-200 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <FileText className="w-5 h-5" />
                Project Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <textarea
                value={prd}
                onChange={(e) => setPrd(e.target.value)}
                rows={4}
                className="w-full border-2 border-emerald-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/50 resize-none"
                placeholder="Describe your project requirements..."
              />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Description & Data Input */}
          <div className="grid gap-6">
            <Card className="border-2 border-emerald-200 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <Code className="w-5 h-5" />
                  Component Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-emerald-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/50 resize-none"
                  placeholder="Describe what you want to build..."
                />
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <Database className="w-5 h-5" />
                    Data (JSON)
                  </CardTitle>
                  {!isValidJson && (
                    <Badge variant="destructive" className="text-xs">
                      Invalid JSON
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <textarea
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  rows={8}
                  className={`w-full border-2 rounded-xl p-3 focus:outline-none transition-colors bg-emerald-50/50 resize-none font-mono text-sm ${
                    isValidJson ? "border-emerald-200 focus:border-emerald-500" : "border-red-300 focus:border-red-500"
                  }`}
                  placeholder="Enter your data as JSON..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Preview Area */}
          <Card className="border-2 border-emerald-200 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <MagicUIProvider theme={theme} projectPrd={prd}>
                <PreviewTabs code={code}>
                  {mode === "component" ? (
                    <MagicUIWithApiKey
                      id="playground-demo"
                      moduleName="playground-demo"
                      description={description}
                      data={sanitizedData}
                      className="w-full"
                      apiKey={apiKey}
                    />
                  ) : (
                    <MagicUIPageWithApiKey
                      id="playground-demo-page"
                      moduleName="playground-demo-page"
                      description={description}
                      data={sanitizedData}
                      className="w-full"
                      apiKey={apiKey}
                    />
                  )}
                </PreviewTabs>
              </MagicUIProvider>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
