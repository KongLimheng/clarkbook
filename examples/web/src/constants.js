import templateDefault from './templates/default.html?raw';
import templateInvoice from './templates/invoice.html?raw';
import templateResume from './templates/resume.html?raw';
import templateReport from './templates/report.html?raw';
import templateCertificate from './templates/certificate.html?raw';
import templateMenu from './templates/menu.html?raw';
import templateProposal from './templates/proposal.html?raw';
import templateAnnouncement from './templates/announcement.html?raw';

export const TEMPLATES = [
	{ id: "default", label: "Default", html: templateDefault },
	{ id: "invoice", label: "Invoice", html: templateInvoice },
	{ id: "resume", label: "Résumé", html: templateResume },
	{ id: "report", label: "Report", html: templateReport },
	{ id: "certificate", label: "Certificate", html: templateCertificate },
	{ id: "menu", label: "Menu", html: templateMenu },
	{ id: "proposal", label: "Proposal (4 pages)", html: templateProposal },
	{ id: "announcement", label: "សេចក្ដីជូនដំណឹង (2 pages)", html: templateAnnouncement },
];

export const PAGE_SIZES = ["A3", "A4", "A5", "B4", "B5", "Letter", "Legal", "Ledger"];
export const MARGIN_TYPES = ["None", "Narrow", "Normal", "Moderate", "Wide"];
export const FORMATS = [
	{ value: "pdf", label: "PDF" },
	{ value: "png", label: "PNG" },
	{ value: "jpeg", label: "JPEG" },
	{ value: "webp", label: "WebP" },
];
