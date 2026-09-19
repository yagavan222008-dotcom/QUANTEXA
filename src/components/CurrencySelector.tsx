"use client";

import {
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { currencies } from "@/lib/currencies";
import { useCurrency } from "@/components/CurrencyProvider";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectorRef = useRef<HTMLDivElement>(null);

  /*
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
        setSearch("");
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

  /*
   * Close dropdown with Escape
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /*
   * Currency filtering
   *
   * Currency names are still searchable,
   * but are NOT displayed in the dropdown.
   */
  const filteredCurrencies = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return currencies;
    }

    return currencies.filter((item) =>
      [
        item.code,
        item.name,
        item.symbol,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(query)
      )
    );
  }, [search]);

  function handleCurrencyChange(
    code: string
  ) {
    setCurrency(code);
    setOpen(false);
    setSearch("");
  }

  return (
    <div
      ref={selectorRef}
      className="currency-selector-wrapper"
    >

      {/* CURRENT CURRENCY */}
      <button
        type="button"
        className={`currency-selector-button ${
          open ? "open" : ""
        }`}
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-haspopup="listbox"
      >

        <span className="currency-current-flag">
          {currency.flag}
        </span>

        <span className="currency-current-code">
          {currency.code}
        </span>

        <span className="currency-current-symbol">
          {currency.symbol}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={2}
          className={`currency-chevron ${
            open ? "rotated" : ""
          }`}
        />

      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="currency-dropdown"
          role="listbox"
          aria-label="Display currency"
        >

          {/* HEADER */}
          <div className="currency-dropdown-header">

            <div>
              <strong>
                Display Currency
              </strong>

              <span>
                Choose how financial values appear
              </span>
            </div>

          </div>

          {/* SEARCH */}
          <div className="currency-search-wrapper">

            <Search
              size={17}
              strokeWidth={2}
              className="currency-search-icon"
            />

            <input
              type="text"
              value={search}
              placeholder="Search currency..."
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoComplete="off"
              aria-label="Search currencies"
            />

            {search && (
              <button
                type="button"
                className="currency-search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear currency search"
              >
                ×
              </button>
            )}

          </div>

          {/* LIST */}
          <div className="currency-list">

            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map(
                (item) => {
                  const selected =
                    item.code ===
                    currency.code;

                  return (
                    <button
                      type="button"
                      key={item.code}
                      role="option"
                      aria-selected={
                        selected
                      }
                      className={`currency-option ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleCurrencyChange(
                          item.code
                        )
                      }
                    >

                      {/* FLAG */}
                      <span className="currency-option-flag">
                        {item.flag}
                      </span>

                      {/* CODE */}
                      <span className="currency-option-code">
                        {item.code}
                      </span>

                      {/* SYMBOL */}
                      <span className="currency-option-symbol">
                        {item.symbol}
                      </span>

                      {/* CHECK */}
                      <span className="currency-option-check">
                        {selected && (
                          <Check
                            size={16}
                            strokeWidth={2.5}
                          />
                        )}
                      </span>

                    </button>
                  );
                }
              )
            ) : (
              <div className="currency-empty-state">
                <span>
                  No currencies found
                </span>
                <small>
                  Try another code or currency name.
                </small>
              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="currency-dropdown-footer">
            <span>
              {filteredCurrencies.length}
              {" "}
              currencies available
            </span>

            <span>
              ESC to close
            </span>
          </div>

        </div>
      )}

    </div>
  );
}