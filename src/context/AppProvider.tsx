"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { Bag, BagLine, Order, SavedAddress } from "@/lib/types";
import type { GeoPlace } from "@/lib/geo";
import { savedAddresses } from "@/data/addresses";
import { useCurrentLocation } from "@/lib/useGeolocation";
import { useSavedAddresses } from "@/lib/useSavedAddresses";
import { demoOrders } from "@/data/demoOrders";

interface AppState {
  address: SavedAddress;
  /** Endereços de entrega, montados em volta da posição atual. */
  addresses: SavedAddress[];
  /** Destino escolhido na home, aproveitado ao abrir a corrida. */
  rideDestination: GeoPlace | null;
  setRideDestination: (p: GeoPlace | null) => void;
  setAddress: (a: SavedAddress) => void;
  bag: Bag;
  addLine: (restaurantSlug: string, line: Omit<BagLine, "lineId">) => "added" | "conflict";
  replaceBag: (restaurantSlug: string, line: Omit<BagLine, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearBag: () => void;
  orders: Record<string, Order>;
  saveOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
}

const AppContext = createContext<AppState | null>(null);

let lineCounter = 0;
function nextLineId() {
  lineCounter += 1;
  return `l${Date.now().toString(36)}${lineCounter}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Só o fluxo de comida precisa do endereço, então a posição é pedida ali.
  const pathname = usePathname();
  const current = useCurrentLocation(pathname.startsWith("/comida"));
  const located = useSavedAddresses(current);
  const addresses = located.length > 0 ? located : savedAddresses;
  const [chosenId, setChosenId] = useState<string>(savedAddresses[0].id);
  const address = addresses.find((a) => a.id === chosenId) ?? addresses[0];
  const setAddress = useCallback((a: SavedAddress) => setChosenId(a.id), []);
  const [rideDestination, setRideDestination] = useState<GeoPlace | null>(null);
  const [bag, setBag] = useState<Bag>({ restaurantSlug: null, lines: [] });
  const [orders, setOrders] = useState<Record<string, Order>>({});

  const addLine = useCallback<AppState["addLine"]>(
    (restaurantSlug, line) => {
      if (bag.restaurantSlug && bag.restaurantSlug !== restaurantSlug && bag.lines.length > 0) {
        return "conflict";
      }
      setBag((b) => ({
        restaurantSlug,
        lines: [...b.lines, { ...line, lineId: nextLineId() }],
      }));
      return "added";
    },
    [bag.restaurantSlug, bag.lines.length],
  );

  const replaceBag = useCallback<AppState["replaceBag"]>((restaurantSlug, line) => {
    setBag({ restaurantSlug, lines: [{ ...line, lineId: nextLineId() }] });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setBag((b) => {
      const lines = b.lines
        .map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0);
      return { restaurantSlug: lines.length ? b.restaurantSlug : null, lines };
    });
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setBag((b) => {
      const lines = b.lines.filter((l) => l.lineId !== lineId);
      return { restaurantSlug: lines.length ? b.restaurantSlug : null, lines };
    });
  }, []);

  const clearBag = useCallback(() => setBag({ restaurantSlug: null, lines: [] }), []);

  const saveOrder = useCallback((order: Order) => {
    setOrders((o) => ({ ...o, [order.id]: order }));
  }, []);

  const getOrder = useCallback(
    (id: string) => orders[id] ?? demoOrders[id],
    [orders],
  );

  const value = useMemo<AppState>(
    () => ({
      address,
      addresses,
      setAddress,
      rideDestination,
      setRideDestination,
      bag,
      addLine,
      replaceBag,
      updateQuantity,
      removeLine,
      clearBag,
      orders,
      saveOrder,
      getOrder,
    }),
    [address, addresses, setAddress, rideDestination, bag, addLine, replaceBag, updateQuantity, removeLine, clearBag, orders, saveOrder, getOrder],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp precisa estar dentro de AppProvider");
  return ctx;
}

export function bagSubtotal(bag: Bag): number {
  return bag.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

export function bagCount(bag: Bag): number {
  return bag.lines.reduce((sum, l) => sum + l.quantity, 0);
}
