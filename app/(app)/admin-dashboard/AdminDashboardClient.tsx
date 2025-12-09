"use client";

import { useState, useEffect } from "react";
import { AdminDashboardSkeleton } from "@/components/common/AdminDashboardSkeleton";
import { LoadingState } from "@/components/common/LoadingState";
import { PageContainer } from "@/components/common/PageContainer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  Sparkles,
  Mail,
  Settings,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatTimeAgo, formatDate } from "@/lib/utils/date";

interface AdminStats {
  totalUsers: number;
  usersToday: number;
  usersLast7Days: number;
  usersLast30Days: number;
  totalICPAnalyses: number;
  totalGTMStrategies: number;
  totalWaitlistEntries: number;
  totalSettings: number;
  icpAnalysesToday: number;
  gtmStrategiesToday: number;
  waitlistEntriesToday: number;
  modelPreferences: {
    openai: number;
    anthropic: number;
  };
  userGrowthData: Array<{ date: string; count: number }>;
  activityData: Array<{
    date: string;
    icp: number;
    gtm: number;
    waitlist: number;
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    fullName: string | null;
    createdAt: string;
    lastSignInAt: string | null;
  }>;
  icpByStatus: {
    pending: number;
    completed: number;
    failed: number;
    retrying: number;
  };
  recentICPs: Array<{
    id: string;
    url: string;
    status: string;
    createdAt: string;
    userId: string | null;
  }>;
  recentGTMs: Array<{
    id: string;
    createdAt: string;
    userId: string | null;
  }>;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
    }
  };


  const modelData = stats ? [
    { name: "OpenAI", value: stats.modelPreferences.openai },
    { name: "Anthropic", value: stats.modelPreferences.anthropic },
  ] : [];

  const icpStatusData = stats ? [
    { name: "Completed", value: stats.icpByStatus.completed },
    { name: "Pending", value: stats.icpByStatus.pending },
    { name: "Failed", value: stats.icpByStatus.failed },
    { name: "Retrying", value: stats.icpByStatus.retrying },
  ] : [];

  return (
    <PageContainer maxWidth="7xl">
      <LoadingState
        isLoading={loading}
        skeleton={<AdminDashboardSkeleton />}
        message="Loading admin dashboard..."
      >
        {!stats ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load admin dashboard</p>
            <button
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Platform overview and activity metrics</p>
            <button
              onClick={fetchStats}
              className="flex items-center justify-center p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
              aria-label="Refresh stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-linear-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stats.totalUsers}</span>
                  <span className="text-sm text-muted-foreground">
                    +{stats.usersToday} today
                  </span>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>7d: +{stats.usersLast7Days}</span>
                  <span>30d: +{stats.usersLast30Days}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  ICP Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stats.totalICPAnalyses}</span>
                  <span className="text-sm text-muted-foreground">
                    +{stats.icpAnalysesToday} today
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {stats.icpByStatus.completed} completed
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  GTM Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stats.totalGTMStrategies}</span>
                  <span className="text-sm text-muted-foreground">
                    +{stats.gtmStrategiesToday} today
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Waitlist Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stats.totalWaitlistEntries}</span>
                  <span className="text-sm text-muted-foreground">
                    +{stats.waitlistEntriesToday} today
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
                  User Growth (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.userGrowthData}>
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
                  <Settings className="h-5 w-5" />
                  AI Model Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {modelData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">
                      OpenAI: {stats.modelPreferences.openai}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">
                      Anthropic: {stats.modelPreferences.anthropic}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Breakdown (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => formatDate(value)}
                    />
                    <Legend />
                    <Bar dataKey="icp" fill={COLORS.primary} name="ICP Analyses" />
                    <Bar dataKey="gtm" fill={COLORS.secondary} name="GTM Strategies" />
                    <Bar dataKey="waitlist" fill={COLORS.success} name="Waitlist" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  ICP Analysis Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={icpStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        value > 0 ? `${name}: ${value}` : ""
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {icpStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Completed: {stats.icpByStatus.completed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Pending: {stats.icpByStatus.pending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Failed: {stats.icpByStatus.failed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Retrying: {stats.icpByStatus.retrying}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No users yet
                    </p>
                  ) : (
                    stats.recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.fullName || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatTimeAgo(user.createdAt)}
                          </div>
                          {user.lastSignInAt && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Last: {formatTimeAgo(user.lastSignInAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentICPs.length === 0 && stats.recentGTMs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activities
                    </p>
                  ) : (
                    <>
                      {stats.recentICPs.map((icp) => (
                        <div
                          key={icp.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-background">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                ICP Analysis
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {(() => {
                                  try {
                                    return new URL(icp.url).hostname;
                                  } catch {
                                    return icp.url.length > 30 ? `${icp.url.substring(0, 30)}...` : icp.url;
                                  }
                                })()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                icp.status === "completed"
                                  ? "bg-green-500/20 text-green-500"
                                  : icp.status === "failed"
                                  ? "bg-red-500/20 text-red-500"
                                  : icp.status === "pending"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : "bg-orange-500/20 text-orange-500"
                              }`}
                            >
                              {icp.status}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(icp.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {stats.recentGTMs.map((gtm) => (
                        <div
                          key={gtm.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-background">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">GTM Strategy</p>
                              <p className="text-xs text-muted-foreground">
                                Strategy generated
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(gtm.createdAt)}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </LoadingState>
    </PageContainer>
  );
}

