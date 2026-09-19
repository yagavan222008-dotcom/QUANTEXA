"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  Bell,
  Check,
  CircleUserRound,
  Database,
  LogOut,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UserRound,
  Zap,
} from "lucide-react";

import { useRouter } from "next/navigation";

import CurrencySelector from "@/components/CurrencySelector";
import { useCurrency } from "@/components/CurrencyProvider";
import {
  useTheme,
} from "@/components/ThemeProvider";

type Profile = {
  name: string;
  role: string;
  email: string;
};

type SettingsState = {
  defaultPeriod: string;
  chartStyle: string;
  researchAlerts: boolean;
  engineAlerts: boolean;
  dailySummary: boolean;
};

const defaultProfile: Profile = {
  name: "Researcher",
  role: "Quant Analyst",
  email: "researcher@quantexa.ai",
};

const defaultSettings: SettingsState = {
  defaultPeriod: "1 Year",
  chartStyle: "Performance",
  researchAlerts: true,
  engineAlerts: true,
  dailySummary: false,
};

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

function Toggle({
  enabled,
  onChange,
}: ToggleProps) {
  return (
    <button
      type="button"
      className={`settings-toggle ${
        enabled ? "enabled" : ""
      }`}
      onClick={onChange}
      aria-pressed={enabled}
    >
      <span />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const { currency } = useCurrency();

  const { theme, setTheme } =
    useTheme();

  const [profile, setProfile] =
    useState<Profile>(defaultProfile);

  const [settings, setSettings] =
    useState<SettingsState>(
      defaultSettings
    );

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const storedProfile =
      localStorage.getItem(
        "quantexa-profile"
      );

    const storedSettings =
      localStorage.getItem(
        "quantexa-settings"
      );

    if (storedProfile) {
      try {
        setProfile(
          JSON.parse(storedProfile)
        );
      } catch {}
    }

    if (storedSettings) {
      try {
        setSettings(
          JSON.parse(storedSettings)
        );
      } catch {}
    }
  }, []);

  function updateProfile(
    key: keyof Profile,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function saveProfile() {
    localStorage.setItem(
      "quantexa-profile",
      JSON.stringify(profile)
    );

    window.dispatchEvent(
      new Event("quantexa-profile-updated")
    );

    setEditingProfile(false);

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  function saveSettings() {
    localStorage.setItem(
      "quantexa-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  function resetSettings() {
    setProfile(defaultProfile);

    setSettings(defaultSettings);

    setTheme("light");

    localStorage.setItem(
      "quantexa-profile",
      JSON.stringify(defaultProfile)
    );

    localStorage.setItem(
      "quantexa-settings",
      JSON.stringify(defaultSettings)
    );

    window.dispatchEvent(
      new Event("quantexa-profile-updated")
    );

    setSaved(false);
  }

  function logout() {
    localStorage.removeItem(
      "quantexa-session"
    );

    document.cookie =
      "quantexa-session=; path=/; max-age=0";

    router.push("/login");
  }

  return (
    <main className="settings-page">

      {/* HEADER */}

      <header className="settings-page-header">

        <div>
          <span className="settings-breadcrumb">
            SYSTEM CONFIGURATION
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Configure your QuantExa workspace,
            profile, research preferences,
            notifications and appearance.
          </p>
        </div>

        <div className="settings-header-actions">

          <button
            type="button"
            className="settings-reset-button"
            onClick={resetSettings}
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            type="button"
            className="settings-save-button"
            onClick={saveSettings}
          >
            {saved ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}

            {saved
              ? "Saved"
              : "Save Changes"}
          </button>

        </div>

      </header>

      {/* PROFILE */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <CircleUserRound size={21} />
          </div>

          <div>
            <span className="settings-section-label">
              PROFILE
            </span>

            <h2>
              Researcher Profile
            </h2>

            <p>
              Manage the identity displayed
              across your QuantExa workspace.
            </p>
          </div>

        </div>

        <div className="settings-profile-layout">

          <div className="settings-avatar-large">
            {profile.name
              .trim()
              .charAt(0)
              .toUpperCase() || "R"}
          </div>

          <div className="settings-profile-fields">

            <div className="settings-field">

              <label>
                Display Name
              </label>

              {editingProfile ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    updateProfile(
                      "name",
                      event.target.value
                    )
                  }
                />
              ) : (
                <div className="settings-static-field">
                  {profile.name}
                </div>
              )}

            </div>

            <div className="settings-field">

              <label>
                Role
              </label>

              {editingProfile ? (
                <input
                  type="text"
                  value={profile.role}
                  onChange={(event) =>
                    updateProfile(
                      "role",
                      event.target.value
                    )
                  }
                />
              ) : (
                <div className="settings-static-field">
                  {profile.role}
                </div>
              )}

            </div>

            <div className="settings-field">

              <label>
                Email
              </label>

              {editingProfile ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    updateProfile(
                      "email",
                      event.target.value
                    )
                  }
                />
              ) : (
                <div className="settings-static-field">
                  {profile.email}
                </div>
              )}

            </div>

            <div className="settings-field">

              <label>
                Workspace
              </label>

              <div className="settings-static-field">
                Research Workspace
              </div>

            </div>

          </div>

        </div>

        <div className="settings-profile-actions">

          {editingProfile ? (
            <>
              <button
                type="button"
                className="settings-secondary-button"
                onClick={() => {
                  setProfile(
                    profile
                  );
                  setEditingProfile(false);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="settings-primary-button"
                onClick={saveProfile}
              >
                <Check size={17} />
                Save Profile
              </button>
            </>
          ) : (
            <button
              type="button"
              className="settings-primary-button"
              onClick={() =>
                setEditingProfile(true)
              }
            >
              <UserRound size={17} />
              Edit Profile
            </button>
          )}

        </div>

      </section>

      {/* RESEARCH */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <SlidersHorizontal size={21} />
          </div>

          <div>
            <span className="settings-section-label">
              RESEARCH PREFERENCES
            </span>

            <h2>
              Analysis Configuration
            </h2>

            <p>
              Define the default behaviour used
              throughout QuantExa research tools.
            </p>
          </div>

        </div>

        <div className="settings-form-grid">

          <div className="settings-field">

            <label>
              Default Analysis Period
            </label>

            <select
              value={settings.defaultPeriod}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  defaultPeriod:
                    event.target.value,
                })
              }
              className="settings-native-select"
            >
              <option>3 Months</option>
              <option>6 Months</option>
              <option>1 Year</option>
              <option>3 Years</option>
              <option>5 Years</option>
            </select>

          </div>

          <div className="settings-field">

            <label>
              Default Chart View
            </label>

            <select
              value={settings.chartStyle}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  chartStyle:
                    event.target.value,
                })
              }
              className="settings-native-select"
            >
              <option>Performance</option>
              <option>Returns</option>
              <option>Risk</option>
              <option>Drawdown</option>
            </select>

          </div>

          <div className="settings-field">

            <label>
              Display Currency
            </label>

            <div className="settings-currency-control">
              <CurrencySelector />

              <span>
                {currency.code}{" "}
                {currency.symbol}
              </span>
            </div>

          </div>

          <div className="settings-field">

            <label>
              Calculation Engine
            </label>

            <div className="settings-static-field">
              QuantExa Quantitative Engine
            </div>

          </div>

        </div>

      </section>

      {/* APPEARANCE */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Palette size={21} />
          </div>

          <div>
            <span className="settings-section-label">
              APPEARANCE
            </span>

            <h2>
              Workspace Theme
            </h2>

            <p>
              Switch the entire QuantExa interface
              between light and dark themes.
            </p>
          </div>

        </div>

        <div className="settings-appearance-grid">

          <button
            type="button"
            className={`settings-theme-option ${
              theme === "light"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setTheme("light")
            }
          >

            <div className="settings-theme-preview light-preview">
              <div className="theme-preview-top" />

              <div className="theme-preview-body">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="settings-theme-info">

              <div>
                <Sun size={18} />

                <strong>
                  Light
                </strong>
              </div>

              {theme === "light" && (
                <Check size={18} />
              )}

            </div>

          </button>

          <button
            type="button"
            className={`settings-theme-option ${
              theme === "dark"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setTheme("dark")
            }
          >

            <div className="settings-theme-preview dark-preview">
              <div className="theme-preview-top" />

              <div className="theme-preview-body">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="settings-theme-info">

              <div>
                <Moon size={18} />

                <strong>
                  Dark
                </strong>
              </div>

              {theme === "dark" && (
                <Check size={18} />
              )}

            </div>

          </button>

        </div>

      </section>

      {/* NOTIFICATIONS */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Bell size={21} />
          </div>

          <div>
            <span className="settings-section-label">
              NOTIFICATIONS
            </span>

            <h2>
              Research Notifications
            </h2>

            <p>
              Control which QuantExa events
              should generate notifications.
            </p>
          </div>

        </div>

        <div className="settings-options-list">

          <div className="settings-option-row">

            <div className="settings-option-icon">
              <Activity size={19} />
            </div>

            <div className="settings-option-content">
              <strong>
                Research Alerts
              </strong>

              <span>
                Notify when significant market
                or research signals are detected.
              </span>
            </div>

            <Toggle
              enabled={
                settings.researchAlerts
              }
              onChange={() =>
                setSettings({
                  ...settings,
                  researchAlerts:
                    !settings.researchAlerts,
                })
              }
            />

          </div>

          <div className="settings-option-row">

            <div className="settings-option-icon">
              <Zap size={19} />
            </div>

            <div className="settings-option-content">
              <strong>
                Engine Status Alerts
              </strong>

              <span>
                Notify when a QuantExa engine
                changes status.
              </span>
            </div>

            <Toggle
              enabled={
                settings.engineAlerts
              }
              onChange={() =>
                setSettings({
                  ...settings,
                  engineAlerts:
                    !settings.engineAlerts,
                })
              }
            />

          </div>

          <div className="settings-option-row">

            <div className="settings-option-icon">
              <Database size={19} />
            </div>

            <div className="settings-option-content">
              <strong>
                Daily Research Summary
              </strong>

              <span>
                Receive a daily summary of
                market research observations.
              </span>
            </div>

            <Toggle
              enabled={
                settings.dailySummary
              }
              onChange={() =>
                setSettings({
                  ...settings,
                  dailySummary:
                    !settings.dailySummary,
                })
              }
            />

          </div>

        </div>

      </section>

      {/* SYSTEM */}

      <section className="settings-system-card">

        <div className="settings-system-header">

          <div className="settings-section-icon system">
            <Settings2 size={21} />
          </div>

          <div>
            <span className="settings-section-label">
              SYSTEM
            </span>

            <h2>
              QuantExa System Status
            </h2>

            <p>
              Current state of the platform
              services and infrastructure.
            </p>
          </div>

        </div>

        <div className="settings-system-grid">

          <SystemStatus
            icon={<Database size={19} />}
            title="Data Engine"
          />

          <SystemStatus
            icon={<Zap size={19} />}
            title="Quantitative Engine"
          />

          <SystemStatus
            icon={<ShieldCheck size={19} />}
            title="Research Services"
          />

        </div>

      </section>

      {/* ACCOUNT */}

      <section className="settings-card settings-danger-card">

        <div className="settings-card-header">

          <div className="settings-section-icon danger">
            <LogOut size={21} />
          </div>

          <div>
            <span className="settings-section-label">
              ACCOUNT
            </span>

            <h2>
              Session
            </h2>

            <p>
              Sign out of the current QuantExa
              research session.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="settings-logout-button"
          onClick={logout}
        >
          <LogOut size={18} />
          Sign Out
        </button>

      </section>

      <div className="settings-footer-status">

        <span className="settings-status-dot" />

        <span>
          QuantExa System
        </span>

        <span>•</span>

        <span>
          All systems operational
        </span>

        <span>•</span>

        <span>
          {currency.code} active
        </span>

      </div>

    </main>
  );
}

function SystemStatus({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="settings-system-item">

      <div className="settings-system-item-icon">
        {icon}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <span>
          Operational
        </span>
      </div>

      <div className="settings-operational-dot" />

    </div>
  );
}