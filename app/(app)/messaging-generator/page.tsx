"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Download,
  Sparkles,
  AlertCircle,
  Target,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { exportMessagingToExcel } from "@/lib/excel-export";

interface ICPAnalysis {
  id: string;
  url: string;
  primaryICP: string | null;
  confidenceScore: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  icpResult?: any;
}

interface GTMStrategy {
  id: string;
  icpAnalysisId: string;
  gtmResult: any;
  messagingResult: any;
  createdAt: string;
}

export default function MessagingGeneratorPage() {
  const [icpAnalyses, setIcpAnalyses] = useState<ICPAnalysis[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>("");
  const [selectedIcp, setSelectedIcp] = useState<ICPAnalysis | null>(null);
  const [strategy, setStrategy] = useState<GTMStrategy | null>(null);
  const [messaging, setMessaging] = useState<any>(null);
  const [allStrategies, setAllStrategies] = useState<GTMStrategy[]>([]);
  const [strategiesOpen, setStrategiesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchICPAnalyses(), fetchAllStrategies()]);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedIcpId) {
      const icp = icpAnalyses.find((a) => a.id === selectedIcpId);
      setSelectedIcp(icp || null);
      fetchStrategy(selectedIcpId);
    } else {
      setSelectedIcp(null);
      setStrategy(null);
      setMessaging(null);
    }
  }, [selectedIcpId, icpAnalyses]);

  const fetchICPAnalyses = async () => {
    try {
      const response = await fetch("/api/icp-scrape?limit=50");
      if (response.ok) {
        const data = await response.json();
        const apiAnalyses = data.analyses || [];

        const stored = localStorage.getItem("launchkit_icp_history");
        let localAnalyses: ICPAnalysis[] = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            localAnalyses = parsed.filter(
              (item: ICPAnalysis) => item.status === "completed"
            );
          } catch {}
        }

        const allAnalyses = [
          ...apiAnalyses,
          ...localAnalyses.filter(
            (local: ICPAnalysis) =>
              !apiAnalyses.find((api: ICPAnalysis) => api.id === local.id)
          ),
        ].sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        });

        setIcpAnalyses(allAnalyses);
      }
    } catch {} finally {
      setFetching(false);
    }
  };

  const fetchAllStrategies = async () => {
    try {
      const response = await fetch("/api/gtm-strategy?limit=50");
      if (response.ok) {
        const data = await response.json();
        if (data.strategies) {
          const strategiesWithDetails = await Promise.all(
            data.strategies
              .filter((s: GTMStrategy) => s.messagingResult)
              .map(async (s: GTMStrategy) => {
                try {
                  const detailResponse = await fetch(`/api/gtm-strategy/${s.id}`);
                  if (detailResponse.ok) {
                    return (await detailResponse.json()).strategy;
                  }
                } catch {}
                return s;
              })
          );
          setAllStrategies(strategiesWithDetails);
        }
      }
    } catch {}
  };

  const fetchStrategy = async (icpAnalysisId: string) => {
    try {
      const response = await fetch(
        `/api/gtm-strategy?icpAnalysisId=${icpAnalysisId}&limit=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.strategies && data.strategies.length > 0) {
          const strategyId = data.strategies[0].id;
          const strategyResponse = await fetch(`/api/gtm-strategy/${strategyId}`);
          if (strategyResponse.ok) {
            const strategyData = await strategyResponse.json();
            setStrategy(strategyData.strategy);
            if (strategyData.strategy.messagingResult) {
              setMessaging(strategyData.strategy.messagingResult);
            }
          }
        }
      }
    } catch {}
  };

  const handleGenerateMessaging = async () => {
    if (!selectedIcpId || !strategy) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gtm-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icpAnalysisId: selectedIcpId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate messaging");
      }

      if (data.strategy && data.strategy.messagingResult) {
        setMessaging(data.strategy.messagingResult);
        fetchAllStrategies();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate messaging. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!messaging) return;
    exportMessagingToExcel(
      messaging,
      `messaging-variants-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (fetching) {
    return (
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner message="Loading your ICP analyses..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (icpAnalyses.length === 0) {
    return (
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-muted">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      No ICP Records Found
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You need to create an ICP analysis first. Go to the ICP
                      Auto-Scraper page and analyze your website.
                    </p>
                    <Button asChild>
                      <a href="/icp-auto-scraper">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create ICP Analysis
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <p className="text-muted-foreground">Generate high-conversion messaging lines for your product</p>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Select ICP Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedIcpId} onValueChange={setSelectedIcpId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an ICP analysis..." />
                </SelectTrigger>
                <SelectContent>
                  {icpAnalyses
                    .filter(
                      (analysis) =>
                        !allStrategies.some(
                          (s) => s.icpAnalysisId === analysis.id && s.messagingResult
                        )
                    )
                    .map((analysis) => (
                      <SelectItem key={analysis.id} value={analysis.id}>
                        {new URL(analysis.url).hostname}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedIcp && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <a
                        href={selectedIcp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        {new URL(selectedIcp.url).hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatTimeAgo(selectedIcp.updatedAt)}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {selectedIcpId && !messaging && (
                <Button
                  onClick={handleGenerateMessaging}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" message="" className="mr-2" />
                      Generating Messaging...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate One-Line Messaging
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {allStrategies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <button
                  onClick={() => setStrategiesOpen(!strategiesOpen)}
                  className="flex items-center gap-3 text-left flex-1 hover:bg-muted/70 transition-colors rounded-lg p-2 -m-2"
                >
                  {strategiesOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      Generated Messaging ({allStrategies.length})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your previously generated messaging
                    </p>
                  </div>
                </button>
              </div>
              {strategiesOpen && (
                <div className="space-y-2">
                  {allStrategies.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group"
                      onClick={() => {
                        setSelectedIcpId(s.icpAnalysisId);
                        setStrategy(s);
                        if (s.messagingResult) {
                          setMessaging(s.messagingResult);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-background shrink-0">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {s.icpAnalysis
                              ? new URL(s.icpAnalysis.url).hostname
                              : "Unknown"}
                          </p>
                          {s.icpAnalysis?.primaryICP && (
                            <p className="text-sm text-muted-foreground truncate">
                              {s.icpAnalysis.primaryICP}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <Clock className="h-4 w-4" />
                        {formatTimeAgo(s.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {messaging && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    One-Line Messaging
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {messaging.landing_page_headline && (
                  <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Landing Page Headline
                    </p>
                    <p className="text-2xl font-bold">{messaging.landing_page_headline}</p>
                  </div>
                )}

                {messaging.value_prop_one_liner && (
                  <div className="p-6 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Value Prop One-Liner
                    </p>
                    <p className="text-lg font-semibold">{messaging.value_prop_one_liner}</p>
                  </div>
                )}

                {messaging.dm_opener && (
                  <div className="p-6 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      DM Opener
                    </p>
                    <p className="text-base">{messaging.dm_opener}</p>
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> These messaging lines are optimized for
                    9-13 words, pain-first, and outcome-driven. Use them across your
                    landing pages, DMs, and outreach campaigns.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
