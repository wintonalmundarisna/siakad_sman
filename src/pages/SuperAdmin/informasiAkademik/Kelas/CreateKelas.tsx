import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  nama_kelas?: string[];
  kode_kelas?: string[];
  tingkat?: string[];
}

const CreateKelas = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({ nama_kelas: "", kode_kelas: "", tingkat: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validasi frontend
    const newErrors: FormErrors = {};
    if (!formData.nama_kelas.trim()) newErrors.nama_kelas = ["Nama kelas wajib diisi"];
    if (!formData.kode_kelas.trim()) newErrors.kode_kelas = ["Kode kelas wajib diisi"];
    if (!formData.tingkat) newErrors.tingkat = ["Tingkat kelas wajib dipilih"];
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/spa/kelas", {
        nama_kelas: formData.nama_kelas,
        kode_kelas: formData.kode_kelas,
        tingkat: Number(formData.tingkat),
      });

      if (res.data.status === "success") {
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Data kelas berhasil ditambahkan.", showConfirmButton: false, timer: 1800 });
        navigate("/superadmin/informasi-akademik/kelas");
      }
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 422 && data?.errors) {
        setErrors(data.errors);
      } else {
        Swal.fire({ icon: "error", title: "Koneksi gagal!", text: data?.message || "Tidak dapat terhubung ke server." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kelas</h1>
          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>

              {/* Nama Kelas */}
              <div className="mb-6">
                <label htmlFor="nama_kelas" className="block font-semibold text-foreground">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama_kelas" type="text" placeholder="Contoh: X, XI, XII"
                  value={formData.nama_kelas}
                  onChange={(e) => { setFormData({ ...formData, nama_kelas: e.target.value }); setErrors({ ...errors, nama_kelas: undefined }); }}
                  className={`border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.nama_kelas ? "border-red-500" : ""}`}
                />
                {errors.nama_kelas && <p className="text-red-500 text-sm mt-1">{errors.nama_kelas[0]}</p>}
              </div>

              {/* Kode Kelas */}
              <div className="mb-6">
                <label htmlFor="kode_kelas" className="block font-semibold text-foreground">
                  Kode Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  id="kode_kelas" type="text" placeholder="Contoh: K10, K11, K12"
                  value={formData.kode_kelas}
                  onChange={(e) => { setFormData({ ...formData, kode_kelas: e.target.value }); setErrors({ ...errors, kode_kelas: undefined }); }}
                  className={`border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.kode_kelas ? "border-red-500" : ""}`}
                />
                {errors.kode_kelas && <p className="text-red-500 text-sm mt-1">{errors.kode_kelas[0]}</p>}
              </div>

              {/* Tingkat */}
              <div className="mb-6">
                <label htmlFor="tingkat" className="block font-semibold text-foreground">
                  Tingkat <span className="text-red-500">*</span>
                </label>
                <select
                  id="tingkat" value={formData.tingkat}
                  onChange={(e) => { setFormData({ ...formData, tingkat: e.target.value }); setErrors({ ...errors, tingkat: undefined }); }}
                  className={`border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.tingkat ? "border-red-500" : ""}`}
                >
                  <option value="">Pilih Tingkat</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                {errors.tingkat && <p className="text-red-500 text-sm mt-1">{errors.tingkat[0]}</p>}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} /> {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Link to="/superadmin/informasi-akademik/kelas">
                  <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                    <CircleXIcon size={18} /> Batal
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateKelas;