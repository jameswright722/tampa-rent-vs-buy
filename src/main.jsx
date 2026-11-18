import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, DollarSign, TrendingUp, KeyRound } from "lucide-react";
import "./style.css";

// ─── Lead email settings ────────────────────────────────────────────────
// Leads are emailed to this address through FormSubmit (formsubmit.co).
// The first submission sends an activation email to this address; click
// "Activate Form" in it once, and every later lead is delivered.
// After activating, FormSubmit gives you a random string you can paste
// here instead of the email address so it isn't visible in the page source.
const LEAD_EMAIL = "60295328267b9ccf9b21d23c92acead9";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${LEAD_EMAIL}`;

// Tracking parameters from the QR code / link, e.g.
// ?source=harbour-island-apts&utm_campaign=postcards-nov
const TRACKING_KEYS = [
  "source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];
const params = new URLSearchParams(window.location.search);
const tracking = Object.fromEntries(
  TRACKING_KEYS.map((k) => [k, params.get(k) || ""]),
);

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

// Number input for the "Your scenario" card. It must live outside App:
// a component defined inside App is recreated on every render, which
// rebuilds the <input> and drops the cursor after each keystroke.
// It keeps its own text so visitors can clear a box or type "6." freely.
function I({ l, v, p, s, set }) {
  const [text, setText] = useState(String(v));
  useEffect(() => {
    if (parseFloat(text) !== v) setText(String(v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <label>
      {l}
      <div className="input">
        {p && <span className="prefix">{p}</span>}
        <input
          type="number"
          step="any"
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseFloat(e.target.value);
            set(Number.isNaN(n) ? 0 : n);
          }}
        />
        <span>{s}</span>
      </div>
    </label>
  );
}

function App() {
  const [rent, setRent] = useState(3500),
    [price, setPrice] = useState(500000),
    [down, setDown] = useState(20),
    [rate, setRate] = useState(6.5),
    [years, setYears] = useState(5),
    [hoa, setHoa] = useState(300),
    [taxPct, setTax] = useState(1.25),
    [insPct, setIns] = useState(0.9),
    [flood, setFlood] = useState(0),
    [app, setApp] = useState(3);
  // "idle" | "sending" | "sent" | "error"
  const [status, setStatus] = useState("idle");
  const x = useMemo(() => {
    const d = (price * down) / 100,
      loan = price - d,
      r = rate / 1200,
      n = 360,
      pi = r ? (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1) : loan / n,
      tax = (price * taxPct) / 1200,
      ins = (price * insPct) / 1200,
      pmi = down < 20 ? (loan * 0.006) / 12 : 0,
      monthly = pi + tax + ins + flood + hoa + pmi,
      m = years * 12,
      b = r
        ? (loan * ((1 + r) ** n - (1 + r) ** m)) / ((1 + r) ** n - 1)
        : Math.max(loan - pi * m, 0),
      principal = loan - b,
      equity = d + principal + price * ((1 + app / 100) ** years - 1);
    return { pi, tax, ins, pmi, monthly, rentPaid: rent * m, equity };
  }, [rent, price, down, rate, years, hoa, taxPct, insPct, flood, app]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("_honey")) return; // spam bot filled the hidden field

    const first = f.get("firstName"),
      last = f.get("lastName");
    const payload = {
      _subject: `New Rent vs Buy lead: ${first} ${last}${
        tracking.source ? ` (${tracking.source})` : ""
      }`,
      _template: "table",
      _captcha: "false",

      // Contact details
      "First name": first,
      "Last name": last,
      email: f.get("email"),
      Phone: f.get("phone"),
      "Where they want to buy": f.get("area"),
      "When they might buy": f.get("timeline"),
      "What they're looking for": f.get("lookingFor"),

      // Calculator inputs
      "Current monthly rent": money(rent),
      "Target home price": money(price),
      "Down payment": `${down}%`,
      "Mortgage rate": `${rate}%`,
      "Property tax": `${taxPct}%/yr`,
      HOA: `${money(hoa)}/mo`,
      "Homeowners insurance": `${insPct}%/yr`,
      "Flood insurance": `${money(flood)}/mo`,
      "Annual appreciation": `${app}%`,
      "Compare over": `${years} years`,

      // Calculator results
      "Est. monthly ownership cost": `${money(x.monthly)}/mo`,
      [`Rent paid in ${years} years`]: money(x.rentPaid),
      [`Illustrative equity after ${years} years`]: money(x.equity),

      // Campaign tracking
      Source: tracking.source || "(none)",
      "UTM source": tracking.utm_source,
      "UTM medium": tracking.utm_medium,
      "UTM campaign": tracking.utm_campaign,
      "UTM content": tracking.utm_content,
      "UTM term": tracking.utm_term,
      "Page URL": window.location.href,
    };

    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && String(data.success) === "true") {
        setStatus("sent");
        form.reset();
      } else {
        console.error("Lead form error:", data);
        setStatus("error");
      }
    } catch (err) {
      console.error("Lead form error:", err);
      setStatus("error");
    }
  };

  return (
    <>
      <header>
        <Home />
        <b>TAMPA BAY RENT VS. BUY</b>
        <h1>What could your Tampa rent buy?</h1>
        <p>
          Turn your current monthly rent into a personalized homeownership
          scenario and see how equity could build over time.
        </p>
      </header>
      <main>
        <section className="card inputs">
          <h2>Your scenario</h2>
          <I l="Current monthly rent" p="$" v={rent} set={setRent} s="/mo" />
          <I l="Target home price" p="$" v={price} set={setPrice} />
          <I l="Down payment" v={down} set={setDown} s="%" />
          <I l="Mortgage rate" v={rate} set={setRate} s="%" />
          <I l="Property tax estimate" v={taxPct} set={setTax} s="%/yr" />
          <I l="HOA" p="$" v={hoa} set={setHoa} s="/mo" />
          <I l="Homeowners insurance" v={insPct} set={setIns} s="%/yr" />
          <I l="Flood insurance (opt.)" p="$" v={flood} set={setFlood} s="/mo" />
          <I l="Annual appreciation" v={app} set={setApp} s="%" />
          <I l="Compare over" v={years} set={setYears} s="years" />
          <small>
            Illustrative estimate only. Taxes, insurance, HOA, mortgage
            insurance, closing costs, maintenance, rent increases, tax benefits
            and financing terms vary.
          </small>
        </section>
        <section className="results">
          <div className="hero">
            <small>ESTIMATED MONTHLY OWNERSHIP COST</small>
            <h2>{money(x.monthly)}/mo</h2>
            <p>Compared with your current rent of {money(rent)}/mo.</p>
          </div>
          <div className="twocol">
            <div className="card">
              <DollarSign className="red" />
              <p>Rent paid in {years} years</p>
              <h2>{money(-x.rentPaid)}</h2>
            </div>
            <div className="card">
              <TrendingUp className="green" />
              <p>Illustrative equity after {years} years</p>
              <h2>{money(x.equity)}</h2>
            </div>
          </div>
          <div className="card">
            <h2>Where the ownership payment goes</h2>
            {[
              ["Principal + interest", x.pi],
              ["Estimated property taxes", x.tax],
              ["Homeowners insurance", x.ins],
              ["Flood insurance", flood],
              ["HOA", hoa],
              ["Estimated mortgage insurance", x.pmi],
            ].map(([a, b]) => (
              <div className="row" key={a}>
                <span>{a}</span>
                <b>{money(b)}</b>
              </div>
            ))}
          </div>
          <div className="card lead">
            <KeyRound />
            <h2>See what you could own for your current housing budget.</h2>
            {status === "sent" ? (
              <p role="status" style={{ fontWeight: 600 }}>
                Thank you! Your request was sent. I'll be in touch shortly with
                your personalized Tampa buying analysis.
              </p>
            ) : (
              <>
                <p>
                  Tell me a little about what you're looking for and I'll send
                  you a personalized Tampa buying analysis plus homes that fit
                  your target payment.
                </p>
                <form onSubmit={handleSubmit}>
                  <input
                    name="firstName"
                    placeholder="First name"
                    required
                    autoComplete="given-name"
                  />
                  <input
                    name="lastName"
                    placeholder="Last name"
                    required
                    autoComplete="family-name"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    autoComplete="email"
                  />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone"
                    autoComplete="tel"
                  />
                  <input name="area" placeholder="Where do you want to buy?" />
                  <select name="timeline" defaultValue="">
                    <option value="" disabled>
                      When might you buy?
                    </option>
                    <option>0-3 months</option>
                    <option>3-6 months</option>
                    <option>6-12 months</option>
                    <option>12+ months</option>
                    <option>Just exploring</option>
                  </select>
                  <textarea
                    name="lookingFor"
                    rows={3}
                    placeholder="What are you looking for? (e.g., single family home with 3 beds/2 baths and a pool)"
                  />
                  {/* Hidden spam trap: real visitors never see or fill this */}
                  <input
                    type="text"
                    name="_honey"
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ display: "none" }}
                  />
                  <button disabled={status === "sending"}>
                    {status === "sending"
                      ? "Sending…"
                      : "Send My Personalized Tampa Home Analysis"}
                  </button>
                </form>
                {status === "error" && (
                  <p role="alert" style={{ color: "#b40101", fontWeight: 600 }}>
                    Sorry, something went wrong sending your request. Please try
                    again in a moment.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <footer>
        Jennifer Lohmeier • Keller Williams Tampa Central • Tampa Bay, Florida
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
