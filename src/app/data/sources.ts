export type Source = {
    key: string;
    name: string;
    icon?: string;
    iconScale?: number;
    role: string;
    dates: string;
    summary: string;
    href?: string;
    group?: string[];
    points?: string[];
};

export const SOURCES: Record<string, Source> = {
    openEndedness: {
        key: "openEndedness",
        name: "Multi-agent open-endedness",
        role: "Research question",
        dates: "Current focus",
        summary:
            "agents endlessly co-evolving, competing, and collaborating to create novel complexity without a central goal.",
    },
    complementarity: {
        key: "complementarity",
        name: "Human-AI complementarity",
        role: "Research question",
        dates: "Current focus",
        summary:
            "What makes a human-AI relationship strengthen both sides' agency over time, instead of turning help into dependence?",
    },
    agentFoundations: {
        key: "agentFoundations",
        name: "Agent foundations",
        role: "Research question",
        dates: "Current focus",
        summary:
            "What even is an agent, and what would it mean for its goals to be about the world? Better explored here.",
        href: "https://www.lesswrong.com/w/agent-foundations",
    },
    entrepreneursFirst: {
        key: "entrepreneursFirst",
        name: "Entrepreneurs First",
        role: "Founder in Residence",
        dates: "Jul–Oct 2026",
        summary:
            "Moved fast and broke things in SF. Worked on program synthesis for interp and multi-agent reputation systems.",
        href: "https://www.joinef.com/",
    },
    fields: {
        key: "fields",
        name: "Several different fields",
        role: "Earlier work",
        dates: "Earlier work",
        summary: "",
        group: ["aiSafety", "palantir", "augmentum", "quantFinance"],
    },
    aiSafety: {
        key: "aiSafety",
        name: "AI Safety",
        role: "",
        dates: "",
        summary: "",
        points: ["Work on persona vectors and interpretability. Completed BlueDot TAIS course."],
    },
    palantir: {
        key: "palantir",
        name: "Palantir Winter Tech Fellow",
        role: "",
        dates: "",
        summary: "",
        points: ["Software solutions via AIP"],
    },
    augmentum: {
        key: "augmentum",
        name: "Augmentum Fintech",
        role: "",
        dates: "",
        summary: "",
        points: ["Automated deal screening/sourcing at Europe's leading fintech VC fund"],
    },
    quantFinance: {
        key: "quantFinance",
        name: "Quantitative Finance",
        role: "",
        dates: "",
        summary: "",
        points: [
            "Spring intern @ Optiver",
            "Risk Forecasting @ MCD Capital",
            "RL bots for intraday trading (BSc. thesis)",
        ],
    },
};
