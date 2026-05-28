// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
const S = {
  page: "dashboard",
  plans:         JSON.parse(JSON.stringify(INITIAL_PLANS)),
  deliveries:    JSON.parse(JSON.stringify(INITIAL_DELIVERIES)),
  subscriptions: JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTIONS)),
  carriers:      JSON.parse(JSON.stringify(INITIAL_CARRIERS)),
  skips:         JSON.parse(JSON.stringify(INITIAL_SKIPS)),
  orders:        JSON.parse(JSON.stringify(INITIAL_ORDERS)),
  inventory:     JSON.parse(JSON.stringify(INITIAL_INVENTORY)),
  coupons:       JSON.parse(JSON.stringify(INITIAL_COUPONS)),
  content:       JSON.parse(JSON.stringify(INITIAL_CONTENT)),
  customers:     JSON.parse(JSON.stringify(INITIAL_CUSTOMERS)),
  staffs:        JSON.parse(JSON.stringify(INITIAL_STAFFS)),
  chats:         JSON.parse(JSON.stringify(INITIAL_CHATS)),
  messages:      JSON.parse(JSON.stringify(INITIAL_MESSAGES)),
  activeChatId:  1,
  planSlotFilter:"all",
  deliveryFilter:"All",
  subTab:        "Active",
  orderTab:      "All",
  invSearch:     "",
  couponFilter:  "all",
  contentFilter: "all",
  custFilter:    "all",
  staffFilter:   "all",
  modal:         null,
  selectedSkips:    [],
  selectedDeliveries: [],
  reportTab:        "week",
  allocFilter:      "All",
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function h(tag, attrs, ...ch) {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs||{})) {
    if (k==="class") el.className=v;
    else if (k.startsWith("on")&&typeof v==="function") el.addEventListener(k.slice(2).toLowerCase(),v);
    else el.setAttribute(k,v);
  }
  ch.flat().forEach(c=>{ if(c==null||c===false)return; el.appendChild(typeof c==="string"?document.createTextNode(c):c); });
  return el;
}
const initials = n => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const avCls    = i => ["","av-maroon","av-black","",""][i%5]||"";
const rupee    = n => "₹"+n;
const stockSt  = n => n===0?"Out of Stock":n<10?"Low Stock":"In Stock";

function menuTextValue(v){ return typeof v==='object' && v!==null ? (v.text||"") : (v||""); }
function menuHasImage(v){ return typeof v==='object' && v!==null && v.img; }
function buildWeeklyMenuView(wm, day, fallbackText){
  const current = wm?.[day] ?? fallbackText ?? "";
  if(typeof current==='object' && current!==null){
    const box=h("div",{style:"display:flex;gap:10px;align-items:flex-start;"});
    if(current.img){
      box.appendChild(h("img",{src:current.img,alt:current.text||day,style:"width:80px;height:80px;border-radius:8px;object-fit:cover;flex-shrink:0;"}));
    }
    box.appendChild(h("div",{style:"font-size:11px;color:var(--ink2);line-height:1.4;min-height:34px;"},current.text||fallbackText||""));
    return box;
  }
  return h("div",{style:"font-size:11px;color:var(--ink2);line-height:1.5;min-height:34px;"},String(current));
}

function badge(text, cls="b-gray") { return h("span",{class:"badge "+cls},text); }

function statusBadge(s) {
  const m = {
    "Delivered":"b-green","Out for Delivery":"b-blue","Packed":"b-blue","Preparing":"b-amber","Skipped":"b-gray",
    "Active":"b-green","Expired":"b-red","Expiring Soon":"b-amber","Carrier Verification Pending":"b-maroon",
    "Pending":"b-amber","Approved":"b-green","Rejected":"b-red","Coupon Issued":"b-maroon",
    "Order Placed":"b-blue","Shipped":"b-blue","Low Stock":"b-amber","Out of Stock":"b-red","In Stock":"b-green",
    "Full Refund":"b-green","Partial":"b-amber","Missing":"b-red",
    "Open":"b-blue","In Progress":"b-amber","Resolved":"b-green",
    "active":"b-green","inactive":"b-red","leave":"b-amber","expired":"b-red",
    "published":"b-green","draft":"b-amber",
    "carrier":"b-blue","kitchen":"b-maroon","manager":"b-black",
    "Basic":"b-gray","Standard":"b-blue","Premium":"b-black",
    "Veg":"b-green","Non-Veg":"b-red",
  };
  return badge(s, m[s]||"b-gray");
}

function btn(label, cls="btn-dark", fn=null) {
  const el = h("button",{class:"btn "+cls},label);
  if (fn) el.addEventListener("click",fn);
  return el;
}

const fv  = id => document.getElementById(id)?.value||"";
const fi  = (id,fb=0) => parseInt(document.getElementById(id)?.value)||fb;
const fsl = id => document.getElementById(id)?.value||"";

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
let _tt;
function toast(msg,type="success"){
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t);}
  t.textContent=msg; t.className=`show t-${type}`;
  clearTimeout(_tt); _tt=setTimeout(()=>t.className="",2800);
}

