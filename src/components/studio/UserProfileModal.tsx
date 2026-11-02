/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Broadcaster & Developer User Profile Management Modal
 */

import React, { useState } from 'react';
import { BroadcasterUserProfile } from '../../types/developerPortals';
import { 
  User, 
  X as CloseIcon, 
  ShieldCheck, 
  Key, 
  Tv, 
  Radio, 
  Check, 
  Globe, 
  Mail, 
  Award, 
  Sparkles, 
  Save, 
  Code2,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BroadcasterUserProfile;
  onSaveProfile: (updatedProfile: BroadcasterUserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<BroadcasterUserProfile>(profile);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Broadcaster &amp; Developer Profile</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {formData.role}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage your broadcaster identity, linked dev.twitch.tv &amp; dev.kick.com credentials, and FCC affiliations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Avatar & Display Name Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="relative group shrink-0">
              <img
                src={formData.avatarUrl}
                alt={formData.displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-sky-400 shadow-xl"
              />
            </div>

            <div className="flex-1 space-y-2 w-full text-xs">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">Preset Avatars</label>
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt=""
                    onClick={() => setFormData({ ...formData, avatarUrl: av })}
                    className={`w-8 h-8 rounded-full object-cover cursor-pointer border transition-all ${
                      formData.avatarUrl === av ? 'border-sky-400 scale-110 shadow-md shadow-sky-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="Or paste custom image URL..."
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          {/* Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Display Name</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Username / Handle</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sky-400 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Broadcaster &amp; Dev Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Master Broadcaster">Master Broadcaster</option>
                <option value="Station Operator">Station Operator</option>
                <option value="Twitch Partner & Dev">Twitch Partner &amp; Dev</option>
                <option value="Kick Verified Creator">Kick Verified Creator</option>
                <option value="IRC NetAdmin">IRC NetAdmin</option>
                <option value="Legal Compliance">Legal Compliance</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="text-xs">
            <label className="font-semibold text-slate-300 block mb-1">Broadcaster Biography</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-xs font-sans"
            />
          </div>

          {/* Linked Developer Accounts Section */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Linked Developer Accounts &amp; Teleport Credentials</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">dev.twitch.tv Channel</label>
                <input
                  type="text"
                  value={formData.twitchUsername}
                  onChange={(e) => setFormData({ ...formData, twitchUsername: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-purple-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">dev.kick.com Channel</label>
                <input
                  type="text"
                  value={formData.kickUsername}
                  onChange={(e) => setFormData({ ...formData, kickUsername: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-emerald-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">UnrealIRCd Operator Nick</label>
                <input
                  type="text"
                  value={formData.unrealIrcNick}
                  onChange={(e) => setFormData({ ...formData, unrealIrcNick: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sky-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">FCC Station / Teleport Affiliation</label>
                <input
                  type="text"
                  value={formData.fccStationAffiliation}
                  onChange={(e) => setFormData({ ...formData, fccStationAffiliation: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Witt Law Firm License ID: <strong className="text-emerald-400">{formData.wittLawLicenseId}</strong></span>
              <span className="text-sky-400">Certified Global Reseller</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase">BROADCAST HOURS</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">{formData.totalBroadcastHours.toLocaleString()}h</div>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase">CHANNELS</span>
              <div className="text-sm font-bold font-mono text-sky-400 mt-0.5">{formData.totalChannelsManaged}</div>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase">SUBSCRIBERS</span>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">{formData.subscriberCount.toLocaleString()}</div>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase">API TOKENS</span>
              <div className="text-sm font-bold font-mono text-purple-400 mt-0.5">{formData.apiTokensCount}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 font-mono"
            >
              <Save className="w-4 h-4" />
              <span>{showSavedToast ? 'Profile Saved!' : 'Save Broadcaster Profile'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
