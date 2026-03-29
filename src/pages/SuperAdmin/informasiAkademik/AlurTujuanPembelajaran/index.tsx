import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircleIcon, XCircleIcon, RotateCcwIcon, SearchIcon, Loader2Icon, ChevronDownIcon, ChevronRightIcon, BookOpenIcon, UserIcon, CalendarIcon, Clock, CheckCircle } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface HistoriAtp {
  atp_id: number;
  atp_master_id: number;
  tujuan_pembelajaran: string;
  urutan: number;
  approval_status: string;
  approved_by: number | null;
  approved_at: string | null;
  catatan_penolakan: string | null;
  is_locked: boolean;
}

interface GuruItem {
  guru_id: number;
  nama_guru: string;
  histori_atp: HistoriAtp[];
}

interface SemesterItem {
  semester_id: number;
  semester: string;
  status_semester: string;
  guru: GuruItem[];
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  semesters: SemesterItem[];
}

interface AtpKompetensi {
  kompetensi_id: number;
  mata_pelajaran: string;
  judul_kompetensi: string;
  jenis_kompetensi: string;
  fase: string | null;
  status_kompetensi: string;
  periode: PeriodeItem[];
}

type TabType = "diajukan" | "disetujui";

// ── Badge helpers ─────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  diajukan: "bg-yellow-100 text-yellow-700",
  disetujui: "bg-green-100 text-green-700",
  ditolak: "bg-red-100 text-red-700",
};

