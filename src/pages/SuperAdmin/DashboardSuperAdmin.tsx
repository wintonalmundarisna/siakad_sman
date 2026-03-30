import { useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "../Footer";
import { Trash2, Loader2 } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

export const DashboardSuperAdmin = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleClearCache = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Clear Cache?",
      text: "Yakin ingin membersihkan cache?",
      showCancelButton: true,
      confirmButtonText: "Ya, bersihkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4F46E5",
    });

    if (!confirm.isConfirmed) return;

    setIsClearingCache(true);
    try {
      const response = await api.get("/cache-cleaner");
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: response.data.message || "Cache berhasil dibersihkan",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat membersihkan cache",
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <main
        className={`
    w-full min-h-screen bg-background transition-all duration-300
    ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}
  `}
      >
        <PageTitle title="Dashboard Super Admin" />

        {/* konten */}
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4">Dashboard Super Admin</h1>
          <p className="text-muted-foreground mb-6">Deskripsi singkat tentang sekolah, jumlah siswa, dan statistik lainnya...</p>

          {/* Tombol Clear Cache */}
          <div className="flex justify-end mb-4">
            <Button onClick={handleClearCache} disabled={isClearingCache} className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 shadow">
              {isClearingCache ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Membersihkan...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Bersihkan Cache
                </>
              )}
            </Button>
          </div>

          {/* contoh card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="text-lg font-semibold">Jumlah Siswa</h3>
              <p className="text-3xl font-bold mt-2 text-primary">850</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="text-lg font-semibold">Jumlah Guru</h3>
              <p className="text-3xl font-bold mt-2 text-primary">56</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="text-lg font-semibold">Jumlah Staff</h3>
              <p className="text-3xl font-bold mt-2 text-primary">24</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};
