import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Download,
  Edit3,
  FileText,
  Globe,
  History,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  ReceiptText,
  Repeat,
  Sun,
  Target,
  Trash2,
  Upload,
  Utensils,
  Users,
  WalletCards,
  X,
  TrainFront
} from "lucide-react";
import "./styles.css";[cite: 1]

const KEY = "roomlife-expenses-v1";[cite: 1]
const LAST_TYPE_KEY = "roomlife-last-type";[cite: 1]
const LAST_EXPENSE_KEY = "roomlife-last-expense";[cite: 1]
const PREF_KEY = "roomlife-prefs";[cite: 1]
const REMIND_KEY = "roomlife-last-reminded";[cite: 1]

/* =========================================================
   Multi-language (English / Tamil / Hindi)
   Missing keys automatically fall back to English.
   ========================================================= */
const LOCALES = { en: "en-IN", ta: "ta-IN", hi: "hi-IN" };[cite: 1]
let activeLang = "en";[cite: 1]

const I18N = {
  en: {
    tab_dashboard: "Overview", tab_months: "Months", tab_expenses: "Expenses", tab_food: "Food", tab_money: "Money",
    eb_overview: "OVERVIEW", eb_reports: "REPORTS", eb_bill: "MONTHLY BILL", eb_records: "RECORDS", eb_category: "CATEGORY", eb_ledger: "LEDGER",
    ttl_dashboard: "Dashboard", ttl_months: "Monthly bills", ttl_expenses: "All expenses", ttl_food: "Food breakdown", ttl_money: "Money tracking",
    sub_dashboard: "A quick look at your spending.", sub_months: "Pick a month to see every expense in it.",
    sub_month: "All expenses recorded in this month.", sub_expenses: "Every expense, newest first.",
    sub_food: "Meal-wise food spending.", sub_money: "Money given to you and what you have returned.",
    back: "Back", add_expense: "Add expense", add_money: "Add money", data: "Data", settings: "Settings",
    menu: "Menu", data_backup: "Backup & restore",
    stored_device: "Stored on this device", download_backup: "Download backup", upload_backup: "Upload backup", delete_all: "Delete all data",
    quick_add: "Quick add", repeat: "Repeat", travel: "Travel", food: "Food", snacks: "Snacks", rent: "Rent", rent_full: "Room Rent", other: "Other",
    total_spent: "Total spent", total_spent_sub: "Rent, travel, food, snacks & other", this_month: "This month",
    avg_day: "Average per day", avg_day_sub: "this month so far", money_out: "Money outstanding", still_return: "Still to be returned",
    no_expenses_yet: "No expenses yet", n_expenses: "{n} expenses", n_expense: "{n} expense",
    recent: "Recent expenses", latest: "Your latest activity", view_all: "View all",
    spend_cat: "Spending by category", share_total: "Share of your total spending",
    monthly_bills: "Monthly bills", select_month_see: "Select a month to see its expenses",
    food_breakdown: "Food breakdown", meal_wise: "Meal-wise spending", add_food: "Add food", total_food: "Total food",
    Breakfast: "Breakfast", Lunch: "Lunch", Dinner: "Dinner",
    add_by_cat: "Add by category", add_by_cat_sub: "Pick a category and enter the amount", other_exp: "Other expenses",
    money_gr: "Money given & received", money_gr_sub: "Track money people give you and what you return.",
    total_given: "Total given", total_returned: "Total returned", outstanding: "Outstanding", view_history: "View history",
    budget: "Monthly budget", set_budget: "Set budget", edit_budget: "Edit", no_budget: "No budget set for this month",
    no_budget_sub: "Set a budget to track how much you can still spend.",
    spent_of: "{spent} of {budget}", left: "{n} left", over: "{n} over budget", daily_allow: "{n} per day for the rest of the month",
    budget_for: "Budget for {month}", save_month: "Save for this month", set_default: "Use for all months",
    budget_amount: "Budget amount", budget_hint: "Months without their own budget use the default.",
    budget_warn: "You have used {p}% of your budget.",
    week_summary: "Weekly summary", last_7: "Last 7 days", week_total: "Last 7 days total",
    vs_prev: "{p}% vs previous 7 days", same_prev: "Same as previous 7 days", top_cat: "Top category", highest_day: "Highest day",
    heatmap: "Spending calendar", heat_sub: "Darker means more spending",
    pdf: "Download PDF", all_months: "All Months", total_expenses: "Total expenses", records: "Records", highest: "Highest expense",
    single_largest: "single largest record", this_month_n: "expenses this month", newest_first: "Newest first",
    date: "Date", category: "Category", description: "Description", amount: "Amount", actions: "Actions",
    edit: "Edit", delete: "Delete", total_for: "Total for {month}", rent_month: "Rent month",
    undo: "Undo", expense_deleted: "Expense deleted", money_deleted: "Transaction deleted", all_deleted: "All data deleted", saved: "Saved",
    language: "Language", theme: "Theme", light: "Light", dark: "Dark", reminders: "Daily reminder",
    reminder_on: "On", reminder_off: "Off", reminder_time: "Reminder time",
    reminder_note: "Reminds you only if you haven't added an expense today. Works while RoomLife is open in your browser or installed app.",
    reminder_title: "RoomLife reminder", reminder_body: "Don't forget to add today's expenses.",
    notif_denied: "Notifications are blocked in browser settings", notif_unsupported: "Notifications aren't supported here",
    done: "Done",
    footer: "RoomLife • Your data stays on this device",
    new_expense: "NEW EXPENSE", edit_expense_eb: "EDIT EXPENSE", update_expense: "Update expense",
    today: "Today", yesterday: "Yesterday", save: "Save", save_another: "Save & add another",
    travel_desc: "Travel description", meal_type: "Meal type", what_eat: "What did you eat?", snack_name: "Snack name",
    month: "Month", desc_opt: "Description (optional)", exp_category: "Expense category", exp_name: "Expense name",
    "Personal Care": "Personal Care", Cleaning: "Cleaning", "Clothes Washing": "Clothes Washing",
    "Household Item": "Household Item", "Bathroom Item": "Bathroom Item", Miscellaneous: "Miscellaneous",
    exp_history: "Expense history", n_records: "{n} records", complete_food: "Complete food breakdown", every_meal: "Every meal you've recorded",
    empty_title: "No expenses yet", empty_sub: "Add your first expense to see it here.",
    no_monthly: "No monthly bills yet", no_monthly_sub: "Add an expense and its month will appear here.",
    people_bal: "People & balances", people_sub: "Each person has a separate transaction history.",
    all_money_tx: "All money transactions", people: "People", settled: "Settled", due: "{n} due",
    given: "Given", returned: "Returned", remaining: "Remaining", tx_history: "Transaction history",
    money_given: "Money Given", money_given_sub: "Received from person", money_returned: "Money Returned", money_returned_sub: "Amount paid back",
    person_name: "Person's name", save_tx: "Save transaction", update_tx: "Update transaction", avail_bal: "Available remaining balance",
    new_money_eb: "MONEY TRACKING", edit_money_eb: "EDIT TRANSACTION", add_money_tx: "Add money transaction",
    backup_restored: "{n} backup records restored", no_new: "No new records found in backup", bad_backup: "Invalid RoomLife backup file",
    backup_done: "Backup downloaded", confirm_all: "Are you sure you want to delete all expense and money data?",
    bill_summary: "Summary", bill_by_cat: "By category", bill_generated: "Generated by RoomLife", budget_left: "Budget left",
    custom_item: "Custom food item", add_custom: "Add custom item", price: "Price"
  },
  ta: {
    tab_dashboard: "கண்ணோட்டம்", tab_months: "மாதங்கள்", tab_expenses: "செலவுகள்", tab_food: "உணவு", tab_money: "பணம்",
    eb_overview: "கண்ணோட்டம்", eb_reports: "அறிக்கைகள்", eb_bill: "மாதாந்திர பில்", eb_records: "பதிவுகள்", eb_category: "வகை", eb_ledger: "கணக்கு",
    ttl_dashboard: "முகப்பு", ttl_months: "மாதாந்திர பில்கள்", ttl_expenses: "அனைத்து செலவுகள்", ttl_food: "உணவு விவரம்", ttl_money: "பணக் கண்காணிப்பு",
    sub_dashboard: "உங்கள் செலவுகளின் சுருக்கம்.", sub_months: "ஒரு மாதத்தைத் தேர்ந்தெடுத்து செலவுகளைப் பாருங்கள்.",
    sub_month: "இந்த மாதத்தின் அனைத்து செலவுகள்.", sub_expenses: "புதியவை முதலில்.",
    sub_food: "வேளை வாரியான உணவு செலவு.", sub_money: "உங்களுக்கு கொடுத்த பணம் மற்றும் திருப்பியது.",
    back: "பின்", add_expense: "செலவு சேர்", add_money: "பணம் சேர்", data: "தரவு", settings: "அமைப்புகள்",
    menu: "மெனு", data_backup: "காப்பு & மீட்பு",
    stored_device: "இந்த சாதனத்தில் சேமிக்கப்பட்டது", download_backup: "காப்புப்பிரதி பதிவிறக்கு", upload_backup: "காப்புப்பிரதி பதிவேற்று", delete_all: "அனைத்து தரவையும் நீக்கு",
    quick_add: "விரைவு சேர்", repeat: "மீண்டும்", travel: "பயணம்", food: "உணவு", snacks: "சிற்றுண்டி", rent: "வாடகை", rent_full: "அறை வாடகை", other: "மற்றவை",
    total_spent: "மொத்த செலவு", total_spent_sub: "வாடகை, பயணம், உணவு, சிற்றுண்டி & மற்றவை", this_month: "இந்த மாதம்",
    avg_day: "நாளொன்றுக்கு சராசரி", avg_day_sub: "இந்த மாதம் இதுவரை", money_out: "நிலுவைப் பணம்", still_return: "இன்னும் திருப்ப வேண்டியது",
    no_expenses_yet: "செலவுகள் இல்லை", n_expenses: "{n} செலவுகள்", n_expense: "{n} செலவு",
    recent: "சமீபத்திய செலவுகள்", latest: "உங்கள் சமீபத்திய செயல்பாடு", view_all: "அனைத்தும்",
    spend_cat: "வகை வாரி செலவு", share_total: "மொத்த செலவில் பங்கு",
    monthly_bills: "மாதாந்திர பில்கள்", select_month_see: "செலவுகளைக் காண மாதத்தைத் தேர்ந்தெடுக்கவும்",
    food_breakdown: "உணவு விவரம்", meal_wise: "வேளை வாரி செலவு", add_food: "உணவு சேர்", total_food: "மொத்த உணவு",
    Breakfast: "காலை உணவு", Lunch: "மதிய உணவு", Dinner: "இரவு உணவு",
    add_by_cat: "வகை வாரியாக சேர்", add_by_cat_sub: "வகையைத் தேர்ந்து தொகையை உள்ளிடவும்", other_exp: "மற்ற செலவுகள்",
    money_gr: "கொடுத்த & பெற்ற பணம்", money_gr_sub: "மற்றவர்கள் கொடுத்த பணத்தையும் திருப்பியதையும் கண்காணிக்கவும்.",
    total_given: "மொத்தம் கொடுத்தது", total_returned: "மொத்தம் திருப்பியது", outstanding: "நிலுவை", view_history: "வரலாறு",
    budget: "மாதாந்திர பட்ஜெட்", set_budget: "பட்ஜெட் அமை", edit_budget: "திருத்து", no_budget: "இந்த மாதத்திற்கு பட்ஜெட் இல்லை",
    no_budget_sub: "இன்னும் எவ்வளவு செலவிடலாம் என அறிய பட்ஜெட் அமைக்கவும்.",
    spent_of: "{budget} இல் {spent}", left: "{n} மீதம்", over: "{n} அதிகம்", daily_allow: "மாத இறுதி வரை நாளுக்கு {n}",
    budget_for: "{month} பட்ஜெட்", save_month: "இந்த மாதத்திற்கு சேமி", set_default: "அனைத்து மாதங்களுக்கும்",
    budget_amount: "பட்ஜெட் தொகை", budget_hint: "தனி பட்ஜெட் இல்லாத மாதங்கள் இயல்புநிலையைப் பயன்படுத்தும்.",
    budget_warn: "உங்கள் பட்ஜெட்டில் {p}% பயன்படுத்திவிட்டீர்கள்.",
    week_summary: "வார சுருக்கம்", last_7: "கடந்த 7 நாட்கள்", week_total: "கடந்த 7 நாள் மொத்தம்",
    vs_prev: "முந்தைய 7 நாட்களை விட {p}%", same_prev: "முந்தைய 7 நாட்களுக்கு சமம்", top_cat: "அதிக வகை", highest_day: "அதிக செலவு நாள்",
    heatmap: "செலவு நாட்காட்டி", heat_sub: "அடர் நிறம் = அதிக செலவு",
    pdf: "PDF பதிவிறக்கு", all_months: "அனைத்து மாதங்கள்", total_expenses: "மொத்த செலவுகள்", records: "பதிவுகள்", highest: "அதிக செலவு",
    single_largest: "மிகப்பெரிய பதிவு", this_month_n: "செலவுகள் இந்த மாதம்", newest_first: "புதியவை முதலில்",
    date: "தேதி", category: "வகை", description: "விவரம்", amount: "தொகை", actions: "செயல்கள்",
    edit: "திருத்து", delete: "நீக்கு", total_for: "{month} மொத்தம்", rent_month: "வாடகை மாதம்",
    undo: "செயல்தவிர்", expense_deleted: "செலவு நீக்கப்பட்டது", money_deleted: "பரிவர்த்தனை நீக்கப்பட்டது", all_deleted: "அனைத்து தரவும் நீக்கப்பட்டது", saved: "சேமிக்கப்பட்டது",
    language: "மொழி", theme: "தோற்றம்", light: "ஒளி", dark: "இருள்", reminders: "தினசரி நினைவூட்டல்",
    reminder_on: "இயக்கு", reminder_off: "நிறுத்து", reminder_time: "நினைவூட்டல் நேரம்",
    reminder_note: "இன்று செலவு சேர்க்கவில்லை என்றால் மட்டும் நினைவூட்டும். RoomLife திறந்திருக்கும்போது வேலை செய்யும்.",
    reminder_title: "RoomLife நினைவூட்டல்", reminder_body: "இன்றைய செலவுகளைச் சேர்க்க மறக்காதீர்கள்.",
    notif_denied: "உலாவி அமைப்புகளில் அறிவிப்புகள் தடுக்கப்பட்டுள்ளன", notif_unsupported: "அறிவிப்புகள் ஆதரிக்கப்படவில்லை",
    done: "முடிந்தது",
    footer: "RoomLife • உங்கள் தரவு இந்த சாதனத்திலேயே இருக்கும்",
    new_expense: "புதிய செலவு", edit_expense_eb: "செலவு திருத்து", update_expense: "செலவைப் புதுப்பி",
    today: "இன்று", yesterday: "நேற்று", save: "சேமி", save_another: "சேமித்து மேலும் சேர்",
    travel_desc: "பயண விவரம்", meal_type: "உணவு வேளை", what_eat: "என்ன சாப்பிட்டீர்கள்?", snack_name: "சிற்றுண்டி பெயர்",
    month: "மாதம்", desc_opt: "விவரம் (விருப்பம்)", exp_category: "செலவு வகை", exp_name: "செலவு பெயர்",
    "Personal Care": "தனிப்பட்ட பராமரிப்பு", Cleaning: "சுத்தம்", "Clothes Washing": "துணி துவைத்தல்",
    "Household Item": "வீட்டுப் பொருள்", "Bathroom Item": "குளியலறைப் பொருள்", Miscellaneous: "இதர",
    exp_history: "செலவு வரலாறு", n_records: "{n} பதிவுகள்", complete_food: "முழு உணவு விவரம்", every_meal: "நீங்கள் பதிவு செய்த அனைத்து உணவுகள்",
    empty_title: "செலவுகள் இல்லை", empty_sub: "முதல் செலவைச் சேர்த்தால் இங்கே தெரியும்.",
    no_monthly: "மாதாந்திர பில்கள் இல்லை", no_monthly_sub: "செலவைச் சேர்த்தால் அதன் மாதம் இங்கே தோன்றும்.",
    people_bal: "நபர்கள் & இருப்பு", people_sub: "ஒவ்வொருவருக்கும் தனி வரலாறு உண்டு.",
    all_money_tx: "அனைத்து பணப் பரிவர்த்தனைகள்", people: "நபர்கள்", settled: "தீர்க்கப்பட்டது", due: "{n} நிலுவை",
    given: "கொடுத்தது", returned: "திருப்பியது", remaining: "மீதம்", tx_history: "பரிவர்த்தனை வரலாறு",
    money_given: "பணம் பெற்றது", money_given_sub: "நபரிடமிருந்து பெற்றது", money_returned: "பணம் திருப்பியது", money_returned_sub: "திருப்பிச் செலுத்திய தொகை",
    person_name: "நபரின் பெயர்", save_tx: "பரிவர்த்தனையைச் சேமி", update_tx: "பரிவர்த்தனையைப் புதுப்பி", avail_bal: "மீதமுள்ள இருப்பு",
    new_money_eb: "பணக் கண்காணிப்பு", edit_money_eb: "பரிவர்த்தனை திருத்து", add_money_tx: "பணப் பரிவர்த்தனை சேர்",
    backup_restored: "{n} பதிவுகள் மீட்கப்பட்டன", no_new: "புதிய பதிவுகள் இல்லை", bad_backup: "தவறான RoomLife காப்புக் கோப்பு",
    backup_done: "காப்புப்பிரதி பதிவிறக்கப்பட்டது", confirm_all: "அனைத்து செலவு மற்றும் பணத் தரவையும் நீக்க விரும்புகிறீர்களா?",
    bill_summary: "சுருக்கம்", bill_by_cat: "வகை வாரியாக", bill_generated: "RoomLife மூலம் உருவாக்கப்பட்டது", budget_left: "மீதமுள்ள பட்ஜெட்",
    custom_item: "தனிப்பயன் உணவு", add_custom: "சேர்", price: "விலை"
  },
  hi: {
    tab_dashboard: "ओवरव्यू", tab_months: "महीने", tab_expenses: "खर्चे", tab_food: "खाना", tab_money: "पैसे",
    eb_overview: "ओवरव्यू", eb_reports: "रिपोर्ट", eb_bill: "मासिक बिल", eb_records: "रिकॉर्ड", eb_category: "श्रेणी", eb_ledger: "खाता",
    ttl_dashboard: "डैशबोर्ड", ttl_months: "मासिक बिल", ttl_expenses: "सभी खर्चे", ttl_food: "खाने का ब्यौरा", ttl_money: "पैसों का हिसाब",
    sub_dashboard: "आपके खर्च की एक झलक।", sub_months: "किसी महीने के सारे खर्चे देखने के लिए महीना चुनें।",
    sub_month: "इस महीने के सभी खर्चे।", sub_expenses: "सबसे नए पहले।",
    sub_food: "भोजन के अनुसार खर्च।", sub_money: "आपको दिया गया पैसा और लौटाया गया पैसा।",
    back: "वापस", add_expense: "खर्चा जोड़ें", add_money: "पैसे जोड़ें", data: "डेटा", settings: "सेटिंग्स",
    menu: "मेनू", data_backup: "बैकअप और रीस्टोर",
    stored_device: "इस डिवाइस पर सहेजा गया", download_backup: "बैकअप डाउनलोड", upload_backup: "बैकअप अपलोड", delete_all: "सारा डेटा हटाएं",
    quick_add: "झटपट जोड़ें", repeat: "दोहराएं", travel: "यात्रा", food: "खाना", snacks: "नाश्ता", rent: "किराया", rent_full: "कमरे का किराया", other: "अन्य",
    total_spent: "कुल खर्च", total_spent_sub: "किराया, यात्रा, खाना, नाश्ता और अन्य", this_month: "इस महीने",
    avg_day: "प्रति दिन औसत", avg_day_sub: "इस महीने अब तक", money_out: "बकाया पैसे", still_return: "अभी लौटाना बाकी",
    no_expenses_yet: "अभी कोई खर्चा नहीं", n_expenses: "{n} खर्चे", n_expense: "{n} खर्चा",
    recent: "हाल के खर्चे", latest: "आपकी ताज़ा गतिविधि", view_all: "सभी देखें",
    spend_cat: "श्रेणी के अनुसार खर्च", share_total: "कुल खर्च में हिस्सा",
    monthly_bills: "मासिक बिल", select_month_see: "खर्चे देखने के लिए महीना चुनें",
    food_breakdown: "खाने का ब्यौरा", meal_wise: "भोजन के अनुसार खर्च", add_food: "खाना जोड़ें", total_food: "कुल खाना",
    Breakfast: "नाश्ता", Lunch: "दोपहर का खाना", Dinner: "रात का खाना",
    add_by_cat: "श्रेणी से जोड़ें", add_by_cat_sub: "श्रेणी चुनें और राशि डालें", other_exp: "अन्य खर्चे",
    money_gr: "दिया और मिला पैसा", money_gr_sub: "लोगों से मिला और लौटाया गया पैसा ट्रैक करें।",
    total_given: "कुल मिला", total_returned: "कुल लौटाया", outstanding: "बकाया", view_history: "इतिहास देखें",
    budget: "मासिक बजट", set_budget: "बजट सेट करें", edit_budget: "बदलें", no_budget: "इस महीने का बजट सेट नहीं है",
    no_budget_sub: "कितना खर्च बाकी है जानने के लिए बजट सेट करें।",
    spent_of: "{budget} में से {spent}", left: "{n} बचे", over: "{n} बजट से ज़्यादा", daily_allow: "महीने के बाकी दिनों में प्रति दिन {n}",
    budget_for: "{month} का बजट", save_month: "इस महीने के लिए सहेजें", set_default: "सभी महीनों के लिए",
    budget_amount: "बजट राशि", budget_hint: "जिन महीनों का अपना बजट नहीं है वे डिफ़ॉल्ट इस्तेमाल करेंगे।",
    budget_warn: "आपने बजट का {p}% इस्तेमाल कर लिया है।",
    week_summary: "साप्ताहिक सारांश", last_7: "पिछले 7 दिन", week_total: "पिछले 7 दिन का कुल",
    vs_prev: "पिछले 7 दिनों से {p}%", same_prev: "पिछले 7 दिनों के बराबर", top_cat: "सबसे ऊपर श्रेणी", highest_day: "सबसे ज़्यादा खर्च का दिन",
    heatmap: "खर्च कैलेंडर", heat_sub: "गहरा रंग = ज़्यादा खर्च",
    pdf: "PDF डाउनलोड", all_months: "सभी महीने", total_expenses: "कुल खर्चे", records: "रिकॉर्ड", highest: "सबसे बड़ा खर्चा",
    single_largest: "सबसे बड़ा रिकॉर्ड", this_month_n: "खर्चे इस महीने", newest_first: "सबसे नए पहले",
    date: "तारीख", category: "श्रेणी", description: "विवरण", amount: "राशि", actions: "कार्य",
    edit: "बदलें", delete: "हटाएं", total_for: "{month} का कुल", rent_month: "किराए का महीना",
    undo: "वापस करें", expense_deleted: "खर्चा हटाया गया", money_deleted: "लेन-देन हटाया गया", all_deleted: "सारा डेटा हटाया गया", saved: "सहेजा गया",
    language: "भाषा", theme: "थीम", light: "लाइट", dark: "डार्क", reminders: "रोज़ाना रिमाइंडर",
    reminder_on: "चालू", reminder_off: "बंद", reminder_time: "रिमाइंडर का समय",
    reminder_note: "आज खर्चा न जोड़ा हो तभी याद दिलाएगा। RoomLife खुला होने पर काम करता है।",
    reminder_title: "RoomLife रिमाइंडर", reminder_body: "आज के खर्चे जोड़ना न भूलें।",
    notif_denied: "ब्राउज़र सेटिंग में नोटिफ़िकेशन बंद हैं", notif_unsupported: "नोटिफ़िकेशन समर्थित नहीं हैं",
    done: "हो गया",
    footer: "RoomLife • आपका डेटा इसी डिवाइस पर रहता है",
    new_expense: "नया खर्चा", edit_expense_eb: "खर्चा बदलें", update_expense: "खर्चा अपडेट करें",
    today: "आज", yesterday: "कल", save: "सहेजें", save_another: "सहेजें और जोड़ें",
    travel_desc: "यात्रा विवरण", meal_type: "भोजन का प्रकार", what_eat: "क्या खाया?", snack_name: "नाश्ते का नाम",
    month: "महीना", desc_opt: "विवरण (वैकल्पिक)", exp_category: "खर्च की श्रेणी", exp_name: "खर्च का नाम",
    "Personal Care": "व्यक्तिगत देखभाल", Cleaning: "सफ़ाई", "Clothes Washing": "कपड़े धोना",
    "Household Item": "घरेलू सामान", "Bathroom Item": "बाथरूम का सामान", Miscellaneous: "विविध",
    exp_history: "खर्च इतिहास", n_records: "{n} रिकॉर्ड", complete_food: "पूरा खाना ब्यौरा", every_meal: "आपके दर्ज किए सभी भोजन",
    empty_title: "अभी कोई खर्चा नहीं", empty_sub: "पहला खर्चा जोड़ें, यहाँ दिखेगा।",
    no_monthly: "अभी कोई मासिक बिल नहीं", no_monthly_sub: "खर्चा जोड़ें, उसका महीना यहाँ दिखेगा।",
    people_bal: "लोग और बैलेंस", people_sub: "हर व्यक्ति का अलग लेन-देन इतिहास है।",
    all_money_tx: "सभी पैसों के लेन-देन", people: "लोग", settled: "चुकता", due: "{n} बाकी",
    given: "मिला", returned: "लौटाया", remaining: "बाकी", tx_history: "लेन-देन इतिहास",
    money_given: "पैसे मिले", money_given_sub: "व्यक्ति से मिले", money_returned: "पैसे लौटाए", money_returned_sub: "वापस दी गई राशि",
    person_name: "व्यक्ति का नाम", save_tx: "लेन-देन सहेजें", update_tx: "लेन-देन अपडेट करें", avail_bal: "उपलब्ध बाकी राशि",
    new_money_eb: "पैसों का हिसाब", edit_money_eb: "लेन-देन बदलें", add_money_tx: "पैसों का लेन-देन जोड़ें",
    backup_restored: "{n} रिकॉर्ड बहाल हुए", no_new: "बैकअप में कोई नया रिकॉर्ड नहीं", bad_backup: "अमान्य RoomLife बैकअप फ़ाइल",
    backup_done: "बैकअप डाउनलोड हुआ", confirm_all: "क्या आप सारा खर्च और पैसों का डेटा हटाना चाहते हैं?",
    bill_summary: "सारांश", bill_by_cat: "श्रेणी के अनुसार", bill_generated: "RoomLife द्वारा बनाया गया", budget_left: "बचा बजट",
    custom_item: "कस्टम भोजन", add_custom: "जोड़ें", price: "कीमत"
  }
};