// ── Component ─────────────────────────────────────────────────────────────────
const AlurTujuanPembelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("diajukan");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AtpKompetensi[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAksi, setLoadingAksi] = useState(false);

  // Accordion: key = string unik per level
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Modal tolak
  const [modalTolak, setModalTolak] = useState<{ open: boolean; atpId: number | null }>({
    open: false,
    atpId: null,
  });
  const [catatanPenolakan, setCatatanPenolakan] = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async (tab: TabType) => {
    try {
      setLoading(true);
      setData([]);
      setExpandedKeys(new Set());

      const endpoint = tab === "diajukan" ? "/spa/atp" : "/spa/atp-disetujui";
      const res = await api.get(endpoint);

      if (res.data.status === "success") {
        const list: AtpKompetensi[] = res.data.data;
        setData(list);

        // Auto-expand kompetensi pertama
        if (list.length > 0) {
          const first = list[0];
          const kompKey = `komp-${first.kompetensi_id}`;
          setExpandedKeys(new Set([kompKey]));
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: err.response?.data?.message || "Tidak dapat memuat data ATP.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  // ── Accordion toggle ──────────────────────────────────────────────────────
  const toggleKey = (key: string) =>
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter(
      (k) => k.mata_pelajaran.toLowerCase().includes(lower) || k.judul_kompetensi.toLowerCase().includes(lower) || k.periode.some((p) => p.semesters.some((s) => s.guru.some((g) => g.nama_guru.toLowerCase().includes(lower)))),
    );
  }, [data, searchTerm]);

  // ── Statistik ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalAtp = 0;
    let totalGuru = new Set<number>();
    data.forEach((k) =>
      k.periode.forEach((p) =>
        p.semesters.forEach((s) =>
          s.guru.forEach((g) => {
            totalGuru.add(g.guru_id);
            totalAtp += g.histori_atp.length;
          }),
        ),
      ),
    );
    return { totalKompetensi: data.length, totalAtp, totalGuru: totalGuru.size };
  }, [data]);

  // ── AKSI: Setujui ─────────────────────────────────────────────────────────
  const handleSetujui = async (atpId: number) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Setujui ATP ini?",
      text: "ATP akan dikunci setelah disetujui dan tidak bisa diubah oleh guru.",
      showCancelButton: true,
      confirmButtonText: "Ya, Setujui",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4f46e5",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoadingAksi(true);
      const res = await api.put(`/spa/atp-disetujui/${atpId}`);
      if (res.data.status === "success") {
        Swal.fire({ icon: "success", title: "ATP disetujui!", timer: 1500, showConfirmButton: false });
        fetchData(activeTab);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyetujui!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoadingAksi(false);
    }
  };

  // ── AKSI: Tolak ───────────────────────────────────────────────────────────
  const openModalTolak = (atpId: number) => {
    setCatatanPenolakan("");
    setModalTolak({ open: true, atpId });
  };

  const handleTolak = async () => {
    if (!modalTolak.atpId) return;
    try {
      setLoadingAksi(true);
      const res = await api.put(`/spa/atp-ditolak/${modalTolak.atpId}`, {
        catatan_penolakan: catatanPenolakan || null,
      });
      if (res.data.status === "success") {
        setModalTolak({ open: false, atpId: null });
        Swal.fire({
          icon: "success",
          title: "ATP ditolak!",
          text: "Guru akan melakukan revisi.",
          timer: 1800,
          showConfirmButton: false,
        });
        fetchData(activeTab);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menolak!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoadingAksi(false);
    }
  };

  // ── AKSI: Batal Disetujui ────────────────────────────────────────────────
  const handleBatalDisetujui = async (atpId: number) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Batalkan persetujuan?",
      text: "Status ATP akan dikembalikan ke 'Diajukan' dan kunci akan dibuka.",
      showCancelButton: true,
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#f59e0b",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoadingAksi(true);
      const res = await api.put(`/spa/atp-batal-disetujui/${atpId}`);
      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Persetujuan dibatalkan!",
          text: "ATP dikembalikan ke status diajukan.",
          timer: 1800,
          showConfirmButton: false,
        });
        fetchData(activeTab);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal membatalkan!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoadingAksi(false);
    }
  };

  // ── Render tabel histori ATP per guru ─────────────────────────────────────
  const renderHistoriAtp = (histori: HistoriAtp[], tab: TabType) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-10">No</th>
            <th className="py-2.5 px-3 font-semibold text-gray-600 text-left">Tujuan Pembelajaran</th>
            <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-20">Urutan</th>
            <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-28">Status</th>
            {tab === "disetujui" && <th className="py-2.5 px-3 font-semibold text-gray-600 w-40">Disetujui Pada</th>}
            <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-44">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {histori.map((atp, idx) => (
            <tr key={atp.atp_id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
              <td className="text-center py-3 px-3 text-gray-400 text-xs">{idx + 1}</td>
              <td className="py-3 px-3 text-gray-800 leading-relaxed">{atp.tujuan_pembelajaran}</td>
              <td className="text-center py-3 px-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold">{atp.urutan}</span>
              </td>
              <td className="text-center py-3 px-3">
                <Badge className={`${STATUS_BADGE[atp.approval_status] ?? "bg-gray-100 text-gray-600"} text-xs`}>{atp.approval_status}</Badge>
                {/* Hanya tampilkan dikunci jika tab disetujui dan is_locked true */}
                {tab === "disetujui" && !!atp.is_locked && <span className="block text-xs text-gray-400 mt-0.5">🔒 dikunci</span>}
              </td>

              {/* Kolom waktu disetujui — hanya di tab disetujui */}
              {tab === "disetujui" && (
                <td className="py-3 px-3 text-gray-500 text-xs">
                  {atp.approved_at
                    ? new Date(atp.approved_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
              )}

              {/* Aksi */}
              <td className="py-3 px-3">
                <div className="flex items-center justify-center gap-1.5">
                  {tab === "diajukan" && (
                    <>
                      {/* Setujui */}
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1 text-xs h-7 px-2.5" onClick={() => handleSetujui(atp.atp_id)} disabled={loadingAksi} title="Setujui ATP">
                        <CheckCircleIcon size={13} />
                        Setujui
                      </Button>
                      {/* Tolak */}
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white gap-1 text-xs h-7 px-2.5" onClick={() => openModalTolak(atp.atp_id)} disabled={loadingAksi} title="Tolak ATP">
                        <XCircleIcon size={13} />
                        Tolak
                      </Button>
                    </>
                  )}

                  {tab === "disetujui" && (
                    /* Batal Disetujui */
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs h-7 px-2.5" onClick={() => handleBatalDisetujui(atp.atp_id)} disabled={loadingAksi} title="Batalkan persetujuan">
                      <RotateCcwIcon size={13} />
                      Batal Setujui
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── Render card per kompetensi ────────────────────────────────────────────
  const renderKompetensiCard = (komp: AtpKompetensi) => {
    const kompKey = `komp-${komp.kompetensi_id}`;
    const isKompExpanded = expandedKeys.has(kompKey);

    // Hitung total ATP dalam kompetensi ini
    const totalAtpKomp = komp.periode.reduce((a, p) => a + p.semesters.reduce((b, s) => b + s.guru.reduce((c, g) => c + g.histori_atp.length, 0), 0), 0);

    return (
      <div key={komp.kompetensi_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Header Kompetensi ── */}
        <button type="button" className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left" onClick={() => toggleKey(kompKey)}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {isKompExpanded ? <ChevronDownIcon size={18} className="text-gray-400 shrink-0 mt-0.5" /> : <ChevronRightIcon size={18} className="text-gray-400 shrink-0 mt-0.5" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-800">{komp.judul_kompetensi}</span>
                <Badge className="bg-indigo-100 text-indigo-700 text-xs shrink-0">{komp.jenis_kompetensi}</Badge>
                {komp.fase && <Badge className="bg-purple-100 text-purple-700 text-xs shrink-0">Fase {komp.fase}</Badge>}
                <Badge className={komp.status_kompetensi === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{komp.status_kompetensi}</Badge>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <BookOpenIcon size={12} className="text-gray-400" />
                <span className="text-sm text-gray-500">{komp.mata_pelajaran}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-sm font-semibold text-gray-600">{totalAtpKomp} ATP</p>
            <p className="text-xs text-gray-400">{komp.periode.length} periode</p>
          </div>
        </button>

        {/* ── Periode ── */}
        {isKompExpanded && (
          <div className="border-t border-gray-100">
            {komp.periode.map((periode) => {
              const periodeKey = `periode-${komp.kompetensi_id}-${periode.tahun_akademik_id}`;
              const isPeriodeExpanded = expandedKeys.has(periodeKey);

              return (
                <div key={periode.tahun_akademik_id} className="border-b border-gray-100 last:border-b-0">
                  {/* Header Periode */}
                  <button
                    type="button"
                    className={`w-full px-5 py-3 flex items-center justify-between transition-colors text-left ${periode.status_tahun_akademik === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-500 hover:bg-gray-600"}`}
                    onClick={() => toggleKey(periodeKey)}
                  >
                    <div className="flex items-center gap-2">
                      {isPeriodeExpanded ? <ChevronDownIcon size={16} className="text-white" /> : <ChevronRightIcon size={16} className="text-white" />}
                      <CalendarIcon size={14} className="text-white/80" />
                      <span className="text-white font-semibold text-sm">{periode.tahun_akademik}</span>
                      <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-700 text-xs"}>{periode.status_tahun_akademik}</Badge>
                    </div>
                    <span className="text-white/70 text-xs">{periode.semesters.length} semester</span>
                  </button>

                  {/* ── Semester ── */}
                  {isPeriodeExpanded &&
                    periode.semesters.map((semester) => {
                      const semKey = `sem-${komp.kompetensi_id}-${periode.tahun_akademik_id}-${semester.semester_id}`;
                      const isSemExpanded = expandedKeys.has(semKey);
                      const totalAtpSem = semester.guru.reduce((a, g) => a + g.histori_atp.length, 0);

                      return (
                        <div key={semester.semester_id} className="border-t border-gray-100">
                          {/* Header Semester */}
                          <button type="button" className="w-full px-5 py-2.5 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-colors text-left" onClick={() => toggleKey(semKey)}>
                            <div className="flex items-center gap-2">
                              {isSemExpanded ? <ChevronDownIcon size={15} className="text-indigo-500" /> : <ChevronRightIcon size={15} className="text-indigo-500" />}
                              <span className="font-semibold text-indigo-900 text-sm">Semester {semester.semester}</span>
                              <Badge className={semester.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{semester.status_semester}</Badge>
                            </div>
                            <span className="text-indigo-500 text-xs">
                              {semester.guru.length} guru · {totalAtpSem} ATP
                            </span>
                          </button>

                          {/* ── Guru ── */}
                          {isSemExpanded &&
                            semester.guru.map((guru) => {
                              const guruKey = `guru-${komp.kompetensi_id}-${periode.tahun_akademik_id}-${semester.semester_id}-${guru.guru_id}`;
                              const isGuruExpanded = expandedKeys.has(guruKey);

                              return (
                                <div key={guru.guru_id} className="border-t border-gray-100">
                                  {/* Header Guru */}
                                  <button type="button" className="w-full px-5 py-2.5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left" onClick={() => toggleKey(guruKey)}>
                                    <div className="flex items-center gap-2">
                                      {isGuruExpanded ? <ChevronDownIcon size={14} className="text-gray-400" /> : <ChevronRightIcon size={14} className="text-gray-400" />}
                                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                        <UserIcon size={12} className="text-gray-600" />
                                      </div>
                                      <span className="font-medium text-gray-800 text-sm">{guru.nama_guru}</span>
                                    </div>
                                    <Badge className="bg-gray-100 text-gray-600 text-xs">{guru.histori_atp.length} ATP</Badge>
                                  </button>

                                  {/* Tabel histori ATP */}
                                  {isGuruExpanded && renderHistoriAtp(guru.histori_atp, activeTab)}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Alur Tujuan Pembelajaran" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Alur Tujuan Pembelajaran</h1>
            <p className="text-sm text-muted-foreground mt-1">Pantau dan setujui penerapan ATP yang diajukan guru</p>
          </div>

          {/* ── Tab + Search ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
            {/* Tab */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {(["diajukan", "disetujui"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab === "diajukan" ? (
                    <>
                      <Clock size={16} />
                      Menunggu Persetujuan
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Disetujui
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <Input placeholder="Cari mata pelajaran, kompetensi, guru..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" disabled={loading} />
            </div>
          </div>

          {/* ── Statistik ── */}
          {!loading && data.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Kompetensi", value: stats.totalKompetensi, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                { label: "Total ATP", value: stats.totalAtp, color: "bg-amber-50 text-amber-700 border-amber-200" },
                { label: "Guru", value: stats.totalGuru, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl border p-4 ${color}`}>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-2xl font-bold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Info jumlah ── */}
          {!loading && (
            <p className="text-sm text-gray-500 mb-4">
              {filteredData.length === 0 ? (
                activeTab === "diajukan" ? (
                  "Tidak ada ATP yang menunggu persetujuan."
                ) : (
                  "Belum ada ATP yang disetujui."
                )
              ) : (
                <>
                  Menampilkan <strong>{filteredData.length}</strong> kompetensi · {activeTab === "diajukan" ? "menunggu persetujuan" : "telah disetujui"}
                </>
              )}
            </p>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat data ATP...</p>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && filteredData.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              {activeTab === "diajukan" ? <CheckCircleIcon size={40} className="mx-auto mb-3 text-gray-200" /> : <BookOpenIcon size={40} className="mx-auto mb-3 text-gray-200" />}
              <p className="font-medium text-lg">{searchTerm ? "Tidak ada data yang sesuai pencarian" : activeTab === "diajukan" ? "Tidak ada ATP yang menunggu persetujuan" : "Belum ada ATP yang disetujui"}</p>
              {searchTerm && (
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearchTerm("")}>
                  Reset pencarian
                </Button>
              )}
            </div>
          )}

          {/* ── Data Cards ── */}
          {!loading && filteredData.length > 0 && <div className="space-y-4">{filteredData.map((komp) => renderKompetensiCard(komp))}</div>}
        </div>

        <Footer />

        {/* ── Modal Tolak ── */}
        <Dialog open={modalTolak.open} onOpenChange={(open) => setModalTolak({ open, atpId: open ? modalTolak.atpId : null })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircleIcon size={20} />
                Tolak ATP
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <p className="text-sm text-gray-600">ATP yang ditolak akan dikembalikan ke guru untuk direvisi. Berikan catatan penolakan agar guru tahu apa yang perlu diperbaiki.</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Catatan Penolakan <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <Textarea placeholder="Contoh: Tujuan pembelajaran terlalu umum, perlu lebih spesifik dan terukur..." value={catatanPenolakan} onChange={(e) => setCatatanPenolakan(e.target.value)} rows={4} className="resize-none" />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setModalTolak({ open: false, atpId: null })} disabled={loadingAksi}>
                Batal
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white gap-2" onClick={handleTolak} disabled={loadingAksi}>
                {loadingAksi ? <Loader2Icon size={14} className="animate-spin" /> : <XCircleIcon size={14} />}
                Tolak ATP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarProvider>
  );
};

export default AlurTujuanPembelajaran;
