/**
 * HistoriAbsensiPelajaran
 * Route: /superadmin/informasi-laporan-umum/absensi-pelajaran/histori/:id
 * GET /spa/absensi/pegawai/pelajaran/:id?tahun_akademik_id=X
 *
 * Response dari AbsensiPelajaranController::show():
 * [{
 *   guru_id, nama_guru, nip, nuptk,
 *   periode: [{
 *     tahun_akademik_id, tahun_akademik, status_tahun_akademik,
 *     total_hadir_pertahun, total_tidak_hadir_pertahun,
 *     semesters: [{
 *       semester_id, semester, status_semester,
 *       total_hadir_persemester, total_tidak_hadir_persemester,
 *       jadwal_pelajarans: [{
 *         jadwal_pelajaran_id, mata_pelajaran, hari, rombel,
 *         jam_mulai, jam_selesai, ruangan, link_opsional,
 *         absensi: [{ absensi_id, hari, status }]
 *       }]
 *     }]
 *   }]
 * }]
 */
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
import { ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, BookOpenIcon, ClockIcon, MapPinIcon, UserCheck, XCircle, CalendarCheck, CheckCircle2, XCircleIcon } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface AbsensiItem {
  absensi_id: number;
  hari: string;
  status: string;
}

interface JadwalItem {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string | null;
  hari: string | null;
  rombel: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  ruangan: string | null;
  link_opsional: string | null;
  absensi: AbsensiItem[];
}

interface SemesterItem {
  semester_id: number;
  semester: string;
  status_semester: string;
  total_hadir_persemester: number;
  total_tidak_hadir_persemester: number;
  jadwal_pelajarans: JadwalItem[];
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  total_hadir_pertahun: number;
  total_tidak_hadir_pertahun: number;
  semesters: SemesterItem[];
}

interface GuruData {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
  periode: PeriodeItem[];
}

interface TahunOption {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
}