function translate(lang, key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;[cite: 1]
  if (vars) {
    Object.keys(vars).forEach((k) => {
      s = s.split(`{${k}}`).join(vars[k]);[cite: 1]
    });
  }
  return s;[cite: 1]
}

const LangCtx = createContext({ lang: "en", t: (k) => k });[cite: 1]
const useT = () => useContext(LangCtx).t;[cite: 1]

/* ---------- Basic helpers ---------- */

function dateKey(offsetDays = 0) {
  const d = new Date();[cite: 1]
  d.setDate(d.getDate() - offsetDays);[cite: 1]
  const y = d.getFullYear();[cite: 1]
  const m = String(d.getMonth() + 1).padStart(2, "0");[cite: 1]
  const day = String(d.getDate()).padStart(2, "0");[cite: 1]
  return `${y}-${m}-${day}`;[cite: 1]
}

const today = () => dateKey(0);[cite: 1]
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;[cite: 1]
const sumBy = (items) => items.reduce((t, i) => t + Number(i.amount || 0), 0);[cite: 1]

const starter = {
  travel: [],
  food: [],
  snacks: [],
  rent: [],
  other: [],
  money: [],
  budgets: {}
};[cite: 1]

function cleanBudgets(b) {
  const out = {};[cite: 1]
  if (b && typeof b === "object") {
    Object.keys(b).forEach((k) => {
      const v = Number(b[k]);[cite: 1]
      if ((k === "default" || /^\d{4}-\d{2}$/.test(k)) && v > 0) out[k] = v;[cite: 1]
    });
  }
  return out;[cite: 1]
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));[cite: 1]
    if (!saved) return starter;[cite: 1]

    return {
      ...starter,
      ...saved,
      travel: Array.isArray(saved.travel) ? saved.travel : [],[cite: 1]
      food: Array.isArray(saved.food) ? saved.food : [],[cite: 1]
      snacks: Array.isArray(saved.snacks) ? saved.snacks : [],[cite: 1]
      rent: Array.isArray(saved.rent) ? saved.rent : [],[cite: 1]
      other: Array.isArray(saved.other) ? saved.other : [],[cite: 1]
      money: Array.isArray(saved.money) ? saved.money : [],[cite: 1]
      budgets: cleanBudgets(saved.budgets)[cite: 1]
    };
  } catch {
    return starter;[cite: 1]
  }
}