// ─────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────
function render(){
  const app=document.getElementById("app");
  app.innerHTML="";
  app.appendChild(buildSidebar());
  const main=h("div",{class:"main"});
  main.appendChild(buildTopbar());
  main.appendChild(h("div",{class:"content"},buildPage()));
  app.appendChild(main);
  if(S.modal) app.appendChild(buildModalWrap());
  if(!document.getElementById("toast")){const t=document.createElement("div");t.id="toast";document.body.appendChild(t);}
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────
function buildSidebar(){
  const pendSkips    = S.skips.filter(s=>s.status==="Pending").length;
  const pendCarriers = S.carriers.filter(c=>c.pending>0).length;
  const nav=[
    {section:"Operations", items:[
      {id:"dashboard",     label:"Dashboard",          icon:"▦"},
      {id:"deliveries",    label:"Today Deliveries",   icon:"◎"},
      {id:"subscriptions", label:"Subscriptions",      icon:"⊞"},
      {id:"skip",          label:"Skip Requests",      icon:"⊘",  badge:pendSkips},
      {id:"carriers",      label:"Carrier Deposits",   icon:"⬡",  badge:pendCarriers},
    ]},
    {section:"Meal Plans", items:[
      {id:"plans", label:"Slots & Plans", icon:"◈"},
    ]},
    {section:"Promotion", items:[
      {id:"coupons", label:"Coupons & Offers", icon:"⊛"},
      {id:"content", label:"Content Mgmt",     icon:"▤"},
    ]},
    {section:"Ecommerce", items:[
      {id:"orders",    label:"Orders",    icon:"⊕"},
      {id:"inventory", label:"Inventory", icon:"▦"},
    ]},
    {section:"People", items:[
      {id:"customers", label:"Customers", icon:"◉"},
      {id:"staffs",    label:"Staffs",    icon:"◎"},
    ]},
    {section:"CRM", items:[
      {id:"support", label:"Support Chat", icon:"◯"},
    ]},
    {section:"Analytics", items:[
      {id:"reports",   label:"Reports & Analytics", icon:"▣"},
      {id:"allocator", label:"Delivery Allocator",  icon:"◎"},
    ]},
  ];
  const sb=h("div",{class:"sidebar"},
    h("div",{class:"sb-logo"},h("div",{class:"sb-logo-name"},"அம்மாச்சி கடை"),h("div",{class:"sb-logo-sub"},"Admin Panel"))
  );
  nav.forEach(sec=>{
    const s=h("div",{},h("div",{class:"sb-section-label"},sec.section));
    s.className="sb-section";
    sec.items.forEach(item=>{
      const ni=h("div",{class:"nav-item"+(S.page===item.id?" active":""),onclick:()=>navigate(item.id)},
        h("span",{class:"nav-icon"},item.icon),
        h("span",{},item.label)
      );
      if(item.badge>0) ni.appendChild(h("span",{class:"nav-badge"},String(item.badge)));
      s.appendChild(ni);
    });
    sb.appendChild(s);
  });
  sb.appendChild(h("div",{class:"sb-footer"},h("div",{class:"sb-user-name"},"Admin"),h("div",{class:"sb-user-role"},"ammachikadai.in")));
  return sb;
}

function navigate(page){S.page=page;S.modal=null;render();}

// ─────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────
const PAGE_TITLES={
  dashboard:"Dashboard",deliveries:"Today Deliveries",subscriptions:"Subscriptions",
  skip:"Skip Requests",carriers:"Carrier Deposits",plans:"Slots & Meal Plans",
  coupons:"Coupons & Offers",content:"Content Management",
  orders:"Orders",inventory:"Inventory",customers:"Customers",
  staffs:"Staffs",support:"Support Chat",
  reports:"Reports & Analytics",allocator:"Delivery Allocator",
};
const ADD_LABELS={plans:"Add Plan",coupons:"Generate Coupon",content:"Add Content",customers:"Add Customer",staffs:"Add Staff",inventory:"Add Product",skip:"Log Skip Request"};

function buildTopbar(){
  const addLabel=ADD_LABELS[S.page];
  return h("div",{class:"topbar"},
    h("div",{class:"flex-row"},
      h("span",{class:"topbar-title"},PAGE_TITLES[S.page]||""),
      h("span",{class:"topbar-date"},"Wed, 27 May 2026")
    ),
    h("div",{class:"topbar-right"},
      addLabel?btn("+ "+addLabel,"btn-maroon",openAddModal):h("span",{}),
      btn("🔔","btn-ghost",()=>toast("No new notifications","info"))
    )
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE ROUTER
// ─────────────────────────────────────────────────────────────
function buildPage(){
  switch(S.page){
    case "dashboard":     return pgDashboard();
    case "deliveries":    return pgDeliveries();
    case "subscriptions": return pgSubscriptions();
    case "skip":          return pgSkips();
    case "carriers":      return pgCarriers();
    case "plans":         return pgPlans();
    case "coupons":       return pgCoupons();
    case "content":       return pgContent();
    case "orders":        return pgOrders();
    case "inventory":     return pgInventory();
    case "customers":     return pgCustomers();
    case "staffs":        return pgStaffs();
    case "support":       return pgSupport();
    case "reports":       return pgReports();
    case "allocator":     return pgAllocator();
    default:              return pgDashboard();
  }
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function pgDashboard(){
  const totalDel   = S.deliveries.length;
  const doneDel    = S.deliveries.filter(d=>d.status==="Delivered").length;
  const pendSkips  = S.skips.filter(s=>s.status==="Pending").length;
  const activeSubs = S.subscriptions.filter(s=>s.status==="Active").length;
  const totalPlanSubs = S.plans.reduce((a,p)=>a+p.subscribers,0);
  const topPlan    = [...S.plans].sort((a,b)=>b.subscribers-a.subscribers)[0];
  const lowStock   = S.inventory.filter(i=>i.status==="Low Stock").length;
  const todayRev   = 4820;

  const wrap=h("div",{});

  // KPI row 1 — 5 cols
  const kpiRow=h("div",{class:"stat-grid",style:"grid-template-columns:repeat(5,1fr)"});
  [
    {label:"Today Revenue",   value:`₹${todayRev.toLocaleString()}`, sub:"vs ₹4,310 yesterday",    ac:""},
    {label:"Plan Subscribers",value:String(totalPlanSubs),           sub:`${activeSubs} active subs`,ac:"ac-black"},
    {label:"Today Deliveries",value:String(totalDel),                sub:`${doneDel} done · ${totalDel-doneDel} pending`,ac:"ac-green"},
    {label:"Pending Skips",   value:String(pendSkips),               sub:"Needs review",            ac:"ac-amber"},
    {label:"Low Stock Items", value:String(lowStock),                sub:"Needs restocking",         ac:"ac-none"},
  ].forEach(s=>{
    kpiRow.appendChild(h("div",{class:"stat-card "+s.ac},
      h("div",{class:"stat-label"},s.label),
      h("div",{class:"stat-value"},s.value),
      h("div",{class:"stat-sub"},s.sub)
    ));
  });
  wrap.appendChild(kpiRow);

  // KPI row 2 — plan breakdown
  const planRow=h("div",{class:"stat-grid",style:"grid-template-columns:repeat(4,1fr);margin-bottom:20px"});
  SLOTS.forEach(slot=>{
    const slotPlans=S.plans.filter(p=>p.slot===slot.id&&p.active);
    const subs=slotPlans.reduce((a,p)=>a+p.subscribers,0);
    const topP=slotPlans.sort((a,b)=>b.subscribers-a.subscribers)[0];
    planRow.appendChild(h("div",{class:"stat-card ac-none",style:"cursor:pointer",onclick:()=>navigate("plans")},
      h("div",{class:"stat-label"},slot.icon+" "+slot.label),
      h("div",{class:"stat-value"},String(subs)),
      h("div",{class:"stat-sub"},topP?`Top: ${topP.tier} (${topP.subscribers})`:"No plans")
    ));
  });
  wrap.appendChild(planRow);

  // Lower grid
  const lower=h("div",{class:"dash-lower"});

  // Plans to cook today
  const cookCard=h("div",{class:"tcard"});
  cookCard.appendChild(h("div",{class:"tcard-header"},
    h("span",{class:"tcard-title"},"Plans to Cook Today"),
    btn("Manage Plans","btn-ghost btn-sm",()=>navigate("plans"))
  ));
  const cookBody=h("div",{style:"padding:14px 18px"});
  SLOTS.forEach(slot=>{
    const slotPlans=S.plans.filter(p=>p.slot===slot.id&&p.active);
    slotPlans.forEach(p=>{
      const maxSubs=Math.max(...S.plans.map(x=>x.subscribers),1);
      const pct=Math.round((p.subscribers/maxSubs)*100);
      const row=h("div",{class:"cook-row"},
        h("span",{class:"cook-slot-label"},slot.label),
        h("div",{style:"flex:1"},
          h("div",{style:"display:flex;justify-content:space-between;align-items:center;margin-bottom:3px"},
            h("span",{style:"font-size:12px;font-weight:500;color:var(--ink)"},p.tier+" — "+p.types.join("/")),
            h("span",{style:"font-family:var(--font-m);font-size:12px;color:var(--maroon)"},p.subscribers+" srv")
          ),
          h("div",{class:"prog-wrap"},h("div",{class:"prog-fill",style:`width:${pct}%;background:var(--maroon)`}))
        )
      );
      cookBody.appendChild(row);
    });
  });
  cookCard.appendChild(cookBody);
  lower.appendChild(cookCard);

  // Right panel
  const right=h("div",{class:"flex-col gap-10"});

  // Most liked plan
  const likedCard=h("div",{class:"tcard",style:"margin-bottom:12px"});
  likedCard.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Most Popular Plan")));
  if(topPlan){
    likedCard.appendChild(h("div",{style:"padding:14px 18px"},
      h("div",{style:"font-family:var(--font-d);font-size:22px;font-weight:500;color:var(--maroon);margin-bottom:4px"},topPlan.tier+" "+SLOTS.find(s=>s.id===topPlan.slot)?.label),
      h("div",{style:"font-size:11px;color:var(--ink4);margin-bottom:10px"},topPlan.types.join(" / ")+" · "+topPlan.items.slice(0,40)+"…"),
      h("div",{style:"display:flex;justify-content:space-between;margin-bottom:6px"},
        h("span",{class:"stat-label"},"SUBSCRIBERS"),h("span",{style:"font-family:var(--font-m);font-size:16px;color:var(--ink)"},String(topPlan.subscribers))
      ),
      h("div",{style:"display:flex;justify-content:space-between"},
        h("span",{class:"stat-label"},"PRICE / DAY"),h("span",{style:"font-family:var(--font-m);font-size:16px;color:var(--maroon)"},"₹"+topPlan.price)
      )
    ));
  }
  right.appendChild(likedCard);

  // Quick actions
  const qaCard=h("div",{class:"tcard"});
  qaCard.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Quick Actions")));
  const qab=h("div",{style:"padding:14px 18px"});
  [
    {label:"Approve "+pendSkips+" Skip Requests",col:"#B45309",page:"skip"},
    {label:"Manage Meal Plans",                   col:"#5C0A14",page:"plans"},
    {label:"Restock "+lowStock+" Low Items",      col:"#1A5FA0",page:"inventory"},
  ].forEach(a=>{
    const b=h("button",{class:"qa-btn"},h("span",{class:"qa-dot",style:"background:"+a.col}),a.label);
    b.addEventListener("click",()=>navigate(a.page));
    qab.appendChild(b);
  });
  qaCard.appendChild(qab);
  right.appendChild(qaCard);

  lower.appendChild(right);
  wrap.appendChild(lower);
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// SLOTS & PLANS PAGE
// ─────────────────────────────────────────────────────────────
function pgPlans(){
  const f=S.planSlotFilter;
  const wrap=h("div",{});

  // Stats
  const totalSubs=S.plans.reduce((a,p)=>a+p.subscribers,0);
  const sg=h("div",{class:"stat-grid",style:"grid-template-columns:repeat(5,1fr)"});
  [{label:"Total Subscribers",value:totalSubs,ac:""},
   {label:"Active Plans",     value:S.plans.filter(p=>p.active).length,ac:"ac-black"},
   {label:"Breakfast Subs",   value:S.plans.filter(p=>p.slot==="breakfast").reduce((a,p)=>a+p.subscribers,0),ac:"ac-none"},
   {label:"Lunch Subs",       value:S.plans.filter(p=>p.slot==="lunch").reduce((a,p)=>a+p.subscribers,0),ac:"ac-none"},
   {label:"Dinner Subs",      value:S.plans.filter(p=>p.slot==="dinner").reduce((a,p)=>a+p.subscribers,0),ac:"ac-none"},
  ].forEach(s=>sg.appendChild(h("div",{class:"stat-card "+s.ac},h("div",{class:"stat-label"},s.label),h("div",{class:"stat-value"},String(s.value)))));
  wrap.appendChild(sg);

  // Slot filter
  const fb=h("div",{class:"filter-bar",style:"border-radius:var(--r-lg);border:1px solid var(--line);background:var(--white);margin-bottom:16px"});
  [["all","All Slots"],...SLOTS.map(s=>[s.id,s.icon+" "+s.label])].forEach(([id,label])=>{
    const b=h("button",{class:"fb"+(f===id?" active":"")},label);
    b.addEventListener("click",()=>{S.planSlotFilter=id;render();});
    fb.appendChild(b);
  });
  wrap.appendChild(fb);

  const slots=f==="all"?SLOTS:SLOTS.filter(s=>s.id===f);

  slots.forEach(slot=>{
    const slotPlans=S.plans.filter(p=>p.slot===slot.id);
    const section=h("div",{class:"plan-slot-section"});

    // Slot header
    const slotTotalSubs=slotPlans.reduce((a,p)=>a+p.subscribers,0);
    section.appendChild(h("div",{style:"display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid var(--line)"},
      h("div",{},
        h("div",{style:"font-family:var(--font-d);font-size:17px;font-weight:500;color:var(--ink)"},slot.icon+" "+slot.label),
        h("div",{style:"font-size:11px;color:var(--ink4);font-style:italic;margin-top:2px"},slot.time+" · "+slotTotalSubs+" subscribers")
      ),
      btn("+ Add Plan to "+slot.label,"btn-ghost btn-sm",()=>openAddPlanModal(slot.id))
    ));

    // Plan cards grid
    const grid=h("div",{class:"plan-grid"});
    slotPlans.forEach(plan=>{
      const card=h("div",{class:"plan-card"+(plan.featured?" is-featured":"")});
      if(plan.featured) card.appendChild(h("div",{style:"position:absolute;top:-1px;right:12px;background:var(--maroon);color:#fff;font-size:9px;letter-spacing:.6px;text-transform:uppercase;padding:2px 8px;border-radius:0 0 5px 5px"},"Most Liked"));

      card.appendChild(h("div",{style:"display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"},
        h("div",{style:"font-weight:500;font-size:13px;color:var(--ink)"},plan.tier),
        statusBadge(plan.active?"active":"expired")
      ));

      // Diet type tags
      const typeRow=h("div",{style:"display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap"});
      plan.types.forEach(t=>typeRow.appendChild(statusBadge(t)));
      card.appendChild(typeRow);

      // Price – FIX: build element separately, don't concatenate DOM node as string
      const priceDiv=h("div",{style:"font-family:var(--font-d);font-size:22px;font-weight:500;color:var(--maroon);margin-bottom:10px"});
      priceDiv.appendChild(document.createTextNode("₹"+plan.price));
      priceDiv.appendChild(h("span",{style:"font-size:12px;color:var(--ink4);font-family:var(--font-b)"}," /day"));
      card.appendChild(priceDiv);

      // Quick meta row
      [["Duration",plan.duration],["Subscribers",String(plan.subscribers)]].forEach(([k,v])=>{
        card.appendChild(h("div",{style:"display:flex;justify-content:space-between;font-size:11px;color:var(--ink3);padding:3px 0;border-bottom:1px solid #F5F2EF"},
          h("span",{},k),h("b",{style:"color:var(--ink2);font-weight:500"},v)
        ));
      });

      // Weekly Menu Tab View
      const menuKey="wm_"+plan.id;
      if(!S._weeklyTab) S._weeklyTab={};
      if(!S._weeklyTab[menuKey]) S._weeklyTab[menuKey]="Mon";
      const activeDay=S._weeklyTab[menuKey];
      const menuBox=h("div",{style:"margin-top:10px;background:#FBF8F6;border-radius:8px;padding:8px;border:1px solid #EDE8E2"});
      const menuLabel=h("div",{style:"font-size:9px;letter-spacing:.5px;text-transform:uppercase;color:var(--ink4);font-weight:600;margin-bottom:6px"},"📅 Weekly Menu");
      menuBox.appendChild(menuLabel);
      // Day tabs
      const dayTabs=h("div",{style:"display:flex;gap:3px;flex-wrap:wrap;margin-bottom:8px"});
      DAYS.forEach(day=>{
        const isActive=day===activeDay;
        const tb=h("button",{style:`font-size:9px;padding:2px 6px;border-radius:4px;border:1px solid ${isActive?"var(--maroon)":"#DDD"};background:${isActive?"var(--maroon)":"#fff"};color:${isActive?"#fff":"var(--ink3)"};cursor:pointer;font-weight:${isActive?"600":"400"}`},day);
        tb.addEventListener("click",e=>{e.stopPropagation();S._weeklyTab[menuKey]=day;render();});
        dayTabs.appendChild(tb);
      });
      menuBox.appendChild(dayTabs);
      // Menu text for selected day
      const wm=plan.weeklyMenu||{};
      menuBox.appendChild(buildWeeklyMenuView(wm, activeDay, plan.items));
      card.appendChild(menuBox);

      // Subscriber bar
      const maxS=Math.max(...S.plans.map(p=>p.subscribers),1);
      const pct=Math.round((plan.subscribers/maxS)*100);
      card.appendChild(h("div",{style:"margin-top:8px"},
        h("div",{class:"prog-wrap"},h("div",{class:"prog-fill",style:`width:${pct}%;background:${plan.active?"var(--maroon)":"#ccc"}`}))
      ));

      // Actions
      card.appendChild(h("div",{style:"display:flex;gap:6px;margin-top:12px"},
        btn("Edit","btn-ghost btn-sm",()=>openEditPlanModal(plan)),
        btn(plan.active?"Deactivate":"Activate", plan.active?"btn-danger btn-sm":"btn-success btn-sm", ()=>togglePlan(plan.id)),
        btn("Del","btn-danger btn-sm",()=>deletePlan(plan.id))
      ));
      grid.appendChild(card);
    });

    if(!slotPlans.length) grid.appendChild(h("div",{style:"grid-column:1/-1;text-align:center;padding:30px;color:var(--ink4)"},"No plans yet for this slot. Click '+ Add Plan' above."));
    section.appendChild(grid);
    wrap.appendChild(section);
  });

  return wrap;
}

function togglePlan(id){
  const idx=S.plans.findIndex(p=>p.id===id);
  if(idx>=0){S.plans[idx].active=!S.plans[idx].active;}
  toast(S.plans.find(p=>p.id===id)?.active?"Plan activated":"Plan deactivated","success");
  render();
}
function deletePlan(id){
  if(!confirm("Delete this plan?"))return;
  S.plans=S.plans.filter(p=>p.id!==id);
  toast("Plan deleted","danger");render();
}

// ─────────────────────────────────────────────────────────────
// DELIVERIES  (with bulk selection)
// ─────────────────────────────────────────────────────────────
function pgDeliveries(){
  const selD    = S.selectedDeliveries||[];
  const filters = ["All","Breakfast","Lunch","Snacks","Dinner","Route A","Route B","Route C"];
  const f       = S.deliveryFilter;
  const rows    = f==="All"?S.deliveries:S.deliveries.filter(d=>d.slot===f||d.route.startsWith(f));
  const pendRows= rows.filter(d=>d.status!=="Delivered"&&d.status!=="Skipped");
  const wrap    = h("div",{});

  // Bulk action bar
  if(selD.length>0){
    const bar=h("div",{class:"bulk-bar"});
    bar.appendChild(h("span",{},h("span",{class:"bulk-count"},String(selD.length))," selected"));
    bar.appendChild(h("button",{class:"bulk-btn bulk-success",onclick:()=>{
      selD.forEach(id=>{const idx=S.deliveries.findIndex(x=>x.id===id);if(idx>=0&&S.deliveries[idx].status!=="Skipped")S.deliveries[idx].status="Delivered";});
      S.selectedDeliveries=[];toast("Marked "+selD.length+" deliveries as Delivered","success");render();
    }},"✓ Mark All Delivered"));
    bar.appendChild(h("button",{class:"bulk-btn",onclick:()=>navigate("allocator")},"🗺 Reassign Carriers"));
    bar.appendChild(h("button",{class:"bulk-close",onclick:()=>{S.selectedDeliveries=[];render();}},"×"));
    wrap.appendChild(bar);
  }

  const card=h("div",{class:"tcard"});
  const fb=h("div",{class:"filter-bar"});
  filters.forEach(fl=>{
    const b=h("button",{class:"fb"+(f===fl?" active":"")},fl);
    b.addEventListener("click",()=>{S.deliveryFilter=fl;render();});
    fb.appendChild(b);
  });
  const cardHdr=h("div",{class:"tcard-header"},
    h("span",{class:"tcard-title"},"Today's Deliveries"),
    h("div",{class:"flex-row gap-6"},
      badge(rows.length+" total","b-blue"),
      pendRows.length>0?btn("Select All Pending","btn-ghost btn-sm",()=>{S.selectedDeliveries=pendRows.map(d=>d.id);render();}):h("span",{})
    )
  );
  card.appendChild(cardHdr);
  card.appendChild(fb);
  const tbody=h("tbody",{});
  rows.forEach((d,i)=>{
    const isSel = selD.includes(d.id);
    const isPend= d.status!=="Delivered"&&d.status!=="Skipped";
    const tr=h("tr",{class:`row-${i%2===0?"even":"odd"}${isSel?" row-delivered":""}`},
      h("td",{},isPend?h("input",{type:"checkbox",class:"row-checkbox",...(isSel?{checked:"checked"}:{}),...{onchange:(e)=>{
        if(e.target.checked)S.selectedDeliveries=[...new Set([...(S.selectedDeliveries||[]),d.id])];
        else S.selectedDeliveries=(S.selectedDeliveries||[]).filter(x=>x!==d.id);
        render();
      }}}):h("span",{})),
      h("td",{},h("div",{class:"flex-row gap-8"},h("div",{class:`avatar av${i%5}`},initials(d.customer)),h("span",{style:"font-weight:500"},d.customer))),
      h("td",{},d.slot),
      h("td",{style:"font-family:var(--font-m);font-size:11px"},d.time),
      h("td",{},badge(d.plan||"—","b-gray")),
      h("td",{style:"font-size:11px;color:var(--ink4)"},d.route),
      h("td",{},d.carrier?h("div",{class:"flex-row gap-6"},h("div",{class:`avatar av${i%5}`},initials(d.carrier)),h("span",{},d.carrier)):badge("Unassigned","b-red")),
      h("td",{},statusBadge(d.status)),
      h("td",{},h("div",{class:"flex-row gap-6"},
        btn("View","btn-ghost btn-sm",()=>openViewDelivery(d)),
        isPend?btn("✓ Delivered","btn-success btn-sm",()=>markDelivered(d)):h("span",{})
      ))
    );
    tbody.appendChild(tr);
  });
  card.appendChild(h("table",{},h("thead",{},h("tr",{},...["","Customer","Slot","Time","Plan","Route","Carrier","Status","Actions"].map(c=>h("th",{},c)))),tbody));
  wrap.appendChild(card);
  return wrap;
}

function markDelivered(d){
  const idx=S.deliveries.findIndex(x=>x.id===d.id);
  if(idx>=0)S.deliveries[idx].status="Delivered";
  toast(`${d.customer} marked Delivered ✓`,"success");render();
}
function openViewDelivery(d){S.modal={type:"viewDelivery",data:{...d}};render();}

// ─────────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────
function pgSubscriptions(){
  const tabs=["Active","Expiring Soon","Expired","Carrier Verification Pending"];
  const t=S.subTab;
  const rows=S.subscriptions.filter(s=>s.status===t);
  const wrap=h("div",{});
  const tabbar=h("div",{style:"display:flex;gap:6px;margin-bottom:16px"});
  tabs.forEach(tab=>{
    const b=h("button",{class:"btn "+(t===tab?"btn-dark":"btn-ghost")},tab);
    b.addEventListener("click",()=>{S.subTab=tab;render();});
    tabbar.appendChild(b);
  });
  wrap.appendChild(tabbar);
  if(!rows.length){wrap.appendChild(h("div",{style:"text-align:center;padding:50px;color:var(--ink4)"},"No subscriptions in this category."));return wrap;}
  const grid=h("div",{class:"sub-grid"});
  rows.forEach((s,i)=>{
    const card=h("div",{class:"tcard sub-card"});
    card.appendChild(h("div",{style:"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px"},
      h("div",{class:"flex-row gap-8"},h("div",{class:"av "+avCls(i)},initials(s.name)),h("div",{},h("div",{style:"font-weight:500"},s.name),h("div",{style:"font-size:11px;color:var(--ink4)"},s.plan))),
      statusBadge(s.status)
    ));
    const kv=h("div",{class:"sub-card-body"});
    [["Duration",s.duration],["Deposit",s.deposit],["Coupon Bal.",s.coupon]].forEach(([k,v])=>{
      kv.appendChild(h("div",{class:"sub-kv"},h("div",{class:"kv-k"},k),h("div",{class:"kv-v"},v)));
    });
    card.appendChild(kv);
    card.appendChild(h("div",{class:"flex-row gap-6"},btn("Manage","btn-dark btn-sm",()=>openManageSub(s)),btn("History","btn-ghost btn-sm",()=>toast("Viewing history for "+s.name,"info"))));
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  return wrap;
}
function openManageSub(s){S.modal={type:"manageSub",data:{...s}};render();}

// ─────────────────────────────────────────────────────────────
// SKIP REQUESTS  (with bulk selection)
// ─────────────────────────────────────────────────────────────
function pgSkips(){
  const sel     = S.selectedSkips||[];
  const pending = S.skips.filter(s=>s.status==="Pending");
  const approved= S.skips.filter(s=>s.status==="Approved");
  const coupons = S.skips.filter(s=>s.status==="Coupon Issued");
  const totalVal= S.skips.filter(s=>s.status==="Pending"||s.status==="Approved").reduce((a,s)=>a+s.amount,0);
  const wrap    = h("div",{});

  // ── Stats row ─────────────────────────────────────────
  const sg=h("div",{class:"stat-grid",style:"grid-template-columns:repeat(4,1fr);margin-bottom:16px"});
  [
    {label:"Pending Requests", value:pending.length,  ac:"ac-amber"},
    {label:"Approved / Refund",value:approved.length, ac:"ac-green"},
    {label:"Coupons Issued",   value:coupons.length,  ac:"ac-black"},
    {label:"Total Value",      value:"₹"+totalVal,    ac:""},
  ].forEach(s=>sg.appendChild(h("div",{class:"stat-card "+s.ac},h("div",{class:"stat-label"},s.label),h("div",{class:"stat-value"},String(s.value)))));
  wrap.appendChild(sg);

  // ── Bulk action bar ───────────────────────────────────
  if(sel.length>0){
    const bar=h("div",{class:"bulk-bar"});
    bar.appendChild(h("span",{},h("span",{class:"bulk-count"},String(sel.length))," selected"));
    bar.appendChild(h("button",{class:"bulk-btn bulk-success",onclick:()=>{
      sel.forEach(id=>{const idx=S.skips.findIndex(x=>x.id===id);if(idx>=0)S.skips[idx].status="Approved";});
      S.selectedSkips=[];toast("Approved "+sel.length+" skip requests","success");render();
    }},"✓ Approve All (Cash Refund)"));
    bar.appendChild(h("button",{class:"bulk-btn bulk-purple",onclick:()=>{
      sel.forEach(id=>{const idx=S.skips.findIndex(x=>x.id===id);if(idx>=0)S.skips[idx].status="Coupon Issued";});
      S.selectedSkips=[];toast("Coupons issued for "+sel.length+" requests","success");render();
    }},"🎟 Issue Coupons"));
    bar.appendChild(h("button",{class:"bulk-btn bulk-danger",onclick:()=>{
      sel.forEach(id=>{const idx=S.skips.findIndex(x=>x.id===id);if(idx>=0)S.skips[idx].status="Rejected";});
      S.selectedSkips=[];toast("Rejected "+sel.length+" skip requests","warn");render();
    }},"✗ Reject All"));
    bar.appendChild(h("button",{class:"bulk-close",onclick:()=>{S.selectedSkips=[];render();}},"×"));
    wrap.appendChild(bar);
  }

  // ── Policy info banner ────────────────────────────────
  const banner=h("div",{style:"background:#FBF8F6;border:1px solid #EDE8E2;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;gap:20px;flex-wrap:wrap;align-items:center"});
  banner.appendChild(h("div",{style:"font-size:11px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.4px"},"📋 Skip Policy:"));
  [
    {icon:"✅",label:"Approved",desc:"Cash/bank refund within 2 days"},
    {icon:"🎟",label:"Coupon",desc:"Credit coupon added to account"},
    {icon:"🔁",label:"Carry Forward",desc:"Meal moved to next available day"},
  ].forEach(p=>{
    banner.appendChild(h("div",{style:"display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink3)"},
      h("span",{},p.icon+" "),
      h("b",{},p.label+": "),
      h("span",{style:"color:var(--ink4)"},p.desc)
    ));
  });
  wrap.appendChild(banner);

  // ── Main card ─────────────────────────────────────────
  const card=h("div",{class:"tcard"});
  card.appendChild(h("div",{class:"tcard-header"},
    h("span",{class:"tcard-title"},"Skip Requests"),
    h("div",{class:"flex-row gap-8"},
      badge(pending.length+" Pending","b-amber"),
      pending.length>0?btn("Select All Pending","btn-ghost btn-sm",()=>{S.selectedSkips=pending.map(s=>s.id);render();}):h("span",{}),
      btn("📞 + Log Skip Request","btn-maroon btn-sm",()=>{S.modal={type:"addSkip",data:{}};render();})
    )
  ));

  // Filter tabs
  if(!S.skipFilter)S.skipFilter="All";
  const ftab=h("div",{style:"display:flex;gap:6px;margin-bottom:12px;padding:0 2px;flex-wrap:wrap"});
  ["All","Pending","Approved","Coupon Issued","Rejected"].forEach(f=>{
    const active=S.skipFilter===f;
    const tb=h("button",{style:`font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid ${active?"var(--maroon)":"#DDD"};background:${active?"var(--maroon)":"#fff"};color:${active?"#fff":"var(--ink3)"};cursor:pointer;font-weight:${active?"600":"400"}`},f);
    tb.addEventListener("click",()=>{S.skipFilter=f;render();});
    ftab.appendChild(tb);
  });
  card.appendChild(ftab);

  const filtered = S.skipFilter==="All" ? S.skips : S.skips.filter(s=>s.status===S.skipFilter);

  const tbody=h("tbody",{});
  filtered.forEach((s,i)=>{
    const isSel  = sel.includes(s.id);
    const isPend = s.status==="Pending";
    const sourceIcon = s.source==="call"?"📞":s.source==="app"?"📱":"📋";
    const tr=h("tr",{class:`row-${i%2===0?"even":"odd"}${isSel?" row-delivered":""}`},
      h("td",{},isPend?h("input",{type:"checkbox",class:"row-checkbox",...(isSel?{checked:"checked"}:{}),...{onchange:(e)=>{
        if(e.target.checked)S.selectedSkips=[...new Set([...(S.selectedSkips||[]),s.id])];
        else S.selectedSkips=(S.selectedSkips||[]).filter(x=>x!==s.id);
        render();
      }}}):h("span",{})),
      h("td",{},h("div",{class:"flex-row gap-8"},h("div",{class:`avatar av${i%5}`},initials(s.user)),h("div",{},h("div",{style:"font-weight:500;font-size:12px"},s.user),h("div",{style:"font-size:10px;color:var(--ink4)"},sourceIcon+" "+(s.source==="call"?"Admin logged · call":"Customer app"))))),
      h("td",{},h("div",{},h("div",{style:"font-size:12px"},s.slot),h("div",{style:"font-size:10px;color:var(--ink4)"},SLOTS.find(sl=>sl.label===s.slot||sl.id===s.slot?.toLowerCase())?.time||""))),
      h("td",{style:"font-size:11px;color:var(--ink4)"},s.date+(s.days&&s.days>1?" ("+s.days+"d)":"")),
      h("td",{style:"font-size:12px"},s.reason),
      h("td",{},h("div",{},h("div",{style:"font-weight:500;color:#7B2FBE;font-size:13px"},"₹"+s.amount),h("div",{style:"font-size:10px;color:var(--ink4)"},s.resolution||"Pending decision"))),
      h("td",{},statusBadge(s.status)),
      h("td",{},isPend?h("div",{class:"flex-row gap-6"},
        btn("✓ Refund","btn-success btn-sm",()=>{
          const idx=S.skips.findIndex(x=>x.id===s.id);
          if(idx>=0){S.skips[idx].status="Approved";S.skips[idx].resolution="Cash Refund";}
          toast("Skip approved · ₹"+s.amount+" cash refund","success");render();
        }),
        btn("🎟 Coupon","btn-ghost btn-sm",()=>{
          const idx=S.skips.findIndex(x=>x.id===s.id);
          if(idx>=0){S.skips[idx].status="Coupon Issued";S.skips[idx].resolution="Coupon ₹"+s.amount;}
          toast("Coupon ₹"+s.amount+" issued to "+s.user,"success");render();
        }),
        btn("🔁 Carry","btn-ghost btn-sm",()=>{
          const idx=S.skips.findIndex(x=>x.id===s.id);
          if(idx>=0){S.skips[idx].status="Approved";S.skips[idx].resolution="Carry Forward";}
          toast("Meal carry-forward logged","success");render();
        }),
        btn("✗","btn-danger btn-sm",()=>{S.modal={type:"skipReject",data:{...s}};render();})
      ):h("span",{style:"font-size:11px;color:var(--ink4)"},s.resolution||"Processed"))
    );
    tbody.appendChild(tr);
  });

  if(!filtered.length){
    const empty=h("tr",{});
    empty.appendChild(h("td",{colspan:"8",style:"text-align:center;padding:30px;color:var(--ink4);font-size:13px"},"No skip requests in this filter."));
    tbody.appendChild(empty);
  }

  card.appendChild(h("table",{},
    h("thead",{},h("tr",{},...["","Customer","Slot","Date","Reason","Amount","Status","Actions"].map(c=>h("th",{},c)))),
    tbody
  ));
  wrap.appendChild(card);
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// CARRIER DEPOSITS
// ─────────────────────────────────────────────────────────────
function pgCarriers(){
  const wrap=h("div",{class:"tcard"});
  wrap.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Carrier Deposit Tracker"),badge("₹"+S.carriers.reduce((a,c)=>a+c.deposit,0)+" Total","b-blue")));
  const tbody=h("tbody",{});
  S.carriers.forEach((c,i)=>{
    const tr=h("tr",{},
      h("td",{},h("div",{class:"flex-row gap-8"},h("div",{class:"av "+avCls(i)},initials(c.user)),c.user)),
      h("td",{style:"font-weight:500"},rupee(c.deposit)),
      h("td",{class:"text-center"},String(c.issued)),
      h("td",{class:"text-center",style:"color:#2E6010;font-weight:500"},String(c.returned)),
      h("td",{class:"text-center",style:"color:"+(c.pending>0?"var(--maroon)":"#2E6010")+";font-weight:500"},String(c.pending)),
      h("td",{style:"font-weight:500;color:var(--maroon)"},rupee(c.refund)),
      h("td",{},statusBadge(c.status)),
      h("td",{},h("div",{class:"flex-row gap-6"},
        btn("Verify","btn-success btn-sm",()=>{S.modal={type:"verifyReturn",data:{...c}};render();}),
        btn("Approve Refund","btn-ghost btn-sm",()=>{S.modal={type:"approveRefund",data:{...c}};render();}),
        c.pending>0?btn("Mark Missing","btn-danger btn-sm",()=>{const idx=S.carriers.findIndex(x=>x.id===c.id);if(idx>=0){S.carriers[idx].status="Missing";S.carriers[idx].refund=0;}toast(c.user+" marked as Missing","warn");render();}):h("span",{})
      ))
    );
    tbody.appendChild(tr);
  });
  wrap.appendChild(h("table",{},h("thead",{},h("tr",{},...["User","Deposit","Issued","Returned","Pending","Refund","Status","Actions"].map(c=>h("th",{},c)))),tbody));
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────────────────────
function pgCoupons(){
  const f=S.couponFilter;
  const filtered=f==="all"?S.coupons:f==="expired"?S.coupons.filter(c=>c.status==="expired"):S.coupons.filter(c=>c.type===f&&c.status!=="expired");
  const wrap=h("div",{});

  const sg=h("div",{class:"stat-grid"});
  [{label:"Total",value:S.coupons.length,ac:""},{label:"Active",value:S.coupons.filter(c=>c.status==="active").length,ac:"ac-green"},{label:"Redeemed",value:S.coupons.reduce((a,c)=>a+c.uses,0),ac:"ac-amber"},{label:"Expired",value:S.coupons.filter(c=>c.status==="expired").length,ac:"ac-none"}]
    .forEach(s=>sg.appendChild(h("div",{class:"stat-card "+s.ac},h("div",{class:"stat-label"},s.label),h("div",{class:"stat-value"},String(s.value)))));
  wrap.appendChild(sg);

  const card=h("div",{class:"tcard"});
  const fb=h("div",{class:"filter-bar"});
  [["all","All"],["percent","Percentage"],["flat","Flat Off"],["free","Free Delivery"],["expired","Expired"]].forEach(([id,label])=>{
    const b=h("button",{class:"fb"+(f===id?" active":"")},label);
    b.addEventListener("click",()=>{S.couponFilter=id;render();});
    fb.appendChild(b);
  });
  card.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Coupons"),badge(filtered.length+" shown","b-gray")));
  card.appendChild(fb);

  const grid=h("div",{class:"coupon-grid"});
  filtered.forEach(c=>{
    const pct=Math.min(Math.round((c.uses/c.maxUses)*100)||0,100);
    const cc=h("div",{class:"coupon-card"});
    cc.appendChild(h("div",{style:"position:absolute;top:10px;right:10px"},statusBadge(c.status)));
    cc.appendChild(h("div",{class:"coupon-off"},c.off));
    cc.appendChild(h("div",{class:"coupon-code"},c.code));
    cc.appendChild(h("div",{class:"coupon-det"},c.desc));
    cc.appendChild(h("div",{class:"coupon-det",style:"margin-top:3px"},"Min: "+c.min+" · Exp "+c.expiry));
    cc.appendChild(h("div",{style:"margin-top:8px"},
      h("div",{style:"display:flex;justify-content:space-between;font-size:10px;color:var(--ink4);margin-bottom:3px"},h("span","Usage"),h("span",c.uses+"/"+c.maxUses)),
      h("div",{class:"prog-wrap"},h("div",{class:"prog-fill",style:`width:${pct}%;background:var(--maroon)`}))
    ));
    cc.appendChild(h("div",{style:"display:flex;gap:6px;margin-top:10px"},
      btn("Edit","btn-ghost btn-sm",()=>{S.modal={type:"editCoupon",data:{...c}};render();}),
      btn("Del","btn-danger btn-sm",()=>{if(!confirm("Delete?"))return;S.coupons=S.coupons.filter(x=>x.id!==c.id);toast("Coupon deleted","danger");render();})
    ));
    grid.appendChild(cc);
  });
  if(!filtered.length) grid.appendChild(h("div",{style:"grid-column:1/-1;text-align:center;padding:30px;color:var(--ink4)"},"No coupons in this category."));
  card.appendChild(grid);
  wrap.appendChild(card);
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────────────────────
function pgContent(){
  const f=S.contentFilter;
  const filtered=f==="all"?S.content:S.content.filter(c=>c.type===f);
  const iconMap={banner:"🖼",blog:"📄",announcement:"📢"};
  const wrap=h("div",{});
  const sg=h("div",{class:"stat-grid stat-grid-3",style:"margin-bottom:16px"});
  [{label:"Total",value:S.content.length,ac:""},{label:"Published",value:S.content.filter(c=>c.status==="published").length,ac:"ac-green"},{label:"Drafts",value:S.content.filter(c=>c.status==="draft").length,ac:"ac-amber"}]
    .forEach(s=>sg.appendChild(h("div",{class:"stat-card "+s.ac},h("div",{class:"stat-label"},s.label),h("div",{class:"stat-value"},String(s.value)))));
  wrap.appendChild(sg);
  const card=h("div",{class:"tcard"});
  const fb=h("div",{class:"filter-bar"});
  [["all","All"],["banner","Banners"],["blog","Blog"],["announcement","Announcements"]].forEach(([id,label])=>{
    const b=h("button",{class:"fb"+(f===id?" active":"")},label);
    b.addEventListener("click",()=>{S.contentFilter=id;render();});
    fb.appendChild(b);
  });
  card.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Content Items")));
  card.appendChild(fb);
  const grid=h("div",{class:"content-grid"});
  filtered.forEach(c=>{
    const cc=h("div",{class:"content-card"});
    cc.appendChild(h("div",{class:"content-thumb"},iconMap[c.type]||"📝"));
    const body=h("div",{class:"content-body"});
    body.appendChild(h("h4",{},c.title));
    body.appendChild(h("p",{},c.type.charAt(0).toUpperCase()+c.type.slice(1)+" · "+c.date));
    const row=h("div",{class:"cb-row"});
    row.appendChild(statusBadge(c.status));
    row.appendChild(h("div",{class:"flex-row gap-6"},
      btn("Edit","btn-ghost btn-sm",()=>{S.modal={type:"editContent",data:{...c}};render();}),
      btn("Del","btn-danger btn-sm",()=>{if(!confirm("Delete?"))return;S.content=S.content.filter(x=>x.id!==c.id);toast("Deleted","danger");render();})
    ));
    body.appendChild(row);
    cc.appendChild(body);
    grid.appendChild(cc);
  });
  if(!filtered.length) grid.appendChild(h("div",{style:"grid-column:1/-1;text-align:center;padding:30px;color:var(--ink4)"},"No content found."));
  card.appendChild(grid);
  wrap.appendChild(card);
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────
function pgOrders(){
  const tabs=["All","Snacks","Masalas","Handcrafts"];
  const t=S.orderTab;
  const rows=t==="All"?S.orders:S.orders.filter(o=>o.category===t);
  const wrap=h("div",{class:"tcard"});
  wrap.appendChild(h("div",{class:"tcard-header"},
    h("div",{style:"display:flex;gap:6px"},...tabs.map(tb=>{const b=h("button",{class:"btn "+(t===tb?"btn-dark":"btn-ghost")+" btn-sm"},tb);b.addEventListener("click",()=>{S.orderTab=tb;render();});return b;})),
    badge(S.orders.length+" Orders","b-blue")
  ));
  const tbody=h("tbody",{});
  rows.forEach((o,i)=>{
    const tr=h("tr",{},
      h("td",{style:"font-family:var(--font-m);font-size:11px;color:var(--maroon);font-weight:500"},o.id),
      h("td",{},h("div",{class:"flex-row gap-8"},h("div",{class:"av "+avCls(i)},initials(o.customer)),o.customer)),
      h("td",{style:"max-width:150px;font-size:12px"},o.product),
      h("td",{},badge(o.category)),
      h("td",{style:"font-weight:500"},rupee(o.amount)),
      h("td",{},badge(o.payment,o.payment==="COD"?"b-amber":"b-blue")),
      h("td",{},statusBadge(o.status)),
      h("td",{},h("div",{class:"flex-row gap-6"},
        btn("View","btn-ghost btn-sm",()=>toast("Viewing "+o.id,"info")),
        btn("Update","btn-dark btn-sm",()=>{S.modal={type:"updateOrder",data:{...o}};render();})
      ))
    );
    tbody.appendChild(tr);
  });
  wrap.appendChild(h("table",{},h("thead",{},h("tr",{},...["Order ID","Customer","Product","Category","Amount","Payment","Status","Actions"].map(c=>h("th",{},c)))),tbody));
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────
function pgInventory(){
  const q=S.invSearch.toLowerCase();
  const filtered=q?S.inventory.filter(i=>i.product.toLowerCase().includes(q)||i.category.toLowerCase().includes(q)):S.inventory;
  const wrap=h("div",{});
  const sg=h("div",{class:"stat-grid stat-grid-3",style:"margin-bottom:16px"});
  [{label:"Low Stock",value:S.inventory.filter(i=>i.status==="Low Stock").length,ac:"ac-amber"},{label:"Out of Stock",value:S.inventory.filter(i=>i.status==="Out of Stock").length,ac:"ac-none"},{label:"Total Products",value:S.inventory.length,ac:""}]
    .forEach(s=>sg.appendChild(h("div",{class:"stat-card "+s.ac},h("div",{class:"stat-label"},s.label),h("div",{class:"stat-value"},String(s.value)))));
  wrap.appendChild(sg);
  const card=h("div",{class:"tcard"});
  const search=h("input",{class:"search-input",type:"text",placeholder:"Search…",value:S.invSearch});
  search.addEventListener("input",e=>{S.invSearch=e.target.value;render();});
  card.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Product Inventory"),search));
  const tbody=h("tbody",{});
  filtered.forEach((item,i)=>{
    const tr=h("tr",{},
      h("td",{style:"font-weight:500"},item.product),
      h("td",{},badge(item.category)),
      h("td",{style:"font-weight:500;color:"+(item.stock===0?"var(--maroon)":item.stock<10?"#A0620A":"#2E6010")},item.stock+" units"),
      h("td",{},statusBadge(item.status)),
      h("td",{},h("div",{class:"flex-row gap-6"},
        btn("Edit","btn-ghost btn-sm",()=>{S.modal={type:"editInv",data:{...item}};render();}),
        btn("Restock","btn-success btn-sm",()=>{S.modal={type:"restock",data:{...item}};render();})
      ))
    );
    tbody.appendChild(tr);
  });
  card.appendChild(h("table",{},h("thead",{},h("tr",{},...["Product","Category","Stock","Status","Actions"].map(c=>h("th",{},c)))),tbody));
  wrap.appendChild(card);
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────
function pgCustomers(){
  const f=S.custFilter;
  const filtered=f==="all"?S.customers:["active","inactive"].includes(f)?S.customers.filter(c=>c.status===f):S.customers.filter(c=>c.plan===f);
  const wrap=h("div",{});
  const sg=h("div",{class:"stat-grid",style:"margin-bottom:16px"});
  [{label:"Total",value:S.customers.length,ac:""},{label:"Active",value:S.customers.filter(c=>c.status==="active").length,ac:"ac-green"},{label:"Premium",value:S.customers.filter(c=>c.plan==="Premium").length,ac:"ac-black"},{label:"Inactive",value:S.customers.filter(c=>c.status==="inactive").length,ac:"ac-none"}]
    .forEach(s=>sg.appendChild(h("div",{class:"stat-card "+s.ac},h("div",{class:"stat-label"},s.label),h("div",{class:"stat-value"},String(s.value)))));
  wrap.appendChild(sg);
  const card=h("div",{class:"tcard"});
  const fb=h("div",{class:"filter-bar",style:"justify-content:space-between"});
  const fl=h("div",{style:"display:flex;gap:6px"});
  [["all","All"],["active","Active"],["inactive","Inactive"],["Premium","Premium"],["Basic","Basic"],["Standard","Standard"]].forEach(([id,label])=>{
    const b=h("button",{class:"fb"+(f===id?" active":"")},label);
    b.addEventListener("click",()=>{S.custFilter=id;render();});
    fl.appendChild(b);
  });
  const search=h("input",{class:"search-input",type:"text",placeholder:"Search…"});
  search.addEventListener("input",e=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll("#cust-tbody tr").forEach(tr=>{tr.style.display=tr.textContent.toLowerCase().includes(q)?"":"none";});
  });
  fb.appendChild(fl);fb.appendChild(search);
  card.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Customer Directory"),badge(filtered.length+" customers","b-gray")));
  card.appendChild(fb);
  const tbody=h("tbody",{id:"cust-tbody"});
  filtered.forEach((c,i)=>{
    const tr=h("tr",{},
      h("td",{},h("div",{class:"flex-row gap-8"},h("div",{class:"av "+avCls(i)},initials(c.name)),h("span",{style:"font-weight:500"},c.name))),
      h("td",{style:"font-size:11px;color:var(--ink4)"},c.phone),
      h("td",{},statusBadge(c.plan)),
      h("td",{class:"text-center"},String(c.orders)),
      h("td",{style:"font-weight:500"},c.spent),
      h("td",{},statusBadge(c.status)),
      h("td",{},h("div",{class:"flex-row gap-6"},
        btn("View","btn-ghost btn-sm",()=>{S.modal={type:"viewCustomer",data:{...c}};render();}),
        btn("Edit","btn-dark btn-sm",()=>{S.modal={type:"editCustomer",data:{...c}};render();})
      ))
    );
    tbody.appendChild(tr);
  });
  card.appendChild(h("table",{},h("thead",{},h("tr",{},...["Customer","Phone","Plan","Orders","Spent","Status","Actions"].map(c=>h("th",{},c)))),tbody));
  wrap.appendChild(card);
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// STAFFS
// ─────────────────────────────────────────────────────────────
function pgStaffs(){
  const f=S.staffFilter;
  const filtered=f==="all"?S.staffs:S.staffs.filter(s=>s.role===f);
  const wrap=h("div",{});
  const sg=h("div",{class:"stat-grid",style:"margin-bottom:16px"});
  [{label:"Total",value:S.staffs.length,ac:""},{label:"Active",value:S.staffs.filter(s=>s.status==="active").length,ac:"ac-green"},{label:"On Leave",value:S.staffs.filter(s=>s.status==="leave").length,ac:"ac-amber"},{label:"Carriers",value:S.staffs.filter(s=>s.role==="carrier").length,ac:"ac-blue"}]
    .forEach(s=>sg.appendChild(h("div",{class:"stat-card "+s.ac},h("div",{class:"stat-label"},s.label),h("div",{class:"stat-value"},String(s.value)))));
  wrap.appendChild(sg);
  const card=h("div",{class:"tcard"});
  const fb=h("div",{class:"filter-bar"});
  [["all","All"],["carrier","Carriers"],["kitchen","Kitchen"],["manager","Managers"]].forEach(([id,label])=>{
    const b=h("button",{class:"fb"+(f===id?" active":"")},label);
    b.addEventListener("click",()=>{S.staffFilter=id;render();});
    fb.appendChild(b);
  });
  card.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Staff Directory")));
  card.appendChild(fb);
  const tbody=h("tbody",{});
  filtered.forEach((s,i)=>{
    const tr=h("tr",{},
      h("td",{},h("div",{class:"flex-row gap-8"},h("div",{class:"av "+avCls(i)},initials(s.name)),h("span",{style:"font-weight:500"},s.name))),
      h("td",{},statusBadge(s.role)),
      h("td",{style:"font-size:11px;color:var(--ink4)"},s.phone),
      h("td",{style:"font-size:11px;color:var(--ink4)"},s.joined),
      h("td",{class:"text-center"},s.role==="carrier"?s.deliveries+" trips":"—"),
      h("td",{},statusBadge(s.status)),
      h("td",{},h("div",{class:"flex-row gap-6"},
        btn("Edit","btn-ghost btn-sm",()=>{S.modal={type:"editStaff",data:{...s}};render();}),
        btn("Remove","btn-danger btn-sm",()=>{if(!confirm("Remove?"))return;S.staffs=S.staffs.filter(x=>x.id!==s.id);toast("Staff removed","danger");render();})
      ))
    );
    tbody.appendChild(tr);
  });
  card.appendChild(h("table",{},h("thead",{},h("tr",{},...["Name","Role","Phone","Joined","Deliveries","Status","Actions"].map(c=>h("th",{},c)))),tbody));
  wrap.appendChild(card);
  return wrap;
}

// ─────────────────────────────────────────────────────────────
// SUPPORT CHAT
// ─────────────────────────────────────────────────────────────
function pgSupport(){
  const chat=S.chats.find(c=>c.id===S.activeChatId)||S.chats[0];
  const msgs=S.messages[chat.id]||[];
  const layout=h("div",{class:"chat-layout"});

  const list=h("div",{class:"chat-list"},h("div",{class:"chat-list-hdr"},"Conversations"));
  S.chats.forEach((c,i)=>{
    const row=h("div",{class:"chat-row"+(c.id===S.activeChatId?" active":""),onclick:()=>{S.activeChatId=c.id;render();}},
      h("div",{style:"display:flex;justify-content:space-between;align-items:center;margin-bottom:3px"},
        h("div",{class:"flex-row gap-8"},h("div",{class:"av "+avCls(i)},initials(c.name)),h("span",{style:"font-weight:500;font-size:12px"},c.name)),
        c.unread>0?h("span",{class:"unread-dot"},String(c.unread)):h("span",{})
      ),
      h("div",{style:"font-size:11px;color:var(--ink4);padding-left:36px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"},c.last),
      h("div",{style:"font-size:10px;color:#ccc;padding-left:36px;margin-top:2px"},c.time)
    );
    list.appendChild(row);
  });
  layout.appendChild(list);

  const center=h("div",{class:"chat-messages"});
  center.appendChild(h("div",{class:"chat-msg-hdr"},h("span",{style:"font-weight:500"},chat.name),statusBadge(chat.status)));
  const msgBody=h("div",{class:"chat-msg-body",id:"chat-msg-body"});
  msgs.forEach(m=>{
    msgBody.appendChild(h("div",{class:"chat-bubble bubble-"+m.from},h("div",{},m.text),h("div",{class:"msg-time"},m.time)));
  });
  center.appendChild(msgBody);
  const inp=h("input",{class:"chat-input",type:"text",placeholder:"Type a reply…",id:"chat-input"});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")sendMsg();});
  center.appendChild(h("div",{class:"chat-input-bar"},inp,btn("Send","btn-dark",sendMsg)));
  layout.appendChild(center);

  const info=h("div",{class:"chat-info"},h("div",{style:"font-family:var(--font-d);font-size:14px;margin-bottom:14px;color:var(--ink)"},"Customer Info"));
  [["Plan",chat.plan],["Deposit",chat.deposit],["Coupon Bal.",chat.coupon]].forEach(([k,v])=>{
    info.appendChild(h("div",{class:"chat-kv"},h("div",{class:"kk"},k),h("div",{class:"vv"},v)));
  });
  info.appendChild(h("div",{style:"border-top:1px solid var(--line);margin:12px 0"}));
  info.appendChild(h("div",{style:"display:flex;flex-direction:column;gap:6px"},
    btn("Mark Resolved","btn-dark",()=>{const ci=S.chats.findIndex(c=>c.id===chat.id);if(ci>=0)S.chats[ci].status="Resolved";toast("Marked Resolved ✓");render();}),
    btn("View Profile","btn-ghost",()=>toast("Opening profile…","info"))
  ));
  layout.appendChild(info);

  setTimeout(()=>{
    const b=document.getElementById("chat-msg-body");
    if(b)b.scrollTop=b.scrollHeight;
    document.getElementById("chat-input")?.focus();
  },50);
  return layout;
}

function sendMsg(){
  const inp=document.getElementById("chat-input");
  const text=inp?.value.trim();
  if(!text)return;
  const time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  if(!S.messages[S.activeChatId])S.messages[S.activeChatId]=[];
  S.messages[S.activeChatId].push({from:"admin",text,time});
  const ci=S.chats.findIndex(c=>c.id===S.activeChatId);
  if(ci>=0){S.chats[ci].last=text;S.chats[ci].unread=0;}
  render();
}

// ─────────────────────────────────────────────────────────────
// ADD MODAL DISPATCHER
// ─────────────────────────────────────────────────────────────
function openAddModal(){
  const p=S.page;
  if(p==="skip")     {S.modal={type:"addSkip",data:{}};render();}
  if(p==="plans")    {S.modal={type:"addPlan",data:{slot:S.planSlotFilter==="all"?"breakfast":S.planSlotFilter}};render();}
  if(p==="coupons")  {S.modal={type:"addCoupon",data:{}};render();}
  if(p==="content")  {S.modal={type:"addContent",data:{}};render();}
  if(p==="customers"){S.modal={type:"addCustomer",data:{}};render();}
  if(p==="staffs")   {S.modal={type:"addStaff",data:{}};render();}
  if(p==="inventory"){S.modal={type:"addProduct",data:{}};render();}
}

function openAddPlanModal(slotId){S.modal={type:"addPlan",data:{slot:slotId}};render();}
function openEditPlanModal(plan){S.modal={type:"editPlan",data:{...plan}};render();}

// ─────────────────────────────────────────────────────────────
// MODAL WRAP
// ─────────────────────────────────────────────────────────────
function buildModalWrap(){
  const ov=h("div",{class:"modal-overlay",onclick:e=>{if(e.target===ov)closeModal();}});
  const handlers={
    addPlan:mAddPlan, editPlan:mEditPlan,
    viewDelivery:mViewDelivery,
    manageSub:mManageSub,
    addSkip:mAddSkip, skipReject:mSkipReject,
    verifyReturn:mVerifyReturn, approveRefund:mApproveRefund,
    addCoupon:mAddCoupon, editCoupon:mEditCoupon,
    addContent:mAddContent, editContent:mEditContent,
    updateOrder:mUpdateOrder,
    editInv:mEditInv, restock:mRestock, addProduct:mAddProduct,
    viewCustomer:mViewCustomer, editCustomer:mEditCustomer,
    addCustomer:mAddCustomer,
    addStaff:mAddStaff, editStaff:mEditStaff,
  };
  const fn=handlers[S.modal.type];
  ov.appendChild(fn?fn(S.modal.data):h("div",{class:"modal"},h("div",{class:"modal-title"},"Unknown Modal")));
  return ov;
}
function closeModal(){S.modal=null;render();}

// ─────────────────────────────────────────────────────────────
// MODAL BUILDERS
// ─────────────────────────────────────────────────────────────
function mAddPlan(d){
  const slotObj=SLOTS.find(s=>s.id===(d.slot||"breakfast"))||SLOTS[0];
  const slotTimeHint={"breakfast":"7:00–11:00 AM","lunch":"12:00–2:00 PM","snacks":"4:00–6:00 PM","dinner":"7:00–9:00 PM"};
  const wrap=h("div",{class:"modal",style:"max-width:620px"});
  wrap.appendChild(h("div",{class:"modal-title"},"Add New Plan"));
  // Slot + Tier
  const g1=h("div",{class:"grid2"});
  const slotSel=h("select",{class:"form-select",id:"p-slot"},...SLOTS.map(s=>{const o=h("option",{value:s.id},s.icon+" "+s.label);if(s.id===d.slot)o.setAttribute("selected","selected");return o;}));
  g1.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Meal Slot"),slotSel));
  g1.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Tier"),h("select",{class:"form-select",id:"p-tier"},h("option",{},"Basic"),h("option",{},"Standard"),h("option",{},"Premium"))));
  wrap.appendChild(g1);
  // Time hint banner
  const timeBanner=h("div",{style:"background:#FBF8F6;border:1px solid #EDE8E2;border-radius:6px;padding:6px 10px;font-size:11px;color:var(--ink3);margin-bottom:12px"});
  const updateBanner=()=>{const s=document.getElementById("p-slot")?.value||d.slot;timeBanner.textContent="⏰ Delivery window: "+( slotTimeHint[s]||"");};
  slotSel.addEventListener("change",updateBanner);
  timeBanner.textContent="⏰ Delivery window: "+slotTimeHint[d.slot||"breakfast"];
  wrap.appendChild(timeBanner);
  // Diet + Price + Duration
  wrap.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Diet Types"),
    h("div",{style:"display:flex;gap:10px;margin-top:4px"},
      h("label",{style:"font-size:12px;display:flex;gap:5px;align-items:center"},h("input",{type:"checkbox",id:"p-veg",checked:"checked"}),"Veg"),
      h("label",{style:"font-size:12px;display:flex;gap:5px;align-items:center"},h("input",{type:"checkbox",id:"p-nonveg"}),"Non-Veg"),
      h("label",{style:"font-size:12px;display:flex;gap:5px;align-items:center"},h("input",{type:"checkbox",id:"p-jain"}),"Jain")
    )
  ));
  const g2=h("div",{class:"grid2"});
  g2.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Price per Day (₹)"),h("input",{class:"form-input",type:"number",id:"p-price",placeholder:"e.g. 89"})));
  g2.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Duration"),h("select",{class:"form-select",id:"p-dur"},h("option",{},"Daily"),h("option",{},"Weekly"),h("option",{},"Monthly"))));
  wrap.appendChild(g2);
  // Weekly menu
  wrap.appendChild(h("div",{style:"font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--ink4);margin-bottom:6px;margin-top:4px"},"📅 Day-wise Menu (within slot time window)"));
  DAYS.forEach(day=>{
    const row=h("div",{class:"form-group",style:"margin-bottom:8px"});
    row.appendChild(h("label",{class:"form-label",style:"font-size:11px;color:var(--ink3)"},day));
    row.appendChild(h("input",{class:"form-input",style:"font-size:12px",id:"p-menu-"+day,placeholder:day+" menu items, e.g. Idli (2) + Chutney + Filter Coffee"}));
    row.appendChild(h("input",{class:"form-input",style:"font-size:12px;margin-top:6px",id:"p-menu-img-"+day,placeholder:"Image URL for "+day+" (optional)"}));
    row.appendChild(h("input",{class:"form-input",type:"file",style:"font-size:12px;margin-top:6px",id:"p-menu-file-"+day,accept:"image/*"}));
    wrap.appendChild(row);
  });
  wrap.appendChild(h("div",{class:"modal-footer"},btn("Cancel","btn-ghost",closeModal),btn("Add Plan","btn-maroon",()=>{
    const types=[];
    if(document.getElementById("p-veg")?.checked)types.push("Veg");
    if(document.getElementById("p-nonveg")?.checked)types.push("Non-Veg");
    if(document.getElementById("p-jain")?.checked)types.push("Jain");
    if(!types.length){toast("Select at least one diet type","warn");return;}
    const price=fi("p-price",0);
    if(!price){toast("Enter a valid price","warn");return;}
    const weeklyMenu={};
    DAYS.forEach(day=>{
      const text=(document.getElementById("p-menu-"+day)?.value||"").trim();
      const img=(document.getElementById("p-menu-img-"+day)?.value||"").trim();
      if(text||img){weeklyMenu[day]={text,text,img};}
    });
    if(!Object.keys(weeklyMenu).length){toast("Enter menu text or image for at least one day","warn");return;}
    DAYS.forEach(day=>{if(!weeklyMenu[day])weeklyMenu[day]=weeklyMenu[DAYS.find(d=>weeklyMenu[d])]||{"text":"","img":""};});
    const firstMenu=Object.values(weeklyMenu).find(v=>menuTextValue(v))||Object.values(weeklyMenu)[0]||"";
    const items=menuTextValue(weeklyMenu["Mon"])||menuTextValue(firstMenu)||"";
    S.plans.push({id:Date.now(),slot:fsl("p-slot"),tier:fsl("p-tier"),types,price,duration:fsl("p-dur"),items,weeklyMenu,servings:1,maxServings:1,subscribers:0,featured:false,active:true});
    toast("Plan added! ✓","success");closeModal();
  })));
  return wrap;
}

function mEditPlan(p){
  const slotTimeHint={"breakfast":"7:00–11:00 AM","lunch":"12:00–2:00 PM","snacks":"4:00–6:00 PM","dinner":"7:00–9:00 PM"};
  const wrap=h("div",{class:"modal",style:"max-width:620px"});
  wrap.appendChild(h("div",{class:"modal-title"},"Edit Plan — "+p.tier+" ("+SLOTS.find(s=>s.id===p.slot)?.label+")"));
  // Time window banner
  wrap.appendChild(h("div",{style:"background:#FBF8F6;border:1px solid #EDE8E2;border-radius:6px;padding:6px 10px;font-size:11px;color:var(--ink3);margin-bottom:12px"},"⏰ Delivery window: "+(slotTimeHint[p.slot]||"")));
  const g1=h("div",{class:"grid2"});
  g1.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Tier"),h("select",{class:"form-select",id:"ep-tier"},...["Basic","Standard","Premium"].map(t=>{const o=h("option",{value:t},t);if(t===p.tier)o.setAttribute("selected","selected");return o;}))));
  g1.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Price per Day (₹)"),h("input",{class:"form-input",type:"number",id:"ep-price",value:String(p.price)})));
  wrap.appendChild(g1);
  wrap.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Diet Types"),
    h("div",{style:"display:flex;gap:10px;margin-top:4px"},
      h("label",{style:"font-size:12px;display:flex;gap:5px;align-items:center"},h("input",{type:"checkbox",id:"ep-veg",...(p.types.includes("Veg")?{checked:"checked"}:{})}),"Veg"),
      h("label",{style:"font-size:12px;display:flex;gap:5px;align-items:center"},h("input",{type:"checkbox",id:"ep-nonveg",...(p.types.includes("Non-Veg")?{checked:"checked"}:{})}),"Non-Veg"),
      h("label",{style:"font-size:12px;display:flex;gap:5px;align-items:center"},h("input",{type:"checkbox",id:"ep-jain",...(p.types.includes("Jain")?{checked:"checked"}:{})}),"Jain")
    )
  ));
  // Day-wise menu edit
  wrap.appendChild(h("div",{style:"font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--ink4);margin-bottom:6px;margin-top:4px"},"📅 Day-wise Menu"));
  const wm=p.weeklyMenu||{};
  DAYS.forEach(day=>{
    const row=h("div",{class:"form-group",style:"margin-bottom:8px"});
    row.appendChild(h("label",{class:"form-label",style:"font-size:11px;color:var(--ink3)"},day));
    row.appendChild(h("input",{class:"form-input",style:"font-size:12px",id:"ep-menu-"+day,value:menuTextValue(wm[day])||"",placeholder:day+" menu items"}));
    row.appendChild(h("input",{class:"form-input",style:"font-size:12px;margin-top:6px",id:"ep-menu-img-"+day,value:(wm[day]&&wm[day].img)||"",placeholder:"Image URL for "+day+" (optional)"}));
    row.appendChild(h("input",{class:"form-input",type:"file",style:"font-size:12px;margin-top:6px",id:"ep-menu-file-"+day,accept:"image/*"}));
    wrap.appendChild(row);
  });
  const g2=h("div",{class:"grid2"});
  g2.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Status"),h("select",{class:"form-select",id:"ep-active"},h("option",{value:"true",...(p.active?{selected:"selected"}:{})},"Active"),h("option",{value:"false",...(!p.active?{selected:"selected"}:{})},"Inactive"))));
  g2.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Mark as Most Popular"),h("select",{class:"form-select",id:"ep-featured"},h("option",{value:"false",...(!p.featured?{selected:"selected"}:{})},"No"),h("option",{value:"true",...(p.featured?{selected:"selected"}:{})},"Yes — show 'Most Liked' tag"))));
  wrap.appendChild(g2);
  wrap.appendChild(h("div",{class:"modal-footer"},btn("Cancel","btn-ghost",closeModal),btn("Save Changes","btn-maroon",()=>{
    const types=[];
    if(document.getElementById("ep-veg")?.checked)types.push("Veg");
    if(document.getElementById("ep-nonveg")?.checked)types.push("Non-Veg");
    if(document.getElementById("ep-jain")?.checked)types.push("Jain");
    if(!types.length){toast("Select at least one diet type","warn");return;}
    const weeklyMenu={};
    DAYS.forEach(day=>{
      const text=(document.getElementById("ep-menu-"+day)?.value||"").trim();
      const img=(document.getElementById("ep-menu-img-"+day)?.value||"").trim();
      if(text||img){weeklyMenu[day]={text,text,img};}
      else if(wm[day]){weeklyMenu[day]=wm[day];}
    });
    const idx=S.plans.findIndex(x=>x.id===p.id);
    if(idx>=0){
      S.plans[idx].tier=fsl("ep-tier");
      S.plans[idx].price=fi("ep-price",p.price);
      S.plans[idx].types=types;
      S.plans[idx].weeklyMenu=weeklyMenu;
      const firstMenu=Object.values(weeklyMenu).find(v=>menuTextValue(v))||Object.values(weeklyMenu)[0]||"";
      S.plans[idx].items=menuTextValue(weeklyMenu["Mon"])||menuTextValue(firstMenu)||p.items;
      S.plans[idx].active=fsl("ep-active")==="true";
      S.plans[idx].featured=fsl("ep-featured")==="true";
    }
    toast("Plan updated ✓","success");closeModal();
  })));
  return wrap;
}

function mViewDelivery(d){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Delivery — "+d.customer),
    ...[["Slot",d.slot],["Time",d.time],["Plan",d.plan],["Route",d.route],["Carrier",d.carrier],["Status",d.status]].map(([k,v])=>
      h("div",{style:"margin-bottom:10px;display:flex;justify-content:space-between"},h("span",{style:"font-size:11px;color:var(--ink4);text-transform:uppercase;letter-spacing:.4px"},k),k==="Status"?statusBadge(v):h("span",{style:"font-weight:500"},v))
    ),
    h("div",{class:"modal-footer"},btn("Close","btn-ghost",closeModal))
  );
}

function mManageSub(s){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Manage — "+s.name),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Status"),h("select",{class:"form-select",id:"ms-status"},...["Active","Expiring Soon","Expired","Carrier Verification Pending"].map(st=>{const o=h("option",{value:st},st);if(st===s.status)o.setAttribute("selected","selected");return o;}))),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Plan"),h("input",{class:"form-input",type:"text",id:"ms-plan",value:s.plan}))
    ),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Admin Note"),h("textarea",{class:"form-textarea",placeholder:"Note…"})),
    h("div",{class:"modal-footer"},btn("Cancel","btn-ghost",closeModal),btn("Save","btn-dark",()=>{
      const idx=S.subscriptions.findIndex(x=>x.id===s.id);
      if(idx>=0){S.subscriptions[idx].status=fsl("ms-status");S.subscriptions[idx].plan=fv("ms-plan");}
      toast("Subscription updated","success");closeModal();
    }))
  );
}

function mAddSkip(d){
  // Compute refund amount live based on slot + days
  const slotRates={"Breakfast":79,"Lunch":109,"Snacks":59,"Dinner":129};
  const wrap=h("div",{class:"modal",style:"max-width:560px"});

  // Header with call indicator
  const hdr=h("div",{class:"modal-title",style:"display:flex;align-items:center;gap:10px"});
  hdr.appendChild(h("span",{style:"background:#7B2FBE;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0"},"📞"));
  hdr.appendChild(h("span",{},"Log Skip Request — Admin Entry"));
  wrap.appendChild(hdr);

  wrap.appendChild(h("div",{style:"background:#FFF8E7;border:1px solid #F6E0A0;border-radius:7px;padding:9px 12px;font-size:11px;color:#92660A;margin-bottom:14px;display:flex;gap:8px;align-items:center"},
    h("span",{style:"font-size:16px"},"📋"),
    h("span",{},"Use this form when a customer calls to request a skip. The resolution (refund/coupon/carry-forward) can be set now or decided later.")
  ));

  // Customer name (autocomplete from existing)
  const custGrp=h("div",{class:"form-group"});
  custGrp.appendChild(h("label",{class:"form-label"},"Customer Name"));
  const custInput=h("input",{class:"form-input",id:"sk-customer",placeholder:"Type name or phone…",list:"sk-cust-list",autocomplete:"off"});
  const custDL=h("datalist",{id:"sk-cust-list"});
  S.customers.forEach(c=>custDL.appendChild(h("option",{value:c.name},c.phone)));
  custGrp.appendChild(custInput);
  custGrp.appendChild(custDL);
  wrap.appendChild(custGrp);

  // Slot + Date row
  const g1=h("div",{class:"grid2"});
  const slotSel=h("select",{class:"form-select",id:"sk-slot"},
    ...["Breakfast","Lunch","Snacks","Dinner"].map(s=>h("option",{value:s},s))
  );
  g1.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Meal Slot"),slotSel));
  // Date picker defaults to tomorrow
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const tStr=tomorrow.toISOString().split("T")[0];
  const dateInput=h("input",{class:"form-input",type:"date",id:"sk-date",value:tStr});
  g1.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"Skip Date"),dateInput));
  wrap.appendChild(g1);

  // Number of days + reason
  const g2=h("div",{class:"grid2"});
  const daysInput=h("input",{class:"form-input",type:"number",id:"sk-days",value:"1",min:"1",max:"30",placeholder:"1"});
  g2.appendChild(h("div",{class:"form-group"},h("label",{class:"form-label"},"No. of Days"),daysInput));
  g2.appendChild(h("div",{class:"form-group"},
    h("label",{class:"form-label"},"Reason"),
    h("select",{class:"form-select",id:"sk-reason"},
      ...["Travel","Unwell","Function at home","Outstation","Office trip","Festival","Personal","Other"].map(r=>h("option",{value:r},r))
    )
  ));
  wrap.appendChild(g2);

  // Notes
  wrap.appendChild(h("div",{class:"form-group"},
    h("label",{class:"form-label"},"Additional Notes (optional)"),
    h("input",{class:"form-input",id:"sk-notes",placeholder:"e.g. Will be back on 5 Jun"})
  ));

  // Resolution policy
  wrap.appendChild(h("div",{style:"font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--ink4);margin-bottom:8px;margin-top:4px"},"💰 Resolution Policy"));
  const resWrap=h("div",{style:"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px"});
  const policies=[
    {id:"refund",   label:"Cash Refund",    icon:"💵", desc:"Refund to account/cash"},
    {id:"coupon",   label:"Coupon Credit",  icon:"🎟", desc:"Add to coupon wallet"},
    {id:"carry",    label:"Carry Forward",  icon:"🔁", desc:"Move meal to next day"},
    {id:"pending",  label:"Decide Later",   icon:"⏳", desc:"Admin will review later"},
  ];
  // re-draw to 2x2 grid
  resWrap.style.gridTemplateColumns="1fr 1fr";
  let selPol="pending";
  const polCards=[];
  policies.forEach(p=>{
    const pc=h("div",{
      style:`cursor:pointer;border:2px solid ${p.id===selPol?"var(--maroon)":"#EDE8E2"};border-radius:8px;padding:10px 12px;background:${p.id===selPol?"#FBF0F0":"#fff"};transition:.15s`,
      "data-pol":p.id
    });
    pc.appendChild(h("div",{style:"font-size:18px;margin-bottom:3px"},p.icon));
    pc.appendChild(h("div",{style:"font-weight:600;font-size:12px;color:var(--ink)"},p.label));
    pc.appendChild(h("div",{style:"font-size:10px;color:var(--ink4);margin-top:2px"},p.desc));
    pc.addEventListener("click",()=>{
      selPol=p.id;
      polCards.forEach(c=>{
        const active=c.getAttribute("data-pol")===selPol;
        c.style.borderColor=active?"var(--maroon)":"#EDE8E2";
        c.style.background=active?"#FBF0F0":"#fff";
      });
    });
    polCards.push(pc);
    resWrap.appendChild(pc);
  });
  wrap.appendChild(resWrap);

  // Computed refund preview
  const preview=h("div",{style:"background:#F0FDF4;border:1px solid #BBF7D0;border-radius:7px;padding:9px 14px;font-size:12px;color:#166534;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center"});
  const updatePreview=()=>{
    const slot=document.getElementById("sk-slot")?.value||"Lunch";
    const days=parseInt(document.getElementById("sk-days")?.value||"1")||1;
    const rate=slotRates[slot]||89;
    const total=rate*days;
    preview.innerHTML="";
    preview.appendChild(h("span",{},"Estimated value: "));
    preview.appendChild(h("b",{},"₹"+rate+" × "+days+" day"+(days>1?"s":"")+" = ₹"+total));
    return total;
  };
  updatePreview();
  slotSel.addEventListener("change",updatePreview);
  daysInput.addEventListener("input",updatePreview);
  wrap.appendChild(preview);

  // Footer
  wrap.appendChild(h("div",{class:"modal-footer"},
    btn("Cancel","btn-ghost",closeModal),
    btn("Log Skip Request","btn-maroon",()=>{
      const customer=(document.getElementById("sk-customer")?.value||"").trim();
      if(!customer){toast("Enter customer name","warn");return;}
      const slot=document.getElementById("sk-slot")?.value||"Lunch";
      const dateRaw=document.getElementById("sk-date")?.value||tStr;
      const days=parseInt(document.getElementById("sk-days")?.value||"1")||1;
      const reason=document.getElementById("sk-reason")?.value||"Personal";
      const notes=(document.getElementById("sk-notes")?.value||"").trim();
      const rate=slotRates[slot]||89;
      const amount=rate*days;
      const resMap={refund:"Cash Refund",coupon:"Coupon Credit",carry:"Carry Forward",pending:""};
      const statusMap={refund:"Approved",coupon:"Coupon Issued",carry:"Approved",pending:"Pending"};
      // Format date nicely
      const [y,m,mo]=dateRaw.split("-");
      const months=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const dateLabel=parseInt(mo)+" "+months[parseInt(m)]+" "+y;
      S.skips.unshift({
        id:Date.now(),
        user:customer,
        slot,
        date:dateLabel+(days>1?" → +"+(days-1)+"d":""),
        days,
        reason:reason+(notes?" · "+notes:""),
        amount,
        resolution:resMap[selPol],
        status:statusMap[selPol],
        source:"call",
      });
      toast("Skip logged for "+customer+(selPol!=="pending"?" · "+resMap[selPol]:""),"success");
      closeModal();
    })
  ));
  return wrap;
}

function mSkipReject(s){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Reject Skip — "+s.user),
    h("p",{style:"font-size:12px;color:var(--ink4);margin-bottom:14px"},s.slot+" on "+s.date),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Rejection Reason"),h("textarea",{class:"form-textarea",id:"sr-reason",placeholder:"Enter reason…"})),
    h("div",{class:"modal-footer"},btn("Cancel","btn-ghost",closeModal),btn("Reject Skip","btn-danger",()=>{
      const reason=fv("sr-reason");
      if(!reason){toast("Enter a rejection reason","warn");return;}
      const idx=S.skips.findIndex(x=>x.id===s.id);
      if(idx>=0)S.skips[idx].status="Rejected";
      toast("Skip rejected for "+s.user,"warn");closeModal();
    }))
  );
}

