import { type PageProps } from "$fresh/server.ts";
import Footer from "../components/Footer.tsx";
import NavBar from "../islands/NavBar/index.tsx";
import { installGlobals } from "https://deno.land/x/virtualstorage@0.1.0/mod.ts";
installGlobals();

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>mini-webapp</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <NavBar />
        <div className="min-h-screen">
          <Component />
        </div>
        <Footer />
      </body>
    </html>
  );
}
