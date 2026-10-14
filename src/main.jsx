import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Database,
  Edit3,
  History,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Trash2,
  Utensils,
  Users,
  WalletCards,
  X,
  TrainFront
} from "lucide-react";
import "./styles.css";

const KEY = "roomlife-expenses-v1";
const LAST_TYPE_KEY = "roomlife-last-type";

/* Local date (fixes the UTC issue: before 5:30 AM IST, toISOString gives yesterday) */
function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = () => dateKey(0);
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const starter = {
  travel: [],
  food: [],
  snacks: [],
  rent: [],
  other: [],
  money: []
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return starter;

    return {
      ...starter,
      ...saved,
      travel: Array.isArray(saved.travel) ? saved.travel : [],
      food: Array.isArray(saved.food) ? saved.food : [],
      snacks: Array.isArray(saved.snacks) ? saved.snacks : [],
      rent: Array.isArray(saved.rent) ? saved.rent : [],
      other: Array.isArray(saved.other) ? saved.other : [],
      money: Array.isArray(saved.money) ? saved.money : []
    };
  } catch {
    return starter;
  }
}

function loadLastType() {
  try {
    const t = localStorage.getItem(LAST_TYPE_KEY);
    return ["travel", "food", "snacks", "rent", "other"].includes(t) ? t : "travel";
  } catch {
    return "travel";
  }
}

function normalizeBackupData(imported) {
  if (!imported || typeof imported !== "object") {
    throw new Error("Invalid backup structure");
  }

  const types = ["travel", "food", "snacks", "rent", "other", "money"];
  const hasRoomLifeData = types.some((type) => Array.isArray(imported[type]));

  if (!hasRoomLifeData) {
    throw new Error("No RoomLife data found");
  }

  const normalized = {};

  types.forEach((type) => {
    normalized[type] = Array.isArray(imported[type])
      ? imported[type].filter((item) => item && typeof item === "object")
      : [];
  });

  return normalized;
}

function getItemFingerprint(item) {
  return JSON.stringify({
    date: item.date || "",
    amount: Number(item.amount || 0),
    description: item.description || "",
    meal: item.meal || "",
    food: item.food || "",
    name: item.name || "",
    month: item.month || "",
    category: item.category || "",
    person: item.person || "",
    type: item.type || ""
  });
}

