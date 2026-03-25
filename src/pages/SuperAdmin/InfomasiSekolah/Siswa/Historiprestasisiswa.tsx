import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, Star, CalendarIcon, Trophy, Medal, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PrestasiItem {
  id: number;
  prestasi_diraih: string;
}

interface PeriodePrestasi {
  tahun_akademik_id: number;
  tahun_akademik: string;
  prestasi: PrestasiItem[];
}

interface SiswaPrestasiData {
  siswa_id: number;
  nama_siswa: string;
  nisn?: string | null;
  nis?: string | null;
  periode: PeriodePrestasi[];
}

// ── Component ─────────────────────────────────────────────────────────────────
const HistoriPrestasiSiswaReadOnly = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<SiswaPrestasiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTahun, setExpandedTahun] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/spa/prestasi/${id}`)
      .then((res) => {
        if (res.data.status === "success" && res.data.data) {
          const d: SiswaPrestasiData = res.data.data;
          setData(d);
          // Auto-expand semua periode
          setExpandedTahun(d.periode.map((p) => p.tahun_akademik_id));
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
        }
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTahun = (tahunId: number) => setExpandedTahun((prev) => (prev.includes(tahunId) ? prev.filter((k) => k !== tahunId) : [...prev, tahunId]));

  const totalPrestasi = data?.periode?.reduce((a, p) => a + (p.prestasi?.length ?? 0), 0) ?? 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Prestasi Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Prestasi</h1>
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
              <Star size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-lg">Tidak ada data prestasi</p>
              <p className="text-sm mt-1">Siswa ini belum memiliki catatan prestasi.</p>
            </div>
          ) : (
            /* ── Content ── */
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Card className="border-yellow-200">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Trophy className="text-yellow-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Prestasi</p>
                        <p className="text-2xl font-bold text-yellow-600">{totalPrestasi}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                          <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80 text-sm">
                          <Medal size={14} />
                          <span>{periode.prestasi?.length ?? 0} prestasi</span>
                        </div>
                      </button>

                      {/* Tahun Body */}
                      {isOpen && (
                        <div className="p-4">
                          {!periode.prestasi?.length ? (
                            <p className="text-center text-gray-400 py-4 text-sm">Tidak ada prestasi pada periode ini.</p>
                          ) : (
                            <div className="space-y-2">
                              {periode.prestasi.map((item, idx) => (
                                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3">
                                  {/* Nomor urut */}
                                  <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-yellow-700 text-xs font-bold">{idx + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-800 font-medium leading-snug">{item.prestasi_diraih}</p>
                                  </div>
                                  <Trophy size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
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

export default HistoriPrestasiSiswaReadOnly;
