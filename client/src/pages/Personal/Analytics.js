import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { Download, TrendingUp, Award, Zap } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const gridColor = 'rgba(255,255,255,0.04)';
const tickColor = '#3d3d55';

export default function Analytics() {
  const { user } = useAuth();
  const [weekly,   setWeekly]    = useState([]);
  const [monthly,  setMonthly]   = useState([]);
  const [catData,  setCatData]   = useState([]);
  const [tab,      setTab]       = useState('weekly');

  useEffect(() => {
    api.get('/analytics/weekly').then(r  => setWeekly(r.data)).catch(()=>{});
    api.get('/analytics/monthly').then(r => setMonthly(r.data)).catch(()=>{});
    api.get('/analytics/category-breakdown').then(r => setCatData(r.data)).catch(()=>{});
  }, []);

  const weeklyChart = {
    labels: weekly.map(d => d.date),
    datasets: [
      { label:'Completed', data: weekly.map(d=>d.completed), backgroundColor:'rgba(16,185,129,0.75)', borderRadius:6, borderSkipped:false },
      { label:'Total',     data: weekly.map(d=>d.total),     backgroundColor:'rgba(139,92,246,0.25)', borderRadius:6, borderSkipped:false },
    ],
  };

  const monthlyChart = {
    labels: monthly.map(d=>d.week),
    datasets:[{
      label:'Productivity %',
      data: monthly.map(d=>d.productivity),
      fill:true, borderColor:'#f59e0b',
      backgroundColor:'rgba(245,158,11,0.08)',
      tension:0.4, pointBackgroundColor:'#f59e0b', pointRadius:5,
    }],
  };

  const PALETTE = ['#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4','#ec4899','#a78bfa'];
  const donutChart = {
    labels: catData.map(c=>c.category),
    datasets:[{ data: catData.map(c=>c.total), backgroundColor: PALETTE.slice(0,catData.length), borderWidth:0 }],
  };

  const baseOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ color:'#7c7c9a', font:{size:11}, boxWidth:12 } } },
    scales:{
      x:{ grid:{color:gridColor}, ticks:{color:tickColor, font:{size:11}} },
      y:{ grid:{color:gridColor}, ticks:{color:tickColor, font:{size:11}} },
    },
  };

  const exportPDF = async () => {
    const t = toast.loading('Generating PDF report...');
    try {
      const [statsRes, summaryRes] = await Promise.all([
        api.get('/tasks/today-stats'),
        api.post('/ai/summary', { productivity: 0, completed:0, streak: user?.streak||0 }),
      ]);
      const { productivity, completed, total } = statsRes.data;
      const pdf = new jsPDF();
      pdf.setFontSize(22); pdf.setTextColor(139,92,246);
      pdf.text('ProgressPulse Report', 20, 25);
      pdf.setFontSize(11); pdf.setTextColor(100,100,130);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} · User: ${user?.name}`, 20, 34);
      pdf.setDrawColor(50,50,70); pdf.line(20, 38, 190, 38);
      pdf.setFontSize(14); pdf.setTextColor(30,30,50);
      pdf.text('Today\'s Summary', 20, 50);
      pdf.setFontSize(12); pdf.setTextColor(60,60,80);
      pdf.text(`Productivity: ${productivity}%`, 20, 60);
      pdf.text(`Tasks Completed: ${completed} / ${total}`, 20, 68);
      pdf.text(`Current Streak: ${user?.streak||0} days`, 20, 76);
      pdf.setFontSize(14); pdf.setTextColor(30,30,50);
      pdf.text('AI Summary', 20, 92);
      pdf.setFontSize(11); pdf.setTextColor(60,60,80);
      const lines = pdf.splitTextToSize(summaryRes.data.summary, 170);
      pdf.text(lines, 20, 102);
      pdf.setFontSize(14); pdf.setTextColor(30,30,50);
      pdf.text('Weekly Performance', 20, 130);
      weekly.forEach((day, i) => {
        pdf.setFontSize(10); pdf.setTextColor(80,80,100);
        pdf.text(`${day.date}: ${day.completed}/${day.total} tasks — ${day.productivity}%`, 24, 140+i*9);
      });
      pdf.save(`ProgressPulse_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss(t); toast.success('PDF exported! 📄');
    } catch { toast.dismiss(t); toast.error('Export failed'); }
  };

  const avgProd  = weekly.length ? Math.round(weekly.reduce((a,d)=>a+d.productivity,0)/weekly.length) : 0;
  const weekDone = weekly.reduce((a,d)=>a+d.completed,0);

  const summaryCards = [
    { label:'Avg Productivity', value:`${avgProd}%`, color:'#8b5cf6', icon:Zap },
    { label:'Tasks This Week',  value:weekDone,       color:'#10b981', icon:Award },
    { label:'Current Streak',   value:`${user?.streak||0}d`, color:'#f59e0b', icon:TrendingUp },
    { label:'Total Completed',  value:user?.totalTasksCompleted||0, color:'#06b6d4', icon:Award },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep dive into your productivity patterns</p>
        </div>
        <button className="btn btn-primary" onClick={exportPDF}><Download size={15}/>Export PDF</button>
      </div>

      <div className="stats-grid" style={{ marginBottom:18 }}>
        {summaryCards.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background:`${s.color}15` }}><s.icon size={17} color={s.color}/></div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom:18 }}>
        {[{k:'weekly',label:'📅 Weekly'},{k:'monthly',label:'📆 Monthly'},{k:'categories',label:'🗂️ Categories'}].map(t=>(
          <button key={t.k} className={`tab ${tab===t.k?'active':''}`} onClick={()=>setTab(t.k)}>{t.label}</button>
        ))}
      </div>

      <div className="card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
          <TrendingUp size={17} color="var(--primary-light)"/>
          <h3 style={{ fontWeight:700, fontSize:'0.95rem' }}>
            {tab==='weekly'?'Weekly Task Overview':tab==='monthly'?'Monthly Productivity Trend':'Tasks by Category'}
          </h3>
        </div>
        <div style={{ height:280 }}>
          {tab==='weekly' && (
            <Bar data={weeklyChart} options={{ ...baseOpts }}/>
          )}
          {tab==='monthly' && (
            <Line data={monthlyChart} options={{ ...baseOpts, scales:{...baseOpts.scales, y:{...baseOpts.scales.y, min:0, max:100}} }}/>
          )}
          {tab==='categories' && (
            catData.length===0
              ? <div style={{ textAlign:'center', color:'var(--text-muted)', paddingTop:100 }}>Add and complete tasks first!</div>
              : <div style={{ maxWidth:280, margin:'0 auto' }}>
                  <Doughnut data={donutChart} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{color:'#7c7c9a', font:{size:11}} } } }}/>
                </div>
          )}
        </div>
      </div>
    </div>
  );
}
