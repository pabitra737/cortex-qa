'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Download } from 'lucide-react';
import NavigationLayout from '@/components/NavigationLayout';

export default function ReportPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const handleSavePdf = () => {
    window.print();
  };

  // Mock project details matching ACME Manufacturing or fallback
  const isAcme = projectId === 'proj-1';
  const clientName = isAcme ? 'ACME Manufacturing' : 'Reliance Industries';
  const siteLocation = isAcme ? 'Bhiwadi, Rajasthan' : 'Jamnagar Refinery';
  const panelType = isAcme ? 'MCC' : 'APFC';
  const inspectorName = isAcme ? 'Rahul Sharma' : 'Unassigned';
  const serialNo = isAcme ? 'VIREON-INST-2026-018' : 'VIREON-INST-2026-019';
  const installDate = isAcme ? '22 Jul 2026' : '—';
  
  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto px-2 pb-16">
        
        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            header, nav, footer, .no-print {
              display: none !important;
            }
            body {
              background-color: white !important;
              color: black !important;
            }
            .print-page {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              max-width: 100% !important;
              margin: 0 !important;
            }
          }
        `}</style>

        {/* Header Block (Hidden during print) */}
        <div className="flex justify-between items-center no-print">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push(`/inspections/${projectId}`)}
              className="h-8 w-8 flex items-center justify-center border border-border-custom bg-bg-surface hover:bg-slate-100 rounded-full cursor-pointer transition-colors shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 text-text-base stroke-[2.5px]" />
            </button>
            <h1 className="text-sm font-bold text-text-base">Install Report Preview</h1>
          </div>
          <button
            onClick={handleSavePdf}
            className="bg-[#B45309] hover:bg-[#9C4207] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center cursor-pointer transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 stroke-[2.5px]" />
            <span>Save as PDF</span>
          </button>
        </div>

        {/* Report Document Page */}
        <div className="print-page bg-white border border-slate-100 rounded-2xl shadow-sm p-8 space-y-8">
          
          {/* Top Title & Metadata */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-[#B45309] tracking-wider uppercase">
                Vireontech Global Pvt Ltd
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Cortex Installation Report
              </h2>
              <p className="text-[11px] text-slate-400 italic">
                Field installation & commissioning record
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Report generated</div>
              <div className="text-xs font-bold text-slate-900">25 Jul 2026</div>
              <div className="text-[10px] font-semibold text-slate-400">{serialNo}</div>
            </div>
          </div>

          {/* Thin Divider */}
          <div className="h-px bg-orange-100/70 w-full"></div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client</div>
                <div className="text-slate-900 font-bold mt-1">{clientName}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inspector</div>
                <div className="text-slate-900 font-bold mt-1">{inspectorName}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Site</div>
                <div className="text-slate-900 font-bold mt-1">{siteLocation}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Install Date</div>
                <div className="text-slate-900 font-bold mt-1">{installDate}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Panel Type</div>
                <div className="text-slate-900 font-bold mt-1">{panelType}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gateway Serial</div>
                <div className="text-slate-900 font-bold mt-1">OK</div>
              </div>
            </div>
          </div>

          {/* Metrics summary boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Total Checks</span>
              <span className="text-xl font-black text-slate-900 mt-2">66</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Passed</span>
              <span className="text-xl font-black text-green-600 mt-2">17</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Stages Completed</span>
              <span className="text-xl font-black text-[#B45309] mt-2">{isAcme ? '2/13' : '0/13'}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Result</span>
              <span className="text-xl font-black text-green-600 mt-2">{isAcme ? 'PASS' : '—'}</span>
            </div>
          </div>

          {/* Section 1: Billing Data */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-black text-[#B45309] uppercase tracking-wider">
              1 · Historical Billing Data
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Discom</div>
                <div className="text-slate-900 font-bold mt-1">OK</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Consumer #</div>
                <div className="text-slate-900 font-bold mt-1">OK</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Tariff Category</div>
                <div className="text-slate-900 font-bold mt-1">OK</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Sanctioned Load</div>
                <div className="text-slate-900 font-bold mt-1">OK kW</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Contract Demand</div>
                <div className="text-slate-900 font-bold mt-1">OK kVA</div>
              </div>
            </div>

            {/* Billing Months Row */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] text-slate-400 font-bold">Bills on file (6 months)</div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
                {['Jun 2026', 'May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026'].map((m) => (
                  <div key={m} className="bg-green-50/50 border border-green-200/50 text-green-700 rounded-lg p-2.5 text-center text-xs font-bold shadow-sm">
                    <div>{m}</div>
                    <div className="text-[9.5px] mt-0.5 text-green-600/90 font-medium">✓ Filed</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Installation Checklist Results */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-black text-[#B45309] uppercase tracking-wider">
              2 · Installation Checklist Results
            </h3>

            {/* Stages Detail Lists */}
            <div className="space-y-6">
              
              {/* Stage 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-800">Stage 1 · Site Survey</h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-green-50 text-green-700 border border-green-100/50 rounded">
                    COMPLETED
                  </span>
                </div>
                <div className="border border-slate-100/80 rounded-xl px-4 divide-y divide-slate-100/80">
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Panel type identified</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Incoming supply confirmed</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Existing CT ratio</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">4G signal at gateway location</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Nameplate photo captured</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-800">Stage 2 · Historical Billing Data</h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-orange-50 text-[#B45309] border border-orange-100/50 rounded">
                    IN PROGRESS
                  </span>
                </div>
                <div className="border border-slate-100/80 rounded-xl px-4 divide-y divide-slate-100/80">
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">DISCOM name</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Consumer number</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Sanctioned load</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Contract demand (HT/LT-Industrial only)</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Tariff category</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">6 months of electricity bills</span>
                    <span className="text-green-600 font-bold">6/6 uploaded</span>
                  </div>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-800">Stage 3 · Kit & BOM Verification</h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-green-50 text-green-700 border border-green-100/50 rounded">
                    COMPLETED
                  </span>
                </div>
                <div className="border border-slate-100/80 rounded-xl px-4 divide-y divide-slate-100/80">
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Gateway serial number</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">SIM IMEI recorded</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Meter model verified</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">CT count matches BOM</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">RS485 cable ≥ 0.5 sqmm shielded twisted pair</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">6A MCB for gateway supply included</span>
                    <span className="text-green-600 font-bold">OK</span>
                  </div>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-800">Stage 4 · Panel Preparation</h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-orange-50 text-[#B45309] border border-orange-100/50 rounded">
                    IN PROGRESS
                  </span>
                </div>
                <div className="border border-slate-100/80 rounded-xl px-4 divide-y divide-slate-100/80 text-xs">
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Client work permit signed</span>
                    <span className="text-slate-400">—</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Panel isolated OR live-work permit obtained</span>
                    <span className="text-slate-400">—</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">PPE worn</span>
                    <span className="text-slate-400">—</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Voltage tester confirms dead (if isolated)</span>
                    <span className="text-slate-400">—</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-xs">
                    <span className="text-slate-600 font-medium">Free MCB slot identified</span>
                    <span className="text-slate-400">—</span>
                  </div>
                </div>
              </div>

              {/* Remaining Stages (5 to 13) */}
              {[
                {
                  num: 5,
                  name: 'Meter Mounting',
                  fields: [
                    'DIN rail available or new rail fitted',
                    'Meter clipped and secured',
                    'CT ratio DIP switches / programmed',
                    'Photo of mounted meter'
                  ]
                },
                {
                  num: 6,
                  name: 'CT Installation & Wiring',
                  fields: [
                    'CT P1 faces source side (incoming supply)',
                    'R-phase CT: S1 → meter ik1, S2 → meter il1',
                    'Y-phase CT: S1 → ik2, S2 → il2',
                    'B-phase CT: S1 → ik3, S2 → il3',
                    'CT secondaries ferruled and torqued',
                    'Shorting links removed (after wiring)',
                    'Photo: CT wiring with phase labels visible'
                  ]
                },
                {
                  num: 7,
                  name: 'Voltage Sensing',
                  fields: [
                    '2A MCB fitted for voltage sensing',
                    'R -> meter V1, Y -> V2, B -> V3, N -> Vn',
                    'Phase sequence RYB verified',
                    'Neutral continuity confirmed'
                  ]
                },
                {
                  num: 8,
                  name: 'Meter Configuration',
                  fields: [
                    'CT ratio configured',
                    'PT ratio set to 1:1 (LT direct)',
                    'Modbus baud rate 9600, 8N1',
                    'Modbus slave ID (unique on bus)',
                    'Meter display shows sensible V, I, kW'
                  ]
                },
                {
                  num: 9,
                  name: 'Gateway Mounting',
                  fields: [
                    'Enclosure positioned away from HT / VFD zone',
                    'Antenna routed outside metal enclosure',
                    'Chassis earthed to panel PE bar',
                    'Cable glands used for all penetrations'
                  ]
                },
                {
                  num: 10,
                  name: 'RS485 Communication',
                  fields: [
                    'Meter A -> Gateway A, Meter B -> Gateway B',
                    'Shield grounded at gateway end only',
                    '120Ω termination at last device on the bus',
                    'Cable length recorded'
                  ]
                },
                {
                  num: 11,
                  name: 'Power-Up & SIM',
                  fields: [
                    'SIM inserted in modem slot',
                    'Gateway MCB switched on',
                    'Power LED solid within 5 seconds',
                    'Network LED registered within 60 seconds',
                    '4G RSSI recorded'
                  ]
                },
                {
                  num: 12,
                  name: 'Cloud Commissioning & Data Validation',
                  fields: [
                    'Device shows Online in Cortex dashboard',
                    'Voltage match (dashboard vs meter display)',
                    'Current match (dashboard vs clamp meter)',
                    'Active power match',
                    'Energy accumulation over 5 min',
                    'No phase reversal / negative power'
                  ]
                },
                {
                  num: 13,
                  name: 'Handover',
                  fields: [
                    'Final panel-closed photos',
                    'Dashboard walkthrough given to client',
                    'Client signature captured',
                    'Vireon engineer signature',
                    'Installation report PDF generated'
                  ]
                }
              ].map((s) => (
                <div key={s.num} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-800">Stage {s.num} · {s.name}</h4>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-gray-50 text-gray-500 border border-gray-100/50 rounded">
                      PENDING
                    </span>
                  </div>
                  <div className="border border-slate-100/80 rounded-xl px-4 divide-y divide-slate-100/80">
                    {s.fields.map((f) => (
                      <div key={f} className="flex justify-between items-center py-2 text-xs">
                        <span className="text-slate-600 font-medium">{f}</span>
                        <span className="text-slate-400">—</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Signatures & Footer Section */}
          <div className="pt-16 space-y-12">
            
            {/* Signature lines */}
            <div className="grid grid-cols-2 gap-12 pt-6">
              {/* Vireon Field Engineer */}
              <div className="space-y-2">
                <div className="h-px bg-slate-300 w-full"></div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vireon Field Engineer</div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{inspectorName}</div>
                </div>
              </div>

              {/* Client Representative */}
              <div className="space-y-2">
                <div className="h-px bg-slate-300 w-full"></div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client Representative</div>
                  <div className="text-xs font-bold text-slate-400 mt-1">Name & designation</div>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-center pt-6">
              <p className="text-[9px] text-slate-400 font-medium">
                Vireontech Global Pvt Ltd - Cortex Installation Report - Auto generated from field checklist - Retain with panel documentation
              </p>
            </div>

          </div>

        </div>

      </div>
    </NavigationLayout>
  );
}