function mVerifyReturn(c){
  const m=h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Verify Return — "+c.user),
    h("div",{style:"background:var(--surface);padding:12px;border-radius:var(--r);margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px"},
      ...[["Deposit","₹"+c.deposit],["Issued",c.issued],["Returned",c.returned],["Pending",c.pending]].map(([k,v])=>h("div",{},h("div",{class:"form-label"},k),h("div",{style:"font-weight:500"},String(v))))
    ),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Actual Returned Count"),h("input",{class:"form-input",type:"number",id:"vr-count",value:String(c.returned),min:"0",max:String(c.issued)})),
    h("div",{id:"vr-preview",style:"font-size:11px;color:var(--ink4);margin-top:4px"},""),
    h("div",{class:"modal-footer"},btn("Cancel","btn-ghost",closeModal),btn("Save","btn-success",()=>{
      const v=Math.min(Math.max(0,fi("vr-count",c.returned)),c.issued);
      const st=v===c.issued?"Full Refund":v===0?"Missing":"Partial";
      const ref=Math.round((v/c.issued)*c.deposit);
      const idx=S.carriers.findIndex(x=>x.id===c.id);
      if(idx>=0){S.carriers[idx].returned=v;S.carriers[idx].pending=c.issued-v;S.carriers[idx].refund=ref;S.carriers[idx].status=st;}
      toast("Verified · "+st,"success");closeModal();
    }))
  );
  setTimeout(()=>{
    const inp=document.getElementById("vr-count");
    const prev=document.getElementById("vr-preview");
    const up=()=>{const v=Math.min(Math.max(0,parseInt(inp?.value||c.returned)),c.issued);const st=v===c.issued?"Full Refund":v===0?"Missing":"Partial";const ref=Math.round((v/c.issued)*c.deposit);if(prev)prev.textContent="→ Status: "+st+" · Refund: ₹"+ref;};
    inp?.addEventListener("input",up);up();
  },50);
  return m;
}