function loadLastType() {
  try {
    const t = localStorage.getItem(LAST_TYPE_KEY);[cite: 1]
    return ["travel", "food", "snacks", "rent", "other"].includes(t) ? t : "travel";[cite: 1]
  } catch {
    return "travel";[cite: 1]
  }
}

function loadLastExpense() {
  try {
    const v = JSON.parse(localStorage.getItem(LAST_EXPENSE_KEY));[cite: 1]
    return v && v.type && v.item ? v : null;[cite: 1]
  } catch {
    return null;[cite: 1]
  }
}

function loadPrefs() {
  const base = {
    theme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",[cite: 1]
    lang: "en",
    reminderOn: false,
    reminderTime: "21:00"
  };[cite: 1]
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") };[cite: 1]
  } catch {
    return base;[cite: 1]
  }
}

function normalizeBackupData(imported) {
  if (!imported || typeof imported !== "object") {
    throw new Error("Invalid backup structure");[cite: 1]
  }

  const types = ["travel", "food", "snacks", "rent", "other", "money"];[cite: 1]
  const hasRoomLifeData = types.some((type) => Array.isArray(imported[type]));[cite: 1]

  if (!hasRoomLifeData) {
    throw new Error("No RoomLife data found");[cite: 1]
  }

  const normalized = {};[cite: 1]

  types.forEach((type) => {
    normalized[type] = Array.isArray(imported[type])
      ? imported[type].filter((item) => item && typeof item === "object")[cite: 1]
      : [];
  });

  normalized.budgets = cleanBudgets(imported.budgets);[cite: 1]
  return normalized;[cite: 1]
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
  });[cite: 1]
}

function createId(type) {
  return `${Date.now()}-${type}-${Math.random().toString(36).slice(2, 9)}`;[cite: 1]
}

/* ---------- Month / date helpers ---------- */

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;[cite: 1]

function getMonthKey(date) {
  const key = String(date || "").slice(0, 7);[cite: 1]
  return MONTH_KEY_PATTERN.test(key) ? key : "";[cite: 1]
}

function getMonthParts(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);[cite: 1]
  return { year, month };[cite: 1]
}

function getMonthName(monthKey) {
  const { year, month } = getMonthParts(monthKey);[cite: 1]
  return new Date(year, month - 1, 1).toLocaleDateString(LOCALES[activeLang], {
    month: "long"
  });[cite: 1]
}

function getMonthLabel(monthKey) {
  const { year, month } = getMonthParts(monthKey);[cite: 1]
  if (!year || !month) return "—";[cite: 1]
  return new Date(year, month - 1, 1).toLocaleDateString(LOCALES[activeLang], {
    month: "long",
    year: "numeric"
  });[cite: 1]
}

function formatDate(date) {
  if (!date) return "";[cite: 1]
  const parsed = new Date(`${date}T00:00:00`);[cite: 1]
  if (Number.isNaN(parsed.getTime())) return String(date);[cite: 1]
  return parsed.toLocaleDateString(LOCALES[activeLang], {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });[cite: 1]
}

function daysInMonth(monthKey) {
  const { year, month } = getMonthParts(monthKey);[cite: 1]
  return new Date(year, month, 0).getDate();[cite: 1]
}

function daysElapsed(monthKey) {
  const cur = today().slice(0, 7);[cite: 1]
  if (monthKey === cur) return new Date().getDate();[cite: 1]
  return monthKey < cur ? daysInMonth(monthKey) : 1;[cite: 1]
}

function getBudget(budgets, monthKey) {
  return Number(budgets?.[monthKey] ?? budgets?.default ?? 0);[cite: 1]
}

function buildMonthlyBills(expenses) {
  const grouped = new Map();[cite: 1]

  expenses.forEach((expense) => {
    const monthKey = getMonthKey(expense.date);[cite: 1]
    if (!monthKey) return;[cite: 1]

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, {
        key: monthKey,
        year: getMonthParts(monthKey).year,
        total: 0,
        count: 0
      });[cite: 1]
    }

    const bill = grouped.get(monthKey);[cite: 1]
    bill.total += Number(expense.amount || 0);[cite: 1]
    bill.count += 1;[cite: 1]
  });

  return [...grouped.values()].sort((a, b) => b.key.localeCompare(a.key));[cite: 1]
}

function buildDailyTotals(expenses) {
  const map = new Map();[cite: 1]
  expenses.forEach((e) => {
    if (!e.date) return;[cite: 1]
    map.set(e.date, (map.get(e.date) || 0) + Number(e.amount || 0));[cite: 1]
  });
  return map;[cite: 1]
}

const categoryOf = (e, t) =>
  e.type === "other" ? t(e.category || "other") : t(e.type === "rent" ? "rent_full" : e.type);[cite: 1]

const descOf = (e, t) =>
  e.type === "food"
    ? e.food || t("food")[cite: 1]
    : e.type === "rent"
      ? e.description || t("rent_full")[cite: 1]
      : e.description || e.name || t("other");[cite: 1]

/* ---------- Quick-add & Food Suggestions helpers ---------- */

const SUGGESTIONS = {
  travel: ["Bus", "Auto", "Train", "Cab", "Metro"],[cite: 1]
  food: ["Idly", "Dosa", "Meals", "Biriyani", "Tiffin"],[cite: 1]
  snacks: ["Tea", "Coffee", "Biscuit", "Juice", "Samosa"],[cite: 1]
  other: ["Soap", "Detergent", "Toothpaste", "Hanger"][cite: 1]
};

const FOOD_SUGGESTIONS_BY_MEAL = {
  Breakfast: ["Idly", "Dosai", "Vada", "Omelette", "Poori", "Chapathi", "Parotta"],
  Lunch: ["Sambar Rice", "Ghee Rice", "Kalan Biryani", "Curd Rice", "Chapathi", "Parotta", "Egg Curry", "Vada", "Biryani", "Kuska", "Omelette"],
  Dinner: ["Idly", "Dosai", "Chapathi", "Vada", "Omelette", "Fried Rice", "Biryani", "Parotta", "Chicken", "Mutton"]
};

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];[cite: 1]

const QUICK_BY_KIND = {
  travel: [10, 20, 30, 40, 50, 100, 200],[cite: 1]
  Breakfast: [30, 40, 50, 60, 70, 80],[cite: 1]
  Lunch: [40, 50, 60, 70, 80, 90, 100],[cite: 1]
  Dinner: [40, 50, 60, 70, 80, 90, 100],[cite: 1]
  snacks: [10, 20, 30, 40, 50],[cite: 1]
  other: [20, 50, 100, 200, 500],[cite: 1]
  rent: [2000, 3000, 4000, 5000, 6000, 7000, 8000][cite: 1]
};

const chipLabel = (v) => (v >= 1000 ? `₹${v / 1000}k` : `₹${v}`);[cite: 1]

function mealByTime() {
  const hour = new Date().getHours();[cite: 1]
  if (hour < 11) return "Breakfast";[cite: 1]
  if (hour < 16) return "Lunch";[cite: 1]
  return "Dinner";[cite: 1]
}

/* ---------- PDF bill ---------- */

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));[cite: 1]

