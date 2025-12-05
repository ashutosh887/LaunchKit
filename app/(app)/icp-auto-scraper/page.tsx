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
  RotateCcw
} from "lucide-react";

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
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't read that page. Try another URL or add a short product description."
      );
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
    navigator.clipboard.writeText(text);
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
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold">Analyze Your Website</h2>
                <p className="text-muted-foreground text-sm">
                  Get instant insights about your ideal customer profile
                </p>
              </div>
              {(url || productDescription || targetRegion) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-base font-semibold">
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
                    className={`h-11 text-base pr-10 ${error && !validateUrl(url) ? "border-destructive ring-destructive" : ""}`}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="product" className="text-base font-semibold">
                    Product Description <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="product"
                      type="text"
                      placeholder='e.g., "CRM for small agencies"'
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      disabled={loading}
                      className="h-11 text-base pr-10"
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
                  <Label htmlFor="region" className="text-base font-semibold">
                    Target Market <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="region"
                      type="text"
                      placeholder="e.g., US, India, Global"
                      value={targetRegion}
                      onChange={(e) => setTargetRegion(e.target.value)}
                      disabled={loading}
                      className="h-11 text-base pr-10"
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

              {error && (
                <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !url.trim() || !validateUrl(url)}
                className="w-full h-12 text-base font-semibold"
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
            <Card id="icp-result" className="border-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Analysis Complete</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline font-medium"
                        >
                          {new URL(result.url).hostname}
                        </a>
                        <span>•</span>
                        <span>{formatTimeAgo(result.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {result.confidenceScore && (
                    <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {Math.round(result.confidenceScore)}% Confidence
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Ideal Customer Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Role", value: result.icpResult.primaryICP.role, icon: "👤" },
                    { label: "Company Size", value: result.icpResult.primaryICP.companySize, icon: "🏢" },
                    { label: "Industry", value: result.icpResult.primaryICP.industry, icon: "💼" },
                    { label: "Geography", value: result.icpResult.primaryICP.geography, icon: "🌍" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.label}
                      </p>
                      <p className="text-base font-semibold">{item.value}</p>
                    </div>
                  ))}
                  <div className="md:col-span-2 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                      <span>💰</span>
                      Budget
                    </p>
                    <p className="text-base font-semibold">{result.icpResult.primaryICP.budget}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold">Pain Points</h3>
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
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Jobs to be Done</h3>
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
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Where to Find Them</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.icpResult.whereTheyHangOut.map((place, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Messaging Fixes</h3>
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
                      <div className="pt-2.5 border-t border-border/50">
                        <p className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
                          Improved
                        </p>
                        <p className="text-sm font-semibold text-primary leading-relaxed">{fix.improved}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                <div className="flex flex-wrap gap-3 pt-2 border-t">
                  <Button size="lg" className="flex-1 min-w-[200px]">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate GTM Plan
                  </Button>
                  <Button variant="outline" size="lg" disabled>
                    <Globe className="h-4 w-4 mr-2" />
                    Find Warm Leads
                    <span className="ml-2 text-xs opacity-60">(Soon)</span>
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

          {/* History Section */}
          {allHistory.length > 0 && (
            <div className="space-y-4">
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex items-center justify-between w-full text-left p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {historyOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">History ({allHistory.length})</h3>
                    <p className="text-sm text-muted-foreground">Your previous analyses</p>
                  </div>
                </div>
              </button>
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
            <div className="py-12 text-center">
              <div className="max-w-md mx-auto space-y-3">
                <div className="inline-flex p-3 rounded-full bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1.5">No ICPs yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste your first URL above to get started with AI-powered ICP analysis
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
