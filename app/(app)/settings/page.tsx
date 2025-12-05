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
import { CheckCircle2, Save, AlertCircle } from "lucide-react";

type AIProvider = "openai" | "anthropic";

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState<AIProvider>("openai");
  const [originalProvider, setOriginalProvider] = useState<AIProvider>("openai");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

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
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-muted-foreground text-sm">
              Manage your account settings and preferences
            </p>
          </div>

          {loading ? (
            <SettingsSkeleton />
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ai-provider" className="text-base font-semibold">
                  AI Provider
                </Label>
                <div className="flex items-center gap-3">
                  <Select
                    value={aiProvider}
                    onValueChange={(value) => setAiProvider(value as AIProvider)}
                  >
                    <SelectTrigger id="ai-provider" className="flex-1 h-11 text-base">
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
                    className="h-11 text-sm font-medium"
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

            {error && (
              <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

              {saved && !error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">Model preference saved successfully</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
