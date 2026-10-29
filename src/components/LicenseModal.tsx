import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Building2, 
  FileText, 
  Lock,
  Globe
} from 'lucide-react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const licenseData = {
    licensee: 'Richard Alan Witt',
    certificateId: 'RAW-SATCOM-2026-LIC-0881',
    grantDate: 'October 29, 2026',
    status: 'Active · Certified · Exclusive License',
    lawFirmDomain: 'www.wittlawfirm.com',
    lawFirmUrl: 'https://www.wittlawfirm.com',
    lawFirmTitle: 'The Law Office of Richard A. Witt LLC',
    corporateDomain: 'www.owenscompany.com',
    corporateUrl: 'https://www.owenscompany.com',
    corporateTitle: 'Owens Company',
    appTitle: 'DrFun1 Orbit - Commercial Satellite Operator Directory & Wholesale Store',
  };

  const handleCopy = () => {
    const text = `SOFTWARE LICENSE CERTIFICATE
Application: ${licenseData.appTitle}
Licensee: ${licenseData.licensee}
Certificate ID: ${licenseData.certificateId}
Issue Date: ${licenseData.grantDate}
Affiliated Firm: ${licenseData.lawFirmTitle} (${licenseData.lawFirmDomain})
Affiliated Corporate: ${licenseData.corporateTitle} (${licenseData.corporateDomain})
Status: ${licenseData.status}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCertificate = () => {
    const text = `========================================================================
CERTIFICATE OF SOFTWARE LICENSE & PROPRIETARY GRANT
========================================================================

APPLICATION:
  DrFun1 Orbit - Commercial Satellite Operator Directory & Wholesale Store

EXCLUSIVE LICENSEE:
  Richard Alan Witt

AFFILIATED LAW FIRM:
  The Law Office of Richard A. Witt LLC
  Official Website: https://${licenseData.lawFirmDomain}

AFFILIATED CORPORATE ENTITY:
  Owens Company
  Official Website: https://${licenseData.corporateDomain}

LICENSE CREDENTIALS:
  License ID:      RAW-SATCOM-2026-LIC-0881
  Effective Date:  October 29, 2026
  Jurisdiction:    Commercial Satcom Telecom & Regulatory Law
  Operational:     Active · Certified · Perpetual Grant

TERMS & OPERATIONAL SCOPE:
  This application and all associated constellation telemetry schemas,
  carrier contact databases, RFQ transmission engines, and orbital
  directory records are licensed to Richard Alan Witt for enterprise
  procurement, legal counsel review, and commercial operations.

VERIFIED AUTHENTICATION:
  The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)
  Owens Company (www.owenscompany.com)
========================================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `License_Certificate_Richard_Alan_Witt_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Certificate of Software License</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                License ID: {licenseData.certificateId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Card Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Certificate Emboss Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-mono relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                  Designated Licensee
                </span>
                <span className="text-base font-bold text-sky-400 font-sans tracking-tight">
                  {licenseData.licensee}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                  Entitlement Status
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  ● Active & Certified
                </span>
              </div>
            </div>

            {/* Grant Details */}
            <div className="grid grid-cols-2 gap-4 text-xs py-1">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">
                  Grant Date
                </span>
                <span className="text-slate-200">{licenseData.grantDate}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">
                  License Class
                </span>
                <span className="text-slate-200">Commercial Proprietary</span>
              </div>
            </div>

            {/* Designated Entities */}
            <div className="border-t border-slate-800/80 pt-3 space-y-2.5">
              <span className="text-slate-500 text-[10px] uppercase block tracking-wider">
                Authorized Corporate & Legal Entities
              </span>

              {/* Witt Law Firm */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-100 font-sans block text-xs">
                      {licenseData.lawFirmTitle}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {licenseData.lawFirmDomain}
                    </span>
                  </div>
                </div>

                <a
                  href={licenseData.lawFirmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] font-sans font-medium text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded transition-colors inline-flex items-center gap-1"
                >
                  <span>Visit Domain</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Owens Company */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-100 font-sans block text-xs">
                      {licenseData.corporateTitle}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {licenseData.corporateDomain}
                    </span>
                  </div>
                </div>

                <a
                  href={licenseData.corporateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] font-sans font-medium text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded transition-colors inline-flex items-center gap-1"
                >
                  <span>Visit Domain</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Application Scope */}
            <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-400 leading-relaxed font-sans">
              This license certifies that Richard Alan Witt possesses full commercial entitlement and administration rights for the Satcom Orbit directory software, enabling spectrum procurement analysis, carrier capacity negotiations, and verified technical communications.
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Permanent Certificate Signature: RAW-2026-CERT-OK
          </span>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Certificate</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCertificate}
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