function buildBillHtml({ monthKey, expenses, budget, t }) {
  const total = sumBy(expenses);[cite: 1]
  const avg = total / daysElapsed(monthKey);[cite: 1]
  const sorted = [...expenses].sort((a, b) => String(a.date).localeCompare(String(b.date)));[cite: 1]

  const cats = {};[cite: 1]
  sorted.forEach((e) => {
    const c = categoryOf(e, t);[cite: 1]
    cats[c] = (cats[c] || 0) + Number(e.amount || 0);[cite: 1]
  });

  const rows = sorted
    .map(
      (e) => `<tr><td>${esc(formatDate(e.date))}</td><td>${esc(categoryOf(e, t))}</td>
      <td>${esc(descOf(e, t))}${e.type === "food" && e.meal ? ` <small>(${esc(t(e.meal))})</small>` : ""}</td>
      <td class="r">${esc(money(e.amount))}</td></tr>`
    )
    .join("");[cite: 1]

  const catRows = Object.keys(cats)
    .map((c) => `<tr><td>${esc(c)}</td><td class="r">${esc(money(cats[c]))}</td></tr>`)
    .join("");[cite: 1]

  return `<!doctype html><html><head><meta charset="utf-8"><title>RoomLife - ${esc(getMonthLabel(monthKey))}</title>
<style>
  *{box-sizing:border-box} body{font-family:Arial,"Noto Sans Tamil","Noto Sans Devanagari",sans-serif;color:#1c1917;margin:32px;font-size:13px}
  h1{margin:0;font-size:24px;color:#0f766e} h2{font-size:15px;margin:26px 0 8px}
  .sub{color:#78716c;margin:4px 0 18px}
  .kpis{display:flex;gap:10px;flex-wrap:wrap}
  .kpi{flex:1;min-width:130px;border:1px solid #e7e5e0;border-radius:8px;padding:10px 12px}
  .kpi span{display:block;color:#78716c;font-size:11px} .kpi b{font-size:17px}
  table{width:100%;border-collapse:collapse} th,td{padding:8px 6px;border-bottom:1px solid #e7e5e0;text-align:left;vertical-align:top}
  th{font-size:11px;text-transform:uppercase;color:#78716c;background:#faf9f7} .r{text-align:right;white-space:nowrap}
  tfoot td{font-weight:700;border-top:2px solid #1c1917} small{color:#78716c}
  .foot{margin-top:28px;color:#a8a29e;font-size:11px;text-align:center}
  tr{page-break-inside:avoid}
</style></head><body>
<h1>RoomLife — ${esc(getMonthLabel(monthKey))}</h1>
<div class="sub">${esc(t("eb_bill"))}</div>
<div class="kpis">
  <div class="kpi"><span>${esc(t("total_expenses"))}</span><b>${esc(money(total))}</b></div>
  <div class="kpi"><span>${esc(t("records"))}</span><b>${sorted.length}</b></div>
  <div class="kpi"><span>${esc(t("avg_day"))}</span><b>${esc(money(Math.round(avg)))}</b></div>
  ${budget > 0 ? `<div class="kpi"><span>${esc(t("budget"))}</span><b>${esc(money(budget))}</b></div>
  <div class="kpi"><span>${esc(t("budget_left"))}</span><b>${esc(money(budget - total))}</b></div>` : ""}
</div>
<h2>${esc(t("bill_by_cat"))}</h2>
<table><tbody>${catRows}</tbody></table>
<h2>${esc(t("bill_summary"))}</h2>
<table><thead><tr><th>${esc(t("date"))}</th><th>${esc(t("category"))}</th><th>${esc(t("description"))}</th><th class="r">${esc(t("amount"))}</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="3">${esc(t("total_for", { month: getMonthLabel(monthKey) }))}</td><td class="r">${esc(money(total))}</td></tr></tfoot></table>
<div class="foot">${esc(t("bill_generated"))} • ${esc(formatDate(today()))}</div>
</body></html>`;[cite: 1]
}

function printHtml(html) {
  const iframe = document.createElement("iframe");[cite: 1]
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";[cite: 1]
  document.body.appendChild(iframe);[cite: 1]
  const doc = iframe.contentWindow.document;[cite: 1]
  doc.open();[cite: 1]
  doc.write(html);[cite: 1]
  doc.close();[cite: 1]
  window.setTimeout(() => {
    iframe.contentWindow.focus();[cite: 1]
    iframe.contentWindow.print();[cite: 1]
    window.setTimeout(() => iframe.remove(), 60000);[cite: 1]
  }, 350);
}

async function showReminder(title, body, fallback) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      const reg = navigator.serviceWorker
        ? await navigator.serviceWorker.getRegistration()
        : null;[cite: 1]
      if (reg) reg.showNotification(title, { body, tag: "roomlife-daily" });[cite: 1]
      else new Notification(title, { body, tag: "roomlife-daily" });[cite: 1]
      return;
    }
  } catch {
    /* fall through */
  }
  fallback();
}

/* =========================================================
   App
   ========================================================= */

