import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import api from '@/services/api';

export default function CommunicationDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    api.getEmailAnalytics().then(res => {
      if (res.success) setStats(res.stats);
      else setStatsError('Failed to load');
      setStatsLoading(false);
    }).catch(e => { setStatsError(String(e)); setStatsLoading(false); });
    api.getEmailLogs().then(res => {
      if (res.success) setLogs(res.logs || res.data || []);
      else setLogsError('Failed to load');
      setLogsLoading(false);
    }).catch(e => { setLogsError(String(e)); setLogsLoading(false); });
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">User Communication Dashboard</h1>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Communication Log</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card className="mb-6 p-6">
            {statsLoading ? 'Loading...' : statsError ? statsError : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div><div className="text-2xl font-bold">{stats.totalSent}</div><div className="text-sm text-muted-foreground">Total Sent</div></div>
              <div><div className="text-2xl font-bold">{stats.totalOpened}</div><div className="text-sm text-muted-foreground">Total Opened</div></div>
              <div><div className="text-2xl font-bold">{stats.totalClicked}</div><div className="text-sm text-muted-foreground">Total Clicked</div></div>
              <div><div className="text-2xl font-bold">{stats.openRate?.toFixed(2)}%</div><div className="text-sm text-muted-foreground">Open Rate</div></div>
              <div><div className="text-2xl font-bold">{stats.clickRate?.toFixed(2)}%</div><div className="text-sm text-muted-foreground">Click Rate</div></div>
              <div><div className="text-2xl font-bold">{stats.deliveryRate?.toFixed(2)}%</div><div className="text-sm text-muted-foreground">Delivery Rate</div></div>
            </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="compose">
          <Card className="p-6">[Compose & Schedule tool UI (todo)]</Card>
        </TabsContent>
        <TabsContent value="templates">
          <Card className="p-6">[Template manager UI (todo)]</Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card className="p-6">
            {logsLoading ? 'Loading...' : logsError ? logsError : (
              <table className="w-full text-sm">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Type</th><th>Status</th><th>Sent</th><th>Opened</th><th>Clicked</th></tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l._id}>
                      <td>{l.user?.name || l.userId || '-'}</td>
                      <td>{l.email}</td>
                      <td>{l.emailType}</td>
                      <td>{l.status}</td>
                      <td>{l.sentAt ? new Date(l.sentAt).toLocaleString() : '-'}</td>
                      <td>{l.openedAt ? new Date(l.openedAt).toLocaleString() : '-'}</td>
                      <td>{l.clickedAt ? new Date(l.clickedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}