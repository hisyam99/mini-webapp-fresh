import { type PageProps } from "$fresh/server.ts";
import NavBar from "../islands/NavBar/index.tsx"
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
        <Component />
      </body>
    </html>
  );
}
