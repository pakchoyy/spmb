import type { Metadata } from "next";
import Link from "next/link";
import { Daftar, KerangkaHukum, Pasal } from "@/components/hukum";

export const metadata: Metadata = { title: "Syarat dan Ketentuan" };

export default function Syarat() {
  return (
    <KerangkaHukum judul="Syarat dan Ketentuan">
      <p>Dokumen ini mengatur penggunaan aplikasi SPMB Zone (&ldquo;Layanan&rdquo;) oleh sekolah. Dengan mendaftar atau memakai Layanan, pihak sekolah menyatakan setuju. Ketentuan bagi orang tua calon siswa ada di <Link className="tautan" href="/privasi">Kebijakan Privasi</Link>.</p>

      <Pasal no={1} judul="Pihak dan istilah">
        <Daftar butir={[
          <><b>Penyedia</b>: pemilik dan pengelola Layanan <mark>[DIISI: nama penyedia/badan usaha]</mark>.</>,
          <><b>Sekolah</b>: lembaga pendidikan yang mendaftar, diwakili admin sekolah.</>,
          <><b>Orang tua</b>: pihak yang mengisi form pendaftaran untuk anaknya di halaman sekolah.</>,
          <><b>Alamat halaman</b>: alamat halaman sekolah, misalnya <code>yukmasuk/nama-sekolah</code>.</>,
        ]} />
      </Pasal>

      <Pasal no={2} judul="Akun admin sekolah">
        <Daftar butir={[
          "Satu sekolah memiliki satu akun admin dengan satu email. Tidak ada fitur menambah admin.",
          "Email harus dikonfirmasi lewat link yang dikirim saat pendaftaran. Pendaftar menyatakan berwenang mewakili sekolah dan memakai email yang benar.",
          "Sekolah menjaga kerahasiaan kata sandi dan bertanggung jawab atas semua tindakan di akunnya.",
          "Mengganti email admin dilakukan atas permintaan ke Penyedia, yang berhak meminta bukti bahwa permintaan datang dari pihak sekolah.",
        ]} />
      </Pasal>

      <Pasal no={3} judul="Masa coba gratis">
        <p>Setiap sekolah baru mendapat masa coba gratis 7 hari sejak akunnya aktif, dengan semua fitur terbuka. Tidak diperlukan data pembayaran. Setelah masa coba habis dan tidak ada langganan, berlaku Pasal 5.</p>
      </Pasal>

      <Pasal no={4} judul="Langganan dan pembayaran">
        <Daftar butir={[
          <>Paket berlaku 1 tahun sejak aktivasi pertama. Harga tercantum di halaman Langganan dan di beranda, dalam rupiah <mark>[DIISI: apakah sudah termasuk pajak]</mark>.</>,
          "Pembelian dilakukan di platform Lynk dengan memakai email admin sekolah yang terdaftar. Pembayaran tidak diproses di dalam aplikasi.",
          "Setelah pembayaran, kode aktivasi (SPMB-XXXXX) dikirim ke email admin. Kode berlaku sekali pakai dan dimasukkan di menu Langganan.",
          "Perpanjangan menambah 1 tahun dari tanggal berakhir, sehingga sisa masa aktif tidak hangus.",
          "Penyedia mencocokkan email pembeli di Lynk dengan akun sekolah. Jika tidak cocok atau pembayaran tidak sah, Penyedia dapat membatalkan langganan dan menonaktifkan sekolah.",
          <>Pengembalian dana: <mark>[DIISI: kebijakan refund; ikuti juga ketentuan Lynk]</mark>.</>,
        ]} />
      </Pasal>

      <Pasal no={5} judul="Masa tenggang dan nonaktif">
        <Daftar butir={[
          "Setelah masa aktif atau masa coba berakhir, ada masa tenggang 3 hari: beranda admin hanya bisa dibaca dan form pendaftaran ditutup.",
          "Sesudahnya sekolah menjadi nonaktif: beranda admin dan form ditutup, sedangkan halaman informasi sekolah dan cek status tetap dapat dibuka.",
          "Data sekolah dan pendaftar tetap tersimpan. Sekolah dapat mengunduh seluruh data (Excel) pada masa tenggang maupun nonaktif.",
          "Langganan kembali berjalan setelah kode aktivasi baru dimasukkan, selama sekolah tidak dibatalkan atau dinonaktifkan oleh Penyedia.",
          <>Penyedia dapat menghapus data sekolah nonaktif setelah <mark>[DIISI: jangka waktu]</mark> dengan pemberitahuan lebih dulu ke email admin.</>,
        ]} />
      </Pasal>

      <Pasal no={6} judul="Alamat halaman (slug)">
        <Daftar butir={[
          "Slug ditentukan sekolah saat mendaftar, bersifat unik, terdiri dari huruf kecil, angka, dan tanda hubung (3–40 karakter), dan tidak boleh memakai kata yang dipesan sistem.",
          "Slug tidak boleh meniru, menyesatkan, atau mengaku sebagai sekolah atau lembaga lain.",
          "Slug dikunci setelah dibagikan. Perubahan dilakukan Penyedia atas permintaan sekolah; slug lama dialihkan ke slug baru agar QR yang sudah tercetak tetap berfungsi.",
          "Pengunjung dapat melaporkan halaman yang mencurigakan. Penyedia berhak menonaktifkan sekolah dan mencabut slug yang melanggar ketentuan ini.",
          <>Slug milik sekolah yang hanya mencoba dan tidak berlangganan dapat dilepas setelah <mark>[DIISI: jumlah bulan]</mark>.</>,
        ]} />
      </Pasal>

      <Pasal no={7} judul="Data pendaftar">
        <Daftar butir={[
          "Sekolah adalah pihak yang menentukan data apa yang dikumpulkan dan untuk apa. Penyedia memproses data atas nama sekolah untuk menjalankan Layanan.",
          "Sekolah menjamin memiliki dasar yang sah untuk mengumpulkan data calon siswa dan hanya meminta data yang perlu untuk SPMB.",
          "Sekolah hanya memakai data pendaftar untuk keperluan SPMB, menjaga akses admin, dan tidak membagikannya tanpa dasar yang sah.",
          "Sekolah bertanggung jawab atas keputusan penerimaan, ketepatan aturan jalur, kuota, dan jadwal SPMB yang berlaku di daerahnya. Layanan tidak menghitung zonasi atau nilai secara otomatis.",
          "Sekolah dapat mengarsipkan atau menghapus data tahun lalu. Penghapusan bersifat permanen.",
          "Pemrosesan data pribadi dijelaskan lebih lanjut di Kebijakan Privasi.",
        ]} />
      </Pasal>

      <Pasal no={8} judul="Penggunaan yang dilarang">
        <Daftar butir={[
          "Melanggar hukum, atau mengunggah konten yang melanggar hak pihak lain.",
          "Mencoba mengakses data sekolah lain, mengganggu keamanan, atau membebani sistem secara tidak wajar.",
          "Memakai kode aktivasi atau akun untuk menghindari pembayaran, atau membagikan kode aktivasi kepada pihak lain.",
          "Menggunakan Layanan untuk tujuan selain pendaftaran siswa baru.",
        ]} />
      </Pasal>

      <Pasal no={9} judul="Ketersediaan dan tanggung jawab">
        <Daftar butir={[
          "Penyedia berupaya menjaga Layanan tetap tersedia, terutama pada masa pendaftaran, tetapi tidak menjamin Layanan bebas gangguan. Layanan dapat terhenti karena pemeliharaan atau gangguan penyedia infrastruktur.",
          "Penyedia melakukan ekspor data berkala sebagai cadangan, tetapi sekolah dianjurkan mengunduh data sendiri secara rutin.",
          <>Sejauh diizinkan hukum, tanggung jawab Penyedia kepada sekolah dibatasi sebesar biaya langganan yang dibayar dalam <mark>[DIISI: periode, mis. 12 bulan terakhir]</mark>.</>,
        ]} />
      </Pasal>

      <Pasal no={10} judul="Penghentian">
        <p>Sekolah dapat berhenti memakai Layanan kapan saja dengan tidak memperpanjang langganan. Penyedia dapat menangguhkan atau menonaktifkan sekolah yang melanggar ketentuan ini, dengan pemberitahuan ke email admin bila memungkinkan.</p>
      </Pasal>

      <Pasal no={11} judul="Perubahan ketentuan">
        <p>Penyedia dapat mengubah ketentuan ini. Perubahan penting diberitahukan lewat email admin atau di aplikasi. Memakai Layanan setelah perubahan berlaku berarti sekolah menyetujuinya.</p>
      </Pasal>

      <Pasal no={12} judul="Hukum yang berlaku">
        <p>Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa diupayakan diselesaikan secara musyawarah, dan bila tidak berhasil, melalui <mark>[DIISI: pengadilan negeri/domisili]</mark>.</p>
      </Pasal>
    </KerangkaHukum>
  );
}
