"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RouteGuard } from "@/components/auth/route-guard";
import { ApiError, financialsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

const initialSaleForm = { amount: "", description: "" };
const initialExpenseForm = { amount: "", category: "", description: "" };

function FinancePageInner() {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saleForm, setSaleForm] = useState(initialSaleForm);
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);

  const queryParams = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [endDate, startDate],
  );

  const loadFinance = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const [summaryResponse, salesResponse, expensesResponse] = await Promise.all([
        financialsApi.summary(queryParams),
        financialsApi.sales(queryParams),
        financialsApi.expenses(queryParams),
      ]);

      setSummary(summaryResponse);
      setSales(Array.isArray(salesResponse) ? salesResponse : []);
      setExpenses(Array.isArray(expensesResponse) ? expensesResponse : []);
      setStatus("success");
    } catch (requestError) {
      setError(requestError);
      setStatus("error");
    }
  }, [queryParams]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadFinance();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadFinance]);

  const recordSale = async (event) => {
    event.preventDefault();

    try {
      await financialsApi.recordSale({
        amount: Number(saleForm.amount),
        description: saleForm.description,
      });
      setSaleForm(initialSaleForm);
      await loadFinance();
    } catch (requestError) {
      setError(requestError);
    }
  };

  const recordExpense = async (event) => {
    event.preventDefault();

    try {
      await financialsApi.recordExpense({
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description,
      });
      setExpenseForm(initialExpenseForm);
      await loadFinance();
    } catch (requestError) {
      setError(requestError);
    }
  };

  const deleteSale = async (saleId) => {
    if (!window.confirm("Delete this sale record?")) {
      return;
    }

    try {
      await financialsApi.deleteSale(saleId);
      await loadFinance();
    } catch (requestError) {
      setError(requestError);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense record?")) {
      return;
    }

    try {
      await financialsApi.deleteExpense(expenseId);
      await loadFinance();
    } catch (requestError) {
      setError(requestError);
    }
  };

  return (
    <main className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <MetricCard label="Sales" value={summary ? formatCurrency(summary.totalSales) : "—"} />
          <MetricCard label="Expenses" value={summary ? formatCurrency(summary.totalExpenses) : "—"} />
          <MetricCard label="Net profit" value={summary ? formatCurrency(summary.netProfit) : "—"} accent />
        </section>

        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle>Financial controls</CardTitle>
            <CardDescription>Record sales and expenses, then review the live ledger below.</CardDescription>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input label="End date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />

            <form className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5" onSubmit={recordSale}>
              <div>
                <p className="text-sm font-semibold text-white">Record sale</p>
                <p className="mt-1 text-sm text-slate-400">Store income with an optional description.</p>
              </div>
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                value={saleForm.amount}
                onChange={(event) => setSaleForm((current) => ({ ...current, amount: event.target.value }))}
              />
              <Input
                label="Description"
                value={saleForm.description}
                onChange={(event) => setSaleForm((current) => ({ ...current, description: event.target.value }))}
              />
              <Button type="submit">Add sale</Button>
            </form>

            <form className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5" onSubmit={recordExpense}>
              <div>
                <p className="text-sm font-semibold text-white">Record expense</p>
                <p className="mt-1 text-sm text-slate-400">Track spending against a category.</p>
              </div>
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                value={expenseForm.amount}
                onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
              />
              <Input
                label="Category"
                value={expenseForm.category}
                onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value }))}
              />
              <Input
                label="Description"
                value={expenseForm.description}
                onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))}
              />
              <Button type="submit">Add expense</Button>
            </form>

            {error ? (
              <div className="sm:col-span-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {formatError(error)}
              </div>
            ) : null}
          </CardBody>
          <CardFooter className="justify-between">
            <p className="text-sm text-slate-400">
              {status === "loading" ? "Loading financial data..." : `Sales ${sales.length} · Expenses ${expenses.length}`}
            </p>
            <Button variant="secondary" size="sm" onClick={loadFinance} disabled={status === "loading"}>
              Refresh
            </Button>
          </CardFooter>
        </Card>

        <section className="grid gap-4 xl:grid-cols-2">
          <LedgerCard title="Sales" items={sales} onDelete={deleteSale} emptyLabel="No sales records found." />
          <LedgerCard
            title="Expenses"
            items={expenses}
            onDelete={deleteExpense}
            emptyLabel="No expense records found."
            renderMeta={(item) => item.category}
          />
        </section>
      </div>
    </main>
  );
}

function LedgerCard({ title, items, onDelete, emptyLabel, renderMeta }) {
  return (
    <Card className="bg-white/5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Live records from the backend ledger.</CardDescription>
      </CardHeader>
      <CardBody>
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{formatCurrency(item.amount)}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.description || renderMeta?.(item) || "No description"}</p>
                </div>
                <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                  Delete
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
            {emptyLabel}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function MetricCard({ label, value, accent = false }) {
  return (
    <Card className={accent ? "border-sky-300/20 bg-sky-300/10" : "bg-white/5"}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function formatError(error) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load financial data.";
}

export default function FinancePage() {
  return (
    <RouteGuard requiredRoles={["ADMIN"]}>
      <FinancePageInner />
    </RouteGuard>
  );
}