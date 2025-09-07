import css from "../components/Home/Home.module.css";
import axios from "axios";

export default async function NotFound() {
  let data = null;

  // Мінімальна обробка запитів, щоб build не падав
  try {
    const res = await axios.get("https://api.example.com/data");
    data = res.data;
  } catch (err) {
    console.warn("Не вдалося отримати дані для 404 сторінки:", err.message);
    data = null; // залишаємо null
  }

  return (
    <>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
      {data && <p>Додаткова інформація: {JSON.stringify(data)}</p>}
    </>
  );
}
