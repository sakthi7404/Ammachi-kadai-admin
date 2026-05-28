// ── MEAL SLOTS ──────────────────────────────────────────────
const SLOTS = [
  { id:"breakfast", label:"Breakfast", time:"7:00 – 11:00 AM",  icon:"☀️" },
  { id:"lunch",     label:"Lunch",     time:"12:00 – 2:00 PM",  icon:"🌤" },
  { id:"snacks",    label:"Snacks",    time:"4:00 – 6:00 PM",   icon:"🌥" },
  { id:"dinner",    label:"Dinner",    time:"7:00 – 9:00 PM",   icon:"🌙" },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ── MEAL PLANS ──────────────────────────────────────────────
const INITIAL_PLANS = [
  // ── BREAKFAST ──────────────────────────────────────────
  {
    id:1, slot:"breakfast", tier:"Basic", types:["Veg"],
    price:59, duration:"Daily", servings:1, maxServings:1,
    subscribers:38, featured:false, active:true,
    items:"Idli (2) + Chutney + Sambar",
    weeklyMenu:{
      Mon:"Idli (2) + Coconut Chutney + Sambar",
      Tue:"Pongal + Vada (1) + Sambar",
      Wed:"Upma + Pickle + Coconut Chutney",
      Thu:"Idli (2) + Tomato Chutney + Sambar",
      Fri:"Kichadi + Coconut Chutney",
      Sat:"Rava Idli (2) + Sambar + Chutney",
      Sun:"Puri (2) + Potato Masala"
    }
  },
  {
    id:2, slot:"breakfast", tier:"Standard", types:["Veg"],
    price:89, duration:"Daily", servings:1, maxServings:1,
    subscribers:52, featured:true, active:true,
    items:"Dosa (2) + Chutney + Sambar + Filter Coffee",
    weeklyMenu:{
      Mon:"Plain Dosa (2) + Coconut Chutney + Sambar + Filter Coffee",
      Tue:"Masala Dosa (2) + Coconut Chutney + Filter Coffee",
      Wed:"Rava Dosa (2) + Onion Chutney + Sambar + Filter Coffee",
      Thu:"Ghee Pongal + Vada (1) + Sambar + Filter Coffee",
      Fri:"Idiyappam (4) + Coconut Milk + Egg Curry + Coffee",
      Sat:"Paniyaram (6) + Coconut Chutney + Filter Coffee",
      Sun:"Poori (3) + Channa Masala + Filter Coffee"
    }
  },
  {
    id:3, slot:"breakfast", tier:"Premium", types:["Veg","Non-Veg"],
    price:129, duration:"Daily", servings:1, maxServings:1,
    subscribers:21, featured:false, active:true,
    items:"Full Breakfast Thali + Egg / Omelette + Coffee",
    weeklyMenu:{
      Mon:"Masala Dosa + Vada (2) + Sambar + Chutney + Boiled Egg + Filter Coffee",
      Tue:"Ghee Pongal + Omelette (2-egg) + Coconut Chutney + Filter Coffee",
      Wed:"Idli (3) + Vada (1) + Sambar + Tomato Chutney + Omelette + Coffee",
      Thu:"Poori (3) + Potato Masala + Halwa + Boiled Egg (2) + Filter Coffee",
      Fri:"Appam (3) + Egg Kurma + Coconut Milk + Filter Coffee",
      Sat:"Rava Dosa (2) + Prawn Masala + Chutney + Filter Coffee",
      Sun:"Idiyappam (5) + Chicken Stew + Coconut Milk + Filter Coffee"
    }
  },

  // ── LUNCH ──────────────────────────────────────────────
  {
    id:4, slot:"lunch", tier:"Basic", types:["Veg"],
    price:79, duration:"Daily", servings:1, maxServings:1,
    subscribers:61, featured:false, active:true,
    items:"Rice + Dal + 1 Sabzi + Pickle",
    weeklyMenu:{
      Mon:"Steamed Rice + Toor Dal + Beans Poriyal + Pickle",
      Tue:"Steamed Rice + Moong Dal + Cabbage Poriyal + Pickle",
      Wed:"Steamed Rice + Rasam + Carrot Kootu + Pickle",
      Thu:"Steamed Rice + Dal Tadka + Potato Fry + Pickle",
      Fri:"Steamed Rice + Keerai Masiyal + Papad + Pickle",
      Sat:"Steamed Rice + Sambar + Drumstick Poriyal + Pickle",
      Sun:"Lemon Rice + Papad + Pickle + Raita"
    }
  },
  {
    id:5, slot:"lunch", tier:"Standard", types:["Veg","Non-Veg"],
    price:119, duration:"Daily", servings:1, maxServings:2,
    subscribers:74, featured:true, active:true,
    items:"Rice + Rasam + 2 Sabzi + Papad + Curd",
    weeklyMenu:{
      Mon:"Rice + Sambar + Beans Poriyal + Potato Fry + Papad + Curd",
      Tue:"Rice + Rasam + Cabbage Kootu + Egg Masala + Papad + Curd",
      Wed:"Rice + Kuzhambu + Carrot Poriyal + Fish Fry + Papad + Curd",
      Thu:"Rice + Dal + Brinjal Poriyal + Chicken Curry + Papad + Curd",
      Fri:"Rice + Rasam + Drumstick Sambar + Prawn Fry + Papad + Curd",
      Sat:"Rice + Vatha Kuzhambu + Cauliflower Fry + Mutton Curry + Papad + Curd",
      Sun:"Rice + Coconut Milk Curry + 2 Veg Sides + Papad + Payasam"
    }
  },
  {
    id:6, slot:"lunch", tier:"Premium", types:["Veg","Non-Veg"],
    price:169, duration:"Daily", servings:1, maxServings:4,
    subscribers:33, featured:false, active:true,
    items:"Full Chettinad Thali + Dessert + Buttermilk",
    weeklyMenu:{
      Mon:"Full Chettinad Thali: Rice + Sambar + Rasam + 3 Veg Sides + Pickle + Papad + Kheer + Buttermilk",
      Tue:"Full Non-Veg Thali: Rice + Chicken Chettinad + Fish Curry + 2 Veg Sides + Rasam + Raita + Halwa + Buttermilk",
      Wed:"Veg Special Thali: Rice + Kootu + Poriyal + Aviyal + Rasam + Papad + Payasam + Buttermilk",
      Thu:"Mutton Thali: Rice + Mutton Kuzhambu + 2 Veg Sides + Rasam + Pickle + Gulab Jamun + Buttermilk",
      Fri:"Seafood Thali: Rice + Prawn Masala + Fish Fry + 2 Veg Sides + Rasam + Raita + Buttermilk",
      Sat:"Grand Thali: Rice + 4 Veg Sides + Chicken Curry + Rasam + Papad + 2 Desserts + Buttermilk",
      Sun:"Festival Thali: Rice + Pongal + 4 Sides + Mutton Curry + Papad + Pickle + Payasam + Buttermilk"
    }
  },

  // ── SNACKS ──────────────────────────────────────────────
  {
    id:7, slot:"snacks", tier:"Basic", types:["Veg"],
    price:39, duration:"Daily", servings:1, maxServings:1,
    subscribers:29, featured:false, active:true,
    items:"Murukku or Pakoda (100g)",
    weeklyMenu:{
      Mon:"Murukku (100g)",
      Tue:"Onion Pakoda (100g)",
      Wed:"Ribbon Pakoda (100g)",
      Thu:"Mullu Murukku (100g)",
      Fri:"Kara Sev (100g)",
      Sat:"Thattai (100g)",
      Sun:"Mixture (100g)"
    }
  },
  {
    id:8, slot:"snacks", tier:"Standard", types:["Veg","Non-Veg"],
    price:69, duration:"Daily", servings:1, maxServings:1,
    subscribers:44, featured:true, active:true,
    items:"Snack Box (150g) + Tea",
    weeklyMenu:{
      Mon:"Samosa (2) + Mint Chutney + Masala Tea",
      Tue:"Bajji (4 pcs) + Coconut Chutney + Ginger Tea",
      Wed:"Bread Pakoda (2) + Tomato Ketchup + Masala Tea",
      Thu:"Egg Puff (2) + Ketchup + Lemon Tea",
      Fri:"Chicken Puff (2) + Ketchup + Masala Tea",
      Sat:"Paneer Roll (2) + Chutney + Cardamom Tea",
      Sun:"Vada (2) + Sambar + Filter Coffee"
    }
  },
  {
    id:9, slot:"snacks", tier:"Premium", types:["Veg","Non-Veg"],
    price:99, duration:"Daily", servings:1, maxServings:1,
    subscribers:18, featured:false, active:false,
    items:"Premium Snack Box (200g) + Filter Coffee",
    weeklyMenu:{
      Mon:"Mini Idli (8) + Sambar + Coconut Chutney + Filter Coffee",
      Tue:"Chicken Sandwich + Chips (50g) + Iced Tea",
      Wed:"Paneer Tikka (3 pcs) + Mint Chutney + Filter Coffee",
      Thu:"Egg Frankie (1) + Chips + Masala Lemon Tea",
      Fri:"Prawn Cutlet (2) + Tartar Sauce + Filter Coffee",
      Sat:"Mini Dosa (4) + Chutney + Sambar + Filter Coffee",
      Sun:"Mutton Samosa (2) + Raita + Cardamom Filter Coffee"
    }
  },

  // ── DINNER ──────────────────────────────────────────────
  {
    id:10, slot:"dinner", tier:"Basic", types:["Veg"],
    price:89, duration:"Daily", servings:1, maxServings:1,
    subscribers:49, featured:false, active:true,
    items:"Rice + Dal + 1 Sabzi + Roti (2)",
    weeklyMenu:{
      Mon:"Roti (2) + Dal Tadka + Jeera Rice + Pickle",
      Tue:"Roti (2) + Aloo Sabzi + Steamed Rice + Pickle",
      Wed:"Roti (2) + Rajma + Rice + Pickle",
      Thu:"Roti (2) + Palak Dal + Rice + Pickle",
      Fri:"Roti (2) + Mixed Veg Curry + Rice + Pickle",
      Sat:"Roti (2) + Channa Masala + Rice + Pickle",
      Sun:"Puri (3) + Potato Masala + Rice + Pickle"
    }
  },
  {
    id:11, slot:"dinner", tier:"Standard", types:["Veg","Non-Veg"],
    price:139, duration:"Daily", servings:1, maxServings:2,
    subscribers:67, featured:true, active:true,
    items:"Rice + Sambar + 2 Sabzi + Roti + Curd",
    weeklyMenu:{
      Mon:"Rice + Sambar + Beans Poriyal + Egg Curry + Roti (2) + Curd",
      Tue:"Rice + Dal Fry + Aloo Gobi + Chicken Gravy + Roti (2) + Curd",
      Wed:"Rice + Rasam + Cabbage Poriyal + Fish Curry + Roti (2) + Curd",
      Thu:"Rice + Vatha Kuzhambu + Potato Fry + Mutton Keema + Roti (2) + Curd",
      Fri:"Rice + Coconut Milk Curry + 2 Veg Sides + Prawn Masala + Roti (2) + Curd",
      Sat:"Biryani (Chicken / Veg) + Raita + Salan + Roti (2)",
      Sun:"Rice + Pepper Chicken / Paneer Butter Masala + 2 Sides + Roti (2) + Curd"
    }
  },
  {
    id:12, slot:"dinner", tier:"Premium", types:["Veg","Non-Veg"],
    price:199, duration:"Daily", servings:1, maxServings:4,
    subscribers:28, featured:false, active:true,
    items:"Full Dinner Thali + Dessert + Soup",
    weeklyMenu:{
      Mon:"Veg Thali: Rice + 3 Sabzis + Dal Makhani + Roti (3) + Soup + Gulab Jamun",
      Tue:"Non-Veg: Chicken Biryani + Mutton Curry + Raita + Roti (2) + Soup + Kheer",
      Wed:"Seafood Night: Fish Biryani + Prawn Gravy + Raita + Roti (2) + Soup + Payasam",
      Thu:"Chettinad Feast: Rice + Chicken Chettinad + 3 Sides + Roti (2) + Rasam + Dessert",
      Fri:"Mughlai: Butter Chicken / Paneer + Naan (2) + Rice + Soup + Kulfi",
      Sat:"Grand Dinner: Mutton Biryani + Chicken Gravy + 2 Veg Sides + Roti (2) + Soup + 2 Desserts",
      Sun:"Sunday Special: Rice + 4 Non-Veg Sides + Roti (3) + Soup + Halwa + Buttermilk"
    }
  },
];

// ── DELIVERIES ──────────────────────────────────────────────
const INITIAL_DELIVERIES = [
  { id:1, customer:"Priya Ramaswamy",     slot:"Breakfast", time:"7:30 AM",  route:"Route A – Saravanampatti", carrier:"Karthik", plan:"Standard Veg",  status:"Delivered"        },
  { id:2, customer:"Meena Sundaram",      slot:"Lunch",     time:"12:45 PM", route:"Route B – RS Puram",        carrier:"Selvam",  plan:"Basic Veg",     status:"Preparing"        },
  { id:3, customer:"Lakshmi Natarajan",   slot:"Dinner",    time:"7:15 PM",  route:"Route A – Saravanampatti", carrier:"Karthik", plan:"Premium",       status:"Packed"           },
  { id:4, customer:"Anbu Murugan",        slot:"Snacks",    time:"4:30 PM",  route:"Route C – Gandhipuram",    carrier:"Rajan",   plan:"Basic Veg",     status:"Skipped"          },
  { id:5, customer:"Kavitha Pillai",      slot:"Lunch",     time:"1:00 PM",  route:"Route B – RS Puram",        carrier:"Selvam",  plan:"Standard",      status:"Out for Delivery" },
  { id:6, customer:"Rathi Krishnamurthy", slot:"Breakfast", time:"8:00 AM",  route:"Route C – Gandhipuram",    carrier:"Rajan",   plan:"Basic Veg",     status:"Delivered"        },
  { id:7, customer:"Suresh Chellam",      slot:"Dinner",    time:"7:45 PM",  route:"Route A – Saravanampatti", carrier:"Karthik", plan:"Premium",       status:"Preparing"        },
];

// ── SUBSCRIPTIONS ────────────────────────────────────────────
const INITIAL_SUBSCRIPTIONS = [
  { id:1, name:"Priya Ramaswamy",   plan:"Breakfast Standard + Lunch Basic", duration:"Monthly", deposit:"₹450", coupon:"₹120", status:"Active"                       },
  { id:2, name:"Meena Sundaram",    plan:"Lunch Basic Veg",                  duration:"Weekly",  deposit:"₹200", coupon:"₹0",   status:"Expiring Soon"                },
  { id:3, name:"Lakshmi Natarajan", plan:"All Slots Premium",                duration:"Monthly", deposit:"₹800", coupon:"₹250", status:"Active"                       },
  { id:4, name:"Anbu Murugan",      plan:"Snacks Basic",                     duration:"Weekly",  deposit:"₹150", coupon:"₹0",   status:"Carrier Verification Pending" },
  { id:5, name:"Kavitha Pillai",    plan:"Dinner Standard Non-Veg",          duration:"Monthly", deposit:"₹300", coupon:"₹80",  status:"Expired"                      },
];

// ── CARRIERS ─────────────────────────────────────────────────
const INITIAL_CARRIERS = [
  { id:1, user:"Priya Ramaswamy",    deposit:450, issued:3, returned:3, pending:0, refund:450, status:"Full Refund" },
  { id:2, user:"Meena Sundaram",     deposit:200, issued:2, returned:1, pending:1, refund:120, status:"Partial"     },
  { id:3, user:"Anbu Murugan",       deposit:150, issued:2, returned:0, pending:2, refund:0,   status:"Missing"     },
  { id:4, user:"Rathi Krishnamurthy",deposit:300, issued:2, returned:2, pending:0, refund:300, status:"Full Refund" },
  { id:5, user:"Suresh Chellam",     deposit:450, issued:3, returned:2, pending:1, refund:250, status:"Partial"     },
];

// ── SKIPS ────────────────────────────────────────────────────
const INITIAL_SKIPS = [
  { id:1, user:"Meena Sundaram",    slot:"Lunch",     date:"25 May 2026", reason:"Travel",           amount:85,  status:"Pending"      },
  { id:2, user:"Lakshmi Natarajan", slot:"Dinner",    date:"24 May 2026", reason:"Function at home", amount:120, status:"Approved"     },
  { id:3, user:"Priya Ramaswamy",   slot:"Breakfast", date:"23 May 2026", reason:"Unwell",           amount:65,  status:"Coupon Issued"},
  { id:4, user:"Kavitha Pillai",    slot:"Snacks",    date:"22 May 2026", reason:"Outstation",       amount:45,  status:"Pending"      },
  { id:5, user:"Suresh Chellam",    slot:"Lunch",     date:"21 May 2026", reason:"Office trip",      amount:85,  status:"Rejected"     },
];

// ── ORDERS ───────────────────────────────────────────────────
const INITIAL_ORDERS = [
  { id:"ORD001", customer:"Ram Kumar",    product:"Murukku Pack (500g)",        category:"Snacks",     amount:220, payment:"Online", status:"Delivered"   },
  { id:"ORD002", customer:"Geetha Selvi", product:"Chettinad Pepper Powder",    category:"Masalas",    amount:180, payment:"COD",    status:"Shipped"     },
  { id:"ORD003", customer:"Vijay Anand",  product:"Handcrafted Brass Spoon Set",category:"Handcrafts", amount:650, payment:"Online", status:"Packed"      },
  { id:"ORD004", customer:"Suba Lakshmi", product:"Ribbon Pakoda (250g)",       category:"Snacks",     amount:140, payment:"COD",    status:"Order Placed"},
  { id:"ORD005", customer:"Mani Iyer",    product:"Kola Urundai Mix",           category:"Masalas",    amount:210, payment:"Online", status:"Delivered"   },
];

// ── INVENTORY ────────────────────────────────────────────────
const INITIAL_INVENTORY = [
  { id:1, product:"Murukku (500g)",         category:"Snacks",     stock:12, status:"Low Stock"   },
  { id:2, product:"Ribbon Pakoda (250g)",   category:"Snacks",     stock:0,  status:"Out of Stock"},
  { id:3, product:"Chettinad Pepper Powder",category:"Masalas",    stock:45, status:"In Stock"    },
  { id:4, product:"Kola Urundai Mix",       category:"Masalas",    stock:8,  status:"Low Stock"   },
  { id:5, product:"Brass Spoon Set",        category:"Handcrafts", stock:23, status:"In Stock"    },
  { id:6, product:"Handwoven Basket",       category:"Handcrafts", stock:6,  status:"Low Stock"   },
];

// ── COUPONS ──────────────────────────────────────────────────
const INITIAL_COUPONS = [
  { id:1, code:"AMMACHI20", type:"percent", off:"20%", desc:"20% off all orders",  min:"₹200", uses:87,  maxUses:200, expiry:"30 Jun 2026", status:"active" },
  { id:2, code:"FIRST50",   type:"flat",    off:"₹50", desc:"₹50 off first order", min:"₹300", uses:34,  maxUses:100, expiry:"31 Dec 2026", status:"active" },
  { id:3, code:"FREEDEL",   type:"free",    off:"Free",desc:"Free delivery",        min:"₹150", uses:52,  maxUses:150, expiry:"15 Jun 2026", status:"active" },
  { id:4, code:"SUMMER30",  type:"percent", off:"30%", desc:"Summer special",       min:"₹400", uses:100, maxUses:100, expiry:"15 May 2026", status:"expired"},
  { id:5, code:"SKIP15",    type:"flat",    off:"₹15", desc:"Skip credit coupon",   min:"₹0",   uses:22,  maxUses:500, expiry:"31 Jul 2026", status:"active" },
];

// ── CONTENT ──────────────────────────────────────────────────
const INITIAL_CONTENT = [
  { id:1, title:"Festival season sale",    type:"banner",       status:"published", date:"20 May 2026" },
  { id:2, title:"How we pack your tiffin", type:"blog",         status:"published", date:"18 May 2026" },
  { id:3, title:"New menu launch – June",  type:"announcement", status:"draft",     date:"25 May 2026" },
  { id:4, title:"Customer stories",        type:"blog",         status:"published", date:"10 May 2026" },
  { id:5, title:"Monsoon combo offer",     type:"banner",       status:"published", date:"5 May 2026"  },
];

// ── CUSTOMERS ────────────────────────────────────────────────
const INITIAL_CUSTOMERS = [
  { id:1, name:"Priya Ramaswamy",    phone:"98765 43210", plan:"Standard",  orders:24, spent:"₹9,840",  status:"active"   },
  { id:2, name:"Meena Sundaram",     phone:"87654 32109", plan:"Basic",     orders:8,  spent:"₹2,120",  status:"active"   },
  { id:3, name:"Lakshmi Natarajan",  phone:"76543 21098", plan:"Premium",   orders:31, spent:"₹14,260", status:"active"   },
  { id:4, name:"Anbu Murugan",       phone:"65432 10987", plan:"Basic",     orders:3,  spent:"₹640",    status:"inactive" },
  { id:5, name:"Kavitha Pillai",     phone:"54321 09876", plan:"Standard",  orders:19, spent:"₹7,580",  status:"active"   },
  { id:6, name:"Rathi Krishnamurthy",phone:"43210 98765", plan:"Basic",     orders:0,  spent:"₹0",      status:"inactive" },
  { id:7, name:"Suresh Chellam",     phone:"32109 87654", plan:"Premium",   orders:42, spent:"₹17,400", status:"active"   },
];

// ── STAFFS ───────────────────────────────────────────────────
const INITIAL_STAFFS = [
  { id:1, name:"Karthik M.", role:"carrier", phone:"91234 56789", joined:"Jan 2024", deliveries:312, status:"active", routes:["Route A – Saravanampatti"] },
  { id:2, name:"Selvam K.",  role:"carrier", phone:"91234 56788", joined:"Mar 2024", deliveries:264, status:"active", routes:["Route B – RS Puram"] },
  { id:3, name:"Rajan P.",   role:"carrier", phone:"91234 56787", joined:"Feb 2024", deliveries:198, status:"active", routes:["Route C – Gandhipuram"] },
  { id:4, name:"Divya R.",   role:"kitchen", phone:"91234 56786", joined:"Jan 2024", deliveries:0,   status:"active" },
  { id:5, name:"Geetha L.",  role:"kitchen", phone:"91234 56785", joined:"Apr 2024", deliveries:0,   status:"leave"  },
  { id:6, name:"Vijay A.",   role:"manager", phone:"91234 56784", joined:"Dec 2023", deliveries:0,   status:"active" },
  { id:7, name:"Mani I.",    role:"carrier", phone:"91234 56783", joined:"May 2024", deliveries:88,  status:"active", routes:["Route A – Saravanampatti"] },
  { id:8, name:"Suba L.",    role:"kitchen", phone:"91234 56782", joined:"Jun 2024", deliveries:0,   status:"active" },
];

// ── CHATS ────────────────────────────────────────────────────
const INITIAL_CHATS = [
  { id:1, name:"Priya Ramaswamy",   last:"My carrier box is damaged",  time:"10:42 AM",  unread:2, status:"Open",       plan:"Standard Monthly", deposit:"₹450", coupon:"₹120" },
  { id:2, name:"Meena Sundaram",    last:"Skip request for tomorrow?", time:"Yesterday", unread:0, status:"In Progress", plan:"Basic Weekly",     deposit:"₹200", coupon:"₹0"   },
  { id:3, name:"Lakshmi Natarajan", last:"Thank you!",                 time:"Yesterday", unread:0, status:"Resolved",    plan:"Premium Monthly",  deposit:"₹800", coupon:"₹250" },
  { id:4, name:"Anbu Murugan",      last:"Delivery was late again",    time:"Mon",       unread:1, status:"Open",        plan:"Basic Weekly",     deposit:"₹150", coupon:"₹0"   },
];

const INITIAL_MESSAGES = {
  1:[ { from:"customer", text:"Hi, my carrier box is damaged. The lid doesn't close properly.", time:"10:38 AM" }, { from:"admin", text:"Thank you for letting us know. We will inspect it during your next delivery.", time:"10:40 AM" }, { from:"customer", text:"Will I be charged?", time:"10:42 AM" } ],
  2:[ { from:"customer", text:"Hi, can I skip tomorrow's lunch?", time:"Yesterday 2:10 PM" }, { from:"admin", text:"Sure! Please raise a skip request from your account.", time:"Yesterday 2:15 PM" } ],
  3:[ { from:"customer", text:"My issue was resolved, thank you so much!", time:"Yesterday 9:00 AM" }, { from:"admin", text:"Glad we could help! Have a wonderful day.", time:"Yesterday 9:02 AM" } ],
  4:[ { from:"customer", text:"My dinner delivery came 45 minutes late again.", time:"Mon 8:30 PM" }, { from:"admin", text:"We sincerely apologise for the delay.", time:"Mon 8:35 PM" }, { from:"customer", text:"Please fix this. It's the third time.", time:"Mon 8:37 PM" } ],
};

// ── REPORTS DATA ─────────────────────────────────────────────
const REVENUE_7D  = [3820,4110,3640,4820,5200,4750,5480];
const REVENUE_30D = [
  3200,3800,4100,3700,4400,4900,4200,5100,4700,5300,
  4900,5600,5100,5800,5200,6100,5700,6400,5900,6800,
  6200,5800,6500,6100,7200,6800,7500,7100,7800,8200
];
const DAY_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const SLOT_SUBS = {
  breakfast: 111,
  lunch:     168,
  snacks:    91,
  dinner:    144,
};

const PLAN_TIER_DIST = {
  Basic:    177,
  Standard: 237,
  Premium:   82,
};

const TOP_CUSTOMERS = [
  {name:"Suresh Chellam",   plan:"Premium", spent:"₹17,400", orders:42},
  {name:"Lakshmi Natarajan",plan:"Premium", spent:"₹14,260", orders:31},
  {name:"Priya Ramaswamy",  plan:"Standard",spent:"₹9,840",  orders:24},
  {name:"Kavitha Pillai",   plan:"Standard",spent:"₹7,580",  orders:19},
  {name:"Meena Sundaram",   plan:"Basic",   spent:"₹2,120",  orders:8},
];

const CARRIER_PERF = [
  {name:"Karthik M.", assigned:14, done:14, late:0,  pct:100},
  {name:"Selvam K.",  assigned:12, done:11, late:1,  pct:92},
  {name:"Rajan P.",   assigned:10, done:9,  late:2,  pct:90},
  {name:"Mani I.",    assigned:8,  done:7,  late:1,  pct:88},
];

const COUPON_USAGE = [
  {code:"AMMACHI20", uses:87, maxUses:200},
  {code:"FIRST50",   uses:34, maxUses:100},
  {code:"FREEDEL",   uses:52, maxUses:150},
  {code:"SKIP15",    uses:22, maxUses:500},
];

const SKIP_TREND = [2,5,3,7,4,6,4];
