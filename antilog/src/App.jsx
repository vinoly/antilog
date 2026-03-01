import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sbPromise = Promise.resolve(createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
const sb = {
  auth: async () => (await sbPromise).auth,
};

// Convenience wrapper — all calls are no-ops if Supabase isn't available
const sb = {
  async client() { return sbPromise; },
  async from(table) {
    const c = await sbPromise;
    return c ? c.from(table) : null;
  },
  async auth() {
    const c = await sbPromise;
    return c ? c.auth : null;
  },
};


const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);





const serif = { fontFamily: "'Lora', Georgia, serif", fontWeight: 400 };
const serifMed = { fontFamily: "'Lora', Georgia, serif", fontWeight: 500 };
const sans = { fontFamily: "'Inter', sans-serif", fontWeight: 400 };
const sansMed = { fontFamily: "'Inter', sans-serif", fontWeight: 500 };

// ── Contrast-bumped text palette ──────────────────────────────────────────
// muted → was #b0a090 / #c0b4a8 / #a09080, now stepped up ~20% luminance
const C = {
  text:       "#2e2520",  // primary body
  textMid:    "#4a3f35",  // secondary body
  textSub:    "#6b5d52",  // was #8a7a6a — subtitles, source lines
  textMuted:  "#8a7870",  // was #b0a090 — labels, meta
  textFaint:  "#a09488",  // was #c0b4a8 / #d0c8be — credits, nav sub
  border:     "#e0dbd4",
  bg:         "#f7f5f2",
  card:       "#faf8f5",
  pro:        "#7a9e7e",
  con:        "#a06060",
};

