"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  Sparkles,
  Target,
  Globe,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Download,
  Share2
} from "lucide-react";
import config from "@/config";
import { formatTimeAgo } from "@/lib/utils/date";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EmptyState } from "@/components/common/EmptyState";
import { exportICPToExcel, exportICPHistoryToExcel } from "@/lib/excel-export";

interface ICPResult {
  primaryICP: {
    role: string;
    companySize: string;
    industry: string;
    geography: string;
    budget: string;
  };
  painPoints: string[];
  jobsToBeDone: string[];
  whereTheyHangOut: string[];
  messagingFixes: Array<{
    current: string;
    improved: string;
  }>;
  confidenceScore: number;
}

interface Analysis {
  id: string;
  url: string;
  primaryICP: string | null;
  confidenceScore: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  icpResult?: ICPResult;
  errorMessage?: string | null;
}

export default function ICPAutoScraperPage() {
  const [url, setUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetRegion, setTargetRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [localHistory, setLocalHistory] = useState<Analysis[]>([]);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [icpCard, setIcpCard] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("launchkit_icp_history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((item: Analysis) => item.status === "completed");
        setLocalHistory(filtered.slice(0, 10));
      } catch (e) {
        console.error("Failed to parse local history", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/icp-scrape?limit=10");
      if (response.ok) {
        const data = await response.json();
        setHistory(data.analyses || []);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const normalizeUrl = (urlString: string): string => {
    if (!urlString.trim()) return urlString;
    let normalized = urlString.trim();
    
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = `https://${normalized}`;
    }
    
    try {
      const urlObj = new URL(normalized);
      if (!urlObj.hostname.startsWith("www.")) {
        urlObj.hostname = `www.${urlObj.hostname}`;
        normalized = urlObj.toString();
      }
      return normalized;
    } catch {
      return normalized;
    }
  };

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return false;
    const normalized = normalizeUrl(urlString);
    try {
      const urlObj = new URL(normalized);
      return urlObj.hostname.includes(".") && !urlString.includes(" ");
    } catch {
      return false;
    }
  };

  const handleReset = () => {
    setUrl("");
    setProductDescription("");
    setTargetRegion("");
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!validateUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    setLoading(true);

    try {
      const response = await fetch("/api/icp-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          productDescription: productDescription.trim() || undefined,
          targetRegion: targetRegion.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(data.error || "You've reached the creation limit on your plan. Please reach out to our support team for further details.");
        }
        throw new Error(data.error || "Failed to analyze website");
      }

      if (data.success && data.analysis) {
        const fullAnalysis = await fetchAnalysis(data.analysis.id);
        if (fullAnalysis && fullAnalysis.status === "completed") {
          setResult(fullAnalysis);
          const newHistory = [fullAnalysis, ...localHistory.filter(h => h.status === "completed")].slice(0, 10);
          setLocalHistory(newHistory);
          localStorage.setItem("launchkit_icp_history", JSON.stringify(newHistory));
          setTimeout(() => {
            document.getElementById("icp-result")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else if (fullAnalysis && fullAnalysis.status === "failed") {
          throw new Error(fullAnalysis.errorMessage || "Analysis failed");
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "We couldn't read that page.";
      
      if (errorMessage.includes("reached the limit") || errorMessage.includes("creation limit")) {
        setError(errorMessage);
      } else if (errorMessage.includes("protection") || errorMessage.includes("Cloudflare") || errorMessage.includes("WAF")) {
        setError(errorMessage);
      } else {
        setError(
          `${errorMessage} This might be due to website protection (Cloudflare, AWS WAF, or similar). If this is your website, try temporarily disabling these protections and retry. Otherwise, try adding a product description to help with the analysis.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (id: string): Promise<Analysis | null> => {
    try {
      const response = await fetch(`/api/icp-scrape/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.analysis;
      }
    } catch (e) {
      console.error("Failed to fetch analysis", e);
    }
    return null;
  };

  const loadFromHistory = async (analysis: Analysis) => {
    if (analysis.icpResult) {
      setResult(analysis);
      setHistoryOpen(false);
      setTimeout(() => {
        document.getElementById("icp-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const full = await fetchAnalysis(analysis.id);
      if (full) {
        setResult(full);
        setHistoryOpen(false);
        setTimeout(() => {
          document.getElementById("icp-result")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };


  const allHistory = [...history, ...localHistory.filter(h => !history.find(ah => ah.id === h.id))]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <p className="text-sm md:text-base text-muted-foreground">Analyze websites to understand your ideal customer profile</p>
              {(url || productDescription || targetRegion) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm md:text-base font-semibold">
                  Website URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="url"
                    type="text"
                    placeholder="https://yourproduct.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    className={`h-10 md:h-11 text-sm md:text-base pr-10 ${error && !validateUrl(url) ? "border-destructive ring-destructive" : ""}`}
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll analyze this page to understand your product and audience
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="product" className="text-sm md:text-base font-semibold">
                    Product Description <span className="text-muted-foreground font-normal text-xs md:text-sm">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="product"
                      type="text"
                      placeholder='e.g., "CRM for small agencies"'
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      disabled={loading}
                      className="h-10 md:h-11 text-sm md:text-base pr-10"
                    />
                    {productDescription && (
                      <button
                        type="button"
                        onClick={() => setProductDescription("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Help the AI understand your product better
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm md:text-base font-semibold">
                    Target Market <span className="text-muted-foreground font-normal text-xs md:text-sm">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="region"
                      type="text"
                      placeholder="e.g., US, India, Global"
                      value={targetRegion}
                      onChange={(e) => setTargetRegion(e.target.value)}
                      disabled={loading}
                      className="h-10 md:h-11 text-sm md:text-base pr-10"
                    />
                    {targetRegion && (
                      <button
                        type="button"
                        onClick={() => setTargetRegion("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Helps tune ICP geography
                  </p>
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              <Button
                type="submit"
                disabled={loading || !url.trim() || !validateUrl(url)}
                className="w-full h-11 md:h-12 text-sm md:text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" message="" className="mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate ICP Analysis
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Takes ~5–10 seconds. We don&apos;t store your credentials or private data.
              </p>
            </form>
          </div>

          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner message="Thinking about your customer..." />
            </div>
          )}

          {!loading && result && result.icpResult && (
            <Card id="icp-result">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg md:text-xl">Analysis Complete</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline font-medium truncate min-w-0"
                        >
                          {new URL(result.url).hostname}
                        </a>
                        <span className="shrink-0">•</span>
                        <span className="shrink-0">{formatTimeAgo(result.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {result.confidenceScore && (
                    <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary font-semibold text-xs md:text-sm shrink-0">
                      {Math.round(result.confidenceScore)}% Confidence
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
                  <h3 className="text-xl md:text-2xl font-bold">Ideal Customer Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Role", value: result.icpResult.primaryICP.role, icon: "👤" },
                    { label: "Company Size", value: result.icpResult.primaryICP.companySize, icon: "🏢" },
                    { label: "Industry", value: result.icpResult.primaryICP.industry, icon: "💼" },
                    { label: "Geography", value: result.icpResult.primaryICP.geography, icon: "🌍" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 md:p-4 rounded-lg bg-muted/50">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.label}
                      </p>
                      <p className="text-sm md:text-base font-semibold break-words">{item.value}</p>
                    </div>
                  ))}
                  <div className="md:col-span-2 p-3 md:p-4 rounded-lg bg-muted/50">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                      <span>💰</span>
                      Budget
                    </p>
                    <p className="text-sm md:text-base font-semibold break-words">{result.icpResult.primaryICP.budget}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-destructive shrink-0" />
                    <h3 className="text-base md:text-lg font-semibold">Pain Points</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {result.icpResult.painPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                        <span className="text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                    <h3 className="text-base md:text-lg font-semibold">Jobs to be Done</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {result.icpResult.jobsToBeDone.map((job, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm leading-relaxed">{job}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                  <h3 className="text-base md:text-lg font-semibold">Where to Find Them</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.icpResult.whereTheyHangOut.map((place, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                    <h3 className="text-base md:text-lg font-semibold">Messaging Fixes</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = result.icpResult!.messagingFixes
                        .map((m) => `Current: ${m.current}\nImproved: ${m.improved}`)
                        .join("\n\n");
                      copyToClipboard(text);
                    }}
                    className="w-full sm:w-auto shrink-0"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.icpResult.messagingFixes.map((fix, idx) => (
                    <div key={idx} className="space-y-2.5 p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                          Current
                        </p>
                        <p className="text-sm leading-relaxed">{fix.current}</p>
                      </div>
                      <div className="pt-2.5">
                        <p className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
                          Improved
                        </p>
                        <p className="text-sm font-semibold text-primary leading-relaxed">{fix.improved}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    size="lg" 
                    className="w-full sm:flex-1 h-11 md:h-12 text-sm md:text-base"
                    onClick={() => {
                      window.location.href = `/gtm-strategy-generator?icpId=${result.id}`;
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate GTM Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:flex-1 h-11 md:h-12 text-sm md:text-base"
                    onClick={() => {
                      if (result.icpResult) {
                        exportICPToExcel(
                          result.icpResult,
                          `icp-analysis-${new Date().toISOString().split("T")[0]}.xlsx`
                        );
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download as Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:flex-1 h-11 md:h-12 text-sm md:text-base"
                    onClick={async () => {
                      if (!result.id) return;
                      setGeneratingCard(true);
                      try {
                        const response = await fetch("/api/icp-card", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ icpAnalysisId: result.id }),
                        });
                        const data = await response.json();
                        if (data.success && data.card) {
                          setIcpCard(data.card);
                        }
                      } catch (e) {
                        console.error("Failed to generate card", e);
                      } finally {
                        setGeneratingCard(false);
                      }
                    }}
                    disabled={generatingCard}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {generatingCard ? "Generating..." : "Generate Shareable Card"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      const summary = `ICP: ${result.icpResult!.primaryICP.role} - ${result.icpResult!.primaryICP.industry}\n\nPain Points:\n${result.icpResult!.painPoints.map(p => `• ${p}`).join("\n")}\n\nJobs to be Done:\n${result.icpResult!.jobsToBeDone.map(j => `• ${j}`).join("\n")}`;
                      copyToClipboard(summary);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {icpCard && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Shareable ICP Card
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const cardText = `${icpCard.card_title || "ICP Summary"}\n\n${icpCard.icp_line || ""}\n\nTop Pain Points:\n${icpCard.pain_points?.map((p: string) => `• ${p}`).join("\n") || ""}\n\nMessaging Hook:\n${icpCard.messaging_hook || ""}\n\nWhere They Hang Out:\n${icpCard.where_they_hangout?.map((w: string) => `• ${w}`).join("\n") || ""}\n\n${icpCard.footer || `Generated by ${config.projectNameWithVersion} 🚀`}`;
                      copyToClipboard(cardText);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                  <h3 className="text-xl font-bold mb-2">{icpCard.card_title || "ICP Summary"}</h3>
                  <p className="text-base mb-4">{icpCard.icp_line || ""}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1.5">Top Pain Points</p>
                      <ul className="space-y-1">
                        {icpCard.pain_points?.map((point: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1.5">Messaging Hook</p>
                      <p className="text-sm font-semibold text-primary">{icpCard.messaging_hook || ""}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1.5">Where They Hang Out</p>
                      <div className="flex flex-wrap gap-2">
                        {icpCard.where_they_hangout?.map((place: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {place}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    {icpCard.footer || "Generated by LaunchKit 🚀"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {allHistory.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="flex items-center gap-3 text-left flex-1 hover:bg-muted/70 transition-colors rounded-lg p-2 -m-2"
                >
                  {historyOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">History ({allHistory.length})</h3>
                    <p className="text-sm text-muted-foreground">Your previous analyses</p>
                  </div>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    exportICPHistoryToExcel(
                      allHistory,
                      `icp-history-${new Date().toISOString().split("T")[0]}.xlsx`
                    );
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
              </div>
              {historyOpen && (
                <div className="space-y-2">
                  {allHistory.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group"
                      onClick={() => loadFromHistory(analysis)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-background shrink-0">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{new URL(analysis.url).hostname}</p>
                          {analysis.primaryICP && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {analysis.primaryICP}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(analysis.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          loadFromHistory(analysis); 
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && !result && allHistory.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No ICPs yet"
              description="Paste your first URL above to get started with AI-powered ICP analysis"
            />
          )}
        </div>
      </div>
    </div>
  );
}
