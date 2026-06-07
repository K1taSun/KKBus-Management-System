"use client";

import { ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";

export function CartButton({ mobile = false }: { mobile?: boolean }) {
  const { items, isOpen, openCart, closeCart, removeTicket, total } = useCart();

  return (
    <>
      <button
        type="button"
        onClick={openCart}
        className={mobile
          ? "relative inline-flex w-full items-center justify-center gap-2 rounded-md bg-action px-4 py-3 text-sm font-semibold text-white hover:bg-action-hover"
          : "relative text-white hover:text-action transition-colors"}
        aria-label="Koszyk"
      >
        <ShoppingCart size={mobile ? 18 : 20} />
        {mobile ? "Mój koszyk" : null}
        {items.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1.5 text-[11px] font-bold text-white ring-2 ring-primary">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
            onClick={closeCart}
            aria-label="Zamknij koszyk"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-primary">Koszyk</h2>
                <p className="text-sm text-text-muted">{items.length} wybranych biletów</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-text-muted hover:bg-gray-100 hover:text-primary"
                aria-label="Zamknij"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background-alt text-action">
                    <ShoppingCart size={26} />
                  </div>
                  <h3 className="font-semibold text-primary">Koszyk jest pusty</h3>
                  <p className="mt-1 max-w-xs text-sm text-text-muted">
                    Wybierz kurs z listy połączeń, a bilet pojawi się tutaj.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-100 bg-background-alt p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-primary">{item.from} → {item.to}</p>
                          <p className="mt-1 text-xs text-text-muted">{item.date} · {item.route}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTicket(item.id)}
                          className="rounded-full p-1.5 text-text-muted hover:bg-white hover:text-red-500"
                          aria-label="Usuń bilet"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-text-muted">Odjazd</p>
                          <p className="font-bold text-primary">{item.departure}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Przyjazd</p>
                          <p className="font-bold text-primary">{item.arrival}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Cena</p>
                          <p className="font-bold text-primary">{item.price}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-text-muted">
                        {item.passengers} · czas przejazdu {item.duration}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-text-muted">Razem</span>
                <span className="text-2xl font-bold text-primary">{total} zł</span>
              </div>
              <Button className="h-12 w-full bg-action text-base font-bold hover:bg-action-hover" disabled={items.length === 0}>
                Przejdź do płatności
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
