'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Camera, Check } from 'lucide-react';
import NavigationLayout from '@/components/NavigationLayout';

interface ChecklistItem {
  id: string;
  title: string;
  instruction?: string;
  type: 'choice' | 'text' | 'number' | 'image' | 'bills';
  suffix?: string;
  defaultValue?: string;
}

interface StageConfig {
  num: number;
  name: string;
  subtitle: string;
  warningNotice?: string;
  items: ChecklistItem[];
}

const STAGES_CONFIG: Record<number, StageConfig> = {
  1: {
    num: 1,
    name: 'Site Survey',
    subtitle: 'Walk the site before touching anything. Confirms the install is actually feasible.',
    items: [
      { id: 'panel_type', title: 'Panel type identified', instruction: 'MCC / PCC / APFC / DB — record on nameplate photo', type: 'choice' },
      { id: 'incoming_supply', title: 'Incoming supply confirmed', instruction: '415V ± 10%, 3-phase, 4-wire', type: 'choice' },
      { id: 'ct_ratio', title: 'Existing CT ratio', instruction: 'Read K/L side stamping. e.g. 500/5A', type: 'text', defaultValue: '—' },
      { id: 'signal_strength', title: '4G signal at gateway location', instruction: 'Use test phone — Jio / Airtel bars', type: 'number', suffix: 'bars (0-4)', defaultValue: '0' },
      { id: 'nameplate_photo', title: 'Nameplate photo captured', instruction: 'Full panel front, then internal', type: 'image' }
    ]
  },
  2: {
    num: 2,
    name: 'Historical Billing Data',
    subtitle: 'Collect the last 6 DISCOM bills. Feeds baseline kWh, tariff mapping, and ROI projections on the Cortex side.',
    items: [
      { id: 'discom_name', title: 'DISCOM name', instruction: 'WBSEDCL / TGSPDCL / BESCOM / MSEDCL / etc.', type: 'text', defaultValue: '—' },
      { id: 'consumer_no', title: 'Consumer number', instruction: 'Printed on every bill — 10-12 digits usually', type: 'text', defaultValue: '—' },
      { id: 'sanctioned_load', title: 'Sanctioned load', instruction: 'From connection agreement', type: 'number', suffix: 'kW', defaultValue: '0' },
      { id: 'contract_demand', title: 'Contract demand (HT/LT-Industrial only)', instruction: 'From tariff schedule', type: 'number', suffix: 'kVA', defaultValue: '0' },
      { id: 'tariff_category', title: 'Tariff category', instruction: 'e.g. LT-5(B) Industrial, HT-2, B-IPIT', type: 'text', defaultValue: '—' },
      { id: 'six_months_bills', title: '6 months of electricity bills', instruction: 'PDF or clear photo per month. Missing months block Stage 12 report.', type: 'bills' }
    ]
  },
  3: {
    num: 3,
    name: 'Kit & BOM Verification',
    subtitle: 'Everything unboxed and accounted for before the panel is opened.',
    items: [
      { id: 'gw_serial', title: 'Gateway serial number', instruction: 'VRN-GW-XXXX on enclosure label', type: 'text', defaultValue: '—' },
      { id: 'sim_imei', title: 'SIM IMEI recorded', instruction: '15-digit number printed on SIM tray', type: 'text', defaultValue: '—' },
      { id: 'meter_model', title: 'Meter model verified', instruction: 'LK4410 for 3p4w LT — LK4405 for split-core retrofit', type: 'choice' },
      { id: 'ct_count', title: 'CT count matches BOM', instruction: '3 CTs per 3-phase meter', type: 'choice' },
      { id: 'cable_spec', title: 'RS485 cable ≥ 0.5 sqmm shielded twisted pair', instruction: 'Belden 9841 or equivalent', type: 'choice' },
      { id: 'mcb_included', title: '6A MCB for gateway supply included', type: 'choice' }
    ]
  },
  4: {
    num: 4,
    name: 'Panel Preparation',
    subtitle: 'Safety first. Nothing else matters if this step is skipped.',
    warningNotice: 'Do not open the panel without a written work permit from the client electrical in-charge. Lock out / tag out where possible.',
    items: [
      { id: 'permit_signed', title: 'Client work permit signed', instruction: 'Photo of signed permit', type: 'image' },
      { id: 'isolation_confirmed', title: 'Panel isolated OR live-work permit obtained', instruction: 'Prefer isolation. Live work only if unavoidable.', type: 'choice' },
      { id: 'ppe_worn', title: 'PPE worn', instruction: 'Insulated gloves, safety shoes, face shield', type: 'choice' },
      { id: 'dead_confirmed', title: 'Voltage tester confirms dead (if isolated)', instruction: 'Test on known-live source first, then panel', type: 'choice' },
      { id: 'mcb_slot', title: 'Free MCB slot identified', instruction: 'For gateway 230V supply feed', type: 'choice' }
    ]
  },
  5: {
    num: 5,
    name: 'Meter Mounting',
    subtitle: 'Physical installation of the energy meter on the DIN rail.',
    items: [
      { id: 'din_rail', title: 'DIN rail available or new rail fitted', instruction: 'Min 35mm standard rail', type: 'choice' },
      { id: 'meter_secured', title: 'Meter clipped and secured', instruction: 'Give it a firm tug — must not move', type: 'choice' },
      { id: 'ct_switches', title: 'CT ratio DIP switches / programmed', instruction: 'Match primary/5A — e.g. 500/5 = ratio 100', type: 'text', defaultValue: '—' },
      { id: 'meter_photo', title: 'Photo of mounted meter', type: 'image' }
    ]
  },
  6: {
    num: 6,
    name: 'CT Installation & Wiring',
    subtitle: 'Current transformers. This is the step most freshers get wrong. Polarity matters.',
    warningNotice: 'CRITICAL: NEVER leave a CT secondary open circuit while the primary is energized. Dangerous voltages will develop. Remove shorting links ONLY AFTER the CT secondary is wired to the meter terminals.',
    items: [
      { id: 'ct_dir', title: 'CT P1 faces source side (incoming supply)', instruction: 'K/L marking on CT body — K = source, L = load', type: 'choice' },
      { id: 'r_phase', title: 'R-phase CT: S1 → meter ik1, S2 → meter il1', instruction: 'S1 = k (dot), S2 = l', type: 'choice' },
      { id: 'y_phase', title: 'Y-phase CT: S1 → ik2, S2 → il2', type: 'choice' },
      { id: 'b_phase', title: 'B-phase CT: S1 → ik3, S2 → il3', type: 'choice' },
      { id: 'ct_torqued', title: 'CT secondaries ferruled and torqued', instruction: 'No stray strands', type: 'choice' },
      { id: 'links_removed', title: 'Shorting links removed (after wiring)', instruction: 'Confirm removal only AFTER meter is wired', type: 'choice' },
      { id: 'wiring_photo', title: 'Photo: CT wiring with phase labels visible', type: 'image' }
    ]
  },
  7: {
    num: 7,
    name: 'Voltage Sensing',
    subtitle: 'Voltage reference for the meter — tapped off the busbar via a dedicated MCB.',
    items: [
      { id: 'sensing_mcb', title: '2A MCB fitted for voltage sensing', instruction: 'Dedicated — do not share with control circuit', type: 'choice' },
      { id: 'voltage_routing', title: 'R → meter V1, Y → V2, B → V3, N → Vn', instruction: 'Check terminal numbering on meter label', type: 'choice' },
      { id: 'sequence_verified', title: 'Phase sequence RYB verified', instruction: 'Use phase sequence meter — clockwise rotation', type: 'choice' },
      { id: 'neutral_continuity', title: 'Neutral continuity confirmed', instruction: 'Especially on unbalanced loads', type: 'choice' }
    ]
  },
  8: {
    num: 8,
    name: 'Meter Configuration',
    subtitle: 'Program the meter so it matches the panel and talks to the gateway.',
    items: [
      { id: 'config_ratio', title: 'CT ratio configured', instruction: 'Primary / 5A', type: 'text', suffix: ':5', defaultValue: '—' },
      { id: 'config_pt', title: 'PT ratio set to 1:1 (LT direct)', type: 'choice' },
      { id: 'config_baud', title: 'Modbus baud rate 9600, 8N1', type: 'choice' },
      { id: 'config_slave', title: 'Modbus slave ID (unique on bus)', instruction: 'Default 1 — increment for multi-meter installs', type: 'number', defaultValue: '0' },
      { id: 'config_display', title: 'Meter display shows sensible V, I, kW', instruction: 'V ≈ 240V L-N, I > 0, PF between 0.7–1.0 typically', type: 'choice' }
    ]
  },
  9: {
    num: 9,
    name: 'Gateway Mounting',
    subtitle: 'Physically install the Cortex enclosure inside the panel.',
    items: [
      { id: 'gw_position', title: 'Enclosure positioned away from HT / VFD zone', instruction: 'EMI-quiet corner, ideally near the door', type: 'choice' },
      { id: 'gw_antenna', title: 'Antenna routed outside metal enclosure', instruction: 'Via cable gland, magnetic base on panel roof if needed', type: 'choice' },
      { id: 'gw_earth', title: 'Chassis earthed to panel PE bar', instruction: 'Green-yellow wire, ring lug', type: 'choice' },
      { id: 'gw_glands', title: 'Cable glands used for all penetrations', instruction: 'No loose cables through knockouts', type: 'choice' }
    ]
  },
  10: {
    num: 10,
    name: 'RS485 Communication',
    subtitle: 'The physical bus between meter and gateway.',
    warningNotice: 'A/B polarity is not symmetric. Reversing them will not damage anything but nothing will communicate. Also: shield grounded at ONE end only, otherwise ground loops.',
    items: [
      { id: 'comm_wiring', title: 'Meter A → Gateway A, Meter B → Gateway B', instruction: 'Same colour convention end-to-end', type: 'choice' },
      { id: 'comm_shield', title: 'Shield grounded at gateway end only', instruction: 'Leave the meter end floating', type: 'choice' },
      { id: 'comm_termination', title: '120Ω termination at last device on the bus', instruction: 'Skip on runs < 10m if signal is clean', type: 'choice' },
      { id: 'comm_length', title: 'Cable length recorded', instruction: 'Max 1200m per RS485 spec', type: 'number', suffix: 'm', defaultValue: '0' }
    ]
  },
  11: {
    num: 11,
    name: 'Power-Up & SIM',
    subtitle: 'First energization of the gateway. Watch the LEDs.',
    items: [
      { id: 'sim_inserted', title: 'SIM inserted in modem slot', instruction: 'EC200U-CN or A7670C — check orientation', type: 'choice' },
      { id: 'mcb_on', title: 'Gateway MCB switched on', type: 'choice' },
      { id: 'power_led', title: 'Power LED solid within 5 seconds', instruction: 'If blinking / off — check SMPS output', type: 'choice' },
      { id: 'network_led', title: 'Network LED registered within 60 seconds', instruction: 'Blinking slow = registered, fast = searching', type: 'choice' },
      { id: 'modem_rssi', title: '4G RSSI recorded', instruction: 'Target ≥ -85 dBm. Anything worse than -95 needs external antenna.', type: 'number', suffix: 'dBm', defaultValue: '0' }
    ]
  },
  12: {
    num: 12,
    name: 'Cloud Commissioning & Data Validation',
    subtitle: 'The moment of truth. Numbers on the dashboard must match what a clamp meter sees.',
    items: [
      { id: 'cloud_online', title: 'Device shows Online in Cortex dashboard', instruction: 'quality.vireontech.in → devices', type: 'choice' },
      { id: 'cloud_voltage', title: 'Voltage match (dashboard vs meter display)', instruction: '± 1%', type: 'choice' },
      { id: 'cloud_current', title: 'Current match (dashboard vs clamp meter)', instruction: '± 2%', type: 'choice' },
      { id: 'cloud_power', title: 'Active power match', instruction: '± 2% — check PF sign is not inverted', type: 'choice' },
      { id: 'cloud_energy', title: 'Energy accumulation over 5 min', instruction: 'kWh should increase steadily', type: 'choice' },
      { id: 'cloud_phase', title: 'No phase reversal / negative power', instruction: 'Unless site has export (solar) — flag if so', type: 'choice' }
    ]
  },
  13: {
    num: 13,
    name: 'Handover',
    subtitle: 'Close the loop with the client. Get it in writing.',
    items: [
      { id: 'ho_photos', title: 'Final panel-closed photos', instruction: 'Front, side, labels visible', type: 'image' },
      { id: 'ho_walkthrough', title: 'Dashboard walkthrough given to client', instruction: 'Show them how to log in', type: 'choice' },
      { id: 'ho_signature', title: 'Client signature captured', instruction: 'On the handover form', type: 'image' },
      { id: 'ho_vireon_sig', title: 'Vireon engineer signature', type: 'image' },
      { id: 'ho_pdf', title: 'Installation report PDF generated', instruction: 'Auto-generated from this checklist', type: 'choice' }
    ]
  }
};

