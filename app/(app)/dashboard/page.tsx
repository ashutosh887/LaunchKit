"use client";

import { useState, useEffect } from "react";
import { DashboardSkeleton } from "@/components/common/DashboardSkeleton";
import { LoadingState } from "@/components/common/LoadingState";
import { PageContainer } from "@/components/common/PageContainer";
import { formatTimeAgo } from "@/lib/utils/date";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  TrendingUp,
  MessageSquare,
  CheckSquare,
  ExternalLink,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
  icpAnalysesCount: number;
  gtmStrategiesCount: number;
  messagingCount: number;
  checklistsCount: number;
  recentICPs: Array<{
    id: string;
    url: string;
    primaryICP: string | null;
    confidenceScore: number | null;
    createdAt: string;
  }>;
  recentStrategies: Array<{
    id: string;
    icpAnalysisId: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };


  return (
    <PageContainer>
      <LoadingState
        isLoading={loading}
        skeleton={<DashboardSkeleton />}
        message="Loading dashboard..."
      >
        {!stats ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
          <p className="text-sm md:text-base text-muted-foreground">Overview of your activity and generated content</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-primary/5 h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ICP Analyses
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-3xl font-bold">{stats.icpAnalysesCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  GTM Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-3xl font-bold">{stats.gtmStrategiesCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Messaging Variants
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-3xl font-bold">{stats.messagingCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Action Checklists
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-3xl font-bold">{stats.checklistsCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/30">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                    Recent ICP Analyses
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto shrink-0">
                    <Link href="/icp-auto-scraper">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stats.recentICPs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No ICP analyses yet</p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/icp-auto-scraper">
                        Create Your First ICP
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentICPs.map((icp) => (
                      <div
                        key={icp.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={icp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm hover:underline flex items-center gap-1 truncate"
                            >
                              {new URL(icp.url).hostname}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                          {icp.primaryICP && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {icp.primaryICP}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {icp.confidenceScore && (
                            <span className="text-xs font-semibold text-primary">
                              {Math.round(icp.confidenceScore)}%
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(icp.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                    Recent GTM Strategies
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto shrink-0">
                    <Link href="/gtm-strategy-generator">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stats.recentStrategies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No GTM strategies yet</p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/gtm-strategy-generator">
                        Generate Your First Strategy
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentStrategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                        onClick={() => {
                          window.location.href = `/gtm-strategy-generator?icpId=${strategy.icpAnalysisId}`;
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-background">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">GTM Strategy</p>
                            <p className="text-xs text-muted-foreground">
                              Strategy generated
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(strategy.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Messaging Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate high-conversion messaging lines for your product
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/messaging-generator">
                    Go to Messaging Generator
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Action Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get actionable checklists to execute your GTM strategy
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/action-checklist">
                    Go to Action Checklist
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  ICP Auto-Scraper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze websites to understand your ideal customer profile
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/icp-auto-scraper">
                    Go to ICP Scraper
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          </div>
        )}
      </LoadingState>
    </PageContainer>
  );
}
