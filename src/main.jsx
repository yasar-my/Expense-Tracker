import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  BarChart3,
  BedDouble,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Edit3,
  FileText,
  HandCoins,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Plus,
  ReceiptText,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Utensils,
  X,
  TrainFront,
  WalletCards
} from "lucide-react";
import "./styles.css";

const KEY = "roomlife-expenses-v1";
const MONEY_KEY = "roomlife-money-v1";

const today = () => new Date().toISOString().slice(0, 10);

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

const starter = {
  travel: [],
  food: [],
  snacks: [],
  rent: [],
  other: []
};

const moneyStarter = {
  transactions: []
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));

    if (!saved) {
      return starter;
    }

    return {
      ...starter,
      ...saved,
      travel: Array.isArray(saved.travel) ? saved.travel : [],
      food: Array.isArray(saved.food) ? saved.food : [],
      snacks: Array.isArray(saved.snacks) ? saved.snacks : [],
      rent: Array.isArray(saved.rent) ? saved.rent : [],
      other: Array.isArray(saved.other) ? saved.other : []
    };
  } catch {
    return starter;
  }
}

function loadMoneyData() {
  try {
    const saved = JSON.parse(localStorage.getItem(MONEY_KEY));

    if (!saved) {
      return moneyStarter;
    }

    return {
      ...moneyStarter,
      ...saved,
      transactions: Array.isArray(saved.transactions)
        ? saved.transactions
        : []
    };
  } catch {
    return moneyStarter;
  }
}