function App() {
  const [data, setData] = useState(loadData);[cite: 1]
  const [prefs, setPrefs] = useState(loadPrefs);[cite: 1]
  const [page, setPage] = useState("dashboard");[cite: 1]
  const [selectedMonth, setSelectedMonth] = useState(null);[cite: 1]
  const [depth, setDepth] = useState(0);[cite: 1]
  const [editing, setEditing] = useState(null);[cite: 1]
  const [moneyEditing, setMoneyEditing] = useState(null);[cite: 1]
  const [budgetEditing, setBudgetEditing] = useState(null);[cite: 1]
  const [drawerOpen, setDrawerOpen] = useState(false);[cite: 1]
  const [lastType, setLastType] = useState(loadLastType);[cite: 1]
  const [lastExpense, setLastExpense] = useState(loadLastExpense);[cite: 1]
  const [toast, setToast] = useState(null);[cite: 1]
  const fileInputRef = useRef(null);[cite: 1]
  const toastTimer = useRef(null);[cite: 1]
  const dataRef = useRef(data);[cite: 1]
  dataRef.current = data;[cite: 1]

  activeLang = prefs.lang;[cite: 1]
  const t = useMemo(() => (k, v) => translate(prefs.lang, k, v), [prefs.lang]);[cite: 1]
  const langValue = useMemo(() => ({ lang: prefs.lang, t }), [prefs.lang, t]);[cite: 1]

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));[cite: 1]
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));[cite: 1]
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = prefs.theme;[cite: 1]
    document.documentElement.lang = prefs.lang;[cite: 1]
  }, [prefs]);

  useEffect(() => {
    if (!prefs.reminderOn) return undefined;[cite: 1]

    const check = () => {
      const now = new Date();[cite: 1]
      const [h, m] = String(prefs.reminderTime).split(":").map(Number);[cite: 1]
      if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;[cite: 1]

      const day = today();[cite: 1]
      if (localStorage.getItem(REMIND_KEY) === day) return;[cite: 1]
      localStorage.setItem(REMIND_KEY, day);[cite: 1]

      const d = dataRef.current;[cite: 1]
      const hasToday = ["travel", "food", "snacks", "rent", "other"].some((k) =>
        d[k].some((x) => x.date === day)
      );[cite: 1]
      if (hasToday) return;[cite: 1]

      const title = translate(prefs.lang, "reminder_title");[cite: 1]
      const body = translate(prefs.lang, "reminder_body");[cite: 1]
      showReminder(title, body, () => flash(body));[cite: 1]
    };

    check();[cite: 1]
    const id = window.setInterval(check, 30000);[cite: 1]
    return () => window.clearInterval(id);[cite: 1]
  }, [prefs.reminderOn, prefs.reminderTime, prefs.lang]);

  async function toggleReminder(on) {
    if (on) {
      if (!("Notification" in window)) {
        flash(t("notif_unsupported"));[cite: 1]
      } else {
        if (Notification.permission === "default") {
          await Notification.requestPermission();[cite: 1]
        }
        if (Notification.permission === "denied") flash(t("notif_denied"));[cite: 1]
      }
      try {
        localStorage.removeItem(REMIND_KEY);[cite: 1]
      } catch {
        /* ignore */
      }
    }
    setPrefs((p) => ({ ...p, reminderOn: on }));[cite: 1]
  }

  useEffect(() => {
    const state = window.history.state;[cite: 1]

    if (state && typeof state.idx === "number" && state.page) {
      setPage(state.page);[cite: 1]
      setSelectedMonth(state.month || null);[cite: 1]
      setDepth(state.idx);[cite: 1]
    } else {
      window.history.replaceState({ page: "dashboard", month: null, idx: 0 }, "");[cite: 1]
    }

    function onPop(event) {
      const s = event.state;[cite: 1]

      if (s && s.page) {
        setPage(s.page);[cite: 1]
        setSelectedMonth(s.month || null);[cite: 1]
        setDepth(s.idx || 0);[cite: 1]
      } else {
        setPage("dashboard");[cite: 1]
        setSelectedMonth(null);[cite: 1]
        setDepth(0);[cite: 1]
      }

      setDrawerOpen(false);[cite: 1]
      setEditing(null);[cite: 1]
      setMoneyEditing(null);[cite: 1]
      setBudgetEditing(null);[cite: 1]
      window.scrollTo({ top: 0 });[cite: 1]
    }

    window.addEventListener("popstate", onPop);[cite: 1]
    return () => window.removeEventListener("popstate", onPop);[cite: 1]
  }, []);

  function go(nextPage, month = null) {
    setDrawerOpen(false);[cite: 1]
    window.scrollTo({ top: 0 });[cite: 1]

    if (nextPage === page && month === selectedMonth) return;[cite: 1]

    const idx = depth + 1;[cite: 1]
    window.history.pushState({ page: nextPage, month, idx }, "");[cite: 1]
    setPage(nextPage);[cite: 1]
    setSelectedMonth(month);[cite: 1]
    setDepth(idx);[cite: 1]
  }

  function goBack() {
    if (depth > 0) window.history.back();[cite: 1]
  }

  function navigate(nextPage) {
    go(nextPage, null);[cite: 1]
  }

  function openMonth(monthKey) {
    go("month", monthKey);[cite: 1]
  }

  function backToMonths() {
    go("months", null);[cite: 1]
  }

  const totals = useMemo(() => {
    const breakfast = sumBy(data.food.filter((x) => x.meal === "Breakfast"));[cite: 1]
    const lunch = sumBy(data.food.filter((x) => x.meal === "Lunch"));[cite: 1]
    const dinner = sumBy(data.food.filter((x) => x.meal === "Dinner"));[cite: 1]
    const food = breakfast + lunch + dinner;[cite: 1]
    const travel = sumBy(data.travel);[cite: 1]
    const snacks = sumBy(data.snacks);[cite: 1]
    const rent = sumBy(data.rent);[cite: 1]
    const other = sumBy(data.other);[cite: 1]

    const moneyGiven = sumBy(data.money.filter((x) => x.type === "given"));[cite: 1]
    const moneyReturned = sumBy(data.money.filter((x) => x.type === "returned"));[cite: 1]
    const moneyOutstanding = Math.max(0, moneyGiven - moneyReturned);[cite: 1]

    return {
      breakfast,
      lunch,
      dinner,
      food,
      travel,
      snacks,
      rent,
      other,
      grand: breakfast + lunch + dinner + travel + snacks + rent + other,[cite: 1]
      moneyGiven,
      moneyReturned,
      moneyOutstanding
    };
  }, [data]);

  const all = useMemo(
    () =>
      [
        ...data.rent.map((x) => ({ ...x, type: "rent", label: t("rent_full") })),[cite: 1]
        ...data.travel.map((x) => ({ ...x, type: "travel", label: x.description })),[cite: 1]
        ...data.food.map((x) => ({
          ...x,
          type: "food",
          label: `${t(x.meal)} • ${x.food}`
        })),[cite: 1]
        ...data.snacks.map((x) => ({ ...x, type: "snacks", label: x.name })),[cite: 1]
        ...data.other.map((x) => ({ ...x, type: "other", label: x.name }))[cite: 1]
      ].sort(
        (a, b) =>
          String(b.date).localeCompare(String(a.date)) ||
          Number(b.id || 0) - Number(a.id || 0)
      ),
    [data, t]
  );

  const monthlyBills = useMemo(() => buildMonthlyBills(all), [all]);[cite: 1]
  const daily = useMemo(() => buildDailyTotals(all), [all]);[cite: 1]

  const selectedExpenses = useMemo(
    () =>
      selectedMonth
        ? all.filter((expense) => getMonthKey(expense.date) === selectedMonth)
        : [],
    [all, selectedMonth]
  );

  const people = useMemo(() => {
    const map = new Map();[cite: 1]

    data.money.forEach((transaction) => {
      const name = transaction.person?.trim();[cite: 1]
      if (!name) return;[cite: 1]

      const key = name.toLowerCase();[cite: 1]
      if (!map.has(key)) map.set(key, name);[cite: 1]
    });

    return [...map.values()].sort((a, b) => a.localeCompare(b));[cite: 1]
  }, [data.money]);

  function flash(message, action) {
    window.clearTimeout(toastTimer.current);[cite: 1]
    setToast({ message, action });[cite: 1]
    toastTimer.current = window.setTimeout(() => setToast(null), action ? 6500 : 1800);[cite: 1]
  }

  function dismissToast() {
    window.clearTimeout(toastTimer.current);[cite: 1]
    setToast(null);[cite: 1]
  }

  function downloadBackup() {
    const backup = {
      app: "RoomLife Expense Tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      data
    };[cite: 1]

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json"
    });[cite: 1]
    const url = URL.createObjectURL(blob);[cite: 1]
    const link = document.createElement("a");[cite: 1]

    link.href = url;[cite: 1]
    link.download = `roomlife-expense-backup-${today()}.json`;[cite: 1]
    document.body.appendChild(link);[cite: 1]
    link.click();[cite: 1]
    link.remove();[cite: 1]
    URL.revokeObjectURL(url);[cite: 1]

    setDrawerOpen(false);[cite: 1]
    flash(t("backup_done"));[cite: 1]
  }

  function handleBackupUpload(event) {
    const file = event.target.files?.[0];[cite: 1]
    event.target.value = "";[cite: 1]
    setDrawerOpen(false);[cite: 1]

    if (!file) return;[cite: 1]

    if (!file.name.toLowerCase().endsWith(".json")) {
      flash(t("bad_backup"));[cite: 1]
      return;
    }

    const reader = new FileReader();[cite: 1]

    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);[cite: 1]
        const imported = normalizeBackupData(backup?.data);[cite: 1]
        const types = ["travel", "food", "snacks", "rent", "other", "money"];[cite: 1]
        let addedCount = 0;[cite: 1]

        setData((current) => {
          const next = { ...current };[cite: 1]
          addedCount = 0;[cite: 1]

          types.forEach((type) => {
            const existing = Array.isArray(current[type]) ? current[type] : [];[cite: 1]
            const fingerprints = new Set(existing.map(getItemFingerprint));[cite: 1]
            const additions = [];[cite: 1]

            imported[type].forEach((item) => {
              const normalized = { ...item };[cite: 1]

              if (type === "money") {
                normalized.person = String(normalized.person || "").trim();[cite: 1]
                normalized.type = normalized.type === "returned" ? "returned" : "given";[cite: 1]
              }

              if (type === "other") {
                normalized.category = normalized.category || "Miscellaneous";[cite: 1]
                normalized.name = normalized.name || "Other expense";[cite: 1]
              }

              if (!normalized.date || Number(normalized.amount || 0) <= 0) return;[cite: 1]
              if (type === "money" && !normalized.person) return;[cite: 1]

              const fingerprint = getItemFingerprint(normalized);[cite: 1]
              if (fingerprints.has(fingerprint)) return;[cite: 1]

              fingerprints.add(fingerprint);[cite: 1]
              additions.push({ ...normalized, id: createId(type) });[cite: 1]
              addedCount += 1;[cite: 1]
            });

            next[type] = [...existing, ...additions];[cite: 1]
          });

          next.budgets = { ...imported.budgets, ...(current.budgets || {}) };[cite: 1]
          return next;
        });

        flash(addedCount ? t("backup_restored", { n: addedCount }) : t("no_new"));[cite: 1]
      } catch {
        flash(t("bad_backup"));[cite: 1]
      }
    };

    reader.onerror = () => flash(t("bad_backup"));[cite: 1]
    reader.readAsText(file);[cite: 1]
  }

  function openAddExpense(type) {
    const chosen = type || (page === "food" ? "food" : lastType);[cite: 1]
    setEditing({ type: chosen, item: null });[cite: 1]
  }

  function openAddMoney(person) {
    setMoneyEditing({
      type: "given",
      item: person ? { person } : null
    });[cite: 1]
  }

  function saveExpense(type, item, keepOpen = false) {
    setData((current) => {
      const arr = [...current[type]];[cite: 1]
      const index = arr.findIndex((x) => x.id === item.id);[cite: 1]

      if (index >= 0) arr[index] = item;[cite: 1]
      else arr.push({ ...item, id: Date.now() });[cite: 1]

      return { ...current, [type]: arr };[cite: 1]
    });

    setLastType(type);[cite: 1]

    if (!item.id) {
      const { id, ...rest } = item;[cite: 1]
      const remembered = { type, item: rest };[cite: 1]
      setLastExpense(remembered);[cite: 1]
      try {
        localStorage.setItem(LAST_EXPENSE_KEY, JSON.stringify(remembered));[cite: 1]
        localStorage.setItem(LAST_TYPE_KEY, type);[cite: 1]
      } catch {
        /* ignore */
      }
    }

    if (!keepOpen) setEditing(null);[cite: 1]
    flash(t("saved"));[cite: 1]
  }

  function saveMultipleExpenses(type, items, keepOpen = false) {
    setData((current) => {
      const arr = [...current[type]];
      items.forEach((item) => {
        const index = arr.findIndex((x) => x.id === item.id);
        if (index >= 0) arr[index] = item;
        else arr.push({ ...item, id: Date.now() + Math.random() });
      });
      return { ...current, [type]: arr };
    });

    setLastType(type);
    if (!keepOpen) setEditing(null);
    flash(t("saved"));
  }

  function repeatLast() {
    if (!lastExpense) return;[cite: 1]
    const { type, item } = lastExpense;[cite: 1]
    const copy = { ...item, date: today() };[cite: 1]
    if (type === "food") copy.meal = mealByTime();[cite: 1]
    if (type === "rent") copy.month = today().slice(0, 7);[cite: 1]
    saveExpense(type, copy);[cite: 1]
  }

  function saveMoneyTransaction(item) {
    const amount = Number(item.amount || 0);[cite: 1]
    const person = item.person.trim();[cite: 1]

    if (!person || amount <= 0) return;[cite: 1]

    if (item.type === "returned") {
      const currentBalance = getPersonBalance(data.money, person, item.id);[cite: 1]

      if (amount > currentBalance) {
        flash(`${t("avail_bal")}: ${money(currentBalance)}`);[cite: 1]
        return;
      }
    }

    setData((current) => {
      const arr = [...current.money];[cite: 1]
      const index = arr.findIndex((x) => x.id === item.id);[cite: 1]
      const transaction = { ...item, person, amount };[cite: 1]

      if (index >= 0) arr[index] = transaction;[cite: 1]
      else arr.push({ ...transaction, id: Date.now() });[cite: 1]

      return { ...current, money: arr };[cite: 1]
    });

    setMoneyEditing(null);[cite: 1]
    flash(t("saved"));[cite: 1]
  }

  function saveBudget(monthKey, amount, asDefault) {
    const value = Number(amount);[cite: 1]
    setData((current) => {
      const budgets = { ...(current.budgets || {}) };[cite: 1]
      const key = asDefault ? "default" : monthKey;[cite: 1]
      if (value > 0) budgets[key] = value;[cite: 1]
      else delete budgets[key];[cite: 1]
      return { ...current, budgets };[cite: 1]
    });
    setBudgetEditing(null);[cite: 1]
    flash(t("saved"));[cite: 1]
  }

  function remove(type, id) {
    const item = data[type].find((x) => x.id === id);[cite: 1]
    if (!item) return;[cite: 1]

    setData((current) => ({
      ...current,
      [type]: current[type].filter((x) => x.id !== id)
    }));[cite: 1]

    flash(t("expense_deleted"), {
      label: t("undo"),
      run: () =>
        setData((current) =>
          current[type].some((x) => x.id === id)
            ? current
            : { ...current, [type]: [...current[type], item] }
        )
    });[cite: 1]
  }

  function removeMoney(id) {
    const item = data.money.find((x) => x.id === id);[cite: 1]
    if (!item) return;[cite: 1]

    setData((current) => ({
      ...current,
      money: current.money.filter((x) => x.id !== id)
    }));[cite: 1]

    flash(t("money_deleted"), {
      label: t("undo"),
      run: () =>
        setData((current) =>
          current.money.some((x) => x.id === id)
            ? current
            : { ...current, money: [...current.money, item] }
        )
    });[cite: 1]
  }

  function clearAll() {
    setDrawerOpen(false);[cite: 1]

    if (!window.confirm(t("confirm_all"))) return;[cite: 1]

    const snapshot = data;[cite: 1]
    setData({ ...starter });[cite: 1]
    if (page === "month") go("months", null);[cite: 1]

    flash(t("all_deleted"), {
      label: t("undo"),
      run: () => setData(snapshot)
    });[cite: 1]
  }

  function downloadMonthPdf(monthKey) {
    const expenses = all.filter((e) => getMonthKey(e.date) === monthKey);[cite: 1]
    printHtml(
      buildBillHtml({
        monthKey,
        expenses,
        budget: getBudget(data.budgets, monthKey),
        t
      })
    );[cite: 1]
  }

  const heading = {
    dashboard: { eyebrow: t("eb_overview"), title: t("ttl_dashboard"), sub: t("sub_dashboard") },[cite: 1]
    months: { eyebrow: t("eb_reports"), title: t("ttl_months"), sub: t("sub_months") },[cite: 1]
    month: {
      eyebrow: t("eb_bill"),
      title: selectedMonth ? getMonthLabel(selectedMonth) : t("ttl_months"),
      sub: t("sub_month")
    },[cite: 1]
    expenses: { eyebrow: t("eb_records"), title: t("ttl_expenses"), sub: t("sub_expenses") },[cite: 1]
    food: { eyebrow: t("eb_category"), title: t("ttl_food"), sub: t("sub_food") },[cite: 1]
    money: { eyebrow: t("eb_ledger"), title: t("ttl_money"), sub: t("sub_money") }[cite: 1]
  }[page];

  const tabs = [
    ["dashboard", t("tab_dashboard"), <LayoutDashboard key="d" />],[cite: 1]
    ["months", t("tab_months"), <CalendarDays key="m" />],[cite: 1]
    ["expenses", t("tab_expenses"), <ReceiptText key="e" />],[cite: 1]
    ["food", t("tab_food"), <Utensils key="f" />],[cite: 1]
    ["money", t("tab_money"), <Users key="u" />][cite: 1]
  ];

  const modalOpen = Boolean(editing || moneyEditing || budgetEditing || drawerOpen);[cite: 1]
  const isMoneyPage = page === "money";[cite: 1]
  const currentKey = today().slice(0, 7);[cite: 1]

  return (
    <LangCtx.Provider value={langValue}>
      <div className="app">
        <main>
          <div className="page-head">
            <div className="page-top">
              <button
                type="button"
                className="back-btn"
                onClick={goBack}
                disabled={depth === 0}
                aria-label={t("back")}
              >
                <ArrowLeft size={16} />
                <span>{t("back")}</span>
              </button>

              {page === "month" ? (
                <div className="breadcrumb">
                  <button type="button" onClick={backToMonths}>
                    {t("ttl_months")}
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
              daily={daily}
              monthlyBills={monthlyBills}
              budgets={data.budgets}
              lastExpense={lastExpense}
              onRepeat={repeatLast}
              onOpenMonth={openMonth}
              onViewMonths={() => navigate("months")}
              onAdd={setEditing}
              onMoneyAdd={() => openAddMoney()}
              onView={() => navigate("expenses")}
              onMoneyView={() => navigate("money")}
              onEditBudget={() => setBudgetEditing(currentKey)}
            />
          )}

          {page === "months" && (
            <MonthlyBills monthlyBills={monthlyBills} onOpenMonth={openMonth} />
          )}

          {page === "month" && selectedMonth && (
            <MonthDetail
              monthKey={selectedMonth}
              expenses={selectedExpenses}
              budget={getBudget(data.budgets, selectedMonth)}
              onBack={backToMonths}
              onEdit={setEditing}
              onDelete={remove}
              onPdf={() => downloadMonthPdf(selectedMonth)}
              onEditBudget={() => setBudgetEditing(selectedMonth)}
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

          <footer>{t("footer")}</footer>
        </main>

        <nav className="bottombar" aria-label="Main navigation">
          <div className="bottombar-inner">
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

            <button
              type="button"
              className={`tab menu-tab ${drawerOpen ? "active" : ""}`}
              onClick={() => setDrawerOpen(true)}
              aria-label={t("menu")}
            >
              <Menu />
              <span>{t("menu")}</span>
            </button>
          </div>
        </nav>

        {!modalOpen && (
          <button
            type="button"
            className="fab"
            onClick={() => (isMoneyPage ? openAddMoney() : openAddExpense())}
            aria-label={isMoneyPage ? t("add_money") : t("add_expense")}
          >
            <Plus size={22} />
            <span className="fab-text">{isMoneyPage ? t("add_money") : t("add_expense")}</span>
          </button>
        )}

        {editing && (
          <ExpenseModal
            initial={editing.item}
            type={editing.type}
            onClose={() => setEditing(null)}
            onSave={saveExpense}
            onSaveMultiple={saveMultipleExpenses}
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

        {budgetEditing && (
          <BudgetModal
            monthKey={budgetEditing}
            current={getBudget(data.budgets, budgetEditing)}
            onClose={() => setBudgetEditing(null)}
            onSave={saveBudget}
          />
        )}

        {drawerOpen && (
          <SideDrawer
            prefs={prefs}
            setPrefs={setPrefs}
            onToggleReminder={toggleReminder}
            onDownload={downloadBackup}
            onUpload={handleBackupUpload}
            onClear={clearAll}
            fileInputRef={fileInputRef}
            onClose={() => setDrawerOpen(false)}
          />
        )}

        {toast && (
          <div className="toast">
            <Check size={16} />
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.action.run();
                  dismissToast();
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </LangCtx.Provider>
  );
}

function getPersonBalance(transactions, person, excludeId = null) {
  const normalized = person.trim().toLowerCase();[cite: 1]

  return transactions.reduce((balance, transaction) => {
    if (transaction.id === excludeId) return balance;[cite: 1]
    if (transaction.person?.trim().toLowerCase() !== normalized) return balance;[cite: 1]

    return (
      balance +
      (transaction.type === "given"
        ? Number(transaction.amount || 0)
        : -Number(transaction.amount || 0))
    );[cite: 1]
  }, 0);
}

function getPersonStats(transactions, person) {
  const normalized = person.trim().toLowerCase();[cite: 1]
  const list = transactions.filter(
    (x) => x.person?.trim().toLowerCase() === normalized
  );[cite: 1]

  const given = sumBy(list.filter((x) => x.type === "given"));[cite: 1]
  const returned = sumBy(list.filter((x) => x.type === "returned"));[cite: 1]

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

/* =========================================================
   Side drawer
   ========================================================= */

function SideDrawer({
  prefs,
  setPrefs,
  onToggleReminder,
  onDownload,
  onUpload,
  onClear,
  fileInputRef,
  onClose
}) {
  const t = useT();

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();[cite: 1]
    }
    window.addEventListener("keydown", onKey);[cite: 1]
    return () => window.removeEventListener("keydown", onKey);[cite: 1]
  }, [onClose]);

  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-label={t("menu")}>
        <div className="drawer-head">
          <div className="drawer-brand">
            <span className="brand-mark">
              <WalletCards size={18} />
            </span>
            <div>
              <b>RoomLife</b>
              <small>{t("stored_device")}</small>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="drawer-body">
          <section className="drawer-section">
            <h3>
              <Globe size={14} /> {t("language")}
            </h3>
            <div className="lang-list">
              {[
                ["en", "English", "English"],
                ["ta", "தமிழ்", "Tamil"],
                ["hi", "हिन्दी", "Hindi"]
              ].map(([code, name, sub]) => (
                <button
                  type="button"
                  key={code}
                  className={`lang-option ${prefs.lang === code ? "on" : ""}`}
                  onClick={() => setPrefs((p) => ({ ...p, lang: code }))}
                >
                  <span>
                    <b>{name}</b>
                    <small>{sub}</small>
                  </span>
                  {prefs.lang === code && <Check size={16} />}
                </button>
              ))}
            </div>
          </section>

          <section className="drawer-section">
            <h3>
              <Download size={14} /> {t("data_backup")}
            </h3>
            <div className="drawer-list">
              <button type="button" className="drawer-item" onClick={onDownload}>
                <Download size={17} />
                <span>{t("download_backup")}</span>
              </button>

              <label className="drawer-item">
                <Upload size={17} />
                <span>{t("upload_backup")}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={onUpload}
                  aria-label={t("upload_backup")}
                />
              </label>

              <button type="button" className="drawer-item danger" onClick={onClear}>
                <Trash2 size={17} />
                <span>{t("delete_all")}</span>
              </button>
            </div>
          </section>

          <section className="drawer-section">
            <h3>
              {prefs.theme === "dark" ? <Moon size={14} /> : <Sun size={14} />} {t("theme")}
            </h3>
            <div className="chips set-chips">
              {[
                ["light", t("light"), <Sun key="s" size={14} />],
                ["dark", t("dark"), <Moon key="m" size={14} />]
              ].map(([code, name, icon]) => (
                <button
                  type="button"
                  key={code}
                  className={`chip chip-icon ${prefs.theme === code ? "on" : ""}`}
                  onClick={() => setPrefs((p) => ({ ...p, theme: code }))}
                >
                  {icon} {name}
                </button>
              ))}
            </div>
          </section>

          <section className="drawer-section">
            <h3>
              <Bell size={14} /> {t("reminders")}
            </h3>
            <div className="chips set-chips">
              <button
                type="button"
                className={`chip ${prefs.reminderOn ? "on" : ""}`}
                onClick={() => onToggleReminder(true)}
              >
                {t("reminder_on")}
              </button>
              <button
                type="button"
                className={`chip ${!prefs.reminderOn ? "on" : ""}`}
                onClick={() => onToggleReminder(false)}
              >
                {t("reminder_off")}
              </button>
            </div>

            {prefs.reminderOn && (
              <label className="drawer-time">
                {t("reminder_time")}
                <input
                  type="time"
                  value={prefs.reminderTime}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, reminderTime: e.target.value || "21:00" }))
                  }
                />
              </label>
            )}
            <p className="hint">{t("reminder_note")}</p>
          </section>
        </div>
      </aside>
    </div>
  );
}

