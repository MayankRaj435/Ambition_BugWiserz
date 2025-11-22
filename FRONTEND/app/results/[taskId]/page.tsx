"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, ArrowLeft, Activity, BarChart2, Code, Rocket, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, Variants } from "framer-motion"

interface Result {
  name: string
  score: string
  accuracy?: number
  precision?: number
  recall?: number
  f1?: number
  loss?: number
  download_path: string
  feature_importance?: Record<string, number>
}

interface ResultsResponse {
  results: Result[]
  metric: string
  task_id: string
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export default function ResultsPage() {
  const params = useParams()
  const taskId = params?.taskId || ""
  const [resultsData, setResultsData] = useState<ResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Deployment State
  const [deploying, setDeploying] = useState(false)
  const [deployment, setDeployment] = useState<{ endpoint: string; model_name: string } | null>(null)
  const [predictionInput, setPredictionInput] = useState("")
  const [predictionResult, setPredictionResult] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (!taskId) return
    fetch(`http://localhost:5000/results/${taskId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load results")
        return res.json()
      })
      .then((data) => {
        setResultsData(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [taskId])

  const handleDeploy = async () => {
    setDeploying(true)
    try {
      const res = await fetch(`http://localhost:5000/deploy/${taskId}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Deployment failed")

      setDeployment({ endpoint: data.endpoint, model_name: data.model_name })
      toast({ title: "Model Deployed!", description: `Endpoint: ${data.endpoint}` })
    } catch (e: any) {
      toast({ title: "Deployment Error", description: e.message, variant: "destructive" })
    } finally {
      setDeploying(false)
    }
  }

  const handlePredict = async () => {
    if (!deployment || !predictionInput) return
    try {
      let parsedInput
      try {
        parsedInput = JSON.parse(predictionInput)
      } catch {
        toast({ title: "Invalid JSON", description: "Please enter valid JSON input.", variant: "destructive" })
        return
      }

      const res = await fetch(`http://localhost:5000${deployment.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedInput),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Prediction failed")

      setPredictionResult(JSON.stringify(data.predictions, null, 2))
    } catch (e: any) {
      toast({ title: "Prediction Error", description: e.message, variant: "destructive" })
    }
  }

  const hasAnalytics = resultsData?.results.some(
    (r) =>
      r.accuracy !== undefined ||
      r.precision !== undefined ||
      r.recall !== undefined ||
      r.f1 !== undefined ||
      r.loss !== undefined
  )

  // Prepare feature importance data for the best model
  const bestModel = resultsData?.results[0]
  const featureImportanceData = bestModel?.feature_importance
    ? Object.entries(bestModel.feature_importance)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-lg">Loading results...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-destructive text-lg font-medium">Error: {error}</div>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Model Performance
            </h1>
            <p className="text-muted-foreground mt-1">
              Task ID: <span className="font-mono text-primary">{resultsData?.task_id}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`http://localhost:5000/export/${taskId}`} target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="gap-2">
                  <Code className="w-4 h-4" /> Export Code
                </Button>
              </motion.div>
            </a>
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* METRICS TABLE */}
          {resultsData && (
            <motion.div variants={itemVariants}>
              <Card className="bg-card border-border overflow-hidden">
                <CardHeader>
                  <CardTitle>Evaluation Metrics</CardTitle>
                  <CardDescription>Comparing performance across trained models</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Model</th>
                          <th className="px-6 py-4 text-right font-semibold text-muted-foreground">
                            {resultsData.metric}
                          </th>
                          <th className="px-6 py-4 text-right font-semibold text-muted-foreground">F1 Score</th>
                          <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Precision</th>
                          <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Recall</th>
                          <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {resultsData.results.map((r, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-foreground">{r.name}</td>
                            <td className="px-6 py-4 text-right font-mono">{r.score}</td>
                            <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                              {r.f1 !== undefined ? r.f1.toFixed(3) : "–"}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                              {r.precision !== undefined ? r.precision.toFixed(3) : "–"}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                              {r.recall !== undefined ? r.recall.toFixed(3) : "–"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <a
                                href={`http://localhost:5000/download/${r.download_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
                                  <Download className="w-4 h-4" /> Download
                                </Button>
                              </a>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ANALYTICS CHARTS */}
          {hasAnalytics && resultsData && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Line Chart */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card border-border h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <CardTitle>Metric Comparison</CardTitle>
                    </div>
                    <CardDescription>Accuracy, F1, Precision, and Recall</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={resultsData.results}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "var(--radius)" }}
                            itemStyle={{ color: "var(--popover-foreground)" }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="accuracy" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4 }} animationDuration={1500} />
                          <Line type="monotone" dataKey="f1" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4 }} animationDuration={1500} animationBegin={200} />
                          <Line type="monotone" dataKey="precision" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 4 }} animationDuration={1500} animationBegin={400} />
                          <Line type="monotone" dataKey="recall" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 4 }} animationDuration={1500} animationBegin={600} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature Importance Chart (XAI) */}
              <motion.div variants={itemVariants}>
                {featureImportanceData.length > 0 ? (
                  <Card className="bg-card border-border h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary" />
                        <CardTitle>Feature Importance (XAI)</CardTitle>
                      </div>
                      <CardDescription>Top factors influencing the best model ({bestModel?.name})</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "var(--radius)" }}
                              itemStyle={{ color: "var(--popover-foreground)" }}
                              cursor={{ fill: "var(--muted)/0.2" }}
                            />
                            <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} animationDuration={1500}>
                              {featureImportanceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`var(--primary)`} style={{ opacity: 1 - index * 0.05 }} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-card border-border h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary" />
                        <CardTitle>Loss Analysis</CardTitle>
                      </div>
                      <CardDescription>Model loss comparison (lower is better)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={resultsData.results}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "var(--radius)" }}
                              itemStyle={{ color: "var(--popover-foreground)" }}
                              cursor={{ fill: "var(--muted)/0.2" }}
                            />
                            <Legend />
                            <Bar dataKey="loss" fill="var(--chart-5)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          )}

          {/* DEPLOYMENT SECTION */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  <CardTitle>Deployment</CardTitle>
                </div>
                <CardDescription>Deploy your best model to a REST API endpoint instantly.</CardDescription>
              </CardHeader>
              <CardContent>
                {!deployment ? (
                  <div className="flex flex-col items-start gap-4">
                    <p className="text-sm text-muted-foreground">
                      Ready to serve predictions? Deploy <strong>{bestModel?.name}</strong> with one click.
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={handleDeploy} disabled={deploying} className="gap-2">
                        {deploying ? "Deploying..." : "Deploy Model"}
                        {!deploying && <Rocket className="w-4 h-4" />}
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-md border border-green-500/20">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Model Deployed Successfully!</span>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">API Endpoint</label>
                      <div className="flex gap-2">
                        <Input readOnly value={`http://localhost:5000${deployment.endpoint}`} className="font-mono bg-muted" />
                        <Button variant="outline" onClick={() => {
                          navigator.clipboard.writeText(`http://localhost:5000${deployment.endpoint}`)
                          toast({ title: "Copied to clipboard" })
                        }}>Copy</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Test Prediction</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder='{"x1": 10, "x2": 5.5, ...}'
                          value={predictionInput}
                          onChange={(e) => setPredictionInput(e.target.value)}
                          className="font-mono"
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={handlePredict}>Predict</Button>
                        </motion.div>
                      </div>
                      {predictionResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 p-3 bg-muted rounded-md border border-border font-mono text-sm whitespace-pre-wrap"
                        >
                          {predictionResult}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
