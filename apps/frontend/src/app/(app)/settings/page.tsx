import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const usagePercent = 35;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Plan limits, API configuration and billing coming soon.
          </p>
        </div>
        <Button className="bg-accent text-white rounded-xl shadow-soft hover:opacity-90" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Upgrade
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass rounded-2xl border-0 shadow-soft">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Usage</CardTitle>
            <Badge variant="glass">Beta</Badge>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Leads scanned this month</span>
              <span>350 / 1,000</span>
            </div>
            <Progress value={usagePercent} />
            <p className="text-xs text-muted-foreground">
              In MVP this is static. Later we’ll show your real quota and billing status.
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl border-0 shadow-soft">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-sm text-muted-foreground">
            <p>Stripe billing, webhooks and outbound integrations (HubSpot, Slack) are planned.</p>
            <p>For now, you can configure everything via environment variables on the backend.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