const CATEGORIES = ["All", "Economics", "Technology", "Climate", "Health", "Politics", "Society", "Ethics"];
// ── Responsive hook ───────────────────────────────────────────────────────
function useIsMobile() {
  const ref = useRef(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setMobile(e.contentRect.width < 620);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { mobile, ref };
}


function repTier(score) {
  if (score >= 500) return { label: "Verified Thinker", color: "#a07c0a", bg: "#fef9e0", next: 700, desc: "Highly trusted, consistent contributor with well-sourced arguments." };
  if (score >= 200) return { label: "Contributor",      color: "#6a5a4a", bg: "#f0ebe3", next: 500, desc: "Active participant whose arguments regularly earn community support." };
  if (score >= 50)  return { label: "Participant",      color: "#6a8a6a", bg: "#edf2ed", next: 200, desc: "Engaged member building a track record in the community." };
  return               { label: "New Voice",            color: "#888",    bg: "#f0f0f0", next: 50,  desc: "Just getting started. Post sourced arguments to build reputation." };
}

const SESSION_USER = { name: "You", rep: 127, avatar: "Y" };

const USERS = {
  "Mara L.":   { avatar: "M", rep: 612, args: [{ text: "Automation is eliminating jobs faster than new ones are created.", topic: "UBI", side: "pro", votes: 142 }, { text: "Copyright exists to incentivize human creativity.", topic: "AI Art", side: "con", votes: 112 }] },
  "Dev P.":    { avatar: "D", rep: 310, args: [{ text: "Finland's UBI pilot showed recipients were more likely to seek employment.", topic: "UBI", side: "pro", votes: 67 }] },
  "James R.":  { avatar: "J", rep: 88,  args: [{ text: "Current welfare systems punish people for earning more.", topic: "UBI", side: "pro", votes: 98 }] },
  "Sara K.":   { avatar: "S", rep: 445, args: [{ text: "The numbers don't add up. $3T annually.", topic: "UBI", side: "con", votes: 119 }] },
  "Tom W.":    { avatar: "T", rep: 201, args: [{ text: "Raising taxes could slow GDP growth.", topic: "UBI", side: "con", votes: 54 }] },
  "Lena F.":   { avatar: "L", rep: 174, args: [{ text: "More cash without more goods leads to inflation.", topic: "UBI", side: "con", votes: 76 }] },
  "Aisha B.":  { avatar: "A", rep: 720, args: [{ text: "Teens report record levels of anxiety tracking social media adoption.", topic: "Social Media", side: "pro", votes: 210 }] },
  "Chris N.":  { avatar: "C", rep: 99,  args: [{ text: "Algorithmic feeds are optimized for outrage, not truth.", topic: "Social Media", side: "pro", votes: 88 }] },
  "Priya M.":  { avatar: "P", rep: 536, args: [{ text: "Social media gave marginalized communities a global voice.", topic: "Social Media", side: "con", votes: 155 }] },
  "Omar S.":   { avatar: "O", rep: 43,  args: [{ text: "Correlation isn't causation.", topic: "Social Media", side: "con", votes: 61 }] },
  "Elena V.":  { avatar: "E", rep: 388, args: [{ text: "Nuclear is the only proven carbon-free baseload energy source.", topic: "Nuclear", side: "pro", votes: 178 }] },
  "Frank O.":  { avatar: "F", rep: 267, args: [{ text: "Solar and wind are already cheaper and deploy in months.", topic: "Nuclear", side: "con", votes: 134 }] },
  "Nadia R.":  { avatar: "N", rep: 512, args: [] },
  "Leo B.":    { avatar: "L", rep: 330, args: [] },
  "Yuki T.":   { avatar: "Y", rep: 189, args: [] },
  "Marcus H.": { avatar: "M", rep: 77,  args: [] },
  "Zara Q.":   { avatar: "Z", rep: 601, args: [] },
  "Rafi D.":   { avatar: "R", rep: 144, args: [] },
  "Bea C.":    { avatar: "B", rep: 290, args: [] },
  "Kai M.":    { avatar: "K", rep: 455, args: [] },
};

const seedTopics = [
  {
    id: 1, title: "Universal Basic Income should be implemented nationwide",
    summary: "A guaranteed monthly stipend paid to all citizens regardless of employment status.",
    category: "Economics", hot: true,
    rebuttals: [
      { id: 9001, argId: 101, rebuttalSide: "con", author: "Sara K.", votes: 44, text: "Retraining programs funded far more cheaply than UBI already exist and show better outcomes. The McKinsey figure conflates displacement with permanent job loss — most workers do eventually transition.", source: "OECD Employment Outlook, 2022" },
    ],
    args: {
      pro: [
        { id: 101, author: "Mara L.", votes: 142, text: "Automation is eliminating jobs faster than new ones are created. UBI gives workers breathing room to retrain without falling into poverty.", source: "McKinsey Global Institute, 2023", replies: [{ id: 1011, author: "Dev P.", votes: 67, text: "Finland's UBI pilot showed recipients were more likely to seek employment — it motivates rather than discourages.", source: "Finnish Ministry of Social Affairs, 2020" }] },
        { id: 102, author: "James R.", votes: 98, text: "Current welfare systems punish people for earning more. UBI removes that trap — every dollar you earn is yours to keep.", source: "Brookings Institution, 2022", replies: [] },
        { id: 105, author: "Nadia R.", votes: 87, text: "Every major country that has piloted cash transfers — Kenya, Stockton CA, Alaska — found improvements in health, education, and entrepreneurship. This isn't theory anymore.", source: "GiveDirectly Research, 2023", replies: [] },
      ],
      con: [
        { id: 103, author: "Sara K.", votes: 119, text: "The numbers don't add up. $1,000/month for every US adult costs $3 trillion annually — more than the entire federal discretionary budget.", source: "CRFB, 2021", replies: [{ id: 1031, author: "Tom W.", votes: 54, text: "Raising taxes to cover it could slow GDP growth and erode the very tax base needed to fund it.", source: "NBER, 2022" }] },
        { id: 104, author: "Lena F.", votes: 76, text: "More cash without more goods leads to inflation. Landlords and service providers would simply raise prices, canceling out the benefit.", source: "Fed Working Paper, 2021", replies: [] },
        { id: 106, author: "Leo B.", votes: 63, text: "Paid work gives people structure, purpose, and identity — not just income. UBI risks hollowing out the social contract that ties communities together.", source: "Robert Putnam, Bowling Alone", replies: [] },
      ],
    },
  },
  {
    id: 2, title: "Social media does more harm than good for society",
    summary: "Platforms like Instagram, TikTok, and X have reshaped communication, culture, and mental health.",
    category: "Technology", hot: true,
    rebuttals: [
      { id: 9002, argId: 201, rebuttalSide: "con", author: "Priya M.", votes: 38, text: "Haidt's own research has been widely challenged by peer review. Pre-registered studies find the effect size of social media on teen mental health is roughly equivalent to wearing glasses — statistically present but not practically significant.", source: "Orben & Przybylski, Nature Human Behaviour, 2019" },
    ],
    args: {
      pro: [
        { id: 201, author: "Aisha B.", votes: 210, text: "Teens report record levels of anxiety and depression that closely track smartphone and social media adoption rates. Girls in particular show a 150% increase in self-harm since 2012.", source: "Jonathan Haidt, The Anxious Generation, 2024", replies: [] },
        { id: 202, author: "Chris N.", votes: 88, text: "Algorithmic feeds are optimized for outrage, not truth. This is measurably polarizing democracies worldwide — Facebook's own internal research confirmed the problem and was buried.", source: "WSJ Facebook Files, 2021", replies: [] },
        { id: 207, author: "Yuki T.", votes: 74, text: "The attention economy is structurally predatory. Infinite scroll, variable reward loops, and disappearing content are all deliberately engineered to override rational self-control.", source: "Aza Raskin, Center for Humane Technology", replies: [] },
      ],
      con: [
        { id: 203, author: "Priya M.", votes: 155, text: "Social media gave marginalized communities a global voice they never had. Movements like #MeToo, #BlackLivesMatter, and Arab Spring simply would not have happened without it.", source: "Pew Research, 2021", replies: [] },
        { id: 204, author: "Omar S.", votes: 61, text: "Correlation isn't causation. Teen distress has many causes; blaming social media lets policymakers off the hook for underfunded mental health services, economic precarity, and climate anxiety.", source: "APA, 2023", replies: [] },
        { id: 208, author: "Marcus H.", votes: 49, text: "The same panic happened with TV, video games, and the novel. Every generation moralizes about new media. The evidence for genuine societal harm is still weaker than the headline claims.", source: "Sonia Livingstone, LSE, 2022", replies: [] },
      ],
    },
  },
  {
    id: 3, title: "Strict immigration controls protect workers and wages",
    summary: "A live debate at the intersection of economics, identity, and political legitimacy.",
    category: "Politics", hot: true,
    rebuttals: [],
    args: {
      pro: [
        { id: 301, author: "Tom W.", votes: 134, text: "Low-skill immigration increases labor supply and suppresses wages in exactly the sectors — construction, hospitality, meat-packing — where native workers are most vulnerable. This is basic supply and demand.", source: "George Borjas, Harvard, 2017", replies: [] },
        { id: 302, author: "Leo B.", votes: 97, text: "Sovereign nations have not just the right but the obligation to decide who enters. Open borders aren't compassionate — they're chaotic and they undermine the social trust needed to maintain a welfare state.", source: "David Miller, Strangers in Our Midst, 2016", replies: [] },
      ],
      con: [
        { id: 303, author: "Nadia R.", votes: 188, text: "The empirical consensus is clear: immigrants are net fiscal contributors, start businesses at higher rates than native-born citizens, and fill roles locals don't want. The wage-suppression narrative relies on cherry-picked data.", source: "National Academy of Sciences, The Economic and Fiscal Consequences of Immigration, 2016", replies: [] },
        { id: 304, author: "Zara Q.", votes: 112, text: "Blaming immigrants for wage stagnation is a political misdirect. Wages are suppressed by decades of union decline, share buybacks, and monopsony power — not by the person washing dishes for minimum wage.", source: "EPI, 2023", replies: [] },
      ],
    },
  },
  {
    id: 4, title: "Generative AI will eliminate more jobs than it creates",
    summary: "With AI replacing knowledge work for the first time, economists disagree sharply on the net employment effect.",
    category: "Technology", hot: true,
    rebuttals: [
      { id: 9003, argId: 401, rebuttalSide: "con", author: "Rafi D.", votes: 29, text: "The Goldman study models task displacement, not job displacement. Every prior automation wave — ATMs, manufacturing robots — created adjacent roles we couldn't anticipate. There's no reason this wave should be different.", source: "Acemoglu & Restrepo, NBER, 2022" },
    ],
    args: {
      pro: [
        { id: 401, author: "Mara L.", votes: 156, text: "Goldman Sachs estimates 300 million jobs globally are exposed to automation by generative AI — and unlike previous waves, this one hits white-collar work: lawyers, accountants, writers, coders.", source: "Goldman Sachs Global Investment Research, 2023", replies: [] },
        { id: 402, author: "Aisha B.", votes: 103, text: "The speed of this transition is unprecedented. Past automation happened over decades. GPT-4 went from zero to replacing junior analysts in 18 months. Workers cannot retrain that fast.", source: "OpenAI Econ Impact Report, 2023", replies: [] },
      ],
      con: [
        { id: 403, author: "Rafi D.", votes: 89, text: "Every automation wave in history — looms, electricity, computers — ultimately created more jobs than it destroyed. The productivity dividend gets spent on new goods and services, which require human labor.", source: "David Autor, MIT, 2022", replies: [] },
        { id: 404, author: "Bea C.", votes: 77, text: "AI is a tool, not an autonomous agent. A lawyer using AI can handle 5x the caseload — that's one job multiplied, not eliminated. Most deployments augment rather than replace.", source: "Harvard Business Review, 2023", replies: [] },
      ],
    },
  },
  {
    id: 5, title: "Nuclear energy is essential to solving climate change",
    summary: "As the world races to decarbonize, nuclear power sits at the center of an intense energy debate.",
    category: "Climate", hot: false,
    rebuttals: [],
    args: {
      pro: [
        { id: 501, author: "Elena V.", votes: 178, text: "Nuclear is the only proven carbon-free energy source that can deliver reliable baseload power regardless of weather. France runs on 70% nuclear and has the lowest-carbon grid in Europe.", source: "IEA, 2023", replies: [] },
        { id: 502, author: "Kai M.", votes: 122, text: "The climate math doesn't work without nuclear. Solar and wind need backup — and right now that backup is gas. Until storage scales, nuclear is the only bridge that doesn't lock in more emissions.", source: "IPCC AR6, 2022", replies: [] },
      ],
      con: [
        { id: 503, author: "Frank O.", votes: 134, text: "Nuclear plants take 10–20 years and $20B to build. Solar and wind are already cheaper per MWh and deploy in months. Every dollar spent on nuclear is a dollar not spent on the faster solution.", source: "Lazard LCOE, 2023", replies: [] },
        { id: 504, author: "Yuki T.", votes: 91, text: "Chernobyl, Fukushima, Three Mile Island — and we still don't have a single permanent repository for high-level nuclear waste anywhere in the world. Calling this 'clean' energy requires ignoring a lot of inconvenient facts.", source: "World Nuclear Waste Report, 2022", replies: [] },
      ],
    },
  },
  {
    id: 6, title: "Longevity research should be a top public health priority",
    summary: "Biotech companies are racing to extend healthy human lifespan. The question is whether society should be helping them.",
    category: "Health", hot: true,
    rebuttals: [],
    args: {
      pro: [
        { id: 601, author: "Zara Q.", votes: 201, text: "Aging is the underlying cause of most human disease — cancer, dementia, heart failure. Treating aging itself rather than each disease in turn could be the most cost-effective public health investment in history.", source: "David Sinclair, Lifespan, 2019", replies: [] },
        { id: 602, author: "Bea C.", votes: 88, text: "If we can extend healthy productive years — not just total lifespan — we solve the pension and healthcare crises simultaneously. This is not a luxury for the rich; it's a fiscal necessity.", source: "OECD Ageing Report, 2023", replies: [] },
      ],
      con: [
        { id: 603, author: "Omar S.", votes: 144, text: "Life-extension technology will be expensive and will reach the wealthy first, locking in multigenerational oligarchies. The last thing an unequal world needs is billionaires living for 200 years.", source: "Ezekiel Emanuel, The Atlantic, 2014", replies: [] },
        { id: 604, author: "Chris N.", votes: 76, text: "Our institutions — democracy, pensions, cultural renewal — evolved around roughly 80-year human lifespans. We have no idea what happens to society's capacity for change when incumbent elites simply don't die.", source: "Tyler Cowen, The Complacent Class, 2017", replies: [] },
      ],
    },
  },
  {
    id: 7, title: "It's time to abolish legacy admissions at elite universities",
    summary: "Preferential treatment for children of alumni and donors persists at Harvard, Yale, and most elite schools. Is it defensible?",
    category: "Society", hot: true,
    rebuttals: [],
    args: {
      pro: [
        { id: 701, author: "Nadia R.", votes: 167, text: "Legacy admits are 45% more likely to be accepted than equally qualified applicants — and they are overwhelmingly white and wealthy. In a meritocracy this should be a scandal, not a policy.", source: "Harvard admissions data, Arcidiacono et al., 2019", replies: [] },
        { id: 702, author: "Marcus H.", votes: 93, text: "Johns Hopkins abolished legacy admissions in 2020. Their donor revenue did not collapse. The argument that universities need legacy preference to survive financially is simply not supported by evidence.", source: "JHU Institutional Research, 2023", replies: [] },
      ],
      con: [
        { id: 703, author: "Tom W.", votes: 72, text: "Donor giving funds financial aid for low-income students. Before abolishing legacy preference, we should model whether the revenue loss would actually hurt the very students the critics claim to care about.", source: "NACUBO Endowment Report, 2022", replies: [] },
        { id: 704, author: "Leo B.", votes: 55, text: "Legacy preference is a red herring in admissions debates. The far bigger driver of inequity is the advantage wealthy families buy through tutors, test prep, and extracurricular stacking — none of which will be fixed by this reform.", source: "NYT The Upshot, 2023", replies: [] },
      ],
    },
  },
  {
    id: 8, title: "Effective Altruism has done more harm than good",
    summary: "The rationalist charity movement promised to redirect billions to the world's best causes. Has it delivered — or created a cult of techno-utopian hubris?",
    category: "Ethics", hot: true,
    rebuttals: [],
    args: {
      pro: [
        { id: 801, author: "Zara Q.", votes: 139, text: "The EA movement enabled Sam Bankman-Fried's 'earn to give' rationale and turned a blind eye to obvious ethical violations because the expected value calculations were favorable. Consequentialism without guardrails is just rationalized harm.", source: "NY Mag, The Dangerous Ideas of Longtermism, 2022", replies: [] },
        { id: 802, author: "Aisha B.", votes: 97, text: "EA's obsession with existential risk and far-future AI scenarios has diverted billions away from present suffering — malaria, hunger, conflict. Statistically-identified distant harms are treated as more important than visible present ones.", source: "Émile Torres, Jacobin, 2023", replies: [] },
      ],
      con: [
        { id: 803, author: "Kai M.", votes: 182, text: "EA-influenced funding has distributed over $46 billion to cost-effective interventions. GiveWell-recommended charities have prevented hundreds of thousands of deaths. Judging the entire movement by FTX is like judging all of philanthropy by Bernie Madoff.", source: "GiveWell, 2023 Annual Report", replies: [] },
        { id: 804, author: "Elena V.", votes: 118, text: "The core EA idea — that we should try to do the most good we can, rigorously — is basically unobjectionable. The critics are mostly attacking a caricature and ignoring the thousands of people quietly funding global health, animal welfare, and biosecurity.", source: "Will MacAskill, What We Owe the Future, 2022", replies: [] },
      ],
    },
  },
  {
    id: 9, title: "Four-day workweeks should become the legal standard",
    summary: "Pilot programs across Iceland, the UK, and Japan show productivity holding steady. Should governments mandate it?",
    category: "Society", hot: false,
    rebuttals: [],
    args: {
      pro: [
        { id: 901, author: "Priya M.", votes: 134, text: "The UK's 61-company four-day week trial found revenue stayed broadly the same while worker wellbeing, retention, and sick days improved dramatically. This is the rare reform with wins for both employers and employees.", source: "4 Day Week Global, 2023", replies: [] },
        { id: 902, author: "Rafi D.", votes: 88, text: "Productivity per hour worked is what matters — not hours clocked. Countries with shorter working hours like Germany and the Netherlands consistently outperform the US on output per hour. More hours is not the same as more work.", source: "OECD Productivity Statistics, 2023", replies: [] },
      ],
      con: [
        { id: 903, author: "James R.", votes: 89, text: "Many industries — healthcare, logistics, manufacturing, hospitality — cannot simply compress schedules. A nurse can't do five days of patient care in four. Mandating this would create chaos or just force shift compression.", source: "HBR, 2022", replies: [] },
        { id: 904, author: "Bea C.", votes: 61, text: "Small businesses and startups will bear the compliance cost while large corporations use it as a recruiting perk. Government mandates for work structure tend to lock in incumbents and freeze out entrepreneurship.", source: "NFIB Small Business Research, 2023", replies: [] },
      ],
    },
  },
  {
    id: 10, title: "Drug decriminalization reduces harm — the evidence is clear",
    summary: "Portugal decriminalized personal possession in 2001. Two decades later, the data is in. Should other countries follow?",
    category: "Health", hot: false,
    rebuttals: [],
    args: {
      pro: [
        { id: 1001, author: "Dev P.", votes: 176, text: "Portugal's 2001 decriminalization saw drug-related HIV infections drop by 95%, overdose deaths fall to the lowest in Europe, and drug use rates stabilize — not increase. This is one of the most successful public health experiments of the century.", source: "Caitlin Hughes & Alex Stevens, British Journal of Criminology, 2010", replies: [] },
        { id: 1002, author: "Marcus H.", votes: 122, text: "Criminalization doesn't reduce drug use — it just makes it more dangerous. People use drugs in hiding, with dirty equipment, without calling for help when something goes wrong. The law is literally killing people.", source: "EMCDDA European Drug Report, 2023", replies: [] },
      ],
      con: [
        { id: 1003, author: "Sara K.", votes: 88, text: "Portugal didn't just decriminalize — it massively expanded treatment infrastructure simultaneously. Countries that copy the decriminalization without funding the services are not running the same experiment.", source: "RAND Drug Policy Research Center, 2021", replies: [] },
        { id: 1004, author: "Chris N.", votes: 64, text: "Decriminalization sends a signal that society is permissive about drug use. Oregon tried it and reversed course within three years after a visible spike in public drug use and disorder. The Portugal model doesn't transfer automatically.", source: "Oregon SB 755 Legislative Record, 2024", replies: [] },
      ],
    },
  },
];

function calcScore(args) {
  const pro = args.pro.reduce((s, a) => s + a.votes + a.replies.reduce((r, x) => r + x.votes, 0), 0);
  const con = args.con.reduce((s, a) => s + a.votes + a.replies.reduce((r, x) => r + x.votes, 0), 0);
  return { pro, con, total: pro + con || 1 };
}

async function runFactCheck(text, source) {
  const prompt = `You are a neutral fact-checker for a debate platform called antilog. Briefly assess this argument in 2 sentences max. Flag if the claim seems unsupported, misleading, or well-evidenced. Be concise and neutral. Do NOT moralize.\n\nArgument: "${text}"\n${source ? `Cited source: ${source}` : "No source cited."}\n\nRespond with a JSON object: { "verdict": "supported" | "disputed" | "unsourced", "note": "your brief note" }`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const raw = data.content?.find(b => b.type === "text")?.text || "{}";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return { verdict: "unsourced", note: "Could not complete fact check." };
  }
}

