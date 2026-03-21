import { useState, useRef, useEffect } from "react";
import { createBook, PageSize, Margins } from "clarkbook";
import { Download, Github, ChevronDown, Sun, Moon } from "lucide-react";
import {
	Panel,
	Group as PanelGroup,
	Separator as PanelResizeHandle,
} from "react-resizable-panels";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";
import clsx from "clsx";
import PdfPreview from "./PdfPreview.jsx";
import logoUrl from "../public/plutoprint.jpg?url";

export function landscape(pageSize) {
	const [w, h] = pageSize;
	return [h, w];
}

const TEMPLATE_DEFAULT = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Google Sans', sans-serif;
      padding: 48px;
      color: #111;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 600;
      letter-spacing: -0.04em;
      margin: 0 0 8px;
      color: #000;
    }
    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 12px;
      color: #000;
    }
    p {
      color: #444;
      margin: 0 0 16px;
    }
    .badge {
      display: inline-block;
      background: slateblue;
      border-radius: 6px;
      color: #fff;
      font-size: 11px;
      font-family: monospace;
      padding: 3px 8px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e5e5;
      margin: 32px 0;
    }
    .khmer {
      font-family: 'Google Sans', sans-serif;
    }
    small {
      color: gray;
    }
  </style>
</head>
<body>
  <img src="/plutoprint.jpg" width=100 height=100 />
  <br/>
  <small><strong>Note:</strong> The image has to be registered in the resouces first.</small>
  <br/>
  <span class="badge">ClarkBook</span>
  <h1>Hello, World</h1>
  <p>Edit this HTML on the left and see the live preview update in real time. When you're ready, export to PDF or image.</p>
  <hr />
  <h2 class="khmer">សួស្តី ពិភពលោក</h2>
  <p class="khmer">អត្ថបទនេះត្រូវបានបង្ហាញជាភាសាខ្មែរ។ <strong>ClarkBook</strong> គឺជាឧបករណ៍បំប្លែង HTML ទៅជា PDF និងរូបភាព ដោយប្រើប្រាស់ WebAssembly។ វាមិនពឹងផ្អែកលើ Chromium, WebKit ឬ Gecko ទេ។</p>
  <hr />
  <p>Powered by <strong>plutobook</strong> — a robust HTML rendering engine for paged media. No Chromium, no WebKit, no Gecko.</p>
</body>
</html>`;

const TEMPLATE_INVOICE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Google Sans', sans-serif;
      color: #1a1a1a;
      background: #fff;
      padding: 56px 64px;
      font-size: 13px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 48px;
    }
    .company-name {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #000;
    }
    .company-sub {
      color: #888;
      font-size: 12px;
      margin-top: 4px;
    }
    .invoice-badge {
      text-align: right;
    }
    .invoice-badge .label {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #000;
    }
    .invoice-badge .number {
      color: #888;
      font-size: 12px;
      margin-top: 2px;
    }
    .meta {
      display: flex;
      gap: 48px;
      margin-bottom: 40px;
    }
    .meta-block .title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #aaa;
      margin-bottom: 6px;
    }
    .meta-block .value {
      font-size: 13px;
      color: #222;
      font-weight: 500;
    }
    .meta-block .sub {
      font-size: 12px;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    thead th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #aaa;
      padding: 0 0 10px;
      border-bottom: 1px solid #e8e8e8;
    }
    thead th:last-child { text-align: right; }
    tbody td {
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
    }
    tbody td:last-child { text-align: right; font-weight: 500; }
    .item-name { font-weight: 500; color: #111; }
    .item-desc { font-size: 11px; color: #999; margin-top: 2px; }
    .totals {
      margin-left: auto;
      width: 260px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #555;
      border-bottom: 1px solid #f0f0f0;
    }
    .totals-row.total {
      font-size: 15px;
      font-weight: 700;
      color: #000;
      border-bottom: none;
      padding-top: 12px;
    }
    .footer {
      margin-top: 56px;
      padding-top: 24px;
      border-top: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #aaa;
    }
    .status-chip {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      font-size: 10px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">Acme Studio</div>
      <div class="company-sub">hello@acmestudio.io · acmestudio.io</div>
    </div>
    <div class="invoice-badge">
      <div class="label">INVOICE</div>
      <div class="number">#INV-2024-0042</div>
      <div style="margin-top:8px"><span class="status-chip">Paid</span></div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <div class="title">Bill To</div>
      <div class="value">Bright Futures Co.</div>
      <div class="sub">123 Market Street<br>San Francisco, CA 94103</div>
    </div>
    <div class="meta-block">
      <div class="title">Issue Date</div>
      <div class="value">March 1, 2025</div>
    </div>
    <div class="meta-block">
      <div class="title">Due Date</div>
      <div class="value">March 15, 2025</div>
    </div>
    <div class="meta-block">
      <div class="title">Project</div>
      <div class="value">Brand Refresh</div>
      <div class="sub">Q1 2025 Deliverables</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="width:60px">Qty</th>
        <th style="width:100px">Unit Price</th>
        <th style="width:100px">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="item-name">Brand Identity Design</div>
          <div class="item-desc">Logo, color palette, typography system</div>
        </td>
        <td>1</td>
        <td>$3,200.00</td>
        <td>$3,200.00</td>
      </tr>
      <tr>
        <td>
          <div class="item-name">UI Component Library</div>
          <div class="item-desc">40 reusable Figma components, documented</div>
        </td>
        <td>1</td>
        <td>$2,400.00</td>
        <td>$2,400.00</td>
      </tr>
      <tr>
        <td>
          <div class="item-name">Illustration Pack</div>
          <div class="item-desc">12 custom vector illustrations</div>
        </td>
        <td>12</td>
        <td>$150.00</td>
        <td>$1,800.00</td>
      </tr>
      <tr>
        <td>
          <div class="item-name">Brand Guidelines PDF</div>
          <div class="item-desc">Usage rules, do's and don'ts, examples</div>
        </td>
        <td>1</td>
        <td>$600.00</td>
        <td>$600.00</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>$8,000.00</span></div>
    <div class="totals-row"><span>Tax (8.5%)</span><span>$680.00</span></div>
    <div class="totals-row"><span>Discount</span><span>−$200.00</span></div>
    <div class="totals-row total"><span>Total Due</span><span>$8,480.00</span></div>
  </div>

  <div class="footer">
    <span>Payment via bank transfer · NET 14</span>
    <span>Thank you for your business!</span>
  </div>
</body>
</html>`;

