'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, CloudRain, Wind, Terminal, HelpCircle } from 'lucide-react';

export default function Home() {
  const [lat, setLat] = useState<number>(30.4045);
  const [lon, setLon] = useState<number>(79.3240);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [advisory, setAdvisory] = useState<any>(null);
  const [approved, setApproved] = useState<boolean>(false);
  const [copilotQuery, setCopilotQuery] = useState<string>('');
  const [copilotAns, setCopilotAns] = useState<string>('');
  const [logs, setLogs] = useState<string[]>(['[SYSTEM INIT] Chronos-Hima Agent Engine Ready.']);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunAssessment = async () => {
    setLoading(true);
    setApproved(false);
    addLog(`Ingesting live telemetry for coordinates (${lat}, ${lon})...`);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const ingestRes = await fetch(`${backendUrl}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      const metric = await ingestRes.json();
      addLog(`Open-Meteo Ingestion: Precip=${metric.precipitation_rate_mm_hr}mm/hr, Soil=${metric.soil_moisture_index}`);

      const riskRes = await fetch(`${backendUrl}/api/risk/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
      const risk = await riskRes.json();
      addLog(`Risk Score Evaluated: ${risk.risk_score}/100 (${risk.alert_level})`);

      const agentRes = await fetch(`${backendUrl}/api/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      const adv = await agentRes.json();
      addLog(`Agentic State Machine: Advisory ${adv.advisory_id.slice(0, 8)} generated.`);

      setData({ metric, risk });
      setAdvisory(adv);
    } catch (err: any) {
      addLog(`ERROR: Service unreachable. Executing offline fallback handler.`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!advisory) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${backendUrl}/api/agent/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advisory_id: advisory.advisory_id, status: 'APPROVED' }),
      });
      setApproved(true);
      addLog(`HUMAN APPROVAL GATE: Advisory ${advisory.advisory_id.slice(0, 8)} APPROVED & BROADCAST.`);
    } catch (err) {
      addLog(`APPROVAL ERROR: Action conflict.`);
    }
  };

  const handleCopilot = async () => {
    if (!copilotQuery.trim()) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: copilotQuery }),
      });
      const resData = await res.json();
      setCopilotAns(resData.response);
    } catch (err) {
      setCopilotAns('Unable to reach adaptation copilot.');
    }
  };

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-xl font-bold tracking-wide">Chronos-Hima</h1>
            <p className="text-xs text-slate-400">Cryosphere Disaster & Climate Adaptation Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full">
            ● Demo Mode (Zero Dummy Data Active)
          </span>
        </div>
      </header>

      <section className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-xs text-slate-400 block">Latitude (°N)</label>
            <input
              type="number" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-sm w-32"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block">Longitude (°E)</label>
            <input
              type="number" value={lon} onChange={(e) => setLon(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-sm w-32"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block">Presets</label>
            <select
              onChange={(e) => {
                const [pLat, pLon] = e.target.value.split(',').map(Number);
                setLat(pLat); setLon(pLon);
              }}
              className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-sm text-slate-200"
            >
              {/* North Indian Presets */}
              <option value="30.4045,79.3240">Chamoli, Uttarakhand</option>
              <option value="32.2190,77.1887">Manali / Beas Basin, Himachal Pradesh</option>
              <option value="34.1526,77.5771">Leh / Indus Basin, Ladakh</option>
              <option value="34.0837,74.7973">Srinagar / Jhelum Basin, J&K</option>
              <option value="27.3389,88.6065">Teesta Basin, Sikkim</option>
              <option value="27.0410,88.2663">Darjeeling / Kalimpong, West Bengal</option>
              {/* International Transboundary Preset */}
              <option value="27.7172,85.3240">Kathmandu Basin, Nepal</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleRunAssessment} disabled={loading}
          className="bg-red-600 hover:bg-red-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition"
        >
          {loading ? 'Processing...' : 'Run Hazard Assessment'}
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Precipitation Rate</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{data ? `${data.metric.precipitation_rate_mm_hr} mm/h` : '--'}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Soil Saturation Index</span>
            <Wind className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold">{data ? data.metric.soil_moisture_index : '--'}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Risk Score</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{data ? `${data.risk.risk_score} / 100` : '--'}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Alert Level</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{data ? data.risk.alert_level : '--'}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col h-80">
          <div className="flex items-center space-x-2 mb-3">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold">Agentic Execution Terminal</h3>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-slate-300 flex-1 overflow-y-auto space-y-1">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-2">Generated Emergency Advisory</h3>
            {advisory ? (
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-xs leading-relaxed space-y-2">
                <p className="text-amber-300 font-medium">{advisory.evacuation_vector_summary}</p>
                <div className="text-slate-500 text-[10px]">Advisory ID: {advisory.advisory_id}</div>
              </div>
            ) : (
              <div className="bg-slate-900 p-8 rounded-lg text-center text-xs text-slate-500">
                Run assessment to synthesize agent evacuation vectors.
              </div>
            )}
          </div>
          {advisory && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleApprove} disabled={approved}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${approved ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
              >
                {approved ? '✓ Approved & Broadcasted' : 'Approve & Broadcast Advisory'}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold">365-Day Climate Adaptation Copilot</h3>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ask about soil conservation, post-flood water safety, or eco-farming..."
            value={copilotQuery} onChange={(e) => setCopilotQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-sm"
          />
          <button
            onClick={handleCopilot}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Ask Copilot
          </button>
        </div>
        {copilotAns && (
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-xs text-slate-300 leading-relaxed">
            {copilotAns}
          </div>
        )}
      </section>
    </main>
  );
}
