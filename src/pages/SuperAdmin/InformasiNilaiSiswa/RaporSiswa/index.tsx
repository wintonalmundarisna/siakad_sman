/**
 * HistoriRaporSiswa
 * Route: /superadmin/informasi-akademik/data-nilai-siswa/rapor/:id
 * Endpoint: GET /spa/data-nilai-siswa/rapor/:id
 *
 * Menampilkan semua nilai, absensi, rapor milik satu siswa
 * dikelompokkan per tahun akademik → semester → jenis penilaian
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Loader2Icon, CalendarIcon,
  UserIcon, ChevronDownIcon, ChevronRightIcon, ClipboardListIcon,
  StarIcon,
} from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────────
interface NilaiPoint {
  absensi: string; tugas: string;
  uts?: string; uas?: string;
  nilai_akhir: string; predikat: string | null; deskripsi: string | null;
}
interface MataPelajaranNilai {
  data_nilai_siswa_id: number; mata_pelajaran_id: number;
  mata_pelajaran: string; guru_pengajar: string; point: NilaiPoint;
}
interface JenisPenilaianGroup { jenis_penilaian: string; mata_pelajaran: MataPelajaranNilai[] }
interface RaporData {
  rapor_id: number; jenis_rapor: string;
  sikap_spiritual: string | null; sikap_sosial: string | null;
  deskripsi_sikap: string | null; status: string;
  tanggal_terbit: string | null; catatan_wali: string | null;
  wali_rombel: string | null; rombel: string | null;
}
interface SemesterHistori {
  semester_id: number; semester: string; status: string;
  data_nilai_siswa: JenisPenilaianGroup[];
  rapor: RaporData | null;
}
interface TahunHistori {
  tahun_akademik_id: number; tahun_akademik: string; status: string;
  semester: SemesterHistori[];
}
interface RombelSaatIni {
  rombel_id: number | null; nama_rombel: string | null;
  jurusan: string | null; status_akhir: string | null; catatan: string | null;
}
interface SiswaInfo { siswa_id: number; nama: string; nisn: string; nis: string }
interface HistoriResponse {
  siswa: SiswaInfo; rombel_saat_ini: RombelSaatIni; tahun_akademik: TahunHistori[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (val: string | number | null | undefined) => {
  if (val === null || val === undefined) return "—";
  const n = parseFloat(String(val));
  return isNaN(n) ? "—" : n % 1 === 0 ? String(n) : n.toFixed(2);
};

const predikatColor: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-yellow-100 text-yellow-700",
  D: "bg-red-100 text-red-700",
};

const RaporStatusBadge = ({ status }: { status: string }) => (
  <Badge className={`text-xs ${status === "final" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
    {status}
  </Badge>
);

// ── Component ──────────────────────────────────────────────────────────────────
const HistoriRaporSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [data, setData] = useState<HistoriResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Accordion: tahun_id → semester_id
  const [expandedTahun, setExpandedTahun] = useState<Set<number>>(new Set());
  const [expandedSem, setExpandedSem] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    api.get(`/spa/data-nilai-siswa/rapor/${id}`)
      .then((res) => {
        if (res.data.status === "success") {
          const d: HistoriResponse = res.data.data;
          setData(d);
          // Auto-expand tahun + semester aktif
          const aktifTahun = d.tahun_akademik.filter((t) => t.status === "aktif");
          setExpandedTahun(new Set(aktifTahun.map((t) => t.tahun_akademik_id)));
          const aktifSem = aktifTahun.flatMap((t) =>
            t.semester.filter((s) => s.status === "aktif").map((s) => s.semester_id),
          );
          setExpandedSem(new Set(aktifSem));
        }
      })
      .catch((err) => {
        Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTahun = (id: number) =>
    setExpandedTahun((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSem = (id: number) =>
    setExpandedSem((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-gray-50 transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Rapor Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8 space-y-5">

          {/* ── Header ── */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Histori Rapor Siswa</h1>
              {data && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {data.siswa.nama}
                  <span className="mx-1.5 text-gray-300">·</span>
                  NISN: {data.siswa.nisn}
                  <span className="mx-1.5 text-gray-300">·</span>
                  NIS: {data.siswa.nis}
                </p>
              )}
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-56 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="font-medium">Memuat histori nilai...</p>
            </div>
          )}

          {/* ── Content ── */}
          {!loading && data && (
            <>
              {/* ── Info Siswa ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon size={24} className="text-primary" />
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{data.siswa.nama}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      <span className="text-sm text-gray-500">NISN: <strong>{data.siswa.nisn}</strong></span>
                      <span className="text-sm text-gray-500">NIS: <strong>{data.siswa.nis}</strong></span>
                    </div>
                  </div>
                  {/* Rombel saat ini */}
                  {data.rombel_saat_ini.nama_rombel && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
                      <p className="text-xs text-gray-400 font-medium">Rombel Saat Ini</p>
                      <p className="font-bold text-gray-800 mt-0.5">{data.rombel_saat_ini.nama_rombel}</p>
                      {data.rombel_saat_ini.jurusan && (
                        <Badge className="mt-1 bg-indigo-100 text-indigo-700 text-xs">{data.rombel_saat_ini.jurusan}</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Tahun Akademik accordion ── */}
              <div className="space-y-4">
                {data.tahun_akademik.map((tahun) => {
                  const isTahunOpen = expandedTahun.has(tahun.tahun_akademik_id);
                  return (
                    <div key={tahun.tahun_akademik_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Header Tahun */}
                      <button
                        type="button"
                        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors text-left ${tahun.status === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-600 hover:bg-gray-700"}`}
                        onClick={() => toggleTahun(tahun.tahun_akademik_id)}
                      >
                        <div className="flex items-center gap-3">
                          {isTahunOpen
                            ? <ChevronDownIcon size={18} className="text-white/80 shrink-0" />
                            : <ChevronRightIcon size={18} className="text-white/80 shrink-0" />}
                          <CalendarIcon size={16} className="text-white/70" />
                          <span className="font-bold text-white">Tahun Akademik {tahun.tahun_akademik}</span>
                          <Badge className={`text-xs ${tahun.status === "aktif" ? "bg-green-200 text-green-800" : "bg-gray-300 text-gray-700"}`}>
                            {tahun.status}
                          </Badge>
                        </div>
                        <span className="text-white/60 text-xs">{tahun.semester.length} semester</span>
                      </button>

                      {/* Semester */}
                      {isTahunOpen && (
                        <div className="divide-y divide-gray-100">
                          {tahun.semester.map((sem) => {
                            const isSemOpen = expandedSem.has(sem.semester_id);
                            return (
                              <div key={sem.semester_id}>
                                {/* Header Semester */}
                                <button
                                  type="button"
                                  className="w-full flex items-center justify-between px-5 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left"
                                  onClick={() => toggleSem(sem.semester_id)}
                                >
                                  <div className="flex items-center gap-2">
                                    {isSemOpen
                                      ? <ChevronDownIcon size={16} className="text-indigo-400" />
                                      : <ChevronRightIcon size={16} className="text-indigo-400" />}
                                    <span className="font-semibold text-indigo-900 text-sm">Semester {sem.semester}</span>
                                    <Badge className={`text-xs ${sem.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                      {sem.status}
                                    </Badge>
                                    {sem.rapor && (
                                      <RaporStatusBadge status={sem.rapor.status} />
                                    )}
                                  </div>
                                  <span className="text-indigo-400 text-xs">
                                    {sem.data_nilai_siswa.reduce((a, g) => a + g.mata_pelajaran.length, 0)} mapel
                                  </span>
                                </button>

                                {isSemOpen && (
                                  <div className="p-4 space-y-5">
                                    {/* Jenis Penilaian */}
                                    {sem.data_nilai_siswa.map((group) => (
                                      <div key={group.jenis_penilaian}>
                                        <div className="flex items-center gap-2 mb-3">
                                          <ClipboardListIcon size={15} className="text-primary" />
                                          <h4 className="font-semibold text-sm text-gray-700">{group.jenis_penilaian}</h4>
                                        </div>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                                          <table className="w-full text-xs">
                                            <thead>
                                              <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Mata Pelajaran</th>
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Guru</th>
                                                <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-16">Absensi</th>
                                                <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-16">Tugas</th>
                                                <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-16">
                                                  {["PTS", "Susulan PTS", "Remedial PTS"].includes(group.jenis_penilaian) ? "UTS" : "UAS"}
                                                </th>
                                                <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-20">Nilai Akhir</th>
                                                <th className="text-center py-2.5 px-3 font-semibold text-gray-600 w-16">Predikat</th>
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Deskripsi</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {group.mata_pelajaran.map((mp) => {
                                                const na = mp.point?.nilai_akhir !== null && mp.point?.nilai_akhir !== undefined
                                                  ? parseFloat(String(mp.point.nilai_akhir))
                                                  : null;
                                                const naColor = na === null ? "text-gray-400" : na >= 75 ? "text-emerald-600 font-bold" : "text-red-500 font-bold";
                                                const isPTS = ["PTS", "Susulan PTS", "Remedial PTS"].includes(group.jenis_penilaian);
                                                return (
                                                  <tr key={mp.data_nilai_siswa_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2.5 px-3 font-medium text-gray-800">{mp.mata_pelajaran}</td>
                                                    <td className="py-2.5 px-3 text-gray-500">{mp.guru_pengajar}</td>
                                                    <td className="py-2.5 px-3 text-center text-gray-600">{fmt(mp.point?.absensi)}</td>
                                                    <td className="py-2.5 px-3 text-center text-gray-600">{fmt(mp.point?.tugas)}</td>
                                                    <td className="py-2.5 px-3 text-center text-gray-600">
                                                      {isPTS ? fmt(mp.point?.uts) : fmt(mp.point?.uas)}
                                                    </td>
                                                    <td className={`py-2.5 px-3 text-center text-sm ${naColor}`}>
                                                      {na !== null ? na.toFixed(2) : "—"}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                      {mp.point?.predikat ? (
                                                        <Badge className={`text-xs ${predikatColor[mp.point.predikat] ?? "bg-gray-100 text-gray-600"}`}>
                                                          {mp.point.predikat}
                                                        </Badge>
                                                      ) : <span className="text-gray-300">—</span>}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-gray-500 max-w-[200px] truncate">
                                                      {mp.point?.deskripsi || <span className="text-gray-300">—</span>}
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Rapor */}
                                    {sem.rapor && (
                                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 space-y-2">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <StarIcon size={15} className="text-indigo-500" />
                                            <h4 className="font-semibold text-sm text-indigo-900">Rapor {sem.rapor.jenis_rapor}</h4>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <RaporStatusBadge status={sem.rapor.status} />
                                            {sem.rapor.tanggal_terbit && (
                                              <span className="text-xs text-indigo-400">{sem.rapor.tanggal_terbit}</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                          {[
                                            { label: "Rombel", value: sem.rapor.rombel },
                                            { label: "Wali Kelas", value: sem.rapor.wali_rombel },
                                            { label: "Sikap Spiritual", value: sem.rapor.sikap_spiritual },
                                            { label: "Sikap Sosial", value: sem.rapor.sikap_sosial },
                                          ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between border-b border-indigo-100 pb-1.5">
                                              <span className="text-gray-500 text-xs">{label}</span>
                                              <span className="font-medium text-gray-800 text-xs">{value ?? "—"}</span>
                                            </div>
                                          ))}
                                        </div>
                                        {sem.rapor.deskripsi_sikap && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            <strong>Deskripsi Sikap:</strong> {sem.rapor.deskripsi_sikap}
                                          </p>
                                        )}
                                        {sem.rapor.catatan_wali && (
                                          <p className="text-xs text-indigo-700 bg-indigo-100 rounded px-2 py-1 mt-1">
                                            <strong>Catatan Wali:</strong> {sem.rapor.catatan_wali}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {sem.data_nilai_siswa.length === 0 && !sem.rapor && (
                                      <p className="text-center text-gray-400 text-sm py-4">Belum ada data nilai pada semester ini.</p>
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
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriRaporSiswa;