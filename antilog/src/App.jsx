import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sbPromise = Promise.resolve(createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
const sb = { auth: async () => (await sbPromise).auth };
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const serif = { fontFamily: "'Lora', Georgia, serif", fontWeight: 400 };
const serifMed = { fontFamily: "'Lora', Georgia, serif", fontWeight: 500 };
const sans = { fontFamily: "'Inter', sans-serif", fontWeight: 400 };
const sansMed = { fontFamily: "'Inter', sans-serif", fontWeight: 500 };

const C = {
  text: "#2e2520", textMid: "#4a3f35", textSub: "#6b5d52",
  textMuted: "#8a7870", textFaint: "#a09488", border: "#e0dbd4",
  bg: "#f7f5f2", card: "#faf8f5", pro: "#7a9e7e", con: "#a06060",
};

const CATEGORIES = ["All", "Economics", "Technology", "Climate", "Health", "Politics", "Society", "Ethics"];

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
  if (score >= 200) return { label: "Contributor", color: "#6a5a4a", bg: "#f0ebe3", next: 500, desc: "Active participant whose arguments regularly earn community support." };
  if (score >= 50)  return { label: "Participant", color: "#6a8a6a", bg: "#edf2ed", next: 200, desc: "Engaged member building a track record in the community." };
  return               { label: "New Voice", color: "#888", bg: "#f0f0f0", next: 50, desc: "Just getting started. Post sourced arguments to build reputation." };
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
    category: "Politics", hot: true, rebuttals: [],
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
    category: "Climate", hot: false, rebuttals: [],
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
    category: "Health", hot: true, rebuttals: [],
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
    category: "Society", hot: true, rebuttals: [],
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
    category: "Ethics", hot: true, rebuttals: [],
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
    category: "Society", hot: false, rebuttals: [],
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
    category: "Health", hot: false, rebuttals: [],
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
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
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
  const [signing
