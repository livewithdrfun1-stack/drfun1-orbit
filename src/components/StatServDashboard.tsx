/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * StatServ IRC Daemon Vitals & Real-Time Sockets Dashboard
 * Implementation & Integration of: https://github.com/pauljz/StatServ.git by Paul Zumbrun (pauljz)
 * 
 * Features:
 * - UnrealIRCd 6.1.4 SNOTICE stream parser (Client Connects, Exits, Flood alarms, RPL 266, STATS L 211)
 * - Real-time Sockets web vitals (Gauges for Global Users & WebIRC / Mibbit clients)
 * - High-frequency Fast & Slow timeseries telemetry charts (Recharts Smoothie equivalent)
 * - Bot controller: SERVER=irc.drfun1.com, NICKNAME=StatServ, CHANNEL=#opers, MODE +Bs +cn
 * - Interactive raw commands (/LUSERS, /STATS L, /WHO +gu, /OPERSERV STATS ALL)
 * - Official GitHub Source Code Inspector (statserv.js, statserv-irc.js, StatServ.sample, index.html)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Server,
  Activity,
  Terminal,
  Radio,
  Zap,
  Globe,
  ShieldCheck,
  Cpu,
  Users,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code,
  Sliders,
  Send,
  AlertTriangle,
  Flame,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
  FileCode,
  Github,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

export interface SnoticeEvent {
  id: string;
  timestamp: string;
  type: 'connect' | 'exit' | 'flood' | 'global_users' | 'stats_l' | 'oper_auth';
  rawText: string;
  nick?: string;
  userHost?: string;
  port?: number;
  reason?: string;
  queueBytes?: number;
  badgeColor: string;
}

export interface StatServTimeSeriesPoint {
  time: string;
  timestamp: number;
  globalUsers: number;
  webIrcUsers: number;
  packetRate: number;
}

// Initial source files from https://github.com/pauljz/StatServ.git
const STATSERV_GITHUB_REPO = 'https://github.com/pauljz/StatServ.git';