function BudgetCard({ monthKey, spent, budget, onEdit }) {
  const t = useT();

  if (!budget) {
    return (
      <div className="panel budget-panel">
        <div className="panel-head">
          <div>
            <h2>{t("budget")}</h2>
            <p>{t("no_budget_sub")}</p>
          </div>
          <button type="button" className="btn btn-outline" onClick={onEdit}>
            <Target size={15} /> {t("set_budget")}
          </button>
        </div>
      </div>
    );
  }

  const pct = (spent / budget) * 100;
  const state = pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok";
  const remaining = budget - spent;
  const isCurrent = monthKey === today().slice(0, 7);
  const daysLeft = daysInMonth(monthKey) - new Date().getDate() + 1;

  return (
    <div className={`panel budget-panel ${state}`}>
      <div className="panel-head">
        <div>
          <h2>
            {t("budget")} • {getMonthName(monthKey)}
          </h2>
          <p>{t("spent_of", { spent: money(spent), budget: money(budget) })}</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={onEdit}>
          <Edit3 size={14} /> {t("edit_budget")}
        </button>
      </div>

      <div className="budget-bar">
        <i className={state} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>

      <div className="budget-meta">
        <strong className={state}>
          {remaining >= 0 ? t("left", { n: money(remaining) }) : t("over", { n: money(-remaining) })}
        </strong>
        {isCurrent && remaining > 0 && daysLeft > 0 && (
          <span>{t("daily_allow", { n: money(Math.floor(remaining / daysLeft)) })}</span>
        )}
        {state === "warn" && <span>{t("budget_warn", { p: Math.round(pct) })}</span>}
      </div>
    </div>
  );
}

