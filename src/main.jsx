import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Edit3,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  ReceiptText,
  Sparkles,
  Trash2,
  Utensils,
  Users,
  WalletCards,
  X,
  TrainFront
} from "lucide-react";
import "./styles.css";

const KEY = "roomlife-expenses-v1";

const today = () => new Date().toISOString().slice(0, 10);
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

function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [editing, setEditing] = useState(null);
  const [moneyEditing, setMoneyEditing] = useState(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

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
    const stamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `roomlife-expense-backup-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    flash("Backup downloaded");
  }

  function handleBackupUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

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

  function saveExpense(type, item) {
    setData((current) => {
      const arr = [...current[type]];
      const index = arr.findIndex((x) => x.id === item.id);

      if (index >= 0) arr[index] = item;
      else arr.push({ ...item, id: Date.now() });

      return { ...current, [type]: arr };
    });

    setEditing(null);
    flash(`${i18n(type)} saved`);
  }

  function saveMoneyTransaction(item) {
    const amount = Number(item.amount || 0);
    const person = item.person.trim();

    if (!person || amount <= 0) return;

    if (item.type === "returned") {
      const currentBalance = getPersonBalance(
        data.money,
        person,
        item.id
      );

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

    flash("All data deleted");
  }

  function i18n(type) {
    if (type === "rent") return "Room rent";
    if (type === "food") return "Food expense";
    if (type === "snacks") return "Snack expense";
    if (type === "other") return "Other expense";
    return "Travel expense";
  }

  function navigate(nextPage) {
    setPage(nextPage);
    setMenu(false);
  }

  return (
    <div className="app">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <WalletCards size={21} />
          </div>

          <div>
            <b>RoomLife</b>
            <span>Expense tracker</span>
          </div>

          <button
            className="icon-btn close-menu"
            onClick={() => setMenu(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <nav>
          <Nav
            active={page === "dashboard"}
            onClick={() => navigate("dashboard")}
            icon={<LayoutDashboard />}
          >
            Dashboard
          </Nav>

          <Nav
            active={page === "expenses"}
            onClick={() => navigate("expenses")}
            icon={<ReceiptText />}
          >
            All Expenses
          </Nav>

          <Nav
            active={page === "food"}
            onClick={() => navigate("food")}
            icon={<Utensils />}
          >
            Food Breakdown
          </Nav>

          <Nav
            active={page === "money"}
            onClick={() => navigate("money")}
            icon={<Users />}
          >
            Money Given & Received
          </Nav>
        </nav>

        <div className="sidebar-bottom">
          <div className="storage">
            <span className="dot" />
            <span>Stored on this device</span>
          </div>

          <div className="backup-actions">
            <button className="backup-btn" onClick={downloadBackup} type="button">
              <ArrowDownLeft size={15} />
              <span>Download backup</span>
            </button>

            <label className="backup-btn upload-btn">
              <ArrowUpRight size={15} />
              <span>Upload backup</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleBackupUpload}
                aria-label="Upload RoomLife backup"
              />
            </label>
          </div>

          <button className="danger-link" onClick={clearAll}>
            <Trash2 size={16} />
            Delete all data
          </button>
        </div>
      </aside>

      {menu && <div className="backdrop" onClick={() => setMenu(false)} />}

      <main>
        <header>
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div>
            <div className="eyebrow">PERSONAL FINANCE</div>
            <h1>
              {page === "dashboard"
                ? "Good to see you"
                : page === "food"
                  ? "Food breakdown"
                  : page === "money"
                    ? "Money tracking"
                    : "All expenses"}
            </h1>
          </div>

          {page === "money" ? (
            <button
              className="add-main"
              onClick={() => setMoneyEditing({ type: "given", item: null })}
            >
              <Plus size={18} />
              <span>Add money</span>
            </button>
          ) : (
            <button
              className="add-main"
              onClick={() =>
                setEditing({
                  type: "travel",
                  item: null
                })
              }
            >
              <Plus size={18} />
              <span>Add expense</span>
            </button>
          )}
        </header>

        {page === "dashboard" && (
          <Dashboard
            totals={totals}
            all={all}
            onAdd={setEditing}
            onMoneyAdd={() =>
              setMoneyEditing({ type: "given", item: null })
            }
            onView={() => setPage("expenses")}
            onMoneyView={() => setPage("money")}
          />
        )}

        {page === "expenses" && (
          <Expenses
            all={all}
            onEdit={setEditing}
            onDelete={remove}
          />
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
            onAdd={(options = {}) =>
              setMoneyEditing({
                type: "given",
                item: options.person ? { person: options.person } : null
              })
            }
            onEdit={(item) => setMoneyEditing({ type: item.type, item })}
            onDelete={removeMoney}
          />
        )}

        <footer>RoomLife • Your data stays on this device</footer>
      </main>

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
          <Check size={17} />
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

    return balance +
      (transaction.type === "given"
        ? Number(transaction.amount || 0)
        : -Number(transaction.amount || 0));
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

function Nav({ active, onClick, icon, children }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{children}</span>
      <ChevronRight className="nav-arrow" />
    </button>
  );
}

function Dashboard({
  totals,
  all,
  onAdd,
  onMoneyAdd,
  onView,
  onMoneyView
}) {
  return (
    <section className="content">
      <div className="hero-card">
        <div>
          <span className="hero-label">TOTAL SPENT</span>
          <div className="hero-total">{money(totals.grand)}</div>
          <p>Room rent, travel, food, snacks & other expenses</p>
        </div>

        <div className="hero-art">
          <Sparkles size={20} />
          <span>This month</span>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Expense overview</h2>
          <p>Everything at a glance</p>
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={<BedDouble />} title="Room Rent" value={totals.rent} cls="rent" />
        <Stat icon={<TrainFront />} title="Travel" value={totals.travel} cls="travel" />
        <Stat icon={<Utensils />} title="Food" value={totals.food} cls="food" />
        <Stat icon={<Coffee />} title="Snacks" value={totals.snacks} cls="snacks" />
        <Stat
          icon={<CircleDollarSign />}
          title="Other"
          value={totals.other}
          cls="other"
        />
      </div>

      <div className="grid-two">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Food breakdown</h2>
              <p>Meal-wise spending</p>
            </div>
            <button
              className="text-btn"
              onClick={() => onAdd({ type: "food", item: null })}
            >
              + Add food
            </button>
          </div>

          <MealRow label="Breakfast" value={totals.breakfast} />
          <MealRow label="Lunch" value={totals.lunch} />
          <MealRow label="Dinner" value={totals.dinner} />

          <div className="food-total">
            <span>Total food</span>
            <b>{money(totals.food)}</b>
          </div>
        </div>

        <div className="panel quick">
          <div className="panel-head">
            <div>
              <h2>Quick add</h2>
              <p>Record an expense in seconds</p>
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
          <div className="money-summary-icon"><Users size={20} /></div>
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
          <button className="secondary-btn" onClick={onMoneyView}>
            View history
          </button>
          <button className="dark-btn" onClick={onMoneyAdd}>
            <Plus size={16} /> Add money
          </button>
        </div>
      </div>

      <div className="panel recent">
        <div className="panel-head">
          <div>
            <h2>Recent expenses</h2>
            <p>Your latest activity</p>
          </div>
          <button className="text-btn" onClick={onView}>View all</button>
        </div>

        {all.length ? (
          all.slice(0, 5).map((x) => (
            <ExpenseRow key={`${x.type}-${x.id}`} x={x} />
          ))
        ) : (
          <Empty />
        )}
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

function MealRow({ label, value }) {
  return (
    <div className="meal-row">
      <span>{label}</span>
      <div className="bar">
        <i style={{ width: `${value ? Math.max(8, 100) : 0}%` }} />
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
      <Plus size={17} />
    </button>
  );
}

function Expenses({ all, onEdit, onDelete }) {
  return (
    <section className="content">
      <div className="filter-note">
        <CalendarDays size={18} />
        <span>Expenses are automatically saved with their date.</span>
      </div>

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
      <div className="food-banner">
        <Utensils size={22} />
        <div>
          <b>Food spending</b>
          <span>Track every meal and understand your daily food habits.</span>
        </div>
        <button onClick={() => onAdd({ type: "food", item: null })}>
          <Plus size={17} /> Add food
        </button>
      </div>

      <div className="stats-grid food-stats">
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
        </div>

        {data.length ? (
          [...data]
            .sort((a, b) => b.date.localeCompare(a.date))
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
            <Edit3 size={16} />
          </button>
          <button
            title="Delete"
            aria-label="Delete expense"
            onClick={() => onDelete(x.type, x.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="empty">
      <ReceiptText size={28} />
      <b>No expenses yet</b>
      <span>Add your first expense to see it here.</span>
    </div>
  );
}

function MoneyPage({ transactions, people, totals, onAdd, onEdit, onDelete }) {
  return (
    <section className="content">
      <div className="money-hero">
        <div className="money-hero-icon"><Users size={23} /></div>
        <div className="money-hero-copy">
          <span className="hero-label">MONEY BALANCE</span>
          <strong>{money(totals.moneyOutstanding)}</strong>
          <p>Amount currently outstanding from money you've received.</p>
        </div>
        <button className="money-add-btn" onClick={onAdd}>
          <Plus size={17} /> Add transaction
        </button>
      </div>

      <div className="money-stats-grid">
        <MoneyStat
          icon={<ArrowDownLeft />}
          title="Total Given"
          value={totals.moneyGiven}
          cls="given"
        />
        <MoneyStat
          icon={<ArrowUpRight />}
          title="Total Returned"
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

      <div className="money-section-heading">
        <div>
          <h2>People & balances</h2>
          <p>Each person has a separate transaction history.</p>
        </div>
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
        <div className="panel money-empty-panel">
          <div className="empty">
            <Users size={30} />
            <b>No money records yet</b>
            <span>Add a transaction to start tracking money given and returned.</span>
            <button className="dark-btn empty-add" onClick={onAdd}>
              <Plus size={16} /> Add first transaction
            </button>
          </div>
        </div>
      )}

      <div className="panel money-history-panel">
        <div className="panel-head">
          <div>
            <h2>All money transactions</h2>
            <p>{transactions.length} record{transactions.length === 1 ? "" : "s"}</p>
          </div>
          <History size={20} className="history-icon" />
        </div>

        {transactions.length ? (
          [...transactions]
            .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
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
        <Plus size={15} /> Add transaction for {person}
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
          <Edit3 size={16} />
        </button>
        <button
          title="Delete"
          aria-label="Delete money transaction"
          onClick={() => onDelete(transaction.id)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function ExpenseModal({ initial, type, onClose, onSave }) {
  const [kind, setKind] = useState(type);
  const [date, setDate] = useState(initial?.date || today());
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [description, setDescription] = useState(initial?.description || "");
  const [meal, setMeal] = useState(initial?.meal || "Breakfast");
  const [food, setFood] = useState(initial?.food || "");
  const [name, setName] = useState(initial?.name || "");
  const [month, setMonth] = useState(initial?.month || "");
  const [rentDesc, setRentDesc] = useState(initial?.description || "");
  const [otherCategory, setOtherCategory] = useState(
    initial?.category || "Miscellaneous"
  );

  function submit(event) {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) return;

    const common = {
      id: initial?.id,
      date,
      amount: Number(amount)
    };

    if (kind === "travel") {
      onSave("travel", {
        ...common,
        description: description.trim() || "Travel"
      });
    }

    if (kind === "food") {
      onSave("food", {
        ...common,
        meal,
        food: food.trim() || "Food"
      });
    }

    if (kind === "snacks") {
      onSave("snacks", {
        ...common,
        name: name.trim() || "Snack"
      });
    }

    if (kind === "rent") {
      onSave("rent", {
        ...common,
        month: month || date.slice(0, 7),
        description: rentDesc.trim() || "Room rent"
      });
    }

    if (kind === "other") {
      onSave("other", {
        ...common,
        category: otherCategory,
        name: name.trim() || "Other expense"
      });
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{initial ? "EDIT EXPENSE" : "NEW EXPENSE"}</span>
            <h2>{initial ? "Update expense" : "Add expense"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

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
              onClick={() => setKind(key)}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          {kind === "travel" && (
            <label>
              Travel description
              <input
                placeholder="e.g. Bus, Train, Auto, Cab"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
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
                  value={food}
                  onChange={(event) => setFood(event.target.value)}
                />
              </label>
            </>
          )}

          {kind === "snacks" && (
            <label>
              Snack name
              <input
                placeholder="e.g. Tea, Biscuit, Juice"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
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
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            </>
          )}

          <label>
            Amount
            <input
              className="amount-input"
              type="number"
              min="1"
              step="0.01"
              placeholder="₹ 0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <button className="save-btn" type="submit">
            <Check size={18} />
            {initial ? "Update expense" : "Save expense"}
          </button>
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

  const currentBalance = person.trim()
    ? getPersonBalance(transactions, person, initial?.id || null)
    : 0;

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
    <div className="modal-backdrop">
      <div className="modal money-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{initial ? "EDIT TRANSACTION" : "MONEY TRACKING"}</span>
            <h2>{initial ? "Update transaction" : "Add money transaction"}</h2>
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
              autoFocus
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
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            Amount
            <input
              className="amount-input"
              type="number"
              min="1"
              step="0.01"
              placeholder="₹ 0"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
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
            {initial ? "Update transaction" : "Save transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
