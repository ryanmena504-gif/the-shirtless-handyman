import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BeforeAfterSlider } from "../components/BeforeAfterSlider";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  Hammer, ThumbsUp, ArrowRight, Share2,
  Facebook, MessageCircle, Link2, Check
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SharePage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votedIndex, setVotedIndex] = useState(null);
  const [votes, setVotes] = useState([]);
  const [copied, setCopied] = useState(false);

  const fetchShare = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/shares/${shareId}`);
      setShare(res.data);
      setVotes(res.data.designs?.map((d) => d.votes) || []);
    } catch {
      toast.error("Share link not found");
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchShare();
  }, [fetchShare]);

  const handleVote = async (idx) => {
    if (votedIndex !== null) return;
    try {
      const res = await axios.post(`${API}/shares/${shareId}/vote`, { design_index: idx });
      setVotes(res.data.votes);
      setVotedIndex(idx);
      toast.success("Vote counted!");
    } catch {
      toast.error("Failed to vote");
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
  };

  const handleShareText = () => {
    const text = `Check out my AI renovation ideas! ${shareUrl}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!share) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">This share link is no longer available.</p>
        <Button onClick={() => navigate("/")} className="rounded-full bg-primary text-primary-foreground btn-pill">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="share-page">
      {/* Minimal header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-foreground" data-testid="share-logo">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Hammer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>Seamless Bath</span>
          </button>
          <Button
            onClick={() => navigate("/upload")}
            className="rounded-full bg-[#D97757] text-white hover:bg-[#C56545] btn-pill shadow-lg"
            data-testid="share-upload-cta"
          >
            Try It Yourself
          </Button>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757] mb-3">
              AI Renovation Ideas
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Which renovation style<br />do you like best?
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Vote for your favorite design and help decide the perfect renovation look.
            </p>
          </div>

          {/* Designs with voting */}
          <div className="space-y-10 mb-16" data-testid="share-designs">
            {share.designs?.map((design, i) => {
              const pct = totalVotes > 0 ? Math.round((votes[i] / totalVotes) * 100) : 0;
              const isWinner = totalVotes > 0 && votes[i] === Math.max(...votes);

              return (
                <div key={`design-${design.name}`} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 0.15}s` }} data-testid={`share-design-${i}`}>
                  {/* Style label */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#D97757] tracking-wide uppercase">Style {i + 1}</span>
                      <h3 className="text-lg font-medium text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>{design.name}</h3>
                    </div>
                    {votedIndex !== null && isWinner && (
                      <span className="text-xs font-semibold text-[#D97757] bg-[#D97757]/10 px-3 py-1 rounded-full">Leading</span>
                    )}
                  </div>

                  {/* Before/After slider */}
                  {share.original_image && (
                    <BeforeAfterSlider
                      beforeImage={share.original_image}
                      afterImage={design.image}
                      beforeLabel="Original"
                      afterLabel={design.name}
                    />
                  )}

                  {/* Vote bar + button */}
                  <div className="mt-4 flex items-center gap-4">
                    <Button
                      onClick={() => handleVote(i)}
                      disabled={votedIndex !== null}
                      className={`rounded-full h-10 px-6 text-sm font-medium btn-pill transition-all ${
                        votedIndex === i
                          ? "bg-[#D97757] text-white shadow-lg shadow-[#D97757]/30"
                          : votedIndex !== null
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      }`}
                      data-testid={`vote-btn-${i}`}
                    >
                      {votedIndex === i ? (
                        <span className="flex items-center gap-1.5"><Check className="w-4 h-4" />Voted!</span>
                      ) : (
                        <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" />Vote</span>
                      )}
                    </Button>

                    {votedIndex !== null && (
                      <div className="flex-1 flex items-center gap-3 animate-fade-in">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: votedIndex === i ? "#D97757" : "#1A3C34",
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground min-w-[48px] text-right">
                          {pct}% <span className="text-xs text-muted-foreground font-normal">({votes[i]})</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Share buttons */}
          <div className="flex flex-col items-center gap-4 mb-16" data-testid="share-buttons">
            <p className="text-sm text-muted-foreground">Share with friends</p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleShareFacebook}
                variant="outline"
                className="rounded-full h-11 px-5 gap-2 border-border/60 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 hover:text-[#1877F2]"
                data-testid="share-facebook-btn"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                onClick={handleShareText}
                variant="outline"
                className="rounded-full h-11 px-5 gap-2 border-border/60 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                data-testid="share-text-btn"
              >
                <MessageCircle className="w-4 h-4" />
                Text
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className={`rounded-full h-11 px-5 gap-2 border-border/60 transition-all ${copied ? "bg-accent border-primary/30 text-primary" : ""}`}
                data-testid="share-copy-btn"
              >
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-primary rounded-3xl p-10 md:p-16 text-center noise-overlay relative overflow-hidden" data-testid="share-cta">
            <div className="relative z-10">
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Upload your room to see<br />your own renovation ideas
              </h2>
              <p className="text-base text-white/70 mb-8 max-w-md mx-auto">
                Get AI-generated renovation designs, cost estimates, and connect with local contractors — all in minutes.
              </p>
              <Button
                onClick={() => navigate("/upload")}
                className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg hover:bg-[#C56545]"
                data-testid="share-start-btn"
              >
                Start My Renovation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 text-center">
        <p className="text-sm text-muted-foreground">Powered by <span className="font-semibold text-foreground">Seamless Bath</span></p>
      </footer>
    </div>
  );
}