function App() {
  const [data, setData] = useState(loadData);
  const [moneyData, setMoneyData] = useState(loadMoneyData);

  const [page, setPage] = useState("dashboard");

  const [editing, setEditing] = useState(null);
  const [moneyEditing, setMoneyEditing] = useState(null);

  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(MONEY_KEY, JSON.stringify(moneyData));
  }, [moneyData]);

  const totals = useMemo(() => {
    const sum = (a) =>
      a.reduce((s, x) => s + Number(x.amount || 0), 0);

    const breakfast = sum(
      data.food.filter((x) => x.meal === "Breakfast")
    );

    const lunch = sum(
      data.food.filter((x) => x.meal === "Lunch")
    );

    const dinner = sum(
      data.food.filter((x) => x.meal === "Dinner")
    );

    const food = breakfast + lunch + dinner;

    const travel = sum(data.travel);
    const snacks = sum(data.snacks);
    const rent = sum(data.rent);
    const other = sum(data.other);

    return {
      breakfast,
      lunch,
      dinner,
      food,
      travel,
      snacks,
      rent,
      other,
      grand:
        breakfast +
        lunch +
        dinner +
        travel +
        snacks +
        rent +
        other
    };
  }, [data]);

  const all = useMemo(
    () =>
      [
        ...data.rent.map((x) => ({
          ...x,
          type: "rent",
          label: "Room Rent"
        })),

        ...data.travel.map((x) => ({
          ...x,
          type: "travel",
          label: x.description
        })),

        ...data.food.map((x) => ({
          ...x,
          type: "food",
          label: `${x.meal} • ${x.food}`
        })),

        ...data.snacks.map((x) => ({
          ...x,
          type: "snacks",
          label: x.name
        })),

        ...data.other.map((x) => ({
          ...x,
          type: "other",
          label: x.name
        }))
      ].sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          Number(b.id || 0) - Number(a.id || 0)
      ),
    [data]
  );

  const moneyPeople = useMemo(() => {
    const people = {};

    moneyData.transactions.forEach((transaction) => {
      const name = transaction.person.trim();

      if (!name) return;

      if (!people[name]) {
        people[name] = {
          person: name,
          given: 0,
          returned: 0,
          transactions: []
        };
      }

      if (transaction.type === "given") {
        people[name].given += Number(transaction.amount || 0);
      }

      if (transaction.type === "returned") {
        people[name].returned += Number(transaction.amount || 0);
      }

      people[name].transactions.push(transaction);
    });

    return Object.values(people)
      .map((person) => ({
        ...person,
        remaining: Math.max(
          0,
          person.given - person.returned
        )
      }))
      .sort((a, b) => b.remaining - a.remaining);
  }, [moneyData]);

  const moneyTotals = useMemo(() => {
    const given = moneyData.transactions
      .filter((x) => x.type === "given")
      .reduce((sum, x) => sum + Number(x.amount || 0), 0);

    const returned = moneyData.transactions
      .filter((x) => x.type === "returned")
      .reduce((sum, x) => sum + Number(x.amount || 0), 0);

    return {
      given,
      returned,
      remaining: Math.max(0, given - returned)
    };
  }, [moneyData]);

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 1800);
  }

  function saveExpense(type, item) {
    setData((d) => {
      const arr = [...d[type]];

      const i = arr.findIndex(
        (x) => x.id === item.id
      );

      if (i >= 0) {
        arr[i] = item;
      } else {
        arr.push({
          ...item,
          id: Date.now()
        });
      }

      return {
        ...d,
        [type]: arr
      };
    });

    setEditing(null);

    setToast(`${i18n(type)} saved`);

    setTimeout(() => {
      setToast("");
    }, 1800);
  }

  function remove(type, id) {
    if (
      !confirm(
        "Are you sure you want to delete this expense?"
      )
    ) {
      return;
    }

    setData((d) => ({
      ...d,
      [type]: d[type].filter(
        (x) => x.id !== id
      )
    }));

    showToast("Expense deleted");
  }

  function clearAll() {
    if (
      !confirm(
        "Are you sure you want to delete all expense data? This action cannot be undone."
      )
    ) {
      return;
    }

    setData(starter);

    showToast("All expense data deleted");
  }

  function i18n(type) {
    if (type === "rent") return "Room rent";
    if (type === "food") return "Food expense";
    if (type === "snacks") return "Snack expense";
    if (type === "other") return "Other expense";

    return "Travel expense";
  }

  function saveMoneyTransaction(item) {
    const amount = Number(item.amount || 0);

    if (!item.person.trim() || !amount || amount <= 0) {
      return;
    }

    if (item.type === "returned") {
      const alreadyReturned = moneyData.transactions
        .filter(
          (x) =>
            x.person.trim().toLowerCase() ===
              item.person.trim().toLowerCase() &&
            x.type === "returned" &&
            x.id !== item.id
        )
        .reduce(
          (sum, x) =>
            sum + Number(x.amount || 0),
          0
        );

      const totalGiven = moneyData.transactions
        .filter(
          (x) =>
            x.person.trim().toLowerCase() ===
              item.person.trim().toLowerCase() &&
            x.type === "given"
        )
        .reduce(
          (sum, x) =>
            sum + Number(x.amount || 0),
          0
        );

      const remaining =
        totalGiven - alreadyReturned;

      if (amount > remaining) {
        showToast(
          `Maximum returnable amount is ${money(
            remaining
          )}`
        );
        return;
      }
    }

    setMoneyData((d) => {
      const transactions = [...d.transactions];

      const index = transactions.findIndex(
        (x) => x.id === item.id
      );

      if (index >= 0) {
        transactions[index] = item;
      } else {
        transactions.push({
          ...item,
          id: Date.now()
        });
      }

      return {
        ...d,
        transactions
      };
    });

    setMoneyEditing(null);

    showToast(
      item.type === "given"
        ? "Money received saved"
        : "Money returned saved"
    );
  }

  function removeMoneyTransaction(id) {
    if (
      !confirm(
        "Are you sure you want to delete this money transaction?"
      )
    ) {
      return;
    }

    setMoneyData((d) => ({
      ...d,
      transactions: d.transactions.filter(
        (x) => x.id !== id
      )
    }));

    showToast("Money transaction deleted");
  }

  function clearMoneyData() {
    if (
      !confirm(
        "Are you sure you want to delete all money given/returned data? This action cannot be undone."
      )
    ) {
      return;
    }

    setMoneyData(moneyStarter);

    showToast("Money tracking data deleted");
  }

  return (
    <div className="app">
      <aside
        className={`sidebar ${
          menu ? "open" : ""
        }`}
      >
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
          >
            <X />
          </button>
        </div>

        <nav>
          <Nav
            active={page === "dashboard"}
            onClick={() => {
              setPage("dashboard");
              setMenu(false);
            }}
            icon={<LayoutDashboard />}
          >
            Dashboard
          </Nav>

          <Nav
            active={page === "expenses"}
            onClick={() => {
              setPage("expenses");
              setMenu(false);
            }}
            icon={<ReceiptText />}
          >
            All Expenses
          </Nav>

          <Nav
            active={page === "food"}
            onClick={() => {
              setPage("food");
              setMenu(false);
            }}
            icon={<Utensils />}
          >
            Food Breakdown
          </Nav>

          <Nav
            active={page === "money"}
            onClick={() => {
              setPage("money");
              setMenu(false);
            }}
            icon={<HandCoins />}
          >
            Money Tracking
          </Nav>
        </nav>

        <div className="sidebar-bottom">
          <div className="storage">
            <span className="dot" />
            <span>Stored on this device</span>
          </div>

          <button
            className="danger-link"
            onClick={clearAll}
          >
            <Trash2 size={16} />
            Delete all expense data
          </button>

          <button
            className="danger-link money-danger"
            onClick={clearMoneyData}
          >
            <Trash2 size={16} />
            Delete money data
          </button>
        </div>
      </aside>

      {menu && (
        <div
          className="backdrop"
          onClick={() => setMenu(false)}
        />
      )}

      <main>
        <header>
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>

          <div>
            <div className="eyebrow">
              PERSONAL FINANCE
            </div>

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

          {page !== "money" ? (
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
              Add expense
            </button>
          ) : (
            <button
              className="add-main"
              onClick={() =>
                setMoneyEditing({
                  type: "given",
                  item: null
                })
              }
            >
              <Plus size={18} />
              Add money
            </button>
          )}
        </header>

        {page === "dashboard" && (
          <Dashboard
            totals={totals}
            all={all}
            onAdd={setEditing}
            onView={() => setPage("expenses")}
            moneyTotals={moneyTotals}
            moneyPeople={moneyPeople}
            onMoneyAdd={setMoneyEditing}
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
          <MoneyTracking
            transactions={moneyData.transactions}
            people={moneyPeople}
            totals={moneyTotals}
            onAdd={setMoneyEditing}
            onEdit={setMoneyEditing}
            onDelete={removeMoneyTransaction}
          />
        )}

        <footer>
          RoomLife • Your expenses stay on this device
        </footer>
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
          transactions={moneyData.transactions}
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

function Nav({
  active,
  onClick,
  icon,
  children
}) {
  return (
    <button
      className={`nav-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
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
  onView,
  moneyTotals,
  moneyPeople,
  onMoneyAdd,
  onMoneyView
}) {
  return (
    <section className="content">
      <div className="hero-card">
        <div>
          <span className="hero-label">
            TOTAL SPENT
          </span>

          <div className="hero-total">
            {money(totals.grand)}
          </div>

          <p>
            Room rent, travel, food, snacks & other
            expenses
          </p>
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
        <Stat
          icon={<BedDouble />}
          title="Room Rent"
          value={totals.rent}
          cls="rent"
        />

        <Stat
          icon={<TrainFront />}
          title="Travel"
          value={totals.travel}
          cls="travel"
        />

        <Stat
          icon={<Utensils />}
          title="Food"
          value={totals.food}
          cls="food"
        />

        <Stat
          icon={<Coffee />}
          title="Snacks"
          value={totals.snacks}
          cls="snacks"
        />

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
              onClick={() =>
                onAdd({
                  type: "food",
                  item: null
                })
              }
            >
              + Add food
            </button>
          </div>

          <MealRow
            label="Breakfast"
            value={totals.breakfast}
          />

          <MealRow
            label="Lunch"
            value={totals.lunch}
          />

          <MealRow
            label="Dinner"
            value={totals.dinner}
          />

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
            onClick={() =>
              onAdd({
                type: "travel",
                item: null
              })
            }
          />

          <Quick
            icon={<Utensils />}
            label="Food"
            onClick={() =>
              onAdd({
                type: "food",
                item: null
              })
            }
          />

          <Quick
            icon={<Coffee />}
            label="Snacks"
            onClick={() =>
              onAdd({
                type: "snacks",
                item: null
              })
            }
          />

          <Quick
            icon={<BedDouble />}
            label="Room rent"
            onClick={() =>
              onAdd({
                type: "rent",
                item: null
              })
            }
          />

          <Quick
            icon={<CircleDollarSign />}
            label="Other expenses"
            onClick={() =>
              onAdd({
                type: "other",
                item: null
              })
            }
          />
        </div>
      </div>

      <div className="money-dashboard-card">
        <div className="money-dashboard-head">
          <div className="money-dashboard-icon">
            <HandCoins size={21} />
          </div>

          <div>
            <h2>Money given & returned</h2>
            <p>
              Track money received from people and
              returned amounts.
            </p>
          </div>

          <button
            className="text-btn"
            onClick={onMoneyView}
          >
            View
          </button>
        </div>

        <div className="money-mini-grid">
          <div>
            <span>Total given</span>
            <strong>{money(moneyTotals.given)}</strong>
          </div>

          <div>
            <span>Total returned</span>
            <strong>{money(moneyTotals.returned)}</strong>
          </div>

          <div>
            <span>Outstanding</span>
            <strong>
              {money(moneyTotals.remaining)}
            </strong>
          </div>
        </div>

        {moneyPeople.length > 0 && (
          <div className="money-mini-people">
            {moneyPeople.slice(0, 3).map((person) => (
              <div
                className="money-mini-person"
                key={person.person}
              >
                <div className="person-avatar">
                  {person.person
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <b>{person.person}</b>
                  <span>
                    Outstanding{" "}
                    {money(person.remaining)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="money-add-button"
          onClick={() =>
            onMoneyAdd({
              type: "given",
              item: null
            })
          }
        >
          <Plus size={17} />
          Record money
        </button>
      </div>

      <div className="panel recent">
        <div className="panel-head">
          <div>
            <h2>Recent expenses</h2>
            <p>Your latest activity</p>
          </div>

          <button
            className="text-btn"
            onClick={onView}
          >
            View all
          </button>
        </div>

        {all.length ? (
          all
            .slice(0, 5)
            .map((x) => (
              <ExpenseRow
                key={`${x.type}-${x.id}`}
                x={x}
              />
            ))
        ) : (
          <Empty />
        )}
      </div>
    </section>
  );
}

function Stat({
  icon,
  title,
  value,
  cls
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${cls}`}>
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{money(value)}</strong>
      </div>
    </div>
  );
}

function MealRow({
  label,
  value
}) {
  return (
    <div className="meal-row">
      <span>{label}</span>

      <div className="bar">
        <i
          style={{
            width: `${
              value
                ? Math.max(
                    8,
                    Math.min(
                      100,
                      (value /
                        Math.max(value, 1)) *
                        100
                    )
                  )
                : 0
            }%`
          }}
        />
      </div>

      <b>{money(value)}</b>
    </div>
  );
}

function Quick({
  icon,
  label,
  onClick
}) {
  return (
    <button
      className="quick-row"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      <Plus size={17} />
    </button>
  );
}

function Expenses({
  all,
  onEdit,
  onDelete
}) {
  return (
    <section className="content">
      <div className="filter-note">
        <CalendarDays size={18} />

        <span>
          Expenses are automatically saved with
          their date.
        </span>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Expense history</h2>
            <p>
              {all.length} record
              {all.length === 1 ? "" : "s"}
            </p>
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

function Food({
  data,
  totals,
  onAdd,
  onEdit,
  onDelete
}) {
  return (
    <section className="content">
      <div className="food-banner">
        <Utensils size={22} />

        <div>
          <b>Food spending</b>
          <span>
            Track every meal and understand your
            daily food habits.
          </span>
        </div>

        <button
          onClick={() =>
            onAdd({
              type: "food",
              item: null
            })
          }
        >
          <Plus size={17} />
          Add food
        </button>
      </div>

      <div className="stats-grid food-stats">
        <Stat
          icon={<span>☀</span>}
          title="Breakfast"
          value={totals.breakfast}
          cls="morning"
        />

        <Stat
          icon={<span>◐</span>}
          title="Lunch"
          value={totals.lunch}
          cls="afternoon"
        />

        <Stat
          icon={<span>☾</span>}
          title="Dinner"
          value={totals.dinner}
          cls="evening"
        />

        <Stat
          icon={<Utensils />}
          title="Total Food"
          value={totals.food}
          cls="food"
        />
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
            .sort((a, b) =>
              b.date.localeCompare(a.date)
            )
            .map((x) => (
              <ExpenseRow
                key={x.id}
                x={{
                  ...x,
                  type: "food",
                  label: `${x.meal} • ${x.food}`
                }}
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

function ExpenseRow({
  x,
  actions,
  onEdit,
  onDelete
}) {
  const icon =
    x.type === "travel" ? (
      <TrainFront />
    ) : x.type === "food" ? (
      <Utensils />
    ) : x.type === "snacks" ? (
      <Coffee />
    ) : x.type === "other" ? (
      <CircleDollarSign />
    ) : (
      <BedDouble />
    );

  return (
    <div className="expense-row">
      <div className={`row-icon ${x.type}`}>
        {icon}
      </div>

      <div className="expense-info">
        <b>
          {x.label ||
            x.description ||
            x.name}
        </b>

        <span>
          {x.date}

          {x.type === "food" &&
            ` • ${x.food}`}

          {x.type === "other" &&
            x.category &&
            ` • ${x.category}`}
        </span>
      </div>

      <strong className="row-amount">
        {money(x.amount)}
      </strong>

      {actions && (
        <div className="row-actions">
          <button
            title="Edit"
            onClick={() =>
              onEdit({
                type: x.type,
                item: x
              })
            }
          >
            <Edit3 size={16} />
          </button>

          <button
            title="Delete"
            onClick={() =>
              onDelete(x.type, x.id)
            }
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

      <span>
        Add your first expense to see it here.
      </span>
    </div>
  );
}

function ExpenseModal({
  initial,
  type,
  onClose,
  onSave
}) {
  const [kind, setKind] = useState(type);

  const [date, setDate] = useState(
    initial?.date || today()
  );

  const [amount, setAmount] = useState(
    initial?.amount ?? ""
  );

  const [description, setDescription] =
    useState(
      initial?.description || ""
    );

  const [meal, setMeal] = useState(
    initial?.meal || "Breakfast"
  );

  const [food, setFood] = useState(
    initial?.food || ""
  );

  const [name, setName] = useState(
    initial?.name || ""
  );

  const [month, setMonth] = useState(
    initial?.month || ""
  );

  const [rentDesc, setRentDesc] =
    useState(
      initial?.description || ""
    );

  const [otherCategory, setOtherCategory] =
    useState(
      initial?.category || "Miscellaneous"
    );

  function submit(e) {
    e.preventDefault();

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      return;
    }

    const common = {
      id: initial?.id,
      date,
      amount: Number(amount)
    };

    if (kind === "travel") {
      onSave("travel", {
        ...common,
        description:
          description.trim() || "Travel"
      });
    }

    if (kind === "food") {
      onSave("food", {
        ...common,
        meal,
        food:
          food.trim() || "Food"
      });
    }

    if (kind === "snacks") {
      onSave("snacks", {
        ...common,
        name:
          name.trim() || "Snack"
      });
    }

    if (kind === "rent") {
      onSave("rent", {
        ...common,
        month:
          month ||
          date.slice(0, 7),
        description:
          rentDesc.trim() ||
          "Room rent"
      });
    }

    if (kind === "other") {
      onSave("other", {
        ...common,
        category: otherCategory,
        name:
          name.trim() ||
          "Other expense"
      });
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              {initial
                ? "EDIT EXPENSE"
                : "NEW EXPENSE"}
            </span>

            <h2>
              {initial
                ? "Update expense"
                : "Add expense"}
            </h2>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        <div className="type-tabs">
          {[
            [
              "travel",
              "Travel",
              <TrainFront />
            ],
            [
              "food",
              "Food",
              <Utensils />
            ],
            [
              "snacks",
              "Snacks",
              <Coffee />
            ],
            [
              "rent",
              "Rent",
              <BedDouble />
            ],
            [
              "other",
              "Other",
              <CircleDollarSign />
            ]
          ].map(
            ([k, l, i]) => (
              <button
                type="button"
                key={k}
                className={
                  kind === k
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setKind(k)
                }
              >
                {i}
                <span>{l}</span>
              </button>
            )
          )}
        </div>

        <form onSubmit={submit}>
          <label>
            Date

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
            />
          </label>

          {kind === "travel" && (
            <label>
              Travel description

              <input
                placeholder="e.g. Bus, Train, Auto, Cab"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </label>
          )}

          {kind === "food" && (
            <>
              <label>
                Meal type

                <select
                  value={meal}
                  onChange={(e) =>
                    setMeal(
                      e.target.value
                    )
                  }
                >
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
                  onChange={(e) =>
                    setFood(
                      e.target.value
                    )
                  }
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
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
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
                  onChange={(e) =>
                    setMonth(
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Description{" "}
                <span className="optional">
                  (optional)
                </span>

                <input
                  placeholder="e.g. September room rent"
                  value={rentDesc}
                  onChange={(e) =>
                    setRentDesc(
                      e.target.value
                    )
                  }
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
                  onChange={(e) =>
                    setOtherCategory(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Personal Care
                  </option>
                  <option>
                    Cleaning
                  </option>
                  <option>
                    Clothes Washing
                  </option>
                  <option>
                    Household Item
                  </option>
                  <option>
                    Bathroom Item
                  </option>
                  <option>
                    Miscellaneous
                  </option>
                </select>
              </label>

              <label>
                Expense name

                <input
                  placeholder="e.g. Soap, Toothpaste, Hanger, Detergent"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
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
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              required
            />
          </label>

          <button
            className="save-btn"
            type="submit"
          >
            <Check size={18} />

            {initial
              ? "Update expense"
              : "Save expense"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MoneyTracking({
  transactions,
  people,
  totals,
  onAdd,
  onEdit,
  onDelete
}) {
  return (
    <section className="content">
      <div className="money-hero">
        <div className="money-hero-icon">
          <HandCoins size={25} />
        </div>

        <div>
          <span className="hero-label">
            MONEY OUTSTANDING
          </span>

          <div className="money-hero-total">
            {money(totals.remaining)}
          </div>

          <p>
            Money received from others and
            returned by you.
          </p>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Money overview</h2>
          <p>Track your received and returned money</p>
        </div>
      </div>

      <div className="stats-grid money-stats">
        <Stat
          icon={<TrendingUp />}
          title="Total Given"
          value={totals.given}
          cls="money-given"
        />

        <Stat
          icon={<TrendingDown />}
          title="Total Returned"
          value={totals.returned}
          cls="money-returned"
        />

        <Stat
          icon={<HandCoins />}
          title="Outstanding"
          value={totals.remaining}
          cls="money-balance"
        />
      </div>

      <div className="money-actions">
        <button
          className="money-action primary"
          onClick={() =>
            onAdd({
              type: "given",
              item: null
            })
          }
        >
          <TrendingUp size={18} />
          <span>
            <b>Money given</b>
            <small>Record money received</small>
          </span>
          <Plus size={17} />
        </button>

        <button
          className="money-action"
          onClick={() =>
            onAdd({
              type: "returned",
              item: null
            })
          }
        >
          <TrendingDown size={18} />
          <span>
            <b>Money returned</b>
            <small>Record money you returned</small>
          </span>
          <Plus size={17} />
        </button>
      </div>

      <div className="section-head money-section-title">
        <div>
          <h2>People & balances</h2>
          <p>
            Your current outstanding amounts
          </p>
        </div>
      </div>

      {people.length ? (
        <div className="people-grid">
          {people.map((person) => (
            <PersonCard
              key={person.person}
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
          <div className="money-empty">
            <div className="money-empty-icon">
              <Users size={27} />
            </div>

            <b>No money records yet</b>

            <span>
              Add a person and record money
              received from them.
            </span>

            <button
              className="money-add-button"
              onClick={() =>
                onAdd({
                  type: "given",
                  item: null
                })
              }
            >
              <Plus size={17} />
              Add first record
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function PersonCard({
  person,
  transactions,
  onAdd,
  onEdit,
  onDelete
}) {
  const [expanded, setExpanded] =
    useState(false);

  const personTransactions =
    transactions
      .filter(
        (x) =>
          x.person.trim().toLowerCase() ===
          person.person.trim().toLowerCase()
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          Number(b.id || 0) -
            Number(a.id || 0)
      );

  return (
    <div className="person-card">
      <div className="person-card-head">
        <div className="person-main">
          <div className="person-avatar large">
            {person.person
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h3>{person.person}</h3>
            <span>
              {personTransactions.length} transaction
              {personTransactions.length === 1
                ? ""
                : "s"}
            </span>
          </div>
        </div>

        <div className="balance-box">
          <span>Remaining</span>
          <strong>
            {money(person.remaining)}
          </strong>
        </div>
      </div>

      <div className="person-summary">
        <div>
          <span>Given</span>
          <b>{money(person.given)}</b>
        </div>

        <div>
          <span>Returned</span>
          <b>{money(person.returned)}</b>
        </div>

        <div>
          <span>Balance</span>
          <b>{money(person.remaining)}</b>
        </div>
      </div>

      <div className="person-progress">
        <div>
          <span>Repayment progress</span>

          <b>
            {person.given > 0
              ? Math.min(
                  100,
                  Math.round(
                    (person.returned /
                      person.given) *
                      100
                  )
                )
              : 0}
            %
          </b>
        </div>

        <div className="progress-track">
          <i
            style={{
              width: `${
                person.given > 0
                  ? Math.min(
                      100,
                      (person.returned /
                        person.given) *
                        100
                    )
                  : 0
              }%`
            }}
          />
        </div>
      </div>

      <div className="person-buttons">
        <button
          onClick={() =>
            onAdd({
              type: "returned",
              item: {
                person: person.person
              }
            })
          }
        >
          <TrendingDown size={16} />
          Return money
        </button>

        <button
          onClick={() =>
            setExpanded(!expanded)
          }
        >
          {expanded ? "Hide history" : "View history"}
          <ChevronRight
            size={16}
            className={
              expanded ? "rotate-icon" : ""
            }
          />
        </button>
      </div>

      {expanded && (
        <div className="person-history">
          <div className="history-title">
            <div>
              <b>{person.person}'s history</b>
              <span>Complete transaction history</span>
            </div>

            <button
              className="history-add"
              onClick={() =>
                onAdd({
                  type: "given",
                  item: {
                    person: person.person
                  }
                })
              }
            >
              <Plus size={15} />
            </button>
          </div>

          {personTransactions.map(
            (transaction) => {
              const balanceAfter =
                getBalanceAfterTransaction(
                  personTransactions,
                  transaction.id
                );

              return (
                <div
                  className="money-transaction"
                  key={transaction.id}
                >
                  <div
                    className={`transaction-icon ${
                      transaction.type
                    }`}
                  >
                    {transaction.type ===
                    "given" ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>

                  <div className="transaction-info">
                    <b>
                      {transaction.type ===
                      "given"
                        ? "Given"
                        : "Returned"}
                    </b>

                    <span>
                      {formatDate(
                        transaction.date
                      )}
                    </span>
                  </div>

                  <div className="transaction-amount">
                    <strong
                      className={
                        transaction.type
                      }
                    >
                      {transaction.type ===
                      "given"
                        ? "+"
                        : "-"}
                      {money(
                        transaction.amount
                      )}
                    </strong>

                    <span>
                      Balance{" "}
                      {money(balanceAfter)}
                    </span>
                  </div>

                  <div className="row-actions">
                    <button
                      title="Edit"
                      onClick={() =>
                        onEdit({
                          type:
                            transaction.type,
                          item: transaction
                        })
                      }
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      title="Delete"
                      onClick={() =>
                        onDelete(
                          transaction.id
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

function getBalanceAfterTransaction(
  transactions,
  transactionId
) {
  const sorted = [...transactions].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      Number(a.id || 0) -
        Number(b.id || 0)
  );

  let balance = 0;

  for (const transaction of sorted) {
    if (transaction.type === "given") {
      balance += Number(
        transaction.amount || 0
      );
    } else {
      balance -= Number(
        transaction.amount || 0
      );
    }

    if (transaction.id === transactionId) {
      return Math.max(0, balance);
    }
  }

  return Math.max(0, balance);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}

function MoneyModal({
  initial,
  type,
  transactions,
  onClose,
  onSave
}) {
  const [kind, setKind] =
    useState(type || "given");

  const [person, setPerson] =
    useState(
      initial?.person || ""
    );

  const [date, setDate] =
    useState(
      initial?.date || today()
    );

  const [amount, setAmount] =
    useState(
      initial?.amount ?? ""
    );

  const [error, setError] =
    useState("");

  const normalizedPerson =
    person.trim().toLowerCase();

  const totalGiven =
    transactions
      .filter(
        (x) =>
          x.person.trim().toLowerCase() ===
            normalizedPerson &&
          x.type === "given" &&
          x.id !== initial?.id
      )
      .reduce(
        (sum, x) =>
          sum + Number(x.amount || 0),
        0
      );

  const totalReturned =
    transactions
      .filter(
        (x) =>
          x.person.trim().toLowerCase() ===
            normalizedPerson &&
          x.type === "returned" &&
          x.id !== initial?.id
      )
      .reduce(
        (sum, x) =>
          sum + Number(x.amount || 0),
        0
      );

  const availableBalance =
    Math.max(
      0,
      totalGiven - totalReturned
    );

  function submit(e) {
    e.preventDefault();

    const value = Number(amount);

    if (!person.trim()) {
      setError("Please enter the person's name.");
      return;
    }

    if (!value || value <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (
      kind === "returned" &&
      value > availableBalance
    ) {
      setError(
        `You can return maximum ${money(
          availableBalance
        )}.`
      );
      return;
    }

    setError("");

    onSave({
      id: initial?.id,
      person: person.trim(),
      date,
      amount: value,
      type: kind
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal money-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              {initial
                ? "EDIT TRANSACTION"
                : "MONEY TRACKING"}
            </span>

            <h2>
              {initial
                ? "Update transaction"
                : "Record money"}
            </h2>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        <div className="money-type-tabs">
          <button
            type="button"
            className={
              kind === "given"
                ? "selected"
                : ""
            }
            onClick={() => {
              setKind("given");
              setError("");
            }}
          >
            <TrendingUp size={18} />

            <span>Money Given</span>

            <small>
              Received from person
            </small>
          </button>

          <button
            type="button"
            className={
              kind === "returned"
                ? "selected"
                : ""
            }
            onClick={() => {
              setKind("returned");
              setError("");
            }}
          >
            <TrendingDown size={18} />

            <span>Money Returned</span>

            <small>
              Amount you returned
            </small>
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Person's name

            <div className="input-with-icon">
              <UserRound size={17} />

              <input
                type="text"
                placeholder="e.g. Arun"
                value={person}
                onChange={(e) => {
                  setPerson(
                    e.target.value
                  );
                  setError("");
                }}
                required
              />
            </div>
          </label>

          <label>
            Date

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              required
            />
          </label>

          <label>
            Amount

            <div className="input-with-icon amount-wrapper">
              <IndianRupee size={17} />

              <input
                className="amount-input"
                type="number"
                min="1"
                step="0.01"
                placeholder="₹ 0"
                value={amount}
                onChange={(e) => {
                  setAmount(
                    e.target.value
                  );
                  setError("");
                }}
                required
              />
            </div>
          </label>

          {kind === "returned" && (
            <div className="available-balance">
              <div>
                <span>Available balance</span>
                <strong>
                  {money(
                    availableBalance
                  )}
                </strong>
              </div>

              <HandCoins size={21} />
            </div>
          )}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="save-btn"
            type="submit"
          >
            <Check size={18} />

            {initial
              ? "Update transaction"
              : kind === "given"
              ? "Save money received"
              : "Save money returned"}
          </button>
        </form>
      </div>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);