const TEMPLATE_RESUME = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Google Sans', sans-serif;
      color: #1a1a1a;
      background: #fff;
      font-size: 12px;
      line-height: 1.65;
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 220px;
      min-width: 220px;
      background: #0f172a;
      color: #cbd5e1;
      padding: 40px 24px;
    }
    .sidebar .name {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .sidebar .role {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 28px;
    }
    .sidebar .section-title {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #475569;
      margin-bottom: 10px;
      margin-top: 24px;
    }
    .sidebar .contact-item {
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 5px;
    }
    .skill-bar { margin-bottom: 8px; }
    .skill-label { font-size: 11px; color: #94a3b8; margin-bottom: 3px; }
    .skill-track {
      height: 3px;
      background: #1e293b;
      border-radius: 2px;
    }
    .skill-fill {
      height: 3px;
      background: #3b82f6;
      border-radius: 2px;
    }
    .lang-item {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .lang-level { color: #475569; }
    .main {
      flex: 1;
      padding: 40px 40px 40px 36px;
    }
    .main-section { margin-bottom: 28px; }
    .main-section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #3b82f6;
      font-weight: 700;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 14px;
    }
    .summary-text { color: #475569; font-size: 12px; line-height: 1.7; }
    .job { margin-bottom: 18px; }
    .job-header { display: flex; justify-content: space-between; align-items: baseline; }
    .job-title { font-weight: 700; color: #0f172a; font-size: 13px; }
    .job-date { font-size: 11px; color: #94a3b8; }
    .job-company { font-size: 12px; color: #3b82f6; margin-bottom: 6px; }
    .job ul { padding-left: 16px; }
    .job li { color: #475569; margin-bottom: 3px; font-size: 11.5px; }
    .edu-item { margin-bottom: 12px; }
    .edu-degree { font-weight: 700; color: #0f172a; }
    .edu-school { color: #3b82f6; font-size: 12px; }
    .edu-year { font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="name">Alex Morgan</div>
    <div class="role">Senior Product Designer</div>

    <div class="section-title">Contact</div>
    <div class="contact-item">alex@morgan.design</div>
    <div class="contact-item">+1 (415) 555-0192</div>
    <div class="contact-item">San Francisco, CA</div>
    <div class="contact-item">linkedin.com/in/alexmorgan</div>

    <div class="section-title">Skills</div>
    <div class="skill-bar">
      <div class="skill-label">Figma & Sketch</div>
      <div class="skill-track"><div class="skill-fill" style="width:95%"></div></div>
    </div>
    <div class="skill-bar">
      <div class="skill-label">User Research</div>
      <div class="skill-track"><div class="skill-fill" style="width:88%"></div></div>
    </div>
    <div class="skill-bar">
      <div class="skill-label">Prototyping</div>
      <div class="skill-track"><div class="skill-fill" style="width:90%"></div></div>
    </div>
    <div class="skill-bar">
      <div class="skill-label">Design Systems</div>
      <div class="skill-track"><div class="skill-fill" style="width:85%"></div></div>
    </div>
    <div class="skill-bar">
      <div class="skill-label">HTML / CSS</div>
      <div class="skill-track"><div class="skill-fill" style="width:70%"></div></div>
    </div>

    <div class="section-title">Languages</div>
    <div class="lang-item"><span>English</span><span class="lang-level">Native</span></div>
    <div class="lang-item"><span>French</span><span class="lang-level">Fluent</span></div>
    <div class="lang-item"><span>Spanish</span><span class="lang-level">Basic</span></div>
  </div>

  <div class="main">
    <div class="main-section">
      <div class="main-section-title">Professional Summary</div>
      <p class="summary-text">Senior Product Designer with 8+ years crafting intuitive digital experiences for startups and Fortune 500 companies. Passionate about design systems, accessibility, and cross-functional collaboration. Led design for products used by over 10M users.</p>
    </div>

    <div class="main-section">
      <div class="main-section-title">Experience</div>

      <div class="job">
        <div class="job-header">
          <div class="job-title">Lead Product Designer</div>
          <div class="job-date">Jan 2021 – Present</div>
        </div>
        <div class="job-company">Vercel Inc. · San Francisco, CA</div>
        <ul>
          <li>Rebuilt the dashboard UI, reducing task completion time by 34%</li>
          <li>Established a company-wide design system adopted by 12 product teams</li>
          <li>Conducted 60+ user interviews to inform product roadmap decisions</li>
        </ul>
      </div>

      <div class="job">
        <div class="job-header">
          <div class="job-title">Product Designer</div>
          <div class="job-date">Mar 2018 – Dec 2020</div>
        </div>
        <div class="job-company">Stripe · Remote</div>
        <ul>
          <li>Designed the onboarding flow for Stripe Atlas, serving 5,000+ new businesses/month</li>
          <li>Collaborated with engineers and PMs on the Stripe Dashboard redesign</li>
          <li>Shipped 3 major product features from concept to production</li>
        </ul>
      </div>

      <div class="job">
        <div class="job-header">
          <div class="job-title">UX Designer</div>
          <div class="job-date">Jun 2016 – Feb 2018</div>
        </div>
        <div class="job-company">Freelance · Various</div>
        <ul>
          <li>Delivered brand identities and web designs for 15+ clients</li>
          <li>Specialized in SaaS and e-commerce UI/UX projects</li>
        </ul>
      </div>
    </div>

    <div class="main-section">
      <div class="main-section-title">Education</div>
      <div class="edu-item">
        <div class="edu-degree">B.F.A. in Graphic Design</div>
        <div class="edu-school">California College of the Arts</div>
        <div class="edu-year">2012 – 2016</div>
      </div>
      <div class="edu-item">
        <div class="edu-degree">Certificate in HCI</div>
        <div class="edu-school">Stanford University (Online)</div>
        <div class="edu-year">2019</div>
      </div>
    </div>
  </div>
</body>
</html>`;

const TEMPLATE_REPORT = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Google Sans', sans-serif;
      color: #1a1a1a;
      background: #fff;
      padding: 56px 64px;
      font-size: 13px;
      line-height: 1.7;
      max-width: 860px;
      margin: 0 auto;
    }
    .report-header {
      border-bottom: 3px solid #1e293b;
      padding-bottom: 24px;
      margin-bottom: 40px;
    }
    .report-tag {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #3b82f6;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .report-title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #0f172a;
      line-height: 1.2;
      margin-bottom: 12px;
    }
    .report-meta {
      display: flex;
      gap: 24px;
      font-size: 12px;
      color: #64748b;
    }
    .report-meta span::before { content: "· "; }
    .report-meta span:first-child::before { content: ""; }
    h2 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 32px 0 12px;
      padding-left: 12px;
      border-left: 3px solid #3b82f6;
    }
    p { color: #374151; margin-bottom: 12px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0 28px;
      font-size: 12px;
    }
    thead {
      background: #0f172a;
      color: #fff;
    }
    thead th {
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody td {
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      color: #374151;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-yellow { background: #fef9c3; color: #a16207; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
    .chart { margin: 20px 0 32px; }
    .chart-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      gap: 12px;
    }
    .chart-label { width: 110px; font-size: 12px; color: #475569; text-align: right; flex-shrink: 0; }
    .chart-bar-bg { flex: 1; height: 20px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .chart-bar { height: 100%; background: #3b82f6; border-radius: 4px; display: flex; align-items: center; padding-left: 8px; }
    .chart-val { font-size: 11px; color: #fff; font-weight: 600; }
    .callout {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 14px 18px;
      border-radius: 0 6px 6px 0;
      margin: 20px 0;
      font-size: 13px;
      color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-tag">Quarterly Business Report</div>
    <div class="report-title">Q1 2025 Performance Review</div>
    <div class="report-meta">
      <span>Prepared by Finance &amp; Strategy</span>
      <span>March 31, 2025</span>
      <span>Confidential</span>
    </div>
  </div>

  <h2>Executive Summary</h2>
  <p>Q1 2025 delivered strong results across all business units, with total revenue reaching <strong>$4.2M</strong> — a 23% year-over-year increase. Customer acquisition costs improved by 11%, and net promoter score reached an all-time high of 72. The APAC region led growth at +38%.</p>

  <div class="callout">
    Key highlight: Monthly recurring revenue crossed the $1M milestone in February 2025 for the first time in company history.
  </div>

  <h2>Revenue by Region</h2>
  <div class="chart">
    <div class="chart-row">
      <div class="chart-label">North America</div>
      <div class="chart-bar-bg"><div class="chart-bar" style="width:78%"><span class="chart-val">$1.96M</span></div></div>
    </div>
    <div class="chart-row">
      <div class="chart-label">Europe</div>
      <div class="chart-bar-bg"><div class="chart-bar" style="width:54%"><span class="chart-val">$1.13M</span></div></div>
    </div>
    <div class="chart-row">
      <div class="chart-label">APAC</div>
      <div class="chart-bar-bg"><div class="chart-bar" style="width:42%"><span class="chart-val">$0.88M</span></div></div>
    </div>
    <div class="chart-row">
      <div class="chart-label">Other</div>
      <div class="chart-bar-bg"><div class="chart-bar" style="width:11%"><span class="chart-val">$0.23M</span></div></div>
    </div>
  </div>

  <h2>KPI Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Q1 2025</th>
        <th>Q4 2024</th>
        <th>YoY Change</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total Revenue</td>
        <td><strong>$4.2M</strong></td>
        <td>$3.8M</td>
        <td>+10.5%</td>
        <td><span class="badge badge-green">On Track</span></td>
      </tr>
      <tr>
        <td>New Customers</td>
        <td><strong>1,240</strong></td>
        <td>1,050</td>
        <td>+18.1%</td>
        <td><span class="badge badge-green">On Track</span></td>
      </tr>
      <tr>
        <td>Churn Rate</td>
        <td><strong>2.3%</strong></td>
        <td>2.1%</td>
        <td>+0.2pp</td>
        <td><span class="badge badge-yellow">Watch</span></td>
      </tr>
      <tr>
        <td>Avg. Deal Size</td>
        <td><strong>$3,387</strong></td>
        <td>$3,619</td>
        <td>−6.4%</td>
        <td><span class="badge badge-red">Below Target</span></td>
      </tr>
      <tr>
        <td>NPS Score</td>
        <td><strong>72</strong></td>
        <td>68</td>
        <td>+4</td>
        <td><span class="badge badge-green">On Track</span></td>
      </tr>
    </tbody>
  </table>

  <h2>Conclusions &amp; Outlook</h2>
  <p>The business is on a solid growth trajectory entering Q2. Priority actions include addressing the decline in average deal size through mid-market sales training, and investing in churn prevention initiatives in the SMB segment. APAC expansion remains the highest-ROI growth lever for the remainder of 2025.</p>
</body>
</html>`;

const TEMPLATE_CERTIFICATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      font-family: 'Google Sans', sans-serif;
      background: #fffdf7;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px;
    }
    .cert {
      width: 680px;
      background: #fff;
      border: 2px solid #c9a84c;
      box-shadow: inset 0 0 0 8px #fffdf7, inset 0 0 0 10px #c9a84c;
      padding: 56px 64px;
      text-align: center;
      position: relative;
    }
    .cert::before, .cert::after {
      content: '';
      position: absolute;
      width: 40px;
      height: 40px;
      border: 2px solid #c9a84c;
    }
    .cert::before { top: 12px; left: 12px; border-right: none; border-bottom: none; }
    .cert::after { bottom: 12px; right: 12px; border-left: none; border-top: none; }
    .org {
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #c9a84c;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .presents {
      font-size: 13px;
      color: #888;
      letter-spacing: 0.06em;
      margin-bottom: 8px;
    }
    .cert-title {
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #1a1a1a;
      line-height: 1.15;
      margin-bottom: 28px;
    }
    .awarded-to {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 8px;
    }
    .recipient {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #c9a84c;
      margin-bottom: 28px;
      border-bottom: 1.5px solid #e8d99a;
      padding-bottom: 20px;
    }
    .description {
      font-size: 13px;
      color: #555;
      line-height: 1.8;
      max-width: 460px;
      margin: 0 auto 36px;
    }
    .sigs {
      display: flex;
      justify-content: center;
      gap: 80px;
      margin-top: 8px;
    }
    .sig-block { text-align: center; }
    .sig-line {
      width: 140px;
      border-top: 1.5px solid #bbb;
      margin: 0 auto 6px;
    }
    .sig-name { font-size: 12px; font-weight: 600; color: #333; }
    .sig-role { font-size: 10px; color: #aaa; letter-spacing: 0.06em; text-transform: uppercase; }
    .date-seal {
      margin-top: 28px;
      font-size: 11px;
      color: #aaa;
      letter-spacing: 0.06em;
    }
    .seal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid #c9a84c;
      color: #c9a84c;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 16px;
      text-align: center;
      line-height: 1.2;
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="seal">OFFI-<br>CIAL</div>
    <div class="org">The Academy of Excellence</div>
    <div class="presents">proudly presents this</div>
    <div class="cert-title">Certificate of Achievement</div>
    <div class="awarded-to">Awarded To</div>
    <div class="recipient">Jordan Lee</div>
    <div class="description">
      In recognition of outstanding performance and exceptional dedication in completing the
      <strong>Advanced Web Development Bootcamp</strong>, demonstrating mastery of modern
      front-end and back-end technologies, and consistently exceeding program expectations.
    </div>
    <div class="sigs">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Dr. Sarah Chen</div>
        <div class="sig-role">Program Director</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Marcus Webb</div>
        <div class="sig-role">Lead Instructor</div>
      </div>
    </div>
    <div class="date-seal">Issued March 21, 2025 · Certificate No. ACE-2025-0847</div>
  </div>
</body>
</html>`;

const TEMPLATE_MENU = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Google Sans', sans-serif;
      background: #1a0a00;
      color: #f5e6d3;
      padding: 48px 56px;
      min-height: 100vh;
    }
    .restaurant-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid #3d2010;
    }
    .tag {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #c9833a;
      margin-bottom: 10px;
    }
    .restaurant-name {
      font-size: 38px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #f5e6d3;
      line-height: 1;
      margin-bottom: 8px;
    }
    .restaurant-sub {
      font-size: 13px;
      color: #7a5540;
      letter-spacing: 0.04em;
    }
    .menu-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .menu-section { margin-bottom: 32px; }
    .section-title {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #c9833a;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #3d2010;
    }
    .menu-item { margin-bottom: 18px; }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 3px;
    }
    .item-name {
      font-size: 14px;
      font-weight: 600;
      color: #f5e6d3;
    }
    .item-price {
      font-size: 14px;
      font-weight: 600;
      color: #c9833a;
    }
    .item-desc {
      font-size: 11.5px;
      color: #7a5540;
      line-height: 1.5;
    }
    .item-tags { margin-top: 4px; display: flex; gap: 5px; flex-wrap: wrap; }
    .item-tag {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 2px 6px;
      border: 1px solid #3d2010;
      color: #7a5540;
      border-radius: 3px;
    }
    .item-tag.special { border-color: #c9833a; color: #c9833a; }
    .divider {
      border: none;
      border-top: 1px solid #3d2010;
      margin: 8px 0 20px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #3d2010;
      font-size: 11px;
      color: #4a2e1a;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="restaurant-header">
    <div class="tag">Est. 2018 · Fine Dining</div>
    <div class="restaurant-name">Ember &amp; Oak</div>
    <div class="restaurant-sub">Wood-fired cuisine · Seasonal ingredients</div>
  </div>

  <div class="menu-columns">
    <div>
      <div class="menu-section">
        <div class="section-title">Starters</div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Smoked Burrata</div>
            <div class="item-price">$18</div>
          </div>
          <div class="item-desc">Heirloom tomatoes, basil oil, aged balsamic, grilled sourdough</div>
          <div class="item-tags"><span class="item-tag special">Chef's Pick</span><span class="item-tag">Vegetarian</span></div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Oak-Roasted Bone Marrow</div>
            <div class="item-price">$22</div>
          </div>
          <div class="item-desc">Chimichurri, pickled shallots, parsley salad, grilled crostini</div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Tuna Crudo</div>
            <div class="item-price">$24</div>
          </div>
          <div class="item-desc">Yuzu kosho, cucumber, sesame, micro shiso, ponzu dressing</div>
          <div class="item-tags"><span class="item-tag">Gluten-Free</span></div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Ember Onion Soup</div>
            <div class="item-price">$16</div>
          </div>
          <div class="item-desc">Slow-roasted cipollini onions, gruyère crust, fresh thyme</div>
          <div class="item-tags"><span class="item-tag">Vegetarian</span></div>
        </div>
      </div>

      <div class="menu-section">
        <div class="section-title">Salads</div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Little Gem Caesar</div>
            <div class="item-price">$17</div>
          </div>
          <div class="item-desc">House-made anchovy dressing, parmesan crisp, sourdough crouton</div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Roasted Beet &amp; Farro</div>
            <div class="item-price">$19</div>
          </div>
          <div class="item-desc">Whipped goat cheese, candied walnuts, orange vinaigrette, arugula</div>
          <div class="item-tags"><span class="item-tag">Vegetarian</span><span class="item-tag">Gluten-Free</span></div>
        </div>
      </div>
    </div>

    <div>
      <div class="menu-section">
        <div class="section-title">Mains</div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Dry-Aged Ribeye</div>
            <div class="item-price">$68</div>
          </div>
          <div class="item-desc">16oz prime cut, truffle butter, bone-in, roasted garlic jus, hand-cut fries</div>
          <div class="item-tags"><span class="item-tag special">Signature</span><span class="item-tag">Gluten-Free</span></div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Whole Roasted Duck</div>
            <div class="item-price">$54</div>
          </div>
          <div class="item-desc">Cherry gastrique, wild rice pilaf, braised endive, duck jus</div>
          <div class="item-tags"><span class="item-tag special">Chef's Pick</span></div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Wood-Fired Salmon</div>
            <div class="item-price">$44</div>
          </div>
          <div class="item-desc">Dill beurre blanc, forbidden rice, roasted fennel, capers</div>
          <div class="item-tags"><span class="item-tag">Gluten-Free</span></div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Wild Mushroom Risotto</div>
            <div class="item-price">$38</div>
          </div>
          <div class="item-desc">Porcini, chanterelle, truffle oil, aged parmigiano, fresh herbs</div>
          <div class="item-tags"><span class="item-tag">Vegetarian</span><span class="item-tag">Gluten-Free</span></div>
        </div>
      </div>

      <div class="menu-section">
        <div class="section-title">Desserts</div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Valrhona Chocolate Fondant</div>
            <div class="item-price">$16</div>
          </div>
          <div class="item-desc">Warm dark chocolate, salted caramel ice cream, hazelnut praline</div>
          <div class="item-tags"><span class="item-tag special">Must Try</span></div>
        </div>
        <div class="menu-item">
          <div class="item-header">
            <div class="item-name">Seasonal Fruit Pavlova</div>
            <div class="item-price">$14</div>
          </div>
          <div class="item-desc">Meringue, chantilly cream, passion fruit curd, fresh berries</div>
          <div class="item-tags"><span class="item-tag">Gluten-Free</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    Please inform your server of any allergies or dietary requirements.<br>
    Gratuity of 20% added for parties of 6 or more. · Prices exclusive of tax.
  </div>
</body>
</html>`;

const TEMPLATE_PROPOSAL = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Google Sans', sans-serif;
      color: #1a1a1a;
      background: #fff;
      font-size: 13px;
      line-height: 1.7;
    }

    /* ── Page layout ── */
    .page {
      width: 100%;
      min-height: 100vh;
      padding: 64px 72px;
      page-break-after: always;
      break-after: page;
    }
    .page:last-child { page-break-after: auto; break-after: auto; }

    /* Prevent breaks splitting cards, timeline items, team cards, etc. */
    .card, .card-row,
    .tl-item,
    .team-card,
    .price-tier, .pricing-row,
    .highlight-box,
    h2, h3 {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Keep headings with the content that follows */
    h2, h3 { page-break-after: avoid; break-after: avoid; }

    /* ── Cover page ── */
    .cover {
      background: #0a0f1e;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 72px 80px;
    }
    .cover-top { }
    .cover-tag {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #4f86f7;
      font-weight: 700;
      margin-bottom: 40px;
    }
    .cover-title {
      font-size: 42px;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: #fff;
      margin-bottom: 20px;
      max-width: 520px;
    }
    .cover-subtitle {
      font-size: 15px;
      color: #6b7fa3;
      max-width: 440px;
      line-height: 1.6;
    }
    .cover-divider {
      width: 48px;
      height: 3px;
      background: #4f86f7;
      margin: 32px 0;
    }
    .cover-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .cover-client { }
    .cover-client-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #3a4d6e;
      margin-bottom: 4px;
    }
    .cover-client-name {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
    .cover-meta {
      text-align: right;
      font-size: 11px;
      color: #3a4d6e;
      line-height: 1.8;
    }
    .cover-accent-block {
      position: absolute;
      top: 0; right: 0;
      width: 220px;
      height: 220px;
      background: linear-gradient(135deg, #1a2a4a 0%, #0a0f1e 100%);
      border-bottom-left-radius: 220px;
    }

    /* ── Inner pages ── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 36px;
    }
    .page-header-brand {
      font-size: 13px;
      font-weight: 700;
      color: #0a0f1e;
      letter-spacing: -0.01em;
    }
    .page-header-section {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    h2 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0a0f1e;
      margin-bottom: 6px;
    }
    .section-intro {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 28px;
      max-width: 560px;
    }
    h3 {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 24px 0 6px;
    }
    p { color: #374151; margin-bottom: 12px; }
    ul { padding-left: 18px; margin-bottom: 16px; }
    li { color: #374151; margin-bottom: 5px; }

    .highlight-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      font-size: 13px;
      color: #1e40af;
    }

    /* ── Problem / Solution cards ── */
    .card-row { display: flex; gap: 16px; margin: 20px 0; }
    .card {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
    }
    .card-icon {
      font-size: 20px;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .card-body { font-size: 12px; color: #64748b; line-height: 1.6; }

    /* ── Timeline ── */
    .timeline { margin: 20px 0; }
    .tl-item {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .tl-left { display: flex; flex-direction: column; align-items: center; }
    .tl-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #3b82f6;
      flex-shrink: 0;
      margin-top: 4px;
    }
    .tl-line { width: 2px; flex: 1; background: #e2e8f0; margin-top: 4px; }
    .tl-item:last-child .tl-line { display: none; }
    .tl-right { padding-bottom: 4px; }
    .tl-phase {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #3b82f6;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .tl-title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 3px; }
    .tl-desc { font-size: 12px; color: #64748b; }
    .tl-duration {
      display: inline-block;
      font-size: 10px;
      background: #f1f5f9;
      color: #64748b;
      padding: 1px 8px;
      border-radius: 99px;
      margin-top: 4px;
    }

    /* ── Pricing ── */
    .pricing-row {
      display: flex;
      gap: 16px;
      margin: 20px 0;
    }
    .price-tier {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 24px 20px;
      text-align: center;
    }
    .price-tier.featured {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    .tier-name {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-bottom: 8px;
    }
    .price-tier.featured .tier-name { color: #3b82f6; }
    .tier-price {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }
    .tier-period { font-size: 11px; color: #94a3b8; margin-bottom: 16px; }
    .tier-features { list-style: none; padding: 0; text-align: left; }
    .tier-features li {
      font-size: 12px;
      color: #374151;
      padding: 5px 0;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tier-features li::before {
      content: "✓";
      color: #3b82f6;
      font-weight: 700;
      font-size: 11px;
    }
    .price-tier.featured .tier-features li { border-color: #dbeafe; }

    /* ── Team ── */
    .team-grid { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px; }
    .team-card {
      width: calc(50% - 8px);
      display: flex;
      gap: 14px;
      align-items: flex-start;
      border: 1px solid #f1f5f9;
      border-radius: 10px;
      padding: 16px;
    }
    .avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: #0a0f1e;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .member-name { font-size: 13px; font-weight: 700; color: #0f172a; }
    .member-role { font-size: 11px; color: #3b82f6; margin-bottom: 4px; }
    .member-bio { font-size: 11px; color: #64748b; line-height: 1.5; }

    /* ── Page footer ── */
    .page-footer {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #cbd5e1;
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>

  <!-- ░░ PAGE 1: Cover ░░ -->
  <div class="page cover">
    <div class="cover-top">
      <div class="cover-tag">Project Proposal · 2025</div>
      <div class="cover-title">Redesigning the Future of Your Digital Platform</div>
      <div class="cover-divider"></div>
      <div class="cover-subtitle">A strategic proposal for a full-scale product redesign, performance overhaul, and growth-ready infrastructure for NovaTech Solutions.</div>
    </div>
    <div class="cover-bottom">
      <div class="cover-client">
        <div class="cover-client-label">Prepared for</div>
        <div class="cover-client-name">NovaTech Solutions Inc.</div>
      </div>
      <div class="cover-meta">
        Prepared by Pixel &amp; Craft Studio<br>
        March 21, 2025<br>
        Version 1.0 · Confidential
      </div>
    </div>
  </div>

  <!-- ░░ PAGE 2: Problem & Approach ░░ -->
  <div class="page">
    <div class="page-header">
      <span class="page-header-brand">Pixel &amp; Craft Studio</span>
      <span class="page-header-section">Problem &amp; Approach</span>
    </div>

    <h2>The Challenge</h2>
    <p class="section-intro">NovaTech's current platform was built in 2019 and has not kept pace with user expectations, modern performance standards, or the competitive landscape.</p>

    <div class="card-row">
      <div class="card">
        <div class="card-icon">🐢</div>
        <div class="card-title">Performance</div>
        <div class="card-body">Average page load of 6.2s. Core Web Vitals failing across all key flows. Users abandoning at 3× industry average.</div>
      </div>
      <div class="card">
        <div class="card-icon">📉</div>
        <div class="card-title">Conversion</div>
        <div class="card-body">Onboarding funnel has a 74% drop-off. Checkout flow has not been optimized since 2021. Mobile conversion is 1.8%.</div>
      </div>
      <div class="card">
        <div class="card-icon">🔧</div>
        <div class="card-title">Maintainability</div>
        <div class="card-body">No design system. 14 inconsistent component patterns. Engineering estimates 30% of sprint time spent on UI debt.</div>
      </div>
    </div>

    <h3>Our Approach</h3>
    <p>We propose a three-phase engagement: Discovery &amp; Audit → Design &amp; Prototype → Engineering &amp; Launch. Each phase has defined deliverables, success metrics, and stakeholder checkpoints.</p>

    <div class="highlight-box">
      Our work with similar B2B SaaS clients has yielded an average 41% improvement in conversion and a 3.8× reduction in page load time within 90 days of launch.
    </div>

    <h3>Guiding Principles</h3>
    <ul>
      <li><strong>Performance-first:</strong> Every decision is measured against Core Web Vitals targets</li>
      <li><strong>User-centered:</strong> Research and usability testing at every phase, not just the start</li>
      <li><strong>System thinking:</strong> Build a design system that scales beyond this project</li>
      <li><strong>Transparent:</strong> Weekly check-ins, shared Figma workspace, live staging environment</li>
    </ul>

    <div class="page-footer">
      <span>Pixel &amp; Craft Studio · Confidential</span>
      <span>Page 2 of 4</span>
    </div>
  </div>

  <!-- ░░ PAGE 3: Timeline & Pricing ░░ -->
  <div class="page">
    <div class="page-header">
      <span class="page-header-brand">Pixel &amp; Craft Studio</span>
      <span class="page-header-section">Timeline &amp; Investment</span>
    </div>

    <h2>Project Timeline</h2>
    <p class="section-intro">End-to-end delivery in 16 weeks across three phases, with a soft launch in week 14 and full handoff by week 16.</p>

    <div class="timeline">
      <div class="tl-item">
        <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
        <div class="tl-right">
          <div class="tl-phase">Phase 1</div>
          <div class="tl-title">Discovery &amp; Audit</div>
          <div class="tl-desc">Stakeholder interviews, analytics deep-dive, heuristic evaluation, competitive analysis, user research synthesis.</div>
          <span class="tl-duration">Weeks 1–3</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
        <div class="tl-right">
          <div class="tl-phase">Phase 2</div>
          <div class="tl-title">Design &amp; Prototyping</div>
          <div class="tl-desc">Information architecture, wireframes, high-fidelity UI, interactive prototype, usability testing (2 rounds), design system v1.</div>
          <span class="tl-duration">Weeks 4–9</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
        <div class="tl-right">
          <div class="tl-phase">Phase 3</div>
          <div class="tl-title">Engineering &amp; QA</div>
          <div class="tl-desc">Frontend implementation, performance optimization, accessibility audit (WCAG 2.1 AA), cross-browser QA, staging deployment.</div>
          <span class="tl-duration">Weeks 10–14</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-left"><div class="tl-dot" style="background:#22c55e"></div></div>
        <div class="tl-right">
          <div class="tl-phase" style="color:#16a34a">Launch</div>
          <div class="tl-title">Handoff &amp; Launch Support</div>
          <div class="tl-desc">Production deployment, documentation, team training, 30-day post-launch monitoring and bug fixes included.</div>
          <span class="tl-duration">Weeks 15–16</span>
        </div>
      </div>
    </div>

    <h2 style="margin-top:32px">Investment</h2>
    <p class="section-intro">Choose the engagement model that best fits your timeline and internal capacity.</p>

    <div class="pricing-row">
      <div class="price-tier">
        <div class="tier-name">Essentials</div>
        <div class="tier-price">$38K</div>
        <div class="tier-period">fixed price</div>
        <ul class="tier-features">
          <li>Discovery &amp; Audit</li>
          <li>Core UI Redesign</li>
          <li>Design System v1</li>
          <li>Handoff to your team</li>
        </ul>
      </div>
      <div class="price-tier featured">
        <div class="tier-name">Full Build</div>
        <div class="tier-price">$74K</div>
        <div class="tier-period">fixed price · recommended</div>
        <ul class="tier-features">
          <li>Everything in Essentials</li>
          <li>Full frontend engineering</li>
          <li>Performance optimization</li>
          <li>Accessibility audit</li>
          <li>30-day launch support</li>
        </ul>
      </div>
      <div class="price-tier">
        <div class="tier-name">Retainer</div>
        <div class="tier-price">$12K</div>
        <div class="tier-period">per month</div>
        <ul class="tier-features">
          <li>Ongoing design &amp; dev</li>
          <li>Dedicated team pod</li>
          <li>Monthly strategy sessions</li>
          <li>Priority support SLA</li>
        </ul>
      </div>
    </div>

    <div class="page-footer">
      <span>Pixel &amp; Craft Studio · Confidential</span>
      <span>Page 3 of 4</span>
    </div>
  </div>

  <!-- ░░ PAGE 4: Team & Next Steps ░░ -->
  <div class="page">
    <div class="page-header">
      <span class="page-header-brand">Pixel &amp; Craft Studio</span>
      <span class="page-header-section">Team &amp; Next Steps</span>
    </div>

    <h2>Your Dedicated Team</h2>
    <p class="section-intro">A senior, cross-functional team with no junior hand-offs. Every person listed here will actively work on your project.</p>

    <div class="team-grid">
      <div class="team-card">
        <div class="avatar">SR</div>
        <div>
          <div class="member-name">Sofia Reyes</div>
          <div class="member-role">Engagement Lead &amp; Strategy</div>
          <div class="member-bio">12 years in product strategy. Led redesigns for Shopify, Intercom, and 3 Series B fintech startups. Your primary point of contact.</div>
        </div>
      </div>
      <div class="team-card">
        <div class="avatar" style="background:#1d4ed8">JK</div>
        <div>
          <div class="member-name">James Kim</div>
          <div class="member-role">Senior Product Designer</div>
          <div class="member-bio">Previously at Linear and Figma. Specializes in complex B2B interfaces and design systems. 9 years experience.</div>
        </div>
      </div>
      <div class="team-card">
        <div class="avatar" style="background:#0f766e">AN</div>
        <div>
          <div class="member-name">Amara Nwosu</div>
          <div class="member-role">UX Researcher</div>
          <div class="member-bio">Mixed-methods researcher with a background in cognitive psychology. Has run 200+ moderated user sessions across SaaS products.</div>
        </div>
      </div>
      <div class="team-card">
        <div class="avatar" style="background:#7c3aed">ML</div>
        <div>
          <div class="member-name">Marco Levi</div>
          <div class="member-role">Frontend Engineer</div>
          <div class="member-bio">Core Web Vitals specialist. React, accessibility, and design-system implementation. Previously staff engineer at Atlassian.</div>
        </div>
      </div>
    </div>

    <h3 style="margin-top:32px">Next Steps</h3>
    <p>To move forward, we suggest the following steps:</p>
    <ul>
      <li><strong>Review &amp; feedback</strong> — Share any questions or requested changes by April 4, 2025</li>
      <li><strong>Alignment call</strong> — 45-minute call to agree on scope, timeline, and success metrics</li>
      <li><strong>Contract &amp; kickoff</strong> — Sign SOW, 30% deposit, and schedule the kickoff workshop</li>
      <li><strong>Week 1 kickoff</strong> — Stakeholder interviews begin, shared workspace provisioned</li>
    </ul>

    <div class="highlight-box" style="margin-top:24px">
      We're excited about this opportunity and confident we can deliver measurable results. This proposal is valid until <strong>April 15, 2025</strong>. Contact sofia@pixelcraft.studio to proceed.
    </div>

    <div class="page-footer">
      <span>Pixel &amp; Craft Studio · Confidential</span>
      <span>Page 4 of 4</span>
    </div>
  </div>

</body>
</html>`;

const TEMPLATES = [
	{ id: "default", label: "Default", html: TEMPLATE_DEFAULT },
	{ id: "invoice", label: "Invoice", html: TEMPLATE_INVOICE },
	{ id: "resume", label: "Résumé", html: TEMPLATE_RESUME },
	{ id: "report", label: "Report", html: TEMPLATE_REPORT },
	{ id: "certificate", label: "Certificate", html: TEMPLATE_CERTIFICATE },
	{ id: "menu", label: "Menu", html: TEMPLATE_MENU },
	{ id: "proposal", label: "Proposal (4 pages)", html: TEMPLATE_PROPOSAL },
];

const geistMonoTheme = EditorView.theme({
	"&": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
	".cm-content": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
	".cm-gutters": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
});

const PAGE_SIZES = ["A3", "A4", "A5", "B4", "B5", "Letter", "Legal", "Ledger"];
const MARGIN_TYPES = ["None", "Narrow", "Normal", "Moderate", "Wide"];
const FORMATS = [
	{ value: "pdf", label: "PDF" },
	{ value: "png", label: "PNG" },
	{ value: "jpeg", label: "JPEG" },
	{ value: "webp", label: "WebP" },
];

function Select({ value, onChange, options }) {
	return (
		<div className="relative flex items-center">
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="appearance-none bg-[#f5f5f5] dark:bg-[#0a0a0a] border border-[#e0e0e0] dark:border-[#2a2a2a] text-[#333] dark:text-[#ccc] text-xs pl-2 pr-6 h-7 outline-none focus:border-[#aaa] dark:focus:border-[#555] cursor-pointer"
			>
				{options.map((o) => (
					<option key={o.value ?? o} value={o.value ?? o}>
						{o.label ?? o}
					</option>
				))}
			</select>
			<ChevronDown
				size={10}
				className="absolute right-1.5 text-[#aaa] dark:text-[#555] pointer-events-none"
			/>
		</div>
	);
}

function NumberInput({ value, onChange, placeholder }) {
	return (
		<input
			type="number"
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
			placeholder={placeholder}
			className="bg-[#f5f5f5] dark:bg-[#0a0a0a] border border-[#e0e0e0] dark:border-[#2a2a2a] text-[#333] dark:text-[#ccc] text-xs px-2 h-7 w-20 outline-none focus:border-[#aaa] dark:focus:border-[#555]"
		/>
	);
}

export default function App() {
	const [templateId, setTemplateId] = useState("default");
	const [html, setHtml] = useState(TEMPLATES[0].html);
	const [format, setFormat] = useState("pdf");
	const [pageSize, setPageSize] = useState("A4");
	const [orientation, setOrientation] = useState("portrait");
	const [margins, setMargins] = useState("None");
	const [imgWidth, setImgWidth] = useState(1200);
	const [imgHeight, setImgHeight] = useState(800);
	const [status, setStatus] = useState("loading");
	const [dark, setDark] = useState(
		() => localStorage.getItem("theme") !== "light",
	);

	const [previewUrl, setPreviewUrl] = useState(null);
	const [bookReady, setBookReady] = useState(false);
	const [renderMs, setRenderMs] = useState(null);
	const [exportOptions, setExportOptions] = useState({});

	const bookRef = useRef(null);
	const debounceRef = useRef(null);
	const previewUrlRef = useRef(null);

	useEffect(() => {
		fetch(logoUrl)
			.then((res) => res.arrayBuffer())
			.then((buffer) => {
				setExportOptions({
					baseUrl: "https://example.com",
					resources: {
						"https://example.com/plutoprint.jpg": new Uint8Array(buffer),
					},
				});
			});
	}, []);

	useEffect(() => {
		fetch("/GoogleSans-VariableFont_GRAD,opsz,wght.ttf")
			.then((res) => res.arrayBuffer())
			.then((buf) =>
				createBook({
					fonts: [
						["GoogleSans-VariableFont_GRAD,opsz,wght.ttf", new Uint8Array(buf)],
					],
				}),
			)
			.then((book) => {
				bookRef.current = book;
				setStatus("ready");
				setBookReady(true);
			})
			.catch(() => setStatus("error"));

		return () => {
			if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
		};
	}, []);

	useEffect(() => {
		if (!bookReady) return;
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			try {
				const t0 = performance.now();
				let bytes;
				let mime;
				const resolvedPageSize =
					orientation === "landscape"
						? landscape(PageSize[pageSize])
						: PageSize[pageSize];
				if (format === "pdf") {
					bytes = bookRef.current.pdf(html, {
						pageSize: resolvedPageSize,
						margins: Margins[margins],
						...exportOptions,
					});
					mime = "application/pdf";
				} else {
					bytes = bookRef.current.image(html, {
						format,
						width: imgWidth,
						height: imgHeight,
						...exportOptions,
					});
					mime = `image/${format}`;
				}
				setRenderMs(Math.round(performance.now() - t0));
				const blob = new Blob([bytes], { type: mime });
				const url = URL.createObjectURL(blob);
				if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
				previewUrlRef.current = url;
				setPreviewUrl(url);
			} catch (err) {
				console.error(err);
			}
		}, 1);
		return () => clearTimeout(debounceRef.current);
	}, [
		html,
		format,
		pageSize,
		orientation,
		margins,
		imgWidth,
		imgHeight,
		bookReady,
		exportOptions,
	]);

	async function handleExport() {
		if (!bookRef.current || status === "exporting") return;
		setStatus("exporting");
		try {
			let bytes;
			let mime;
			let ext;
			const resolvedPageSize =
				orientation === "landscape"
					? landscape(PageSize[pageSize])
					: PageSize[pageSize];
			if (format === "pdf") {
				bytes = bookRef.current.pdf(html, {
					pageSize: resolvedPageSize,
					margins: Margins[margins],
					...exportOptions,
				});
				mime = "application/pdf";
				ext = "pdf";
			} else {
				bytes = bookRef.current.image(html, {
					format,
					width: imgWidth,
					height: imgHeight,
					...exportOptions,
				});
				mime = `image/${format}`;
				ext = format;
			}
			const blob = new Blob([bytes], { type: mime });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `export.${ext}`;
			a.click();
			URL.revokeObjectURL(url);
			setStatus("ready");
		} catch (err) {
			console.error(err);
			setStatus("error");
		}
	}

	const isReady = status === "ready";

	return (
		<div
			className={clsx(
				"flex flex-col h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white",
				dark && "dark",
			)}
		>
			{status === "loading" && (
				<div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white dark:bg-black">
					<div className="flex gap-1">
						{[0, 1, 2].map((i) => (
							<span
								key={i}
								className="w-1 h-1 bg-black dark:bg-white animate-bounce"
								style={{ animationDelay: `${i * 0.15}s` }}
							/>
						))}
					</div>
					<span className="text-[11px] font-mono text-[#aaa] dark:text-[#555]">
						Loading WASM...
					</span>
				</div>
			)}
			{/* Header */}
			<header className="flex items-center justify-between px-4 h-12 border-b border-[#e5e5e5] dark:border-[#1a1a1a] shrink-0 bg-white dark:bg-black">
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold tracking-tight">
						ClarkBook
					</span>
					<span className="text-[11px] text-[#aaa] dark:text-[#555] border border-[#e5e5e5] dark:border-[#1f1f1f] px-2 py-0.5 font-mono">
						HTML → PDF & Image
					</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() =>
							setDark((d) => {
								const next = !d;
								localStorage.setItem("theme", next ? "dark" : "light");
								return next;
							})
						}
						className="text-[#aaa] dark:text-[#555] hover:text-black dark:hover:text-white transition-colors p-1"
					>
						{dark ? <Sun size={15} /> : <Moon size={15} />}
					</button>
					<a
						href="https://github.com/seanghay/clarkbook"
						target="_blank"
						rel="noreferrer"
						className="text-[#aaa] dark:text-[#555] hover:text-black dark:hover:text-white transition-colors"
					>
						<Github size={16} />
					</a>
				</div>
			</header>

			{/* Toolbar */}
			<div className="flex items-center gap-2 px-3 h-10 border-b border-[#e5e5e5] dark:border-[#1a1a1a] bg-white dark:bg-black shrink-0">
				<Select
					value={templateId}
					onChange={(id) => {
						const t = TEMPLATES.find((t) => t.id === id);
						if (t) {
							setTemplateId(id);
							setHtml(t.html);
						}
					}}
					options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
				/>
				<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
				<Select value={format} onChange={setFormat} options={FORMATS} />

				{format === "pdf" ? (
					<>
						<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
						<Select
							value={pageSize}
							onChange={setPageSize}
							options={PAGE_SIZES}
						/>
						<Select
							value={orientation}
							onChange={setOrientation}
							options={[
								{ value: "portrait", label: "Portrait" },
								{ value: "landscape", label: "Landscape" },
							]}
						/>
						<Select
							value={margins}
							onChange={setMargins}
							options={MARGIN_TYPES}
						/>
					</>
				) : (
					<>
						<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
						<div className="flex items-center gap-1.5">
							<NumberInput
								value={imgWidth}
								onChange={setImgWidth}
								placeholder="Width"
							/>
							<span className="text-[#aaa] dark:text-[#444] text-xs">×</span>
							<NumberInput
								value={imgHeight}
								onChange={setImgHeight}
								placeholder="Height"
							/>
						</div>
					</>
				)}

				<div className="ml-auto">
					<button
						type="button"
						onClick={handleExport}
						disabled={!isReady}
						className={clsx(
							"bg-black text-white dark:bg-white dark:text-black text-xs font-medium px-3 h-7 flex items-center gap-1.5 transition-colors",
							isReady
								? "hover:bg-[#222] dark:hover:bg-[#e5e5e5] cursor-pointer"
								: "opacity-40 cursor-not-allowed",
						)}
					>
						<Download size={12} />
						{status === "exporting" ? "Exporting..." : "Export"}
					</button>
				</div>
			</div>

			{/* Editor */}
			<PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
				{/* Code Pane */}
				<Panel
					defaultSize={50}
					minSize={20}
					className="flex flex-col overflow-hidden"
				>
					<div className="text-[10px] text-[#bbb] dark:text-[#3a3a3a] px-3 py-1.5 border-b border-[#f0f0f0] dark:border-[#111] font-mono uppercase tracking-widest shrink-0 bg-white dark:bg-black">
						HTML
					</div>
					<div className="flex-1 overflow-hidden">
						<CodeMirror
							value={html}
							onChange={setHtml}
							height="100%"
							extensions={[htmlLang(), geistMonoTheme]}
							theme={dark ? githubDark : githubLight}
							basicSetup={{ tabSize: 2, foldGutter: false }}
							style={{
								fontFamily: "'Geist Mono', ui-monospace, monospace",
								fontSize: "13px",
								height: "100%",
							}}
						/>
					</div>
				</Panel>

				{/* Resize Handle */}
				<PanelResizeHandle className="w-px bg-[#e5e5e5] dark:bg-[#1a1a1a] hover:bg-[#bbb] dark:hover:bg-[#444] transition-colors cursor-col-resize" />

				{/* Preview Pane */}
				<Panel
					defaultSize={50}
					minSize={20}
					className="flex flex-col overflow-hidden"
				>
					<div className="text-[10px] text-[#bbb] dark:text-[#3a3a3a] px-3 py-1.5 border-b border-[#f0f0f0] dark:border-[#111] font-mono uppercase tracking-widest shrink-0 bg-white dark:bg-black">
						Preview
					</div>
					<div className="flex-1 overflow-hidden bg-white">
						{previewUrl ? (
							format === "pdf" ? (
								<PdfPreview url={previewUrl} />
							) : (
								<img
									src={previewUrl}
									className="w-full h-full object-contain"
									alt="Preview"
								/>
							)
						) : (
							<div className="w-full h-full flex items-center justify-center text-[#bbb] dark:text-[#3a3a3a] text-xs font-mono">
								{status === "loading" ? "Loading WASM..." : "No preview"}
							</div>
						)}
					</div>
				</Panel>
			</PanelGroup>

			{/* Status Bar */}
			<div className="flex items-center gap-3 px-3 h-6 border-t border-[#e5e5e5] dark:border-[#1a1a1a] text-[10px] text-[#bbb] dark:text-[#3a3a3a] font-mono shrink-0 bg-white dark:bg-black">
				<span>{html.length.toLocaleString()} chars</span>
				<span className="text-[#ddd] dark:text-[#222]">·</span>
				<span>{format.toUpperCase()}</span>
				{format !== "pdf" && (
					<>
						<span className="text-[#ddd] dark:text-[#222]">·</span>
						<span>
							{imgWidth} × {imgHeight}px
						</span>
					</>
				)}
				{format === "pdf" && (
					<>
						<span className="text-[#ddd] dark:text-[#222]">·</span>
						<span>
							{pageSize} · {orientation} · {margins}
						</span>
					</>
				)}
				<span className="ml-auto flex items-center gap-3">
					{renderMs !== null && <span>{renderMs}ms</span>}
					<span>
						{status === "loading" && "Loading WASM..."}
						{status === "ready" && "Ready"}
						{status === "exporting" && "Exporting..."}
						{status === "error" && "Error"}
					</span>
				</span>
			</div>
		</div>
	);
}