function WeeklySummary({ all, daily }) {
  const t = useT();

  const { days, thisWeek, lastWeek, max, topCat, best } = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i -= 1) {
      const key = dateKey(i);
      list.push({ key, total: daily.get(key) || 0 });
    }
    const thisW = list.reduce((s, d) => s + d.total, 0);

    let prev = 0;
    for (let i = 7; i <= 13; i += 1) prev += daily.get(dateKey(i)) || 0;

    const keys = new Set(list.map((d) => d.key));
    const byCat = {};
    all.forEach((e) => {
      if (keys.has(e.date)) byCat[e.type] = (byCat[e.type] || 0) + Number(e.amount || 0);
    });
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    const bestDay = [...list].sort((a, b) => b.total - a.total)[0];

    return {
      days: list,
      thisWeek: thisW,
      lastWeek: prev,
      max: Math.max(1, ...list.map((d) => d.total)),
      topCat: top,
      best: bestDay
    };
  }, [all, daily]);

  const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>{t("week_summary")}</h2>
          <p>{t("last_7")}</p>
        </div>
      </div>

      <div className="wk-top">
        <div>
          <span className="wk-label">{t("week_total")}</span>
          <strong className="wk-big">{money(thisWeek)}</strong>
          {change !== null && (
            <span className={`wk-change ${change > 0 ? "up" : change < 0 ? "down" : ""}`}>
              {change === 0
                ? t("same_prev")
                : t("vs_prev", { p: `${change > 0 ? "+" : ""}${change}` })}
            </span>
          )}
        </div>
        <div>
          <span className="wk-label">{t("avg_day")}</span>
          <strong className="wk-big">{money(Math.round(thisWeek / 7))}</strong>
        </div>
        <div>
          <span className="wk-label">{t("top_cat")}</span>
          <strong className="wk-big small">
            {topCat ? t(topCat[0] === "rent" ? "rent_full" : topCat[0]) : "—"}
          </strong>
        </div>
        <div>
          <span className="wk-label">{t("highest_day")}</span>
          <strong className="wk-big small">
            {best && best.total > 0 ? `${formatDate(best.key)} • ${money(best.total)}` : "—"}
          </strong>
        </div>
      </div>

      <div className="wk-bars">
        {days.map((d) => (
          <div className="wk-col" key={d.key} title={`${formatDate(d.key)} • ${money(d.total)}`}>
            <span className="wk-amt">{d.total > 0 ? money(d.total) : ""}</span>
            <div className="wk-track">
              <i style={{ height: `${d.total > 0 ? Math.max(6, (d.total / max) * 100) : 0}%` }} />
            </div>
            <span className="wk-day">
              {new Date(`${d.key}T00:00:00`).toLocaleDateString(LOCALES[activeLang], {
                weekday: "short"
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarHeatmap({ monthKey, daily }) {
  const t = useT();
  const { year, month } = getMonthParts(monthKey);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const dim = daysInMonth(monthKey);
  const todayKey = today();

  const values = [];
  for (let d = 1; d <= dim; d += 1) {
    values.push(daily.get(`${monthKey}-${String(d).padStart(2, "0")}`) || 0);
  }
  const max = Math.max(0, ...values);

  const weekdays = [];
  for (let i = 0; i < 7; i += 1) {
    weekdays.push(
      new Date(2024, 0, 7 + i).toLocaleDateString(LOCALES[activeLang], { weekday: "narrow" })
    );
  }

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(<span key={`b${i}`} className="heat-blank" />);

  values.forEach((total, i) => {
    const day = i + 1;
    const key = `${monthKey}-${String(day).padStart(2, "0")}`;
    const level = total <= 0 || max <= 0 ? 0 : Math.min(4, Math.ceil((total / max) * 4));
    cells.push(
      <div
        key={key}
        className={`heat-cell l${level} ${key === todayKey ? "is-today" : ""}`}
        title={`${formatDate(key)} • ${money(total)}`}
      >
        {day}
      </div>
    );
  });

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>{t("heatmap")}</h2>
          <p>
            {getMonthLabel(monthKey)} • {t("heat_sub")}
          </p>
        </div>
        <div className="heat-legend" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className={`heat-cell l${l}`} />
          ))}
        </div>
      </div>

      <div className="heat-grid heat-head">
        {weekdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="heat-grid">{cells}</div>
    </div>
  );
}

function BudgetModal({ monthKey, current, onClose, onSave }) {
  const t = useT();
  const [amount, setAmount] = useState(current || "");

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();[cite: 1]
    }
    window.addEventListener("keydown", onKey);[cite: 1]
    return () => window.removeEventListener("keydown", onKey);[cite: 1]
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{t("budget").toUpperCase()}</span>
            <h2>{t("budget_for", { month: getMonthLabel(monthKey) })}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(monthKey, amount, false);
          }}
        >
          <label>
            {t("budget_amount")}
            <input
              className="amount-input"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="₹ 0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
            />
          </label>

          <div className="chips">
            {[3000, 5000, 8000, 10000, 15000].map((v) => (
              <button
                type="button"
                key={v}
                className={`chip ${Number(amount) === v ? "on" : ""}`}
                onClick={() => setAmount(String(v))}
              >
                ₹{v.toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <p className="hint">{t("budget_hint")}</p>

          <div className="save-row">
            <button className="save-btn" type="submit">
              <Check size={18} />
              {t("save_month")}
            </button>
            <button
              className="save-btn secondary"
              type="button"
              onClick={() => onSave(monthKey, amount, true)}
            >
              <Target size={18} />
              {t("set_default")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MonthCard({ bill, max, onOpen }) {
  const t = useT();
  const share = max > 0 ? Math.max(4, Math.round((bill.total / max) * 100)) : 0;

  return (
    <button
      type="button"
      className="month-card"
      onClick={() => onOpen(bill.key)}
      aria-label={getMonthLabel(bill.key)}
    >
      <div className="mc-top">
        <div>
          <b className="mc-name">{getMonthName(bill.key)}</b>
          <span className="mc-year">{bill.year}</span>
        </div>
        <ChevronRight size={16} className="mc-arrow" />
      </div>

      <div className="mc-total">{money(bill.total)}</div>

      <div className="mc-foot">
        <span>{t(bill.count === 1 ? "n_expense" : "n_expenses", { n: bill.count })}</span>
        <div className="mc-bar">
          <i style={{ width: `${share}%` }} />
        </div>
      </div>
    </button>
  );
}

function MonthlyBills({ monthlyBills, onOpenMonth }) {
  const t = useT();
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
            <b>{t("no_monthly")}</b>
            <span>{t("no_monthly_sub")}</span>
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
              {group.bills.length} • {money(group.total)}
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

function MonthDetail({
  monthKey,
  expenses,
  budget,
  onBack,
  onEdit,
  onDelete,
  onPdf,
  onEditBudget
}) {
  const t = useT();
  const total = sumBy(expenses);
  const highest = expenses.reduce((best, e) => Math.max(best, Number(e.amount || 0)), 0);
  const avg = Math.round(total / daysElapsed(monthKey));
  const monthDaily = useMemo(() => buildDailyTotals(expenses), [expenses]);

  return (
    <section className="content">
      <div className="kpi-grid four">
        <div className="kpi accent">
          <span className="kpi-label">{t("total_expenses")}</span>
          <strong className="kpi-value">{money(total)}</strong>
          <span className="kpi-sub">{getMonthLabel(monthKey)}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("records")}</span>
          <strong className="kpi-value">{expenses.length}</strong>
          <span className="kpi-sub">{t("this_month_n")}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("avg_day")}</span>
          <strong className="kpi-value">{money(avg)}</strong>
          <span className="kpi-sub">{getMonthName(monthKey)}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("highest")}</span>
          <strong className="kpi-value">{money(highest)}</strong>
          <span className="kpi-sub">{t("single_largest")}</span>
        </div>
      </div>

      <BudgetCard monthKey={monthKey} spent={total} budget={budget} onEdit={onEditBudget} />

      <CalendarHeatmap monthKey={monthKey} daily={monthDaily} />

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{getMonthLabel(monthKey)}</h2>
            <p>{t("newest_first")}</p>
          </div>
          <div className="panel-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPdf}
              disabled={!expenses.length}
            >
              <FileText size={15} />
              <span>{t("pdf")}</span>
            </button>
            <button type="button" className="btn btn-outline" onClick={onBack}>
              <ArrowLeft size={15} />
              <span>{t("all_months")}</span>
            </button>
          </div>
        </div>

        {expenses.length ? (
          <div className="month-table">
            <div className="month-table-head">
              <span>{t("date")}</span>
              <span>{t("category")}</span>
              <span>{t("description")}</span>
              <span className="align-right">{t("amount")}</span>
              <span className="align-right">{t("actions")}</span>
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
              <span>{t("total_for", { month: getMonthLabel(monthKey) })}</span>
              <b>{money(total)}</b>
            </div>
          </div>
        ) : (
          <div className="empty">
            <ReceiptText size={26} />
            <b>{t("empty_title")}</b>
            <span>{t("empty_sub")}</span>
            <button type="button" className="btn btn-primary empty-add" onClick={onBack}>
              <ArrowLeft size={15} /> {t("all_months")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function MonthExpenseItem({ expense, onEdit, onDelete }) {
  const t = useT();
  const details = [];
  if (expense.type === "food" && expense.meal) details.push(t(expense.meal));
  if (expense.type === "rent" && expense.month) {
    details.push(`${t("rent_month")}: ${getMonthLabel(expense.month)}`);
  }

  return (
    <div className="month-row">
      <div className="mr-date">
        <CalendarDays size={14} />
        {formatDate(expense.date)}
      </div>

      <div className="mr-cat">
        <span className={`category-chip ${expense.type}`}>{categoryOf(expense, t)}</span>
      </div>

      <div className="mr-desc">
        <b>{descOf(expense, t)}</b>
        {details.length > 0 && <span>{details.join(" • ")}</span>}
      </div>

      <div className="mr-amount">{money(expense.amount)}</div>

      <div className="mr-actions">
        <button
          type="button"
          className="edit-action"
          aria-label={t("edit")}
          onClick={() => onEdit({ type: expense.type, item: expense })}
        >
          <Edit3 size={14} />
          <span>{t("edit")}</span>
        </button>
        <button
          type="button"
          className="delete-action"
          aria-label={t("delete")}
          onClick={() => onDelete(expense.type, expense.id)}
        >
          <Trash2 size={14} />
          <span>{t("delete")}</span>
        </button>
      </div>
    </div>
  );
}

function Dashboard({
  totals,
  all,
  daily,
  monthlyBills,
  budgets,
  lastExpense,
  onRepeat,
  onOpenMonth,
  onViewMonths,
  onAdd,
  onMoneyAdd,
  onView,
  onMoneyView,
  onEditBudget
}) {
  const t = useT();
  const max = Math.max(0, ...monthlyBills.map((bill) => bill.total));
  const currentKey = today().slice(0, 7);
  const thisMonth = monthlyBills.find((bill) => bill.key === currentKey);
  const monthSpent = thisMonth ? thisMonth.total : 0;
  const avgDay = Math.round(monthSpent / daysElapsed(currentKey));

  const categories = [
    { key: "rent", label: t("rent_full"), value: totals.rent },
    { key: "travel", label: t("travel"), value: totals.travel },
    { key: "food", label: t("food"), value: totals.food },
    { key: "snacks", label: t("snacks"), value: totals.snacks },
    { key: "other", label: t("other"), value: totals.other }
  ];

  const percent = (value) => (totals.grand > 0 ? (value / totals.grand) * 100 : 0);

  const lastItem = lastExpense?.item;
  const lastLabel = lastItem
    ? `${lastItem.description || lastItem.food || lastItem.name || t(lastExpense.type)} ${money(lastItem.amount)}`
    : "";

  return (
    <section className="content">
      <div className="quick-strip">
        <span className="quick-strip-title">{t("quick_add")}</span>
        <div className="quick-strip-list">
          <button type="button" onClick={() => onAdd({ type: "travel", item: null })}>
            <TrainFront size={16} /> {t("travel")}
          </button>
          <button type="button" onClick={() => onAdd({ type: "food", item: null })}>
            <Utensils size={16} /> {t("food")}
          </button>
          <button type="button" onClick={() => onAdd({ type: "snacks", item: null })}>
            <Coffee size={16} /> {t("snacks")}
          </button>
          <button type="button" onClick={() => onAdd({ type: "rent", item: null })}>
            <BedDouble size={16} /> {t("rent")}
          </button>
          <button type="button" onClick={() => onAdd({ type: "other", item: null })}>
            <CircleDollarSign size={16} /> {t("other")}
          </button>
          {lastExpense && (
            <button type="button" className="repeat-btn" onClick={onRepeat}>
              <Repeat size={16} /> {t("repeat")}: {lastLabel}
            </button>
          )}
        </div>
      </div>

      <div className="kpi-grid four">
        <div className="kpi accent">
          <span className="kpi-label">{t("total_spent")}</span>
          <strong className="kpi-value">{money(totals.grand)}</strong>
          <span className="kpi-sub">{t("total_spent_sub")}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("this_month")}</span>
          <strong className="kpi-value">{money(monthSpent)}</strong>
          <span className="kpi-sub">
            {thisMonth
              ? t(thisMonth.count === 1 ? "n_expense" : "n_expenses", { n: thisMonth.count })
              : t("no_expenses_yet")}
          </span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("avg_day")}</span>
          <strong className="kpi-value">{money(avgDay)}</strong>
          <span className="kpi-sub">{t("avg_day_sub")}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("money_out")}</span>
          <strong className="kpi-value">{money(totals.moneyOutstanding)}</strong>
          <span className="kpi-sub">{t("still_return")}</span>
        </div>
      </div>

      <BudgetCard
        monthKey={currentKey}
        spent={monthSpent}
        budget={getBudget(budgets, currentKey)}
        onEdit={onEditBudget}
      />

      <WeeklySummary all={all} daily={daily} />

      <CalendarHeatmap monthKey={currentKey} daily={daily} />

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{t("recent")}</h2>
            <p>{t("latest")}</p>
          </div>
          <button className="link-btn" onClick={onView}>
            {t("view_all")}
          </button>
        </div>

        {all.length ? (
          all.slice(0, 5).map((x) => <ExpenseRow key={`${x.type}-${x.id}`} x={x} />)
        ) : (
          <Empty />
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{t("spend_cat")}</h2>
            <p>{t("share_total")}</p>
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
            <h2>{t("monthly_bills")}</h2>
            <p>{t("select_month_see")}</p>
          </div>
          {monthlyBills.length > 6 && (
            <button type="button" className="link-btn" onClick={onViewMonths}>
              {t("view_all")}
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
            <b>{t("no_monthly")}</b>
            <span>{t("no_monthly_sub")}</span>
          </div>
        )}
      </div>

      <div className="split">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{t("food_breakdown")}</h2>
              <p>{t("meal_wise")}</p>
            </div>
            <button className="link-btn" onClick={() => onAdd({ type: "food", item: null })}>
              + {t("add_food")}
            </button>
          </div>

          <MealRow label={t("Breakfast")} value={totals.breakfast} total={totals.food} />
          <MealRow label={t("Lunch")} value={totals.lunch} total={totals.food} />
          <MealRow label={t("Dinner")} value={totals.dinner} total={totals.food} />

          <div className="food-total">
            <span>{t("total_food")}</span>
            <b>{money(totals.food)}</b>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{t("add_by_cat")}</h2>
              <p>{t("add_by_cat_sub")}</p>
            </div>
          </div>

          <Quick icon={<TrainFront />} label={t("travel")} onClick={() => onAdd({ type: "travel", item: null })} />
          <Quick icon={<Utensils />} label={t("food")} onClick={() => onAdd({ type: "food", item: null })} />
          <Quick icon={<Coffee />} label={t("snacks")} onClick={() => onAdd({ type: "snacks", item: null })} />
          <Quick icon={<BedDouble />} label={t("rent_full")} onClick={() => onAdd({ type: "rent", item: null })} />
          <Quick icon={<CircleDollarSign />} label={t("other_exp")} onClick={() => onAdd({ type: "other", item: null })} />
        </div>
      </div>

      <div className="money-summary-panel">
        <div className="money-summary-copy">
          <div className="money-summary-icon">
            <Users size={19} />
          </div>
          <div>
            <h2>{t("money_gr")}</h2>
            <p>{t("money_gr_sub")}</p>
          </div>
        </div>

        <div className="money-summary-values">
          <div>
            <span>{t("total_given")}</span>
            <strong>{money(totals.moneyGiven)}</strong>
          </div>
          <div>
            <span>{t("total_returned")}</span>
            <strong>{money(totals.moneyReturned)}</strong>
          </div>
          <div className="outstanding-value">
            <span>{t("outstanding")}</span>
            <strong>{money(totals.moneyOutstanding)}</strong>
          </div>
        </div>

        <div className="money-summary-actions">
          <button className="btn btn-outline" onClick={onMoneyView}>
            {t("view_history")}
          </button>
          <button className="btn btn-primary" onClick={onMoneyAdd}>
            <Plus size={15} /> <span>{t("add_money")}</span>
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
  const t = useT();

  return (
    <section className="content">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{t("exp_history")}</h2>
            <p>{t("n_records", { n: all.length })}</p>
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
  const t = useT();

  return (
    <section className="content">
      <div className="stats-grid">
        <Stat icon={<span>☀</span>} title={t("Breakfast")} value={totals.breakfast} cls="morning" />
        <Stat icon={<span>◐</span>} title={t("Lunch")} value={totals.lunch} cls="afternoon" />
        <Stat icon={<span>☾</span>} title={t("Dinner")} value={totals.dinner} cls="evening" />
        <Stat icon={<Utensils />} title={t("total_food")} value={totals.food} cls="food" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{t("complete_food")}</h2>
            <p>{t("every_meal")}</p>
          </div>
          <button className="btn btn-primary" onClick={() => onAdd({ type: "food", item: null })}>
            <Plus size={15} /> {t("add_food")}
          </button>
        </div>

        {data.length ? (
          [...data]
            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
            .map((x) => (
              <ExpenseRow
                key={x.id}
                x={{ ...x, type: "food", label: `${t(x.meal)} • ${x.food}` }}
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
  const t = useT();
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
          <button title={t("edit")} aria-label={t("edit")} onClick={() => onEdit({ type: x.type, item: x })}>
            <Edit3 size={15} />
          </button>
          <button title={t("delete")} aria-label={t("delete")} onClick={() => onDelete(x.type, x.id)}>
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function Empty() {
  const t = useT();
  return (
    <div className="empty">
      <ReceiptText size={26} />
      <b>{t("empty_title")}</b>
      <span>{t("empty_sub")}</span>
    </div>
  );
}

function MoneyPage({ transactions, people, totals, onAdd, onEdit, onDelete }) {
  const t = useT();

  return (
    <section className="content">
      <div className="kpi-grid four">
        <MoneyStat icon={<ArrowDownLeft />} title={t("total_given")} value={totals.moneyGiven} cls="given" />
        <MoneyStat icon={<ArrowUpRight />} title={t("total_returned")} value={totals.moneyReturned} cls="returned" />
        <MoneyStat icon={<CircleDollarSign />} title={t("outstanding")} value={totals.moneyOutstanding} cls="balance" />
        <MoneyStat icon={<Users />} title={t("people")} value={people.length} cls="people" raw />
      </div>

      <div className="year-head">
        <h2>{t("people_bal")}</h2>
        <span>{t("people_sub")}</span>
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
            <b>{t("empty_title")}</b>
            <span>{t("empty_sub")}</span>
            <button className="btn btn-primary empty-add" onClick={() => onAdd()}>
              <Plus size={15} /> {t("add_money_tx")}
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{t("all_money_tx")}</h2>
            <p>{t("n_records", { n: transactions.length })}</p>
          </div>
          <History size={18} className="history-icon" />
        </div>

        {transactions.length ? (
          [...transactions]
            .sort(
              (a, b) =>
                String(b.date).localeCompare(String(a.date)) ||
                Number(b.id || 0) - Number(b.id || 0)
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
  const t = useT();
  const stats = getPersonStats(transactions, person);

  return (
    <div className="person-card">
      <div className="person-card-head">
        <div className="person-avatar">{person.charAt(0).toUpperCase()}</div>
        <div className="person-name-wrap">
          <b>{person}</b>
          <span>{t("n_records", { n: stats.transactions.length })}</span>
        </div>
        <span className={`balance-pill ${stats.balance === 0 ? "zero" : ""}`}>
          {stats.balance === 0 ? t("settled") : t("due", { n: money(stats.balance) })}
        </span>
      </div>

      <div className="person-money-grid">
        <div>
          <span>{t("given")}</span>
          <strong>{money(stats.given)}</strong>
        </div>
        <div>
          <span>{t("returned")}</span>
          <strong>{money(stats.returned)}</strong>
        </div>
        <div>
          <span>{t("remaining")}</span>
          <strong>{money(stats.balance)}</strong>
        </div>
      </div>

      <div className="person-history-title">
        <History size={14} /> {t("tx_history")}
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

      <button className="person-add-return" onClick={() => onAdd({ person })}>
        <Plus size={14} /> {t("add_money_tx")} • {person}
      </button>
    </div>
  );
}

function MoneyTransactionRow({ transaction, transactions, compact = false, onEdit, onDelete }) {
  const t = useT();
  const balance = getPersonBalance(transactions, transaction.person);
  const typeGiven = transaction.type === "given";
  const historyBalance = getPersonBalance(
    transactions
      .filter(
        (x) => x.person?.trim().toLowerCase() === transaction.person?.trim().toLowerCase()
      )
      .filter(
        (x) =>
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
        <span>{transaction.date} • {typeGiven ? t("given") : t("returned")}</span>
      </div>

      <div className="money-transaction-amount">
        <strong>{typeGiven ? "+" : "−"}{money(transaction.amount)}</strong>
        <span>{money(Math.max(0, historyBalance))}</span>
      </div>

      {!compact && <span className="current-balance-label">{money(balance)}</span>}

      <div className="row-actions">
        <button title={t("edit")} aria-label={t("edit")} onClick={() => onEdit(transaction)}>
          <Edit3 size={15} />
        </button>
        <button title={t("delete")} aria-label={t("delete")} onClick={() => onDelete(transaction.id)}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   Modals
   ========================================================= */

function ExpenseModal({ initial, type, onClose, onSave, onSaveMultiple }) {
  const t = useT();
  const isEditing = Boolean(initial && initial.id);

  const [kind, setKind] = useState(type);
  const [date, setDate] = useState(initial?.date || today());
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [meal, setMeal] = useState(initial?.meal || mealByTime());
  const [title, setTitle] = useState(
    type === "rent" ? "" : initial?.description || initial?.food || initial?.name || ""
  );

  // New state for multi-selection and individual prices in Food category
  const [selectedFoodItems, setSelectedFoodItems] = useState(
    isEditing && type === "food" ? [{ name: initial.food, amount: initial.amount }] : []
  );
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  const [month, setMonth] = useState(initial?.month || "");
  const [rentDesc, setRentDesc] = useState(type === "rent" ? initial?.description || "" : "");
  const [otherCategory, setOtherCategory] = useState(initial?.category || "Miscellaneous");

  const formRef = useRef(null);
  const amountRef = useRef(null);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();[cite: 1]
    }
    window.addEventListener("keydown", onKey);[cite: 1]
    return () => window.removeEventListener("keydown", onKey);[cite: 1]
  }, [onClose]);

  function toggleFoodSelection(foodName) {
    setSelectedFoodItems((prev) => {
      const exists = prev.find((i) => i.name === foodName);
      if (exists) {
        return prev.filter((i) => i.name !== foodName);
      } else {
        return [...prev, { name: foodName, amount: 30 }]; // default initial price suggestion
      }
    });
  }

  function updateFoodItemPrice(foodName, newAmount) {
    setSelectedFoodItems((prev) =>
      prev.map((i) => (i.name === foodName ? { ...i, amount: newAmount } : i))
    );
  }

  function addCustomFood() {
    if (!customItemName.trim()) return;
    const priceNum = Number(customItemPrice) || 30;
    setSelectedFoodItems((prev) => [
      ...prev.filter((i) => i.name !== customItemName.trim()),
      { name: customItemName.trim(), amount: priceNum }
    ]);
    setCustomItemName("");
    setCustomItemPrice("");
  }

  function save(again) {
    if (kind === "food" && !isEditing) {
      if (selectedFoodItems.length === 0) return;
      const records = selectedFoodItems.map((item) => ({
        id: Date.now() + Math.random(),
        date,
        meal,
        food: item.name,
        amount: Number(item.amount) || 0
      }));
      onSaveMultiple("food", records, again);
      if (again) {
        setSelectedFoodItems([]);
      }
      return;
    }

    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return;

    const common = { id: initial?.id, date, amount: numeric };
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
        { ...common, category: otherCategory, name: text || "Other expense" },
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
    setSelectedFoodItems([]);
    if (next === "food") setMeal(mealByTime());
  }

  const suggestions = SUGGESTIONS[kind] || [];
  const foodSuggestions = FOOD_SUGGESTIONS_BY_MEAL[meal] || [];
  const quickAmounts = QUICK_BY_KIND[kind === "food" ? meal : kind] || QUICK_AMOUNTS;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{isEditing ? t("edit_expense_eb") : t("new_expense")}</span>
            <h2>{isEditing ? t("update_expense") : t("add_expense")}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        {!isEditing && (
          <div className="type-tabs">
            {[
              ["travel", t("travel"), <TrainFront key="travel" />],
              ["food", t("food"), <Utensils key="food" />],
              ["snacks", t("snacks"), <Coffee key="snacks" />],
              ["rent", t("rent"), <BedDouble key="rent" />],
              ["other", t("other"), <CircleDollarSign key="other" />]
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
          {kind === "food" && (
            <label>
              {t("meal_type")}
              <select
                value={meal}
                onChange={(event) => {
                  setMeal(event.target.value);
                  if (!isEditing) setSelectedFoodItems([]);
                }}
              >
                <option value="Breakfast">{t("Breakfast")}</option>
                <option value="Lunch">{t("Lunch")}</option>
                <option value="Dinner">{t("Dinner")}</option>
              </select>
            </label>
          )}

          {kind === "food" && !isEditing ? (
            <>
              <label>{t("what_eat")} (Select multiple)</label>
              <div className="chips">
                {foodSuggestions.map((item) => {
                  const isSelected = selectedFoodItems.some((i) => i.name === item);
                  return (
                    <button
                      type="button"
                      key={item}
                      className={`chip ${isSelected ? "on" : ""}`}
                      onClick={() => toggleFoodSelection(item)}
                    >
                      {item} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px auto", gap: "8px", marginTop: "8px" }}>
                <input
                  placeholder={t("custom_item")}
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder={t("price")}
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                />
                <button type="button" className="btn btn-outline" onClick={addCustomFood}>
                  {t("add_custom")}
                </button>
              </div>

              {selectedFoodItems.length > 0 && (
                <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
                  <label>Adjust individual prices:</label>
                  {selectedFoodItems.map((item) => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface-soft)", padding: "8px", borderRadius: "8px" }}>
                      <span style={{ flex: 1, fontWeight: "600", fontSize: "13px" }}>{item.name}</span>
                      <input
                        type="number"
                        style={{ width: "90px", margin: 0, padding: "6px" }}
                        value={item.amount}
                        onChange={(e) => updateFoodItemPrice(item.name, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <label>
                {t("amount")}
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
                {quickAmounts.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={`chip ${Number(amount) === value ? "on" : ""}`}
                    onClick={() => setAmount(String(value))}
                  >
                    {chipLabel(value)}
                  </button>
                ))}
              </div>
            </>
          )}

          {kind === "travel" && (
            <label>
              {t("travel_desc")}
              <input
                placeholder="Bus, Train, Auto, Cab"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          )}

          {kind === "food" && isEditing && (
            <label>
              {t("what_eat")}
              <input
                placeholder="Idly, Meals, Dosa"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          )}

          {kind === "snacks" && (
            <label>
              {t("snack_name")}
              <input
                placeholder="Tea, Biscuit, Juice"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          )}

          {kind === "other" && (
            <>
              <label>
                {t("exp_category")}
                <select
                  value={otherCategory}
                  onChange={(event) => setOtherCategory(event.target.value)}
                >
                  {[
                    "Personal Care",
                    "Cleaning",
                    "Clothes Washing",
                    "Household Item",
                    "Bathroom Item",
                    "Miscellaneous"
                  ].map((c) => (
                    <option key={c} value={c}>
                      {t(c)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("exp_name")}
                <input
                  placeholder="Soap, Toothpaste, Hanger, Detergent"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
            </>
          )}

          {kind !== "food" && suggestions.length > 0 && (
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
                {t("month")}
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                />
              </label>
              <label>
                {t("desc_opt")}
                <input
                  placeholder="September room rent"
                  value={rentDesc}
                  onChange={(event) => setRentDesc(event.target.value)}
                />
              </label>
            </>
          )}

          <label>
            {t("date")}
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
              {t("today")}
            </button>
            <button
              type="button"
              className={`chip ${date === dateKey(1) ? "on" : ""}`}
              onClick={() => setDate(dateKey(1))}
            >
              {t("yesterday")}
            </button>
          </div>

          <div className="save-row">
            <button className="save-btn" type="submit">
              <Check size={18} />
              {isEditing ? t("update_expense") : t("save")}
            </button>

            {!isEditing && (
              <button className="save-btn secondary" type="button" onClick={saveAndAddAnother}>
                <Plus size={18} />
                {t("save_another")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function MoneyModal({ initial, type, transactions, onClose, onSave }) {
  const t = useT();
  const [kind, setKind] = useState(type || "given");[cite: 1]
  const [person, setPerson] = useState(initial?.person || "");[cite: 1]
  const [date, setDate] = useState(initial?.date || today());[cite: 1]
  const [amount, setAmount] = useState(initial?.amount ?? "");[cite: 1]
  const [error, setError] = useState("");[cite: 1]

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();[cite: 1]
    }
    window.addEventListener("keydown", onKey);[cite: 1]
    return () => window.removeEventListener("keydown", onKey);[cite: 1]
  }, [onClose]);

  const currentBalance = person.trim()
    ? getPersonBalance(transactions, person, initial?.id || null)
    : 0;[cite: 1]

  const isEditing = Boolean(initial && initial.id);[cite: 1]

  function submit(event) {
    event.preventDefault();[cite: 1]
    const numericAmount = Number(amount);[cite: 1]

    if (!person.trim()) {
      setError(t("person_name"));[cite: 1]
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError(t("amount"));[cite: 1]
      return;
    }

    if (kind === "returned" && numericAmount > currentBalance) {
      setError(`${t("avail_bal")}: ${money(currentBalance)}`);[cite: 1]
      return;
    }

    setError("");[cite: 1]
    onSave({
      id: initial?.id,
      person: person.trim(),
      date,
      type: kind,
      amount: numericAmount
    });[cite: 1]
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal money-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{isEditing ? t("edit_money_eb") : t("new_money_eb")}</span>
            <h2>{isEditing ? t("update_tx") : t("add_money_tx")}</h2>
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
              setKind("given");[cite: 1]
              setError("");[cite: 1]
            }}
          >
            <ArrowDownLeft size={18} />
            <span>{t("money_given")}</span>
            <small>{t("money_given_sub")}</small>
          </button>
          <button
            type="button"
            className={kind === "returned" ? "selected" : ""}
            onClick={() => {
              setKind("returned");[cite: 1]
              setError("");[cite: 1]
            }}
          >
            <ArrowUpRight size={18} />
            <span>{t("money_returned")}</span>
            <small>{t("money_returned_sub")}</small>
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            {t("person_name")}
            <input
              autoFocus={!initial?.person}
              placeholder="Arun"
              value={person}
              onChange={(event) => {
                setPerson(event.target.value);[cite: 1]
                setError("");[cite: 1]
              }}
              required
            />
          </label>

          <label>
            {t("amount")}
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
                setAmount(event.target.value);[cite: 1]
                setError("");[cite: 1]
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
                  setAmount(String(value));[cite: 1]
                  setError("");[cite: 1]
                }}
              >
                ₹{value}
              </button>
            ))}
          </div>

          <label>
            {t("date")}
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          {kind === "returned" && person.trim() && (
            <div className="available-balance">
              <span>{t("avail_bal")}</span>
              <strong>{money(currentBalance)}</strong>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="save-btn" type="submit">
            <Check size={18} />
            {isEditing ? t("update_tx") : t("save_tx")}
          </button>
        </form>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);[cite: 1]