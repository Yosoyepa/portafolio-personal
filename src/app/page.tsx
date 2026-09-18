import AppProviders from "@/components/providers/AppProviders";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Metrics from "@/components/Metrics";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <AppProviders>
      <Navbar />
      <main id="contenido" className="portfolio-universe">
        <Hero />
        <Marquee />
        <Metrics />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Certifications />
        <Contact />
      </main>
      <Footer />
      {/* Grano global */}
      <div className="noise" aria-hidden />
    </AppProviders>
  );
}
