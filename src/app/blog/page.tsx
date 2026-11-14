import TopNav from "../components/top-nav";
import MobileNav from "../components/mobile-nav";
export const metadata = { title: "Blog · Jabir Hussain" };
export default function Blog() {
    return (
        <>
            <TopNav />
            <MobileNav />
            <main className="mx-auto max-w-2xl px-6 py-32 font-geistSans">
                <h1 className="text-3xl mb-8">Blog</h1>
                <p className="text-foreground/70">Essays and research notes will appear here.</p>
            </main>
        </>
    );
}
