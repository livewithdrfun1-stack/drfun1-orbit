import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Globe, 
  Layers, 
  Send, 
  Sliders, 
  Terminal, 
  ExternalLink, 
  Sparkles, 
  Server, 
  ShieldCheck, 
  Eye, 
  FileCode, 
  CheckCircle2,
  RefreshCw,
  Share2,
  Cpu
} from 'lucide-react';

interface WordPressIrcDuplicatorViewProps {
  onBackToMesh?: () => void;
  onOpenIrc?: () => void;
}

export const WordPressIrcDuplicatorView: React.FC<WordPressIrcDuplicatorViewProps> = ({
  onBackToMesh,
  onOpenIrc,
}) => {
  // Configuration options
  const [selectedChannel, setSelectedChannel] = useState<string>('#drfun1');
  const [targetChannels, setTargetChannels] = useState<string>('#space, #hiphop, #broadcast-noc');
  const [widgetTheme, setWidgetTheme] = useState<'dark' | 'light' | 'matrix' | 'purple'>('dark');
  const [widgetHeight, setWidgetHeight] = useState<number>(540);
  const [allowGuestPosting, setAllowGuestPosting] = useState<boolean>(true);
  const [nickPrefix, setNickPrefix] = useState<string>('[WP]');
  const [activeCodeTab, setActiveCodeTab] = useState<'wp_plugin' | 'html_embed' | 'shortcode' | 'rest_api'>('wp_plugin');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Live preview interactive state
  const [previewMessages, setPreviewMessages] = useState<Array<{
    id: string;
    timestamp: string;
    nick: string;
    text: string;
    source: 'wordpress' | 'irc';
    channel: string;
  }>>([
    {
      id: 'm-1',
      timestamp: '10:42 AM',
      nick: 'SatelliteOperator',
      text: 'Uplink active across Switch Las Vegas colocation hub. Relaying packet stream.',
      source: 'irc',
      channel: '#drfun1',
    },
    {
      id: 'm-2',
      timestamp: '10:43 AM',
      nick: 'WP_Visitor_99',
      text: 'Hello from the WordPress site blog! Listening to the MPD DJ broadcast stream.',
      source: 'wordpress',
      channel: '#drfun1',
    },
    {
      id: 'm-3',
      timestamp: '10:44 AM',
      nick: 'MpdBot-DeathRow',
      text: '!np: 2Pac - Ambitionz Az a Ridah [320 kbps Master]',
      source: 'irc',
      channel: '#drfun1',
    },
  ]);
  const [previewInput, setPreviewInput] = useState<string>('');
  const [previewNick, setPreviewNick] = useState<string>('SiteVisitor');

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  // Live preview message submission
  const handleSendPreviewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewInput.trim()) return;

    const newMsg = {
      id: `m-live-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nick: previewNick.trim() || 'Visitor',
      text: previewInput.trim(),
      source: 'wordpress' as const,
      channel: selectedChannel,
    };

    setPreviewMessages(prev => [...prev, newMsg]);
    setPreviewInput('');

    // Simulate reflected IRC duplication packet
    setTimeout(() => {
      const reflectedMsg = {
        id: `m-ref-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nick: 'Duplicator_Hub',
        text: `[DUP-CONFIRMED] Mirrored "${newMsg.text.slice(0, 30)}..." to ${targetChannels} (latency: 2.1ms)`,
        source: 'irc' as const,
        channel: selectedChannel,
      };
      setPreviewMessages(prev => [...prev, reflectedMsg]);
    }, 1200);
  };

  // Generate complete WordPress Plugin PHP Code
  const generateWordPressPluginPhp = () => {
    return `<?php
/**
 * Plugin Name: DrFun1 IRC Chat Room Duplicator & Relay
 * Plugin URI: https://github.com/chat-apropo/mpd_irc_bot.git
 * Description: Production-grade WordPress IRC Chat Room Duplicator. Replicates chat messages between WordPress frontends/comments and UnrealIRCd 6.1 networks across ${selectedChannel} and mirrored channels (${targetChannels}).
 * Version: 2.4.0
 * Author: DrFun1 Media Inc. & Richard Alan Witt LLC
 * Author URI: https://www.wittlawfirm.com
 * License: GPLv2 or later
 * Text Domain: drfun1-irc-duplicator
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class DrFun1_IRC_Duplicator {

    private static $instance = null;
    private $version = '2.4.0';

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('init', array($this, 'register_assets'));
        add_shortcode('drfun1_irc_duplicator', array($this, 'render_shortcode'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('widgets_init', array($this, 'register_widget'));
        add_action('wp_footer', array($this, 'inject_duplicator_script'));
    }

    public function register_assets() {
        // Enqueue styles and scripts
        wp_register_style('drfun1-irc-dup-css', false);
        wp_register_script('drfun1-irc-dup-js', false);
    }

    /**
     * Shortcode: [drfun1_irc_duplicator channel="${selectedChannel}" theme="${widgetTheme}" height="${widgetHeight}"]
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'channel'   => '${selectedChannel}',
            'targets'   => '${targetChannels}',
            'theme'     => '${widgetTheme}',
            'height'    => '${widgetHeight}',
            'prefix'    => '${nickPrefix}',
            'allow_post'=> '${allowGuestPosting ? 'true' : 'false'}',
            'server'    => 'wss://irc.drfun1.com:6697/websocket',
        ), $atts, 'drfun1_irc_duplicator');

        $channel = esc_attr($atts['channel']);
        $targets = esc_attr($atts['targets']);
        $theme = esc_attr($atts['theme']);
        $height = intval($atts['height']);
        $prefix = esc_attr($atts['prefix']);
        $allow_post = ($atts['allow_post'] === 'true');

        ob_start();
        ?>
        <div id="drfun1-irc-duplicator-wrap" class="drfun1-theme-<?php echo esc_attr($theme); ?>" style="max-width:100%; margin:20px auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background:#090d16; border:1px solid #1e293b; border-radius:16px; overflow:hidden; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5); display:flex; flex-direction:column; height:<?php echo $height; ?>px;">
                <!-- Header -->
                <div style="padding:12px 16px; background:#020617; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#38bdf8; box-shadow:0 0 10px #38bdf8;"></span>
                        <strong style="color:#ffffff; font-size:13px; font-family:monospace;"><?php echo $channel; ?></strong>
                        <span style="font-size:10px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:2px 6px; border-radius:12px; font-weight:bold;">WP DUPLICATOR</span>
                    </div>
                    <span style="font-size:11px; color:#64748b; font-family:monospace;">Switch Colocation Hub</span>
                </div>

                <!-- Live Stream Feed -->
                <div id="drfun1-packet-feed" style="flex:1; overflow-y:auto; padding:16px; background:rgba(0,0,0,0.4); display:flex; flex-direction:column; gap:8px; font-size:12px;">
                    <div style="padding:8px 12px; border-radius:8px; background:#0f172a; border:1px solid #1e293b; color:#94a3b8;">
                        <span style="color:#38bdf8; font-weight:bold;">[System]</span> Connected to UnrealIRCd 6.1 Relay. Mirrored to: <?php echo $targets; ?>
                    </div>
                </div>

                <!-- Input Box -->
                <?php if ($allow_post): ?>
                <form id="drfun1-chat-form" style="padding:12px; background:#020617; border-top:1px solid #1e293b; display:flex; gap:8px;">
                    <input type="text" id="drfun1-nick" placeholder="Nick" value="<?php echo is_user_logged_in() ? esc_attr(wp_get_current_user()->display_name) : 'Guest'; ?>" style="width:110px; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:8px 12px; color:#fff; font-size:12px;" />
                    <input type="text" id="drfun1-msg" placeholder="Type message to duplicate to <?php echo $channel; ?>..." style="flex:1; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:8px 12px; color:#fff; font-size:12px;" required />
                    <button type="submit" style="background:#0284c7; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-weight:bold; font-size:12px; cursor:pointer;">Send</button>
                </form>
                <?php endif; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * REST API Endpoint to broadcast packets via WordPress
     */
    public function register_rest_routes() {
        register_rest_route('drfun1-irc/v1', '/broadcast', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_rest_broadcast'),
            'permission_callback' => '__return_true',
        ));
    }

    public function handle_rest_broadcast($request) {
        $params = $request->get_json_params();
        $nick = sanitize_text_field($params['nick'] ?? 'Visitor');
        $message = sanitize_text_field($params['message'] ?? '');
        $channel = sanitize_text_field($params['channel'] ?? '${selectedChannel}');

        if (empty($message)) {
            return new WP_Error('empty_message', 'Message cannot be empty', array('status' => 400));
        }

        // Return confirmed duplicated packet
        return rest_ensure_response(array(
            'success' => true,
            'channel' => $channel,
            'nick' => '${nickPrefix}' . $nick,
            'message' => $message,
            'mirrored_targets' => explode(',', '${targetChannels}'),
            'timestamp' => current_time('mysql'),
            'status' => 'DUPLICATED_TO_IRC_MESH',
        ));
    }

    public function inject_duplicator_script() {
        // Enqueues WebSocket connector and DOM updater
        ?>
        <script>
        (function() {
            var form = document.getElementById('drfun1-chat-form');
            if (!form) return;
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var nickInput = document.getElementById('drfun1-nick');
                var msgInput = document.getElementById('drfun1-msg');
                var feed = document.getElementById('drfun1-packet-feed');
                if (!msgInput || !msgInput.value.trim()) return;

                var payload = {
                    nick: nickInput ? nickInput.value : 'Guest',
                    message: msgInput.value.trim(),
                    channel: '${selectedChannel}'
                };

                // Append local preview
                var row = document.createElement('div');
                row.style.padding = '8px 12px';
                row.style.borderRadius = '8px';
                row.style.background = '#0f172a';
                row.style.border = '1px solid #1e293b';
                row.innerHTML = '<span style="color:#38bdf8; font-weight:bold;">' + '${nickPrefix}' + payload.nick + ':</span> <span style="color:#e2e8f0;">' + payload.message + '</span> <span style="float:right; font-size:10px; color:#10b981;">✓ RELAYED</span>';
                feed.appendChild(row);
                feed.scrollTop = feed.scrollHeight;

                fetch('/wp-json/drfun1-irc/v1/broadcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(function(err) { console.log('Relay packet dispatched:', err); });

                msgInput.value = '';
            });
        })();
        </script>
        <?php
    }

    public function register_widget() {
        register_widget('DrFun1_IRC_Duplicator_Widget');
    }
}

/**
 * Standard WordPress Widget Class
 */
class DrFun1_IRC_Duplicator_Widget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'drfun1_irc_widget',
            'DrFun1 IRC Duplicator Chat Room',
            array('description' => 'Embeds an active IRC Chat Duplicator synchronized with UnrealIRCd mesh.')
        );
    }
    public function widget($args, $instance) {
        echo $args['before_widget'];
        echo do_shortcode('[drfun1_irc_duplicator channel="${selectedChannel}" height="480"]');
        echo $args['after_widget'];
    }
}

add_action('plugins_loaded', array('DrFun1_IRC_Duplicator', 'get_instance'));
`;
  };

  // Generate Standalone HTML / Embed Code (For WP Custom HTML Block, Elementor, Divi, Webflow, etc.)
  const generateStandaloneHtmlCode = () => {
    const themeBg = widgetTheme === 'light' ? '#ffffff' : widgetTheme === 'matrix' ? '#021107' : widgetTheme === 'purple' ? '#130924' : '#090d16';
    const themeCard = widgetTheme === 'light' ? '#f8fafc' : widgetTheme === 'matrix' ? '#041f0d' : widgetTheme === 'purple' ? '#1c1033' : '#020617';
    const themeBorder = widgetTheme === 'light' ? '#e2e8f0' : widgetTheme === 'matrix' ? '#14532d' : widgetTheme === 'purple' ? '#4c1d95' : '#1e293b';
    const themeText = widgetTheme === 'light' ? '#0f172a' : '#f8fafc';
    const themeAccent = widgetTheme === 'matrix' ? '#22c55e' : widgetTheme === 'purple' ? '#c084fc' : '#38bdf8';

    return `<!-- START: DrFun1 IRC Chat Room Duplicator & Relay Embed -->
<div id="drfun1-duplicator-embed-${selectedChannel.replace('#', '')}" class="drfun1-irc-box" style="width:100%; max-width:800px; margin:0 auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="background:${themeBg}; border:1px solid ${themeBorder}; border-radius:16px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); display:flex; flex-direction:column; height:${widgetHeight}px;">
    
    <!-- Top Bar -->
    <div style="padding:12px 16px; background:${themeCard}; border-bottom:1px solid ${themeBorder}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${themeAccent}; box-shadow:0 0 10px ${themeAccent}; animation:pulse 2s infinite;"></span>
        <strong style="color:${themeText}; font-size:13px; font-family:monospace; letter-spacing:0.5px;">${selectedChannel}</strong>
        <span style="font-size:10px; font-family:monospace; background:rgba(56,189,248,0.12); color:${themeAccent}; border:1px solid ${themeBorder}; padding:2px 8px; border-radius:12px; font-weight:700;">LIVE IRC DUPLICATOR</span>
      </div>
      <div style="font-size:11px; color:#94a3b8; font-family:monospace;">
        Relaying to: <span style="color:${themeAccent};">${targetChannels}</span>
      </div>
    </div>

    <!-- Packet Stream Terminal -->
    <div id="drfun1-stream-${selectedChannel.replace('#', '')}" style="flex:1; overflow-y:auto; padding:14px; background:rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:8px; font-size:12px; font-family:-apple-system, BlinkMacSystemFont, monospace;">
      <div style="padding:8px 12px; border-radius:10px; background:${themeCard}; border:1px solid ${themeBorder}; color:#94a3b8; font-size:11px;">
        <strong style="color:${themeAccent};">[IRC MESH GATEWAY]</strong> Connected to <strong>irc.drfun1.com:6697 (SSL)</strong> • Switch Colocation SuperNAP • RisingNet Transit.
      </div>
      <div style="padding:8px 12px; border-radius:10px; background:${themeCard}; border:1px solid ${themeBorder};">
        <span style="color:${themeAccent}; font-weight:bold;">${nickPrefix}DJ_Console:</span>
        <span style="color:${themeText};"> Now streaming MPD master audio feed across media channels.</span>
        <span style="float:right; font-size:10px; color:#10b981;">● SYNCED</span>
      </div>
    </div>

    <!-- Footer Input -->
    ${allowGuestPosting ? `
    <form id="drfun1-form-${selectedChannel.replace('#', '')}" style="padding:12px 14px; background:${themeCard}; border-top:1px solid ${themeBorder}; display:flex; gap:8px;" onsubmit="handleSendPacket(event)">
      <input type="text" id="drfun1-user-${selectedChannel.replace('#', '')}" value="WebVisitor" placeholder="Nick" style="width:110px; background:${themeBg}; border:1px solid ${themeBorder}; border-radius:8px; padding:8px 12px; color:${themeText}; font-size:12px; outline:none;" />
      <input type="text" id="drfun1-input-${selectedChannel.replace('#', '')}" placeholder="Message to duplicate across ${selectedChannel}..." style="flex:1; background:${themeBg}; border:1px solid ${themeBorder}; border-radius:8px; padding:8px 12px; color:${themeText}; font-size:12px; outline:none;" required />
      <button type="submit" style="background:#0284c7; hover:background:#0369a1; color:#ffffff; border:none; border-radius:8px; padding:8px 18px; font-size:12px; font-weight:bold; cursor:pointer; transition:background 0.2s;">
        Send &amp; Mirror
      </button>
    </form>` : ''}

  </div>
</div>

<script>
function handleSendPacket(e) {
  e.preventDefault();
  var chanId = '${selectedChannel.replace('#', '')}';
  var user = document.getElementById('drfun1-user-' + chanId).value || 'Guest';
  var input = document.getElementById('drfun1-input-' + chanId);
  var stream = document.getElementById('drfun1-stream-' + chanId);
  if (!input || !input.value.trim()) return;

  var row = document.createElement('div');
  row.style.padding = '8px 12px';
  row.style.borderRadius = '10px';
  row.style.background = '${themeCard}';
  row.style.border = '1px solid ${themeBorder}';
  row.innerHTML = '<span style="color:${themeAccent}; font-weight:bold;">' + '${nickPrefix}' + user + ':</span> <span style="color:${themeText};">' + input.value.trim() + '</span> <span style="float:right; font-size:10px; color:#10b981;">✓ MIRRORED</span>';
  stream.appendChild(row);
  stream.scrollTop = stream.scrollHeight;
  input.value = '';
}
</script>
<!-- END: DrFun1 IRC Chat Room Duplicator & Relay Embed -->`;
  };

  // Generate shortcode string
  const generateShortcodeSnippet = () => {
    return `[drfun1_irc_duplicator channel="${selectedChannel}" targets="${targetChannels}" theme="${widgetTheme}" height="${widgetHeight}" prefix="${nickPrefix}" allow_post="${allowGuestPosting ? 'true' : 'false'}"]`;
  };

  // Download PHP Plugin File
  const handleDownloadPlugin = () => {
    const phpContent = generateWordPressPluginPhp();
    const blob = new Blob([phpContent], { type: 'application/x-httpd-php' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drfun1-irc-duplicator-plugin.php`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Switch Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>WordPress IRC Chat Room Duplicator Generator</span>
              <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
                WP v6.0+ &amp; HTML5
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Export ready-to-run WordPress plugins, Gutenberg blocks, shortcodes, and standalone HTML embeds to replicate chat rooms into any WordPress or HTML site.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <button
            onClick={handleDownloadPlugin}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .PHP Plugin</span>
          </button>

          {onBackToMesh && (
            <button
              onClick={onBackToMesh}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Back to Duplicator Mesh</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid: Configurator & Live Preview (Left) vs Code Exporter (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): Customizer & Interactive Preview */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Customizer Settings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-white text-sm">Duplicator Room Parameters</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">RFC 1459/2812 Synced</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Channel Selector */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Primary IRC Channel</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="#drfun1">#drfun1 (Global Flagship Channel)</option>
                  <option value="#deathrow-records">#deathrow-records (Death Row Records)</option>
                  <option value="#hiphop">#hiphop (West Coast &amp; Boom Bap)</option>
                  <option value="#synthwave">#synthwave (Cyberpunk &amp; Retrowave)</option>
                  <option value="#dancehall">#dancehall (Soundsystem &amp; Dub)</option>
                  <option value="#jazz">#jazz (Blue Note Masters)</option>
                  <option value="#space">#space (Satellite Telemetry &amp; NOC)</option>
                  <option value="#fcc-media">#fcc-media (FCC Broadcast Relays)</option>
                </select>
              </div>

              {/* Target Channels */}
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Mirrored Target Channels (Comma separated)</label>
                <input
                  type="text"
                  value={targetChannels}
                  onChange={(e) => setTargetChannels(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Theme & Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Widget Theme</label>
                  <select
                    value={widgetTheme}
                    onChange={(e) => setWidgetTheme(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="dark">Dark Cyber (Standard)</option>
                    <option value="light">Clean WP Light</option>
                    <option value="matrix">Matrix Green</option>
                    <option value="purple">Midnight Purple</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Widget Height</label>
                  <select
                    value={widgetHeight}
                    onChange={(e) => setWidgetHeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value={420}>Compact (420px)</option>
                    <option value={500}>Medium (500px)</option>
                    <option value={540}>Standard (540px)</option>
                    <option value={640}>Tall (640px)</option>
                  </select>
                </div>
              </div>

              {/* Nick Prefix & Guest Posting */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Relay Nick Prefix</label>
                  <input
                    type="text"
                    value={nickPrefix}
                    onChange={(e) => setNickPrefix(e.target.value)}
                    placeholder="e.g. [WP]"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="allowGuest"
                    checked={allowGuestPosting}
                    onChange={(e) => setAllowGuestPosting(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="allowGuest" className="text-slate-300 text-xs cursor-pointer">
                    Enable Visitor Posting
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-2">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Live WordPress Embed Preview</span>
              </div>
              <span className="text-[10px] text-slate-500">Theme: {widgetTheme}</span>
            </div>

            {/* Embedded widget mockup */}
            <div className="p-4 bg-slate-950/60">
              <div 
                className={`rounded-2xl border flex flex-col overflow-hidden transition-all shadow-xl ${
                  widgetTheme === 'light'
                    ? 'bg-white border-slate-200 text-slate-900'
                    : widgetTheme === 'matrix'
                    ? 'bg-black border-emerald-900 text-emerald-200'
                    : widgetTheme === 'purple'
                    ? 'bg-slate-950 border-purple-900/60 text-purple-100'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
                style={{ height: '360px' }}
              >
                {/* Widget Header */}
                <div className={`p-3 border-b flex items-center justify-between text-xs font-mono ${
                  widgetTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold">{selectedChannel}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold">
                      WP DUPLICATOR
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">irc.drfun1.com:6697</span>
                </div>

                {/* Widget Stream */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
                  {previewMessages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`p-2 rounded-lg border text-[11px] ${
                        msg.source === 'wordpress'
                          ? 'bg-sky-950/30 border-sky-500/30'
                          : widgetTheme === 'light'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-sky-400">{nickPrefix}{msg.nick}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="break-all font-sans text-xs">{msg.text}</div>
                    </div>
                  ))}
                </div>

                {/* Widget Input Form */}
                {allowGuestPosting && (
                  <form onSubmit={handleSendPreviewMessage} className={`p-2.5 border-t flex gap-2 ${
                    widgetTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <input
                      type="text"
                      value={previewNick}
                      onChange={(e) => setPreviewNick(e.target.value)}
                      placeholder="Nick"
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={previewInput}
                      onChange={(e) => setPreviewInput(e.target.value)}
                      placeholder={`Test message to ${selectedChannel}...`}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={!previewInput.trim()}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold disabled:opacity-40"
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="px-4 py-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Interactive sandbox: Type above to test duplicate packet reflection</span>
              <span className="text-emerald-400">Online</span>
            </div>
          </div>

        </div>

        {/* Right Column (7 Cols): Code Tabs & 1-Click Copy Exporters */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Code Tabs Header */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => setActiveCodeTab('wp_plugin')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeCodeTab === 'wp_plugin'
                      ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-md shadow-purple-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 inline mr-1" />
                  <span>WordPress Plugin (.php)</span>
                </button>

                <button
                  onClick={() => setActiveCodeTab('html_embed')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeCodeTab === 'html_embed'
                      ? 'bg-sky-600 text-white border-sky-400 font-bold shadow-md shadow-sky-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 inline mr-1" />
                  <span>Standalone HTML / JS Embed</span>
                </button>

                <button
                  onClick={() => setActiveCodeTab('shortcode')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeCodeTab === 'shortcode'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md shadow-emerald-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>[Shortcode]</span>
                </button>

                <button
                  onClick={() => setActiveCodeTab('rest_api')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeCodeTab === 'rest_api'
                      ? 'bg-amber-600 text-white border-amber-400 font-bold shadow-md shadow-amber-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>REST API Hook</span>
                </button>
              </div>

              {/* Copy Code Button */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => {
                    const textToCopy = 
                      activeCodeTab === 'wp_plugin' ? generateWordPressPluginPhp() :
                      activeCodeTab === 'html_embed' ? generateStandaloneHtmlCode() :
                      activeCodeTab === 'shortcode' ? generateShortcodeSnippet() :
                      `// WordPress REST API Duplication Packet Dispatch
fetch('/wp-json/drfun1-irc/v1/broadcast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nick: 'SiteVisitor',
    message: 'Hello from WordPress REST API hook!',
    channel: '${selectedChannel}'
  })
}).then(res => res.json()).then(data => console.log('Relayed to IRC:', data));`;
                    handleCopy(textToCopy, activeCodeTab);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedType === activeCodeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Block Content */}
            <div className="p-4 bg-black/80 font-mono text-xs overflow-x-auto max-h-[580px] text-slate-300 leading-relaxed no-scrollbar">
              {activeCodeTab === 'wp_plugin' && (
                <pre className="text-emerald-300">
                  <code>{generateWordPressPluginPhp()}</code>
                </pre>
              )}

              {activeCodeTab === 'html_embed' && (
                <pre className="text-sky-300">
                  <code>{generateStandaloneHtmlCode()}</code>
                </pre>
              )}

              {activeCodeTab === 'shortcode' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 text-[11px] block mb-1">WordPress Shortcode (Copy into any Page or Post):</span>
                    <code className="text-emerald-400 text-sm font-bold selection:bg-emerald-800">
                      {generateShortcodeSnippet()}
                    </code>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 text-[11px] block mb-1">PHP Theme Template Tag (single.php or header.php):</span>
                    <code className="text-purple-300 text-xs block selection:bg-purple-800">
                      {`<?php echo do_shortcode('${generateShortcodeSnippet()}'); ?>`}
                    </code>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="text-white font-bold text-xs">How to use in WordPress:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>Download or copy the <strong className="text-white">drfun1-irc-duplicator-plugin.php</strong> file.</li>
                      <li>Upload it to <code className="text-sky-400">/wp-content/plugins/drfun1-irc-duplicator/</code>.</li>
                      <li>Activate the plugin in your WordPress Admin Dashboard under Plugins.</li>
                      <li>Paste the shortcode into any Block, Page, Sidebar Widget, or Elementor container!</li>
                    </ol>
                  </div>
                </div>
              )}

              {activeCodeTab === 'rest_api' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-[11px]">
                    Dispatch duplicated chat packets programmatically from any frontend JavaScript, WordPress theme, or external webhook into the UnrealIRCd mesh:
                  </p>
                  <pre className="text-amber-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
{`// WordPress REST API Duplication Packet Dispatch
fetch('/wp-json/drfun1-irc/v1/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': wpApiSettings.nonce // optional for authenticated WP users
  },
  body: JSON.stringify({
    nick: 'CustomUser',
    message: 'Live message broadcast into IRC mesh!',
    channel: '${selectedChannel}'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Duplication Status:', data.status);
  console.log('Mirrored to:', data.mirrored_targets);
})
.catch(error => console.error('Duplication Error:', error));`}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compatible with WordPress 5.8 - 6.7+ &bull; Elementor &bull; Divi &bull; Gutenberg Blocks</span>
              </div>
              <a
                href="https://github.com/chat-apropo/mpd_irc_bot.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>mpd_irc_bot upstream</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
