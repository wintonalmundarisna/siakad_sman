/**
 * HistoriEkskulSiswa
 * Route: /superadmin/informasi-akademik/siswa/histori/ekstrakurikuler/:id
 * GET /api/spa/siswa/ekskul/:id  → EkskulSiswaPivotController::show()
 *
 * Response:
 * {
 *   siswa_id, nama_siswa, nisn, nis,
 *   periode: [{
 *     tahun_akademik_id, tahun_akademik, status_tahun_akademik,
 *     ekstrakurikulers: [{
 *       ekskul_id, nama_ekskul, anggaran, status_ekskul,
 *       status_aktif_ekskul, sikap, status_kehadiran
 *     }]
 *   }]
 * }
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, Trophy, Users } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EkskulDetail {
  ekskul_id: number;
  nama_ekskul: string;
  anggaran?: string | number | null;
  status_ekskul?: string | null;
  status_aktif_ekskul?: string | null;
  sikap?: string | null;
  status_kehadiran?: string | null;
}

interface PeriodeEkskul {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  ekstrakurikulers: EkskulDetail[];
}

interface SiswaEkskul {
  siswa_id: number;
  nama_siswa: string;
  nisn?: string | null;
  nis?: string | null;
  periode: PeriodeEkskul[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SIKAP_COLOR: Record<string, string> = {
  "Sangat Baik": "bg-green-100 text-green-700",
  Baik: "bg-blue-100 text-blue-700",
  Cukup: "bg-yellow-100 text-yellow-700",
  Kurang: "bg-red-100 text-red-700",
};

const KEHADIRAN_COLOR: Record<string, string> = {
  Aktif: "bg-emerald-100 text-emerald-700",
  "Cukup Aktif": "bg-blue-100 text-blue-700",
  "Kurang Aktif": "bg-yellow-100 text-yellow-700",
  "Tidak Aktif": "bg-red-100 text-red-700",
};

const formatAnggaran = (val?: string | number | null) => {
  if (!val) return null;
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
};

// ── Component ─────────────────────────────────────────────────────────────────
const HistoriEkskulSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<SiswaEkskul | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTahun, setExpandedTahun] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/spa/siswa/ekskul/${id}`)
      .then((res) => {
        if (res.data.status === "success" && res.data.data) {
          const d: SiswaEkskul = res.data.data;
          setData(d);
          // Auto-expand tahun aktif, fallback ke semua
          const aktifIds = d.periode.filter((p) => p.status_tahun_akademik === "aktif").map((p) => p.tahun_akademik_id);
          setExpandedTahun(aktifIds.length ? aktifIds : d.periode.map((p) => p.tahun_akademik_id));
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTahun = (id: number) => setExpandedTahun((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));

  const totalEkskul = data?.periode?.reduce((a, p) => a + (p.ekstrakurikulers?.length ?? 0), 0) ?? 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Ekstrakurikuler Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Ekstrakurikuler</h1>
              {data && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {data.nama_siswa}
                  {data.nisn && (
                    <>
                      <span className="mx-1.5 text-gray-300">·</span>NISN: {data.nisn}
                    </>
                  )}
                  {data.nis && (
                    <>
                      <span className="mx-1.5 text-gray-300">·</span>NIS: {data.nis}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* ── Loading ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat data...</p>
            </div>
          ) : /* ── Empty ── */
          !data || !data.periode?.length ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <Trophy size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-lg">Tidak ada data ekstrakurikuler</p>
              <p className="text-sm mt-1">Siswa ini belum terdaftar di ekstrakurikuler apapun.</p>
            </div>
          ) : (
            /* ── Content ── */
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Card className="border-blue-200">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <CalendarIcon className="text-blue-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Periode</p>
                        <p className="text-2xl font-bold text-blue-600">{data.periode.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-200">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 rounded-full">
                        <Trophy className="text-emerald-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Ekskul Diikuti</p>
                        <p className="text-2xl font-bold text-emerald-600">{totalEkskul}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Accordion per Tahun Akademik */}
              <div className="space-y-4">
                {data.periode.map((periode) => {
                  const isOpen = expandedTahun.includes(periode.tahun_akademik_id);
                  return (
                    <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                      {/* Tahun Header */}
                      <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleTahun(periode.tahun_akademik_id)}>
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <div className="text-left">
                            <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                            <div className="mt-0.5">
                              <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/70 text-xs"}>{periode.status_tahun_akademik}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80 text-sm">
                          <Users size={14} />
                          <span>{periode.ekstrakurikulers?.length ?? 0} ekskul</span>
                        </div>
                      </button>

                      {/* Tahun Body */}
                      {isOpen && (
                        <div className="p-4">
                          {!periode.ekstrakurikulers?.length ? (
                            <p className="text-center text-gray-400 py-4 text-sm">Tidak ada ekskul pada periode ini.</p>
                          ) : (
                            <div className="space-y-2">
                              {periode.ekstrakurikulers.map((ekskul) => (
                                <div key={ekskul.ekskul_id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                  {/* Nama + Status badges */}
                                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <Trophy size={15} className="text-emerald-400 flex-shrink-0" />
                                      <span className="font-semibold text-gray-800">{ekskul.nama_ekskul}</span>
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                      {ekskul.status_ekskul && <Badge className="bg-blue-100 text-blue-700 text-xs capitalize">{ekskul.status_ekskul}</Badge>}
                                      {ekskul.status_aktif_ekskul && (
                                        <Badge className={ekskul.status_aktif_ekskul === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{ekskul.status_aktif_ekskul}</Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Detail pills */}
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    {ekskul.sikap && <span className={`px-2 py-0.5 rounded-full font-medium ${SIKAP_COLOR[ekskul.sikap] ?? "bg-gray-100 text-gray-600"}`}>Sikap: {ekskul.sikap}</span>}
                                    {ekskul.status_kehadiran && (
                                      <span className={`px-2 py-0.5 rounded-full font-medium ${KEHADIRAN_COLOR[ekskul.status_kehadiran] ?? "bg-indigo-100 text-indigo-700"}`}>Kehadiran: {ekskul.status_kehadiran}</span>
                                    )}
                                    {formatAnggaran(ekskul.anggaran) && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Anggaran: {formatAnggaran(ekskul.anggaran)}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriEkskulSiswa;