const HistoriAbsensiPelajaran = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [loadingSelect, setLoadingSelect] = useState(true);

  const [data, setData] = useState<GuruData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTahun, setExpandedTahun] = useState<string[]>([]);
  const [expandedSemester, setExpandedSemester] = useState<string[]>([]);
  const [expandedJadwal, setExpandedJadwal] = useState<string[]>([]);

  useEffect(() => {
    api
      .get("/spa/absensi/guru/pelajaran/data-select")
      .then((res) => {
        if (res.data.status === "success") {
          const list: TahunOption[] = res.data.data.tahun_semester ?? [];
          setTahunOptions(list);
          const aktif = list.find((t) => t.status === "aktif");
          if (aktif) setSelectedTahun(String(aktif.tahun_akademik_id));
        }
      })
      .catch(() => Swal.fire({ icon: "error", title: "Gagal memuat filter!" }))
      .finally(() => setLoadingSelect(false));
  }, []);

  useEffect(() => {
    if (!id || !selectedTahun) return;
    setLoading(true);
    setData(null);

    api
      .get(`/spa/guru/absensi/pelajaran/${id}`, {
        params: { tahun_akademik_id: Number(selectedTahun) },
      })
      .then((res) => {
        if (res.data.status === "success" && res.data.data?.length > 0) {
          const d: GuruData = res.data.data[0];
          setData(d);
          setExpandedTahun(d.periode.map((p) => p.tahun_akademik));
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
        }
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id, selectedTahun]);

  const toggleTahun = (key: string) => setExpandedTahun((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleSemester = (key: string) => setExpandedSemester((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleJadwal = (key: string) => setExpandedJadwal((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const totalAll = data?.periode.reduce((acc, p) => ({ hadir: acc.hadir + p.total_hadir_pertahun, tidak: acc.tidak + p.total_tidak_hadir_pertahun }), { hadir: 0, tidak: 0 }) ?? { hadir: 0, tidak: 0 };
  const persenAll = totalAll.hadir + totalAll.tidak > 0 ? ((totalAll.hadir / (totalAll.hadir + totalAll.tidak)) * 100).toFixed(1) : "0";

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Absensi Guru - Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Absensi Guru - Pelajaran</h1>
              {data && <p className="text-sm text-muted-foreground mt-0.5">{data.nama_guru}</p>}
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

              {/* Statistik */}
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

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={32} />
                  <p className="font-medium">Memuat histori absensi...</p>
                </div>
              ) : !data ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-lg">Tidak ada data absensi</p>
                  <p className="text-sm mt-1">Guru ini belum memiliki data absensi pelajaran pada tahun akademik yang dipilih.</p>
                </div>
              ) : (
                /* Accordion 3 level: Tahun → Semester → Jadwal → Absensi */
                <div className="space-y-4">
                  {data.periode.map((periode) => {
                    const isTahunOpen = expandedTahun.includes(periode.tahun_akademik);
                    const persenTahun = periode.total_hadir_pertahun + periode.total_tidak_hadir_pertahun > 0 ? ((periode.total_hadir_pertahun / (periode.total_hadir_pertahun + periode.total_tidak_hadir_pertahun)) * 100).toFixed(1) : "0";

                    return (
                      <div key={periode.tahun_akademik} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                        {/* Header Tahun */}
                        <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleTahun(periode.tahun_akademik)}>
                          <div className="flex items-center gap-3">
                            {isTahunOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                            <div className="text-left">
                              <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                              <div className="mt-0.5">
                                <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/70 text-xs"}>{periode.status_tahun_akademik}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-white/90 text-sm">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={14} className="text-green-300" />
                              <strong className="text-white">{periode.total_hadir_pertahun}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <XCircleIcon size={14} className="text-red-300" />
                              <strong className="text-white">{periode.total_tidak_hadir_pertahun}</strong>
                            </span>
                            <span className="text-white/70 hidden md:block">{persenTahun}%</span>
                          </div>
                        </button>

                        {isTahunOpen && (
                          <div className="p-4 space-y-3">
                            {periode.semesters.map((sem) => {
                              const semKey = `${periode.tahun_akademik}-${sem.semester}`;
                              const isSemOpen = expandedSemester.includes(semKey);
                              const persenSem =
                                sem.total_hadir_persemester + sem.total_tidak_hadir_persemester > 0 ? ((sem.total_hadir_persemester / (sem.total_hadir_persemester + sem.total_tidak_hadir_persemester)) * 100).toFixed(1) : "0";

                              return (
                                <div key={semKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Header Semester */}
                                  <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleSemester(semKey)}>
                                    <div className="flex items-center gap-2">
                                      {isSemOpen ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                      <span className="font-semibold text-indigo-900">Semester {sem.semester}</span>
                                      <Badge className={sem.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{sem.status_semester}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="text-green-600 font-semibold">{sem.total_hadir_persemester} hadir</span>
                                      <span className="text-gray-400">·</span>
                                      <span className="text-red-500 font-semibold">{sem.total_tidak_hadir_persemester} tidak hadir</span>
                                      <span className="text-gray-400 hidden md:block">· {persenSem}%</span>
                                    </div>
                                  </button>

                                  {isSemOpen && (
                                    <div className="p-3 space-y-2">
                                      {sem.jadwal_pelajarans.map((jadwal) => {
                                        const jadwalKey = `${semKey}-${jadwal.jadwal_pelajaran_id}`;
                                        const isJadwalOpen = expandedJadwal.includes(jadwalKey);
                                        const hadirJadwal = jadwal.absensi.filter((a) => a.status === "hadir").length;
                                        const tidakJadwal = jadwal.absensi.filter((a) => a.status !== "hadir").length;

                                        return (
                                          <div key={jadwalKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Header Jadwal */}
                                            <button type="button" className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors" onClick={() => toggleJadwal(jadwalKey)}>
                                              <div className="flex items-center gap-2">
                                                {isJadwalOpen ? <ChevronDownIcon className="text-gray-500" size={15} /> : <ChevronRightIcon className="text-gray-500" size={15} />}
                                                <BookOpenIcon size={14} className="text-indigo-400" />
                                                <span className="font-medium text-gray-800">{jadwal.mata_pelajaran ?? "—"}</span>
                                                {jadwal.rombel && <span className="text-gray-400 text-xs">· {jadwal.rombel}</span>}
                                              </div>
                                              <div className="flex items-center gap-2 text-xs">
                                                <span className="text-green-600 font-semibold">{hadirJadwal}H</span>
                                                <span className="text-red-500 font-semibold">{tidakJadwal}T</span>
                                                <span className="text-gray-400">{jadwal.absensi.length} total</span>
                                              </div>
                                            </button>

                                            {/* Info Jadwal */}
                                            {isJadwalOpen && (
                                              <div className="border-t border-gray-100">
                                                {/* Detail jadwal */}
                                                <div className="px-4 py-2 bg-white flex flex-wrap gap-3 text-xs text-gray-500 border-b border-gray-100">
                                                  {jadwal.hari && (
                                                    <span className="flex items-center gap-1">
                                                      <CalendarIcon size={11} /> {jadwal.hari}
                                                    </span>
                                                  )}
                                                  {jadwal.jam_mulai && (
                                                    <span className="flex items-center gap-1">
                                                      <ClockIcon size={11} /> {jadwal.jam_mulai} – {jadwal.jam_selesai}
                                                    </span>
                                                  )}
                                                  {jadwal.ruangan && (
                                                    <span className="flex items-center gap-1">
                                                      <MapPinIcon size={11} /> {jadwal.ruangan}
                                                    </span>
                                                  )}
                                                </div>

                                                {/* Tabel absensi */}
                                                <table className="w-full text-sm">
                                                  <thead>
                                                    <tr className="bg-gray-50/80 border-b border-gray-200">
                                                      <th className="text-center py-2 px-3 font-semibold text-gray-600 w-10">No</th>
                                                      <th className="py-2 px-3 font-semibold text-gray-600 text-left">Tanggal</th>
                                                      <th className="text-center py-2 px-3 font-semibold text-gray-600 w-28">Status</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {jadwal.absensi.length === 0 ? (
                                                      <tr>
                                                        <td colSpan={3} className="text-center py-4 text-gray-400">
                                                          Tidak ada absensi
                                                        </td>
                                                      </tr>
                                                    ) : (
                                                      jadwal.absensi.map((abs, idx) => (
                                                        <tr key={abs.absensi_id} className="border-b border-gray-100 hover:bg-gray-50/60">
                                                          <td className="text-center py-2 px-3 text-gray-400">{idx + 1}</td>
                                                          <td className="py-2 px-3 text-gray-800">
                                                            <div className="flex items-center gap-1.5">
                                                              <CalendarIcon size={13} className="text-gray-400" />
                                                              {abs.hari}
                                                            </div>
                                                          </td>
                                                          <td className="text-center py-2 px-3">
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

export default HistoriAbsensiPelajaran;