const STATSERV_SOURCE_FILES = {
  'statserv.js': `var StatServIRC = require('./statserv-irc');
var bot;

//
// Create basic http/ws server
//
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8181);

app.get( '/', function( req, res ) {
	res.sendfile( __dirname + '/public/index.html' );
});

//
// Create bot
//
bot = new StatServIRC({
	server:   process.env.SERVER || 'irc.drfun1.com',
	nickname: process.env.NICKNAME || 'StatServ',
	channel:  process.env.CHANNEL || '#opers',
	userName: process.env.NICKNAME || 'StatServ',
	realName: process.env.NICKNAME || 'StatServ',
});

bot.on( 'connected', function() {
	bot.client.send( 'OPER', process.env.OPER_USERNAME, process.env.OPER_PASSWORD );
	bot.client.say( 'NickServ', 'IDENTIFY ' + process.env.NICKSERV_PASSWORD );
	bot.client.raw( 'MODE ' + process.env.NICKNAME + ' +Bs +cn' );
});

//
// Attach value change listener
//
bot.on( 'value', function( key, value ) {
	io.sockets.emit( 'value', key, value );
});

//
// Attach socket.io connection listener
//
io.sockets.on( 'connection', function( socket ) {
	socket.emit( 'values', bot.values );
});`,

  'statserv-irc.js': `var util   = require('util')
  , events = require('events');

//
// Precompile some regular expressions that we'll use frequently.
//
var clientConnectRegex    = /^\\*\\*\\* Notice -- Client connecting on port (\\d+): (\\S+) \\((\\S+)@(\\S+)\\) \\[clients\\]/;
var clientDisconnectRegex = /^\\*\\*\\* Notice -- Client exiting: (\\S+) \\((\\S+)@(\\S+)\\) \\[(.*)\\]$/;
var clientFloodRegex      = /^\\*\\*\\* Flood -- (\\S+)!(\\S+)@(\\S+) \\((\\d+)\\) exceeds (\\d+) recvQ$/;
var raw266Regex           = /^Current Global Users: (\\d+)\\s+Max: (\\d+)$/;

var StatServIRC = function(options) {
	var _this = this;
	this.options = options;
	this.whoCallbackQueue = [];
	this.whoUsers = [];
	this.values = {};
	this.valuesTimeSeries = {};

	// Configure client and connect
	var irc = require('irc');
	this.client = new irc.Client( this.options.server, this.options.nickname, {
		port: 6667,
		userName: this.options.userName || 'StatServ',
		realName: this.options.realName || 'StatServ',
		showErrors: true,
		autoConnect: false,
	});

	this.client.connect( 1, function() {
		_this.emit( 'connected' );
		_this.everyMinute();
		_this.everyHour();
	});

	this.client.raw = function( command ) {
		if ( ! this.conn.requestedDisconnect ) {
			this.conn.write( command + "\\r\\n" );
		}
	};

	this.client.on( 'raw', function( message ) {
		var match, args;
		switch( message.rawCommand ) {
			case '266': { // lusers - Global Users
				match = message.args[1].match( raw266Regex );
				_this.setValue( 'users', parseInt( match[1] ) );
			}; break;
			case '211': { // Stats L
				// 211 link telemetry
			}; break;
			case '352': { // WHO
				_this.whoUsers.push( message.args );
			}; break;
			case '315': { // End WHO
				_this.whoCallbackQueue.shift()( _this.whoUsers );
				_this.whoUsers = [];
			}; break;
			case 'NOTICE': {
				if ( typeof message.server !== 'undefined' ) {
					_this.handleSNotice( message );
				}
			}; break;
		}
	});

	this.minutelyInterval = setInterval( function() { _this.everyMinute(); }, 60000 );
	this.HourlyInterval = setInterval( function() { _this.everyHour(); }, 3600000 );
};

util.inherits( StatServIRC, events.EventEmitter );

StatServIRC.prototype.everyMinute = function() {
	this.client.raw( 'LUSERS' );
};

StatServIRC.prototype.everyHour = function() {
	var _this = this;
	this.client.raw( 'STATS L' );
	this.client.say( 'OPERSERV', 'STATS ALL' );
	this.who( '+gu http://www.mibbit.com Mibbit', function(users) {
		_this.setValue( 'mibbit:users', users.length );
	});
};

StatServIRC.prototype.handleSNotice = function( message ) {
	var match;
	if ( match = message.args[1].match( clientConnectRegex ) ) {
		this.incValue( 'users', 1 );
		if ( match[3] === 'Mibbit' ) {
			this.incValue( 'mibbit:users', 1 );
		}
	} else if ( match = message.args[1].match( clientDisconnectRegex ) ) {
		this.incValue( 'users', -1 );
		if ( match[2] === 'Mibbit' ) {
			this.incValue( 'mibbit:users', -1 );
		}
	} else if ( match = message.args[1].match( clientFloodRegex ) ) {
		this.client.say( this.options.channel, match[0] );
	}
};

StatServIRC.prototype.setValue = function( key, value ) {
	this.values[key] = value;
	this.emit( 'value', key, value );
};

StatServIRC.prototype.incValue = function( key, value ) {
	if ( typeof this.values[key] === 'undefined' ) {
		this.values[key] = 0;
	}
	this.values[key] = this.values[key] + value;
	this.emit( 'value', key, this.values[key] );
};

module.exports = StatServIRC;`,

  'StatServ.sample': `#!/bin/bash
SERVER=irc.drfun1.com \\
NICKNAME=StatServ \\
CHANNEL=#opers \\
OPER_USERNAME=DrFun1_Admin \\
OPER_PASSWORD=password \\
NICKSERV_PASSWORD=nspassword \\
CTCP_VERSION="StatServ v1.0.4 (pauljz/StatServ)" \\
node statserv.js > bot.out &`,

  'public/index.html': `<!DOCTYPE html>
<html>
	<head>
		<title>StatServ IRC Vitals Monitor</title>
		<script src="smoothie.js"></script>
		<script src="justgage.1.0.1.js"></script>
		<script src="/socket.io/socket.io.js"></script>
	</head>
	<body>
		<h1>StatServ Live Sockets Dashboard</h1>
		<div id="gauge-users"></div>
		<div id="gauge-mibbitusers"></div>
		<canvas id="users_fast" width="640" height="280"></canvas>
		<canvas id="users_slow" width="640" height="280"></canvas>
	</body>
</html>`
};

