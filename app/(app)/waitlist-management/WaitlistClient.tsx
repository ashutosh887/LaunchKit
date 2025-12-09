"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WaitlistTable } from "@/components/waitlist/WaitlistTable";
import { formatTimeAgo, formatDate } from "@/lib/utils/date";

interface WaitlistStats {
  totalEntries: number;
  entriesToday: number;
  entriesLast7Days: number;
  entriesLast30Days: number;
  growthData: Array<{ date: string; count: number }>;
  dailySignups: Array<{ date: string; signups: number }>;
  recentEntries: Array<{
    id: string;
    email: string;
    ventureName: string;
    createdAt: string;
  }>;
}

interface WaitlistEntry {
  id: string;
  email: string;
  ventureName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WaitlistClientProps {
  entries: WaitlistEntry[];
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
};

export function WaitlistClient({ entries }: WaitlistClientProps) {
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/waitlist/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch waitlist stats:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">View and manage all waitlist signups</p>
            <button
              onClick={fetchStats}
              className="flex items-center justify-center p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
              aria-label="Refresh stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <LoadingSpinner message="Loading stats..." />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-linear-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Total Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{stats.totalEntries}</span>
                      <span className="text-sm text-muted-foreground">
                        +{stats.entriesToday} today
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>7d: +{stats.entriesLast7Days}</span>
                      <span>30d: +{stats.entriesLast30Days}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Today&apos;s Signups
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{stats.entriesToday}</span>
                      <span className="text-sm text-muted-foreground">
                        new entries
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Last 7 Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{stats.entriesLast7Days}</span>
                      <span className="text-sm text-muted-foreground">
                        signups
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Last 30 Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{stats.entriesLast30Days}</span>
                      <span className="text-sm text-muted-foreground">
                        signups
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Waitlist Growth (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.growthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => formatDate(value)}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => formatDate(value)}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS.primary}
                          strokeWidth={2}
                          dot={{ fill: COLORS.primary }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Daily Signups (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.dailySignups}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => formatDate(value)}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => formatDate(value)}
                        />
                        <Bar dataKey="signups" fill={COLORS.secondary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {stats.recentEntries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Signups
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {entry.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {entry.ventureName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-3">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(entry.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                All Waitlist Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-lg bg-card overflow-hidden">
                <WaitlistTable data={entries} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