export default function StageChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const stageNum = parseInt(params?.stageNum as string) || 1;

  const stage = STAGES_CONFIG[stageNum] || STAGES_CONFIG[1];

  // Choices state
  const [choices, setChoices] = useState<Record<string, 'OK' | 'Not OK' | 'N/A' | undefined>>(() => {
    const initial: Record<string, 'OK' | 'Not OK' | 'N/A' | undefined> = {};
    stage.items.forEach((item) => {
      if (stageNum <= 3) {
        initial[item.id] = 'OK'; // Site Survey, Billing, and Kit verification start as OK (completed)
      } else {
        initial[item.id] = undefined; // Pending stages start as unselected
      }
    });
    return initial;
  });

  // Inputs state
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    stage.items.forEach((item) => {
      if (item.defaultValue) {
        initial[item.id] = item.defaultValue;
      }
    });
    return initial;
  });

  // Photo uploaded indicator
  const [photoCaptured, setPhotoCaptured] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (stageNum === 1) {
      initial['nameplate_photo'] = true; // Default stage 1 photo as captured
    }
    return initial;
  });

  const toggleChoice = (itemId: string, val: 'OK' | 'Not OK' | 'N/A') => {
    setChoices((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleInputChange = (itemId: string, val: string) => {
    setInputs((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSubmit = () => {
    alert(`Stage ${stageNum} Checklist Submitted Successfully!`);
    router.push(`/inspections/${projectId}`);
  };

  // Determine if all checks are satisfied to enable submit
  const isSubmitEnabled = stage.items.every((item) => {
    if (item.type === 'choice') {
      return choices[item.id] !== undefined;
    }
    if (item.type === 'image') {
      return photoCaptured[item.id] === true;
    }
    return true;
  });

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto px-2 pb-16">

        {/* Header Block */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/inspections/${projectId}`)}
            className="h-8 w-8 flex items-center justify-center border border-border-custom bg-bg-surface hover:bg-slate-100 rounded-full cursor-pointer transition-colors shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-text-base stroke-[2.5px]" />
          </button>
          <div>
            <div className="text-[10px] text-primary font-bold uppercase tracking-wider">
              STAGE {stage.num} OF 13
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-base">
              <span>{stage.name}</span>
            </h1>
          </div>
        </div>

        {/* Warning Notice Banner if applicable */}
        {stage.warningNotice && (
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-red-600 rounded-xl p-4 text-[11px] font-semibold flex items-start space-x-2.5 max-w-4xl shadow-sm leading-relaxed">
            <span className="text-red-500 text-sm leading-none select-none">⚠️</span>
            <span>{stage.warningNotice}</span>
          </div>
        )}

        {/* Subtitle */}
        <p className="text-xs text-text-muted font-semibold leading-relaxed max-w-3xl">
          {stage.subtitle}
        </p>

        {/* Checklist List */}
        <div className="space-y-4">
          {stage.items.map((item) => {
            const isChoiceSelected = choices[item.id];

            return (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5">

                {/* Title & Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 text-xs select-none">●</span>
                    <span className="font-bold text-sm text-slate-800 leading-snug">{item.title}</span>
                  </div>
                  {item.instruction && (
                    <p className="text-[11px] text-slate-400 font-semibold pl-4">
                      {item.instruction}
                    </p>
                  )}
                </div>

                {/* Input Fields */}
                {item.type === 'text' && (
                  <div className="pl-4">
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={inputs[item.id] || ''}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="w-full pl-3.5 pr-24 py-2 border border-slate-200/80 bg-slate-50/30 rounded-xl text-xs focus:outline-none focus:border-primary font-medium"
                        placeholder="Specify findings"
                      />
                      {item.suffix && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          {item.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {item.type === 'number' && (
                  <div className="pl-4">
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={inputs[item.id] || ''}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="w-full pl-3.5 pr-24 py-2 border border-slate-200/80 bg-slate-50/30 rounded-xl text-xs focus:outline-none focus:border-primary font-medium"
                      />
                      {item.suffix && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          {item.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {item.type === 'image' && (
                  <div className="pl-4">
                    {photoCaptured[item.id] ? (
                      <div className="border border-dashed border-green-300 bg-green-50/20 rounded-xl py-3 px-4 text-center text-xs font-semibold text-green-700 flex items-center justify-center space-x-1.5 shadow-sm">
                        <Camera className="h-4 w-4 stroke-[2px]" />
                        <span>Photo captured</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPhotoCaptured(prev => ({ ...prev, [item.id]: true }))}
                        className="w-full border border-dashed border-slate-200 bg-slate-50/10 hover:bg-slate-50 rounded-xl py-5 text-center text-xs font-semibold text-slate-500 flex items-center justify-center space-x-1.5 cursor-pointer mt-2 shadow-sm transition-colors"
                      >
                        <Camera className="h-4 w-4 text-slate-400" />
                        <span>Capture photo</span>
                      </button>
                    )}
                  </div>
                )}

                {item.type === 'bills' && (
                  <div className="pl-4 space-y-3">
                    <div className="text-[10px] text-green-600 font-bold flex items-center space-x-1">
                      <Check className="h-3.5 w-3.5 stroke-[3px]" />
                      <span>6 of 6 uploaded</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
                      {['Jun 2026', 'May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026'].map((m) => (
                        <div key={m} className="bg-green-50/50 border border-green-200/50 text-green-700 rounded-lg p-2.5 text-center text-xs font-bold shadow-sm">
                          <div>{m}</div>
                          <div className="text-[9.5px] mt-0.5 text-green-600/90 font-medium">Uploaded</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Choices Buttons (Except image and bills type if unnecessary) */}
                {item.type !== 'image' && item.type !== 'bills' && (
                  <div className="flex gap-3 pl-4">
                    {(['OK', 'Not OK', 'N/A'] as const).map((opt) => {
                      const isSelected = isChoiceSelected === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleChoice(item.id, opt)}
                          className={`flex-1 py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${isSelected
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 font-semibold'
                            }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Submit Stage Button */}
        <div className="pt-4">
          {isSubmitEnabled ? (
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-3.5 rounded-2xl text-center cursor-pointer shadow-md transition-colors w-full block"
            >
              Submit Stage
            </button>
          ) : (
            <div className="bg-slate-100 border border-slate-200/50 text-slate-400 font-bold text-sm py-3.5 rounded-2xl text-center select-none cursor-not-allowed w-full block shadow-inner">
              Complete all {stage.items.length} checks to submit
            </div>
          )}
        </div>

      </div>
    </NavigationLayout>
  );
}