function mApproveRefund(c){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Approve Refund — "+c.user),
    h("div",{style:"background:var(--surface);padding:14px;border-radius:var(--r);margin-bottom:16px;display:flex;justify-content:space-between"},
      h("span",{style:"font-size:12px;color:var(--ink4)"},"Refund Amount"),h("span",{style:"font-family:var(--font-m);font-size:18px;color:var(--maroon)"},"₹"+c.refund)
    ),
    h("p",{style:"font-size:12px;color:var(--ink4)"},"Confirm and mark deposit as settled?"),
    h("div",{class:"modal-footer"},btn("Cancel","btn-ghost",closeModal),btn("Approve Refund ✓","btn-dark",()=>{
      const idx=S.carriers.findIndex(x=>x.id===c.id);
      if(idx>=0){S.carriers[idx].status="Full Refund";S.carriers[idx].pending=0;}
      toast("Refund ₹"+c.refund+" approved for "+c.user,"success");closeModal();
    }))
  );
}

function mAddCoupon(){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Generate New Coupon"),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Coupon Code"),h("input",{class:"form-input",type:"text",id:"ac-code",placeholder:"e.g. AMMACHI20",style:"text-transform:uppercase"})),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Type"),h("select",{class:"form-select",id:"ac-type"},h("option",{value:"percent"},"Percentage"),h("option",{value:"flat"},"Flat Off"),h("option",{value:"free"},"Free Delivery")))
    ),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Discount Value"),h("input",{class:"form-input",type:"text",id:"ac-off",placeholder:"e.g. 20% or ₹50"})),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Min Order (₹)"),h("input",{class:"form-input",type:"number",id:"ac-min",placeholder:"0"}))
    ),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Max Uses"),h("input",{class:"form-input",type:"number",id:"ac-max",placeholder:"100"})),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Expiry Date"),h("input",{class:"form-input",type:"date",id:"ac-exp"}))
    ),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Description"),h("input",{class:"form-input",id:"ac-desc",placeholder:"Short description…"})),
    h("div",{class:"modal-footer"},btn("Cancel","btn-ghost",closeModal),btn("Generate","btn-maroon",()=>{
      const code=fv("ac-code").toUpperCase().trim();
      if(!code){toast("Enter a coupon code","warn");return;}
      S.coupons.push({id:Date.now(),code,type:fsl("ac-type"),off:fv("ac-off")||"—",desc:fv("ac-desc")||"Discount",min:"₹"+(fv("ac-min")||"0"),uses:0,maxUses:fi("ac-max",100),expiry:fv("ac-exp")||"31 Dec 2026",status:"active"});
      toast("Coupon "+code+" created! 🎟️","success");closeModal();
    }))
  );
}
function mEditCoupon(c){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Edit Coupon — "+c.code),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Description"),h("input",{class:"form-input",id:"ec-desc",value:c.desc})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Discount Value"),h("input",{class:"form-input",id:"ec-off",value:c.off})),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Min Order"),h("input",{class:"form-input",id:"ec-min",value:c.min}))
    ),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Max Uses"),h("input",{class:"form-input",type:"number",id:"ec-max",value:String(c.maxUses)})),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Expiry"),h("input",{class:"form-input",id:"ec-exp",value:c.expiry}))
    ),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Status"),
      h("select",{class:"form-select",id:"ec-status"},
        h("option",{value:"active",...(c.status==="active"?{selected:"selected"}:{})},"Active"),
        h("option",{value:"expired",...(c.status==="expired"?{selected:"selected"}:{})},"Expired")
      )
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Save Changes","btn-dark",()=>{
        const idx=S.coupons.findIndex(x=>x.id===c.id);
        if(idx>=0) Object.assign(S.coupons[idx],{desc:fv("ec-desc"),off:fv("ec-off"),min:fv("ec-min"),maxUses:fi("ec-max",c.maxUses),expiry:fv("ec-exp"),status:fsl("ec-status")});
        toast("Coupon updated","success"); closeModal();
      })
    )
  );
}

