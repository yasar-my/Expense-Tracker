import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, BarChart3, BedDouble, CalendarDays, Check, ChevronRight,
  CircleDollarSign, Coffee, Edit3, FileText, IndianRupee, LayoutDashboard,
  Menu, Plus, ReceiptText, Sparkles, Trash2, Utensils, X, TrainFront,
  WalletCards
} from "lucide-react";
import "./styles.css";

const KEY = "roomlife-expenses-v1";
const today = () => new Date().toISOString().slice(0, 10);
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const starter = {
  travel: [],
  food: [],
  snacks: [],
  rent: []
};

function loadData() {
  try { return JSON.parse(localStorage.getItem(KEY)) || starter; }
  catch { return starter; }
}

function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  const totals = useMemo(() => {
    const sum = a => a.reduce((s, x) => s + Number(x.amount || 0), 0);
    const breakfast = sum(data.food.filter(x => x.meal === "Breakfast"));
    const lunch = sum(data.food.filter(x => x.meal === "Lunch"));
    const dinner = sum(data.food.filter(x => x.meal === "Dinner"));
    const food = breakfast + lunch + dinner;
    const travel = sum(data.travel), snacks = sum(data.snacks), rent = sum(data.rent);
    return { breakfast, lunch, dinner, food, travel, snacks, rent, grand: breakfast + lunch + dinner + travel + snacks + rent };
  }, [data]);

  const all = useMemo(() => [
    ...data.rent.map(x => ({...x, type:"rent", label:"Room Rent"})),
    ...data.travel.map(x => ({...x, type:"travel", label:x.description})),
    ...data.food.map(x => ({...x, type:"food", label:`${x.meal} • ${x.food}`})),
    ...data.snacks.map(x => ({...x, type:"snacks", label:x.name}))
  ].sort((a,b) => b.date.localeCompare(a.date) || b.id-a.id), [data]);

  function saveExpense(type, item) {
    setData(d => {
      const arr = [...d[type]];
      const i = arr.findIndex(x => x.id === item.id);
      if (i >= 0) arr[i] = item; else arr.push({...item, id: Date.now()});
      return {...d, [type]: arr};
    });
    setEditing(null);
    setToast(i18n(type) + " saved");
    setTimeout(() => setToast(""), 1800);
  }

  function remove(type, id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    setData(d => ({...d, [type]: d[type].filter(x => x.id !== id)}));
  }

  function clearAll() {
    if (!confirm("Are you sure you want to delete all expense data? This action cannot be undone.")) return;
    setData(starter);
    setToast("All expense data deleted");
    setTimeout(() => setToast(""), 1800);
  }

  function i18n(type) {
    return type === "rent" ? "Room rent" : type === "food" ? "Food expense" : type === "snacks" ? "Snack expense" : "Travel expense";
  }

  return (
    <div className="app">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand"><div className="brand-icon"><WalletCards size={21}/></div><div><b>RoomLife</b><span>Expense tracker</span></div><button className="icon-btn close-menu" onClick={()=>setMenu(false)}><X/></button></div>
        <nav>
          <Nav active={page==="dashboard"} onClick={()=>{setPage("dashboard");setMenu(false)}} icon={<LayoutDashboard/>}>Dashboard</Nav>
          <Nav active={page==="expenses"} onClick={()=>{setPage("expenses");setMenu(false)}} icon={<ReceiptText/>}>All Expenses</Nav>
          <Nav active={page==="food"} onClick={()=>{setPage("food");setMenu(false)}} icon={<Utensils/>}>Food Breakdown</Nav>
        </nav>
        <div className="sidebar-bottom">
          <div className="storage"><span className="dot"/><span>Stored on this device</span></div>
          <button className="danger-link" onClick={clearAll}><Trash2 size={16}/> Delete all data</button>
        </div>
      </aside>

      {menu && <div className="backdrop" onClick={()=>setMenu(false)}/>}
      <main>
        <header>
          <button className="icon-btn mobile-menu" onClick={()=>setMenu(true)}><Menu/></button>
          <div><div className="eyebrow">PERSONAL FINANCE</div><h1>{page==="dashboard"?"Good to see you":page==="food"?"Food breakdown":"All expenses"}</h1></div>
          <button className="add-main" onClick={()=>setEditing({type:"travel", item:null})}><Plus size={18}/> Add expense</button>
        </header>

        {page==="dashboard" && <Dashboard totals={totals} all={all} onAdd={setEditing} onView={()=>setPage("expenses")} />}
        {page==="expenses" && <Expenses all={all} onEdit={setEditing} onDelete={remove} />}
        {page==="food" && <Food data={data.food} totals={totals} onAdd={setEditing} onEdit={setEditing} onDelete={remove} />}

        <footer>RoomLife • Your expenses stay on this device</footer>
      </main>

      {editing && <ExpenseModal initial={editing.item} type={editing.type} onClose={()=>setEditing(null)} onSave={saveExpense} />}
      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}

