"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import TournamentCard from "@/components/tournaments/TournamentCard";
import PastTournamentModal from "@/components/tournaments/PastTournamentModal";
import EligiblePlayersModal from "@/components/tournaments/EligiblePlayersModal";
import { useTournaments } from "@/hooks/useTournaments";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  matchDate: string;
  team1: string;
  team2: string;
  venue: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  entryFee: string;
  maxParticipants: number | null;
  currentParticipants: number;
  totalRewardPool?: number;
}

type TabType = "live" | "upcoming" | "past";

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("live");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [modalType, setModalType] = useState<"past" | "eligible" | null>(null);
  
  const { tournaments, loading: isLoadingTournaments } = useTournaments();
  
  // Filter tournaments by status
  const liveTournaments = useMemo(() => 
    tournaments.filter(t => t.status === "ONGOING"),
    [tournaments]
  );
  const upcomingTournaments = useMemo(() => 
    tournaments.filter(t => t.status === "UPCOMING"),
    [tournaments]
  );
  const pastTournaments = useMemo(() => 
    tournaments.filter(t => t.status === "COMPLETED"),
    [tournaments]
  );

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    if (tournament.status === "COMPLETED") {
      setModalType("past");
    } else {
      setModalType("eligible");
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedTournament(null);
  };

  const getCurrentTournaments = () => {
    switch (activeTab) {
      case "live":
        return liveTournaments;
      case "upcoming":
        return upcomingTournaments;
      case "past":
        return pastTournaments;
      default:
        return [];
    }
  };

  const currentTournaments = getCurrentTournaments();

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case "live":
        return {
          icon: (
            <svg className="h-16 w-16 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          title: "No live tournaments",
          description: "Check back when a match is in progress",
        };
      case "upcoming":
        return {
          icon: (
            <svg className="h-16 w-16 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "No upcoming tournaments",
          description: "New tournaments will appear here soon",
        };
      case "past":
        return {
          icon: (
            <svg className="h-12 w-12 text-foreground-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "No past tournaments",
          description: "Completed tournaments will appear here",
        };
      default:
        return {
          icon: null,
          title: "",
          description: "",
        };
    }
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tournaments</h1>
          <p className="text-foreground-muted text-sm">
            Join tournaments, track player performance, and compete for rewards
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("live")}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "live"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Live</span>
                  {liveTournaments.length > 0 && (
                    <span className="text-foreground-muted text-xs">
                      ({liveTournaments.length})
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "upcoming"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Upcoming</span>
                  {upcomingTournaments.length > 0 && (
                    <span className="text-foreground-muted text-xs">
                      ({upcomingTournaments.length})
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "past"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Past</span>
                  {pastTournaments.length > 0 && (
                    <span className="text-foreground-muted text-xs">
                      ({pastTournaments.length})
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tournament Grid */}
        <div className="space-y-6">
          {isLoadingTournaments ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : currentTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id} 
                  tournament={tournament}
                  onClick={() => handleTournamentClick(tournament)}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-xl p-12 bg-card">
              <EmptyState
                icon={emptyState.icon}
                title={emptyState.title}
                description={emptyState.description}
              />
            </div>
          )}
        </div>
      </div>

      {/* Past Tournament Modal */}
      <PastTournamentModal
        isOpen={modalType === "past"}
        onClose={handleCloseModal}
        tournament={selectedTournament}
      />

      {/* Eligible Players Modal (for Live and Upcoming) */}
      <EligiblePlayersModal
        isOpen={modalType === "eligible"}
        onClose={handleCloseModal}
        tournament={selectedTournament}
        showScores={selectedTournament?.status === "ONGOING"}
      />
    </div>
  );
}