const verdictStyle = {
  supported: { bg: "#edf7ed", color: "#2e6a2e", icon: "✓" },
  disputed:  { bg: "#fef3e8", color: "#944d10", icon: "⚠" },
  unsourced: { bg: "#f0eeec", color: "#6b5d52", icon: "?" },
};

// ── Invite / Sign-up modal ────────────────────────────────────────────────
function InviteModal({ onClose, user }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const link = "https://antilog.app/join?ref=" + (user?.id ?? "guest");

  const handleInvite = () => {
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail("");
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const signInWithGoogle = async () => {
    setSigningIn(true);
    const auth = await sb.auth();
    if (auth) await auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    setSigningIn(false);
  };

  const signOut = async () => {
    const auth = await sb.auth();
    if (auth) await auth.signOut();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 12px 48px rgba(0,0,0,0.14)" }} onClick={e => e.stopPropagation()}>

        {user ? (
          // ── Signed in ───────────────────────────────────────────────────
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 14px", background: C.card, borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8e0d4", display: "flex", alignItems: "center", justifyContent: "center", ...serifMed, fontSize: 16, color: C.textSub }}>
                {user.user_metadata?.full_name?.[0] ?? "U"}
              </div>
              <div>
                <p style={{ ...sansMed, fontSize: 13, color: C.text }}>{user.user_metadata?.full_name ?? "User"}</p>
                <p style={{ ...sans, fontSize: 11, color: C.textMuted }}>{user.email}</p>
              </div>
            </div>

            <p style={{ ...serifMed, fontSize: 18, color: C.text, marginBottom: 4 }}>Invite someone to debate</p>
            <p style={{ ...sans, fontSize: 13, color: C.textSub, marginBottom: 20, lineHeight: 1.5 }}>antilog is better when both sides are represented. Invite someone who disagrees with you.</p>

            <p style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Invite by email</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInvite()}
                placeholder="their@email.com"
                style={{ ...sans, fontSize: 13, flex: 1, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", outline: "none", boxSizing: "border-box" }} />
              <button onClick={handleInvite}
                style={{ ...sans, fontSize: 12, background: C.text, color: "#fff", padding: "9px 16px", borderRadius: 9, cursor: "pointer", border: "none", flexShrink: 0 }}>
                {sent ? "Sent ✓" : "Send"}
              </button>
            </div>

            <p style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Or share your link</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <div style={{ ...sans, fontSize: 12, flex: 1, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", color: C.textSub, background: C.card, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {link}
              </div>
              <button onClick={copyLink}
                style={{ ...sans, fontSize: 12, background: copied ? "#edf7ed" : "#f0ebe3", color: copied ? "#2e6a2e" : C.textMid, padding: "9px 14px", borderRadius: 9, cursor: "pointer", border: "none", flexShrink: 0, transition: "all 0.2s" }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button onClick={signOut}
              style={{ ...sans, fontSize: 11, color: C.textMuted, width: "100%", background: "none", border: `1px solid ${C.border}`, borderRadius: 9, padding: "8px", cursor: "pointer" }}>
              Sign out
            </button>
          </>
        ) : (
          // ── Signed out ──────────────────────────────────────────────────
          <>
            <p style={{ ...serifMed, fontSize: 20, color: C.text, marginBottom: 6 }}>Join antilog</p>
            <p style={{ ...sans, fontSize: 13, color: C.textSub, marginBottom: 24, lineHeight: 1.5 }}>Sign in to post arguments, build your reputation, and get notified when someone rebuts you.</p>

            <button onClick={signInWithGoogle} disabled={signingIn}
              style={{ ...sansMed, fontSize: 13, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", marginBottom: 12, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.card}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              {signingIn ? "Redirecting…" : "Continue with Google"}
            </button>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              <p style={{ ...sans, fontSize: 11, color: C.textSub, lineHeight: 1.6 }}>You can still read all debates and Fact Check arguments without signing in. An account lets you post, vote, and build your reputation.</p>
            </div>
          </>
        )}

        <button onClick={onClose} style={{ ...sans, fontSize: 11, color: C.textMuted, marginTop: 12, width: "100%", background: "none", border: "none", cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}


// ── Share sheet ───────────────────────────────────────────────────────────
function ShareSheet({ text, author, onClose }) {
  const [copied, setCopied] = useState(false);
  const snippet = `"${text.slice(0, 120)}${text.length > 120 ? "…" : ""}" — ${author} on antilog`;
  const enc = encodeURIComponent(snippet);
  const channels = [
    { name: "Copy text",   icon: "🔗", action: () => { navigator.clipboard?.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); } },
    { name: "Twitter / X", icon: "𝕏", url: `https://twitter.com/intent/tweet?text=${enc}` },
    { name: "LinkedIn",    icon: "in", url: `https://www.linkedin.com/sharing/share-offsite/?url=https://antilog.app&summary=${enc}` },
    { name: "WhatsApp",    icon: "✉",  url: `https://api.whatsapp.com/send?text=${enc}` },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60, padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 20, width: "100%", maxWidth: 380, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <p style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Share argument</p>
        <div style={{ borderLeft: `2px solid ${C.pro}`, paddingLeft: 10, marginBottom: 14 }}>
          <p style={{ ...serif, fontSize: 13, color: C.textMid, fontStyle: "italic", lineHeight: 1.5 }}>"{text.slice(0, 100)}{text.length > 100 ? "…" : ""}"</p>
          <p style={{ ...sans, fontSize: 11, color: C.textMuted, marginTop: 4 }}>— {author}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {channels.map(c => (
            <button key={c.name} onClick={() => { if (c.url) window.open(c.url, "_blank"); if (c.action) c.action(); }}
              style={{ ...sans, fontSize: 12, display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: C.card, color: C.textMid, cursor: "pointer", border: "none" }}>
              <span style={{ width: 20, textAlign: "center" }}>{c.icon}</span>
              {c.name === "Copy text" && copied ? "Copied!" : c.name}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ ...sans, fontSize: 11, color: C.textMuted, marginTop: 10, width: "100%", background: "none", border: "none", cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}

// ── Profile modal ─────────────────────────────────────────────────────────
function ProfileModal({ author, userData, onClose }) {
  const tier = repTier(userData.rep);
  const base = tier.label === "New Voice" ? 0 : tier.label === "Participant" ? 50 : tier.label === "Contributor" ? 200 : 500;
  const pct = Math.min(100, ((userData.rep - base) / (tier.next - base)) * 100);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e8e0d4", color: C.textSub, display: "flex", alignItems: "center", justifyContent: "center", ...serifMed, fontSize: 20 }}>{userData.avatar}</div>
          <div>
            <p style={{ ...serifMed, fontSize: 17, color: C.text }}>{author}</p>
            <p style={{ ...sans, fontSize: 12, color: tier.color, background: tier.bg, display: "inline-block", padding: "2px 8px", borderRadius: 10, marginTop: 2 }}>{tier.label}</p>
          </div>
        </div>
        <p style={{ ...sans, fontSize: 12, color: C.textSub, marginBottom: 14, lineHeight: 1.5 }}>{tier.desc}</p>
        <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
          <span style={{ ...sans, fontSize: 11, color: C.textMuted }}>Reputation</span>
          <span style={{ ...sans, fontSize: 11, color: C.textSub }}>{userData.rep} / {tier.next} pts</span>
        </div>
        <div style={{ height: 4, background: "#f0ebe4", borderRadius: 4, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: tier.color, borderRadius: 4, transition: "width 0.6s" }} />
        </div>
        {userData.args?.length > 0 && (
          <>
            <p style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Recent arguments</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {userData.args.map((a, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 10, padding: "8px 12px", borderLeft: `3px solid ${a.side === "pro" ? C.pro : C.con}` }}>
                  <p style={{ ...serif, fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>"{a.text.slice(0, 80)}…"</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ ...sans, fontSize: 10, color: C.textMuted }}>{a.topic} · {a.side === "pro" ? "For" : "Against"}</span>
                    <span style={{ ...sans, fontSize: 10, color: C.pro }}>▲ {a.votes}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <button onClick={onClose} style={{ ...sans, fontSize: 11, color: C.textMuted, marginTop: 16, width: "100%", background: "none", border: "none", cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}

// ── Rep badge ─────────────────────────────────────────────────────────────
function RepBadge({ author, onOpenProfile }) {
  const user = USERS[author] || { avatar: (author || "?")[0].toUpperCase(), rep: SESSION_USER.rep, args: [] };
  const tier = repTier(user.rep);
  return (
    <button onClick={() => onOpenProfile(author, user)} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#e8e0d4", color: C.textSub, display: "flex", alignItems: "center", justifyContent: "center", ...sansMed, fontSize: 10, flexShrink: 0 }}>{user.avatar}</div>
      <span style={{ ...sans, fontSize: 12, color: C.textMid }}>{author}</span>
      <span style={{ ...sans, fontSize: 9, color: tier.color, background: tier.bg, padding: "1px 6px", borderRadius: 10 }}>{tier.label}</span>
    </button>
  );
}

// ── Fact check badge (was "AI check") ─────────────────────────────────────
function FactCheckBadge({ text, source }) {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const run = async () => { setState("loading"); const r = await runFactCheck(text, source); setResult(r); setState("done"); };
  if (state === "idle") return (
    <button onClick={run} style={{ ...sans, fontSize: 10, color: C.textSub, background: "none", border: `1px dashed ${C.border}`, borderRadius: 8, padding: "2px 8px", cursor: "pointer" }}>
      Fact check
    </button>
  );
  if (state === "loading") return <span style={{ ...sans, fontSize: 10, color: C.textMuted }}>Checking…</span>;
  const vs = verdictStyle[result.verdict] || verdictStyle.unsourced;
  return (
    <div style={{ background: vs.bg, borderRadius: 8, padding: "6px 10px", marginTop: 6 }}>
      <p style={{ ...sans, fontSize: 10, color: vs.color }}><span style={{ marginRight: 4 }}>{vs.icon}</span><strong>{result.verdict}</strong> · {result.note}</p>
    </div>
  );
}

// ── Infographics ──────────────────────────────────────────────────────────
function RadialBalance({ pro, con, size = 68 }) {
  const total = pro + con || 1, f = pro / total;
  const r = size * 0.38, cx = size / 2, cy = size / 2, sw = size * 0.07;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ede8e1" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.pro} strokeWidth={sw} strokeDasharray={`${circ * f} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={size * 0.145} fill={C.textSub} style={sans}>{Math.round(f * 100)}%</text>
      </svg>
      <span style={{ ...sans, fontSize: 8, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>for</span>
    </div>
  );
}

function DotMatrix({ pro, con }) {
  const total = pro + con || 1, dots = 20, proDots = Math.round((pro / total) * dots);
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
        {Array.from({ length: dots }).map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < proDots ? C.pro : C.con, opacity: 0.85 }} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", ...sans, fontSize: 10, color: C.textMuted }}>
        <span>{Math.round((pro / total) * 100)}% lean For</span>
        <span>{Math.round((con / total) * 100)}% lean Against</span>
      </div>
    </div>
  );
}

function PullBar({ pro, con }) {
  const total = pro + con || 1, pw = (pro / total) * 100;
  return (
    <div>
      <div style={{ width: "100%", height: 3, background: C.con, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pw}%`, height: "100%", background: C.pro, borderRadius: 3, transition: "width 0.6s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", ...sans, fontSize: 10, color: C.textMuted, marginTop: 4 }}>
        <span>For · {pro}pts</span><span>Against · {con}pts</span>
      </div>
    </div>
  );
}

// ── Vote button ───────────────────────────────────────────────────────────
function VoteBtn({ votes, onVote }) {
  const [count, setCount] = useState(votes);
  const [voted, setVoted] = useState(false);
  return (
    <button onClick={() => { const v = !voted; setCount(c => v ? c + 1 : c - 1); setVoted(v); onVote?.(v ? 1 : -1); }}
      style={{ ...sans, fontSize: 11, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, color: voted ? "#a07c0a" : C.textMuted, padding: 0, transition: "color 0.15s" }}>
      ▲ {count}
    </button>
  );
}

// ── Rebuttal form ─────────────────────────────────────────────────────────
function RebuttalForm({ side, onSubmit, onCancel }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const rebuttalSide = side === "pro" ? "con" : "pro";
  const accentColor = rebuttalSide === "pro" ? C.pro : C.con;
  const sideLabel = rebuttalSide === "pro" ? "For" : "Against";
  return (
    <div style={{ marginTop: 12, padding: "12px 14px", background: "#fdfaf6", border: `1.5px solid ${accentColor}`, borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ ...sans, fontSize: 10, color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>⇄ Rebuttal from {sideLabel}</span>
        <span style={{ ...sans, fontSize: 10, color: C.textMuted }}>· Will also appear as a card in the {sideLabel} column</span>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={`Make your case from the ${sideLabel} side…`} rows={3}
        style={{ ...serif, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", resize: "none", background: "#fff", outline: "none", boxSizing: "border-box" }} />
      <input value={source} onChange={e => setSource(e.target.value)} placeholder="Source (optional)"
        style={{ ...sans, fontSize: 11, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", marginTop: 4, background: "#fff", outline: "none", boxSizing: "border-box" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => { if (text.trim()) onSubmit(text, source); }}
          style={{ ...sans, fontSize: 12, background: accentColor, color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", border: "none" }}>Post rebuttal</button>
        <button onClick={onCancel} style={{ ...sans, fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Rebuttal preview (nested under original) ──────────────────────────────
function RebuttalPreview({ rebuttal, onScrollToCard, onOpenProfile, onRep }) {
  const accentColor = rebuttal.rebuttalSide === "pro" ? C.pro : C.con;
  const sideLabel = rebuttal.rebuttalSide === "pro" ? "For" : "Against";
  return (
    <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: `2px dashed ${accentColor}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <span style={{ ...sans, fontSize: 9, color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>⇄ Rebuttal · {sideLabel}</span>
        <button onClick={onScrollToCard}
          style={{ ...sans, fontSize: 9, color: C.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationStyle: "dotted" }}>
          view in {sideLabel} column →
        </button>
      </div>
      <RepBadge author={rebuttal.author} onOpenProfile={onOpenProfile} />
      <p style={{ ...serif, fontSize: 12.5, color: C.textMid, lineHeight: 1.6, margin: "5px 0 4px", fontStyle: "italic" }}>
        "{rebuttal.text.slice(0, 130)}{rebuttal.text.length > 130 ? "…" : ""}"
      </p>
      <VoteBtn votes={rebuttal.votes} onVote={d => onRep(rebuttal.author, d * 8)} />
    </div>
  );
}

// ── Rebuttal full card ────────────────────────────────────────────────────
function RebuttalCard({ rebuttal, originalArg, onScrollToOriginal, onShare, onFork, onOpenProfile, onRep, cardRef, isAdmin, onDelete }) {
  const accentColor = rebuttal.rebuttalSide === "pro" ? C.pro : C.con;
  const originalAccent = rebuttal.rebuttalSide === "pro" ? C.con : C.pro;
  const originalLabel = rebuttal.rebuttalSide === "pro" ? "Against" : "For";
  return (
    <div ref={cardRef} style={{ borderLeft: `3px solid ${accentColor}`, background: C.card, borderRadius: "0 12px 12px 0", padding: "14px 14px 12px" }}>
      <button onClick={onScrollToOriginal}
        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "6px 10px", background: "#f2ede6", borderRadius: 8, borderLeft: `2px solid ${originalAccent}`, width: "100%", textAlign: "left", cursor: "pointer", border: "none", borderLeft: `2px solid ${originalAccent}` }}>
        <span style={{ ...sans, fontSize: 9, color: originalAccent, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>↩ rebutting {originalLabel}</span>
        <span style={{ ...serif, fontSize: 11, color: C.textSub, fontStyle: "italic", flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          "{originalArg?.text?.slice(0, 65)}…"
        </span>
        <span style={{ ...sans, fontSize: 9, color: C.textMuted, flexShrink: 0 }}>view →</span>
      </button>
      <RepBadge author={rebuttal.author} onOpenProfile={onOpenProfile} />
      <p style={{ ...serif, fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "8px 0 4px" }}>{rebuttal.text}</p>
      {rebuttal.source && <p style={{ ...sans, fontSize: 11, color: C.textMuted, fontStyle: "italic", marginBottom: 6 }}>— {rebuttal.source}</p>}
      <FactCheckBadge text={rebuttal.text} source={rebuttal.source} />
      <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
        <VoteBtn votes={rebuttal.votes} onVote={d => onRep(rebuttal.author, d * 10)} />
        <button onClick={() => onFork(rebuttal)} style={{ ...sans, fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>⑃ fork</button>
        <button onClick={() => onShare(rebuttal)} style={{ ...sans, fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>↗ share</button>
      </div>
    </div>
  );
}

// ── Reply card ────────────────────────────────────────────────────────────
function ReplyCard({ reply, onFork, onShare, onOpenProfile, onRep }) {
  return (
    <div style={{ marginTop: 10, marginLeft: 32, paddingLeft: 12, borderLeft: `1px solid ${C.border}` }}>
      <RepBadge author={reply.author} onOpenProfile={onOpenProfile} />
      <p style={{ ...serif, fontSize: 13, color: C.textMid, lineHeight: 1.65, margin: "6px 0 3px" }}>{reply.text}</p>
      {reply.source && <p style={{ ...sans, fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>— {reply.source}</p>}
      <FactCheckBadge text={reply.text} source={reply.source} />
      <div style={{ display: "flex", gap: 12, marginTop: 6, alignItems: "center" }}>
        <VoteBtn votes={reply.votes} onVote={d => onRep(reply.author, d * 5)} />
        <button onClick={() => onFork(reply)} style={{ ...sans, fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>⑃ fork</button>
        <button onClick={() => onShare(reply)} style={{ ...sans, fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>↗ share</button>
      </div>
    </div>
  );
}

// ── Arg card ──────────────────────────────────────────────────────────────
function ArgCard({ arg, side, rebuttals, cardRef, onFork, onShare, onOpenProfile, onRep, onAddRebuttal, onScrollToRebuttalCard, user, isAdmin, onSignIn, onDelete }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showRebuttalForm, setShowRebuttalForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySource, setReplySource] = useState("");
  const [replies, setReplies] = useState(arg.replies);
  const accent = side === "pro" ? C.pro : C.con;
  const opposingAccent = side === "pro" ? C.con : C.pro;

  const submitReply = () => {
    if (!replyText.trim()) return;
    setReplies(r => [...r, { id: Date.now(), author: SESSION_USER.name, votes: 0, text: replyText, source: replySource }]);
    setReplyText(""); setReplySource(""); setShowReplyForm(false);
  };

  const submitRebuttal = (text, source) => {
    onAddRebuttal(arg.id, side, text, source);
    setShowRebuttalForm(false);
  };

  const argRebuttals = rebuttals.filter(r => r.argId === arg.id);

  return (
    <div ref={cardRef} style={{ borderLeft: `3px solid ${accent}`, background: C.card, borderRadius: "0 12px 12px 0", padding: "14px 14px 12px" }}>
      <RepBadge author={arg.author} onOpenProfile={onOpenProfile} />
      <p style={{ ...serif, fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: "8px 0 4px" }}>{arg.text}</p>
      {arg.source && <p style={{ ...sans, fontSize: 11, color: C.textMuted, fontStyle: "italic", marginBottom: 6 }}>— {arg.source}</p>}
      <FactCheckBadge text={arg.text} source={arg.source} />

      <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
        <VoteBtn votes={arg.votes} onVote={d => onRep(arg.author, d * 10)} />
        <button onClick={() => { if (!user) { onSignIn(); return; } setShowReplyForm(v => !v); setShowRebuttalForm(false); }}
          style={{ ...sans, fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>Reply</button>
        <button onClick={() => { if (!user) { onSignIn(); return; } setShowRebuttalForm(v => !v); setShowReplyForm(false); }}
          style={{ ...sans, fontSize: 11, color: opposingAccent, background: "none", border: `1px solid ${opposingAccent}`, borderRadius: 6, padding: "2px 9px", cursor: "pointer", opacity: 0.9 }}>⇄ Rebut</button>
        <button onClick={() => onFork(arg)} style={{ ...sans, fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>⑃ fork</button>
        <button onClick={() => onShare(arg)} style={{ ...sans, fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>↗ share</button>
      </div>

      {replies.map(r => <ReplyCard key={r.id} reply={r} onFork={onFork} onShare={onShare} onOpenProfile={onOpenProfile} onRep={onRep} />)}

      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={() => { if (window.confirm("Delete this argument and all its replies?")) onDelete("argument", arg.id); }}
            style={{ ...sans, fontSize: 10, color: "#c0504d", background: "none", border: "1px solid #e8c8c8", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>
            🗑 Delete
          </button>
        </div>
      )}
      {showReplyForm && (
        <div style={{ marginTop: 12, marginLeft: 32 }}>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Add your perspective…" rows={3}
            style={{ ...serif, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", resize: "none", background: "#fff", outline: "none", boxSizing: "border-box" }} />
          <input value={replySource} onChange={e => setReplySource(e.target.value)} placeholder="Source (optional)"
            style={{ ...sans, fontSize: 11, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", marginTop: 4, background: "#fff", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={submitReply} style={{ ...sans, fontSize: 12, background: accent, color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", border: "none" }}>Post</button>
            <button onClick={() => setShowReplyForm(false)} style={{ ...sans, fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {showRebuttalForm && <RebuttalForm side={side} onSubmit={submitRebuttal} onCancel={() => setShowRebuttalForm(false)} />}

      {argRebuttals.map(r => (
        <RebuttalPreview key={r.id} rebuttal={r}
          onScrollToCard={() => onScrollToRebuttalCard(r.id)}
          onOpenProfile={onOpenProfile} onRep={onRep} />
      ))}
    </div>
  );
}

// ── Add arg panel ─────────────────────────────────────────────────────────
function AddArgPanel({ side, onAdd, user, onSignIn }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const accent = side === "pro" ? C.pro : C.con;
  const submit = () => {
    if (!text.trim()) return;
    onAdd({ id: Date.now(), author: SESSION_USER.name, votes: 0, text, source, replies: [] });
    setText(""); setSource(""); setOpen(false);
  };
  return (
    <div style={{ marginTop: 10 }}>
      {!open
        ? <button onClick={() => setOpen(true)} style={{ ...sans, fontSize: 12, color: accent, border: `1.5px dashed ${accent}`, borderRadius: 10, padding: "9px", width: "100%", background: "transparent", cursor: "pointer", opacity: 0.8 }}>
            + Add a case {side === "pro" ? "for" : "against"}
          </button>
        : <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="State your case clearly and honestly…" rows={4}
              style={{ ...serif, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", resize: "none", marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
            <input value={source} onChange={e => setSource(e.target.value)} placeholder="Source or citation (optional)"
              style={{ ...sans, fontSize: 11, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={submit} style={{ ...sans, fontSize: 12, background: accent, color: "#fff", padding: "7px 16px", borderRadius: 8, cursor: "pointer", border: "none" }}>Submit</button>
              <button onClick={() => setOpen(false)} style={{ ...sans, fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
      }
    </div>
  );
}

// ── Fork modal ────────────────────────────────────────────────────────────
function ForkModal({ sourceArg, onConfirm, onClose }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("General");
  const cats = CATEGORIES.filter(c => c !== "All");
  const submit = () => {
    if (!title.trim()) return;
    onConfirm({ id: Date.now(), title, summary: summary || `Forked from: "${sourceArg.text.slice(0, 80)}…"`, category, forkedFrom: sourceArg.text, forkedAuthor: sourceArg.author, hot: false, rebuttals: [], args: { pro: [], con: [] } });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>
        <div style={{ borderLeft: `3px solid ${C.pro}`, paddingLeft: 12, marginBottom: 16 }}>
          <p style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Forking from</p>
          <p style={{ ...serif, fontSize: 13, color: C.textMid, fontStyle: "italic", lineHeight: 1.6 }}>"{sourceArg.text.slice(0, 110)}…"</p>
          <p style={{ ...sans, fontSize: 11, color: C.textMuted, marginTop: 4 }}>— {sourceArg.author}</p>
        </div>
        <p style={{ ...serifMed, fontSize: 16, color: C.text, marginBottom: 14 }}>Start a new truth from this point</p>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...sans, fontSize: 12, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", marginBottom: 10, outline: "none", boxSizing: "border-box" }}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Frame the new truth clearly…" style={{ ...sans, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
        <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Context (optional)…" rows={2} style={{ ...serif, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", resize: "none", marginBottom: 14, outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit} style={{ ...sans, fontSize: 13, background: C.pro, color: "#fff", padding: "8px 18px", borderRadius: 9, cursor: "pointer", border: "none" }}>Create fork</button>
          <button onClick={onClose} style={{ ...sans, fontSize: 13, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── New topic modal ────────────────────────────────────────────────────────
function NewTopicModal({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("General");
  const cats = CATEGORIES.filter(c => c !== "All");
  const submit = () => {
    if (!title.trim()) return;
    onAdd({ id: Date.now(), title, summary, category, hot: false, rebuttals: [], args: { pro: [], con: [] } });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: "100%", maxWidth: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>
        <p style={{ ...serifMed, fontSize: 18, color: C.text, marginBottom: 4 }}>Start a new truth</p>
        <p style={{ ...sans, fontSize: 12, color: C.textSub, marginBottom: 16 }}>Pose a clear, debatable statement. Both sides will be heard.</p>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...sans, fontSize: 12, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", marginBottom: 10, outline: "none", boxSizing: "border-box" }}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Ranked-choice voting should replace first-past-the-post" style={{ ...sans, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
        <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Briefly describe the context or stakes…" rows={3} style={{ ...serif, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", resize: "none", marginBottom: 16, outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit} style={{ ...sans, fontSize: 13, background: C.text, color: "#fff", padding: "8px 18px", borderRadius: 9, cursor: "pointer", border: "none" }}>Post truth</button>
          <button onClick={onClose} style={{ ...sans, fontSize: 13, color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Debate view ────────────────────────────────────────────────────────────
// ── Mobile tabbed view ────────────────────────────────────────────────────
function MobileTabs({ args, rebuttals, argRefs, rebuttalCardRefs, pro, con,
  onFork, onShare, onOpenProfile, onRep, onAddRebuttal, onScrollToRebuttalCard,
  onScrollToArg, findArg, proRebuttalCards, conRebuttalCards, onAddArg,
  user, isAdmin, onSignIn, onDelete }) {
  const [tab, setTab] = useState("pro");
  const total = pro + con || 1;
  const proW = Math.round((pro / total) * 100);
  const conW = 100 - proW;

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        {[["pro", "For", C.pro, proW], ["con", "Against", C.con, conW]].map(([key, label, color, pct]) => {
          const active = tab === key;
          const argCount = key === "pro" ? args.pro.length + proRebuttalCards.length : args.con.length + conRebuttalCards.length;
          return (
            <button key={key} onClick={() => setTab(key)}
              style={{
                flex: 1, padding: "10px 8px", border: "none", cursor: "pointer",
                background: active ? color : "#faf8f5",
                transition: "background 0.18s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
              <span style={{ ...sansMed, fontSize: 12, color: active ? "#fff" : color }}>{label}</span>
              <span style={{ ...sans, fontSize: 10, color: active ? "rgba(255,255,255,0.8)" : C.textMuted }}>{argCount} argument{argCount !== 1 ? "s" : ""} · {pct}% lean</span>
            </button>
          );
        })}
      </div>

      {/* Bar showing lean */}
      <div style={{ height: 3, background: C.con, borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ width: `${proW}%`, height: "100%", background: C.pro, borderRadius: 3, transition: "width 0.5s" }} />
      </div>

      {/* Active tab content */}
      {tab === "pro" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {args.pro.map(a => (
            <ArgCard key={a.id} arg={a} side="pro" rebuttals={rebuttals}
              cardRef={el => { argRefs.current[a.id] = el; }}
              onFork={onFork} onShare={onShare}
              onOpenProfile={onOpenProfile} onRep={onRep}
              onAddRebuttal={onAddRebuttal}
              onScrollToRebuttalCard={onScrollToRebuttalCard}
              user={user} isAdmin={isAdmin} onSignIn={onSignIn} onDelete={onDelete} />
          ))}
          {proRebuttalCards.map(r => (
            <RebuttalCard key={r.id} rebuttal={r} originalArg={findArg(r.argId)}
              cardRef={el => { rebuttalCardRefs.current[r.id] = el; }}
              onScrollToOriginal={() => onScrollToArg(r.argId)}
              onShare={onShare} onFork={onFork}
              onOpenProfile={onOpenProfile} onRep={onRep}
              isAdmin={isAdmin} onDelete={onDelete} />
          ))}
          <AddArgPanel side="pro" onAdd={arg => onAddArg("pro", arg)} user={user} onSignIn={onSignIn} />
          <button onClick={() => setTab("con")}
            style={{ ...sans, fontSize: 12, color: C.con, background: "none", border: `1px solid ${C.con}`, borderRadius: 10, padding: "10px", cursor: "pointer", marginTop: 8, opacity: 0.85 }}>
            See the case Against →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {args.con.map(a => (
            <ArgCard key={a.id} arg={a} side="con" rebuttals={rebuttals}
              cardRef={el => { argRefs.current[a.id] = el; }}
              onFork={onFork} onShare={onShare}
              onOpenProfile={onOpenProfile} onRep={onRep}
              onAddRebuttal={onAddRebuttal}
              onScrollToRebuttalCard={onScrollToRebuttalCard}
              user={user} isAdmin={isAdmin} onSignIn={onSignIn} onDelete={onDelete} />
          ))}
          {conRebuttalCards.map(r => (
            <RebuttalCard key={r.id} rebuttal={r} originalArg={findArg(r.argId)}
              cardRef={el => { rebuttalCardRefs.current[r.id] = el; }}
              onScrollToOriginal={() => onScrollToArg(r.argId)}
              onShare={onShare} onFork={onFork}
              onOpenProfile={onOpenProfile} onRep={onRep}
              isAdmin={isAdmin} onDelete={onDelete} />
          ))}
          <AddArgPanel side="con" onAdd={arg => onAddArg("con", arg)} user={user} onSignIn={onSignIn} />
          <button onClick={() => setTab("pro")}
            style={{ ...sans, fontSize: 12, color: C.pro, background: "none", border: `1px solid ${C.pro}`, borderRadius: 10, padding: "10px", cursor: "pointer", marginTop: 8, opacity: 0.85 }}>
            ← See the case For
          </button>
        </div>
      )}
    </div>
  );
}

function DebateView({ topic, onBack, onArgUpdate, onForkCreated, onOpenProfile, onRep, user, isAdmin, onDelete, onSignIn }) {
  const [args, setArgs] = useState(topic.args);
  const [rebuttals, setRebuttals] = useState(topic.rebuttals || []);
  const [forkTarget, setForkTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [narrow, setNarrow] = useState(false);
  const containerRef = useRef(null);
  const { pro, con } = calcScore(args);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setNarrow(e.contentRect.width < 620);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const argRefs = useRef({});
  const rebuttalCardRefs = useRef({});

  const addArg = (side, arg) => {
    const next = { ...args, [side]: [...args[side], arg] };
    setArgs(next); onArgUpdate(topic.id, next);
    onRep(SESSION_USER.name, 15);
  };

  const addRebuttal = (argId, originalSide, text, source) => {
    const rebuttalSide = originalSide === "pro" ? "con" : "pro";
    setRebuttals(prev => [...prev, { id: Date.now(), argId, rebuttalSide, author: SESSION_USER.name, votes: 0, text, source }]);
    onRep(SESSION_USER.name, 15);
  };

  const flashEl = (el, color) => {
    if (!el) return;
    el.style.transition = "box-shadow 0.2s";
    el.style.boxShadow = `0 0 0 3px ${color}`;
    setTimeout(() => { if (el) el.style.boxShadow = "none"; }, 1500);
  };

  const scrollToArg = (argId) => {
    const el = argRefs.current[argId];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    flashEl(el, "#7a9e7e88");
  };

  const scrollToRebuttalCard = (rebuttalId) => {
    const el = rebuttalCardRefs.current[rebuttalId];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    flashEl(el, "#a0606088");
  };

  const findArg = (argId) => [...args.pro, ...args.con].find(a => a.id === argId);
  const proRebuttalCards = rebuttals.filter(r => r.rebuttalSide === "pro");
  const conRebuttalCards = rebuttals.filter(r => r.rebuttalSide === "con");

  return (
    <div ref={containerRef} style={{ maxWidth: 920, margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} style={{ ...sans, fontSize: 11, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
        ← All truths
      </button>

      {topic.forkedFrom && (
        <div style={{ borderLeft: `3px solid ${C.pro}`, paddingLeft: 12, marginBottom: 20, background: "#fdf9f3", borderRadius: "0 8px 8px 0", padding: "10px 12px" }}>
          <p style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>⑃ Forked from a comment by {topic.forkedAuthor}</p>
          <p style={{ ...serif, fontSize: 13, color: C.textSub, fontStyle: "italic", marginTop: 4 }}>"{topic.forkedFrom.slice(0, 120)}…"</p>
        </div>
      )}

      <p style={{ ...sans, fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{topic.category}</p>
      <h1 style={{ ...serif, fontSize: 22, color: C.text, lineHeight: 1.4, margin: "6px 0 6px" }}>"{topic.title}"</h1>
      <p style={{ ...sans, fontSize: 13, color: C.textSub, marginBottom: 20 }}>{topic.summary}</p>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
        <RadialBalance pro={pro} con={con} />
        <div style={{ flex: 1 }}>
          <p style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Community lean</p>
          <DotMatrix pro={pro} con={con} />
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ ...sans, fontSize: 11, color: C.textSub }}><span style={{ display: "inline-block", width: 8, height: 8, background: C.pro, borderRadius: 2, marginRight: 4 }} />For · {args.pro.length} args</span>
            <span style={{ ...sans, fontSize: 11, color: C.textSub }}><span style={{ display: "inline-block", width: 8, height: 8, background: C.con, borderRadius: 2, marginRight: 4 }} />Against · {args.con.length} args</span>
            {rebuttals.length > 0 && <span style={{ ...sans, fontSize: 11, color: C.textSub }}>⇄ {rebuttals.length} rebuttal{rebuttals.length !== 1 ? "s" : ""}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20, padding: "7px 12px", background: "#f5f2ee", borderRadius: 8, flexWrap: "wrap" }}>
        <span style={{ ...sans, fontSize: 10, color: C.textSub }}><strong>Reply</strong> — same-side elaboration</span>
        <span style={{ ...sans, fontSize: 10, color: C.textMuted }}>·</span>
        <span style={{ ...sans, fontSize: 10, color: C.textSub }}><strong>⇄ Rebut</strong> — cross-aisle challenge: preview stays here, full card appears in the opposing column</span>
      </div>

      {narrow ? (
        // ── Mobile: tabbed view ──────────────────────────────────────────
        <MobileTabs
          args={args} rebuttals={rebuttals}
          argRefs={argRefs} rebuttalCardRefs={rebuttalCardRefs}
          pro={pro} con={con}
          onFork={setForkTarget} onShare={setShareTarget}
          onOpenProfile={onOpenProfile} onRep={onRep}
          onAddRebuttal={addRebuttal}
          onScrollToRebuttalCard={scrollToRebuttalCard}
          onScrollToArg={scrollToArg}
          findArg={findArg}
          proRebuttalCards={proRebuttalCards}
          conRebuttalCards={conRebuttalCards}
          onAddArg={addArg}
          user={user} isAdmin={isAdmin} onSignIn={onSignIn} onDelete={onDelete}
        />
      ) : (
        // ── Desktop: side-by-side columns ────────────────────────────────
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <p style={{ ...sans, fontSize: 10, color: C.pro, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>For</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {args.pro.map(a => (
                <ArgCard key={a.id} arg={a} side="pro" rebuttals={rebuttals}
                  cardRef={el => { argRefs.current[a.id] = el; }}
                  onFork={setForkTarget} onShare={setShareTarget}
                  onOpenProfile={onOpenProfile} onRep={onRep}
                  onAddRebuttal={addRebuttal}
                  onScrollToRebuttalCard={scrollToRebuttalCard}
                  user={user} isAdmin={isAdmin} onSignIn={onSignIn} onDelete={onDelete} />
              ))}
              {proRebuttalCards.map(r => (
                <RebuttalCard key={r.id} rebuttal={r} originalArg={findArg(r.argId)}
                  cardRef={el => { rebuttalCardRefs.current[r.id] = el; }}
                  onScrollToOriginal={() => scrollToArg(r.argId)}
                  onShare={setShareTarget} onFork={setForkTarget}
                  onOpenProfile={onOpenProfile} onRep={onRep}
                  isAdmin={isAdmin} onDelete={onDelete} />
              ))}
            </div>
            <AddArgPanel side="pro" onAdd={arg => addArg("pro", arg)} user={user} onSignIn={onSignIn} />
          </div>
          <div>
            <p style={{ ...sans, fontSize: 10, color: C.con, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Against</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {args.con.map(a => (
                <ArgCard key={a.id} arg={a} side="con" rebuttals={rebuttals}
                  cardRef={el => { argRefs.current[a.id] = el; }}
                  onFork={setForkTarget} onShare={setShareTarget}
                  onOpenProfile={onOpenProfile} onRep={onRep}
                  onAddRebuttal={addRebuttal}
                  onScrollToRebuttalCard={scrollToRebuttalCard}
                  user={user} isAdmin={isAdmin} onSignIn={onSignIn} onDelete={onDelete} />
              ))}
              {conRebuttalCards.map(r => (
                <RebuttalCard key={r.id} rebuttal={r} originalArg={findArg(r.argId)}
                  cardRef={el => { rebuttalCardRefs.current[r.id] = el; }}
                  onScrollToOriginal={() => scrollToArg(r.argId)}
                  onShare={setShareTarget} onFork={setForkTarget}
                  onOpenProfile={onOpenProfile} onRep={onRep}
                  isAdmin={isAdmin} onDelete={onDelete} />
              ))}
            </div>
            <AddArgPanel side="con" onAdd={arg => addArg("con", arg)} user={user} onSignIn={onSignIn} />
          </div>
        </div>
      )}

      {forkTarget && <ForkModal sourceArg={forkTarget} onConfirm={t => { onForkCreated(t); setForkTarget(null); }} onClose={() => setForkTarget(null)} />}
      {shareTarget && <ShareSheet text={shareTarget.text} author={shareTarget.author} onClose={() => setShareTarget(null)} />}
    </div>
  );
}

// ── Topic card ────────────────────────────────────────────────────────────
function TopicCard({ topic, onClick, isAdmin, onDelete }) {
  const { pro, con } = calcScore(topic.args);
  const totalArgs = topic.args.pro.length + topic.args.con.length;
  const rebuttalCount = (topic.rebuttals || []).length;
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onClick} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px", textAlign: "left", cursor: "pointer", width: "100%", transition: "box-shadow 0.2s", display: "block" }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <RadialBalance pro={pro} con={con} size={60} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
              <span style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{topic.category}</span>
              {topic.hot && <span style={{ ...sans, fontSize: 9, background: "#fdf3e7", color: C.pro, padding: "1px 7px", borderRadius: 10 }}>trending</span>}
              {topic.forkedFrom && <span style={{ ...sans, fontSize: 9, background: "#fdf3e7", color: C.con, padding: "1px 7px", borderRadius: 10 }}>⑃ fork</span>}
            </div>
            <p style={{ ...serif, fontSize: 14.5, color: C.text, lineHeight: 1.5, marginBottom: 8 }}>{topic.title}</p>
            <PullBar pro={pro} con={con} />
            <p style={{ ...sans, fontSize: 10, color: C.textMuted, marginTop: 6 }}>
              {totalArgs} argument{totalArgs !== 1 ? "s" : ""}
              {rebuttalCount > 0 && ` · ⇄ ${rebuttalCount} rebuttal${rebuttalCount !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </button>
      {isAdmin && (
        <button
          onClick={e => { e.stopPropagation(); if (window.confirm("Delete this truth and all its arguments?")) onDelete("topic", topic.id); }}
          style={{ position: "absolute", top: 10, right: 10, ...sans, fontSize: 10, color: "#c0504d", background: "#fff", border: "1px solid #e8c8c8", borderRadius: 6, padding: "3px 10px", cursor: "pointer", zIndex: 2 }}>
          🗑 Delete
        </button>
      )}
    </div>
  );
}

// ── Home view ─────────────────────────────────────────────────────────────
function HomeView({ topics, onSelect, onNewTopic, onInvite, user, isAdmin, onDelete, onSignIn }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("trending");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    let list = topics;
    if (category !== "All") list = list.filter(t => t.category === category);
    if (search.trim()) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.summary || "").toLowerCase().includes(search.toLowerCase()));
    if (sort === "trending") list = [...list].sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
    if (sort === "active")   list = [...list].sort((a, b) => (b.args.pro.length + b.args.con.length) - (a.args.pro.length + a.args.con.length));
    if (sort === "contested") list = [...list].sort((a, b) => {
      const sa = calcScore(a.args), sb = calcScore(b.args);
      return Math.abs(sa.pro - sa.con) / sa.total - Math.abs(sb.pro - sb.con) / sb.total;
    });
    return list;
  }, [topics, search, category, sort]);

  const main  = filtered.filter(t => !t.forkedFrom);
  const forks = filtered.filter(t => t.forkedFrom);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ ...serif, fontSize: 28, color: C.text, margin: 0 }}>Truths</h1>
          <p style={{ ...sans, fontSize: 13, color: C.textSub, marginTop: 4 }}>See where the world stands. Add your voice.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={onInvite} style={{ ...sans, fontSize: 12, background: "#f0ebe3", color: C.textMid, padding: "9px 14px", borderRadius: 10, cursor: "pointer", border: "none" }}>Invite ↗</button>
          <button onClick={() => user ? setShowForm(true) : onSignIn()} style={{ ...sans, fontSize: 12, background: C.text, color: "#fff", padding: "9px 18px", borderRadius: 10, cursor: "pointer", border: "none" }}>{user ? "+ New Truth" : "Sign in to post"}</button>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search debates…"
        style={{ ...sans, fontSize: 13, width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", background: "#fff", outline: "none", marginBottom: 10, boxSizing: "border-box" }} />

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{ ...sans, fontSize: 11, padding: "5px 12px", borderRadius: 20, border: "1px solid", cursor: "pointer", transition: "all 0.15s", background: category === c ? C.text : "#fff", color: category === c ? "#fff" : C.textSub, borderColor: category === c ? C.text : C.border }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
        {[["trending","Trending"],["active","Most active"],["contested","Most contested"]].map(([v, l]) => (
          <button key={v} onClick={() => setSort(v)}
            style={{ ...sans, fontSize: 11, padding: "4px 12px", borderRadius: 20, border: "1px solid", cursor: "pointer", background: sort === v ? "#fdf3e7" : "transparent", color: sort === v ? C.pro : C.textMuted, borderColor: sort === v ? C.pro : "transparent" }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {main.length === 0 && <p style={{ ...sans, fontSize: 13, color: C.textMuted, textAlign: "center", padding: "24px 0" }}>No debates match your filters.</p>}
        {main.map(t => <TopicCard key={t.id} topic={t} onClick={() => onSelect(t)} isAdmin={isAdmin} onDelete={onDelete} />)}
      </div>

      {forks.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>⑃ Forks & sub-threads</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {forks.map(t => <TopicCard key={t.id} topic={t} onClick={() => onSelect(t)} isAdmin={isAdmin} onDelete={onDelete} />)}
          </div>
        </>
      )}

      <p style={{ ...serif, fontStyle: "italic", fontSize: 11, color: C.textMuted, textAlign: "center", marginTop: 48 }}>antilog · Civil discourse for everyone</p>
      {showForm && <NewTopicModal onAdd={onNewTopic} onClose={() => setShowForm(false)} />}
    </div>
  );
}

// ── Nav rep bar ───────────────────────────────────────────────────────────
function NavRepBar({ rep, onInvite }) {
  const tier = repTier(rep);
  const pct = Math.min(100, (rep / tier.next) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={onInvite} style={{ ...sans, fontSize: 11, color: C.textSub, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>Invite</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8e0d4", color: C.textSub, display: "flex", alignItems: "center", justifyContent: "center", ...sansMed, fontSize: 11 }}>{SESSION_USER.avatar}</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...sans, fontSize: 11, color: C.textMid }}>You</span>
            <span style={{ ...sans, fontSize: 9, color: tier.color, background: tier.bg, padding: "1px 6px", borderRadius: 10 }}>{tier.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <div style={{ width: 60, height: 3, background: "#ede8e1", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: tier.color, borderRadius: 3, transition: "width 0.5s" }} />
            </div>
            <span style={{ ...sans, fontSize: 9, color: C.textMuted }}>{rep}pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────
function Nav({ sessionRep, onInvite, onHome, user }) {
  const { mobile, ref } = useIsMobile();
  const tier = repTier(sessionRep);
  const pct = Math.min(100, (sessionRep / tier.next) * 100);

  return (
    <nav ref={ref} style={{ background: "#faf8f5", borderBottom: `1px solid ${C.border}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 40 }}>
      {mobile ? (
        // Narrow: title left, controls right, single row
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onHome} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <span style={{ ...serif, fontSize: 28, color: C.text, lineHeight: 1.1 }}>antilog</span>
            <span style={{ ...sans, fontSize: 10, color: C.textMuted, letterSpacing: "0.04em" }}>two sides to every truth</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button onClick={onInvite} style={{ ...sans, fontSize: 11, color: C.textSub, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>Invite</button>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8e0d4", color: C.textSub, display: "flex", alignItems: "center", justifyContent: "center", ...sansMed, fontSize: 11 }}>{user ? (user.user_metadata?.full_name?.[0] ?? "U") : SESSION_USER.avatar}</div>
          </div>
        </div>
      ) : (
        // Wide: 3-col with centered title
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 140 }} />
          <button onClick={onHome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <span style={{ ...serif, fontSize: 36, color: C.text, lineHeight: 1.1 }}>antilog</span>
            <span style={{ ...sans, fontSize: 11, color: C.textMuted, letterSpacing: "0.04em" }}>two sides to every truth</span>
          </button>
          <div style={{ width: 140, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={onInvite} style={{ ...sans, fontSize: 11, color: C.textSub, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>Invite</button>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8e0d4", color: C.textSub, display: "flex", alignItems: "center", justifyContent: "center", ...sansMed, fontSize: 11 }}>{user ? (user.user_metadata?.full_name?.[0] ?? "U") : SESSION_USER.avatar}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ ...sans, fontSize: 11, color: C.textMid }}>{user ? (user.user_metadata?.full_name?.split(" ")[0] ?? "You") : "You"}</span>
                    <span style={{ ...sans, fontSize: 9, color: tier.color, background: tier.bg, padding: "1px 6px", borderRadius: 10 }}>{tier.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <div style={{ width: 60, height: 3, background: "#ede8e1", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: tier.color, borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                    <span style={{ ...sans, fontSize: 9, color: C.textMuted }}>{sessionRep}pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [topics, setTopics] = useState(seedTopics);
  const [active, setActive] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    sb.auth().then(auth => {
      if (!auth) return;
      auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
      const { data: { subscription } } = auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
      return () => subscription.unsubscribe();
    });
  }, []);

  // ── Load topics from Supabase ─────────────────────────────────────────────
  useEffect(() => {
    async function loadTopics() {
      setLoading(true);
      try {
        const c = await sbPromise;
        if (!c) throw new Error("Supabase unavailable");
        const { data, error } = await c
          .from("topics")
          .select("*, arguments(*, replies:arguments!parent_id(*)), rebuttals(*)")
          .order("created_at", { ascending: false });
        if (error) throw error;

        if (data && data.length > 0) {
          // Shape Supabase rows into the app's topic shape
          const shaped = data.map(t => ({
            id: t.id,
            title: t.title,
            summary: t.summary,
            category: t.category,
            hot: t.hot,
            forkedFrom: t.forked_from,
            forkedAuthor: t.forked_author,
            rebuttals: (t.rebuttals || []).map(r => ({
              id: r.id, argId: r.arg_id, rebuttalSide: r.rebuttal_side,
              author: r.author_name, votes: r.votes, text: r.text, source: r.source,
            })),
            args: {
              pro: (t.arguments || [])
                .filter(a => a.side === "pro" && !a.parent_id)
                .map(a => ({
                  id: a.id, author: a.author_name, votes: a.votes, text: a.text, source: a.source,
                  replies: (a.replies || []).map(r => ({
                    id: r.id, author: r.author_name, votes: r.votes, text: r.text, source: r.source,
                  })),
                })),
              con: (t.arguments || [])
                .filter(a => a.side === "con" && !a.parent_id)
                .map(a => ({
                  id: a.id, author: a.author_name, votes: a.votes, text: a.text, source: a.source,
                  replies: (a.replies || []).map(r => ({
                    id: r.id, author: r.author_name, votes: r.votes, text: r.text, source: r.source,
                  })),
                })),
            },
          }));
          setTopics(shaped);
        }
      } catch (err) {
        console.warn("Supabase load failed, using seed data:", err.message);
        // Falls back to seedTopics already in state
      }
      setLoading(false);
    }
    loadTopics();
  }, []);

  // ── Add topic ─────────────────────────────────────────────────────────────
  const addTopic = useCallback(async (t) => {
    // Optimistic update
    setTopics(ts => [t, ...ts]);
    try {
      const c = await sbPromise;
      if (!c) throw new Error("Supabase unavailable");
      const { data, error } = await c.from("topics").insert({
        title: t.title, summary: t.summary, category: t.category,
        hot: false, created_by: user?.id ?? null,
        forked_from: t.forkedFrom ?? null, forked_author: t.forkedAuthor ?? null,
      }).select().single();
      if (error) throw error;
      // Replace temp topic with server-assigned id
      setTopics(ts => ts.map(topic => topic.id === t.id ? { ...topic, id: data.id } : topic));
    } catch (err) {
      console.warn("Failed to save topic:", err.message);
    }
  }, [user]);

  // ── Update args (add argument or reply) ───────────────────────────────────
  const handleArgUpdate = useCallback(async (topicId, newArgs, newArg, side, parentId = null) => {
    setTopics(ts => ts.map(t => t.id === topicId ? { ...t, args: newArgs } : t));
    if (!newArg) return;
    try {
      const c = await sbPromise;
      if (c) await c.from("arguments").insert({
        topic_id: topicId, side, parent_id: parentId ?? null,
        author_name: newArg.author, text: newArg.text, source: newArg.source ?? null,
        votes: 0, created_by: user?.id ?? null,
      });
    } catch (err) {
      console.warn("Failed to save argument:", err.message);
    }
  }, [user]);

  // ── Fork ──────────────────────────────────────────────────────────────────
  const handleFork = useCallback((forked) => {
    addTopic(forked);
    setActive(null);
  }, [addTopic]);

  // ── Vote ──────────────────────────────────────────────────────────────────
  const handleRep = useCallback(async (author, delta, targetId, targetType) => {
    // Votes persist to DB; rep is derived
    if (targetId && user) {
      try {
        const c = await sbPromise;
        if (c) await c.from("votes").upsert({
          user_id: user.id, target_id: String(targetId),
          target_type: targetType ?? "argument", value: delta > 0 ? 1 : -1,
        }, { onConflict: "user_id,target_id" });
      } catch (err) {
        console.warn("Vote save failed:", err.message);
      }
    }
  }, [user]);

  const handleOpenProfile = useCallback((author, baseData) => {
    setProfileTarget({ author, userData: baseData });
  }, []);

  const sessionRep = user
    ? (USERS[user.user_metadata?.full_name]?.rep ?? 0)
    : SESSION_USER.rep;

  // Admin emails — add yours here
  const ADMIN_EMAILS = ["vinoly@gmail.com"]; // ← replace with your Google account email
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const handleDelete = useCallback(async (type, id) => {
    // Optimistic removal from local state
    if (type === "topic") {
      setTopics(ts => ts.filter(t => t.id !== id));
    }
    // Supabase delete — cascade handles child rows
    try {
      const table = type === "topic" ? "topics" : type === "argument" ? "arguments" : "rebuttals";
      const c = await sbPromise;
      if (c) await c.from(table).delete().eq("id", id);
    } catch (err) {
      console.warn("Delete failed:", err.message);
    }
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ ...serif, fontSize: 18, color: C.textMuted }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav sessionRep={sessionRep} onInvite={() => setShowInvite(true)} onHome={() => setActive(null)} user={user} />

      {active
        ? <DebateView topic={active} onBack={() => setActive(null)} onArgUpdate={handleArgUpdate} onForkCreated={handleFork} onOpenProfile={handleOpenProfile} onRep={handleRep} user={user} isAdmin={isAdmin} onDelete={handleDelete} onSignIn={() => setShowInvite(true)} />
        : <HomeView topics={topics} onSelect={t => setActive(t)} onNewTopic={addTopic} onInvite={() => setShowInvite(true)} user={user} isAdmin={isAdmin} onDelete={handleDelete} onSignIn={() => setShowInvite(true)} />
      }

      {profileTarget && <ProfileModal author={profileTarget.author} userData={profileTarget.userData} onClose={() => setProfileTarget(null)} />}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} user={user} />}
    </div>
  );
}
