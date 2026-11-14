"use client";
import { motion } from "motion/react";
import Cited from "./citation";
import Container from "./container";
import type { PondStats } from "./koi-pond/koi-pond";

const SOCIALS = [
    { label: "github", href: "https://github.com/j-hussain" },
    { label: "linkedin", href: "https://www.linkedin.com/in/jabir-hussain/" },
];

const UNDERLINE =
    "underline decoration-[color-mix(in_srgb,var(--foreground-color)_35%,transparent)] decoration-1 underline-offset-[5px] outline-none transition-opacity duration-150 hover:decoration-foreground focus-visible:decoration-foreground";

const QuoteLines = () => (
    <>
        making sense of a changing world,
        <br />
        one question at a time
        <span
            aria-hidden="true"
            className="ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-blink bg-foreground motion-reduce:animate-none"
        />
    </>
);

const Socials = ({ className }: { className?: string }) => (
    <p className={className}>
        {SOCIALS.map(({ label, href }, i) => (
            <span key={label}>
                {i > 0 && <span className="opacity-40"> / </span>}
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${UNDERLINE} opacity-60 hover:opacity-100 focus-visible:opacity-100`}
                >
                    {label}
                </a>
            </span>
        ))}
    </p>
);

const FrontPage = ({ stats }: { stats: PondStats }) => (
    <>
        {mobilePage()}
        {desktopPage({ stats })}
    </>
);

const desktopPage = ({ stats }: { stats: PondStats }) => {
    return (
        <Container
            as="header"
            className="relative flex h-full flex-col justify-end gap-10 max-lg:hidden bg-transparent pb-32 pt-32 text-foreground [@media(max-height:720px)]:gap-6 [@media(max-height:720px)]:pb-12 [@media(max-height:720px)]:pt-20"
        >
            {stats.koi > 0 && (
                <div
                    data-koi-avoid
                    aria-hidden="true"
                    className="absolute right-6 top-8 font-geistMono text-[11px] leading-relaxed tabular-nums lg:right-[20vw]"
                >
                    <div className="opacity-[0.32]">{stats.koi}</div>
                    {/* The pellet count flashes each time it changes, tying a click or a bite to the number. */}
                    <motion.div
                        key={stats.pellets}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0.32 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {stats.pellets}
                    </motion.div>
                </div>
            )}
            <motion.blockquote
                data-koi-avoid
                className="font-geistMono text-[14px] lowercase leading-relaxed tracking-[0.02em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.4 }}
            >
                <QuoteLines />
            </motion.blockquote>
            <motion.div
                data-koi-avoid
                className="cited-prose max-w-[54rem] font-geistMono text-[15px] leading-[max(22px,3vh)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <h1>Hey, I&apos;m Jabir.</h1>
                <p>Independent researcher and builder, threading the needle of AI and societal co-evolution.</p>
                <p>
                    I&apos;m currently interested in <Cited source="openEndedness">multi-agent open-endedness</Cited>,{" "}
                    <Cited source="complementarity">human-AI complementarity</Cited> and{" "}
                    <Cited source="agentFoundations">agent foundations</Cited>.
                </p>
                <p>
                    Before this, <Cited source="entrepreneursFirst">Entrepreneurs First (FiR)</Cited>, and worked across{" "}
                    <Cited source="fields">several different fields</Cited>.
                </p>
                <Socials className="mt-[1.5vh]" />
            </motion.div>
        </Container>
    );
};

// The same contextual explanations are available by tap on mobile.
const MobileLink = ({ source, children }: { source: string; children: React.ReactNode }) => (
    <Cited source={source}>{children}</Cited>
);

const mobilePage = () => {
    return (
        // Top padding clears the floating nav pill.
        <Container
            as="header"
            className="flex h-full flex-col justify-end gap-8 lg:hidden bg-transparent pb-12 pt-28 font-geistMono text-foreground [@media(max-height:640px)]:gap-5 [@media(max-height:640px)]:pb-8"
        >
            <motion.blockquote
                data-koi-avoid
                className="text-[13px] lowercase leading-relaxed tracking-[0.02em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.4 }}
            >
                <QuoteLines />
            </motion.blockquote>
            <motion.div
                data-koi-avoid
                className="flex flex-col gap-3 text-[14px] leading-[1.6]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <h1>Hey, I&apos;m Jabir.</h1>
                <p>Independent researcher and builder, threading the needle of AI and societal co-evolution.</p>
                <p>
                    I&apos;m currently interested in{" "}
                    <MobileLink source="openEndedness">multi-agent open-endedness</MobileLink>,{" "}
                    <MobileLink source="complementarity">human-AI complementarity</MobileLink> and{" "}
                    <MobileLink source="agentFoundations">agent foundations</MobileLink>.
                </p>
                <p>
                    Before this, <MobileLink source="entrepreneursFirst">Entrepreneurs First (FiR)</MobileLink>, and
                    worked across <MobileLink source="fields">several different fields</MobileLink>.
                </p>
                <Socials className="mt-2" />
            </motion.div>
        </Container>
    );
};

export default FrontPage;