function mAddContent(){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Add New Content"),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Title"),h("input",{class:"form-input",id:"nct-title",placeholder:"Content title…"})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Type"),
        h("select",{class:"form-select",id:"nct-type"},
          h("option",{value:"banner"},"Banner"),
          h("option",{value:"blog"},"Blog Post"),
          h("option",{value:"announcement"},"Announcement")
        )
      ),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Status"),
        h("select",{class:"form-select",id:"nct-status"},
          h("option",{value:"draft"},"Draft"),
          h("option",{value:"published"},"Published")
        )
      )
    ),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Notes"),h("textarea",{class:"form-textarea",id:"nct-body",placeholder:"Notes or body text…"})),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Save Content","btn-dark",()=>{
        const title=fv("nct-title").trim();
        if(!title){toast("Enter a title","warn");return;}
        S.content.push({id:Date.now(),title,type:fsl("nct-type"),status:fsl("nct-status"),date:"27 May 2026"});
        toast("Content saved!","success"); closeModal();
      })
    )
  );
}

function mEditContent(c){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Edit — "+c.title),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Title"),h("input",{class:"form-input",id:"ect-title",value:c.title})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Type"),
        h("select",{class:"form-select",id:"ect-type"},
          h("option",{value:"banner",...(c.type==="banner"?{selected:"selected"}:{})},"Banner"),
          h("option",{value:"blog",...(c.type==="blog"?{selected:"selected"}:{})},"Blog"),
          h("option",{value:"announcement",...(c.type==="announcement"?{selected:"selected"}:{})},"Announcement")
        )
      ),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Status"),
        h("select",{class:"form-select",id:"ect-status"},
          h("option",{value:"draft",...(c.status==="draft"?{selected:"selected"}:{})},"Draft"),
          h("option",{value:"published",...(c.status==="published"?{selected:"selected"}:{})},"Published")
        )
      )
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Save Changes","btn-dark",()=>{
        const idx=S.content.findIndex(x=>x.id===c.id);
        if(idx>=0){S.content[idx].title=fv("ect-title");S.content[idx].type=fsl("ect-type");S.content[idx].status=fsl("ect-status");}
        toast("Content updated","success"); closeModal();
      })
    )
  );
}

