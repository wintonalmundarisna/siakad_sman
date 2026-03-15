/**
 * CreateSemester
 * Route: /superadmin/informasi-sekolah/semester/create?tahun_akademik_id=X
 *
 * Backend SemesterController::store():
 *  - Tidak perlu kirim tahun_akademik_id (backend ambil TA aktif sendiri)
 *  - Field: semester (Ganjil/Genap)
 *  - Tapi karena dipanggil dari card TA tertentu, kita tetap tampilkan
 *    info TA mana yang sedang ditambah semestrnya (dari query param)
 *
 * Redirect setelah berhasil/batal → /tahun-akademik
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  semester?: string[];
  pesan?: string[];
  data?: string[];
}

const CreateSemester = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTA, setLoadingTA] = useState(true);
  const [tahunAkademikLabel, setTahunAkademikLabel] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({ semester: "" });

  const taIdParam = searchParams.get("tahun_akademik_id") || "";
  const backUrl = "/superadmin/informasi-sekolah/tahun-akademik";

  // Ambil nama TA dari list untuk ditampilkan sebagai info
  useEffect(() => {
    if (!taIdParam) {
      setLoadingTA(false);
      return;
    }

    api
      .get("/spa/tahun-akademik")
      .then((res) => {
        if (res.data.status === "success") {
          const found = res.data.data.find((d: any) => d.tahun_akademik_id === Number(taIdParam));
          if (found) setTahunAkademikLabel(found.tahun_akademik);
        }
      })
      .catch(() => {
        /* silent */
      })
      .finally(() => setLoadingTA(false));
  }, [taIdParam]);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.semester) {
      setErrors({ semester: ["Semester wajib dipilih"] });
      return;
    }

    setLoading(true);
    try {
      // Backend hanya butuh 'semester' — TA aktif diambil otomatis dari backend
      const res = await api.post("/spa/semester", { semester: formData.semester });

      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Semester berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const httpStatus = err.response?.status;
      const errData = err.response?.data;

      if (httpStatus === 400 || httpStatus === 422) {
        if (errData?.errors?.pesan) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat semester!",
            text: Array.isArray(errData.errors.pesan) ? errData.errors.pesan[0] : errData.errors.pesan,
          });
        } else if (errData?.errors?.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat semester!",
            text: Array.isArray(errData.errors.data) ? errData.errors.data[0] : errData.errors.data,
          });
        } else if (errData?.errors) {
          setErrors(errData.errors);
        }
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

  // ── Loading info TA ───────────────────────────────────────────────────────────
  if (loadingTA) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Tambah Semester" />
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2Icon className="animate-spin mb-3" size={32} />
            <p className="font-medium">Memuat...</p>
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
        <PageTitle title="Tambah Semester" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Tambah Semester</h1>
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
                    setFormData({ semester: v });
                    setErrors({ ...errors, semester: undefined });
                  }}
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

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Status otomatis menjadi <strong>Aktif</strong>
                  </li>
                  <li>
                    Semester akan dibuat pada tahun akademik yang sedang <strong>aktif</strong>
                  </li>
                  <li>Pastikan tidak ada semester lain yang masih aktif</li>
                </ul>
              </div>

              {/* Tombol */}
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={loading} className="bg-primary gap-2">
                  <FilePlus size={16} />
                  {loading ? "Menyimpan..." : "Simpan"}
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

export default CreateSemester;
