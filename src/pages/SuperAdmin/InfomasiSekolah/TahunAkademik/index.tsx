/**
 * DataTahunAkademik
 * Route: /superadmin/informasi-sekolah/tahun-akademik
 *
 * Menggabungkan Tahun Akademik + Semester dalam satu halaman berbentuk card.
 * Semester tampil inline di dalam card tahun akademiknya masing-masing.
 *
 * Backend endpoint yang dipakai:
 *  - GET  /spa/tahun-akademik            → list semua TA + semester nested
 *  - DELETE /spa/tahun-akademik/:id      → hapus TA
 *  - DELETE /spa/semester/:id            → hapus semester
 *
 * Catatan:
 *  - GET /spa/tahun-akademik/:id di-comment di backend → TIDAK dipakai
 *  - Edit TA  → navigate ke /edit/:id, prefill dari list yang sudah ada
 *  - Edit Semester → navigate ke /semester/edit/:id, prefill dari list
 *  - Create Semester → navigate ke /semester/create?tahun_akademik_id=X
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Footer from "@/pages/Footer";
import { Loader2Icon, PlusIcon, PenBoxIcon, Trash2Icon, SearchIcon, CalendarIcon, BookOpenIcon } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SemesterItem {
  semester_id: number;
  semester: string;
  status_semester: string;
}

interface TahunAkademikItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  semesters: SemesterItem[];
}

// ── Badge helpers ─────────────────────────────────────────────────────────────
const statusBadge = (status: string) => (status === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100");

const semesterBadge = (semester: string) => (semester === "Ganjil" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-purple-100 text-purple-700 hover:bg-purple-100");

// ── Component ──────────────────────────────────────────────────────────────────
const DataTahunAkademik = () => {
  // const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<TahunAkademikItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/spa/tahun-akademik");
      if (res.data.status === "success") {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (err: any) {
      // 400/error jika belum ada semester → data kosong, bukan fatal
      if (err.response?.status === 400) {
        setData([]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: err.response?.data?.message || "Tidak dapat memuat data.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Delete Tahun Akademik ─────────────────────────────────────────────────────
  const handleDeleteTA = async (taId: number, tahun: string) => {
    const ok = await Swal.fire({
      title: "Hapus Tahun Akademik?",
      html: `Tahun akademik <strong>${tahun}</strong> akan dihapus permanen.<br><small class="text-gray-500">Tidak bisa dihapus jika sudah ada semester.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!ok.isConfirmed) return;

    try {
      await api.delete(`/spa/tahun-akademik/${taId}`);
      setData((prev) => prev.filter((d) => d.tahun_akademik_id !== taId));
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Tahun akademik berhasil dihapus.",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    }
  };

  // ── Delete Semester ───────────────────────────────────────────────────────────
  const handleDeleteSemester = async (semId: number, semNama: string, taId: number) => {
    const ok = await Swal.fire({
      title: "Hapus Semester?",
      html: `Semester <strong>${semNama}</strong> akan dihapus permanen.<br><small class="text-gray-500">Tidak bisa dihapus jika sudah dipakai jadwal/berkas.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!ok.isConfirmed) return;

    try {
      await api.delete(`/spa/semester/${semId}`);
      // Update state lokal — hapus semester dari card TA yang bersangkutan
      setData((prev) => prev.map((d) => (d.tahun_akademik_id === taId ? { ...d, semesters: d.semesters.filter((s) => s.semester_id !== semId) } : d)));
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Semester berhasil dihapus.",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    }
  };

  // ── Search filter ─────────────────────────────────────────────────────────────
  const filteredData = data.filter((d) => (searchTerm.trim() === "" ? true : d.tahun_akademik.toLowerCase().includes(searchTerm.toLowerCase())));

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tahun Akademik & Semester" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tahun Akademik & Semester</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* ── Toolbar ── */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-3">
                <Link to="/superadmin/informasi-sekolah/tahun-akademik/create">
                  <Button className="bg-primary gap-2">
                    <PlusIcon size={16} />
                    Tambah Tahun Akademik
                  </Button>
                </Link>
                <div className="relative w-full md:w-72">
                  <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <Input placeholder="Cari tahun akademik..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
              </div>

              {/* ── Cards ── */}
              {filteredData.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-lg">Tidak ada data tahun akademik</p>
                  <p className="text-sm mt-1">{searchTerm ? "Coba kata kunci lain." : 'Klik "Tambah Tahun Akademik" untuk memulai.'}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredData.map((ta) => (
                    <div key={ta.tahun_akademik_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* ── Header Card Tahun Akademik ── */}
                      <div className="flex items-center justify-between px-5 py-4 bg-primary">
                        <div className="flex items-center gap-3">
                          <CalendarIcon size={20} className="text-white/80" />
                          <div>
                            <h2 className="text-white font-bold text-lg leading-tight">{ta.tahun_akademik}</h2>
                            <Badge className={`mt-0.5 text-xs ${ta.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 hover:bg-green-200" : "bg-white/20 text-white hover:bg-white/20"}`}>{ta.status_tahun_akademik}</Badge>
                          </div>
                        </div>

                        {/* Aksi Tahun Akademik */}
                        <div className="flex items-center gap-2">
                          <Link to={`/superadmin/informasi-sekolah/tahun-akademik/edit/${ta.tahun_akademik_id}`}>
                            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-1.5">
                              <PenBoxIcon size={14} />
                              Edit
                            </Button>
                          </Link>
                          <Button size="sm" className="bg-white/20 hover:bg-red-500 text-white border border-white/30 gap-1.5" onClick={() => handleDeleteTA(ta.tahun_akademik_id, ta.tahun_akademik)}>
                            <Trash2Icon size={14} />
                            Hapus
                          </Button>
                        </div>
                      </div>

                      {/* ── Semester Section ── */}
                      <div className="p-5">
                        {/* Header semester + tombol tambah */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <BookOpenIcon size={16} className="text-primary" />
                            <h3 className="font-semibold text-gray-800 text-sm">
                              Semester
                              <span className="ml-2 text-gray-400 font-normal">({ta.semesters.length} terdaftar)</span>
                            </h3>
                          </div>
                          <Link to={`/superadmin/informasi-sekolah/semester/create?tahun_akademik_id=${ta.tahun_akademik_id}`}>
                            <Button size="sm" className="bg-primary gap-1.5" disabled={ta.status_tahun_akademik === "arsip"} title={ta.status_tahun_akademik === "arsip" ? "Tahun akademik sudah diarsipkan" : "Tambah semester"}>
                              <PlusIcon size={13} />
                              Tambah Semester
                            </Button>
                          </Link>
                        </div>

                        {/* List Semester */}
                        {ta.semesters.length === 0 ? (
                          <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-sm">Belum ada semester untuk tahun akademik ini.</p>
                            {ta.status_tahun_akademik !== "arsip" && <p className="text-xs mt-1">Klik "Tambah Semester" untuk menambahkan.</p>}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ta.semesters.map((sem) => (
                              <div key={sem.semester_id} className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-100/70 transition-colors">
                                {/* Info semester */}
                                <div className="flex items-center gap-3">
                                  <Badge className={semesterBadge(sem.semester)}>{sem.semester}</Badge>
                                  <Badge className={statusBadge(sem.status_semester)}>{sem.status_semester}</Badge>
                                </div>

                                {/* Aksi Semester */}
                                <div className="flex gap-1.5">
                                  <Link to={`/superadmin/informasi-sekolah/semester/edit/${sem.semester_id}`}>
                                    <Button size="sm" className="bg-primary" title="Edit semester">
                                      <PenBoxIcon size={13} />
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    className="bg-muted-foreground hover:bg-muted-foreground/90"
                                    title="Hapus semester"
                                    disabled={sem.status_semester === "arsip"}
                                    onClick={() => handleDeleteSemester(sem.semester_id, sem.semester, ta.tahun_akademik_id)}
                                  >
                                    <Trash2Icon size={13} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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

export default DataTahunAkademik;
