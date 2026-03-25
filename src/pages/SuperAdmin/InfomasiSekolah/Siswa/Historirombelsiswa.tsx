import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon, Users } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WaliRombel {
  id: number;
  nama: string;
  nip: string;
  nuptk: string;
  status: string;
}

interface Kelas {
  id: number;
  nama_kelas: string;
  tingkat: number;
  status: string;
}

interface Rombel {
  id: number;
  nama_rombel: string;
  jurusan: string | null;
  status: string;
  kelas: Kelas | null;
  wali_rombel: WaliRombel | null;
}

interface HistoriRombelItem {
  siswa_rombel_id: number;
  status_akhir: string | null;
  catatan: string | null;
  rombel: Rombel;
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  histori_rombel: HistoriRombelItem[];
}

interface SiswaDetail {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  status_siswa: string;
  periode: PeriodeItem[];
}

// ── Status badge helper ───────────────────────────────────────────────────────
const statusAkhirLabel: Record<string, { label: string; className: string }> = {
  naik_kelas: { label: "Naik Kelas", className: "bg-green-100 text-green-700" },
  tinggal_kelas: { label: "Tinggal Kelas", className: "bg-red-100 text-red-700" },
  lulus: { label: "Lulus", className: "bg-blue-100 text-blue-700" },
  pindah: { label: "Pindah", className: "bg-yellow-100 text-yellow-700" },
  keluar: { label: "Keluar", className: "bg-orange-100 text-orange-700" },
};

const StatusAkhirBadge = ({ status }: { status: string | null }) => {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const cfg = statusAkhirLabel[status];
  return <Badge className={`text-xs ${cfg?.className ?? "bg-gray-100 text-gray-600"}`}>{cfg?.label ?? status}</Badge>;
};

// ── Component ─────────────────────────────────────────────────────────────────
const HistoriRombelSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [siswa, setSiswa] = useState<SiswaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTahun, setExpandedTahun] = useState<number[]>([]);

  // ── Fetch histori rombel siswa ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api
      .get(`/spa/siswa-rombel/${id}`)
      .then((res) => {
        if (res.data.status === "success" && res.data.data.length > 0) {
          const data: SiswaDetail = res.data.data[0];
          setSiswa(data);
          // Auto-expand tahun akademik aktif
          const aktifIds = data.periode.filter((p) => p.status_tahun_akademik === "aktif").map((p) => p.tahun_akademik_id);
          setExpandedTahun(aktifIds.length ? aktifIds : [data.periode[0]?.tahun_akademik_id]);
        }
      })
      .catch((err) => {
        Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTahun = (tahunId: number) => setExpandedTahun((prev) => (prev.includes(tahunId) ? prev.filter((k) => k !== tahunId) : [...prev, tahunId]));

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Rombel Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Rombel</h1>
              {siswa && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {siswa.nama_siswa}
                  <span className="mx-1.5 text-gray-300">·</span>
                  NISN: {siswa.nisn}
                  <span className="mx-1.5 text-gray-300">·</span>
                  NIS: {siswa.nis}
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat data...</p>
            </div>
          ) : !siswa || siswa.periode.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-lg">Tidak ada data rombel</p>
              <p className="text-sm mt-1">Siswa ini belum memiliki histori rombel.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {siswa.periode.map((periode) => {
                const isOpen = expandedTahun.includes(periode.tahun_akademik_id);
                return (
                  <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                    {/* Accordion Header */}
                    <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleTahun(periode.tahun_akademik_id)}>
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                        <div className="text-left">
                          <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                          <div className="mt-0.5">
                            <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/80 text-xs"}>{periode.status_tahun_akademik}</Badge>
                          </div>
                        </div>
                      </div>
                      <span className="text-white/70 text-sm">{periode.histori_rombel.length} rombel</span>
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="p-4 space-y-3">
                        {periode.histori_rombel.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">Tidak ada data rombel pada periode ini.</p>
                        ) : (
                          periode.histori_rombel.map((histori, idx) => (
                            <div key={histori.siswa_rombel_id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
                              {/* Rombel ke-N jika lebih dari 1 */}
                              {periode.histori_rombel.length > 1 && <p className="text-xs font-semibold text-primary mb-2">Rombel #{idx + 1}</p>}

                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Rombel</span>
                                <span className="font-semibold text-gray-800">{histori.rombel.nama_rombel}</span>
                              </div>

                              {histori.rombel.kelas && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-500 font-medium">Kelas</span>
                                  <span className="text-gray-700">{histori.rombel.kelas.nama_kelas}</span>
                                </div>
                              )}

                              {histori.rombel.jurusan && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-500 font-medium">Jurusan</span>
                                  <span className="text-gray-700">{histori.rombel.jurusan}</span>
                                </div>
                              )}

                              {histori.rombel.wali_rombel && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-500 font-medium">Wali Rombel</span>
                                  <span className="text-gray-700">{histori.rombel.wali_rombel.nama}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Status Akhir</span>
                                <StatusAkhirBadge status={histori.status_akhir} />
                              </div>

                              {histori.catatan && (
                                <div className="flex justify-between items-start pt-1 border-t border-gray-200 mt-1">
                                  <span className="text-gray-500 font-medium">Catatan</span>
                                  <span className="text-gray-600 text-right max-w-[60%]">{histori.catatan}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriRombelSiswa;
