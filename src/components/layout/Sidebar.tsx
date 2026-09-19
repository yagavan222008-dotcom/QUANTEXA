"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  BarChart3,
  BrainCircuit,
  CandlestickChart,
  Check,
  ChevronDown,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Network,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";


// =========================================================
// NAVIGATION DATA
// =========================================================

const researchItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Asset Intelligence",
    href: "/assets",
    icon: CandlestickChart,
  },
  {
    label: "Correlation Lab",
    href: "/correlation",
    icon: Network,
  },
];

const strategyItems = [
  {
    label: "Strategy Lab",
    href: "/strategy",
    icon: FlaskConical,
  },
  {
    label: "Backtesting",
    href: "/backtesting",
    icon: Activity,
  },
  {
    label: "Robustness",
    href: "/robustness",
    icon: SlidersHorizontal,
  },
];

const marketItems = [
  {
    label: "Regime Analysis",
    href: "/regimes",
    icon: Gauge,
  },
];


// =========================================================
// WORKSPACE TYPE
// =========================================================

type Workspace = {
  id: string;
  name: string;
  description: string;
};


// =========================================================
// DEFAULT WORKSPACE
// =========================================================

const defaultWorkspace: Workspace = {
  id: "quant-lab",
  name: "Quant Lab",
  description:
    "Main quantitative research environment",
};


// =========================================================
// SIDEBAR
// =========================================================

