import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Target } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Optimize Your LinkedIn Profile
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get AI-powered insights to boost your LinkedIn visibility and land your dream job
          </p>
          <Link href="/tools/profile-analyzer">
            <Button size="lg" className="text-lg px-8">
              Analyze Your Profile
            </Button>
          </Link>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Get detailed feedback on your headline, about section, and overall profile
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Actionable Insights</CardTitle>
                <CardDescription>
                  Receive specific, copy-paste ready suggestions to improve your profile
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Persona-Specific</CardTitle>
                <CardDescription>
                  Tailored recommendations based on your career stage and goals
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

