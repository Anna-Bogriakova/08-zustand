"use client";

import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

import css from "./NotesPage.module.css";
import { fetchNotes, createNote, NotesResponse } from "@/lib/api";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import NoteList from "@/components/NoteList/NoteList";
import Modal from "@/components/Modal/Modal";
import NoteFormComponent from "@/components/NoteForm/NoteForm";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);

  const perPage = 10;
  const queryClient = useQueryClient();

  // ✅ мутация для создания заметки
  const { mutate } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created!");
      setModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to create note");
    },
  });

  // сброс страницы при изменении поиска
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // загрузка списка заметок
  const { data, isLoading, isError } = useQuery<NotesResponse, Error>({
    queryKey: ["notes", page, debouncedSearch],
    queryFn: () => fetchNotes(debouncedSearch, page, perPage),
    placeholderData: keepPreviousData,
    enabled: typeof window !== "undefined", // ⚡ только на клиенте
  });

  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong.");
    } else if (data && data.notes.length === 0) {
      toast.error("No notes found.");
    }
  }, [isError, data]);

  return (
    <div className={css.app}>
      <Toaster position="top-center" />

      <header className={css.toolbar}>
        <SearchBox onChange={setSearch} />

        {data?.totalPages && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <button className={css.button} onClick={() => setModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {!isLoading && !isError && <NoteList notes={data?.notes ?? []} />}

      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          {/* ✅ передаем mutate в форму */}
          <NoteFormComponent
            onCancel={() => setModalOpen(false)}
            onSubmit={(values) => mutate(values)}
          />
        </Modal>
      )}
    </div>
  );
}