function Nav({active,onClick,icon,children}) {
  return <button className={`nav-item ${active?"active":""}`} onClick={onClick}>{icon}<span>{children}</span><ChevronRight className="nav-arrow"/></button>
}

function Dashboard({totals,all,onAdd,onView}) {
  return <section className="content">
    <div className="hero-card">
      <div><span className="hero-label">TOTAL SPENT</span><div className="hero-total">{money(totals.grand)}</div><p>Room rent, travel, food & snacks</p></div>
      <div className="hero-art"><Sparkles size={20}/><span>This month</span></div>
    </div>

    <div className="section-head"><div><h2>Expense overview</h2><p>Everything at a glance</p></div></div>
    <div className="stats-grid">
      <Stat icon={<BedDouble/>} title="Room Rent" value={totals.rent} cls="rent" />
      <Stat icon={<TrainFront/>} title="Travel" value={totals.travel} cls="travel" />
      <Stat icon={<Utensils/>} title="Food" value={totals.food} cls="food" />
      <Stat icon={<Coffee/>} title="Snacks" value={totals.snacks} cls="snacks" />
    </div>

    <div className="grid-two">
      <div className="panel">
        <div className="panel-head"><div><h2>Food breakdown</h2><p>Meal-wise spending</p></div><button className="text-btn" onClick={()=>onAdd({type:"food",item:null})}>+ Add food</button></div>
        <MealRow label="Breakfast" value={totals.breakfast}/>
        <MealRow label="Lunch" value={totals.lunch}/>
        <MealRow label="Dinner" value={totals.dinner}/>
        <div className="food-total"><span>Total food</span><b>{money(totals.food)}</b></div>
      </div>
      <div className="panel quick">
        <div className="panel-head"><div><h2>Quick add</h2><p>Record an expense in seconds</p></div></div>
        <Quick icon={<TrainFront/>} label="Travel" onClick={()=>onAdd({type:"travel",item:null})}/>
        <Quick icon={<Utensils/>} label="Food" onClick={()=>onAdd({type:"food",item:null})}/>
        <Quick icon={<Coffee/>} label="Snacks" onClick={()=>onAdd({type:"snacks",item:null})}/>
        <Quick icon={<BedDouble/>} label="Room rent" onClick={()=>onAdd({type:"rent",item:null})}/>
      </div>
    </div>

    <div className="panel recent">
      <div className="panel-head"><div><h2>Recent expenses</h2><p>Your latest activity</p></div><button className="text-btn" onClick={onView}>View all</button></div>
      {all.length ? all.slice(0,5).map(x=><ExpenseRow key={`${x.type}-${x.id}`} x={x} />) : <Empty/>}
    </div>
  </section>
}

function Stat({icon,title,value,cls}) {
  return <div className="stat-card"><div className={`stat-icon ${cls}`}>{icon}</div><div><span>{title}</span><strong>{money(value)}</strong></div></div>
}
function MealRow({label,value}) {
  return <div className="meal-row"><span>{label}</span><div className="bar"><i style={{width:`${Math.min(100, value ? Math.max(8, value/Math.max(value,1)*100) : 0)}%`}}/></div><b>{money(value)}</b></div>
}
function Quick({icon,label,onClick}) { return <button className="quick-row" onClick={onClick}>{icon}<span>{label}</span><Plus size={17}/></button> }

function Expenses({all,onEdit,onDelete}) {
  return <section className="content">
    <div className="filter-note"><CalendarDays size={18}/><span>Expenses are automatically saved with their date.</span></div>
    <div className="panel">
      <div className="panel-head"><div><h2>Expense history</h2><p>{all.length} record{all.length===1?"":"s"}</p></div></div>
      {all.length ? all.map(x=><ExpenseRow key={`${x.type}-${x.id}`} x={x} actions onEdit={onEdit} onDelete={onDelete}/>) : <Empty/>}
    </div>
  </section>
}

