import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, BookOpenIcon, UserCheck, XCircle, CalendarCheck, AlertCircle, MinusCircle, FileText } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AbsenDetail {
  absensi_id: number;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alpa" | string;
  bukti: string | null;
}

interface MataPelajaranAbsen {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string | null;
  absensi: AbsenDetail[];
}

interface TotalStatus {
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
}

interface SemesterAbsen {
  semester_id: number;
  semester: string;
  status_semester: string;
  total_status: TotalStatus;
  mata_pelajarans: MataPelajaranAbsen[];
}

interface PeriodeAbsen {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: string;
  total_status_tahun: TotalStatus;
  semester: SemesterAbsen[];
}

interface RombelAbsen {
  rombel_id: number;
  nama_rombel: string;
  periode: PeriodeAbsen[];
}

interface SiswaAbsen {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  histori_rombel: RombelAbsen[];
}

interface TahunOption {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  hadir: { label: "Hadir", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  izin: { label: "Izin", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  sakit: { label: "Sakit", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  alpa: { label: "Alpa", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <Badge className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>;
};

const persen = (hadir: number, total: number) => (total > 0 ? ((hadir / total) * 100).toFixed(1) : "0");

const totalDariStatus = (s: TotalStatus) => s.hadir + s.izin + s.sakit + s.alpa;

const resolveStorageUrl = (bukti: string | null): string | null => {
  if (!bukti) return null;
  if (bukti.startsWith("Bukti dihapus")) return null;
  if (bukti.startsWith("http://") || bukti.startsWith("https://")) return bukti;
  const relativePath = bukti.replace(/^public\//, "storage/");
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
  return `${base}/${relativePath}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
const HistoriAbsensiSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [loadingSelect, setLoadingSelect] = useState(true);

  const [data, setData] = useState<SiswaAbsen | null>(null);
  const [loading, setLoading] = useState(false);

  const [expandedRombel, setExpandedRombel] = useState<number[]>([]);
  const [expandedTahun, setExpandedTahun] = useState<number[]>([]);
  const [expandedSemester, setExpandedSemester] = useState<string[]>([]);
  const [expandedMapel, setExpandedMapel] = useState<string[]>([]);

  // ── Fetch filter tahun ────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/spa/absensi/siswa/pelajaran/data-select")
      .then((res) => {
        if (res.data.status === "success") {
          const list: TahunOption[] = (res.data.data.tahun_semester ?? []).map((t: any) => ({
            tahun_akademik_id: t.tahun_akademik_id,
            tahun_akademik: t.tahun_akademik,
            status: t.status,
          }));
          setTahunOptions(list);
          const aktif = list.find((t) => t.status === "aktif");
          setSelectedTahun(String(aktif?.tahun_akademik_id ?? list[0]?.tahun_akademik_id ?? ""));
        }
      })
      .catch(() => Swal.fire({ icon: "error", title: "Gagal memuat filter!" }))
      .finally(() => setLoadingSelect(false));
  }, []);

  // ── Fetch absensi siswa ───────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !selectedTahun) return;
    setLoading(true);
    setData(null);

    api
      .get(`/spa/absensi/siswa/pelajaran/${id}`, {
        params: { tahun_akademik_id: Number(selectedTahun) },
      })
      .then((res) => {
        if (res.data.status === "success" && res.data.data) {
          const d: SiswaAbsen = res.data.data;
          setData(d);

          setExpandedRombel(d.histori_rombel.map((r) => r.rombel_id));

          const aktifTahunIds: number[] = [];
          d.histori_rombel.forEach((r) =>
            r.periode.forEach((p) => {
              if (p.status_tahun === "aktif") aktifTahunIds.push(p.tahun_akademik_id);
            }),
          );
          setExpandedTahun(aktifTahunIds.length ? aktifTahunIds : (d.histori_rombel[0]?.periode.map((p) => p.tahun_akademik_id) ?? []));

          const aktifSemKeys: string[] = [];
          d.histori_rombel.forEach((r) =>
            r.periode.forEach((p) =>
              p.semester.forEach((s) => {
                if (s.status_semester === "aktif") aktifSemKeys.push(`${p.tahun_akademik_id}-${s.semester_id}`);
              }),
            ),
          );
          setExpandedSemester(aktifSemKeys);
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id, selectedTahun]);

  const toggleRombel = (key: number) => setExpandedRombel((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  const toggleTahun = (key: number) => setExpandedTahun((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  const toggleSemester = (key: string) => setExpandedSemester((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  const toggleMapel = (key: string) => setExpandedMapel((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const totalAll = data?.histori_rombel.reduce(
    (acc, r) => {
      r.periode.forEach((p) => {
        acc.hadir += p.total_status_tahun.hadir;
        acc.izin += p.total_status_tahun.izin;
        acc.sakit += p.total_status_tahun.sakit;
        acc.alpa += p.total_status_tahun.alpa;
      });
      return acc;
    },
    { hadir: 0, izin: 0, sakit: 0, alpa: 0 },
  ) ?? { hadir: 0, izin: 0, sakit: 0, alpa: 0 };

  const totalAllCount = totalDariStatus(totalAll);
  const persenAll = persen(totalAll.hadir, totalAllCount);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Absensi Siswa - Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Absensi Siswa - Pelajaran</h1>
              {data && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {data.nama_siswa}
                  <span className="mx-1.5 text-gray-300">·</span>
                  NISN: {data.nisn}
                  <span className="mx-1.5 text-gray-300">·</span>
                  NIS: {data.nis}
                </p>
              )}
            </div>
          </div>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
            </div>
          ) : (
            <>
              {/* Filter */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
                <div className="max-w-xs">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Akademik</label>
                  <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- pilih tahun --" />
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
                <p className="text-xs text-gray-400 mt-2">Data ditampilkan berdasarkan tahun akademik yang dipilih</p>
              </div>

              {/* Summary Cards */}
              {!loading && data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <Card className="border-green-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                          <UserCheck className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hadir</p>
                          <p className="text-2xl font-bold text-green-600">{totalAll.hadir}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <FileText className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Izin</p>
                          <p className="text-2xl font-bold text-blue-600">{totalAll.izin}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <AlertCircle className="text-yellow-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sakit</p>
                          <p className="text-2xl font-bold text-yellow-600">{totalAll.sakit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                          <XCircle className="text-red-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Alpa</p>
                          <p className="text-2xl font-bold text-red-600">{totalAll.alpa}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Persentase kehadiran global */}
              {!loading && data && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-full">
                    <CalendarCheck className="text-green-600" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Persentase Kehadiran Keseluruhan</p>
                    <p className="text-2xl font-bold text-green-600">{persenAll}%</p>
                  </div>
                  <div className="ml-auto text-right text-xs text-gray-400">
                    <p>
                      {totalAll.hadir} hadir dari {totalAllCount} pertemuan
                    </p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={32} />
                  <p className="font-medium">Memuat data...</p>
                </div>
              ) : !data || data.histori_rombel.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-lg">Tidak ada data absensi</p>
                  <p className="text-sm mt-1">Siswa ini belum memiliki data absensi pada tahun akademik yang dipilih.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.histori_rombel.map((rombel) => {
                    const isRombelOpen = expandedRombel.includes(rombel.rombel_id);
                    return (
                      <div key={rombel.rombel_id} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                        {/* Rombel Header */}
                        <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleRombel(rombel.rombel_id)}>
                          <div className="flex items-center gap-3">
                            {isRombelOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                            <span className="text-white font-bold text-lg">Rombel {rombel.nama_rombel}</span>
                          </div>
                          <span className="text-white/70 text-sm">{rombel.periode.length} periode</span>
                        </button>

                        {/* Rombel Body */}
                        {isRombelOpen && (
                          <div className="p-4 space-y-3">
                            {rombel.periode.map((periode) => {
                              const isTahunOpen = expandedTahun.includes(periode.tahun_akademik_id);
                              const totalTahun = totalDariStatus(periode.total_status_tahun);
                              const persenTahun = persen(periode.total_status_tahun.hadir, totalTahun);

                              return (
                                <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Tahun Header */}
                                  <button type="button" className="w-full bg-indigo-600 px-4 py-3 flex items-center justify-between hover:bg-indigo-700 transition-colors" onClick={() => toggleTahun(periode.tahun_akademik_id)}>
                                    <div className="flex items-center gap-2">
                                      {isTahunOpen ? <ChevronDownIcon className="text-white" size={17} /> : <ChevronRightIcon className="text-white" size={17} />}
                                      <span className="text-white font-semibold">Tahun Akademik {periode.tahun_akademik}</span>
                                      <Badge className={periode.status_tahun === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/80 text-xs"}>{periode.status_tahun}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/90 text-xs">
                                      <span className="text-green-300 font-semibold">{periode.total_status_tahun.hadir}H</span>
                                      <span className="text-blue-300 font-semibold">{periode.total_status_tahun.izin}I</span>
                                      <span className="text-yellow-300 font-semibold">{periode.total_status_tahun.sakit}S</span>
                                      <span className="text-red-300 font-semibold">{periode.total_status_tahun.alpa}A</span>
                                      <span className="text-white/60 hidden md:block">{persenTahun}%</span>
                                    </div>
                                  </button>

                                  {/* Tahun Body */}
                                  {isTahunOpen && (
                                    <div className="p-3 space-y-2">
                                      {periode.semester.map((sem) => {
                                        const semKey = `${periode.tahun_akademik_id}-${sem.semester_id}`;
                                        const isSemOpen = expandedSemester.includes(semKey);
                                        const totalSem = totalDariStatus(sem.total_status);

                                        return (
                                          <div key={semKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Semester Header */}
                                            <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleSemester(semKey)}>
                                              <div className="flex items-center gap-2">
                                                {isSemOpen ? <ChevronDownIcon className="text-indigo-600" size={15} /> : <ChevronRightIcon className="text-indigo-600" size={15} />}
                                                <span className="font-semibold text-indigo-900">Semester {sem.semester}</span>
                                                <Badge className={sem.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{sem.status_semester}</Badge>
                                              </div>
                                              <div className="flex items-center gap-2 text-xs font-semibold">
                                                <span className="text-green-600">{sem.total_status.hadir}H</span>
                                                <span className="text-blue-500">{sem.total_status.izin}I</span>
                                                <span className="text-yellow-500">{sem.total_status.sakit}S</span>
                                                <span className="text-red-500">{sem.total_status.alpa}A</span>
                                                <span className="text-gray-400 hidden md:block">{persen(sem.total_status.hadir, totalSem)}%</span>
                                              </div>
                                            </button>

                                            {/* Semester Body */}
                                            {isSemOpen && (
                                              <div className="p-3 space-y-2">
                                                {sem.mata_pelajarans.length === 0 ? (
                                                  <p className="text-center text-gray-400 py-4 text-sm">Tidak ada data absensi.</p>
                                                ) : (
                                                  sem.mata_pelajarans.map((mapel) => {
                                                    const mapelKey = `${semKey}-${mapel.jadwal_pelajaran_id}`;
                                                    const isMapelOpen = expandedMapel.includes(mapelKey);
                                                    const hMapel = mapel.absensi.filter((a) => a.status === "hadir").length;
                                                    const iMapel = mapel.absensi.filter((a) => a.status === "izin").length;
                                                    const sMapel = mapel.absensi.filter((a) => a.status === "sakit").length;
                                                    const aMapel = mapel.absensi.filter((a) => a.status === "alpa").length;

                                                    return (
                                                      <div key={mapelKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        {/* Mapel Header */}
                                                        <button type="button" className="w-full bg-gray-50 px-4 py-2.5 flex items-center justify-between hover:bg-gray-100 transition-colors" onClick={() => toggleMapel(mapelKey)}>
                                                          <div className="flex items-center gap-2">
                                                            {isMapelOpen ? <ChevronDownIcon className="text-gray-500" size={14} /> : <ChevronRightIcon className="text-gray-500" size={14} />}
                                                            <BookOpenIcon size={13} className="text-indigo-400" />
                                                            <span className="font-medium text-gray-800 text-sm">{mapel.mata_pelajaran ?? "—"}</span>
                                                          </div>
                                                          <div className="flex items-center gap-2 text-xs font-semibold">
                                                            <span className="text-green-600">{hMapel}H</span>
                                                            <span className="text-blue-500">{iMapel}I</span>
                                                            <span className="text-yellow-500">{sMapel}S</span>
                                                            <span className="text-red-500">{aMapel}A</span>
                                                            <span className="text-gray-400">{mapel.absensi.length} total</span>
                                                          </div>
                                                        </button>

                                                        {/* Mapel Body — tabel absensi */}
                                                        {isMapelOpen && (
                                                          <table className="w-full text-sm">
                                                            <thead>
                                                              <tr className="bg-gray-50/80 border-b border-gray-200">
                                                                <th className="text-center py-2 px-3 w-10 font-semibold text-gray-600">No</th>
                                                                <th className="py-2 px-3 font-semibold text-gray-600 text-left">Tanggal</th>
                                                                <th className="text-center py-2 px-3 w-28 font-semibold text-gray-600">Status</th>
                                                                <th className="text-center py-2 px-3 w-20 font-semibold text-gray-600">Bukti</th>
                                                              </tr>
                                                            </thead>
                                                            <tbody>
                                                              {mapel.absensi.map((abs, idx) => (
                                                                <tr key={abs.absensi_id} className="border-b border-gray-100 hover:bg-gray-50/60">
                                                                  <td className="text-center py-2 px-3 text-gray-400">{idx + 1}</td>
                                                                  <td className="py-2 px-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                      <CalendarIcon size={13} className="text-gray-400 flex-shrink-0" />
                                                                      <span>{abs.hari}</span>
                                                                    </div>
                                                                  </td>
                                                                  <td className="text-center py-2 px-3">
                                                                    <StatusBadge status={abs.status} />
                                                                  </td>
                                                                  <td className="text-center py-2 px-3">
                                                                    {abs.bukti ? (
                                                                      <a
                                                                        href={resolveStorageUrl(abs.bukti) ?? "#"}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-blue-500 hover:text-blue-700 hover:underline text-xs font-medium transition-colors"
                                                                      >
                                                                        Lihat
                                                                      </a>
                                                                    ) : (
                                                                      <MinusCircle size={14} className="text-gray-300 mx-auto" />
                                                                    )}
                                                                  </td>
                                                                </tr>
                                                              ))}
                                                            </tbody>
                                                          </table>
                                                        )}
                                                      </div>
                                                    );
                                                  })
                                                )}
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

export default HistoriAbsensiSiswa;