function createId(type) {
  return `${Date.now()}-${type}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ---------- Monthly bill helpers ---------- */

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

function getMonthKey(date) {
  const key = String(date || "").slice(0, 7);
  return MONTH_KEY_PATTERN.test(key) ? key : "";
}

function getMonthParts(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  return { year, month };
}

function getMonthName(monthKey) {
  const { year, month } = getMonthParts(monthKey);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long"
  });
}

function getMonthLabel(monthKey) {
  const { year, month } = getMonthParts(monthKey);
  if (!year || !month) return "Unknown month";
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
}

function buildMonthlyBills(expenses) {
  const grouped = new Map();

  expenses.forEach((expense) => {
    const monthKey = getMonthKey(expense.date);
    if (!monthKey) return;

    if (!grouped.has(monthKey)) {
      const { year } = getMonthParts(monthKey);
      grouped.set(monthKey, {
        key: monthKey,
        label: getMonthLabel(monthKey),
        monthName: getMonthName(monthKey),
        year,
        total: 0,
        count: 0
      });
    }

    const bill = grouped.get(monthKey);
    bill.total += Number(expense.amount || 0);
    bill.count += 1;
  });

  return [...grouped.values()].sort((a, b) => b.key.localeCompare(a.key));
}

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const TYPE_LABELS = {
  rent: "Room Rent",
  travel: "Travel",
  food: "Food",
  snacks: "Snacks",
  other: "Other"
};

/* ---------- Quick-add helpers ---------- */

const SUGGESTIONS = {
  travel: ["Bus", "Auto", "Train", "Cab", "Metro"],
  food: ["Idly", "Dosa", "Meals", "Biriyani", "Tiffin"],
  snacks: ["Tea", "Coffee", "Biscuit", "Juice", "Samosa"],
  other: ["Soap", "Detergent", "Toothpaste", "Hanger"]
};

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

function mealByTime() {
  const hour = new Date().getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 16) return "Lunch";
  return "Dinner";
}

function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [depth, setDepth] = useState(0);
  const [editing, setEditing] = useState(null);
  const [moneyEditing, setMoneyEditing] = useState(null);
  const [lastType, setLastType] = useState(loadLastType);
  const [dataMenu, setDataMenu] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  /* ---------- Navigation with real back support ---------- */

  useEffect(() => {
    const state = window.history.state;

    if (state && typeof state.idx === "number" && state.page) {
      setPage(state.page);
      setSelectedMonth(state.month || null);
      setDepth(state.idx);
    } else {
      window.history.replaceState({ page: "dashboard", month: null, idx: 0 }, "");
    }

    function onPop(event) {
      const s = event.state;

      if (s && s.page) {
        setPage(s.page);
        setSelectedMonth(s.month || null);
        setDepth(s.idx || 0);
      } else {
        setPage("dashboard");
        setSelectedMonth(null);
        setDepth(0);
      }

      setDataMenu(false);
      setEditing(null);
      setMoneyEditing(null);
      window.scrollTo({ top: 0 });
    }

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(nextPage, month = null) {
    setDataMenu(false);
    window.scrollTo({ top: 0 });

    if (nextPage === page && month === selectedMonth) return;

    const idx = depth + 1;
    window.history.pushState({ page: nextPage, month, idx }, "");
    setPage(nextPage);
    setSelectedMonth(month);
    setDepth(idx);
  }

  function goBack() {
    if (depth > 0) window.history.back();
  }

  function navigate(nextPage) {
    go(nextPage, null);
  }

  function openMonth(monthKey) {
    go("month", monthKey);
  }

  function backToMonths() {
    go("months", null);
  }

  /* ---------- Totals ---------- */

  const totals = useMemo(() => {
    const sum = (items) =>
      items.reduce((total, item) => total + Number(item.amount || 0), 0);

    const breakfast = sum(data.food.filter((x) => x.meal === "Breakfast"));
    const lunch = sum(data.food.filter((x) => x.meal === "Lunch"));
    const dinner = sum(data.food.filter((x) => x.meal === "Dinner"));
    const food = breakfast + lunch + dinner;
    const travel = sum(data.travel);
    const snacks = sum(data.snacks);
    const rent = sum(data.rent);
    const other = sum(data.other);

    const moneyGiven = sum(data.money.filter((x) => x.type === "given"));
    const moneyReturned = sum(data.money.filter((x) => x.type === "returned"));
    const moneyOutstanding = Math.max(0, moneyGiven - moneyReturned);

    return {
      breakfast,
      lunch,
      dinner,
      food,
      travel,
      snacks,
      rent,
      other,
      grand: breakfast + lunch + dinner + travel + snacks + rent + other,
      moneyGiven,
      moneyReturned,
      moneyOutstanding
    };
  }, [data]);

  const all = useMemo(
    () =>
      [
        ...data.rent.map((x) => ({ ...x, type: "rent", label: "Room Rent" })),
        ...data.travel.map((x) => ({ ...x, type: "travel", label: x.description })),
        ...data.food.map((x) => ({
          ...x,
          type: "food",
          label: `${x.meal} • ${x.food}`
        })),
        ...data.snacks.map((x) => ({ ...x, type: "snacks", label: x.name })),
        ...data.other.map((x) => ({
          ...x,
          type: "other",
          label: x.name
        }))
      ].sort(
        (a, b) =>
          String(b.date).localeCompare(String(a.date)) ||
          Number(b.id || 0) - Number(a.id || 0)
      ),
    [data]
  );

  const monthlyBills = useMemo(() => buildMonthlyBills(all), [all]);

  const selectedExpenses = useMemo(
    () =>
      selectedMonth
        ? all.filter((expense) => getMonthKey(expense.date) === selectedMonth)
        : [],
    [all, selectedMonth]
  );

  const people = useMemo(() => {
    const map = new Map();

    data.money.forEach((transaction) => {
      const name = transaction.person?.trim();
      if (!name) return;

      const key = name.toLowerCase();
      if (!map.has(key)) map.set(key, name);
    });

    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [data.money]);

  function flash(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function downloadBackup() {
    const backup = {
      app: "RoomLife Expense Tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      data
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = today();

    link.href = url;
    link.download = `roomlife-expense-backup-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setDataMenu(false);
    flash("Backup downloaded");
  }

  function handleBackupUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setDataMenu(false);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      flash("Please select a JSON backup file");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);
        const imported = normalizeBackupData(backup?.data);
        const types = ["travel", "food", "snacks", "rent", "other", "money"];
        let addedCount = 0;

        setData((current) => {
          const next = { ...current };

          types.forEach((type) => {
            const existing = Array.isArray(current[type]) ? current[type] : [];
            const fingerprints = new Set(existing.map(getItemFingerprint));
            const additions = [];

            imported[type].forEach((item) => {
              const normalized = { ...item };

              if (type === "money") {
                normalized.person = String(normalized.person || "").trim();
                normalized.type = normalized.type === "returned" ? "returned" : "given";
              }

              if (type === "other") {
                normalized.category = normalized.category || "Miscellaneous";
                normalized.name = normalized.name || "Other expense";
              }

              if (!normalized.date || Number(normalized.amount || 0) <= 0) return;
              if (type === "money" && !normalized.person) return;

              const fingerprint = getItemFingerprint(normalized);
              if (fingerprints.has(fingerprint)) return;

              fingerprints.add(fingerprint);
              additions.push({
                ...normalized,
                id: createId(type)
              });
              addedCount += 1;
            });

            next[type] = [...existing, ...additions];
          });

          return next;
        });

        flash(
          addedCount
            ? `${addedCount} backup record${addedCount === 1 ? "" : "s"} restored`
            : "No new records found in backup"
        );
      } catch {
        flash("Invalid RoomLife backup file");
      }
    };

    reader.onerror = () => flash("Could not read backup file");
    reader.readAsText(file);
  }

  /* ---------- Quick add ---------- */

  function openAddExpense(type) {
    const chosen =
      type || (page === "food" ? "food" : lastType);
    setEditing({ type: chosen, item: null });
  }

  function openAddMoney(person) {
    setMoneyEditing({
      type: "given",
      item: person ? { person } : null
    });
  }

  function saveExpense(type, item, keepOpen = false) {
    setData((current) => {
      const arr = [...current[type]];
      const index = arr.findIndex((x) => x.id === item.id);

      if (index >= 0) arr[index] = item;
      else arr.push({ ...item, id: Date.now() });

      return { ...current, [type]: arr };
    });

    setLastType(type);
    try {
      localStorage.setItem(LAST_TYPE_KEY, type);
    } catch {
      /* ignore */
    }

    if (!keepOpen) setEditing(null);
    flash(`${i18n(type)} saved`);
  }

  function saveMoneyTransaction(item) {
    const amount = Number(item.amount || 0);
    const person = item.person.trim();

    if (!person || amount <= 0) return;

    if (item.type === "returned") {
      const currentBalance = getPersonBalance(data.money, person, item.id);

      if (amount > currentBalance) {
        flash(`Return cannot exceed ${money(currentBalance)}`);
        return;
      }
    }

    setData((current) => {
      const arr = [...current.money];
      const index = arr.findIndex((x) => x.id === item.id);

      const transaction = {
        ...item,
        person,
        amount
      };

      if (index >= 0) arr[index] = transaction;
      else arr.push({ ...transaction, id: Date.now() });

      return { ...current, money: arr };
    });

    setMoneyEditing(null);
    flash(item.type === "given" ? "Money received saved" : "Money returned saved");
  }

  function remove(type, id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    setData((current) => ({
      ...current,
      [type]: current[type].filter((x) => x.id !== id)
    }));

    flash("Expense deleted");
  }

  function removeMoney(id) {
    if (!window.confirm("Are you sure you want to delete this money transaction?")) {
      return;
    }

    setData((current) => ({
      ...current,
      money: current.money.filter((x) => x.id !== id)
    }));

    flash("Money transaction deleted");
  }

  function clearAll() {
    setDataMenu(false);

    if (
      !window.confirm(
        "Are you sure you want to delete all expense and money data? This action cannot be undone."
      )
    ) {
      return;
    }

    setData({
      travel: [],
      food: [],
      snacks: [],
      rent: [],
      other: [],
      money: []
    });

    if (page === "month") go("months", null);

    flash("All data deleted");
  }

  function i18n(type) {
    if (type === "rent") return "Room rent";
    if (type === "food") return "Food expense";
    if (type === "snacks") return "Snack expense";
    if (type === "other") return "Other expense";
    return "Travel expense";
  }

  const heading = {
    dashboard: {
      eyebrow: "OVERVIEW",
      title: "Dashboard",
      sub: "A quick look at your spending."
    },
    months: {
      eyebrow: "REPORTS",
      title: "Monthly bills",
      sub: "Pick a month to see every expense in it."
    },
    month: {
      eyebrow: "MONTHLY BILL",
      title: selectedMonth ? getMonthLabel(selectedMonth) : "Monthly bill",
      sub: "All expenses recorded in this month."
    },
    expenses: {
      eyebrow: "RECORDS",
      title: "All expenses",
      sub: "Every expense, newest first."
    },
    food: {
      eyebrow: "CATEGORY",
      title: "Food breakdown",
      sub: "Meal-wise food spending."
    },
    money: {
      eyebrow: "LEDGER",
      title: "Money tracking",
      sub: "Money given to you and what you have returned."
    }
  }[page];

  const tabs = [
    ["dashboard", "Overview", <LayoutDashboard key="d" />],
    ["months", "Months", <CalendarDays key="m" />],
    ["expenses", "Expenses", <ReceiptText key="e" />],
    ["food", "Food", <Utensils key="f" />],
    ["money", "Money", <Users key="u" />]
  ];

  const modalOpen = Boolean(editing || moneyEditing);
  const isMoneyPage = page === "money";

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button
            type="button"
            className="brand"
            onClick={() => navigate("dashboard")}
            aria-label="Go to dashboard"
          >
            <span className="brand-mark">
              <WalletCards size={18} />
            </span>
            <span className="brand-name">RoomLife</span>
          </button>

          <nav className="tabs" aria-label="Main navigation">
            {tabs.map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                className={`tab ${
                  page === key || (key === "months" && page === "month") ? "active" : ""
                }`}
                onClick={() => navigate(key)}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            {isMoneyPage ? (
              <button className="btn btn-primary" onClick={() => openAddMoney()}>
                <Plus size={16} />
                <span className="btn-text">Add money</span>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => openAddExpense()}>
                <Plus size={16} />
                <span className="btn-text">Add expense</span>
              </button>
            )}

            <div className="data-menu-wrap">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDataMenu((open) => !open)}
                aria-expanded={dataMenu}
                aria-label="Data options"
              >
                <Database size={16} />
                <span className="btn-text">Data</span>
                <ChevronDown size={14} className="btn-text" />
              </button>

              {dataMenu && (
                <>
                  <div className="menu-backdrop" onClick={() => setDataMenu(false)} />
                  <div className="data-menu">
                    <div className="menu-note">
                      <span className="dot" />
                      Stored on this device
                    </div>

                    <button type="button" className="menu-item" onClick={downloadBackup}>
                      <ArrowDownLeft size={15} />
                      Download backup
                    </button>

                    <label className="menu-item">
                      <ArrowUpRight size={15} />
                      Upload backup
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={handleBackupUpload}
                        aria-label="Upload RoomLife backup"
                      />
                    </label>

                    <button type="button" className="menu-item danger" onClick={clearAll}>
                      <Trash2 size={15} />
                      Delete all data
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="page-head">
          <div className="page-top">
            <button
              type="button"
              className="back-btn"
              onClick={goBack}
              disabled={depth === 0}
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            {page === "month" ? (
              <div className="breadcrumb">
                <button type="button" onClick={backToMonths}>
                  Monthly Bills
                </button>
                <ChevronRight size={14} />
                <span>{getMonthLabel(selectedMonth)}</span>
              </div>
            ) : (
              <div className="eyebrow">{heading.eyebrow}</div>
            )}
          </div>

          <h1>{heading.title}</h1>
          <p>{heading.sub}</p>
        </div>

        {page === "dashboard" && (
          <Dashboard
            totals={totals}
            all={all}
            monthlyBills={monthlyBills}
            onOpenMonth={openMonth}
            onViewMonths={() => navigate("months")}
            onAdd={setEditing}
            onMoneyAdd={() => openAddMoney()}
            onView={() => navigate("expenses")}
            onMoneyView={() => navigate("money")}
          />
        )}

        {page === "months" && (
          <MonthlyBills monthlyBills={monthlyBills} onOpenMonth={openMonth} />
        )}

        {page === "month" && selectedMonth && (
          <MonthDetail
            monthKey={selectedMonth}
            expenses={selectedExpenses}
            onBack={backToMonths}
            onEdit={setEditing}
            onDelete={remove}
          />
        )}

        {page === "expenses" && (
          <Expenses all={all} onEdit={setEditing} onDelete={remove} />
        )}

        {page === "food" && (
          <Food
            data={data.food}
            totals={totals}
            onAdd={setEditing}
            onEdit={setEditing}
            onDelete={remove}
          />
        )}

        {page === "money" && (
          <MoneyPage
            transactions={data.money}
            people={people}
            totals={totals}
            onAdd={(options = {}) => openAddMoney(options.person)}
            onEdit={(item) => setMoneyEditing({ type: item.type, item })}
            onDelete={removeMoney}
          />
        )}

        <footer>RoomLife • Your data stays on this device</footer>
      </main>

      {!modalOpen && (
        <button
          type="button"
          className="fab"
          onClick={() => (isMoneyPage ? openAddMoney() : openAddExpense())}
          aria-label={isMoneyPage ? "Add money" : "Add expense"}
        >
          <Plus size={22} />
          <span className="fab-text">{isMoneyPage ? "Add money" : "Add expense"}</span>
        </button>
      )}

      {editing && (
        <ExpenseModal
          initial={editing.item}
          type={editing.type}
          onClose={() => setEditing(null)}
          onSave={saveExpense}
        />
      )}

      {moneyEditing && (
        <MoneyModal
          initial={moneyEditing.item}
          type={moneyEditing.type}
          transactions={data.money}
          onClose={() => setMoneyEditing(null)}
          onSave={saveMoneyTransaction}
        />
      )}

      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

function getPersonBalance(transactions, person, excludeId = null) {
  const normalized = person.trim().toLowerCase();

  return transactions.reduce((balance, transaction) => {
    if (transaction.id === excludeId) return balance;
    if (transaction.person?.trim().toLowerCase() !== normalized) return balance;

    return (
      balance +
      (transaction.type === "given"
        ? Number(transaction.amount || 0)
        : -Number(transaction.amount || 0))
    );
  }, 0);
}

function getPersonStats(transactions, person) {
  const normalized = person.trim().toLowerCase();
  const list = transactions.filter(
    (x) => x.person?.trim().toLowerCase() === normalized
  );

  const given = list
    .filter((x) => x.type === "given")
    .reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const returned = list
    .filter((x) => x.type === "returned")
    .reduce((sum, x) => sum + Number(x.amount || 0), 0);

  return {
    given,
    returned,
    balance: Math.max(0, given - returned),
    transactions: [...list].sort(
      (a, b) =>
        String(a.date).localeCompare(String(b.date)) ||
        Number(a.id || 0) - Number(b.id || 0)
    )
  };
}

function MonthCard({ bill, max, onOpen }) {
  const share = max > 0 ? Math.max(4, Math.round((bill.total / max) * 100)) : 0;

  return (
    <button
      type="button"
      className="month-card"
      onClick={() => onOpen(bill.key)}
      aria-label={`Open ${bill.label} bill`}
    >
      <div className="mc-top">
        <div>
          <b className="mc-name">{bill.monthName}</b>
          <span className="mc-year">{bill.year}</span>
        </div>
        <ChevronRight size={16} className="mc-arrow" />
      </div>

      <div className="mc-total">{money(bill.total)}</div>

      <div className="mc-foot">
        <span>
          {bill.count} expense{bill.count === 1 ? "" : "s"}
        </span>
        <div className="mc-bar">
          <i style={{ width: `${share}%` }} />
        </div>
      </div>
    </button>
  );
}

function MonthlyBills({ monthlyBills, onOpenMonth }) {
  const max = Math.max(0, ...monthlyBills.map((bill) => bill.total));

  const years = useMemo(() => {
    const map = new Map();

    monthlyBills.forEach((bill) => {
      if (!map.has(bill.year)) map.set(bill.year, { year: bill.year, total: 0, bills: [] });
      const group = map.get(bill.year);
      group.total += bill.total;
      group.bills.push(bill);
    });

    return [...map.values()].sort((a, b) => b.year - a.year);
  }, [monthlyBills]);

  if (!monthlyBills.length) {
    return (
      <section className="content">
        <div className="panel">
          <div className="empty">
            <CalendarDays size={26} />
            <b>No monthly bills yet</b>
            <span>Add an expense and its month will appear here.</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content">
      {years.map((group) => (
        <div className="year-group" key={group.year}>
          <div className="year-head">
            <h2>{group.year}</h2>
            <span>
              {group.bills.length} month{group.bills.length === 1 ? "" : "s"} •{" "}
              {money(group.total)}
            </span>
          </div>

          <div className="month-grid">
            {group.bills.map((bill) => (
              <MonthCard key={bill.key} bill={bill} max={max} onOpen={onOpenMonth} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function MonthDetail({ monthKey, expenses, onBack, onEdit, onDelete }) {
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const highest = expenses.reduce(
    (best, expense) => Math.max(best, Number(expense.amount || 0)),
    0
  );

  return (
    <section className="content">
      <div className="kpi-grid three">
        <div className="kpi accent">
          <span className="kpi-label">Total expenses</span>
          <strong className="kpi-value">{money(total)}</strong>
          <span className="kpi-sub">{getMonthLabel(monthKey)}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Records</span>
          <strong className="kpi-value">{expenses.length}</strong>
          <span className="kpi-sub">expense{expenses.length === 1 ? "" : "s"} this month</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Highest expense</span>
          <strong className="kpi-value">{money(highest)}</strong>
          <span className="kpi-sub">single largest record</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{getMonthLabel(monthKey)} expenses</h2>
            <p>Newest first</p>
          </div>
          <button type="button" className="btn btn-outline" onClick={onBack}>
            <ArrowLeft size={15} />
            All Months
          </button>
        </div>

        {expenses.length ? (
          <div className="month-table">
            <div className="month-table-head">
              <span>Date</span>
              <span>Category</span>
              <span>Description</span>
              <span className="align-right">Amount</span>
              <span className="align-right">Actions</span>
            </div>

            {expenses.map((expense) => (
              <MonthExpenseItem
                key={`${expense.type}-${expense.id}`}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

            <div className="month-table-foot">
              <span>Total for {getMonthLabel(monthKey)}</span>
              <b>{money(total)}</b>
            </div>
          </div>
        ) : (
          <div className="empty">
            <ReceiptText size={26} />
            <b>No expenses for {getMonthLabel(monthKey)}</b>
            <span>Add an expense dated in this month, or go back and pick another month.</span>
            <button type="button" className="btn btn-primary empty-add" onClick={onBack}>
              <ArrowLeft size={15} /> Back to Monthly Bills
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function MonthExpenseItem({ expense, onEdit, onDelete }) {
  const category =
    expense.type === "other"
      ? expense.category || "Other"
      : TYPE_LABELS[expense.type] || "Expense";

  const description =
    expense.type === "food"
      ? expense.food || "Food"
      : expense.type === "rent"
        ? expense.description || "Room rent"
        : expense.label || expense.description || expense.name || "Expense";

  const details = [];
  if (expense.type === "food" && expense.meal) details.push(expense.meal);
  if (expense.type === "other") details.push("Other expense");
  if (expense.type === "rent" && expense.month) {
    details.push(`Rent month: ${getMonthLabel(expense.month)}`);
  }

  return (
    <div className="month-row">
      <div className="mr-date">
        <CalendarDays size={14} />
        {formatDate(expense.date)}
      </div>

      <div className="mr-cat">
        <span className={`category-chip ${expense.type}`}>{category}</span>
      </div>

      <div className="mr-desc">
        <b>{description}</b>
        {details.length > 0 && <span>{details.join(" • ")}</span>}
      </div>

      <div className="mr-amount">{money(expense.amount)}</div>

      <div className="mr-actions">
        <button
          type="button"
          className="edit-action"
          aria-label="Edit expense"
          onClick={() => onEdit({ type: expense.type, item: expense })}
        >
          <Edit3 size={14} />
          <span>Edit</span>
        </button>
        <button
          type="button"
          className="delete-action"
          aria-label="Delete expense"
          onClick={() => onDelete(expense.type, expense.id)}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

function Dashboard({
  totals,
  all,
  monthlyBills,
  onOpenMonth,
  onViewMonths,
  onAdd,
  onMoneyAdd,
  onView,
  onMoneyView
}) {
  const max = Math.max(0, ...monthlyBills.map((bill) => bill.total));
  const currentKey = today().slice(0, 7);
  const thisMonth = monthlyBills.find((bill) => bill.key === currentKey);

  const categories = [
    { key: "rent", label: "Room rent", value: totals.rent },
    { key: "travel", label: "Travel", value: totals.travel },
    { key: "food", label: "Food", value: totals.food },
    { key: "snacks", label: "Snacks", value: totals.snacks },
    { key: "other", label: "Other", value: totals.other }
  ];

  const percent = (value) =>
    totals.grand > 0 ? (value / totals.grand) * 100 : 0;

  return (
    <section className="content">
      {/* Quick add sits at the very top so adding is one tap away */}
      <div className="quick-strip">
        <span className="quick-strip-title">Quick add</span>
        <div className="quick-strip-list">
          <button type="button" onClick={() => onAdd({ type: "travel", item: null })}>
            <TrainFront size={16} /> Travel
          </button>
          <button type="button" onClick={() => onAdd({ type: "food", item: null })}>
            <Utensils size={16} /> Food
          </button>
          <button type="button" onClick={() => onAdd({ type: "snacks", item: null })}>
            <Coffee size={16} /> Snacks
          </button>
          <button type="button" onClick={() => onAdd({ type: "rent", item: null })}>
            <BedDouble size={16} /> Rent
          </button>
          <button type="button" onClick={() => onAdd({ type: "other", item: null })}>
            <CircleDollarSign size={16} /> Other
          </button>
        </div>
      </div>

      <div className="kpi-grid three">
        <div className="kpi accent">
          <span className="kpi-label">Total spent</span>
          <strong className="kpi-value">{money(totals.grand)}</strong>
          <span className="kpi-sub">Rent, travel, food, snacks & other</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">This month</span>
          <strong className="kpi-value">{money(thisMonth ? thisMonth.total : 0)}</strong>
          <span className="kpi-sub">
            {thisMonth
              ? `${thisMonth.count} expense${thisMonth.count === 1 ? "" : "s"}`
              : "No expenses yet"}
          </span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Money outstanding</span>
          <strong className="kpi-value">{money(totals.moneyOutstanding)}</strong>
          <span className="kpi-sub">Still to be returned</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Recent expenses</h2>
            <p>Your latest activity</p>
          </div>
          <button className="link-btn" onClick={onView}>View all</button>
        </div>

        {all.length ? (
          all.slice(0, 5).map((x) => (
            <ExpenseRow key={`${x.type}-${x.id}`} x={x} />
          ))
        ) : (
          <Empty />
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Spending by category</h2>
            <p>Share of your total spending</p>
          </div>
        </div>

        <div className="stack">
          {categories
            .filter((c) => c.value > 0)
            .map((c) => (
              <i
                key={c.key}
                className={`seg ${c.key}`}
                style={{ width: `${percent(c.value)}%` }}
                title={`${c.label}: ${money(c.value)}`}
              />
            ))}
        </div>

        <div className="legend">
          {categories.map((c) => (
            <div className="legend-item" key={c.key}>
              <span className={`legend-dot ${c.key}`} />
              <span className="legend-label">{c.label}</span>
              <b>{money(c.value)}</b>
              <small>{percent(c.value).toFixed(0)}%</small>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Monthly bills</h2>
            <p>Select a month to see its expenses</p>
          </div>
          {monthlyBills.length > 6 && (
            <button type="button" className="link-btn" onClick={onViewMonths}>
              View all
            </button>
          )}
        </div>

        {monthlyBills.length ? (
          <div className="month-grid">
            {monthlyBills.slice(0, 6).map((bill) => (
              <MonthCard key={bill.key} bill={bill} max={max} onOpen={onOpenMonth} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <CalendarDays size={26} />
            <b>No monthly bills yet</b>
            <span>Add an expense to get started.</span>
          </div>
        )}
      </div>

      <div className="split">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Food breakdown</h2>
              <p>Meal-wise spending</p>
            </div>
            <button
              className="link-btn"
              onClick={() => onAdd({ type: "food", item: null })}
            >
              + Add food
            </button>
          </div>

          <MealRow label="Breakfast" value={totals.breakfast} total={totals.food} />
          <MealRow label="Lunch" value={totals.lunch} total={totals.food} />
          <MealRow label="Dinner" value={totals.dinner} total={totals.food} />

          <div className="food-total">
            <span>Total food</span>
            <b>{money(totals.food)}</b>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Add by category</h2>
              <p>Pick a category and enter the amount</p>
            </div>
          </div>

          <Quick
            icon={<TrainFront />}
            label="Travel"
            onClick={() => onAdd({ type: "travel", item: null })}
          />
          <Quick
            icon={<Utensils />}
            label="Food"
            onClick={() => onAdd({ type: "food", item: null })}
          />
          <Quick
            icon={<Coffee />}
            label="Snacks"
            onClick={() => onAdd({ type: "snacks", item: null })}
          />
          <Quick
            icon={<BedDouble />}
            label="Room rent"
            onClick={() => onAdd({ type: "rent", item: null })}
          />
          <Quick
            icon={<CircleDollarSign />}
            label="Other expenses"
            onClick={() => onAdd({ type: "other", item: null })}
          />
        </div>
      </div>

      <div className="money-summary-panel">
        <div className="money-summary-copy">
          <div className="money-summary-icon"><Users size={19} /></div>
          <div>
            <h2>Money given & received</h2>
            <p>Track money people give you and what you return.</p>
          </div>
        </div>

        <div className="money-summary-values">
          <div>
            <span>Total given</span>
            <strong>{money(totals.moneyGiven)}</strong>
          </div>
          <div>
            <span>Total returned</span>
            <strong>{money(totals.moneyReturned)}</strong>
          </div>
          <div className="outstanding-value">
            <span>Outstanding</span>
            <strong>{money(totals.moneyOutstanding)}</strong>
          </div>
        </div>

        <div className="money-summary-actions">
          <button className="btn btn-outline" onClick={onMoneyView}>
            View history
          </button>
          <button className="btn btn-primary" onClick={onMoneyAdd}>
            <Plus size={15} /> <span className="btn-text-keep">Add money</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, title, value, cls }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${cls}`}>{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{money(value)}</strong>
      </div>
    </div>
  );
}

function MealRow({ label, value, total }) {
  const width = total > 0 ? Math.max(value ? 4 : 0, (value / total) * 100) : 0;

  return (
    <div className="meal-row">
      <span>{label}</span>
      <div className="bar">
        <i style={{ width: `${width}%` }} />
      </div>
      <b>{money(value)}</b>
    </div>
  );
}

function Quick({ icon, label, onClick }) {
  return (
    <button className="quick-row" onClick={onClick}>
      {icon}
      <span>{label}</span>
      <Plus size={16} />
    </button>
  );
}

function Expenses({ all, onEdit, onDelete }) {
  return (
    <section className="content">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Expense history</h2>
            <p>{all.length} record{all.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        {all.length ? (
          all.map((x) => (
            <ExpenseRow
              key={`${x.type}-${x.id}`}
              x={x}
              actions
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <Empty />
        )}
      </div>
    </section>
  );
}

function Food({ data, totals, onAdd, onEdit, onDelete }) {
  return (
    <section className="content">
      <div className="stats-grid">
        <Stat icon={<span>☀</span>} title="Breakfast" value={totals.breakfast} cls="morning" />
        <Stat icon={<span>◐</span>} title="Lunch" value={totals.lunch} cls="afternoon" />
        <Stat icon={<span>☾</span>} title="Dinner" value={totals.dinner} cls="evening" />
        <Stat icon={<Utensils />} title="Total Food" value={totals.food} cls="food" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Complete food breakdown</h2>
            <p>Every meal you've recorded</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onAdd({ type: "food", item: null })}
          >
            <Plus size={15} /> Add food
          </button>
        </div>

        {data.length ? (
          [...data]
            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
            .map((x) => (
              <ExpenseRow
                key={x.id}
                x={{ ...x, type: "food", label: `${x.meal} • ${x.food}` }}
                actions
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
        ) : (
          <Empty />
        )}
      </div>
    </section>
  );
}

function ExpenseRow({ x, actions, onEdit, onDelete }) {
  const icon =
    x.type === "travel" ? <TrainFront /> :
    x.type === "food" ? <Utensils /> :
    x.type === "snacks" ? <Coffee /> :
    x.type === "other" ? <CircleDollarSign /> :
    <BedDouble />;

  return (
    <div className="expense-row">
      <div className={`row-icon ${x.type}`}>{icon}</div>

      <div className="expense-info">
        <b>{x.label || x.description || x.name}</b>
        <span>{x.date}{x.type === "food" ? ` • ${x.food}` : ""}</span>
      </div>

      <strong className="row-amount">{money(x.amount)}</strong>

      {actions && (
        <div className="row-actions">
          <button
            title="Edit"
            aria-label="Edit expense"
            onClick={() => onEdit({ type: x.type, item: x })}
          >
            <Edit3 size={15} />
          </button>
          <button
            title="Delete"
            aria-label="Delete expense"
            onClick={() => onDelete(x.type, x.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="empty">
      <ReceiptText size={26} />
      <b>No expenses yet</b>
      <span>Add your first expense to see it here.</span>
    </div>
  );
}

function MoneyPage({ transactions, people, totals, onAdd, onEdit, onDelete }) {
  return (
    <section className="content">
      <div className="kpi-grid four">
        <MoneyStat
          icon={<ArrowDownLeft />}
          title="Total given"
          value={totals.moneyGiven}
          cls="given"
        />
        <MoneyStat
          icon={<ArrowUpRight />}
          title="Total returned"
          value={totals.moneyReturned}
          cls="returned"
        />
        <MoneyStat
          icon={<CircleDollarSign />}
          title="Outstanding"
          value={totals.moneyOutstanding}
          cls="balance"
        />
        <MoneyStat
          icon={<Users />}
          title="People"
          value={people.length}
          cls="people"
          raw
        />
      </div>

      <div className="year-head">
        <h2>People & balances</h2>
        <span>Each person has a separate transaction history.</span>
      </div>

      {people.length ? (
        <div className="people-grid">
          {people.map((person) => (
            <PersonCard
              key={person}
              person={person}
              transactions={transactions}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="panel">
          <div className="empty">
            <Users size={26} />
            <b>No money records yet</b>
            <span>Add a transaction to start tracking money given and returned.</span>
            <button className="btn btn-primary empty-add" onClick={() => onAdd()}>
              <Plus size={15} /> Add first transaction
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>All money transactions</h2>
            <p>{transactions.length} record{transactions.length === 1 ? "" : "s"}</p>
          </div>
          <History size={18} className="history-icon" />
        </div>

        {transactions.length ? (
          [...transactions]
            .sort(
              (a, b) =>
                String(b.date).localeCompare(String(a.date)) ||
                Number(b.id || 0) - Number(a.id || 0)
            )
            .map((transaction) => (
              <MoneyTransactionRow
                key={transaction.id}
                transaction={transaction}
                transactions={transactions}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
        ) : (
          <Empty />
        )}
      </div>
    </section>
  );
}

function MoneyStat({ icon, title, value, cls, raw = false }) {
  return (
    <div className="money-stat-card">
      <div className={`money-stat-icon ${cls}`}>{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{raw ? value : money(value)}</strong>
      </div>
    </div>
  );
}

function PersonCard({ person, transactions, onAdd, onEdit, onDelete }) {
  const stats = getPersonStats(transactions, person);

  return (
    <div className="person-card">
      <div className="person-card-head">
        <div className="person-avatar">{person.charAt(0).toUpperCase()}</div>
        <div className="person-name-wrap">
          <b>{person}</b>
          <span>{stats.transactions.length} transaction{stats.transactions.length === 1 ? "" : "s"}</span>
        </div>
        <span className={`balance-pill ${stats.balance === 0 ? "zero" : ""}`}>
          {stats.balance === 0 ? "Settled" : `${money(stats.balance)} due`}
        </span>
      </div>

      <div className="person-money-grid">
        <div>
          <span>Given</span>
          <strong>{money(stats.given)}</strong>
        </div>
        <div>
          <span>Returned</span>
          <strong>{money(stats.returned)}</strong>
        </div>
        <div>
          <span>Remaining</span>
          <strong>{money(stats.balance)}</strong>
        </div>
      </div>

      <div className="person-history-title">
        <History size={14} /> Transaction history
      </div>

      <div className="person-history-list">
        {stats.transactions.map((transaction) => (
          <MoneyTransactionRow
            key={transaction.id}
            transaction={transaction}
            transactions={transactions}
            compact
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <button
        className="person-add-return"
        onClick={() => onAdd({ person })}
      >
        <Plus size={14} /> Add transaction for {person}
      </button>
    </div>
  );
}

function MoneyTransactionRow({
  transaction,
  transactions,
  compact = false,
  onEdit,
  onDelete
}) {
  const balance = getPersonBalance(transactions, transaction.person);
  const typeGiven = transaction.type === "given";
  const historyBalance = getPersonBalance(
    transactions
      .filter((x) =>
        x.person?.trim().toLowerCase() === transaction.person?.trim().toLowerCase()
      )
      .filter((x) =>
        String(x.date).localeCompare(String(transaction.date)) < 0 ||
        (x.date === transaction.date && Number(x.id || 0) <= Number(transaction.id || 0))
      ),
    transaction.person
  );

  return (
    <div className={`money-transaction-row ${compact ? "compact" : ""}`}>
      <div className={`money-type-icon ${typeGiven ? "given" : "returned"}`}>
        {typeGiven ? <ArrowDownLeft /> : <ArrowUpRight />}
      </div>

      <div className="money-transaction-info">
        <b>{transaction.person}</b>
        <span>{transaction.date} • {typeGiven ? "Given" : "Returned"}</span>
      </div>

      <div className="money-transaction-amount">
        <strong>{typeGiven ? "+" : "−"}{money(transaction.amount)}</strong>
        <span>Balance {money(Math.max(0, historyBalance))}</span>
      </div>

      {!compact && <span className="current-balance-label">Current {money(balance)}</span>}

      <div className="row-actions">
        <button
          title="Edit"
          aria-label="Edit money transaction"
          onClick={() => onEdit(transaction)}
        >
          <Edit3 size={15} />
        </button>
        <button
          title="Delete"
          aria-label="Delete money transaction"
          onClick={() => onDelete(transaction.id)}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function ExpenseModal({ initial, type, onClose, onSave }) {
  const isEditing = Boolean(initial && initial.id);

  const [kind, setKind] = useState(type);
  const [date, setDate] = useState(initial?.date || today());
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [meal, setMeal] = useState(initial?.meal || mealByTime());
  const [title, setTitle] = useState(
    type === "rent" ? "" : initial?.description || initial?.food || initial?.name || ""
  );
  const [month, setMonth] = useState(initial?.month || "");
  const [rentDesc, setRentDesc] = useState(
    type === "rent" ? initial?.description || "" : ""
  );
  const [otherCategory, setOtherCategory] = useState(
    initial?.category || "Miscellaneous"
  );

  const formRef = useRef(null);
  const amountRef = useRef(null);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save(again) {
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return;

    const common = {
      id: initial?.id,
      date,
      amount: numeric
    };
    const text = title.trim();

    if (kind === "travel") {
      onSave("travel", { ...common, description: text || "Travel" }, again);
    }

    if (kind === "food") {
      onSave("food", { ...common, meal, food: text || "Food" }, again);
    }

    if (kind === "snacks") {
      onSave("snacks", { ...common, name: text || "Snack" }, again);
    }

    if (kind === "rent") {
      onSave(
        "rent",
        {
          ...common,
          month: month || date.slice(0, 7),
          description: rentDesc.trim() || "Room rent"
        },
        again
      );
    }

    if (kind === "other") {
      onSave(
        "other",
        {
          ...common,
          category: otherCategory,
          name: text || "Other expense"
        },
        again
      );
    }

    if (again) {
      setAmount("");
      setTitle("");
      setRentDesc("");
      if (kind === "food") setMeal(mealByTime());
      window.setTimeout(() => amountRef.current?.focus(), 0);
    }
  }

  function submit(event) {
    event.preventDefault();
    save(false);
  }

  function saveAndAddAnother() {
    if (formRef.current && !formRef.current.reportValidity()) return;
    save(true);
  }

  function changeKind(next) {
    setKind(next);
    setTitle("");
    if (next === "food") setMeal(mealByTime());
  }

  const suggestions = SUGGESTIONS[kind] || [];

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{isEditing ? "EDIT EXPENSE" : "NEW EXPENSE"}</span>
            <h2>{isEditing ? "Update expense" : "Add expense"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        {!isEditing && (
          <div className="type-tabs">
            {[
              ["travel", "Travel", <TrainFront key="travel" />],
              ["food", "Food", <Utensils key="food" />],
              ["snacks", "Snacks", <Coffee key="snacks" />],
              ["rent", "Rent", <BedDouble key="rent" />],
              ["other", "Other", <CircleDollarSign key="other" />]
            ].map(([key, label, icon]) => (
              <button
                type="button"
                key={key}
                className={kind === key ? "selected" : ""}
                onClick={() => changeKind(key)}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        <form ref={formRef} onSubmit={submit}>
          <label>
            Amount
            <input
              ref={amountRef}
              className="amount-input"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              placeholder="₹ 0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
              required
            />
          </label>

          <div className="chips">
            {QUICK_AMOUNTS.map((value) => (
              <button
                type="button"
                key={value}
                className={`chip ${Number(amount) === value ? "on" : ""}`}
                onClick={() => setAmount(String(value))}
              >
                ₹{value}
              </button>
            ))}
          </div>

          {kind === "travel" && (
            <label>
              Travel description
              <input
                placeholder="e.g. Bus, Train, Auto, Cab"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          )}

          {kind === "food" && (
            <>
              <label>
                Meal type
                <select value={meal} onChange={(event) => setMeal(event.target.value)}>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                </select>
              </label>
              <label>
                What did you eat?
                <input
                  placeholder="e.g. Idly, Meals, Dosa"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
            </>
          )}

          {kind === "snacks" && (
            <label>
              Snack name
              <input
                placeholder="e.g. Tea, Biscuit, Juice"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          )}

          {kind === "other" && (
            <>
              <label>
                Expense category
                <select
                  value={otherCategory}
                  onChange={(event) => setOtherCategory(event.target.value)}
                >
                  <option>Personal Care</option>
                  <option>Cleaning</option>
                  <option>Clothes Washing</option>
                  <option>Household Item</option>
                  <option>Bathroom Item</option>
                  <option>Miscellaneous</option>
                </select>
              </label>
              <label>
                Expense name
                <input
                  placeholder="e.g. Soap, Toothpaste, Hanger, Detergent"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
            </>
          )}

          {suggestions.length > 0 && (
            <div className="chips">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`chip ${title === item ? "on" : ""}`}
                  onClick={() => setTitle(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {kind === "rent" && (
            <>
              <label>
                Month
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                />
              </label>
              <label>
                Description <span className="optional">(optional)</span>
                <input
                  placeholder="e.g. September room rent"
                  value={rentDesc}
                  onChange={(event) => setRentDesc(event.target.value)}
                />
              </label>
            </>
          )}

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <div className="chips">
            <button
              type="button"
              className={`chip ${date === dateKey(0) ? "on" : ""}`}
              onClick={() => setDate(dateKey(0))}
            >
              Today
            </button>
            <button
              type="button"
              className={`chip ${date === dateKey(1) ? "on" : ""}`}
              onClick={() => setDate(dateKey(1))}
            >
              Yesterday
            </button>
          </div>

          <div className="save-row">
            <button className="save-btn" type="submit">
              <Check size={18} />
              {isEditing ? "Update expense" : "Save"}
            </button>

            {!isEditing && (
              <button
                className="save-btn secondary"
                type="button"
                onClick={saveAndAddAnother}
              >
                <Plus size={18} />
                Save & add another
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function MoneyModal({ initial, type, transactions, onClose, onSave }) {
  const [kind, setKind] = useState(type || "given");
  const [person, setPerson] = useState(initial?.person || "");
  const [date, setDate] = useState(initial?.date || today());
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentBalance = person.trim()
    ? getPersonBalance(transactions, person, initial?.id || null)
    : 0;

  const isEditing = Boolean(initial && initial.id);

  function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!person.trim()) {
      setError("Please enter the person's name.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (kind === "returned" && numericAmount > currentBalance) {
      setError(`You can return only up to ${money(currentBalance)}.`);
      return;
    }

    setError("");
    onSave({
      id: initial?.id,
      person: person.trim(),
      date,
      type: kind,
      amount: numericAmount
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal money-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{isEditing ? "EDIT TRANSACTION" : "MONEY TRACKING"}</span>
            <h2>{isEditing ? "Update transaction" : "Add money transaction"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="money-type-tabs">
          <button
            type="button"
            className={kind === "given" ? "selected" : ""}
            onClick={() => {
              setKind("given");
              setError("");
            }}
          >
            <ArrowDownLeft size={18} />
            <span>Money Given</span>
            <small>Received from person</small>
          </button>
          <button
            type="button"
            className={kind === "returned" ? "selected" : ""}
            onClick={() => {
              setKind("returned");
              setError("");
            }}
          >
            <ArrowUpRight size={18} />
            <span>Money Returned</span>
            <small>Amount paid back</small>
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Person's name
            <input
              autoFocus={!initial?.person}
              placeholder="e.g. Arun"
              value={person}
              onChange={(event) => {
                setPerson(event.target.value);
                setError("");
              }}
              required
            />
          </label>

          <label>
            Amount
            <input
              className="amount-input"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              placeholder="₹ 0"
              autoFocus={Boolean(initial?.person)}
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
              required
            />
          </label>

          <div className="chips">
            {QUICK_AMOUNTS.map((value) => (
              <button
                type="button"
                key={value}
                className={`chip ${Number(amount) === value ? "on" : ""}`}
                onClick={() => {
                  setAmount(String(value));
                  setError("");
                }}
              >
                ₹{value}
              </button>
            ))}
          </div>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          {kind === "returned" && person.trim() && (
            <div className="available-balance">
              <span>Available remaining balance</span>
              <strong>{money(currentBalance)}</strong>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="save-btn" type="submit">
            <Check size={18} />
            {isEditing ? "Update transaction" : "Save transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
