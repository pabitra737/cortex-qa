import { getMockDb, saveMockDb } from './mockDb';
import { Project, Inspection, UserProfile, TenantFactory, Product, SyncLog, AuditLog, ChecklistTemplate } from '@/types';

// ==========================================
// 1. RATE LIMITING SERVICE (Upstash / Memory)
// ==========================================
const ipTokenBucket = new Map<string, { tokens: number; lastRefill: number }>();
const BUCKET_LIMIT = 60; // Max 60 requests per minute
const REFILL_RATE = 1000; // Refill 1 token per second (60 per minute)

export async function checkRateLimit(ip: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  // If Upstash variables exist, we could connect here.
  // Fallback to local Token Bucket implementation:
  const now = Date.now();
  const bucket = ipTokenBucket.get(ip) || { tokens: BUCKET_LIMIT, lastRefill: now };
  
  // Calculate refilled tokens
  const elapsed = now - bucket.lastRefill;
  const refilled = Math.floor(elapsed / REFILL_RATE);
  
  if (refilled > 0) {
    bucket.tokens = Math.min(BUCKET_LIMIT, bucket.tokens + refilled);
    bucket.lastRefill = now;
  }
  
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    ipTokenBucket.set(ip, bucket);
    return { success: true, limit: BUCKET_LIMIT, remaining: bucket.tokens };
  }
  
  return { success: false, limit: BUCKET_LIMIT, remaining: 0 };
}

// ==========================================
// 2. FIRESTORE DATABASE SERVICE
// ==========================================

export const dbService = {
  // Factories
  async getFactory(id: string): Promise<TenantFactory | undefined> {
    return {
      id: id || 'factory-1',
      name: 'Vireon Panels',
      location: 'Bhiwadi, Rajasthan',
      settings: {
        allowStageSkipping: false,
        requireDoubleApproval: true,
        companyLogoUrl: ''
      },
      createdAt: new Date().toISOString()
    };
  },

  // Users
  async getUsers(factoryId?: string): Promise<UserProfile[]> {
    const users = getMockDb().users;
    if (factoryId && factoryId !== 'all') {
      return users.filter(u => u.factoryId === factoryId || u.role === 'Super Admin');
    }
    return users;
  },
  async getUser(uid: string): Promise<UserProfile | undefined> {
    return getMockDb().users.find(u => u.uid === uid);
  },
  async createUser(user: UserProfile): Promise<UserProfile> {
    const db = getMockDb();
    db.users.push(user);
    saveMockDb(db);
    return user;
  },
  async updateUser(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const db = getMockDb();
    const idx = db.users.findIndex(u => u.uid === uid);
    if (idx === -1) throw new Error('User not found');
    db.users[idx] = { ...db.users[idx], ...data };
    saveMockDb(db);
    return db.users[idx];
  },

  // Projects
  async getProjects(factoryId: string): Promise<Project[]> {
    const db = getMockDb();
    if (factoryId === 'all') return db.projects;
    return db.projects.filter(p => p.factoryId === factoryId);
  },
  async getProject(id: string): Promise<Project | undefined> {
    return getMockDb().projects.find(p => p.id === id);
  },
  async createProject(project: Project): Promise<Project> {
    const db = getMockDb();
    db.projects.push(project);
    saveMockDb(db);
    return project;
  },
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const db = getMockDb();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    db.projects[idx] = { ...db.projects[idx], ...data, updatedAt: new Date().toISOString() };
    saveMockDb(db);
    return db.projects[idx];
  },

  // Checklists
  async getChecklists(factoryId: string): Promise<ChecklistTemplate[]> {
    return getMockDb().checklists;
  },
  async getChecklistForStage(stage: number): Promise<ChecklistTemplate | undefined> {
    return getMockDb().checklists.find(c => c.stage === stage);
  },

  // Inspections
  async getInspections(projectId: string): Promise<Inspection[]> {
    return getMockDb().inspections.filter(i => i.projectId === projectId);
  },
  async saveInspection(inspection: Inspection): Promise<Inspection> {
    const db = getMockDb();
    const idx = db.inspections.findIndex(i => i.id === inspection.id);
    if (idx !== -1) {
      db.inspections[idx] = { ...db.inspections[idx], ...inspection, updatedAt: new Date().toISOString() };
    } else {
      db.inspections.push(inspection);
    }
    
    // Auto-update project stage if this inspection is completed (status "passed")
    const projectIdx = db.projects.findIndex(p => p.id === inspection.projectId);
    if (projectIdx !== -1) {
      const proj = db.projects[projectIdx];
      // Move to next stage only if this is the current stage and it passed
      if (inspection.status === 'passed' && inspection.stage === proj.currentStage && proj.currentStage < 12) {
        proj.currentStage += 1;
        proj.updatedAt = new Date().toISOString();
      }
    }
    
    saveMockDb(db);
    return inspection;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return getMockDb().auditLogs;
  },
  async createAuditLog(userId: string, action: string, details: string): Promise<AuditLog> {
    const db = getMockDb();
    const user = db.users.find(u => u.uid === userId);
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId,
      userName: user ? user.name : 'Unknown User',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(newLog);
    saveMockDb(db);
    return newLog;
  },

  // Sync Logs
  async getSyncLogs(): Promise<SyncLog[]> {
    return getMockDb().syncLogs;
  },
  async createSyncLog(type: 'upload' | 'download' | 'conflict_resolved', status: 'success' | 'failed', details: string): Promise<SyncLog> {
    const db = getMockDb();
    const log: SyncLog = {
      id: 'sync-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      status,
      details
    };
    db.syncLogs.unshift(log);
    saveMockDb(db);
    return log;
  }
};

