/**
 * EditSemester
 * Route: /superadmin/informasi-akademik/semester/edit/:id
 *
 * CATATAN: GET /spa/semester/:id di-comment di backend → tidak tersedia.
 * Prefill dari GET /spa/tahun-akademik (list) → cari semester by id dari nested semesters.
 * Redirect setelah berhasil/batal → /tahun-akademik
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, FilePenLine, Loader2Icon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  semester?: string[];
  status?: string[];
  data?: string[];
}

const EditSemester = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialStatus, setInitialStatus] = useState("");
  const [tahunAkademikStatus, setTahunAkademikStatus] = useState("");
  const [tahunAkademikLabel, setTahunAkademikLabel] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    semester: "",
    status: "aktif",
  });

  const backUrl = "/superadmin/informasi-akademik/tahun-akademik";

  // ── Fetch dari list ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      navigate(backUrl);
      return;
    }

    api
      .get("/spa/tahun-akademik")
      .then((res) => {
        if (res.data.status === "success") {
          let found: any = null;
          let foundTA: any = null;

          for (const ta of res.data.data) {
            const sem = ta.semesters.find((s: any) => s.semester_id === Number(id));
            if (sem) {
              found = sem;
              foundTA = ta;
              break;
            }
          }

          if (found && foundTA) {
            setFormData({
              semester: found.semester || "",
              status: found.status_semester || "aktif",
            });
            setInitialStatus(found.status_semester || "aktif");
            setTahunAkademikStatus(foundTA.status_tahun_akademik || "aktif");
            setTahunAkademikLabel(foundTA.tahun_akademik || "");
          } else {
            Swal.fire({ icon: "error", title: "Data tidak ditemukan!" });
            navigate(backUrl);
          }
        }
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "Gagal memuat data!" });
        navigate(backUrl);
      })
      .finally(() => setLoadingPage(false));
  }, [id]);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await api.put(`/spa/semester/${id}`, formData);
      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Semester berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const httpStatus = err.response?.status;
      const errData = err.response?.data;

      if (httpStatus === 422 && errData?.errors) {
        if (errData.errors.status) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah status!",
            text: Array.isArray(errData.errors.status) ? errData.errors.status[0] : errData.errors.status,
          });
        } else if (errData.errors.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah data!",
            text: Array.isArray(errData.errors.data) ? errData.errors.data[0] : errData.errors.data,
          });
        } else {
          setErrors(errData.errors);
        }
      } else if (httpStatus === 404) {
        Swal.fire({ icon: "error", title: "Data tidak ditemukan!" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: errData?.message || "Tidak dapat terhubung ke server.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = tahunAkademikStatus === "arsip" || initialStatus === "arsip";

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loadingPage) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit Semester" />
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2Icon className="animate-spin mb-3" size={32} />
            <p className="font-medium">Memuat data...</p>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Semester" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Semester</h1>
              {tahunAkademikLabel && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tahun Akademik: <strong>{tahunAkademikLabel}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Semester */}
              <div>
                <label className="block font-semibold mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.semester}
                  onValueChange={(v) => {
                    setFormData({ ...formData, semester: v });
                    setErrors({ ...errors, semester: undefined });
                  }}
                  disabled={tahunAkademikStatus === "arsip"}
                >
                  <SelectTrigger className={`w-full ${errors.semester ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="-- pilih semester --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Semester</SelectLabel>
                      <SelectItem value="Ganjil">Ganjil</SelectItem>
                      <SelectItem value="Genap">Genap</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester[0]}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => {
                    setFormData({ ...formData, status: v });
                    setErrors({ ...errors, status: undefined });
                  }}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={`w-full ${errors.status ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="-- pilih status --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Status</SelectLabel>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="arsip">Arsip</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              {/* Info & Peringatan */}
              {tahunAkademikStatus === "arsip" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <p>Tahun akademik untuk semester ini sudah diarsipkan. Data tidak dapat diubah.</p>
                </div>
              )}

              {initialStatus === "arsip" && tahunAkademikStatus !== "arsip" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <p>Semester yang sudah diarsipkan tidak dapat diubah statusnya kembali ke aktif.</p>
                </div>
              )}

              {formData.status === "arsip" && initialStatus === "aktif" && tahunAkademikStatus !== "arsip" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Setelah diarsipkan, status tidak dapat dikembalikan ke aktif</li>
                    <li>Pastikan semua data terkait sudah sesuai</li>
                  </ul>
                </div>
              )}

              {/* Tombol */}
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={loading || tahunAkademikStatus === "arsip"} className="bg-primary gap-2">
                  <FilePenLine size={16} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button type="button" className="gap-2 bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => navigate(backUrl)}>
                  <CircleXIcon size={16} /> Batal
                </Button>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditSemester;