export default function Sidebar() {
  const pathname = usePathname();

  // =======================================================
  // WORKSPACE STATE
  // =======================================================

  const [workspaceOpen, setWorkspaceOpen] =
    useState(false);

  const [createWorkspaceOpen, setCreateWorkspaceOpen] =
    useState(false);

  const [workspaceName, setWorkspaceName] =
    useState("");

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([
      defaultWorkspace,
    ]);

  const [activeWorkspaceId, setActiveWorkspaceId] =
    useState("quant-lab");

  const workspaceRef =
    useRef<HTMLDivElement>(null);


  // =======================================================
  // LOAD WORKSPACES
  // =======================================================

  useEffect(() => {
    try {
      const savedWorkspaces =
        localStorage.getItem(
          "quantexa-workspaces"
        );

      const savedActiveWorkspace =
        localStorage.getItem(
          "quantexa-active-workspace"
        );

      if (savedWorkspaces) {
        const parsed =
          JSON.parse(savedWorkspaces);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          setWorkspaces(parsed);
        }
      }

      if (savedActiveWorkspace) {
        setActiveWorkspaceId(
          savedActiveWorkspace
        );
      }
    } catch {
      // Keep default workspace if localStorage
      // contains invalid data.
    }
  }, []);


  // =======================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =======================================================

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        workspaceRef.current &&
        !workspaceRef.current.contains(
          event.target as Node
        )
      ) {
        setWorkspaceOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  // =======================================================
  // ACTIVE WORKSPACE
  // =======================================================

  const activeWorkspace =
    workspaces.find(
      (workspace) =>
        workspace.id === activeWorkspaceId
    ) ?? defaultWorkspace;


  // =======================================================
  // SELECT WORKSPACE
  // =======================================================

  function selectWorkspace(
    workspace: Workspace
  ) {
    setActiveWorkspaceId(
      workspace.id
    );

    localStorage.setItem(
      "quantexa-active-workspace",
      workspace.id
    );

    setWorkspaceOpen(false);
  }


  // =======================================================
  // OPEN CREATE WORKSPACE
  // =======================================================

  function openCreateWorkspace() {
    setWorkspaceOpen(false);
    setWorkspaceName("");
    setCreateWorkspaceOpen(true);
  }


  // =======================================================
  // CREATE WORKSPACE
  // =======================================================

  function createWorkspace() {
    const trimmedName =
      workspaceName.trim();

    if (!trimmedName) {
      return;
    }

    const newWorkspace: Workspace = {
      id:
        trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now(),

      name: trimmedName,

      description:
        "Custom quantitative research workspace",
    };

    const updatedWorkspaces = [
      ...workspaces,
      newWorkspace,
    ];

    setWorkspaces(
      updatedWorkspaces
    );

    setActiveWorkspaceId(
      newWorkspace.id
    );

    localStorage.setItem(
      "quantexa-workspaces",
      JSON.stringify(
        updatedWorkspaces
      )
    );

    localStorage.setItem(
      "quantexa-active-workspace",
      newWorkspace.id
    );

    setWorkspaceName("");
    setCreateWorkspaceOpen(false);
  }


  // =======================================================
  // NAVIGATION ITEM
  // =======================================================

  const renderItem = (
    item: {
      label: string;
      href: string;
      icon: React.ElementType;
    }
  ) => {
    const Icon = item.icon;

    const isActive =
      item.href === "/"
        ? pathname === "/"
        : pathname.startsWith(
            item.href
          );

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`sidebar-item ${
          isActive
            ? "sidebar-item-active"
            : ""
        }`}
      >
        <Icon
          size={18}
          strokeWidth={1.8}
        />

        <span>
          {item.label}
        </span>
      </Link>
    );
  };


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <>
      <aside className="sidebar">

        {/* =================================================
            BRAND
            ================================================= */}

        <div className="brand">

          <div className="brand-mark">
            Q
          </div>

          <div className="brand-text">

            <span className="brand-name">
              QUANTEXA
            </span>

            <span className="brand-subtitle">
              QUANT RESEARCH
            </span>

          </div>

        </div>


        {/* =================================================
            WORKSPACE SWITCHER
            ================================================= */}

        <div
          className="workspace-wrapper"
          ref={workspaceRef}
        >

          <button
            type="button"
            className={`workspace-selector ${
              workspaceOpen
                ? "workspace-selector-open"
                : ""
            }`}
            onClick={() =>
              setWorkspaceOpen(
                (current) =>
                  !current
              )
            }
            aria-expanded={
              workspaceOpen
            }
            aria-haspopup="menu"
          >

            <div className="workspace-icon">
              <BrainCircuit
                size={20}
              />
            </div>

            <div className="workspace-info">

              <strong>
                Research Workspace
              </strong>

              <small>
                {activeWorkspace.name}
              </small>

            </div>

            <ChevronDown
              size={17}
              className={`workspace-chevron ${
                workspaceOpen
                  ? "workspace-chevron-open"
                  : ""
              }`}
            />

          </button>


          {/* ===============================================
              WORKSPACE DROPDOWN
              =============================================== */}

          {workspaceOpen && (

            <div
              className="workspace-menu"
              role="menu"
            >

              <div className="workspace-menu-label">
                RESEARCH WORKSPACE
              </div>


              {/* =========================================
                  WORKSPACE LIST
                  ========================================= */}

              <div className="workspace-list">

                {workspaces.map(
                  (workspace) => {

                    const isActive =
                      workspace.id ===
                      activeWorkspaceId;

                    return (
                      <button
                        key={
                          workspace.id
                        }
                        type="button"
                        className={`workspace-option ${
                          isActive
                            ? "workspace-option-active"
                            : ""
                        }`}
                        role="menuitem"
                        onClick={() =>
                          selectWorkspace(
                            workspace
                          )
                        }
                      >

                        <div className="workspace-option-icon">
                          <BrainCircuit
                            size={17}
                          />
                        </div>

                        <div className="workspace-option-content">

                          <strong>
                            {
                              workspace.name
                            }
                          </strong>

                          <span>
                            {
                              workspace.description
                            }
                          </span>

                        </div>

                        {isActive && (
                          <Check
                            size={18}
                            className="workspace-option-check"
                          />
                        )}

                      </button>
                    );
                  }
                )}

              </div>


              {/* =========================================
                  DIVIDER
                  ========================================= */}

              <div className="workspace-menu-divider" />


              {/* =========================================
                  CREATE WORKSPACE
                  ========================================= */}

              <button
                type="button"
                className="workspace-create-option"
                role="menuitem"
                onClick={
                  openCreateWorkspace
                }
              >

                <div className="workspace-create-icon">
                  <Plus size={17} />
                </div>

                <div className="workspace-option-content">

                  <strong>
                    Create Workspace
                  </strong>

                  <span>
                    Create a new research space
                  </span>

                </div>

              </button>

            </div>

          )}

        </div>


        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="sidebar-navigation">

          {/* ===============================================
              RESEARCH
              =============================================== */}

          <div className="nav-section">

            <div className="nav-section-title">
              RESEARCH
            </div>

            {researchItems.map(
              renderItem
            )}

          </div>


          {/* ===============================================
              STRATEGIES
              =============================================== */}

          <div className="nav-section">

            <div className="nav-section-title">
              STRATEGIES
            </div>

            {strategyItems.map(
              renderItem
            )}

          </div>


          {/* ===============================================
              MARKET
              =============================================== */}

          <div className="nav-section">

            <div className="nav-section-title">
              MARKET
            </div>

            {marketItems.map(
              renderItem
            )}

          </div>

        </nav>


        {/* =================================================
            BOTTOM NAVIGATION
            ================================================= */}

        <div className="sidebar-bottom">

          <Link
            href="/data"
            className="sidebar-item"
          >

            <BarChart3
              size={18}
              strokeWidth={1.8}
            />

            <span>
              Data Sources
            </span>

          </Link>


          <Link
            href="/settings"
            className="sidebar-item"
          >

            <Settings
              size={18}
              strokeWidth={1.8}
            />

            <span>
              Settings
            </span>

          </Link>


          {/* =============================================
              SYSTEM STATUS
              ============================================= */}

          <div className="system-status">

            <div className="status-dot" />

            <div>

              <span>
                System Status
              </span>

              <small>
                All systems operational
              </small>

            </div>

            <ShieldCheck
              size={16}
            />

          </div>

        </div>

      </aside>


      {/* ===================================================
          CREATE WORKSPACE MODAL
          =================================================== */}

      {createWorkspaceOpen && (

        <div
          className="workspace-modal-backdrop"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setCreateWorkspaceOpen(
                false
              );
            }

          }}
        >

          <div
            className="workspace-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-workspace-title"
          >

            {/* =============================================
                MODAL HEADER
                ============================================= */}

            <div className="workspace-modal-header">

              <div>

                <span className="workspace-modal-eyebrow">
                  WORKSPACE
                </span>

                <h2 id="create-workspace-title">
                  Create Workspace
                </h2>

                <p>
                  Create a dedicated
                  environment for your
                  quantitative research.
                </p>

              </div>

              <button
                type="button"
                className="workspace-modal-close"
                onClick={() =>
                  setCreateWorkspaceOpen(
                    false
                  )
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>

            </div>


            {/* =============================================
                INPUT
                ============================================= */}

            <div className="workspace-modal-field">

              <label htmlFor="workspace-name">
                Workspace Name
              </label>

              <input
                id="workspace-name"
                type="text"
                value={
                  workspaceName
                }
                onChange={(event) =>
                  setWorkspaceName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {
                    createWorkspace();
                  }

                  if (
                    event.key ===
                    "Escape"
                  ) {
                    setCreateWorkspaceOpen(
                      false
                    );
                  }

                }}
                placeholder="e.g. Portfolio Research"
                autoFocus
              />

              <span>
                Use a clear name that
                describes the research
                environment.
              </span>

            </div>


            {/* =============================================
                ACTIONS
                ============================================= */}

            <div className="workspace-modal-actions">

              <button
                type="button"
                className="workspace-modal-cancel"
                onClick={() =>
                  setCreateWorkspaceOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="workspace-modal-create"
                onClick={
                  createWorkspace
                }
                disabled={
                  !workspaceName.trim()
                }
              >
                <Plus size={17} />
                Create Workspace
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}