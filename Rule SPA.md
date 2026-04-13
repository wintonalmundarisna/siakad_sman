SPA: Jadwal Pelajaran:
1. print lembaran angket untuk siswa kelas 10 menuju 11 memilih mapel pilihan. ketentuan angket adalah maksimal pilih 3 mapel dengan 2 serumpun dan 1 berbeda rumpun, minimalnya pilih 1 mapel
2. Setelah itu sortir angket sesuai pilihan, misal tim A untuk mayoritas Pilihan: bahasa, bahasa, sains, tim B untuk mayoritas pilihan: sains, sains, bahasa.
3. Setelah disortir, buat rombel XI-A-1 untuk tim A, dan XI-A-2 untuk tim B.
4. Lalu buat jadwal sesuai mapel yang masuk ke dalam rombel. Guru yang mapelnya (misal: B. jepang) tidak masuk ke dalam rombel tidak dibuatkan jadwal mapelnya (misal B. jepang), melainkan dialihkan mengajar mapel lain (baik mapel yang kelebihan peminat maupun yang tidak) atau menjadi pembina dan pelatih ekskul
5. Setelah jadwal jadi, isi tabel beban_kerja_guru untuk mencatat tugas dan jp guru secara manual.


Kurikulum_mata_pelajaran:
Baca di pdf catatan


======================================================================================================================================================================================================================
Berikut Perubahan yang Terjadi: (Yang atas gausa dibaca)

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
N.A.M.B.A.H

- Absensi Pegawai             : ✅ Data Select
- Absensi Guru - Pelajaran    : ✅ Data Select
- Absensi Siswa - Pelajaran   : ✅ Data Select
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
H.A.P.U.S:

