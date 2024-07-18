import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { TodoList, TodoListItem } from "../shared/api.ts";

interface LocalMutation {
  text: string | null;
  completed: boolean;
}

export default function TodoListView(
  { initialData, latency }: { initialData: TodoList; latency: number },
) {
  const [data, setData] = useState(initialData);
  const [dirty, setDirty] = useState(false);
  const localMutations = useRef(new Map<string, LocalMutation>());
  const [hasLocalMutations, setHasLocalMutations] = useState(false);
  const busy = hasLocalMutations || dirty;
  const [adding, setAdding] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl =
      `${wsProtocol}//${window.location.host}${window.location.pathname}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const newData: TodoList = JSON.parse(event.data);
      setData(newData);
      setDirty(false);
      setAdding(false);
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket closed");

    wsRef.current = ws;

    return () => ws.close();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const mutations = Array.from(localMutations.current);
      localMutations.current.clear();
      setHasLocalMutations(false);

      if (mutations.length && wsRef.current?.readyState === WebSocket.OPEN) {
        setDirty(true);
        const message = JSON.stringify(mutations.map(([id, mut]) => ({
          id,
          text: mut.text,
          completed: mut.completed,
        })));
        wsRef.current.send(message);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTodoInput = useRef<HTMLInputElement>(null);
  const addTodo = useCallback(() => {
    const value = addTodoInput.current!.value;
    if (!value) return;
    addTodoInput.current!.value = "";

    const id = generateItemId();
    localMutations.current.set(id, { text: value, completed: false });
    setHasLocalMutations(true);
    setAdding(true);
  }, []);

  const saveTodo = useCallback(
    (item: TodoListItem, text: string | null, completed: boolean) => {
      localMutations.current.set(item.id!, { text, completed });
      setHasLocalMutations(true);
    },
    [],
  );

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    });
  }, [currentUrl]);

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <h1 className="card-title">Daftar Tugas</h1>
            <div
              className={`badge ${busy ? "badge-warning" : "badge-success"}`}
            >
              {busy ? "Syncing" : "Synced"}
            </div>
          </div>
          <div className="form-control">
            <div className="join space-x-2">
              <input
                type="text"
                value={currentUrl}
                className="input input-bordered w-full"
                readOnly
              />
              <button className="btn" onClick={copyLink}>
                {copyStatus}
              </button>
            </div>
          </div>
          <p className="text-sm opacity-50">
            Bagikan link ini untuk berkolaborasi dengan orang lain.
          </p>
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Tambahkan Item"
                className="input input-bordered w-full my-4"
                ref={addTodoInput}
              />
              <button
                className={`btn btn-primary ${adding ? "loading" : ""}`}
                onClick={addTodo}
                disabled={adding}
              >
                Tambah
              </button>
            </div>
          </div>
          <div className="divider"></div>
          <ul className="menu bg-base-100 w-full p-0">
            {data.items.map((item) => (
              <TodoItem
                key={item.id! + ":" + item.versionstamp!}
                item={item}
                save={saveTodo}
              />
            ))}
          </ul>
          <div className="text-sm opacity-50 mt-4">
            Waktu load: {latency}ms
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoItem(
  { item, save }: {
    item: TodoListItem;
    save: (item: TodoListItem, text: string | null, completed: boolean) => void;
  },
) {
  const input = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const doSave = useCallback(() => {
    if (!input.current) return;
    setBusy(true);
    save(item, input.current.value, item.completed);
    setEditing(false);
  }, [item, save]);

  const cancelEdit = useCallback(() => {
    if (!input.current) return;
    setEditing(false);
    input.current.value = item.text;
  }, [item]);

  const doDelete = useCallback(() => {
    setBusy(true);
    save(item, null, item.completed);
    setShowDeleteModal(false);
  }, [item, save]);

  const doSaveCompleted = useCallback((completed: boolean) => {
    setBusy(true);
    save(item, item.text, completed);
  }, [item, save]);

  return (
    <>
      <li
        className="border-b border-base-300 py-2"
        {...{ "data-item-id": item.id! }}
      >
        {editing
          ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input input-bordered w-full"
                ref={input}
                defaultValue={item.text}
              />
              <button
                className="btn btn-square btn-sm"
                onClick={doSave}
                disabled={busy}
              >
                💾
              </button>
              <button
                className="btn btn-square btn-sm"
                onClick={cancelEdit}
                disabled={busy}
              >
                🚫
              </button>
            </div>
          )
          : (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={item.completed}
                disabled={busy}
                onChange={(e) => doSaveCompleted(e.currentTarget.checked)}
              />
              <span
                className={`flex-grow ${
                  item.completed ? "line-through opacity-50" : ""
                }`}
              >
                {item.text}
              </span>
              <div className="flex-none text-xs opacity-50">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditing(true)}
                disabled={busy}
              >
                ✏️
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={busy}
              >
                🗑️
              </button>
            </div>
          )}
      </li>

      <input
        type="checkbox"
        id={`delete-modal-${item.id}`}
        className="modal-toggle"
        checked={showDeleteModal}
        onChange={() => setShowDeleteModal(!showDeleteModal)}
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Konfirmasi Penghapusan</h3>
          <p className="py-4">Apakah anda yakin untuk menghapus item ini?</p>
          <div className="modal-action">
            <button className="btn" onClick={() => setShowDeleteModal(false)}>
              Batal
            </button>
            <button className="btn btn-error" onClick={doDelete}>Hapus</button>
          </div>
        </div>
      </div>
    </>
  );
}

function generateItemId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}
