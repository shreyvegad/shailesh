"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { rowTotal, effectivePrice, sizeLabel, grandTotal } from "@/core/calc";
import type { Rate, Category, Business, Settings, Row } from "@/core/types";
import { generatePdf } from "@/pdf/generatePdf";

const typeLabel = {
  itemPrice: "Item Price",
  squareFeet: "Square Feet",
  runningFeet: "Running Feet",
};
const blank = { price: "", qty: "", height: "", width: "" };
const numeric = (v: string) => v.replace(/[^0-9.]/g, "");
let seq = 0;

export default function Page() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [biz, setBiz] = useState<Business | null>(null);
  const [set, setSet] = useState<Settings | null>(null);
  const [customer, setCustomer] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      setRates(await api.get<Rate>("rates"));
      setCats(await api.get<Category>("categories"));
      setBiz((await api.get<Business>("business"))[0]);
      setSet((await api.get<Settings>("settings"))[0]);
    })();
  }, []);

  const rateOf = (id: string) => rates.find((r) => r.id === id);
  const lines = useMemo(
    () =>
      set
        ? rows.flatMap((r) => {
            const rate = rates.find((x) => x.id === r.rateId);
            return rate
              ? [{ row: r, rate, total: rowTotal(rate, r.input, set) }]
              : [];
          })
        : [],
    [rows, rates, set],
  );
  const total = set
    ? grandTotal(
        lines.map((l) => l.total),
        set,
      )
    : 0;

  const patch = (id: string, p: Partial<Row["input"]>) =>
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, input: { ...r.input, ...p } } : r)),
    );
  const pick = (id: string, rateId: string) => {
    const rate = rateOf(rateId);
    setRows((rs) =>
      rs.map((r) =>
        r.id !== id
          ? r
          : {
              ...r,
              rateId,
              input: {
                ...blank,
                price: rate ? String(rate.price) : "",
                qty: rate && rate.type !== "itemPrice" ? "1" : "",
              },
            },
      ),
    );
  };
  const download = () =>
    biz &&
    generatePdf(
      customer,
      lines.map((l) => ({
        name: l.rate.name,
        type: typeLabel[l.rate.type],
        price: effectivePrice(l.rate, l.row.input),
        size: sizeLabel(l.rate, l.row.input),
        total: l.total,
      })),
      total,
      biz,
    );

  return (
    <main>
      <h1>Rate Calculation</h1>
      <p className="sub">Build a quotation and download it as a PDF.</p>
      <label htmlFor="cust">Customer name</label>
      <input
        id="cust"
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
      />
      <div className="top">
        <strong>
          {lines.length} item{lines.length === 1 ? "" : "s"}
        </strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn alt"
            disabled={!lines.length || !biz}
            onClick={download}
          >
            Download PDF
          </button>
          <button
            className="btn"
            onClick={() =>
              setRows((r) => [
                ...r,
                { id: `row_${++seq}`, rateId: "", input: blank },
              ])
            }
          >
            Add item
          </button>
        </div>
      </div>
      {rows.length === 0 && (
        <p className="empty">
          No items yet. Add an item to start the quotation.
        </p>
      )}
      {rows.map((r) => {
        const rate = rateOf(r.rateId);
        const t = lines.find((l) => l.row.id === r.id)?.total ?? 0;
        const area = !!rate && rate.type !== "itemPrice";
        return (
          <div className="row" key={r.id}>
            <div className="rt">
              <div style={{ flex: 1 }}>
                <label>Item</label>
                <select
                  value={r.rateId}
                  onChange={(e) => pick(r.id, e.target.value)}
                >
                  <option value="">Select item</option>
                  {cats.map((c) => (
                    <optgroup key={c.id} label={c.name}>
                      {rates
                        .filter((x) => x.categoryId === c.id)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <button
                className="btn del"
                onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
              >
                Remove
              </button>
            </div>
            {rate && (
              <>
                <div className="grid">
                  <div>
                    <label>Price</label>
                    <input
                      inputMode="decimal"
                      value={r.input.price}
                      onChange={(e) =>
                        patch(r.id, { price: numeric(e.target.value) })
                      }
                    />
                  </div>
                  {area && (
                    <>
                      <div>
                        <label>Height (inch)</label>
                        <input
                          inputMode="decimal"
                          value={r.input.height}
                          onChange={(e) =>
                            patch(r.id, { height: numeric(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <label>Width (inch)</label>
                        <input
                          inputMode="decimal"
                          value={r.input.width}
                          onChange={(e) =>
                            patch(r.id, { width: numeric(e.target.value) })
                          }
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label>
                      {area
                        ? "Quantity"
                        : rate.specialType === "insideLaminate"
                          ? `Sheets (x ${rate.priceOnItem})`
                          : "Item"}
                    </label>
                    <input
                      inputMode="decimal"
                      value={r.input.qty}
                      onChange={(e) =>
                        patch(r.id, { qty: numeric(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="rt" style={{ marginTop: 10 }}>
                  <span>{typeLabel[rate.type]}</span>
                  <span className="tot">{t.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        );
      })}
      <div className="bar">
        <span>Grand Total</span>
        <strong>
          {biz?.currencySymbol} {total.toFixed(2)}
        </strong>
      </div>
    </main>
  );
}
