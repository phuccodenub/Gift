import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        gap: "1.5rem",
      }}
    >
      <div style={{ fontSize: "4rem", lineHeight: 1 }}>🌸</div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
          fontWeight: 600,
          color: "var(--app-text)",
          margin: 0,
        }}
      >
        Không tìm thấy quà tặng
      </h1>

      <p
        style={{
          fontSize: "1rem",
          color: "var(--app-text-soft)",
          maxWidth: "360px",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        Link quà tặng này không tồn tại hoặc đã bị xóa.
        <br />
        Hãy kiểm tra lại đường dẫn bạn nhận được.
      </p>

      <Link
        href="/create"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1.75rem",
          borderRadius: "999px",
          background: "var(--app-brand-strong)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.95rem",
          textDecoration: "none",
          transition: "opacity 0.2s",
        }}
      >
        Tạo quà tặng mới
      </Link>

      <Link
        href="/"
        style={{
          fontSize: "0.875rem",
          color: "var(--app-text-soft)",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
        }}
      >
        Về trang chủ
      </Link>
    </div>
  );
}
