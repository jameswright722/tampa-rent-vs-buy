import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, DollarSign, TrendingUp, KeyRound } from "lucide-react";
import "./style.css";
const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
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
  const I = ({ l, v, s, set }) => (
    <label>
      {l}
      <div className="input">
        <input
          type="number"
          step="any"
          value={v}
          onChange={(e) => set(+e.target.value)}
        />
        <span>{s}</span>
      </div>
    </label>
  );
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
          <I l="Current monthly rent" v={rent} set={setRent} s="/mo" />
          <I l="Target home price" v={price} set={setPrice} />
          <I l="Down payment" v={down} set={setDown} s="%" />
          <I l="Mortgage rate" v={rate} set={setRate} s="%" />
          <I l="Property tax estimate" v={taxPct} set={setTax} s="%/yr" />
          <I l="HOA" v={hoa} set={setHoa} s="/mo" />
          <I l="Homeowners insurance" v={insPct} set={setIns} s="%/yr" />
          <I l="Flood insurance (optional)" v={flood} set={setFlood} s="/mo" />
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
              <DollarSign className="green" />
              <p>Rent paid in {years} years</p>
              <h2>{money(x.rentPaid)}</h2>
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
              <div className="row">
                <span>{a}</span>
                <b>{money(b)}</b>
              </div>
            ))}
          </div>
          <div className="card lead">
            <KeyRound />
            <h2>See what you could own for your current housing budget.</h2>
            <p>
              Tell me a little about what you're looking for and I'll send you a
              personalized Tampa buying analysis plus homes that fit your target
              payment.
            </p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input placeholder="First name" />
              <input placeholder="Last name" />
              <input type="email" placeholder="Email" />
              <input type="tel" placeholder="Phone" />
              <input placeholder="Where do you want to buy?" />
              <select defaultValue="">
                <option value="" disabled>
                  When might you buy?
                </option>
                <option>0-3 months</option>
                <option>3-6 months</option>
                <option>6-12 months</option>
                <option>12+ months</option>
                <option>Just exploring</option>
              </select>
              <button>Send My Personalized Tampa Home Analysis</button>
            </form>
            <small>
              Prototype form: connect submission to your CRM/backend before
              production.
            </small>
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
