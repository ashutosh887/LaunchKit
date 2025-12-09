"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { GeneratorPageSkeleton } from "@/components/common/GeneratorPageSkeleton";
import { LoadingState } from "@/components/common/LoadingState";
import { PageContainer } from "@/components/common/PageContainer";
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
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Target,
  Globe,
  Mail,
  Linkedin,
  Twitter,
  FileText,
  Download,
  AlertCircle,
  Sparkles,
  Clock,
  ExternalLink,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils/date";
import {
  exportGTMStrategyToExcel,
} from "@/lib/excel-export";

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
  checklistResult: any;
  createdAt: string;
  updatedAt: string;
  icpAnalysis?: ICPAnalysis;
}

export default function GTMStrategyGeneratorPage() {
  const [icpAnalyses, setIcpAnalyses] = useState<ICPAnalysis[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>("");
  const [selectedIcp, setSelectedIcp] = useState<ICPAnalysis | null>(null);
  const [strategy, setStrategy] = useState<GTMStrategy | null>(null);
  const [allStrategies, setAllStrategies] = useState<GTMStrategy[]>([]);
  const [strategiesOpen, setStrategiesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingStrategy, setFetchingStrategy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        await Promise.all([fetchICPAnalyses(), fetchAllStrategies()]);
      } finally {
        setFetching(false);
      }
    };
    loadData();
    
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const icpId = params.get("icpId");
      if (icpId) {
        setSelectedIcpId(icpId);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedIcpId && icpAnalyses.length > 0) {
      const icp = icpAnalyses.find((a) => a.id === selectedIcpId);
      setSelectedIcp(icp || null);
      fetchStrategy(selectedIcpId);
    } else if (!selectedIcpId) {
      setSelectedIcp(null);
      setStrategy(null);
      setFetchingStrategy(false);
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
    } catch {}
  };

  const fetchAllStrategies = async () => {
    try {
      const response = await fetch("/api/gtm-strategy?limit=50&includeDetails=true");
      if (response.ok) {
        const data = await response.json();
        if (data.strategies) {
          setAllStrategies(data.strategies);
        }
      }
    } catch {}
  };

  const fetchStrategy = async (icpAnalysisId: string) => {
    setFetchingStrategy(true);
    try {
      const response = await fetch(
        `/api/gtm-strategy?icpAnalysisId=${icpAnalysisId}&limit=1&includeDetails=true`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.strategies && data.strategies.length > 0) {
          setStrategy(data.strategies[0]);
        } else {
          setStrategy(null);
        }
      }
    } catch {} finally {
      setFetchingStrategy(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!selectedIcpId) return;

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
        if (response.status === 403) {
          throw new Error(data.error || "You've reached the creation limit on your plan. Please reach out to our support team for further details.");
        }
        throw new Error(data.error || "Failed to generate GTM strategy");
      }

      if (data.strategy) {
        const strategyResponse = await fetch(
          `/api/gtm-strategy/${data.strategy.id}`
        );
        if (strategyResponse.ok) {
          const strategyData = await strategyResponse.json();
          setStrategy(strategyData.strategy);
          fetchAllStrategies();
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate GTM strategy. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportGTM = () => {
    if (!strategy || !strategy.gtmResult) return;
    const icpData = strategy.icpAnalysis?.icpResult;
    exportGTMStrategyToExcel(
      strategy.gtmResult,
      icpData,
      `gtm-strategy-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };



  return (
    <PageContainer>
      <LoadingState
        isLoading={fetching}
        skeleton={<GeneratorPageSkeleton />}
        message="Loading your ICP analyses..."
      >
        <div className="space-y-4 md:space-y-6 min-h-[600px]">
          {icpAnalyses.length > 0 && (
            <>
              <p className="text-sm md:text-base text-muted-foreground">Generate comprehensive go-to-market strategies for your product</p>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Target className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
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
                          (s) => s.icpAnalysisId === analysis.id
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
                <div className="p-3 md:p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <a
                        href={selectedIcp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium flex items-center gap-1 truncate min-w-0"
                      >
                        <span className="truncate">{new URL(selectedIcp.url).hostname}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                      {formatTimeAgo(selectedIcp.updatedAt)}
                    </div>
                  </div>
                  {selectedIcp.primaryICP && (
                    <p className="text-sm text-muted-foreground">
                      ICP: {selectedIcp.primaryICP}
                    </p>
                  )}
                  {selectedIcp.confidenceScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Confidence:
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {Math.round(selectedIcp.confidenceScore)}%
                      </span>
                    </div>
                  )}
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

              {selectedIcpId && !strategy && !fetchingStrategy && (
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={loading}
                  className="w-full h-11 md:h-12 text-sm md:text-base"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" message="" className="mr-2" />
                      Generating GTM Strategy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate GTM Strategy
                    </>
                  )}
                </Button>
              )}

              {fetchingStrategy && (
                <div className="flex items-center justify-center py-12 min-h-[120px]">
                  <LoadingSpinner message="Loading strategy..." />
                </div>
              )}
            </CardContent>
          </Card>

      {strategy && strategy.gtmResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  GTM Strategy Generated
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportGTM}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Full Strategy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {strategy.gtmResult.gtm_summary && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Strategy Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {strategy.gtmResult.gtm_summary}
                  </p>
                </div>
              )}

              {strategy.gtmResult.top_channels_ranked &&
                strategy.gtmResult.top_channels_ranked.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Top Channels (Ranked)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {strategy.gtmResult.top_channels_ranked.map(
                        (channel: any, idx: number) => (
                          <Card key={idx} className="bg-muted/50">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  #{idx + 1} {channel.channel}
                                </CardTitle>
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                  {channel.difficulty}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Why:</span>{" "}
                                {channel.why_it_matters}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Expected:</span>{" "}
                                {channel.expected_results}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              {strategy.gtmResult["48_hour_plan"] && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    48-Hour Launch Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategy.gtmResult["48_hour_plan"].day_1 && (
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-base">Day 1</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {strategy.gtmResult["48_hour_plan"].day_1.map(
                              (task: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                  <span>{task}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {strategy.gtmResult["48_hour_plan"].day_2 && (
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-base">Day 2</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {strategy.gtmResult["48_hour_plan"].day_2.map(
                              (task: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                  <span>{task}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {strategy.messagingResult && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">One-Line Messaging Generated</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your messaging has been generated. Visit the Messaging Generator page to view and export your messaging variants.
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/messaging-generator?icpId=${strategy.icpAnalysisId}`}>
                          Go to Messaging Generator
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {strategy.checklistResult && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Action Checklist Generated</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your action checklist has been generated. Visit the Action Checklist page to view and export your actionable tasks.
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/action-checklist?icpId=${strategy.icpAnalysisId}`}>
                          Go to Action Checklist
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {strategy.gtmResult.messaging && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Messaging Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategy.gtmResult.messaging.email_subject_lines &&
                      strategy.gtmResult.messaging.email_subject_lines.length >
                        0 && (
                        <Card className="bg-muted/50">
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Subject Lines
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {strategy.gtmResult.messaging.email_subject_lines.map(
                                (line: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-muted-foreground"
                                  >
                                    {idx + 1}. {line}
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    {strategy.gtmResult.messaging.linkedin_openers &&
                      strategy.gtmResult.messaging.linkedin_openers.length >
                        0 && (
                        <Card className="bg-muted/50">
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn Openers
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {strategy.gtmResult.messaging.linkedin_openers.map(
                                (line: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-muted-foreground"
                                  >
                                    {idx + 1}. {line}
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    {strategy.gtmResult.messaging.twitter_hooks &&
                      strategy.gtmResult.messaging.twitter_hooks.length >
                        0 && (
                        <Card className="bg-muted/50">
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Twitter className="h-4 w-4" />
                              Twitter Hooks
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {strategy.gtmResult.messaging.twitter_hooks.map(
                                (line: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-muted-foreground"
                                  >
                                    {idx + 1}. {line}
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                </div>
              )}

              {strategy.gtmResult.outreach_templates && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Outreach Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategy.gtmResult.outreach_templates.cold_email && (
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Cold Email
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {strategy.gtmResult.outreach_templates.cold_email}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {strategy.gtmResult.outreach_templates.linkedin_dm && (
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn DM
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {strategy.gtmResult.outreach_templates.linkedin_dm}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {strategy.gtmResult.success_metrics && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Success Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategy.gtmResult.success_metrics.first_48_hours &&
                      strategy.gtmResult.success_metrics.first_48_hours
                        .length > 0 && (
                        <Card className="bg-muted/50">
                          <CardHeader>
                            <CardTitle className="text-sm">First 48 Hours</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {strategy.gtmResult.success_metrics.first_48_hours.map(
                                (metric: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                    <span>{metric}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    {strategy.gtmResult.success_metrics.first_7_days &&
                      strategy.gtmResult.success_metrics.first_7_days.length >
                        0 && (
                        <Card className="bg-muted/50">
                          <CardHeader>
                            <CardTitle className="text-sm">First 7 Days</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {strategy.gtmResult.success_metrics.first_7_days.map(
                                (metric: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                    <span>{metric}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                      Generated Strategies ({allStrategies.length})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your previously generated GTM strategies
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
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-background shrink-0">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {(() => {
                              const icp = icpAnalyses.find(a => a.id === s.icpAnalysisId) || s.icpAnalysis;
                              return icp ? new URL(icp.url).hostname : "Unknown";
                            })()}
                          </p>
                          {(() => {
                            const icp = icpAnalyses.find(a => a.id === s.icpAnalysisId) || s.icpAnalysis;
                            return icp?.primaryICP && (
                              <p className="text-sm text-muted-foreground truncate">
                                {icp.primaryICP}
                              </p>
                            );
                          })()}
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
        </>
          )}

          {icpAnalyses.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-muted">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      No ICP Records Found
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You need to create an ICP analysis first before generating a
                      GTM strategy. Go to the ICP Auto-Scraper page and analyze your
                      website.
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
          )}
        </div>
      </LoadingState>
    </PageContainer>
  );
}
