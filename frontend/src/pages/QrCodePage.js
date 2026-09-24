import { useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { Button } from "../components/ui/button";
import { Download, Printer, ArrowRight } from "lucide-react";

const BASE = "https://theshirtlesshandyman.com";

const QR_CODES = [
  {
    id: "color-preview",
    title: "Color Preview Tool",
    url: `${BASE}/color-preview.html?utm_source=qr&utm_medium=print&utm_campaign=color_preview`,
    tagline: "Scan to see this wall in microcement",
    context: "Perfect for job sites, yard signs, and open houses. Homeowners point their phone, pick a tone, and text me. QR-sourced leads are tagged separately in your Airtable so you know they came from a scan.",
  },
  {
    id: "text-me",
    title: "Text Me Directly",
    url: "sms:+15042644919?body=Hi%20Ryan%20-%20saw%20your%20QR%20code%20and%20want%20to%20talk%20about%20a%20project.",
    tagline: "Scan to text Ryan — 504-264-4919",
    context: "Business cards, invoices, thank-you notes. Opens their texting app pre-filled with a message that starts with 'saw your QR code' so you know they scanned.",
  },
  {
    id: "main-site",
    title: "Main Site",
    url: `${BASE}/?utm_source=qr&utm_medium=print&utm_campaign=main_site`,
    tagline: "The Shirtless Handyman — Seamless surfaces, New Orleans",
    context: "General-purpose — social profiles, print ads, truck decal. Any lead form they fill out from this scan gets tagged as QR-sourced in Airtable.",
  },
];

function QrCard({ item }) {
  const canvasWrapperRef = useRef(null);

  const downloadPng = () => {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${item.id}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <article
      className="qr-card bg-white rounded-2xl border border-border p-6 md:p-8 flex flex-col gap-4"
      data-testid={`qr-card-${item.id}`}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-1.5">
          {item.title}
        </p>
        <h2
          className="text-xl md:text-2xl font-light tracking-tight text-foreground leading-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {item.tagline}
        </h2>
      </div>

      <div
        ref={canvasWrapperRef}
        className="qr-canvas-wrap flex justify-center bg-[#F5F1EA] rounded-xl p-6 border border-border/40"
      >
        <QRCodeCanvas
          value={item.url}
          size={512}
          level="H"
          marginSize={2}
          bgColor="#F5F1EA"
          fgColor="#0E0E0E"
          style={{ width: "min(100%, 320px)", height: "auto" }}
        />
      </div>

      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground break-all">
        {item.url}
      </p>

      <p className="text-sm text-foreground/70 leading-relaxed">
        {item.context}
      </p>

      <div className="flex gap-2 no-print">
        <Button
          onClick={downloadPng}
          className="h-10 rounded-full bg-[#1A3C34] text-white hover:bg-[#0F2A24] text-sm"
          data-testid={`qr-download-${item.id}`}
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>
    </article>
  );
}

export default function QrCodePage() {
  const items = useMemo(() => QR_CODES, []);

  return (
    <>
      <SeoHead
        title="QR Codes — The Shirtless Handyman"
        description="Printable QR codes for job sites, business cards, and yard signs."
        canonical={`${BASE}/qr`}
      >
        <meta name="robots" content="noindex, nofollow" />
      </SeoHead>

      {/* Print-only styles — hide everything except the QR grid when printing */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          nav, header, footer { display: none !important; }
          .qr-print-container { padding: 0 !important; }
          .qr-card { break-inside: avoid; page-break-inside: avoid; border: 1px solid #ddd !important; box-shadow: none !important; }
          .qr-canvas-wrap { background: white !important; border: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-background" data-testid="qr-page">
        <div className="no-print">
          <Navbar />
        </div>

        {/* Header */}
        <section className="pt-32 pb-10 px-6 md:px-12 bg-[#0E0E0E] text-white no-print">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-3">
              Print + share
            </p>
            <h1
              className="text-4xl sm:text-5xl font-light tracking-tight leading-[1.05] mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
              data-testid="qr-page-h1"
            >
              QR codes for the road.
            </h1>
            <p className="text-base text-white/60 max-w-2xl leading-relaxed">
              Download or print any of these. Stick them on job-site signs, business cards, invoices, or the truck. Scanned QRs open the tool or start a text — no typing required.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="h-10 rounded-full border-white/20 text-white hover:bg-white/10 text-sm"
                data-testid="qr-print-all-btn"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print this page
              </Button>
              <a href="/color-preview.html">
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-white/20 text-white hover:bg-white/10 text-sm"
                >
                  Preview the tool
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* QR grid */}
        <section className="py-14 px-6 md:px-12 qr-print-container">
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <QrCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Usage tips */}
        <section className="pb-20 px-6 md:px-12 no-print">
          <div className="max-w-3xl mx-auto bg-[#F5F1EA] rounded-2xl p-8 border border-border/40">
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-3">
              Tips
            </p>
            <ul className="space-y-2.5 text-sm text-foreground/70 leading-relaxed">
              <li>• <span className="text-foreground">Job-site signs</span> — 8×8 inches or larger. Print the Color Preview QR with the tagline underneath.</li>
              <li>• <span className="text-foreground">Business cards</span> — Text-me QR on the back at 1 inch square minimum.</li>
              <li>• <span className="text-foreground">Truck decal / yard sign</span> — Main Site or Color Preview QR at 6+ inches, high contrast against the background.</li>
              <li>• <span className="text-foreground">Test scan first</span> — Different phones handle QRs slightly differently. Always test with an iPhone camera and an Android camera before printing 100 of them.</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
