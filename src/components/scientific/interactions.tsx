"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";

export function Term({ children, definition }: { children: ReactNode; definition: string }) {
    const id = useId();
    const [open, setOpen] = useState(false);
    return (
        <span className="sci-term" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button
                type="button"
                aria-expanded={open}
                aria-controls={id}
                aria-describedby={open ? id : undefined}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onClick={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") setOpen(false);
                }}
            >
                {children}
            </button>
            <span id={id} role="tooltip" hidden={!open}>
                {definition}
            </span>
        </span>
    );
}

const LinkContext = createContext<{ active: string | null; select: (id: string | null) => void }>({
    active: null,
    select: () => {},
});
export function LinkedEquation({ children }: { children: ReactNode }) {
    const [active, select] = useState<string | null>(null);
    return (
        <LinkContext.Provider value={{ active, select }}>
            <div
                className="sci-linked"
                onKeyDown={(e) => {
                    if (e.key === "Escape") select(null);
                }}
            >
                {children}
            </div>
        </LinkContext.Provider>
    );
}
export function LinkedTerm({ term, children }: { term: string; children: ReactNode }) {
    const { active, select } = useContext(LinkContext);
    return (
        <button
            type="button"
            className="sci-linked-term"
            data-active={active === term}
            aria-pressed={active === term}
            onPointerEnter={(e) => {
                if (e.pointerType === "mouse") select(term);
            }}
            onFocus={() => select(term)}
            onClick={() => select(term)}
        >
            {children}
        </button>
    );
}
export function LinkedMark({ term, children }: { term: string; children: ReactNode }) {
    const { active } = useContext(LinkContext);
    return (
        <span className="sci-linked-mark" data-active={active === term}>
            {children}
        </span>
    );
}

export function PredictReveal({
    question,
    choices,
    answer,
    explanation,
}: {
    question: string;
    choices: { id: string; label: string }[];
    answer: string;
    explanation: ReactNode;
}) {
    const id = useId();
    const [choice, setChoice] = useState("");
    const [revealed, setRevealed] = useState(false);
    return (
        <section className="sci-prediction">
            <fieldset disabled={revealed}>
                <legend>{question}</legend>
                {choices.map((c) => (
                    <label key={c.id}>
                        <input
                            type="radio"
                            name={id}
                            value={c.id}
                            checked={choice === c.id}
                            onChange={() => setChoice(c.id)}
                        />{" "}
                        {c.label}
                    </label>
                ))}
            </fieldset>
            <div className="sci-controls">
                <button type="button" disabled={!choice || revealed} onClick={() => setRevealed(true)}>
                    Reveal result
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setChoice("");
                        setRevealed(false);
                    }}
                >
                    Reset prediction
                </button>
            </div>
            <div aria-live="polite">
                {revealed && (
                    <div>
                        <p>
                            {choice === answer ? "Your prediction agrees." : "Compare your prediction with the result."}
                        </p>
                        {explanation}
                    </div>
                )}
            </div>
            <noscript>
                <p>Result (JavaScript is unavailable):</p>
                {explanation}
            </noscript>
        </section>
    );
}

export function Stepper({ steps }: { steps: { title: string; content: ReactNode }[] }) {
    const [step, setStep] = useState(0);
    if (!steps.length) return null;
    return (
        <section className="sci-stepper">
            <div className="sci-step-stack">
                {steps.map((s, i) => (
                    <div
                        key={s.title}
                        style={{ visibility: i === step ? "visible" : "hidden" }}
                        aria-hidden={i !== step}
                        inert={i !== step}
                    >
                        <strong>{s.title}</strong>
                        {s.content}
                    </div>
                ))}
            </div>
            <nav aria-label="Demonstration steps" className="sci-controls">
                <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
                    Previous
                </button>
                <span role="status">
                    Step {step + 1} of {steps.length}
                </span>
                <button type="button" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>
                    Next
                </button>
                <button type="button" onClick={() => setStep(0)}>
                    Reset steps
                </button>
            </nav>
            <noscript>
                {steps.slice(1).map((s) => (
                    <div key={s.title}>
                        <strong>{s.title}</strong>
                        {s.content}
                    </div>
                ))}
            </noscript>
        </section>
    );
}