function mUpdateOrder(o){
  const statuses=["Order Placed","Packed","Shipped","Delivered","Cancelled"];
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Update Status — "+o.id),
    h("p",{style:"font-size:12px;color:var(--ink4);margin-bottom:14px"},o.product+" · "+o.customer),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"New Status"),
      h("select",{class:"form-select",id:"uo-status"},...statuses.map(s=>{const op=h("option",{value:s},s);if(s===o.status)op.setAttribute("selected","selected");return op;}))
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Save","btn-dark",()=>{
        const idx=S.orders.findIndex(x=>x.id===o.id);
        if(idx>=0) S.orders[idx].status=fsl("uo-status");
        toast("Order "+o.id+" → "+fsl("uo-status"),"success"); closeModal();
      })
    )
  );
}

function mEditInv(item){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Edit Product — "+item.product),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Product Name"),h("input",{class:"form-input",id:"ei-name",value:item.product})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Category"),
        h("select",{class:"form-select",id:"ei-cat"},...["Snacks","Masalas","Handcrafts"].map(c=>{const o=h("option",{value:c},c);if(c===item.category)o.setAttribute("selected","selected");return o;}))
      ),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Stock Qty"),h("input",{class:"form-input",type:"number",id:"ei-stock",value:String(item.stock)}))
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Save Changes","btn-dark",()=>{
        const name=fv("ei-name").trim();
        if(!name){toast("Name required","warn");return;}
        const stock=fi("ei-stock",item.stock);
        const idx=S.inventory.findIndex(x=>x.id===item.id);
        if(idx>=0){S.inventory[idx].product=name;S.inventory[idx].category=fsl("ei-cat");S.inventory[idx].stock=stock;S.inventory[idx].status=stockSt(stock);}
        toast(name+" updated","success"); closeModal();
      })
    )
  );
}