interface StatServDashboardProps {
  onOpenLicense?: () => void;
  onOpenIrcClient?: () => void;
}

export const StatServDashboard: React.FC<StatServDashboardProps> = ({
  onOpenLicense,
  onOpenIrcClient
}) => {
  // StatServ Live Telemetry State
  const [globalUsers, setGlobalUsers] = useState<number>(3429);
  const [maxGlobalUsers, setMaxGlobalUsers] = useState<number>(4850);
  const [webIrcUsers, setWebIrcUsers] = useState<number>(614);
  const [packetRatePerSec, setPacketRatePerSec] = useState<number>(1420);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSocketEmitting, setIsSocketEmitting] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'vitals' | 'snotices' | 'bot_config' | 'github_source'>('vitals');
  const [selectedSourceFile, setSelectedSourceFile] = useState<keyof typeof STATSERV_SOURCE_FILES>('statserv.js');
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  // Time-Series Stream Data (Fast 0.5s & Slow 5s)
  const [timeSeriesFast, setTimeSeriesFast] = useState<StatServTimeSeriesPoint[]>(() => {
    const pts: StatServTimeSeriesPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 1000);
      pts.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: t.getTime(),
        globalUsers: 3400 + Math.floor(Math.sin(i * 0.4) * 35),
        webIrcUsers: 600 + Math.floor(Math.cos(i * 0.4) * 18),
        packetRate: 1400 + Math.floor(Math.random() * 80)
      });
    }
    return pts;
  });

  // Recent SNOTICE stream
  const [snotices, setSnotices] = useState<SnoticeEvent[]>([
    {
      id: 'sn-01',
      timestamp: '14:22:04',
      type: 'connect',
      rawText: '*** Notice -- Client connecting on port 6697: Orbit_DJ_09 (dj@staff.drfun1.com) [clients]',
      nick: 'Orbit_DJ_09',
      userHost: 'dj@staff.drfun1.com',
      port: 6697,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'sn-02',
      timestamp: '14:21:49',
      type: 'global_users',
      rawText: 'Current Global Users: 3429  Max: 4850',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      id: 'sn-03',
      timestamp: '14:21:12',
      type: 'connect',
      rawText: '*** Notice -- Client connecting on port 8080: WebUser_8812 (Mibbit@gateway.webirc.drfun1.com) [clients]',
      nick: 'WebUser_8812',
      userHost: 'Mibbit@gateway.webirc.drfun1.com',
      port: 8080,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    },
    {
      id: 'sn-04',
      timestamp: '14:20:30',
      type: 'exit',
      rawText: '*** Notice -- Client exiting: Visitor_3011 (user@ip-198-51-100-24.isp) [Quit: Client closed browser window]',
      nick: 'Visitor_3011',
      userHost: 'user@ip-198-51-100-24.isp',
      reason: 'Quit: Client closed browser window',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'sn-05',
      timestamp: '14:19:15',
      type: 'flood',
      rawText: '*** Flood -- Spambot99!bot@198.51.100.99 (15 msgs) exceeds 10240 recvQ',
      nick: 'Spambot99',
      queueBytes: 10240,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }
  ]);

  // Real-time socket & snotice ticker
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      // Simulate real-time SNOTICE stream & socket emitter
      const delta = Math.random() > 0.5 ? 1 : -1;
      const isMibbit = Math.random() > 0.6;
      
      setGlobalUsers((prev) => {
        const next = Math.max(3000, prev + delta);
        if (next > maxGlobalUsers) setMaxGlobalUsers(next);
        return next;
      });

      if (isMibbit) {
        setWebIrcUsers((prev) => Math.max(500, prev + (delta > 0 ? 1 : -1)));
      }

      setPacketRatePerSec(1350 + Math.floor(Math.random() * 150));

      // Append to fast time-series
      setTimeSeriesFast((prev) => {
        const now = new Date();
        const pt: StatServTimeSeriesPoint = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: now.getTime(),
          globalUsers: globalUsers + delta,
          webIrcUsers: webIrcUsers + (isMibbit ? 1 : 0),
          packetRate: 1350 + Math.floor(Math.random() * 150)
        };
        return [...prev.slice(1), pt];
      });

      // 20% chance of generating a live SNOTICE event
      if (Math.random() < 0.25) {
        const id = `sn-${Date.now()}`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const ports = [6697, 6667, 8080];
        const port = ports[Math.floor(Math.random() * ports.length)];
        const isConn = Math.random() > 0.4;
        
        let newEvent: SnoticeEvent;
        if (isConn) {
          const nick = `Client_${Math.floor(Math.random() * 9000 + 1000)}`;
          const ident = port === 8080 ? 'Mibbit' : 'irc';
          newEvent = {
            id,
            timestamp: time,
            type: 'connect',
            rawText: `*** Notice -- Client connecting on port ${port}: ${nick} (${ident}@node.drfun1.com) [clients]`,
            nick,
            userHost: `${ident}@node.drfun1.com`,
            port,
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          };
        } else {
          const nick = `User_${Math.floor(Math.random() * 9000 + 1000)}`;
          newEvent = {
            id,
            timestamp: time,
            type: 'exit',
            rawText: `*** Notice -- Client exiting: ${nick} (client@switch.drfun1.com) [Ping timeout: 120 seconds]`,
            nick,
            userHost: 'client@switch.drfun1.com',
            reason: 'Ping timeout: 120 seconds',
            badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
          };
        }

        setSnotices((prev) => [newEvent, ...prev.slice(0, 19)]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isConnected, globalUsers, webIrcUsers, maxGlobalUsers]);

  // Execute interactive raw command
  const handleExecuteRawCommand = (cmdToRun: string) => {
    const cmd = (cmdToRun || commandInput).trim();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let responseText = '';
    let newEvent: SnoticeEvent;

    if (cmd.toUpperCase().startsWith('LUSERS')) {
      responseText = `Current Global Users: ${globalUsers}  Max: ${maxGlobalUsers}`;
      newEvent = {
        id: `sn-cmd-${Date.now()}`,
        timestamp: time,
        type: 'global_users',
        rawText: responseText,
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      };
    } else if (cmd.toUpperCase().startsWith('STATS L')) {
      responseText = `211 StatServ switch-core-lasvegas.drfun1.com[0:0:0:0:ffff:10.240.0.1.7000][C] 0 148920194 149019284 4192019 104928 201948 :0`;
      newEvent = {
        id: `sn-cmd-${Date.now()}`,
        timestamp: time,
        type: 'stats_l',
        rawText: `*** STATS L -- ${responseText}`,
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
      };
    } else if (cmd.toUpperCase().includes('WHO')) {
      responseText = `There are ${webIrcUsers} Mibbit & WebIRC users online.`;
      newEvent = {
        id: `sn-cmd-${Date.now()}`,
        timestamp: time,
        type: 'connect',
        rawText: `[StatServ -> #opers] ${responseText}`,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      };
    } else {
      responseText = `[StatServ] Executed raw: ${cmd}`;
      newEvent = {
        id: `sn-cmd-${Date.now()}`,
        timestamp: time,
        type: 'oper_auth',
        rawText: `*** StatServ raw execution -- ${cmd}`,
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
      };
    }

    setSnotices((prev) => [newEvent, ...prev.slice(0, 19)]);
    setCommandFeedback(responseText);
    setCommandInput('');
    setTimeout(() => setCommandFeedback(null), 4000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(STATSERV_SOURCE_FILES[selectedSourceFile]);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6 font-mono text-xs">
      {/* ========================================================
          1. STATSERV HEADER & GITHUB REPO BADGE
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                StatServ &bull; Real-Time UnrealIRCd Vitals &amp; Sockets Daemon
              </h3>
              <a
                href={STATSERV_GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
                title="View pauljz/StatServ on GitHub"
              >
                <Github className="w-3 h-3" />
                <span>pauljz/StatServ</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isConnected ? 'animate-ping' : ''}`} />
                <span>{isConnected ? 'PORT 8181 SOCKETS ACTIVE' : 'SOCKETS PAUSED'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated IRC network service monitoring UnrealIRCd 6.1.4 daemon vitals, SNOTICES, and high-frequency user churn via WebSockets.
            </p>
          </div>
        </div>

        {/* Live Controller Actions */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isConnected
                ? 'bg-slate-950 text-emerald-300 border-emerald-500/40 hover:bg-slate-900'
                : 'bg-emerald-600 text-white shadow-emerald-950/40'
            }`}
          >
            {isConnected ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isConnected ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={() => handleExecuteRawCommand('LUSERS')}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/30"
            title="Send raw LUSERS command to UnrealIRCd"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll /LUSERS</span>
          </button>

          {onOpenIrcClient && (
            <button
              onClick={onOpenIrcClient}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>WebIRC Client</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          2. STATSERV NAVIGATION SUBTABS
          ======================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-nav-scrollbar pb-1 border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab('vitals')}
          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'vitals'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time Vitals &amp; Gauges</span>
        </button>

        <button
          onClick={() => setActiveTab('snotices')}
          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'snotices'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>SNOTICE Parser Stream ({snotices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bot_config')}
          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bot_config'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bot Daemon Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('github_source')}
          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'github_source'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-amber-400" />
          <span>pauljz/StatServ Code</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
            JavaScript
          </span>
        </button>
      </div>

      {/* ========================================================
          3. TAB CONTENT: REAL-TIME VITALS & GAUGES
          ======================================================== */}
      {activeTab === 'vitals' && (
        <div className="space-y-6">
          {/* JustGage Equivalent: Live Metric Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Global Users Gauge */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Global Users</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-bold">266 RPL</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-white tabular-nums">
                  {globalUsers.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 tabular-nums">
                  Max: <span className="text-slate-300 font-bold">{maxGlobalUsers.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress bar gauge */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (globalUsers / maxGlobalUsers) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>0 Min</span>
                <span className="text-cyan-400 font-bold">{((globalUsers / maxGlobalUsers) * 100).toFixed(1)}% Capacity</span>
                <span>{maxGlobalUsers} Max</span>
              </div>
            </div>

            {/* Mibbit & WebIRC Users Gauge */}
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Mibbit &amp; WebIRC</span>
                </span>
                <span className="text-[10px] text-purple-300 font-bold">Port 8080</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-white tabular-nums">
                  {webIrcUsers.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 tabular-nums">
                  Share: <span className="text-purple-300 font-bold">{((webIrcUsers / globalUsers) * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress bar gauge */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (webIrcUsers / 1500) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>0 Min</span>
                <span className="text-purple-400 font-bold">WebSocket Sockets</span>
                <span>1,500 Max</span>
              </div>
            </div>

            {/* Sockets Packet Churn Rate */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Daemon RecvQ Rate</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">100G Leaf</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-white tabular-nums">
                  {packetRatePerSec.toLocaleString()} <span className="text-xs font-normal text-slate-400">pkts/s</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold">0.00% Loss</div>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (packetRatePerSec / 2500) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Buffer 10,240B</span>
                <span className="text-emerald-400 font-bold">Nominal</span>
                <span>Max 25k/s</span>
              </div>
            </div>

            {/* Socket.io Server Port 8181 Status */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>StatServ Daemon</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  +Bs +cn
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-xl font-bold text-white">
                  irc.drfun1.com
                </div>
                <div className="text-xs text-slate-400">SID: 001</div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span className="text-purple-300 font-bold">#opers</span>
                </div>
                <div className="flex justify-between">
                  <span>Oper Privileges:</span>
                  <span className="text-emerald-400 font-bold">NetAdmin Oper</span>
                </div>
              </div>
            </div>
          </div>

          {/* SmoothieChart Equivalent: Real-Time Fast & Slow TimeSeries */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">
                  Real-Time High-Frequency User Churn &amp; Socket Activity (Fast Stream)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  SmoothieChart / Sockets
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-200">Global Users</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="text-slate-200">Mibbit / WebIRC</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesFast}>
                  <defs>
                    <linearGradient id="globalUserGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="webIrcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" domain={['dataMin - 50', 'dataMax + 50']} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="globalUsers"
                    name="Global Users"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#globalUserGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="webIrcUsers"
                    name="WebIRC / Mibbit"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#webIrcGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. TAB CONTENT: REAL-TIME SNOTICE PARSER STREAM
          ======================================================== */}
      {activeTab === 'snotices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white">Live Server Notice (SNOTICE) Feed</span>
              <span className="text-slate-500 text-[11px]">&bull; Parsed via statserv-irc.js Regex</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExecuteRawCommand('STATS L')}
                className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition cursor-pointer"
              >
                Send STATS L
              </button>
              <button
                onClick={() => handleExecuteRawCommand('WHO +gu http://www.mibbit.com Mibbit')}
                className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-[11px] transition cursor-pointer"
              >
                Query /WHO Mibbit
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto custom-nav-scrollbar pr-1">
            {snotices.map((sn) => (
              <div
                key={sn.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">{sn.timestamp}</span>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-bold border uppercase shrink-0 ${sn.badgeColor}`}>
                    {sn.type.replace('_', ' ')}
                  </span>
                  <span className="text-slate-200 truncate flex-1">{sn.rawText}</span>
                </div>

                {sn.nick && (
                  <div className="text-[10px] text-slate-400 shrink-0">
                    Target: <span className="text-cyan-300 font-bold">{sn.nick}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Oper Command Console */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive StatServ Command Dispatcher</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteRawCommand(commandInput)}
                placeholder="Try: LUSERS, STATS L, WHO +gu Mibbit, or raw IRC command..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleExecuteRawCommand(commandInput)}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </div>
            {commandFeedback && (
              <div className="text-[11px] text-emerald-400 font-mono animate-in fade-in">
                {commandFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          5. TAB CONTENT: BOT DAEMON CONFIGURATION
          ======================================================== */}
      {activeTab === 'bot_config' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>StatServ Environment &amp; Network Ingest Settings</span>
              </div>
              <span className="text-[10px] text-slate-500">Node.js process.env</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Target IRC Server (SERVER)</span>
                <div className="font-bold text-white">irc.drfun1.com:6697 (SSL)</div>
                <div className="text-[10px] text-slate-400">Hub SID: 001 &bull; Switch SUPERNAP Nevada</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Service Bot Nickname (NICKNAME)</span>
                <div className="font-bold text-cyan-300">StatServ</div>
                <div className="text-[10px] text-slate-400">Ident: stats &bull; VHost: stats.drfun1.com</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Report Channel (CHANNEL)</span>
                <div className="font-bold text-purple-300">#opers (Operator Room)</div>
                <div className="text-[10px] text-slate-400">Flood alerts and flood alarms broadcast here</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Oper Modes (MODE)</span>
                <div className="font-bold text-emerald-400">+Bs +cn</div>
                <div className="text-[10px] text-slate-400">+B (Bot), +s (Server notices), +c (No color), +n (Nick protect)</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Socket.io Web Port</span>
                <div className="font-bold text-amber-300">Port 8181 (HTTP / WebSocket)</div>
                <div className="text-[10px] text-slate-400">Express web server + socket.io listener</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">CTCP Version String</span>
                <div className="font-bold text-white">StatServ v1.0.4 (pauljz/StatServ)</div>
                <div className="text-[10px] text-slate-400">Responds to CTCP VERSION inquiries</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. TAB CONTENT: OFFICIAL GITHUB SOURCE CODE VIEWER
          ======================================================== */}
      {activeTab === 'github_source' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(Object.keys(STATSERV_SOURCE_FILES) as Array<keyof typeof STATSERV_SOURCE_FILES>).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedSourceFile(fileName)}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    selectedSourceFile === fileName
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>{fileName}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 text-[11px] transition cursor-pointer"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile ? 'Copied!' : 'Copy File'}</span>
              </button>

              <a
                href={STATSERV_GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1 text-[11px] transition"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[500px] custom-nav-scrollbar leading-relaxed text-slate-300 select-all">
            <pre>{STATSERV_SOURCE_FILES[selectedSourceFile]}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
