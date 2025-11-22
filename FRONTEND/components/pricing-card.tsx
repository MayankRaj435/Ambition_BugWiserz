import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface PricingCardProps {
  title: string
  price: string
  period: string
  description: string
  features: string[]
  limitations?: string[]
  isPopular?: boolean
  buttonText: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  onButtonClick: () => void
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  limitations = [],
  isPopular = false,
  buttonText,
  buttonVariant = "default",
  onButtonClick
}: PricingCardProps) {
  return (
    <Card className={`relative w-full max-w-sm ${isPopular ? 'border-primary shadow-[0_0_20px_-5px_var(--color-primary)] scale-105' : 'border-border'}`}>
      <CardHeader>
        {isPopular && (
          <Badge className="bg-primary text-primary-foreground px-4 py-1 absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
        )}
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground ml-1">{period}</span>
        </div>
        <CardDescription className="mt-2 text-muted-foreground text-center">{description}</CardDescription>
        <ul className="space-y-3 mt-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
          {limitations.map((limitation, index) => (
            <li key={index} className="flex items-center text-muted-foreground">
              <X className="h-5 w-5 mr-2" />
              <span className="text-sm line-through">{limitation}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
          variant={isPopular ? "default" : "outline"}
        >
          Choose Plan
        </Button>
      </CardFooter>
    </Card>
  )
}