function mRestock(item){
  const m=h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Restock — "+item.product),
    h("div",{style:"background:var(--surface);padding:12px;border-radius:var(--r);margin-bottom:14px"},
      h("div",{style:"display:flex;justify-content:space-between;margin-bottom:4px"},
        h("span",{style:"font-size:12px;color:var(--ink4)"},"Current Stock"),
        h("span",{style:"font-weight:500"},item.stock+" units")
      ),
      h("div",{style:"display:flex;justify-content:space-between"},
        h("span",{style:"font-size:12px;color:var(--ink4)"},"After Restock"),
        h("span",{style:"font-weight:500;color:var(--maroon)",id:"rs-preview"},item.stock+" units")
      )
    ),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Add Quantity"),h("input",{class:"form-input",type:"number",id:"rs-qty",placeholder:"e.g. 50",min:"1"})),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Restock ✓","btn-success",()=>{
        const add=fi("rs-qty",0);
        if(add<1){toast("Enter a valid quantity","warn");return;}
        const idx=S.inventory.findIndex(x=>x.id===item.id);
        if(idx>=0){S.inventory[idx].stock+=add;S.inventory[idx].status=stockSt(S.inventory[idx].stock);}
        toast(item.product+" restocked +"+add+" units ✓","success"); closeModal();
      })
    )
  );
  setTimeout(()=>{
    document.getElementById("rs-qty")?.addEventListener("input",e=>{
      const np=document.getElementById("rs-preview");
      if(np) np.textContent=(item.stock+(parseInt(e.target.value)||0))+" units";
    });
  },50);
  return m;
}

function mAddProduct(){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Add New Product"),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Product Name"),h("input",{class:"form-input",id:"ap-name",placeholder:"e.g. Thattai (200g)"})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Category"),
        h("select",{class:"form-select",id:"ap-cat"},h("option",{},"Snacks"),h("option",{},"Masalas"),h("option",{},"Handcrafts"))
      ),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Initial Stock"),h("input",{class:"form-input",type:"number",id:"ap-stock",placeholder:"0",min:"0"}))
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Add Product","btn-dark",()=>{
        const name=fv("ap-name").trim();
        if(!name){toast("Name required","warn");return;}
        const stock=fi("ap-stock",0);
        S.inventory.push({id:Date.now(),product:name,category:fsl("ap-cat"),stock,status:stockSt(stock)});
        toast('"'+name+'" added ✓',"success"); closeModal();
      })
    )
  );
}

function mViewCustomer(c){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Customer Profile"),
    h("div",{style:"display:flex;align-items:center;gap:12px;margin-bottom:18px"},
      h("div",{class:"av",style:"width:44px;height:44px;font-size:15px"},initials(c.name)),
      h("div",{},h("div",{style:"font-weight:500;font-size:15px"},c.name),h("div",{style:"font-size:12px;color:var(--ink4)"},c.phone))
    ),
    h("div",{style:"display:grid;grid-template-columns:1fr 1fr;gap:10px"},
      ...[["Plan",c.plan],["Status",c.status],["Orders",String(c.orders)],["Total Spent",c.spent]].map(([k,v])=>
        h("div",{style:"background:var(--surface);padding:10px;border-radius:var(--r)"},
          h("div",{class:"form-label"},k),
          ["Plan","Status"].includes(k)?statusBadge(v):h("div",{style:"font-weight:500"},v)
        )
      )
    ),
    h("div",{class:"modal-footer"},
      btn("Close","btn-ghost",closeModal),
      btn("Edit","btn-dark",()=>{S.modal={type:"editCustomer",data:{...c}};render();})
    )
  );
}

function mEditCustomer(c){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Edit — "+c.name),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Phone"),h("input",{class:"form-input",id:"ecust-phone",value:c.phone})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Plan"),
        h("select",{class:"form-select",id:"ecust-plan"},...["Basic","Standard","Premium"].map(p=>{const o=h("option",{value:p},p);if(p===c.plan)o.setAttribute("selected","selected");return o;}))
      ),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Status"),
        h("select",{class:"form-select",id:"ecust-status"},
          h("option",{value:"active",...(c.status==="active"?{selected:"selected"}:{})},"Active"),
          h("option",{value:"inactive",...(c.status==="inactive"?{selected:"selected"}:{})},"Inactive")
        )
      )
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Save","btn-dark",()=>{
        const idx=S.customers.findIndex(x=>x.id===c.id);
        if(idx>=0){S.customers[idx].phone=fv("ecust-phone");S.customers[idx].plan=fsl("ecust-plan");S.customers[idx].status=fsl("ecust-status");}
        toast(c.name+" updated","success"); closeModal();
      })
    )
  );
}

function mAddCustomer(){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Add New Customer"),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Full Name"),h("input",{class:"form-input",id:"ncust-name",placeholder:"Customer name…"})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Phone"),h("input",{class:"form-input",id:"ncust-phone",placeholder:"9XXXXXXXXX"})),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Plan"),
        h("select",{class:"form-select",id:"ncust-plan"},h("option",{},"Basic"),h("option",{},"Standard"),h("option",{},"Premium"))
      )
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Add Customer","btn-dark",()=>{
        const name=fv("ncust-name").trim();
        if(!name){toast("Enter a name","warn");return;}
        S.customers.push({id:Date.now(),name,phone:fv("ncust-phone"),plan:fsl("ncust-plan"),orders:0,spent:"₹0",status:"active"});
        toast(name+" added!","success"); closeModal();
      })
    )
  );
}

function mAddStaff(){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Add New Staff"),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Full Name"),h("input",{class:"form-input",id:"ns-name",placeholder:"Staff name…"})),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Phone"),h("input",{class:"form-input",id:"ns-phone",placeholder:"9XXXXXXXXX"})),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Role"),
        h("select",{class:"form-select",id:"ns-role"},
          h("option",{value:"carrier"},"Carrier"),
          h("option",{value:"kitchen"},"Kitchen"),
          h("option",{value:"manager"},"Manager")
        )
      )
    ),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Add Staff","btn-dark",()=>{
        const name=fv("ns-name").trim();
        if(!name){toast("Enter a name","warn");return;}
        S.staffs.push({id:Date.now(),name,role:fsl("ns-role"),phone:fv("ns-phone"),joined:"May 2026",deliveries:0,status:"active"});
        toast(name+" added to staff!","success"); closeModal();
      })
    )
  );
}

function mEditStaff(s){
  return h("div",{class:"modal"},
    h("div",{class:"modal-title"},"Edit Staff — "+s.name),
    h("div",{class:"grid2"},
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Role"),
        h("select",{class:"form-select",id:"es-role"},...["carrier","kitchen","manager"].map(r=>{
          const label=r.charAt(0).toUpperCase()+r.slice(1);
          const o=h("option",{value:r},label);
          if(r===s.role) o.setAttribute("selected","selected");
          return o;
        }))
      ),
      h("div",{class:"form-group"},h("label",{class:"form-label"},"Status"),
        h("select",{class:"form-select",id:"es-status"},
          h("option",{value:"active",...(s.status==="active"?{selected:"selected"}:{})},"Active"),
          h("option",{value:"leave",...(s.status==="leave"?{selected:"selected"}:{})},"On Leave")
        )
      )
    ),
    h("div",{class:"form-group"},h("label",{class:"form-label"},"Phone"),h("input",{class:"form-input",id:"es-phone",value:s.phone})),
    h("div",{class:"modal-footer"},
      btn("Cancel","btn-ghost",closeModal),
      btn("Save Changes","btn-dark",()=>{
        const idx=S.staffs.findIndex(x=>x.id===s.id);
        if(idx>=0){S.staffs[idx].role=fsl("es-role");S.staffs[idx].status=fsl("es-status");S.staffs[idx].phone=fv("es-phone");}
        toast(s.name+" updated","success"); closeModal();
      })
    )
  );
}

