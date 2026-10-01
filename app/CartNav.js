"use client";

import { useEffect, useState } from "react";

function getCartTotal() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("sinar_kasih_cart") || "[]"
    );

    if (!Array.isArray(saved)) {
      return 0;
    }

    return saved.reduce(
      (total, item) =>
        total + Math.max(0, Number(item.qty) || 0),
      0
    );
  } catch {
    return 0;
  }
}

function CartIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
    </svg>
  );
}

export default function CartNav({
  label = "Troli",
  className = "",
}) {
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    function updateCartCount() {
      setTotalItems(getCartTotal());
    }

    updateCartCount();

    window.addEventListener(
      "sinar-kasih-cart-updated",
      updateCartCount
    );

    window.addEventListener(
      "storage",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "sinar-kasih-cart-updated",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  const badgeText =
    totalItems > 99 ? "99+" : totalItems;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        verticalAlign: "middle",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4f8a5b",
          lineHeight: 0,
        }}
      >
        <CartIcon />

        {totalItems > 0 && (
          <span
            aria-label={`${totalItems} barang di troli`}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              minWidth: "17px",
              height: "17px",
              padding: "0 4px",
              borderRadius: "999px",
              background: "#d83a32",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: 800,
              lineHeight: "17px",
              textAlign: "center",
              boxSizing: "border-box",
              border: "2px solid #fffaf2",
            }}
          >
            {badgeText}
          </span>
        )}
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </span>
  );
}
