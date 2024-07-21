export default function Home() {
  return (
    <div class="px-4 py-8 mx-auto space-y-4">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Aplikasi CRUD Sederhana</h1>
      </div>
      <div className="w-full flex justify-center flex-col items-center space-y-4">
        <a href="dashboard">
          <button class="btn btn-primary">Get Started</button>
        </a>
        <a href="/dashboard/history" className="btn btn-accent">
          Tampilkan Riwayat Link Daftar Tugas Anda
        </a>
      </div>
    </div>
  );
}