// ─────────────────────────────────────────────────────────────
// REPORTS & ANALYTICS PAGE
// ─────────────────────────────────────────────────────────────
function pgReports() {
  const t = S.reportTab;
  const revData   = t === "week" ? REVENUE_7D : REVENUE_30D;
  const revLabels = t === "week" ? DAY_LABELS  : Array.from({length:30},(_,i)=>String(i+1));
  const maxRev    = Math.max(...revData);
  const totalRev  = revData.reduce((a,v)=>a+v,0);
  const avgRev    = Math.round(totalRev / revData.length);

  const wrap = h("div",{});

  // ── KPI row ──────────────────────────────────────────────
  const sg = h("div",{style:"display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px"});
  [
    {label:"Revenue ("+( t==="week"?"7d":"30d")+")", value:"₹"+totalRev.toLocaleString(), ac:"",    sub:"avg ₹"+avgRev+"/day"},
    {label:"Total Plan Subscribers",                  value:"514",                          ac:"ak",  sub:"across all 4 slots"},
    {label:"Active Coupons",                          value:String(S.coupons.filter(c=>c.status==="active").length), ac:"an", sub:"in circulation"},
    {label:"Pending Skips",                           value:String(S.skips.filter(s=>s.status==="Pending").length),  ac:"an", sub:"awaiting approval"},
  ].forEach(s=>{
    sg.appendChild(h("div",{class:"stat-card "+s.ac},
      h("div",{class:"stat-label"},s.label),
      h("div",{class:"stat-value"},s.value),
      h("div",{class:"stat-sub"},s.sub)
    ));
  });
  wrap.appendChild(sg);

  // ── Period tabs ───────────────────────────────────────────
  const tabs = h("div",{class:"report-tabs"});
  [["week","7 Days"],["month","30 Days"]].forEach(([id,label])=>{
    const b = h("button",{class:"rtab"+(t===id?" active":"")},label);
    b.addEventListener("click",()=>{S.reportTab=id;render();});
    tabs.appendChild(b);
  });
  wrap.appendChild(tabs);

  // ── Revenue bar chart ─────────────────────────────────────
  const revCard = h("div",{class:"chart-card"});
  revCard.appendChild(h("div",{class:"chart-title"},
    h("span",{},"Revenue Trend — "+(t==="week"?"Last 7 Days":"Last 30 Days")),
    h("span",{style:"font-size:11px;color:var(--text-muted);font-weight:400"},"₹"+totalRev.toLocaleString()+" total")
  ));
  const barChart = h("div",{class:"bar-chart"});
  revData.forEach((v,i)=>{
    const pct = Math.round((v/maxRev)*100);
    const col = h("div",{class:"bar-col"});
    col.appendChild(h("div",{class:"bar-val"},v>=1000?(v/1000).toFixed(1)+"k":String(v)));
    col.appendChild(h("div",{class:"bar-fill",style:`height:${Math.max(pct,4)}%;background:${v===maxRev?"#5C0A14":"#7B2FBE"}`}));
    if(t==="week"||i%5===0) col.appendChild(h("div",{class:"bar-lbl"},revLabels[i]));
    else col.appendChild(h("div",{class:"bar-lbl"},""));
    barChart.appendChild(col);
  });
  revCard.appendChild(barChart);
  wrap.appendChild(revCard);

  // ── Row: Slot distribution + Plan tier dist ───────────────
  const row1 = h("div",{class:"reports-grid"});

  // Slot subscribers donut-style
  const slotCard = h("div",{class:"chart-card"});
  slotCard.appendChild(h("div",{class:"chart-title"},"Subscribers by Slot"));
  const slotColors = ["#5C0A14","#7B2FBE","#185FA5","#3B6D11"];
  const slotEntries = Object.entries(SLOT_SUBS);
  const slotTotal   = Object.values(SLOT_SUBS).reduce((a,v)=>a+v,0);
  const donutWrap   = h("div",{class:"donut-wrap"});
  // SVG donut
  const svgNS = "http://www.w3.org/2000/svg";
  const svg   = document.createElementNS(svgNS,"svg");
  svg.setAttribute("width","120");svg.setAttribute("height","120");svg.setAttribute("viewBox","0 0 36 36");
  let offset = 25;
  slotEntries.forEach(([slot,val],i)=>{
    const pct   = (val/slotTotal)*100;
    const dash  = (pct/100)*100;
    const circle= document.createElementNS(svgNS,"circle");
    circle.setAttribute("cx","18");circle.setAttribute("cy","18");circle.setAttribute("r","15.9155");
    circle.setAttribute("fill","none");circle.setAttribute("stroke",slotColors[i]);circle.setAttribute("stroke-width","4");
    circle.setAttribute("stroke-dasharray",`${dash} ${100-dash}`);
    circle.setAttribute("stroke-dashoffset",String(-offset+25));
    svg.appendChild(circle);
    offset += dash;
  });
  // centre text
  const ct = document.createElementNS(svgNS,"text");
  ct.setAttribute("x","18");ct.setAttribute("y","20");ct.setAttribute("text-anchor","middle");
  ct.setAttribute("font-size","5");ct.setAttribute("fill","#1A1A1A");ct.setAttribute("font-weight","bold");
  ct.textContent = String(slotTotal);
  svg.appendChild(ct);
  donutWrap.appendChild(svg);
  const legend = h("div",{class:"donut-legend"});
  slotEntries.forEach(([slot,val],i)=>{
    const lbl = SLOTS.find(s=>s.id===slot)?.label||slot;
    legend.appendChild(h("div",{class:"donut-item"},
      h("div",{class:"donut-dot",style:`background:${slotColors[i]}`}),
      h("span",{},lbl+" — "+val+" ("+Math.round((val/slotTotal)*100)+"%)")
    ));
  });
  donutWrap.appendChild(legend);
  slotCard.appendChild(donutWrap);
  row1.appendChild(slotCard);

  // Plan tier distribution
  const tierCard = h("div",{class:"chart-card"});
  tierCard.appendChild(h("div",{class:"chart-title"},"Plan Tier Distribution"));
  const tierTotal  = Object.values(PLAN_TIER_DIST).reduce((a,v)=>a+v,0);
  const tierColors = {"Basic":"#888","Standard":"#7B2FBE","Premium":"#5C0A14"};
  const tierBar    = h("div",{class:"bar-chart",style:"height:110px;gap:20px"});
  Object.entries(PLAN_TIER_DIST).forEach(([tier,val])=>{
    const pct = Math.round((val/tierTotal)*100);
    const col = h("div",{class:"bar-col"});
    col.appendChild(h("div",{class:"bar-val"},String(val)));
    col.appendChild(h("div",{class:"bar-fill",style:`height:${pct}%;background:${tierColors[tier]}`}));
    col.appendChild(h("div",{class:"bar-lbl"},tier+" ("+pct+"%)"));
    tierBar.appendChild(col);
  });
  tierCard.appendChild(tierBar);
  row1.appendChild(tierCard);
  wrap.appendChild(row1);

  // ── Row 2: Skip trend + Coupon usage ─────────────────────
  const row2 = h("div",{class:"reports-grid"});

  // Skip trend sparkline
  const skipCard = h("div",{class:"chart-card"});
  skipCard.appendChild(h("div",{class:"chart-title"},"Skip Requests — Last 7 Days"));
  const maxSkip = Math.max(...SKIP_TREND,1);
  const sparkWrap = h("div",{style:"display:flex;align-items:flex-end;gap:5px;height:60px;margin-bottom:8px"});
  SKIP_TREND.forEach((v,i)=>{
    const pct = Math.round((v/maxSkip)*100);
    const col = h("div",{style:"flex:1;display:flex;flex-direction:column;align-items:center;gap:3px"});
    col.appendChild(h("div",{style:`height:${Math.max(pct,5)}%;background:#7B2FBE;border-radius:2px 2px 0 0;width:100%;min-height:4px`}));
    col.appendChild(h("div",{style:"font-size:9px;color:var(--text-muted)"},DAY_LABELS[i]));
    sparkWrap.appendChild(col);
  });
  skipCard.appendChild(sparkWrap);
  skipCard.appendChild(h("div",{style:"display:flex;justify-content:space-between;font-size:12px"},
    h("span",{class:"color-muted"},"Total this week"),
    h("span",{style:"font-weight:600"},String(SKIP_TREND.reduce((a,v)=>a+v,0))+" skips")
  ));
  row2.appendChild(skipCard);

  // Coupon usage bars
  const cpCard = h("div",{class:"chart-card"});
  cpCard.appendChild(h("div",{class:"chart-title"},"Coupon Usage"));
  COUPON_USAGE.forEach(c=>{
    const pct = Math.round((c.uses/c.maxUses)*100);
    cpCard.appendChild(h("div",{style:"margin-bottom:10px"},
      h("div",{style:"display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"},
        h("span",{style:"font-family:var(--font-m);font-size:11px"},c.code),
        h("span",{class:"color-muted"},c.uses+"/"+c.maxUses+" uses")
      ),
      h("div",{class:"progress-wrap"},
        h("div",{class:"progress-fill",style:`width:${pct}%;background:${pct>=80?"#A32D2D":"#7B2FBE"}`})
      )
    ));
  });
  row2.appendChild(cpCard);
  wrap.appendChild(row2);

  // ── Carrier performance table ─────────────────────────────
  const perfCard = h("div",{class:"tcard"});
  perfCard.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Carrier Performance — Today")));
  const tbody = h("tbody",{});
  CARRIER_PERF.forEach((c,i)=>{
    const loadColor = c.pct>=95?"#3B6D11":c.pct>=85?"#7B2FBE":"#A32D2D";
    const tr = h("tr",{class:`row-${i%2===0?"even":"odd"}`},
      h("td",{},h("div",{class:"flex-row gap-8"},h("div",{class:`avatar av${i%5}`},initials(c.name)),h("span",{class:"fw-600"},c.name))),
      h("td",{class:"text-center"},String(c.assigned)),
      h("td",{class:"text-center fw-600 color-green"},String(c.done)),
      h("td",{class:"text-center fw-600",style:`color:${c.late>0?"#A32D2D":"#3B6D11"}`},String(c.late)),
      h("td",{style:"width:130px"},
        h("div",{style:"display:flex;align-items:center;gap:8px"},
          h("div",{class:"progress-wrap",style:"flex:1"},
            h("div",{class:"progress-fill",style:`width:${c.pct}%;background:${loadColor}`})
          ),
          h("span",{style:`font-size:11px;font-weight:600;color:${loadColor}`},c.pct+"%")
        )
      )
    );
    tbody.appendChild(tr);
  });
  perfCard.appendChild(h("table",{},
    h("thead",{},h("tr",{},...["Carrier","Assigned","Completed","Late","On-Time Rate"].map(c=>h("th",{},c)))),
    tbody
  ));
  wrap.appendChild(perfCard);

  // ── Top customers ─────────────────────────────────────────
  const custCard = h("div",{class:"tcard"});
  custCard.appendChild(h("div",{class:"tcard-header"},h("span",{class:"tcard-title"},"Top 5 Customers by Spend")));
  const ctbody = h("tbody",{});
  TOP_CUSTOMERS.forEach((c,i)=>{
    const tr = h("tr",{class:`row-${i%2===0?"even":"odd"}`},
      h("td",{},h("div",{class:"flex-row gap-8"},
        h("div",{class:`avatar av${i%5}`,style:"font-size:11px;font-weight:700"},String(i+1)),
        h("span",{class:"fw-600"},c.name)
      )),
      h("td",{},statusBadge(c.plan)),
      h("td",{class:"fw-600 color-purple"},c.spent),
      h("td",{class:"text-center"},String(c.orders)+" orders")
    );
    ctbody.appendChild(tr);
  });
  custCard.appendChild(h("table",{},
    h("thead",{},h("tr",{},...["Customer","Plan","Total Spent","Orders"].map(c=>h("th",{},c)))),
    ctbody
  ));
  wrap.appendChild(custCard);

  return wrap;
}

// ─────────────────────────────────────────────────────────────
// DELIVERY ALLOCATOR PAGE
// ─────────────────────────────────────────────────────────────
function pgAllocator() {
  const filters  = ["All","Breakfast","Lunch","Snacks","Dinner"];
  const f        = S.allocFilter||"All";
  const carriers = S.staffs.filter(s=>s.role==="carrier"&&s.status==="active");
  const deliveries = f==="All"
    ? S.deliveries
    : S.deliveries.filter(d=>d.slot===f);

  const wrap = h("div",{});

  // ── Stats ─────────────────────────────────────────────────
  const unassigned = S.deliveries.filter(d=>!d.carrier||d.carrier==="").length;
  const delivered  = S.deliveries.filter(d=>d.status==="Delivered").length;
  const sg = h("div",{style:"display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px"});
  [
    {label:"Total Deliveries", value:String(S.deliveries.length), ac:""},
    {label:"Delivered",        value:String(delivered),            ac:"ac-green"},
    {label:"In Progress",      value:String(S.deliveries.filter(d=>d.status==="Out for Delivery"||d.status==="Packed").length), ac:"ac-blue"},
    {label:"Unassigned",       value:String(unassigned),           ac:"ac-none"},
  ].forEach(s=>{
    sg.appendChild(h("div",{class:"stat-card "+s.ac},
      h("div",{class:"stat-label"},s.label),
      h("div",{class:"stat-value"},s.value)
    ));
  });
  wrap.appendChild(sg);

  // ── Layout: delivery table + carrier panel ────────────────
  const layout = h("div",{class:"alloc-layout"});

  // LEFT — delivery table with carrier dropdown
  const leftCard = h("div",{class:"alloc-pool"});
  leftCard.appendChild(h("div",{class:"alloc-pool-hdr"},
    h("span",{},"Assign Carriers to Deliveries"),
    h("div",{class:"flex-row gap-6"},
      // slot filter chips
      ...filters.map(fl=>{
        const b = h("button",{class:"filter-btn btn-sm"+(f===fl?" active":"")},fl);
        b.addEventListener("click",()=>{S.allocFilter=fl;render();});
        return b;
      })
    )
  ));

  deliveries.forEach((d,i)=>{
    const row = h("div",{class:"alloc-row"},
      h("div",{class:`avatar av${i%5}`,style:"flex-shrink:0"},initials(d.customer)),
      h("div",{style:"flex:1;min-width:0"},
        h("div",{style:"font-weight:600;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"},d.customer),
        h("div",{style:"font-size:11px;color:var(--text-muted)"},d.slot+" · "+d.time+" · "+d.route)
      ),
      statusBadge(d.status),
      h("select",{class:"alloc-select",onchange:(e)=>{
        const idx=S.deliveries.findIndex(x=>x.id===d.id);
        if(idx>=0) S.deliveries[idx].carrier=e.target.value;
        toast(d.customer+" assigned to "+e.target.value,"success");
        render();
      }},
        h("option",{value:""},"— Assign Carrier —"),
        ...carriers.map(c=>{
          const opt=h("option",{value:c.name},c.name+" ("+c.deliveries+" trips)");
          if(c.name===d.carrier) opt.setAttribute("selected","selected");
          return opt;
        })
      )
    );
    leftCard.appendChild(row);
  });
  layout.appendChild(leftCard);

  // RIGHT — carrier workload panel
  const rightPanel = h("div",{});
  rightPanel.appendChild(h("div",{style:"font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px"},"Carrier Workload"));

  carriers.forEach((c,i)=>{
    const assigned = S.deliveries.filter(d=>d.carrier===c.name).length;
    const done     = S.deliveries.filter(d=>d.carrier===c.name&&d.status==="Delivered").length;
    const maxLoad  = 6;
    const loadPct  = Math.min(Math.round((assigned/maxLoad)*100),100);
    const loadColor= loadPct>=90?"#A32D2D":loadPct>=70?"#854F0B":"#7B2FBE";

    const card = h("div",{class:"carrier-card"});
    card.appendChild(h("div",{class:"flex-row",style:"justify-content:space-between"},
      h("div",{class:"flex-row gap-8"},
        h("div",{class:`avatar av${i%5}`},initials(c.name)),
        h("div",{},
          h("div",{class:"carrier-card-name"},c.name),
          h("div",{class:"carrier-card-meta"},c.routes?.join(", ")||"No route assigned")
        )
      ),
      h("div",{style:"text-align:right"},
        h("div",{style:`font-size:16px;font-weight:700;color:${loadColor}`},assigned+"/"+maxLoad),
        h("div",{style:"font-size:10px;color:var(--text-muted)"},done+" done")
      )
    ));
    card.appendChild(h("div",{class:"carrier-load"},
      h("div",{class:"carrier-load-fill",style:`width:${loadPct}%;background:${loadColor}`})
    ));

    // Quick assign all in a route button
    const routes = [...new Set(S.deliveries.filter(d=>d.route===( c.routes?.[0]||"")).map(d=>d.route))];
    if(c.routes?.length>0){
      card.appendChild(h("div",{style:"margin-top:8px"},
        btn("Auto-assign "+c.routes[0],"btn-outline btn-sm",()=>{
          let count=0;
          S.deliveries.forEach((d,idx)=>{
            if(d.route===c.routes[0]&&d.status!=="Delivered"&&d.status!=="Skipped"){
              S.deliveries[idx].carrier=c.name; count++;
            }
          });
          toast("Assigned "+count+" deliveries on "+c.routes[0]+" to "+c.name,"success");
          render();
        })
      ));
    }
    rightPanel.appendChild(card);
  });

  // Bulk reassign
  rightPanel.appendChild(h("div",{class:"divider"}));
  rightPanel.appendChild(h("div",{style:"font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px"},"Bulk Reassign Route"));
  const bFrom=h("select",{class:"form-select",style:"margin-bottom:6px;font-size:12px"},h("option",{value:""},"From Route…"),h("option",{value:"Route A"},"Route A"),h("option",{value:"Route B"},"Route B"),h("option",{value:"Route C"},"Route C"));
  const bTo=h("select",{class:"form-select",style:"margin-bottom:8px;font-size:12px"},h("option",{value:""},"To Carrier…"),...carriers.map(c=>h("option",{value:c.name},c.name)));
  rightPanel.appendChild(bFrom);rightPanel.appendChild(bTo);
  rightPanel.appendChild(btn("Reassign All","btn-primary",()=>{
    const fromRoute=bFrom.value,toCarrier=bTo.value;
    if(!fromRoute||!toCarrier){toast("Select route and carrier","warn");return;}
    let count=0;
    S.deliveries.forEach((_,idx)=>{
      if(S.deliveries[idx].route===fromRoute){S.deliveries[idx].carrier=toCarrier;count++;}
    });
    toast("Reassigned "+count+" deliveries on "+fromRoute+" → "+toCarrier,"success");render();
  }));

  layout.appendChild(rightPanel);
  wrap.appendChild(layout);
  return wrap;
}

// ─────────────────────────────────────────────────────────────

// ── INIT ──────────────────────────────────────────────────
render();
