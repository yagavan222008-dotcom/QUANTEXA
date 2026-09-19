"use client";

import {
  Bell,
  Command,
  Search,
  UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";

import CurrencySelector from "@/components/CurrencySelector";

type Profile = {
  name: string;
  role: string;
  email: string;
};

const defaultProfile: Profile = {
  name: "Researcher",
  role: "Quant Analyst",
  email: "researcher@quantexa.ai",
};

export default function Topbar() {
  const [profile, setProfile] =
    useState<Profile>(
      defaultProfile
    );

  useEffect(() => {
    function loadProfile() {
      const stored =
        localStorage.getItem(
          "quantexa-profile"
        );

      if (stored) {
        try {
          setProfile(
            JSON.parse(stored)
          );
        } catch {}
      }
    }

    loadProfile();

    window.addEventListener(
      "quantexa-profile-updated",
      loadProfile
    );

    window.addEventListener(
      "storage",
      loadProfile
    );

    return () => {
      window.removeEventListener(
        "quantexa-profile-updated",
        loadProfile
      );

      window.removeEventListener(
        "storage",
        loadProfile
      );
    };
  }, []);

  return (
    <header className="topbar">

      <div className="topbar-left">

        <div className="page-context">

          <span className="context-label">
            QUANTITATIVE RESEARCH
          </span>

          <span className="context-title">
            Market Overview
          </span>

        </div>

      </div>

      <div className="topbar-right">

        <div className="search-box">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search assets, strategies..."
            aria-label="Search assets and strategies"
          />

          <div className="search-shortcut">

            <Command size={12} />

            <span>
              K
            </span>

          </div>

        </div>

        <CurrencySelector />

        <button
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="notification-dot" />
        </button>

        <div className="profile">

          <div className="profile-avatar">
            {profile.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-info">

            <span>
              {profile.name}
            </span>

            <small>
              {profile.role}
            </small>

          </div>

        </div>

      </div>

    </header>
  );
}