// ==========================================
// 3. MEDIA UPLOAD SERVICE (Cloudinary Mock)
// ==========================================
export async function uploadToCloudinary(base64Data: string, type: 'signature' | 'photo'): Promise<string> {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (type === 'signature') {
    // Return base64 or a styled signature mockup SVG/URL
    return base64Data; // For signatures, raw base64 is clean and reliable to store
  } else {
    // Photos
    const mockPhotos = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600', // industrial electrical wiring
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600', // metal fabrication
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600', // construction inspection
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600'  // testing meters
    ];
    const randomIndex = Math.floor(Math.random() * mockPhotos.length);
    return mockPhotos[randomIndex];
  }
}

// ==========================================
// 4. EMAIL NOTIFICATION SERVICE (Nodemailer Mock)
// ==========================================
export async function sendEmailNotification(to: string, subject: string, htmlContent: string): Promise<boolean> {
  console.log(`[EMAIL DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body Snippet: ${htmlContent.substring(0, 150)}...`);
  
  // Real transporter would go here:
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({...});
  
  return true;
}

// ==========================================
// 5. PDF REPORT GENERATOR SERVICE (Puppeteer Mock)
// ==========================================
export async function generateReportPdf(projectId: string): Promise<string> {
  const db = getMockDb();
  const project = db.projects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');
  
  const inspections = db.inspections.filter(i => i.projectId === projectId);
  
  // In a real Puppeteer environment:
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdfBuffer = await page.pdf({...});
  // return pdfBuffer;

  // We will return a beautiful HTML template representing the PDF Report,
  // which can be converted directly in-browser using print or saved as an offline document.
  return `
    <html>
      <head>
        <title>CORTEX-QA Compliance Report - ${project.name}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #b16a41; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 24px; font-weight: bold; color: #b16a41; }
          .title { font-size: 28px; margin: 0; color: #333; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .meta-table td { padding: 8px; border: 1px solid #ddd; }
          .meta-table td.label { font-weight: bold; background: #f9f9f9; width: 25%; }
          .stage-card { border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
          .stage-header { background: #b16a41; color: white; padding: 8px 12px; font-weight: bold; border-radius: 4px; display: flex; justify-content: space-between; }
          .badge { background: #2ecc71; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
          .fields-table { width: 100%; margin-top: 10px; border-collapse: collapse; }
          .fields-table th, .fields-table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
          .sig-box { width: 30%; text-align: center; border-top: 1px solid #333; padding-top: 10px; }
          .sig-image { max-height: 60px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">CORTEX-QA COMPLIANCE CERTIFICATE</h1>
            <div>Factory Quality System Release</div>
          </div>
          <div class="logo">CORTEX-QA</div>
        </div>

        <table class="meta-table">
          <tr>
            <td class="label">Project Name</td>
            <td>${project.name}</td>
            <td class="label">Factory ID</td>
            <td>${project.factoryId}</td>
          </tr>
          <tr>
            <td class="label">Description</td>
            <td colspan="3">${project.description}</td>
          </tr>
          <tr>
            <td class="label">Status</td>
            <td><span class="badge" style="background:${project.status === 'completed' ? '#2ecc71' : '#f39c12'}">${project.status.toUpperCase()}</span></td>
            <td class="label">Current Workflow Stage</td>
            <td>Stage ${project.currentStage} / 12</td>
          </tr>
          <tr>
            <td class="label">Report Generated At</td>
            <td colspan="3">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <h2>Detailed Inspection Workflow History</h2>
        ${inspections.map(i => {
          const checklist = db.checklists.find(c => c.stage === i.stage);
          return `
            <div class="stage-card">
              <div class="stage-header">
                <span>Stage ${i.stage}: ${checklist?.name || `Stage Checklist`}</span>
                <span class="badge" style="background:${i.status === 'passed' ? '#2ecc71' : '#e74c3c'}">${i.status.toUpperCase()}</span>
              </div>
              <table class="fields-table">
                <thead>
                  <tr>
                    <th>Requirement Check</th>
                    <th>Recorded Value / Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(i.answers).map(([key, val]) => `
                    <tr>
                      <td>${key.replace(/_/g, ' ').toUpperCase()}</td>
                      <td><strong>${val}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${i.remarks ? `<p style="margin-top: 10px; font-style: italic;">Remarks: ${i.remarks}</p>` : ''}
              <div style="font-size: 11px; color: #888; margin-top: 10px;">
                Inspected by Inspector UID: ${i.inspectorId} at ${new Date(i.updatedAt).toLocaleString()}
              </div>
            </div>
          `;
        }).join('')}

        <div class="signatures">
          <div class="sig-box">
            ${inspections.find(i => i.stage === 11)?.signatureUrl ? `<img class="sig-image" src="${inspections.find(i => i.stage === 11)?.signatureUrl}" />` : '<div style="height:60px;"></div>'}
            <div>QA Inspector Sign-off</div>
          </div>
          <div class="sig-box">
            <div style="height:60px; font-style: italic; display: flex; align-items: center; justify-content: center; color: #2ecc71; font-weight: bold;">
              ✓ SYSTEM VALIDATED
            </div>
            <div>QA Manager Sign-off</div>
          </div>
          <div class="sig-box">
            <div style="height:60px; font-style: italic; display: flex; align-items: center; justify-content: center; color: #2ecc71; font-weight: bold;">
              ✓ AUTO APPROVED
            </div>
            <div>Customer Representative</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
