/**
 * HistoriAbsensiPegawai
 * Route: /superadmin/informasi-laporan-umum/absensi-pegawai/histori/:id
 *
 * Menampilkan histori absensi satu pegawai berdasarkan ID.
 * GET /spa/absensi/pegawai/sekolah/:id?tahun_akademik_id=X
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, CalendarCheck, XCircle, UserCheck, ChevronDownIcon, ChevronRightIcon, CalendarIcon, BookOpenIcon, CheckCircle2, XCircleIcon } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AbsensiDetail {
  absensi_id: number;
  hari: string;
  status: "hadir" | "tidak hadir";
  mata_pelajaran_id: number | null;
  nama_mata_pelajaran: string | null;
}

interface SemesterGroup {
  semester: string;
  status_semester: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiDetail[];
}

interface PeriodeGroup {
  tahun_akademik: string;
  status_tahun_akademik: string;
  total_hadir: number;
  total_tidak_hadir: number;
  semester: SemesterGroup[];
}

interface PegawaiHistori {
  guru_id: number;
  nama: string;
  periode: PeriodeGroup[];
}

interface TahunOption {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
  semester: { semester_id: number; semester: string; status: string }[];
}

// ── Component ─────────────────────────────────────────────────────────────────
const HistoriAbsensiPegawai = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [loadingSelect, setLoadingSelect] = useState(true);

  const [data, setData] = useState<PegawaiHistori | null>(null);
  const [loading, setLoading] = useState(false);

  const [expandedTahun, setExpandedTahun] = useState<string[]>([]);
  const [expandedSemester, setExpandedSemester] = useState<string[]>([]);

  const backUrl = searchParams.get("back") || "/superadmin/informasi-sekolah/kepegawaian";

  // ── Fetch dropdown tahun ──────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/spa/absensi/pegawai/data-select")
      .then((res) => {
        if (res.data.status === "success") {
          const list: TahunOption[] = res.data.data.tahun_semester ?? [];
          setTahunOptions(list);
          // Default ke tahun aktif
          const aktif = list.find((t) => t.status === "aktif");
          if (aktif) setSelectedTahun(String(aktif.tahun_akademik_id));
        }
      })
      .catch(() => Swal.fire({ icon: "error", title: "Gagal memuat filter!" }))
      .finally(() => setLoadingSelect(false));
  }, []);

  // ── Fetch histori berdasarkan tahun ──────────────────────────────────────
  useEffect(() => {
    if (!id || !selectedTahun) return;
    setLoading(true);
    setData(null);

    api
      .get(`/spa/absensi/pegawai/sekolah/${id}`, {
        params: { tahun_akademik_id: Number(selectedTahun) },
      })
      .then((res) => {
        if (res.data.status === "success" && res.data.data?.length > 0) {
          const pegawai: PegawaiHistori = res.data.data[0];
          setData(pegawai);
          // Auto-expand semua tahun
          setExpandedTahun(pegawai.periode.map((p) => p.tahun_akademik));
        } else {
          setData(null);
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404 && err.response?.status !== 400) {
          Swal.fire({ icon: "error", title: "Gagal memuat histori!", text: err.response?.data?.message });
        }
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id, selectedTahun]);

  // ── Accordion helpers ─────────────────────────────────────────────────────
  const toggleTahun = (key: string) => setExpandedTahun((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const toggleSemester = (key: string) => setExpandedSemester((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  // ── Total keseluruhan ─────────────────────────────────────────────────────
  const totalAll = data?.periode.reduce((acc, p) => ({ hadir: acc.hadir + p.total_hadir, tidak: acc.tidak + p.total_tidak_hadir }), { hadir: 0, tidak: 0 }) ?? { hadir: 0, tidak: 0 };

  const persenAll = totalAll.hadir + totalAll.tidak > 0 ? ((totalAll.hadir / (totalAll.hadir + totalAll.tidak)) * 100).toFixed(1) : "0";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Absensi Pegawai" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Absensi Pegawai</h1>
              {data && <p className="text-sm text-muted-foreground mt-0.5">{data.nama}</p>}
            </div>
          </div>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat filter...</p>
            </div>
          ) : (
            <>
              {/* ── Filter Tahun Akademik ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col justify-start">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun Akademik</label>
                    <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- pilih tahun akademik --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Pilih Tahun Akademik</SelectLabel>
                          {tahunOptions.map((t) => (
                            <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                              <div className="flex items-center gap-2">
                                <span>{t.tahun_akademik}</span>
                                <Badge className={t.status === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{t.status}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-gray-400 py-1">Data ditampilkan berdasarkan tahun akademik yang dipilih</p>
              </div>

              {/* ── Statistik ── */}
              {!loading && data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <Card className="border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <UserCheck className="text-blue-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Hadir</p>
                          <p className="text-2xl font-bold text-blue-600">{totalAll.hadir}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                          <XCircle className="text-red-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Tidak Hadir</p>
                          <p className="text-2xl font-bold text-red-600">{totalAll.tidak}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                          <CalendarCheck className="text-green-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Persentase Kehadiran</p>
                          <p className="text-2xl font-bold text-green-600">{persenAll}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Loading ── */}
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={32} />
                  <p className="font-medium">Memuat histori absensi...</p>
                </div>
              ) : !selectedTahun ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Pilih tahun akademik untuk melihat histori</p>
                </div>
              ) : !data ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-lg">Tidak ada data absensi</p>
                  <p className="text-sm mt-1">Pegawai ini belum memiliki catatan absensi pada tahun akademik yang dipilih.</p>
                </div>
              ) : (
                /* ── Accordion Periode ── */
                <div className="space-y-4">
                  {data.periode.map((periode) => {
                    const isTahunOpen = expandedTahun.includes(periode.tahun_akademik);
                    const persenTahun = periode.total_hadir + periode.total_tidak_hadir > 0 ? ((periode.total_hadir / (periode.total_hadir + periode.total_tidak_hadir)) * 100).toFixed(1) : "0";

                    return (
                      <div key={periode.tahun_akademik} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                        {/* Header Tahun Akademik */}
                        <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleTahun(periode.tahun_akademik)}>
                          <div className="flex items-center gap-3">
                            {isTahunOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                            <div className="text-left">
                              <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/70 text-xs"}>{periode.status_tahun_akademik}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4 text-white/90 text-sm">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 size={14} className="text-green-300" />
                                Hadir: <strong className="text-white ml-1">{periode.total_hadir}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <XCircleIcon size={14} className="text-red-300" />
                                Tdk: <strong className="text-white ml-1">{periode.total_tidak_hadir}</strong>
                              </span>
                              <span className="text-white/70 hidden md:block">{persenTahun}%</span>
                            </div>
                          </div>
                        </button>

                        {/* Semester Accordion */}
                        {isTahunOpen && (
                          <div className="p-4 space-y-3">
                            {periode.semester.map((sem) => {
                              const semKey = `${periode.tahun_akademik}-${sem.semester}`;
                              const isSemOpen = expandedSemester.includes(semKey);
                              const persenSem = sem.total_hadir + sem.total_tidak_hadir > 0 ? ((sem.total_hadir / (sem.total_hadir + sem.total_tidak_hadir)) * 100).toFixed(1) : "0";

                              return (
                                <div key={semKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Header Semester */}
                                  <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleSemester(semKey)}>
                                    <div className="flex items-center gap-2">
                                      {isSemOpen ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                      <span className="font-semibold text-indigo-900">Semester {sem.semester}</span>
                                      <Badge className={sem.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{sem.status_semester}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-indigo-700">
                                      <span className="text-green-600 font-semibold">{sem.total_hadir} hadir</span>
                                      <span className="text-gray-400">·</span>
                                      <span className="text-red-500 font-semibold">{sem.total_tidak_hadir} tidak hadir</span>
                                      <span className="text-gray-400 hidden md:block">· {persenSem}%</span>
                                    </div>
                                  </button>

                                  {/* Tabel Absensi */}
                                  {isSemOpen && (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="bg-gray-50/80 border-b border-gray-200">
                                            <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-10">No</th>
                                            <th className="py-2.5 px-3 font-semibold text-gray-600 text-left">Tanggal</th>
                                            <th className="py-2.5 px-3 font-semibold text-gray-600">Mata Pelajaran</th>
                                            <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-28">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {sem.absensi.length === 0 ? (
                                            <tr>
                                              <td colSpan={4} className="text-center py-6 text-gray-400">
                                                Tidak ada data absensi
                                              </td>
                                            </tr>
                                          ) : (
                                            sem.absensi.map((abs, idx) => (
                                              <tr key={abs.absensi_id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                                                <td className="text-center py-2.5 px-3 text-gray-400 font-medium">{idx + 1}</td>
                                                <td className="py-2.5 px-3">
                                                  <div className="flex items-center gap-2">
                                                    <CalendarIcon size={14} className="text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-800">{abs.hari}</span>
                                                  </div>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                  {abs.nama_mata_pelajaran ? (
                                                    <div className="flex items-center gap-1.5 text-gray-700">
                                                      <BookOpenIcon size={13} className="text-indigo-400 flex-shrink-0" />
                                                      {abs.nama_mata_pelajaran}
                                                    </div>
                                                  ) : (
                                                    <span className="text-gray-400">—</span>
                                                  )}
                                                </td>
                                                <td className="text-center py-2.5 px-3">
                                                  <Badge className={abs.status === "hadir" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>{abs.status}</Badge>
                                                </td>
                                              </tr>
                                            ))
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriAbsensiPegawai;
