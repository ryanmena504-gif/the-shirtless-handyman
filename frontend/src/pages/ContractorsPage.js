import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { Button } from "../components/ui/button";
import { CheckCircle, MessageCircle, ArrowRight } from "lucide-react";

const PHONE = "504-264-4919";
const SMS_LINK = "sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20a%20contractor%20interested%20in%20partnering%20on%20a%20project.";

const VALUE_POINTS = [
  { title: "Bill more, same schedule", desc: "Clients pay more for a seamless finish, and it doesn't add time to your job." },
  { title: "You don't touch it", desc: "I do the whole surface install. You keep running your job." },
  { title: "Your name or mine", desc: "Whatever's easier for your client to see on the invoice." },
  { title: "In and out in 2–5 days", desc: "So I'm not holding up your schedule." },
];

const STATS = [
  { metric: "2–5 days", label: "Average surface install time" },
  { metric: "$2K–$8K", label: "Added project value per room" },
  { metric: "15+", label: "Seamless finish types available" },
  { metric: "0", label: "Grout lines. Forever." },
];

export default function ContractorsPage() {
  const navigate = useNavigate();

  return (
    <>
      <SeoHead
        title="For Contractors — Partner With The Shirtless Handyman | Seamless Surface Sub in New Orleans"
        description="I install microcement, tadelakt, venetian plaster, and rockscape as a subcontractor for GCs, remodelers, and design firms in New Orleans. You run the job — I install the surface."
        canonical="https://theshirtlesshandyman.com/contractors"
      />

      <div className="min-h-screen bg-[#0E0E0E] text-white" data-testid="contractors-page">
        <Navbar />

        {/* Hero */}
        <section className="pt-32 pb-16 px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-4">
              For Contractors &amp; Remodelers
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6 max-w-3xl"
              style={{ fontFamily: "'Fraunces', serif" }}
              data-testid="contractors-h1"
            >
              Bring me in on your<br />
              next bathroom or kitchen job.
            </h1>
            <p className="text-base md:text-lg text-white/60 max-w-2xl leading-relaxed mb-4">
              You run the job like normal. I show up, install the surface, and hand it back to you finished. Your client gets a nicer bathroom, you bill more for it, and you don&apos;t have to figure out a material you&apos;ve never worked with.
            </p>
            <p className="text-base md:text-lg text-white/60 max-w-2xl leading-relaxed">
              I&apos;ve done this with GCs, remodelers, and design firms all over the New Orleans area. You handle the project. I handle microcement, tadelakt, venetian plaster, and rockscape — that&apos;s it, that&apos;s my whole lane.
            </p>
          </div>
        </section>

        {/* Value props + stats */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-5">
              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757]">
                What you get
              </p>
              {VALUE_POINTS.map((v) => (
                <div key={v.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D97757] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-white">{v.title}</p>
                    <p className="text-sm text-white/50">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-2">
                By the numbers
              </p>
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
                  <p
                    className="text-3xl md:text-4xl font-light text-[#D97757] min-w-[110px]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {s.metric}
                  </p>
                  <p className="text-sm text-white/55">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 md:px-12 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight mb-5 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Ready to talk about your next job?
            </h2>
            <p className="text-base text-white/60 mb-8">
              Text me directly, or set up a contractor account and I&apos;ll route pricing and scheduling through there.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={SMS_LINK} data-testid="contractors-page-text-btn">
                <Button className="h-12 px-8 rounded-full bg-[#D97757] text-white text-sm font-medium hover:bg-[#C56545]">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Text me — {PHONE}
                </Button>
              </a>
              <Button
                onClick={() => navigate("/contractor/register")}
                variant="outline"
                className="h-12 px-8 rounded-full border-white/20 text-white hover:bg-white/10 text-sm font-medium"
                data-testid="contractors-page-register-btn"
              >
                Set up a contractor account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