- Identitas Sekolah :   ✅ Get Detail  : Karna satu sekolah hanya boleh satu identitas (http://127.0.0.1:8000/api/spa/identitas-sekolah/7)

- Ruangan           :   ✅ Get All     : Karna Gedung: Get All sudah mewakili (http://127.0.0.1:8000/api/spa/ruangan)
                        ✅ Data Select : Karna create dan update ruangan berada di detail gedung, bisa menggunakan id gedung yang sedang di get

- PSB               :   ✅ Import Excel : Karna memang tidak diperlukan (http://127.0.0.1:8000/api/import-data-psb)
                        ✅ Import Berkas: Karna memang tidak diperlukan (http://127.0.0.1:8000/api/import-berkas-zip)

- Rombel            :   ✅ Get All     : Karna detail kelas sudah mewakili (http://127.0.0.1:8000/api/spa/rombel)
                        ✅ Data Select : kelas dihapus dari data select karna posisi create ada di detail kelas (bisa pakai id kelas yang sedang di get)

- Wali Rombel       :   ✅ Data Select : Rombel dihapus dari data select karna posisi create sudah ada di detail tahun aktif rombel (bisa pakai id rombel yang sedang di get)
 
- Siswa Rombel      :   ✅ Data Select : Rombel dihapus dari data select karna posisi create sudah ada di detail tahun aktif rombel (bisa pakai id rombel yang sedang di get)
  
- Guru - Jadwal     :   ✅ Data Select : Rombel dihapus dari data select karna posisi create sudah ada di detail tahun aktif rombel (bisa pakai id rombel yang sedang di get)

- TahunAkademik     :   ✅ Get Detail  : Detail dihapus karna get all sudah mencukupi (http://127.0.0.1:8000/api/spa/tahun-akademik/1)

- Semester          :   ✅ Get All     : All dihapus Karna get all tahun akademik sudah mencukupi (http://127.0.0.1:8000/api/spa/semester)
                        ✅ Get Detail  : Detail dihapus Karna get all tahun akademik sudah mencukupi (http://127.0.0.1:8000/api/spa/semester/1)
                        ✅ Data Select : Data select dihapus karna get all tahun akademik sudah membawa id

- Atp Master        :   ✅ Get all     : All dihapus Karna get detail kompetensi sudah mencukupi (http://127.0.0.1:8000/api/spa/atp-master)
                        ✅ Get detail  : Detail dihapus Karna get detail kompetensi sudah mencukupi http://127.0.0.1:8000/api/spa/atp-master/1
                        ✅ Data Select : Data select dihapus karna get detail kompetensi sudah membawa id (http://127.0.0.1:8000/api/spa/data-select/atp-master)

- Pembina-Ekskul    :   ✅ Data Select : Eskul dihapus dari data select karena posisi create pembina sudah ada di detail ekskul (bisa pakai id ekskul yang sedang di detail)
  
- Pelatih-Ekskul    :   ✅ Data Select : Eskul dihapus dari data select karena posisi create pelatih sudah ada di detail ekskul (bisa pakai id ekskul yang sedang di detail)
  
- Siswa - Ekskul    :   ✅ Data Select : Eskul dihapus dari data select karena posisi create siswa ekskul sudah ada di detail ekskul (bisa pakai id ekskul yang sedang di detail)
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
U.B.A.H:

- Super Admin               : ✅ Get Detail Diri Sendiri  | Sudah diperbaiki
                              

- Gedung                    : ✅ Get Detail               | Hasil json berubah, ruangan lebih disederhanakan

- Kepegawaian               : ✅ Get All                  | Penentuan Role

- Siswa                     : ✅ Get All                  | Penentuan tahun

- Kelas                     : ✅ Get Detail               | Mengubah isi detail

- TahunAkademik             : ✅ Get All                  | Melengkapi semester

- KurikulumMataPelajaran    : ✅ Get All                  | Penentuan Tipe Kurikulum

- Kompetensi                : ✅ Data Select              | Berisi list kurikulumMataPelajaran
                              ✅ Create                   | Ganti kurikulum_id dan mata_pelajaran_id menjadi kurikulum_mata_pelajaran_id
                              ✅ Get all                  | Penentuan kurikulum_mata_pelajaran
                              ✅ Get Detail               | Perubahan pada output json "id" menjadi "kompetensi_id"
                              ✅ Update                   | Ganti kurikulum_id dan mata_pelajaran_id menjadi kurikulum_mata_pelajaran_id
                              ✅ Tabel                    | Mengubah kolom kurikulum_id dan kompetensi_id menjadi kurikulum_mata_pelajaran_id pada tabel kompetensi
                              ✅ Wajib                    | Cek semua API Kompetensi (soalnya yang berubah kolom tabelnya)

- Rombel                    : ✅ Detail Histori           | Penentuan tahun

- Wali Rombel               : ✅ Histori Menjadi Wali     | Penentuan tahun
  
- Guru Jadwal Pelajaran     : ✅ Get All                  | Penentuan tahun
                              ✅ Histori Jadwal           | Penentuan tahun
  
- Absensi Pegawai           : ✅ Get All                  | Penentuan tahun dan semester
                              ✅ Histori Absensi          | Penentuan guru dan tahun

- Absensi Guru - Pelajaran  : ✅ Get All                  | Penentuan tahun dan semester
                              ✅ Histori absensi          | Penentuan Guru dan Tahun

- Absensi Siswa-Pelajaran   : ✅ Get All                  | Penentuan tahun dan semester
                              ✅ Histori Absensi          | Penentuan siswa dan tahun
                              ✅ Export ke excel          | Penentuan tahun dan semester (gajadi per id, tapi langsung semua siswa dalam semester dan tahun yang telah ditentukan)
                            
- Ekstrakurikuler           : ✅ Get Detail Ekskul        | Penentuan tahun

- Data Nilai Siswa          : ✅ Leger dan Exportnya      | Penentuan tahun dan semester

- Prestasi                  : ✅ All Per Periode          | Penentuan tahun dan semester
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


      ___
      | |
      | |
      | |
      | |
      | |
    __| |__
    \     /
      \  /
       \/



Alur (Ikuti alur ini agar tidak bingung)

SPA:

- ✅ Cache Cleaner

--------------------------------------------------------------------------------

- ✅Register

--------------------------------------------------------------------------------

- ✅Login

--------------------------------------------------------------------------------

- ✅ Get Detail Diri
  - Logout
  - Ubah Pass Diri
  - Update Diri
  - Lupa Pass

--------------------------------------------------------------------------------

- ✅identitas sekolah
  - CRUD

--------------------------------------------------------------------------------

- ✅Gedung
  - CRUD
  - Pada halaman detail gedung, berikan button "tambah ruangan" (silakan gunakan id gedung yang sedang di get sebagai data select)
    - Masing-masing ruangan diberi button "detail", "update", dan "delete" yang mengarah ke Ruangan: Get Detail, Update, dan Delete. (gunakan id gedung yang sedang di get untuk data select)

--------------------------------------------------------------------------------

- ✅ Kepegawaian
  - Guru
    - Ubah Password
    - Create
    - Update
    - Delete
    - Get All
    - Get Detail => kasih aja button di detail buat ngelink ke bawah ini
      - ❌ Wali rombel                     : histori menjadi wali
      - Guru jadwal pelajaran           : histori jadwal
      - ❌ Absensi pegawai                 : histori absensi
      - ❌ Absensi guru - pelajaran        : histori absensi
      - ❌ Pembina eksktrakurikuler        : Histori membina
      - ❌ Pelatih ekstrakurikuler         : Histori melatih

  - Staff
    - Ubah Password
    - Create
    - Update
    - Delete
    - Get All
    - Get Detail => kasih aja button di detail buat ngelink ke bawah ini      
      - ❌ Absensi pegawai                 : histori absensi      
      - ❌ Pembina eksktrakurikuler        : Histori membina
      - ❌ Pelatih ekstrakurikuler         : Histori melatih        

--------------------------------------------------------------------------------

- ✅ Penerimaan Siswa Baru
  - ❌ CRUD
  - ✅ Export  

--------------------------------------------------------------------------------

- ✅ Siswa
  - Ubah Pass
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail => Kasih button di halaman detail buat ngelink ke bawah ini
    - ❌ Siswa rombel                    : Histori rombel
    - ❌ Siswa jadwal pelajaran          : Histori jadwal
    - ❌ Absensi Siswa - Pelajaran       : Histori absensi
    - ❌ Siswa - Ekstrakurikuler         : Histori ikut ekskul
    - ❌ Prestasi                        : Histori prestasi
    - ☑️❌ Data Nilai Siswa              : Histori Rapor

--------------------------------------------------------------------------------

- ✅ Jurusan
  - CRUD
  - Pada halaman detail, masing-masing rombel dikasih button untuk diarahkan ke Rombel: Detail Tahun Aktif

--------------------------------------------------------------------------------

- ✅ Kelas
  - CRUD
  - Get Detail (halaman baru untuk show detail kelas):
    - Kasih button create rombel di halaman detail kelas ini ==> Rombel: Create
    - Masing masing rombel dikasih button update, delete, detail ==> Rombel: Update, Delete, Detail Tahun Aktif
    - Saat klik detail rombel maka masuk ke halaman **(detail rombel)** ==> Rombel: Detail Tahun Aktif (diliat ini hasil runnya gimana)
      - Kalo belum ada data, kosongin halaman atau beri pesan "belum ada data pada tahun ini"
      - mau ada data atau engga, buat button Create wali di halaman ini **(detail rombel)** ==> Wali Rombel: Create (gunakan id rombel yang sedang di get, data select pakai yang ada di wali rombel)
        - after create wali nanti muncul list wali pada halaman ini **(detail rombel)**, kasih button update dan delete
      - Mau ada data atau engga, buat button create siswa rombel sebelah create wali di halaman ini **(detail rombel)** ==> Siswa Rombel: Create
        - After create siswa nanti muncul list siswa pada halaman ini, kasih button update dan delete masing-masingnya
      - Mau ada data atau engga, buat button create guru jadwal pelajaran di halaman ini ==> Guru Jadwal Pelajaran: create
        - After create jadwal nanti muncul list jadwal pada halaman ini, kasih button update dan delete
      - ❌ Mau ada data atau engga, buat button sebelah tulisan "Informasi Rombel" untuk lihat histori per periode ==> Rombel: Detail Histori            

--------------------------------------------------------------------------------

- ✅ Kurikulum
  - CRUD
  - Pada halaman detail, kasih button "Lihat Mata Pelajaran" buat mengarah ke:
    - Kurikulum Mata Pelajaran: Get All (gunakan id kurikulum yang sedang di get)    

--------------------------------------------------------------------------------

- ✅ Mata Pelajaran (Master Data)
  - CRUD  

--------------------------------------------------------------------------------

- ✅ Tahun Akademik
  - Create
  - Update
  - Delete
  - Get Detail: Akan dihapus dari backend karna get all sudah mencukupi
  - Get All: Bikin jadi card/tabel, tahun dan semester satu paket, lalu masing-masing card diberi button dibawah ini:
    - Semester
      - Kasih button create semester di masing-masing card tahun akademik (gunakan id tahun yang sedang di get)
      - kasih button update dan delete pada masing-masing semester      

--------------------------------------------------------------------------------

- ✅ Kurikulum_mata_pelajaran
  - CRUD
  - Pada halaman detail, kasih button "Lihat Kompetensi" untuk mengarah ke Kompetensi: Get All    

--------------------------------------------------------------------------------

- ✅ Kompetensi:
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail => 
    - Pada view detail ini, buat button untuk "tambah atp" (gunakan id kompetensi yang sedang di get sebagai data select)
    - Pada masing-masing atp, diberi button update dan delete
    - hati-hati, atp_master hanya tersedia jika kompetensi jenisnya = CP, kalo jenisnya = KD maka tidak tersedia (jangan adakan button tambah atp pada detail kompetensi yang jenis = KD)

--------------------------------------------------------------------------------

- ✅ Guru jadwal pelajaran
  - Get all: Ini buat memudahkan admin ngecek kebenaran semua jadwal tanpa harus liat rombel satu persatu
  - ☑️ Pertemuan
    - Letakkan button "lihat pertemuan" di masing masing jadwal guru dan siswa
      - Letakkan button "lihat jurnal kbm", "Lihat Materi", "Lihat Forum Diskusi", dan "lihat tugas" secara sejajar pada masing masing pertemuan
        - Letakkan button "lihat hasil pengumpulan tugas" pada di dalam button "lihat tugas"
  
--------------------------------------------------------------------------------

- ✅ Alur Tujuan Pembelajaran (Penerapan ATP Master) => Jadi guru consume atp_master per semester, nanti spa yang pantau apakah cocok diterapkan pada semester ini atau tidak
  - Get All Diajukan
    - Kasih button "disetujui" dan "ditolak" pada masing-masing atp
  - Get all disetujui
    - Kasih button "batal disetujui" pada masing-masing atp

--------------------------------------------------------------------------------

- ✅ Absensi Pegawai (yang histori absensi jangan, karna di guru udah)
  - CRUD

-------------------------------------------------------------------------------
- ✅ Absensi Guru - Pelajaran (yang histori jangan)
  - CRUD

--------------------------------------------------------------------------------

- ✅ Absensi siswa - Pelajaran (yang histori jangan)
  - CRUD

--------------------------------------------------------------------------------

- ✅ Ekstrakurikuler
  - CRUD
  - Detail:
    - Pada halaman detail ekskul, tambahkan button "tambah pembina" yang mengarah ke => Pembina Ekskul: Menjadikan Pembina
      - After create nanti balik ke halaman detail ekstrakurikuler dan tampil siapa pembinanya per periode, kasih button update dan delete pada masing-masingnya (histori membina jangan dibuat kerna sudah ada di kepegawaian atas)
    - Pada halaman detail ekskul, tambahkan button "tambah pelatih" yang mengarah ke => Pelatih Ekskul: Menjadikan Pelatih
      - After create nanti balik ke halaman detail ekstrakurikuler dan tampil siapa pelatihnya per periode, kasih button update dan delete pada masing-masingnya (histori jangan)
    - Pada halaman detail ekskul, tambahkan button "tambah siswa" yang mengarah ke => Siswa Ekskul: Siswa didaftarkan ekskul
      - After create nanti balik ke halaman detail ekstrakurikuler dan tampil siapa siswanya per periode, kasih button update dan delete pada masing-masingnya (histori jangan)

--------------------------------------------------------------------------------

- ✅ Prestasi
  - CRUD (yang histori jangan karna di siswa atas sudah ada)

--------------------------------------------------------------------------------

- ☑️ Data Nilai Siswa:

--------------------------------------------------------------------------------

- ✅ Keuangan

--------------------------------------------------------------------------------

- ✅ Data Berkas



      ___  
      | |
      | |
      | |
      | |
      | |
    __| |__
    \     /
      \  /
       \/




<!-- Urutan -->

// Data Master (Dibuat sekali)
- Register

- Login

- Identitas Sekolah

- Gedung
    Ruangan

- Jurusan

- Mata Pelajaran

- Kurikulum
    Kurikulum Mata Pelajaran    
        Kompetensi
            Atp master
            
- Kepegawaian
    Guru
    Staff

- Siswa


// Data Akademik (Harus dikelola tiap tahun / semester)
- Tahun Akademik
    Semester

- Penerimaan Siswa Baru

- Kelas
    Rombel

- Guru - Jadwal Pelajaran
  - ☑️ Pertemuan

- Alur Tujuan Pembelajaran (Consume ATP Master)

- Ekstrakurikuler
    Siswa Ekskul
    Pembina
    Pelatih

    
// Data Laporan Umum
- Absensi Pegawai

- Absensi Guru - Pelajaran

- Absensi 

- Prestasi

- ☑️ Data Nilai Siswa

- Keuangan