function Food({data,totals,onAdd,onEdit,onDelete}) {
  return <section className="content">
    <div className="food-banner"><Utensils size={22}/><div><b>Food spending</b><span>Track every meal and understand your daily food habits.</span></div><button onClick={()=>onAdd({type:"food",item:null})}><Plus size={17}/> Add food</button></div>
    <div className="stats-grid food-stats">
      <Stat icon={<span>☀</span>} title="Breakfast" value={totals.breakfast} cls="morning"/>
      <Stat icon={<span>◐</span>} title="Lunch" value={totals.lunch} cls="afternoon"/>
      <Stat icon={<span>☾</span>} title="Dinner" value={totals.dinner} cls="evening"/>
      <Stat icon={<Utensils/>} title="Total Food" value={totals.food} cls="food"/>
    </div>
    <div className="panel"><div className="panel-head"><div><h2>Complete food breakdown</h2><p>Every meal you've recorded</p></div></div>
      {data.length ? data.sort((a,b)=>b.date.localeCompare(a.date)).map(x=><ExpenseRow key={x.id} x={{...x,type:"food",label:`${x.meal} • ${x.food}`}} actions onEdit={onEdit} onDelete={onDelete}/>) : <Empty/>}
    </div>
  </section>
}

function ExpenseRow({x,actions,onEdit,onDelete}) {
  const icon = x.type==="travel"?<TrainFront/>:x.type==="food"?<Utensils/>:x.type==="snacks"?<Coffee/>:<BedDouble/>;
  return <div className="expense-row">
    <div className={`row-icon ${x.type}`}>{icon}</div>
    <div className="expense-info"><b>{x.label || x.description || x.name}</b><span>{x.date}{x.type==="food" && ` • ${x.food}`}</span></div>
    <strong className="row-amount">{money(x.amount)}</strong>
    {actions && <div className="row-actions"><button title="Edit" onClick={()=>onEdit({type:x.type,item:x})}><Edit3 size={16}/></button><button title="Delete" onClick={()=>onDelete(x.type,x.id)}><Trash2 size={16}/></button></div>}
  </div>
}
function Empty(){ return <div className="empty"><ReceiptText size={28}/><b>No expenses yet</b><span>Add your first expense to see it here.</span></div> }

function ExpenseModal({initial,type,onClose,onSave}) {
  const [kind,setKind] = useState(type);
  const [date,setDate] = useState(initial?.date || today());
  const [amount,setAmount] = useState(initial?.amount ?? "");
  const [description,setDescription] = useState(initial?.description || "");
  const [meal,setMeal] = useState(initial?.meal || "Breakfast");
  const [food,setFood] = useState(initial?.food || "");
  const [name,setName] = useState(initial?.name || "");
  const [month,setMonth] = useState(initial?.month || "");
  const [rentDesc,setRentDesc] = useState(initial?.description || "");

  function submit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    const common = { id: initial?.id, date, amount:Number(amount) };
    if (kind==="travel") onSave("travel",{...common,description:description.trim()||"Travel"});
    if (kind==="food") onSave("food",{...common,meal,food:food.trim()||"Food"});
    if (kind==="snacks") onSave("snacks",{...common,name:name.trim()||"Snack"});
    if (kind==="rent") onSave("rent",{...common,month:month||date.slice(0,7),description:rentDesc.trim()||"Room rent"});
  }
  return <div className="modal-backdrop"><div className="modal">
    <div className="modal-head"><div><span className="eyebrow">{initial?"EDIT EXPENSE":"NEW EXPENSE"}</span><h2>{initial?"Update expense":"Add expense"}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div>
    <div className="type-tabs">{[["travel","Travel",<TrainFront/>],["food","Food",<Utensils/>],["snacks","Snacks",<Coffee/>],["rent","Rent",<BedDouble/>]].map(([k,l,i])=><button key={k} className={kind===k?"selected":""} onClick={()=>setKind(k)}>{i}<span>{l}</span></button>)}</div>
    <form onSubmit={submit}>
      <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
      {kind==="travel" && <label>Travel description<input placeholder="e.g. Bus, Train, Auto, Cab" value={description} onChange={e=>setDescription(e.target.value)}/></label>}
      {kind==="food" && <>
        <label>Meal type<select value={meal} onChange={e=>setMeal(e.target.value)}><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select></label>
        <label>What did you eat?<input placeholder="e.g. Idly, Meals, Dosa" value={food} onChange={e=>setFood(e.target.value)}/></label>
      </>}
      {kind==="snacks" && <label>Snack name<input placeholder="e.g. Tea, Biscuit, Juice" value={name} onChange={e=>setName(e.target.value)}/></label>}
      {kind==="rent" && <>
        <label>Month<input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label>
        <label>Description <span className="optional">(optional)</span><input placeholder="e.g. September room rent" value={rentDesc} onChange={e=>setRentDesc(e.target.value)}/></label>
      </>}
      <label>Amount<input className="amount-input" type="number" min="1" step="0.01" placeholder="₹ 0" value={amount} onChange={e=>setAmount(e.target.value)} required/></label>
      <button className="save-btn" type="submit"><Check size={18}/>{initial?"Update expense":"Save expense"}</button>
    </form>
  </div></div>
}

createRoot(document.getElementById("root")).render(<App/>);
