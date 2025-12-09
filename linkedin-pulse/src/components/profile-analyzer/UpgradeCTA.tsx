"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"

interface UpgradeCTAProps {
  onClose?: () => void
}

export function UpgradeCTA({ onClose }: UpgradeCTAProps) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Upgrade for Unlimited Analyses
        </CardTitle>
        <CardDescription>
          You've used your free analysis. Upgrade to unlock unlimited profile analyses!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">100 Analyses/Day</h4>
              <p className="text-xs text-muted-foreground">
                Analyze unlimited profiles
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Priority Support</h4>
              <p className="text-xs text-muted-foreground">
                Get help when you need it
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Advanced Features</h4>
              <p className="text-xs text-muted-foreground">
                Access premium tools
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/pricing" className="flex-1">
            <Button className="w-full">View Pricing</Button>
          </Link>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

