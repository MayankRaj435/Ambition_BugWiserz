"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Zap, Database, Brain, BarChart3, Shield, Headphones } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion, Variants } from "framer-motion"

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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that best fits your machine learning needs.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >

          {/* Free Plan - Large Card */}
          <motion.div variants={itemVariants} className="md:col-span-2 h-full">
            <Card className="h-full bg-card border-border relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Brain className="w-32 h-32 text-primary rotate-12 transform group-hover:scale-110 transition-transform" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Free Trial</CardTitle>
                <CardDescription>Perfect for hobbyists and students</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full mt-4" variant="outline">Get Started</Button>
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" /> 5 File Uploads/mo
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" /> Standard Processing
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" /> Basic Models (Linear, Logistic)
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" /> CSV Export
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan - Highlighted Card */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="h-full bg-primary text-primary-foreground border-none relative overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 bg-background/20 text-xs font-bold px-3 py-1 rounded-bl-lg backdrop-blur-sm">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription className="text-primary-foreground/80">For serious ML practitioners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg opacity-80 font-normal">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> Unlimited Uploads</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> 3x Faster Processing</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> Advanced Models (XGBoost, Neural Nets)</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> Priority Support</li>
                </ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="w-full bg-background text-primary hover:bg-background/90 font-semibold">Upgrade Now</Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature: Speed */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors group">
              <CardHeader>
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-fit"
                >
                  <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                </motion.div>
                <CardTitle className="text-lg">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Optimized algorithms ensure your models train in seconds, not minutes.
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature: Security */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors group">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-fit"
                >
                  <Shield className="w-8 h-8 text-green-500 mb-2" />
                </motion.div>
                <CardTitle className="text-lg">Secure Data</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Your data is encrypted at rest and in transit. We never sell your data.
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature: Support */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors group">
              <CardHeader>
                <motion.div
                  whileHover={{ rotate: -15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-fit"
                >
                  <Headphones className="w-8 h-8 text-blue-500 mb-2" />
                </motion.div>
                <CardTitle className="text-lg">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Our team of ML experts is always ready to help you troubleshoot.
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>

        {/* FAQ Section - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time without penalty." },
              { q: "Is there a free trial?", a: "Absolutely! You can use our Free tier forever with limited features." },
              { q: "What payment methods?", a: "We accept all major credit cards and PayPal." }
            ].map((faq, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors cursor-default"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
