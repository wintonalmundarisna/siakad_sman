/**
 * CreateTahunAkademik
 * Route: /superadmin/informasi-akademik/tahun-akademik/create
 *
 * Backend: POST /spa/tahun-akademik
 *  - Field: tahun_akademik (required, unique), keterangan (nullable)
 *  - Status otomatis = aktif
 *  - Cek: tidak boleh ada TA aktif lain
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, FilePlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  tahun_akademik?: string[];
  keterangan?: string[];
}

const CreateTahunAkademik = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    tahun_akademik: "",
    keterangan: "",
  });

  const backUrl = "/superadmin/informasi-akademik/tahun-akademik";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.tahun_akademik.trim()) {
      setErrors({ tahun_akademik: ["Tahun akademik wajib diisi"] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/spa/tahun-akademik", formData);
      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Tahun akademik berhasil ditambahkan.",
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
            title: "Tidak dapat membuat tahun akademik!",
            text: Array.isArray(errData.errors.pesan) ? errData.errors.pesan[0] : errData.errors.pesan,
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

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Tahun Akademik" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Tambah Tahun Akademik</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Tahun Akademik */}
              <div>
                <label className="block font-semibold mb-1">
                  Tahun Akademik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth: 2025/2026"
                  value={formData.tahun_akademik}
                  onChange={(e) => {
                    setFormData({ ...formData, tahun_akademik: e.target.value });
                    setErrors({ ...errors, tahun_akademik: undefined });
                  }}
                  className={`border rounded w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.tahun_akademik ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.tahun_akademik && <p className="text-red-500 text-sm mt-1">{errors.tahun_akademik[0]}</p>}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold mb-1">
                  Keterangan <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan tahun akademik..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="border border-gray-300 rounded w-full p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Status otomatis menjadi <strong>Aktif</strong>
                  </li>
                  <li>Pastikan tidak ada tahun akademik lain yang masih aktif</li>
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

export default CreateTahunAkademik;
