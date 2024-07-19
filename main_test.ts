import { createHandler, ServeHandlerInfo } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// Mendefinisikan informasi koneksi untuk permintaan
const CONN_INFO: ServeHandlerInfo = {
    remoteAddr: { hostname: "127.0.0.1", port: 53496, transport: "tcp" },
};

// Menguji rute HTTP
Deno.test("HTTP Routes Test", async (t) => {
    // Membuat handler untuk menangani permintaan
    const handler = await createHandler(manifest, config);

    // Menguji rute GET ke halaman utama
    await t.step("GET / - Home page", async () => {
        const resp = await handler(new Request("http://127.0.0.1/"), CONN_INFO);
        assertEquals(resp.status, 200); // Memastikan status respons adalah 200
        const text = await resp.text();
        assert(text.includes("Aplikasi CRUD Sederhana")); // Memastikan teks tertentu ada di halaman
    });

    // Menguji rute GET ke /dashboard dan memastikan redirect ke /login jika tidak terautentikasi
    await t.step(
        "GET /dashboard - Redirect to login if not authenticated",
        async () => {
            const resp = await handler(
                new Request("http://127.0.0.1/dashboard"),
                CONN_INFO,
            );
            assertEquals(resp.status, 302); // Memastikan status respons adalah 302 (redirect)
            assertEquals(
                resp.headers.get("Location"),
                "http://127.0.0.1/login",
            ); // Memastikan header Location adalah /login
        },
    );

    // Menguji rute GET ke halaman login
    await t.step("GET /login - Login page", async () => {
        const resp = await handler(
            new Request("http://127.0.0.1/login"),
            CONN_INFO,
        );
        assertEquals(resp.status, 200); // Memastikan status respons adalah 200
        const text = await resp.text();
        assert(text.includes("Sign In with Google")); // Memastikan teks Sign In With Google ada di halaman
        assert(text.includes("Sign In with Facebook")); // Memastikan teks Sign In with Facebook ada di halaman
    });

    // Menguji rute GET ke /profile dalam kondisi tidak terautentikasi
    await t.step("GET /profile - Profile page (unauthenticated)", async () => {
        const resp = await handler(
            new Request("http://127.0.0.1/profile"),
            CONN_INFO,
        );
        assertEquals(resp.status, 200); // Memastikan status respons adalah 200
    });

    // Menguji rute GET ke /api/profile dalam kondisi tidak terautentikasi
    await t.step(
        "GET /api/profile - API endpoint (unauthenticated)",
        async () => {
            const resp = await handler(
                new Request("http://127.0.0.1/api/profile"),
                CONN_INFO,
            );
            assertEquals(resp.status, 401); // Memastikan status respons adalah 401
        },
    );

    // Menguji rute GET ke rute yang tidak ada
    await t.step("GET /non-existent-route - 404 Not Found", async () => {
        const resp = await handler(
            new Request("http://127.0.0.1/non-existent-route"),
            CONN_INFO,
        );
        assertEquals(resp.status, 404); // Memastikan status respons adalah 404
    });
});

// Fungsi untuk mensimulasikan autentikasi dengan menggunakan sessionId
function simulateAuthentication(sessionId: string): Request {
    const headers = new Headers();
    headers.set("Cookie", `session=${sessionId}`); // Menetapkan header Cookie dengan sessionId
    return new Request("http://127.0.0.1/", { headers }); // Mengembalikan permintaan dengan header yang ditetapkan
}

// Menguji rute yang memerlukan autentikasi
Deno.test("Authenticated Routes Test", async (t) => {
    const handler = await createHandler(manifest, config);
    const authenticatedRequest = simulateAuthentication("test-session-id"); // Mensimulasikan permintaan terautentikasi

    // Menguji rute GET ke /dashboard dalam kondisi terautentikasi
    await t.step("GET /dashboard - Authenticated access", async () => {
        const resp = await handler(
            new Request("http://127.0.0.1/dashboard", {
                headers: authenticatedRequest.headers,
            }),
            CONN_INFO,
        );
        assertEquals(resp.status, 302); // Memastikan status respons adalah 302
    });

    // Menguji rute GET ke /profile dalam kondisi terautentikasi
    await t.step("GET /profile - Authenticated access", async () => {
        const resp = await handler(
            new Request("http://127.0.0.1/profile", {
                headers: authenticatedRequest.headers,
            }),
            CONN_INFO,
        );
        assertEquals(resp.status, 200); // Memastikan status respons adalah 200
        const text = await resp.text();
        // Memastikan teks tertentu ada di halaman profil
        assert(text.includes("Profile") || text.includes("User Information"));
    });

    // Menguji rute GET ke /api/profile dalam kondisi terautentikasi
    await t.step(
        "GET /api/profile - API endpoint (authenticated)",
        async () => {
            const resp = await handler(
                new Request("http://127.0.0.1/api/profile", {
                    headers: authenticatedRequest.headers,
                }),
                CONN_INFO,
            );
            assertEquals(resp.status, 401); // Memastikan status respons adalah 401
        },
    );
});
