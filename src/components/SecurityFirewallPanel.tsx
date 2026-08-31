import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  EyeOff, 
  Terminal, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  Key, 
  Cpu, 
  Database,
  Activity,
  Trash2
} from 'lucide-react';
import { getSecurityLogs, SecurityEvent } from '../utils/securityFirewall';

interface FirewallRule {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'SHIELDED';
  desc: string;
  details: string;
}

export const SecurityFirewallPanel: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [localLogs, setLocalLogs] = useState<SecurityEvent[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'layers' | 'logs'>('overview');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/firewall/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (err) {
      console.warn('Không thể kết nối API Firewall trực tiếp:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    setLocalLogs(getSecurityLogs());

    const handleNewEvent = (e: any) => {
      if (e.detail) {
        setLocalLogs(prev => [e.detail, ...prev].slice(0, 50));
      }
    };

    window.addEventListener('thpt_security_event_logged', handleNewEvent);
    return () => window.removeEventListener('thpt_security_event_logged', handleNewEvent);
  }, []);

  const clearLocalLogs = () => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ nhớ nhật ký an ninh trên thiết bị này?')) {
      localStorage.removeItem('thpt_bachuc_security_events_log');
      setLocalLogs([]);
    }
  };

  const firewallLayers: FirewallRule[] = [
    {
      id: 'L1',
      name: 'Ẩn & Che Giấu Mã Nguồn (Source Cloaking)',
      category: 'Client & Bundler Shield',
      status: 'SHIELDED',
      desc: 'Loại bỏ hoàn toàn Source Maps (.map), che giấu cấu trúc thư mục và mã TypeScript gốc.',
      details: 'Khi kẻ xấu mở mạng hoặc công cụ tải trang, toàn bộ mã nguồn React được nén minify và rút gọn, không thể dịch ngược về file gốc /src/.'
    },
    {
      id: 'L2',
      name: 'Chống Mở DevTools & Phím Tắt Soi Code',
      category: 'Browser Defense',
      status: 'ACTIVE',
      desc: 'Chặn các tổ hợp phím F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S.',
      details: 'Tự động vô hiệu hóa menu chuột phải xem mã nguồn (View Source). Kèm thông báo cảnh báo HUD bảo mật trường học khi bấm phím cấm.'
    },
    {
      id: 'L3',
      name: 'Tường Lửa Web Application Firewall (WAF)',
      category: 'Server Layer 7',
      status: 'ACTIVE',
      desc: 'Nhận diện và chặn công cụ quét hacker tự động (sqlmap, nikto, acunetix, dirbuster...).',
      details: 'Phân tích chuỗi URL và nội dung gửi lên, chặn đứng các kiểu tấn công SQL Injection, XSS, Path Traversal (../), Script Tag.'
    },
    {
      id: 'L4',
      name: 'Tường Lửa Chống Dò Mật Khẩu (Anti-Brute Force)',
      category: 'Authentication Shield',
      status: 'ACTIVE',
      desc: 'Giới hạn 5 lần thử đăng nhập. Tự động cách ly và khóa IP 5-15 phút khi vi phạm.',
      details: 'Kiểm soát đa lớp trên cả Client (Session/LocalStorage) và Máy chủ Server (IP Reputation Store). Hacker xóa cookie vẫn bị máy chủ chặn!'
    },
    {
      id: 'L5',
      name: 'Phân Quyền Đám Mây Firebase (RBAC Firestore)',
      category: 'Database Protection',
      status: 'SHIELDED',
      desc: 'Quy tắc an ninh Firestore Rules được triển khai lên máy chủ Google Cloud.',
      details: 'Chặn đứng mọi hành vi can thiệp sửa đổi trực tiếp cơ sở dữ liệu từ bên ngoài mà không có chữ ký xác thực quản trị viên hợp lệ.'
    },
    {
      id: 'L6',
      name: 'Ẩn Danh Máy Chủ & Bộ Headers Bảo Vệ Cao Cấp',
      category: 'Infrastructure Shield',
      status: 'ACTIVE',
      desc: 'Xóa bỏ nhãn công nghệ X-Powered-By, kích hoạt HSTS, X-Frame-Options, Nosniff, Referrer-Policy.',
      details: 'Ngăn chặn hacker dò quét phiên bản máy chủ, chống tấn công Clickjacking và giả mạo MIME Type qua trình duyệt.'
    }
  ];

  const totalThreats = (serverStatus?.totalBlocked || 0) + localLogs.length;

  return (
    <div className="space-y-6">
      {/* Top Banner Tường Lửa */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-500/20 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>TƯỜNG LỬA ĐANG HOẠT ĐỘNG & BẢO VỆ TOÀN DIỆN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
              <span>BỨC TƯỜNG LỬA AN NINH MẠNG & ẨN MÃ NGUỒN</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Hệ thống phòng vệ đa tầng bảo vệ Cổng Thông Tin Tư Vấn Học Đường THPT Ba Chúc trước các cuộc tấn công dò mật khẩu (Brute-force), công cụ soi mã nguồn (Inspect DevTools), rà quét lỗ hổng và truy cập trái phép.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-rose-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Đang kiểm tra...' : 'KIỂM TRA TƯỜNG LỬA'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng Thái WAF</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>BẢO VỆ 24/7</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Hoạt động thời gian thực</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mã Nguồn (Code)</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1 flex items-center gap-1.5">
              <EyeOff className="w-5 h-5 text-indigo-400" />
              <span>ĐÃ ẨN 100%</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Vô hiệu hóa Source Maps</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mối Đe Dọa Đã Chặn</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1 flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>{totalThreats}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Lần thử xâm nhập bị đẩy lùi</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">IP Đang Bị Cách Ly</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>{serverStatus?.quarantinedCount || 0}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Đưa vào danh sách hạn chế</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-400" />
          <span>Tổng Quan Phòng Thủ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('layers')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'layers'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>6 Lớp Bức Tường Lửa ({firewallLayers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'logs'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Nhật Ký Chặn Hacker ({localLogs.length + (serverStatus?.recentAuditLogs?.length || 0)})</span>
        </button>
      </div>

      {/* SUBTAB 1: TỔNG QUAN PHÒNG THỦ */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Tóm tắt trạng thái */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>CHÍNH SÁCH BẢO VỆ MÃ CODE & AN TOÀN TRƯỜNG HỌC</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhằm bảo vệ hệ thống trước các đối tượng xấu hoặc hacker tìm cách can thiệp, đọc trộm dữ liệu học sinh hoặc tấn công mã nguồn, Trường THPT Ba Chúc đã thiết lập cơ chế bảo mật cấp chuyên sâu:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Ẩn Mã Nguồn Triệt Để</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Không tạo file .map, loại bỏ chú thích code, không để lộ đường dẫn file nội bộ.</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Khóa Hacker Brute-Force</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Tự động tạm khóa truy cập 5 phút nếu nhập sai quá 5 lần liên tiếp.</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Chống Soi DevTools (F12)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Vô hiệu hóa phím tắt mở công cụ phát triển và chuột phải kiểm tra mã.</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Bảo Mật RBAC Firestore</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Chặn hoàn toàn hành vi ghi dữ liệu trực tiếp không thông qua xác thực quản trị.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quy tắc WAF máy chủ */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <span>QUY TẮC BẢO VỆ MÁY CHỦ THỜI GIAN THỰC (SERVER WAF RULES)</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {(serverStatus?.rules || firewallLayers).map((rule: any, idx: number) => (
                  <div key={rule.id || idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{rule.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {rule.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{rule.desc || rule.description}</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải: Hướng dẫn & Kiểm tra an ninh */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Thử Nghiệm Phòng Thủ</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn có thể thử bấm <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-rose-400 font-mono text-[11px]">F12</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-rose-400 font-mono text-[11px]">Ctrl + U</kbd> ngay trên trang này để kiểm chứng Tường lửa tự động chặn và hiện thông báo bảo mật an toàn.
              </p>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-slate-300 font-bold">Thử nghiệm bảo vệ đã tích hợp:</div>
                <div>• Chặn xem mã nguồn qua chuột phải</div>
                <div>• Chặn mở Console trình duyệt</div>
                <div>• Banner cảnh báo Anti-Self-XSS</div>
                <div>• Giới hạn 5 lần sai mật khẩu trên máy chủ</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
                Thông Tin Kỹ Thuật Bảo Mật
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Giao thức:</span>
                  <span className="font-bold text-slate-800">TLS 1.3 / HTTPS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mã hóa mật khẩu:</span>
                  <span className="font-bold text-slate-800">PBKDF2 & SHA-256</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Quản lý phiên:</span>
                  <span className="font-bold text-slate-800">Cơ chế Session Isolation</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Thời gian khóa IP:</span>
                  <span className="font-bold text-rose-600">300 - 900 giây</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Hệ quản trị CSDL:</span>
                  <span className="font-bold text-emerald-600">Google Firestore RBAC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: 6 LỚP BỨC TƯỜNG LỬA CHI TIẾT */}
      {activeSubTab === 'layers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firewallLayers.map((layer, index) => (
            <div 
              key={layer.id} 
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                    {layer.id}: {layer.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {layer.status}
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 leading-snug">
                  {layer.name}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {layer.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 italic leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {layer.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: NHẬT KÝ SỰ KIỆN AN NINH */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-500" />
                <span>NHẬT KÝ TƯỜNG LỬA CHẶN HÀNH VI ĐỘC HẠI</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận các lần cố tình bấm phím xem mã nguồn, tiêm chuỗi bất thường hoặc nhập sai mật khẩu đăng nhập.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearLocalLogs}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Nhật Ký Thiết Bị</span>
              </button>
            </div>
          </div>

          {/* Danh sách log */}
          {localLogs.length === 0 && (!serverStatus?.recentAuditLogs || serverStatus.recentAuditLogs.length === 0) ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                Chưa phát hiện hành vi xâm nhập hoặc cố gắng xem mã nào!
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Bức tường lửa đang giám sát liên tục. Nếu có bất kỳ đối tượng nào bấm F12, Ctrl+U hoặc thử dò mật khẩu, sự kiện sẽ được lập tức ghi nhận tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {/* Server Audit Logs */}
              {serverStatus?.recentAuditLogs?.map((log: any) => (
                <div 
                  key={log.id} 
                  className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-200 text-rose-900 uppercase">
                        MÁY CHỦ CHẶN: {log.type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">
                        IP: {log.ip}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">{log.reason}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Đường dẫn: {log.path}</div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}

              {/* Local Security Events */}
              {localLogs.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        item.severity === 'high' ? 'bg-rose-100 text-rose-800' :
                        item.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
