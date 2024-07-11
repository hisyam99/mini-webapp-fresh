import { ThemeChanger } from "../islands/ThemeChanger.tsx";

export default function Home() {
  return (
    <div class="px-4 py-8 mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
      </div>
      <div className="w-full flex justify-center">
        <ThemeChanger />
      </div>
      <div className="w-full flex justify-center">
        <a href="signin">
          <button class="btn btn-primary">Login</button>
        </a>
      </div>
    </div>
  );
}
