"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SettingsSkeleton } from "@/components/settings/SettingsSkeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Save, Twitter, Crown } from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import config from "@/config";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AIProvider = "openai" | "anthropic";

interface PlanInfo {
  plan: "trial" | "pro";
  usageCount: number;
  maxCreations: number;
}

interface SettingsClientProps {
  initialPlanInfo: PlanInfo | null;
}

export function SettingsClient({ initialPlanInfo }: SettingsClientProps) {
  const [aiProvider, setAiProvider] = useState<AIProvider>("openai");
  const [originalProvider, setOriginalProvider] = useState<AIProvider>("openai");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo>(
    initialPlanInfo || { plan: "trial", usageCount: 0, maxCreations: 3 }
  );

  useEffect(() => {
    loadSettings();
    if (!initialPlanInfo) {
      loadPlanInfo();
    }
  }, [initialPlanInfo]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/settings");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Failed to load settings (${response.status})`);
      }

      const data = await response.json();
      if (data.settings) {
        const provider = data.settings.aiProvider || "openai";
        setAiProvider(provider);
        setOriginalProvider(provider);
      } else {
        throw new Error("No settings data received");
      }
    } catch (err) {
      console.error("Settings load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const loadPlanInfo = async () => {
    try {
      const response = await fetch("/api/plan");
      if (response.ok) {
        const data = await response.json();
        setPlanInfo(data);
      }
    } catch (err) {
      console.error("Plan info load error:", err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProvider,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSaved(true);
      setOriginalProvider(aiProvider);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = aiProvider !== originalProvider;

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6 md:space-y-8">
          <p className="text-sm md:text-base text-muted-foreground">Manage your account settings and preferences</p>

          {loading ? (
            <SettingsSkeleton />
          ) : (
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <Label htmlFor="ai-provider" className="text-sm md:text-base font-semibold">
                  AI Provider
                </Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Select
                    value={aiProvider}
                    onValueChange={(value) => setAiProvider(value as AIProvider)}
                  >
                    <SelectTrigger id="ai-provider" className="flex-1 h-10 md:h-11 text-sm md:text-base">
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanged}
                    className="h-10 md:h-11 text-sm font-medium w-full sm:w-auto"
                    size="default"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" message="" className="mr-2" />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Model Preference
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {aiProvider === "openai"
                    ? "Uses OpenAI's GPT models for AI-powered features"
                    : "Uses Anthropic's Claude models for AI-powered features"}
                </p>
              </div>

              {error && <ErrorMessage message={error} />}

              {saved && !error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">Model preference saved successfully</p>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Crown className="h-4 w-4 md:h-5 md:w-5" />
                    Plan & Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Plan</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">{planInfo.plan === "pro" ? "Pro" : "Trial"} Plan</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          planInfo.plan === "pro"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {planInfo.plan === "pro" ? "PRO" : "TRIAL"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {planInfo.maxCreations > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Usage</p>
                        <p className="text-sm text-muted-foreground">
                          {planInfo.usageCount} / {planInfo.maxCreations}
                        </p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((planInfo.usageCount / planInfo.maxCreations) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      {planInfo.usageCount >= planInfo.maxCreations && (
                        <p className="text-xs text-destructive">
                          You&apos;ve reached the limit of {planInfo.maxCreations} creations on the trial plan.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Need help or want to upgrade your plan? Reach out to us on X.
                  </p>
                  <Link
                    href={config.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Reach out on X</p>
                      <p className="text-xs text-muted-foreground">@launchkitapp</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

